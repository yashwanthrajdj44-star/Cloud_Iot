import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'cyan';
  subtitle?: string;
}

const colorMap = {
  blue: {
    gradient: 'from-blue-500/10 to-blue-600/5',
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
  },
  emerald: {
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
  },
  amber: {
    gradient: 'from-amber-500/10 to-amber-600/5',
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
  purple: {
    gradient: 'from-purple-500/10 to-purple-600/5',
    icon: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/20',
  },
  red: {
    gradient: 'from-red-500/10 to-red-600/5',
    icon: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
  },
  cyan: {
    gradient: 'from-cyan-500/10 to-cyan-600/5',
    icon: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-200 dark:border-cyan-500/20',
  },
};

export default function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  subtitle,
}: KpiCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border ${colors.border} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-slate-950/50`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${
                  change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
