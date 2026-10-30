import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, MapPin } from 'lucide-react';
import type { Device } from '@/types';
import { formatRelativeTime, getStatusColor, getStatusBgColor } from '@/utils/format';

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/devices/${device.id}`)}
      className="w-full text-left group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-cloudpi-500/40 hover:shadow-lg dark:hover:shadow-slate-950/50 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80">
            <Cpu className="w-5 h-5 text-cloudpi-600 dark:text-cloudpi-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-cloudpi-600 dark:group-hover:text-cloudpi-300 transition-colors">
              {device.name}
            </h3>
            <p className="text-xs text-slate-500">{device.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${getStatusBgColor(device.status)} ${
              device.status === 'online' ? 'animate-pulse' : ''
            }`}
          />
          <span className={`text-xs font-medium capitalize ${getStatusColor(device.status)}`}>
            {device.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>{device.location}</span>
        </div>
        {device.lastSeenAt && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Last seen {formatRelativeTime(device.lastSeenAt)}
          </p>
        )}
      </div>
    </button>
  );
}
