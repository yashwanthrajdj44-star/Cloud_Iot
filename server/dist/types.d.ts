export interface Device {
    id: string;
    name: string;
    type: string;
    location: string;
    api_key_hash: string;
    status: 'online' | 'offline' | 'warning';
    created_at: string;
    last_seen_at: string | null;
}
export interface DeviceResponse {
    id: string;
    name: string;
    type: string;
    location: string;
    status: 'online' | 'offline' | 'warning';
    createdAt: string;
    lastSeenAt: string | null;
    apiKey?: string;
}
export interface TelemetryPoint {
    id?: number;
    device_id: string;
    timestamp: string;
    cpu_temp: number;
    cpu_usage: number;
    mem_usage: number;
    disk_usage: number;
    net_rx: number;
    net_tx: number;
    humidity: number | null;
    pressure: number | null;
    custom_data: string | null;
}
export interface TelemetryResponse {
    id: number;
    deviceId: string;
    timestamp: string;
    cpuTemp: number;
    cpuUsage: number;
    memUsage: number;
    diskUsage: number;
    netRx: number;
    netTx: number;
    humidity: number | null;
    pressure: number | null;
    customData: Record<string, any> | null;
}
export interface SystemStats {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    warningDevices: number;
    totalTelemetryPoints: number;
    avgCpuTemp: number;
    avgCpuUsage: number;
    avgMemUsage: number;
    recentActivity: ActivityItem[];
}
export interface ActivityItem {
    id: number;
    deviceId: string;
    deviceName: string;
    type: 'telemetry' | 'register' | 'online' | 'offline';
    message: string;
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map