import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getSystemStats } from './database';
import { TelemetryResponse } from './types';

let wss: WebSocketServer;

const clients = new Set<WebSocket>();

export function setupWebSocket(server: HttpServer): WebSocketServer {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log(`[WS] Client connected. Total clients: ${clients.size}`);

    // Send welcome message with current stats
    try {
      const stats = getSystemStats();
      ws.send(
        JSON.stringify({
          type: 'welcome',
          data: {
            message: 'Connected to CloudPi WebSocket',
            stats,
          },
        })
      );
    } catch (error) {
      console.error('[WS] Error sending welcome message:', error);
    }

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WS] Client disconnected. Total clients: ${clients.size}`);
    });

    ws.on('error', (error) => {
      console.error('[WS] Client error:', error);
      clients.delete(ws);
    });
  });

  console.log('[WS] WebSocket server initialized');
  return wss;
}

function broadcast(message: object): void {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (error) {
        console.error('[WS] Broadcast error:', error);
        clients.delete(client);
      }
    }
  }
}

export function broadcastTelemetry(
  deviceId: string,
  data: TelemetryResponse
): void {
  broadcast({
    type: 'telemetry',
    deviceId,
    data,
  });
}

export function broadcastDeviceStatus(
  deviceId: string,
  status: string
): void {
  broadcast({
    type: 'device_status',
    deviceId,
    data: { status },
  });
}
