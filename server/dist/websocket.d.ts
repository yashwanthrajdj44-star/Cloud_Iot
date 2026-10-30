import { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { TelemetryResponse } from './types';
export declare function setupWebSocket(server: HttpServer): WebSocketServer;
export declare function broadcastTelemetry(deviceId: string, data: TelemetryResponse): void;
export declare function broadcastDeviceStatus(deviceId: string, status: string): void;
//# sourceMappingURL=websocket.d.ts.map