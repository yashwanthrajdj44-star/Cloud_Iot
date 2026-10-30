import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { fetchDevices, fetchTelemetry } from '@/api/client';
import { formatTemp, formatPercent } from '@/utils/format';
import type { Device, TelemetryPoint } from '@/types';

type TimeRange = '1h' | '6h' | '24h' | '7d';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Last 1h', value: '1h' },
  { label: 'Last 6h', value: '6h' },
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
];

const LINE_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#06b6d4',
  '#ec4899',
  '#8b5cf6',
];

function getTimeRangeFrom(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

function TempTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
        {format(new Date(label), 'MMM d, HH:mm')}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-700 dark:text-slate-300">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {formatTemp(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function UsageTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-700 dark:text-slate-300">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {formatPercent(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const { data: devices } = useApi<Device[]>(fetchDevices, []);

  const [allTelemetry, setAllTelemetry] = useState<
    Record<string, TelemetryPoint[]>
  >({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!devices || devices.length === 0) return;

    let cancelled = false;
    setLoading(true);

    Promise.all(
      devices.map(async (device) => {
        try {
          const data = await fetchTelemetry(device.id, {
            from: getTimeRangeFrom(timeRange),
            limit: 200,
          });
          return { deviceId: device.id, data };
        } catch {
          return { deviceId: device.id, data: [] };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const telemetryMap: Record<string, TelemetryPoint[]> = {};
      results.forEach(({ deviceId, data }) => {
        telemetryMap[deviceId] = data;
      });
      setAllTelemetry(telemetryMap);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [devices, timeRange]);

  const tempComparisonData = useMemo(() => {
    if (!devices || devices.length === 0) return [];
    const timeMap = new Map<string, Record<string, any>>();

    devices.forEach((device) => {
      const data = allTelemetry[device.id] ?? [];
      data.forEach((point) => {
        const timeKey = point.timestamp;
        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, { time: new Date(timeKey).getTime() as any });
        }
        timeMap.get(timeKey)![device.name] = point.cpuTemp;
      });
    });

    return Array.from(timeMap.values()).sort(
      (a, b) => (a as any).time - (b as any).time
    );
  }, [devices, allTelemetry]);

  const summaryStats = useMemo(() => {
    if (!devices) return [];
    return devices.map((device) => {
      const data = allTelemetry[device.id] ?? [];
      if (data.length === 0) {
        return {
          name: device.name,
          avgTemp: 0,
          avgCpu: 0,
          avgMem: 0,
          avgDisk: 0,
          points: 0,
        };
      }
      return {
        name: device.name,
        avgTemp:
          data.reduce((sum, p) => sum + p.cpuTemp, 0) / data.length,
        avgCpu:
          data.reduce((sum, p) => sum + p.cpuUsage, 0) / data.length,
        avgMem:
          data.reduce((sum, p) => sum + p.memUsage, 0) / data.length,
        avgDisk:
          data.reduce((sum, p) => sum + p.diskUsage, 0) / data.length,
        points: data.length,
      };
    });
  }, [devices, allTelemetry]);

  const hasData =
    devices &&
    devices.length > 0 &&
    Object.values(allTelemetry).some((d) => d.length > 0);

  if (!devices || devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 mb-4 shadow-sm">
          <BarChart3 className="w-12 h-12 text-slate-400 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 mb-2">
          No Analytics Available
        </h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Register some devices and start collecting telemetry data to see
          cross-device analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cross-device hardware comparison and operational insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          {TIME_RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === value
                  ? 'bg-cloudpi-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-6 animate-pulse"
            >
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
              <div className="h-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : !hasData ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-12 text-center shadow-sm">
          <BarChart3 className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-400 font-medium">
            No telemetry data in the selected time range.
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Try selecting a wider time range or run the IoT client to report telemetry.
          </p>
        </div>
      ) : (
        <>
          {/* CPU Temperature Comparison */}
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              CPU Temperature Comparison
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={tempComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => format(new Date(val), 'HH:mm')}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `${val}°C`}
                />
                <Tooltip content={<TempTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value: string) => (
                    <span className="text-slate-700 dark:text-slate-300">{value}</span>
                  )}
                />
                {devices.map((device, i) => (
                  <Line
                    key={device.id}
                    type="monotone"
                    dataKey={device.name}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Device Comparison Bar Chart */}
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Average Resource Utilization (%)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip content={<UsageTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="avgCpu" name="CPU Usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgMem" name="Memory Usage" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgDisk" name="Disk Usage" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
