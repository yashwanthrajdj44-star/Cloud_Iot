import React, { useEffect } from 'react';
import { Cpu, Wifi, Thermometer, Database, BellRing } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import DeviceStatusPie from '@/components/charts/DeviceStatusPie';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CpuTempChart from '@/components/charts/CpuTempChart';
import { useApi } from '@/hooks/useApi';
import { fetchStats } from '@/api/client';
import type { SystemStats, TelemetryPoint } from '@/types';

interface OverviewProps {
  telemetryFeed: TelemetryPoint[];
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

export default function Overview({ telemetryFeed }: OverviewProps) {
  const { data: stats, loading, refetch } = useApi<SystemStats>(fetchStats, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  const latestTelemetry = telemetryFeed[0];
  const hasMotion = latestTelemetry?.customData?.motionDetected;
  const motionCount = latestTelemetry?.customData?.motionCount;

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Motion Notification Banner if sensor active */}
      {latestTelemetry?.customData && (
        <div
          className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${
            hasMotion
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                hasMotion
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-bounce'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {hasMotion ? '🚨 MOTION DETECTED' : '🛡️ PIR SENSOR STANDBY'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {latestTelemetry.customData.requestStatus || 'Accepting Requests'}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                Sensor: {latestTelemetry.customData.sensorType || 'PID / PIR Motion Detector'} • Cumulative Triggers: {motionCount ?? 0}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono opacity-80 hidden sm:block">
            Status: {hasMotion ? 'Active Trigger' : 'No Motion'}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Devices"
          value={stats?.totalDevices ?? 0}
          icon={Cpu}
          color="blue"
          subtitle="Registered devices"
        />
        <KpiCard
          title="Online Devices"
          value={stats?.onlineDevices ?? 0}
          icon={Wifi}
          color="emerald"
          subtitle="Currently connected"
        />
        <KpiCard
          title="Avg CPU Temp"
          value={stats?.avgCpuTemp ? `${stats.avgCpuTemp.toFixed(1)}°C` : 'N/A'}
          icon={Thermometer}
          color="amber"
          subtitle="Across all devices"
        />
        <KpiCard
          title="Data Points"
          value={stats?.totalTelemetryPoints?.toLocaleString() ?? '0'}
          icon={Database}
          color="purple"
          subtitle="Total telemetry records"
        />
      </div>

      {/* Row 2: Pie Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Status Pie */}
        <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Device Status
          </h3>
          <DeviceStatusPie
            online={stats?.onlineDevices ?? 0}
            offline={stats?.offlineDevices ?? 0}
            warning={stats?.warningDevices ?? 0}
          />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Live Activity Feed
          </h3>
          <ActivityFeed activities={stats?.recentActivity ?? []} />
        </div>
      </div>

      {/* Row 3: Recent Telemetry */}
      {telemetryFeed.length > 0 && (
        <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Live Real-time Telemetry
          </h3>
          <CpuTempChart data={telemetryFeed.slice(0, 50).reverse()} />
        </div>
      )}
    </div>
  );
}
