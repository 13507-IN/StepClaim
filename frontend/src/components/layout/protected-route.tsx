'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Hexagon } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Show loading spinner until hydration + auth check completes
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060609]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Hexagon className="h-12 w-12 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
          </div>
          <p className="text-sm text-slate-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after checks, render nothing (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

