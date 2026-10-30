import React from 'react';
import {
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
import type { TelemetryPoint } from '@/types';
import { formatBytes } from '@/utils/format';

interface NetworkChartProps {
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
            {formatBytes(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function NetworkChart({ data }: NetworkChartProps) {
  const chartData = data.map((point) => ({
    time: point.timestamp,
    RX: point.netRx,
    TX: point.netTx,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          tickFormatter={(val) => formatBytes(val)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value: string) => (
            <span className="text-slate-300">{value}</span>
          )}
        />
        <Bar dataKey="RX" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={12} />
        <Bar dataKey="TX" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
}
