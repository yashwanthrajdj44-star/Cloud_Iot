import { Device, DeviceResponse, TelemetryPoint, TelemetryResponse, SystemStats, ActivityItem } from './types';
export declare function createDevice(name: string, type: string, location: string): {
    device: DeviceResponse;
    rawApiKey: string;
};
export declare function getDevices(): DeviceResponse[];
export declare function getDevice(id: string): DeviceResponse | null;
export declare function deleteDevice(id: string): boolean;
export declare function updateDevice(id: string, updates: Partial<Pick<Device, 'name' | 'type' | 'location'>>): DeviceResponse | null;
export declare function findDeviceByApiKey(apiKey: string): Device | null;
export declare function updateDeviceStatus(id: string, status: Device['status'], lastSeen: string): void;
export declare function insertTelemetry(data: TelemetryPoint): TelemetryResponse;
export declare function getTelemetry(deviceId: string, limit?: number, offset?: number, from?: string, to?: string): TelemetryResponse[];
export declare function getLatestTelemetry(deviceId: string): TelemetryResponse | null;
export declare function getSystemStats(): SystemStats;
export declare function getRecentActivity(limit?: number): ActivityItem[];
export declare function logActivity(deviceId: string, deviceName: string, type: ActivityItem['type'], message: string): void;
export declare function checkStaleDevices(): void;
//# sourceMappingURL=database.d.ts.map