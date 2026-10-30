"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.broadcastTelemetry = broadcastTelemetry;
exports.broadcastDeviceStatus = broadcastDeviceStatus;
const ws_1 = require("ws");
const database_1 = require("./database");
let wss;
const clients = new Set();
function setupWebSocket(server) {
    wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        clients.add(ws);
        console.log(`[WS] Client connected. Total clients: ${clients.size}`);
        // Send welcome message with current stats
        try {
            const stats = (0, database_1.getSystemStats)();
            ws.send(JSON.stringify({
                type: 'welcome',
                data: {
                    message: 'Connected to CloudPi WebSocket',
                    stats,
                },
            }));
        }
        catch (error) {
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
function broadcast(message) {
    const payload = JSON.stringify(message);
    for (const client of clients) {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            try {
                client.send(payload);
            }
            catch (error) {
                console.error('[WS] Broadcast error:', error);
                clients.delete(client);
            }
        }
    }
}
function broadcastTelemetry(deviceId, data) {
    broadcast({
        type: 'telemetry',
        deviceId,
        data,
    });
}
function broadcastDeviceStatus(deviceId, status) {
    broadcast({
        type: 'device_status',
        deviceId,
        data: { status },
    });
}
//# sourceMappingURL=websocket.js.map