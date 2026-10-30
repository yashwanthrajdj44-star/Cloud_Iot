"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevice = createDevice;
exports.getDevices = getDevices;
exports.getDevice = getDevice;
exports.deleteDevice = deleteDevice;
exports.updateDevice = updateDevice;
exports.findDeviceByApiKey = findDeviceByApiKey;
exports.updateDeviceStatus = updateDeviceStatus;
exports.insertTelemetry = insertTelemetry;
exports.getTelemetry = getTelemetry;
exports.getLatestTelemetry = getLatestTelemetry;
exports.getSystemStats = getSystemStats;
exports.getRecentActivity = getRecentActivity;
exports.logActivity = logActivity;
exports.checkStaleDevices = checkStaleDevices;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DATA_DIR = path_1.default.join(process.cwd(), 'data');
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
const db = new better_sqlite3_1.default(path_1.default.join(DATA_DIR, 'cloudpi.db'));
// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
// ─── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    api_key_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'offline',
    created_at TEXT NOT NULL,
    last_seen_at TEXT
  );

  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    cpu_temp REAL NOT NULL,
    cpu_usage REAL NOT NULL,
    mem_usage REAL NOT NULL,
    disk_usage REAL NOT NULL,
    net_rx REAL NOT NULL,
    net_tx REAL NOT NULL,
    humidity REAL,
    pressure REAL,
    custom_data TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_telemetry_device_id ON telemetry(device_id);
  CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp);
  CREATE INDEX IF NOT EXISTS idx_telemetry_device_timestamp ON telemetry(device_id, timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_devices_api_key_hash ON devices(api_key_hash);
  CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
`);
// ─── Prepared Statements ───────────────────────────────────────────────────────
const stmts = {
    insertDevice: db.prepare(`
    INSERT INTO devices (id, name, type, location, api_key_hash, status, created_at, last_seen_at)
    VALUES (@id, @name, @type, @location, @api_key_hash, @status, @created_at, @last_seen_at)
  `),
    getAllDevices: db.prepare(`SELECT * FROM devices ORDER BY created_at DESC`),
    getDeviceById: db.prepare(`SELECT * FROM devices WHERE id = ?`),
    deleteDevice: db.prepare(`DELETE FROM devices WHERE id = ?`),
    findByApiKeyHash: db.prepare(`SELECT * FROM devices WHERE api_key_hash = ?`),
    updateDeviceStatus: db.prepare(`UPDATE devices SET status = @status, last_seen_at = @last_seen_at WHERE id = @id`),
    markStaleOffline: db.prepare(`
    UPDATE devices SET status = 'offline'
    WHERE status IN ('online', 'warning')
      AND last_seen_at IS NOT NULL
      AND datetime(last_seen_at) < datetime('now', '-5 minutes')
  `),
    insertTelemetry: db.prepare(`
    INSERT INTO telemetry (device_id, timestamp, cpu_temp, cpu_usage, mem_usage, disk_usage, net_rx, net_tx, humidity, pressure, custom_data)
    VALUES (@device_id, @timestamp, @cpu_temp, @cpu_usage, @mem_usage, @disk_usage, @net_rx, @net_tx, @humidity, @pressure, @custom_data)
  `),
    getLatestTelemetry: db.prepare(`
    SELECT * FROM telemetry WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1
  `),
    countTelemetry: db.prepare(`SELECT COUNT(*) as count FROM telemetry`),
    avgTelemetry: db.prepare(`
    SELECT
      COALESCE(AVG(cpu_temp), 0) as avgCpuTemp,
      COALESCE(AVG(cpu_usage), 0) as avgCpuUsage,
      COALESCE(AVG(mem_usage), 0) as avgMemUsage
    FROM telemetry
    WHERE timestamp >= datetime('now', '-1 hour')
  `),
    countDevicesByStatus: db.prepare(`
    SELECT status, COUNT(*) as count FROM devices GROUP BY status
  `),
    countAllDevices: db.prepare(`SELECT COUNT(*) as count FROM devices`),
    insertActivity: db.prepare(`
    INSERT INTO activity_log (device_id, device_name, type, message, timestamp)
    VALUES (@device_id, @device_name, @type, @message, @timestamp)
  `),
    getRecentActivity: db.prepare(`
    SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT ?
  `),
    deleteTelemetryByDevice: db.prepare(`DELETE FROM telemetry WHERE device_id = ?`),
    deleteActivityByDevice: db.prepare(`DELETE FROM activity_log WHERE device_id = ?`),
};
// ─── Helper: API Key ───────────────────────────────────────────────────────────
function generateApiKey() {
    return 'cpk_' + crypto_1.default.randomBytes(32).toString('hex');
}
function hashApiKey(apiKey) {
    return crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
}
// ─── Helper: Transform to Response ─────────────────────────────────────────────
function deviceToResponse(device, apiKey) {
    const response = {
        id: device.id,
        name: device.name,
        type: device.type,
        location: device.location,
        status: device.status,
        createdAt: device.created_at,
        lastSeenAt: device.last_seen_at,
    };
    if (apiKey) {
        response.apiKey = apiKey;
    }
    return response;
}
function telemetryToResponse(row) {
    return {
        id: row.id,
        deviceId: row.device_id,
        timestamp: row.timestamp,
        cpuTemp: row.cpu_temp,
        cpuUsage: row.cpu_usage,
        memUsage: row.mem_usage,
        diskUsage: row.disk_usage,
        netRx: row.net_rx,
        netTx: row.net_tx,
        humidity: row.humidity,
        pressure: row.pressure,
        customData: row.custom_data ? JSON.parse(row.custom_data) : null,
    };
}
// ─── Exported Functions ────────────────────────────────────────────────────────
function createDevice(name, type, location) {
    const id = (0, uuid_1.v4)();
    const rawApiKey = generateApiKey();
    const apiKeyHash = hashApiKey(rawApiKey);
    const now = new Date().toISOString();
    const deviceRow = {
        id,
        name,
        type,
        location,
        api_key_hash: apiKeyHash,
        status: 'offline',
        created_at: now,
        last_seen_at: null,
    };
    stmts.insertDevice.run(deviceRow);
    return {
        device: deviceToResponse(deviceRow, rawApiKey),
        rawApiKey,
    };
}
function getDevices() {
    // Mark stale devices as offline
    stmts.markStaleOffline.run();
    const rows = stmts.getAllDevices.all();
    return rows.map((row) => deviceToResponse(row));
}
function getDevice(id) {
    const row = stmts.getDeviceById.get(id);
    if (!row)
        return null;
    return deviceToResponse(row);
}
function deleteDevice(id) {
    // Delete related telemetry and activity first (cascade should handle telemetry,
    // but activity_log has no FK)
    stmts.deleteActivityByDevice.run(id);
    const result = stmts.deleteDevice.run(id);
    return result.changes > 0;
}
function updateDevice(id, updates) {
    const existing = stmts.getDeviceById.get(id);
    if (!existing)
        return null;
    const fields = [];
    const values = [];
    if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
    }
    if (updates.type !== undefined) {
        fields.push('type = ?');
        values.push(updates.type);
    }
    if (updates.location !== undefined) {
        fields.push('location = ?');
        values.push(updates.location);
    }
    if (fields.length === 0) {
        return deviceToResponse(existing);
    }
    values.push(id);
    db.prepare(`UPDATE devices SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    const updated = stmts.getDeviceById.get(id);
    return deviceToResponse(updated);
}
function findDeviceByApiKey(apiKey) {
    const hash = hashApiKey(apiKey);
    const row = stmts.findByApiKeyHash.get(hash);
    return row || null;
}
function updateDeviceStatus(id, status, lastSeen) {
    stmts.updateDeviceStatus.run({ id, status, last_seen_at: lastSeen });
}
function insertTelemetry(data) {
    const result = stmts.insertTelemetry.run({
        device_id: data.device_id,
        timestamp: data.timestamp,
        cpu_temp: data.cpu_temp,
        cpu_usage: data.cpu_usage,
        mem_usage: data.mem_usage,
        disk_usage: data.disk_usage,
        net_rx: data.net_rx,
        net_tx: data.net_tx,
        humidity: data.humidity ?? null,
        pressure: data.pressure ?? null,
        custom_data: data.custom_data ?? null,
    });
    return telemetryToResponse({
        ...data,
        id: Number(result.lastInsertRowid),
    });
}
function getTelemetry(deviceId, limit = 100, offset = 0, from, to) {
    let query = 'SELECT * FROM telemetry WHERE device_id = ?';
    const params = [deviceId];
    if (from) {
        query += ' AND timestamp >= ?';
        params.push(from);
    }
    if (to) {
        query += ' AND timestamp <= ?';
        params.push(to);
    }
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const rows = db.prepare(query).all(...params);
    return rows.map(telemetryToResponse);
}
function getLatestTelemetry(deviceId) {
    const row = stmts.getLatestTelemetry.get(deviceId);
    if (!row)
        return null;
    return telemetryToResponse(row);
}
function getSystemStats() {
    // Mark stale devices as offline first
    stmts.markStaleOffline.run();
    const totalResult = stmts.countAllDevices.get();
    const statusRows = stmts.countDevicesByStatus.all();
    const telemetryCount = stmts.countTelemetry.get();
    const avgResult = stmts.avgTelemetry.get();
    const statusMap = {};
    for (const row of statusRows) {
        statusMap[row.status] = row.count;
    }
    const recentActivity = getRecentActivity(10);
    return {
        totalDevices: totalResult.count,
        onlineDevices: statusMap['online'] || 0,
        offlineDevices: statusMap['offline'] || 0,
        warningDevices: statusMap['warning'] || 0,
        totalTelemetryPoints: telemetryCount.count,
        avgCpuTemp: Math.round(avgResult.avgCpuTemp * 100) / 100,
        avgCpuUsage: Math.round(avgResult.avgCpuUsage * 100) / 100,
        avgMemUsage: Math.round(avgResult.avgMemUsage * 100) / 100,
        recentActivity,
    };
}
function getRecentActivity(limit = 20) {
    const rows = stmts.getRecentActivity.all(limit);
    return rows.map((row) => ({
        id: row.id,
        deviceId: row.device_id,
        deviceName: row.device_name,
        type: row.type,
        message: row.message,
        timestamp: row.timestamp,
    }));
}
function logActivity(deviceId, deviceName, type, message) {
    stmts.insertActivity.run({
        device_id: deviceId,
        device_name: deviceName,
        type,
        message,
        timestamp: new Date().toISOString(),
    });
}
function checkStaleDevices() {
    stmts.markStaleOffline.run();
}
//# sourceMappingURL=database.js.map