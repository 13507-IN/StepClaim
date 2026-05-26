'use client';

import React from 'react';
import { useEffect, useRef } from 'react';
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
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0f] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Sidebar />

        <div className="min-w-0 min-h-screen flex flex-col lg:pl-4">
          <Navbar />

          <main
            ref={mainRef}
            className={`min-w-0 min-h-0 flex-1 transition-all duration-300 ${
              isMapPage
                ? 'overflow-hidden'
                : 'overflow-y-auto px-4 py-6 lg:px-8 lg:py-8'
            }`}
          >
            <div className={`w-full flex flex-col ${isMapPage ? 'h-full' : 'max-w-6xl'}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
