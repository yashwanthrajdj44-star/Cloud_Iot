import { formatDistanceToNow } from 'date-fns';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTemp(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export function getStatusColor(status: 'online' | 'offline' | 'warning'): string {
  switch (status) {
    case 'online':
      return 'text-emerald-400';
    case 'offline':
      return 'text-red-400';
    case 'warning':
      return 'text-amber-400';
    default:
      return 'text-slate-400';
  }
}

export function getStatusBgColor(status: 'online' | 'offline' | 'warning'): string {
  switch (status) {
    case 'online':
      return 'bg-emerald-400';
    case 'offline':
      return 'bg-red-400';
    case 'warning':
      return 'bg-amber-400';
    default:
      return 'bg-slate-400';
  }
}
