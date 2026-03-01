import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell = () => {
  return (
    <div className="flex min-h-screen bg-background text-white font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen bg-[#0A0A0A]">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
