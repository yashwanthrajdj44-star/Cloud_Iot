import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { registerDevice } from '@/api/client';
import type { Device } from '@/types';

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: () => void;
  onDeviceCreated?: () => void;
}

const DEVICE_TYPES = [
  'Raspberry Pi 4B',
  'Raspberry Pi 5',
  'ESP32',
  'Custom',
];

export default function RegisterDeviceModal({
  isOpen,
  onClose,
  onRegistered,
  onDeviceCreated,
}: RegisterDeviceModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState(DEVICE_TYPES[0]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredDevice, setRegisteredDevice] = useState<Device | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const device = await registerDevice({ name, type, location });
      setRegisteredDevice(device);
      if (onRegistered) onRegistered();
      if (onDeviceCreated) onDeviceCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (!registeredDevice?.apiKey) return;
    try {
      await navigator.clipboard.writeText(registeredDevice.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClose = () => {
    setName('');
    setType(DEVICE_TYPES[0]);
    setLocation('');
    setError(null);
    setRegisteredDevice(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {registeredDevice ? 'Device Registered!' : 'Register New Device'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {registeredDevice ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                  Device "{registeredDevice.name}" registered successfully.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ID: {registeredDevice.id}
                </p>
              </div>

              {registeredDevice.apiKey && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      Save this API key — it will only be shown once!
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <code className="flex-1 text-xs text-cloudpi-600 dark:text-cloudpi-300 font-mono break-all select-all">
                      {registeredDevice.apiKey}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Copy Key"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-cloudpi-600 hover:bg-cloudpi-700 text-white font-medium text-sm transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Living Room PIR Sensor"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cloudpi-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Device Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cloudpi-500/50"
                >
                  {DEVICE_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-slate-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Location / Zone
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Entrance Hall / Lab 102"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cloudpi-500/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-cloudpi-600 hover:bg-cloudpi-700 text-white text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Register
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
