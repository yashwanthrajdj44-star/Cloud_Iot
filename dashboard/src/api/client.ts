import type { Device, TelemetryPoint, SystemStats } from '@/types';

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export async function fetchDevices(): Promise<Device[]> {
  return request<Device[]>('/devices');
}

export async function fetchDevice(id: string): Promise<Device> {
  return request<Device>(`/devices/${id}`);
}

export async function registerDevice(data: {
  name: string;
  type: string;
  location: string;
}): Promise<Device> {
  return request<Device>('/devices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteDevice(id: string): Promise<void> {
  await request<void>(`/devices/${id}`, {
    method: 'DELETE',
  });
}

export async function updateDevice(
  id: string,
  data: Partial<{ name: string; type: string; location: string }>
): Promise<Device> {
  return request<Device>(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function fetchTelemetry(
  deviceId: string,
  params?: { limit?: number; from?: string; to?: string }
): Promise<TelemetryPoint[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.from) searchParams.set('from', params.from);
  if (params?.to) searchParams.set('to', params.to);

  const query = searchParams.toString();
  return request<TelemetryPoint[]>(
    `/telemetry/${deviceId}${query ? `?${query}` : ''}`
  );
}

export async function fetchLatestTelemetry(
  deviceId: string
): Promise<TelemetryPoint> {
  return request<TelemetryPoint>(`/telemetry/${deviceId}/latest`);
}

export async function fetchStats(): Promise<SystemStats> {
  return request<SystemStats>('/stats');
}
