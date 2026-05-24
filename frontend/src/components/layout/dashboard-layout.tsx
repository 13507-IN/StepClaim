'use client';

import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#060609] text-white">
      {/* Navbar (always visible) */}
      <Navbar />

      {/* Sidebar (desktop only) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-0 lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
export default DashboardLayout;

