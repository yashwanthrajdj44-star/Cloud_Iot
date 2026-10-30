import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import type { TelemetryPoint } from '@/types';
import { formatTemp } from '@/utils/format';

interface CpuTempChartProps {
  data: TelemetryPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">
        {format(new Date(label), 'MMM d, HH:mm:ss')}
      </p>
      <p className="text-sm font-semibold text-amber-400">
        {formatTemp(payload[0].value)}
      </p>
    </div>
  );
}

export default function CpuTempChart({ data }: CpuTempChartProps) {
  const chartData = data.map((point) => ({
    time: point.timestamp,
    cpuTemp: point.cpuTemp,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cpuTempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
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
          tickFormatter={(val) => `${val}°C`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={80}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{ value: '80°C Warning', position: 'right', fill: '#ef4444', fontSize: 11 }}
        />
        <Line
          type="monotone"
          dataKey="cpuTemp"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#f59e0b', stroke: '#1e293b', strokeWidth: 2 }}
          fill="url(#cpuTempGradient)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
