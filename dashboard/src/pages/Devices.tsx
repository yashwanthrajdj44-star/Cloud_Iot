import React, { useState, useMemo } from 'react';
import { Plus, Search, Cpu } from 'lucide-react';
import DeviceCard from '@/components/dashboard/DeviceCard';
import RegisterDeviceModal from '@/components/dashboard/RegisterDeviceModal';
import { useApi } from '@/hooks/useApi';
import { fetchDevices } from '@/api/client';
import type { Device } from '@/types';

export default function Devices() {
  const { data: devices, loading, refetch } = useApi<Device[]>(fetchDevices, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = useMemo(() => {
    if (!devices) return [];
    if (!searchQuery.trim()) return devices;
    const query = searchQuery.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.type.toLowerCase().includes(query) ||
        d.location.toLowerCase().includes(query) ||
        d.status.toLowerCase().includes(query)
    );
  }, [devices, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">IoT Devices</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, monitor, and provision your connected Raspberry Pi & IoT hardware
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cloudpi-600 hover:bg-cloudpi-700 text-white font-medium transition-colors shadow-md shadow-cloudpi-600/20"
        >
          <Plus className="w-4 h-4" />
          Register Device
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search devices by name, type, location, or status..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cloudpi-500/50 shadow-sm"
        />
      </div>

      {/* Loading State */}
      {loading && !devices && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-5 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Device Grid */}
      {filteredDevices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDevices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 p-8 shadow-sm">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 mb-4">
            <Cpu className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
            {searchQuery ? 'No devices found' : 'No devices registered'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            {searchQuery
              ? `No devices matched "${searchQuery}". Try a different keyword.`
              : 'Register your Raspberry Pi 4B board to begin monitoring real-time sensor telemetry.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cloudpi-600 hover:bg-cloudpi-700 text-white font-medium transition-colors shadow-md shadow-cloudpi-600/20"
            >
              <Plus className="w-4 h-4" />
              Register Device
            </button>
          )}
        </div>
      )}

      {/* Register Device Modal */}
      <RegisterDeviceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDeviceCreated={() => refetch()}
      />
    </div>
  );
}
