import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Overview from '@/pages/Overview';
import Devices from '@/pages/Devices';
import DeviceDetail from '@/pages/DeviceDetail';
import Analytics from '@/pages/Analytics';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ThemeProvider } from '@/hooks/useTheme';

export default function App() {
  const { isConnected, telemetryFeed } = useWebSocket();

  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Layout isConnected={isConnected} />}>
          <Route path="/" element={<Overview telemetryFeed={telemetryFeed} />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
