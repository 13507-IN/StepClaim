'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMapPage = pathname === '/run';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />

        <div className="pt-16 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] min-h-[calc(100vh-4rem)]">
          <Sidebar />

          <main
            className={`min-w-0 transition-all duration-300 ${
              isMapPage
                ? 'h-[calc(100vh-4rem)] overflow-hidden'
                : 'overflow-y-auto px-4 py-6 lg:px-8 lg:py-8'
            }`}
          >
            <div
              className={`w-full flex flex-col ${
                isMapPage ? 'h-full' : 'max-w-6xl'
              }`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
