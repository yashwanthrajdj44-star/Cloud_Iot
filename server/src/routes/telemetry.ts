import { Router, Request, Response } from 'express';
import { authenticateDevice } from '../middleware/auth';
import {
  insertTelemetry,
  getTelemetry,
  getLatestTelemetry,
  updateDeviceStatus,
  logActivity,
} from '../database';
import { broadcastTelemetry, broadcastDeviceStatus } from '../websocket';
import { TelemetryPoint } from '../types';

const router = Router();

// Throttle map: deviceId → last activity log timestamp
const activityThrottle = new Map<string, number>();
const THROTTLE_INTERVAL_MS = 60_000; // 1 minute

// POST / — Ingest telemetry (authenticated)
router.post('/', authenticateDevice, (req: Request, res: Response) => {
  try {
    const device = req.device!;
    const {
      cpuTemp,
      cpuUsage,
      memUsage,
      diskUsage,
      netRx,
      netTx,
      humidity,
      pressure,
      customData,
    } = req.body;

    // Validate required fields
    if (
      cpuTemp === undefined ||
      cpuUsage === undefined ||
      memUsage === undefined ||
      diskUsage === undefined ||
      netRx === undefined ||
      netTx === undefined
    ) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: cpuTemp, cpuUsage, memUsage, diskUsage, netRx, netTx',
      });
      return;
    }

    const now = new Date().toISOString();

    // Determine status
    const status = cpuTemp > 80 ? 'warning' : 'online';

    // Update device status and lastSeen
    updateDeviceStatus(device.id, status, now);

    // Build telemetry point
    const telemetryData: TelemetryPoint = {
      device_id: device.id,
      timestamp: now,
      cpu_temp: cpuTemp,
      cpu_usage: cpuUsage,
      mem_usage: memUsage,
      disk_usage: diskUsage,
      net_rx: netRx,
      net_tx: netTx,
      humidity: humidity ?? null,
      pressure: pressure ?? null,
      custom_data: customData ? JSON.stringify(customData) : null,
    };

    const telemetryResponse = insertTelemetry(telemetryData);

    // Broadcast via WebSocket
    broadcastTelemetry(device.id, telemetryResponse);
    broadcastDeviceStatus(device.id, status);

    // Throttled activity logging (once per minute per device)
    const lastLogged = activityThrottle.get(device.id) || 0;
    const currentTime = Date.now();
    if (currentTime - lastLogged >= THROTTLE_INTERVAL_MS) {
      activityThrottle.set(device.id, currentTime);
      const msg =
        status === 'warning'
          ? `Telemetry received from "${device.name}" (⚠ CPU temp: ${cpuTemp}°C)`
          : `Telemetry received from "${device.name}"`;
      logActivity(device.id, device.name, 'telemetry', msg);
    }

    res.status(201).json({
      success: true,
      data: telemetryResponse,
    });
  } catch (error) {
    console.error('[Telemetry] Error ingesting telemetry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ingest telemetry',
    });
  }
});

// GET /:deviceId — Get telemetry history
router.get('/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const data = getTelemetry(deviceId, limit, offset, from, to);

    res.json({
      success: true,
      data,
      pagination: {
        limit,
        offset,
        count: data.length,
      },
    });
  } catch (error) {
    console.error('[Telemetry] Error getting telemetry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get telemetry',
    });
  }
});

// GET /:deviceId/latest — Get latest telemetry point
router.get('/:deviceId/latest', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const data = getLatestTelemetry(deviceId);

    if (!data) {
      res.status(404).json({
        success: false,
        error: 'No telemetry data found for this device',
      });
      return;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Telemetry] Error getting latest telemetry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get latest telemetry',
    });
  }
});

export default router;
