import express from 'express';
import cors from 'cors';
import http from 'http';
import { setupWebSocket } from './websocket';
import { checkStaleDevices } from './database';
import devicesRouter from './routes/devices';
import telemetryRouter from './routes/telemetry';
import statsRouter from './routes/stats';

const app = express();
const PORT = 3001;

// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/devices', devicesRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/stats', statsRouter);

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'healthy', uptime: process.uptime() } });
});

// ─── HTTP + WebSocket Server ────────────────────────────────────────────────────
const server = http.createServer(app);
setupWebSocket(server);

// ─── Stale Device Check Interval ────────────────────────────────────────────────
setInterval(() => {
  try {
    checkStaleDevices();
  } catch (error) {
    console.error('[Server] Error checking stale devices:', error);
  }
}, 60_000);

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

export default app;
