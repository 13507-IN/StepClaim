import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/contexts/query-provider';
import { AuthProvider } from '@/contexts/auth-provider';
import { SocketProvider } from '@/contexts/socket-context';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'StepClaim | Territory-Capture Real-World Fitness Game',
  description:
    'Walk, run, or cycle to capture virtual H3 hexagonal territories in real-time. Exercise through strategy, progression, and real-time multiplayer competition.',
  keywords: 'fitness game, strava, pokemon go, territory capture, H3 hexagons, walk to claim, run to win',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#0a0a0f] text-slate-200 min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <ToastProvider>
                <div className="flex-1 flex flex-col relative overflow-x-hidden">
                  {children}
                </div>
              </ToastProvider>
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
