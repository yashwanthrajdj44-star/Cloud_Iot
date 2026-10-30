import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  isConnected: boolean;
}

export default function Layout({ isConnected }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isConnected={isConnected} />
      <div className="flex-1 flex flex-col ml-64 min-h-screen transition-all duration-300">
        <Header isConnected={isConnected} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
