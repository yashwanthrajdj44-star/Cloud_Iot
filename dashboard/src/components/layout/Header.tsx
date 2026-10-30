import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  isConnected: boolean;
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Overview';
  if (pathname === '/devices') return 'Devices';
  if (pathname.startsWith('/devices/')) return 'Device Details';
  if (pathname === '/analytics') return 'Analytics';
  return 'CloudPi';
}

export default function Header({ isConnected }: HeaderProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors duration-200">
      <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
        {getPageTitle(location.pathname)}
      </h1>

      <div className="flex items-center gap-3">
        {/* Day / Night Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 transition-all shadow-sm"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Connection Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}
        >
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>

        {/* Current Time */}
        <div className="text-sm text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
          {format(currentTime, 'HH:mm:ss')}
        </div>
      </div>
    </header>
  );
}
