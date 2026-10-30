import { Router, Request, Response } from 'express';
import {
  createDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  logActivity,
} from '../database';

const router = Router();

// POST / — Register a new device
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, type, location } = req.body;

    if (!name || !type || !location) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, location',
      });
      return;
    }

    const { device, rawApiKey } = createDevice(name, type, location);
    device.apiKey = rawApiKey;

    logActivity(device.id, device.name, 'register', `Device "${device.name}" registered`);

    res.status(201).json({
      success: true,
      data: device,
    });
  } catch (error) {
    console.error('[Devices] Error creating device:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create device',
    });
  }
});

// GET / — List all devices
router.get('/', (_req: Request, res: Response) => {
  try {
    const devices = getDevices();
    res.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error('[Devices] Error listing devices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list devices',
    });
  }
});

// GET /:id — Get device by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const device = getDevice(req.params.id);
    if (!device) {
      res.status(404).json({
        success: false,
        error: 'Device not found',
      });
      return;
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    console.error('[Devices] Error getting device:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get device',
    });
  }
});

// PATCH /:id — Update device
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { name, type, location } = req.body;

    if (name === undefined && type === undefined && location === undefined) {
      res.status(400).json({
        success: false,
        error: 'No update fields provided. Provide at least one of: name, type, location',
      });
      return;
    }

    const updates: Partial<{ name: string; type: string; location: string }> = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (location !== undefined) updates.location = location;

    const device = updateDevice(req.params.id, updates);
    if (!device) {
      res.status(404).json({
        success: false,
        error: 'Device not found',
      });
      return;
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    console.error('[Devices] Error updating device:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device',
    });
  }
});

// DELETE /:id — Delete device and its telemetry
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const device = getDevice(req.params.id);
    if (!device) {
      res.status(404).json({
        success: false,
        error: 'Device not found',
      });
      return;
    }

    const deleted = deleteDevice(req.params.id);
    if (!deleted) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete device',
      });
      return;
    }

    logActivity(device.id, device.name, 'offline', `Device "${device.name}" was deleted`);

    res.json({
      success: true,
      data: { message: `Device "${device.name}" deleted successfully` },
    });
  } catch (error) {
    console.error('[Devices] Error deleting device:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete device',
    });
  }
});

export default router;
