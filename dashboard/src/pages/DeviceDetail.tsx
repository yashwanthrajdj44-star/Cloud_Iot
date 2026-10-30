import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Cpu,
  MapPin,
  Clock,
  Calendar,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  Activity,
  Bell,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import CpuTempChart from '@/components/charts/CpuTempChart';
import ResourceUsageChart from '@/components/charts/ResourceUsageChart';
import NetworkChart from '@/components/charts/NetworkChart';
import { useApi } from '@/hooks/useApi';
import {
  fetchDevice,
  fetchTelemetry,
  deleteDevice,
  updateDevice,
} from '@/api/client';
import { formatRelativeTime, getStatusColor, getStatusBgColor } from '@/utils/format';
import type { Device, TelemetryPoint } from '@/types';

type TimeRange = '1h' | '6h' | '24h' | '7d';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Last 1h', value: '1h' },
  { label: 'Last 6h', value: '6h' },
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
];

function getTimeRangeFrom(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    data: device,
    loading: deviceLoading,
    refetch: refetchDevice,
  } = useApi<Device>(() => fetchDevice(id!), [id]);

  const { data: telemetry, loading: telemetryLoading } = useApi<TelemetryPoint[]>(
    () =>
      fetchTelemetry(id!, {
        from: getTimeRangeFrom(timeRange),
        limit: 500,
      }),
    [id, timeRange]
  );

  const latest = telemetry && telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const custom = latest?.customData;
  const isMotionDetected = custom?.motionDetected;
  const motionCount = custom?.motionCount ?? 0;
  const requestStatus = custom?.requestStatus || 'Accepting Requests';

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteDevice(id);
      navigate('/devices');
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDevice(id, { name: editName, location: editLocation });
      setIsEditing(false);
      refetchDevice();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    if (!device) return;
    setEditName(device.name);
    setEditLocation(device.location);
    setIsEditing(true);
  };

  if (deviceLoading && !device) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-slate-500 dark:text-slate-400">Device not found</p>
        <button
          onClick={() => navigate('/devices')}
          className="mt-4 text-cloudpi-600 dark:text-cloudpi-400 hover:underline text-sm font-medium"
        >
          ← Back to Devices
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/devices')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{device.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{device.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* 📡 Sensor Intelligence & Motion Detection Card */}
      <div
        className={`p-6 rounded-2xl border transition-all shadow-sm ${
          isMotionDetected
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-white/90 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/50'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isMotionDetected
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Sensor State: {isMotionDetected ? '🚨 MOTION DETECTED' : '🟢 NO MOTION / IDLE'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {custom?.sensorType || 'PIR Motion Sensor (HC-SR501 / GPIO Input)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {requestStatus}
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Triggers: {motionCount}
            </div>
          </div>
        </div>

        {/* Live Sensor Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">Motion Detection</span>
            <p className={`text-base font-bold mt-1 ${isMotionDetected ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isMotionDetected ? 'ACTIVE (1)' : 'CLEAR (0)'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">Request Pipeline</span>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">
              {requestStatus}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">Board Model</span>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">
              {custom?.model || 'Raspberry Pi 4B'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">Latest CPU Temp</span>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
              {latest?.cpuTemp ? `${latest.cpuTemp}°C` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Device Info Card */}
      <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cloudpi-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cloudpi-500/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cloudpi-600 hover:bg-cloudpi-700 text-white text-sm font-medium transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Status
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${getStatusBgColor(device.status)} ${
                    device.status === 'online' ? 'animate-pulse' : ''
                  }`}
                />
                <span
                  className={`text-sm font-medium capitalize ${getStatusColor(device.status)}`}
                >
                  {device.status}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </p>
              <p className="text-sm text-slate-800 dark:text-white">{device.location}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Created
              </p>
              <p className="text-sm text-slate-800 dark:text-white">
                {formatRelativeTime(device.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Last Seen
              </p>
              <p className="text-sm text-slate-800 dark:text-white">
                {device.lastSeenAt
                  ? formatRelativeTime(device.lastSeenAt)
                  : 'Never'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        {TIME_RANGES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTimeRange(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === value
                ? 'bg-cloudpi-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Charts */}
      {telemetryLoading && !telemetry ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-6 animate-pulse"
            >
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
              <div className="h-[280px] bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : telemetry && telemetry.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              CPU Temperature
            </h3>
            <CpuTempChart data={telemetry} />
          </div>
          <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Resource Usage
            </h3>
            <ResourceUsageChart data={telemetry} />
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-white/90 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Network Throughput (I/O)
            </h3>
            <NetworkChart data={telemetry} />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-12 text-center shadow-sm">
          <Cpu className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Waiting for device telemetry...
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Run your Python script on the Raspberry Pi 4B to see real-time motion and system metrics appear!
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete Device
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete "{device.name}"? This action
              cannot be undone and all telemetry data will be lost.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
