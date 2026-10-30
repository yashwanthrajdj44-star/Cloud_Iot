import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import type { TelemetryPoint } from '@/types';
import { formatPercent } from '@/utils/format';

interface ResourceUsageChartProps {
  data: TelemetryPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">
        {format(new Date(label), 'MMM d, HH:mm:ss')}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-medium" style={{ color: entry.color }}>
            {formatPercent(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ResourceUsageChart({ data }: ResourceUsageChartProps) {
  const chartData = data.map((point) => ({
    time: point.timestamp,
    CPU: point.cpuUsage,
    Memory: point.memUsage,
    Disk: point.diskUsage,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="time"
          stroke="#475569"
          fontSize={11}
          tickFormatter={(val) => format(new Date(val), 'HH:mm')}
        />
        <YAxis
          stroke="#475569"
          fontSize={11}
          domain={[0, 100]}
          tickFormatter={(val) => `${val}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value: string) => (
            <span className="text-slate-300">{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="CPU"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#cpuGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="Memory"
          stroke="#a855f7"
          strokeWidth={2}
          fill="url(#memGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="Disk"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#diskGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
