import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  streak: number;
  totalDistance: number;
  territoryCount: number;
}

interface UserState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'stepclaim-user-storage',
      version: 1,
      // Keep profile display data persistent, but never place bearer tokens in
      // localStorage. The HttpOnly refresh cookie restores the session on load.
      partialize: (state) => ({ user: state.user } as UserState),
      migrate: (persistedState) => {
        const persisted = persistedState as Partial<UserState> | undefined;
        return { user: persisted?.user ?? null } as UserState;
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        user: (persistedState as Partial<UserState> | undefined)?.user ?? null,
        token: null,
        isAuthenticated: false,
      }),
    }
  )
);
