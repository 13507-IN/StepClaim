'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
        {/* Header Navbar */}
        <Navbar />

        <div className="flex-1 flex pt-16">
          {/* Left Desktop Sidebar */}
          <Sidebar />

          {/* Main Workspace Frame */}
          <main className="flex-1 flex flex-col overflow-y-auto px-4 py-6 md:px-8 md:py-8 md:pl-64 transition-all duration-300">
            <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
