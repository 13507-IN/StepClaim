'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hydrate, isHydrated, isAuthenticated, clearAuth, setUser } = useAuthStore();

  useEffect(() => {
    // 1. Hydrate the Zustand store from localStorage first
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // 2. Once store is hydrated, if marked as authenticated, verify tokens via a profile call
    const verifySession = async () => {
      if (isAuthenticated) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data.user) {
            setUser(res.data.user);
          } else {
            clearAuth();
          }
        } catch (error) {
          console.warn('⚠️  Auth Provider: JWT session invalid, forcing logout');
          clearAuth();
        }
      }
    };

    if (isHydrated) {
      verifySession();
    }
  }, [isHydrated, isAuthenticated, clearAuth, setUser]);

  // Prevent flash of unstyled content during store hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
export default AuthProvider;
