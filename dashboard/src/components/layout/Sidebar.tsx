import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Cloud,
  LayoutDashboard,
  Cpu,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isConnected: boolean;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/devices', icon: Cpu, label: 'Devices' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar({ isConnected }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cloudpi-600 shadow-sm shadow-cloudpi-600/30">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Cloud<span className="text-cloudpi-600 dark:text-cloudpi-400">Pi</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-cloudpi-50 dark:bg-cloudpi-600/20 text-cloudpi-600 dark:text-cloudpi-400 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isConnected ? 'System Live' : 'Disconnected'}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
