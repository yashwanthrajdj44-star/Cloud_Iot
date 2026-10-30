import React from 'react';
import {
  Activity,
  Radio,
  Power,
  PowerOff,
  UserPlus,
} from 'lucide-react';
import type { ActivityItem } from '@/types';
import { formatRelativeTime } from '@/utils/format';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'telemetry':
      return <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    case 'register':
      return <UserPlus className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    case 'online':
      return <Power className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    case 'offline':
      return <PowerOff className="w-4 h-4 text-red-500 dark:text-red-400" />;
    default:
      return <Radio className="w-4 h-4 text-slate-400" />;
  }
}

function getActivityColor(type: ActivityItem['type']): string {
  switch (type) {
    case 'telemetry':
      return 'border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5';
    case 'register':
      return 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5';
    case 'online':
      return 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5';
    case 'offline':
      return 'border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5';
    default:
      return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50';
  }
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
        <Activity className="w-8 h-8 mb-3 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${getActivityColor(
            activity.type
          )}`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {activity.deviceName}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
              {activity.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
