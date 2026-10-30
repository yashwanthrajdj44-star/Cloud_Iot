import React, { useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
} from 'recharts';

interface DeviceStatusPieProps {
  online: number;
  offline: number;
  warning: number;
}

const COLORS = {
  Online: '#22c55e',
  Offline: '#ef4444',
  Warning: '#f59e0b',
};

function renderActiveShape(props: any) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize={20} fontWeight="bold">
        {value}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={12}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
}

export default function DeviceStatusPie({
  online,
  offline,
  warning,
}: DeviceStatusPieProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    { name: 'Online', value: online },
    { name: 'Offline', value: offline },
    { name: 'Warning', value: warning },
  ].filter((d) => d.value > 0);

  const total = online + offline + warning;

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-slate-500">
        <p className="text-sm">No devices registered</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          onMouseEnter={onPieEnter}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-slate-300 text-xs ml-1">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
