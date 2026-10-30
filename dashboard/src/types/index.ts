export interface Device {
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
