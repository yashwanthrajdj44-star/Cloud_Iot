"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const websocket_1 = require("./websocket");
const database_1 = require("./database");
const devices_1 = __importDefault(require("./routes/devices"));
const telemetry_1 = __importDefault(require("./routes/telemetry"));
const stats_1 = __importDefault(require("./routes/stats"));
const app = (0, express_1.default)();
const PORT = 3001;
// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ─── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/devices', devices_1.default);
app.use('/api/telemetry', telemetry_1.default);
app.use('/api/stats', stats_1.default);
// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'healthy', uptime: process.uptime() } });
});
// ─── HTTP + WebSocket Server ────────────────────────────────────────────────────
const server = http_1.default.createServer(app);
(0, websocket_1.setupWebSocket)(server);
// ─── Stale Device Check Interval ────────────────────────────────────────────────
setInterval(() => {
    try {
        (0, database_1.checkStaleDevices)();
    }
    catch (error) {
        console.error('[Server] Error checking stale devices:', error);
    }
}, 60000);
// ─── Start Server ───────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`
   ██████╗██╗      ██████╗ ██╗   ██╗██████╗ ██████╗ ██╗
  ██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗██╔══██╗██║
  ██║     ██║     ██║   ██║██║   ██║██║  ██║██████╔╝██║
  ██║     ██║     ██║   ██║██║   ██║██║  ██║██╔═══╝ ██║
  ╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝██║     ██║
   ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝     ╚═╝

  CloudPi Server v1.0.0
  ─────────────────────────────────────────────
  🚀 HTTP server running on http://localhost:${PORT}
  🔌 WebSocket server ready on ws://localhost:${PORT}
  📡 API endpoints:
     • GET/POST     /api/devices
     • GET/PATCH/DEL /api/devices/:id
     • POST          /api/telemetry
     • GET           /api/telemetry/:deviceId
     • GET           /api/telemetry/:deviceId/latest
     • GET           /api/stats
     • GET           /api/health
  ─────────────────────────────────────────────
  `);
});
exports.default = app;
//# sourceMappingURL=index.js.map