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
  height?: number; // Height in cm (e.g. 175)
  weight?: number; // Weight in kg (e.g. 70)
}

/**
 * Standard biomechanical stride length formula:
 * Average human step length is ~0.414 * height for walking, ~0.45 * height for running.
 * Returns step length in meters.
 */
export function calculateStepLength(heightCm: number = 175, activityType: string = 'WALKING'): number {
  const multiplier = activityType === 'RUNNING' ? 0.45 : (activityType === 'CYCLING' ? 1.5 : 0.414);
  return (heightCm * multiplier) / 100;
}

/**
 * Calculates total footsteps based on distance (km) and user height (cm).
 */
export function calculateSteps(distanceKm: number, heightCm: number = 175, activityType: string = 'WALKING'): number {
  if (distanceKm <= 0) return 0;
  const stepLengthMeters = calculateStepLength(heightCm, activityType);
  if (stepLengthMeters <= 0) return 0;
  return Math.floor((distanceKm * 1000) / stepLengthMeters);
}

/**
 * Calculates estimated active calories burned based on distance (km) and user weight (kg).
 */
export function calculateCalories(distanceKm: number, weightKg: number = 70, activityType: string = 'WALKING'): number {
  if (distanceKm <= 0) return 0;
  // Factor: ~0.75 kcal/kg/km for walking, ~1.036 for running, ~0.45 for cycling
  const factor = activityType === 'RUNNING' ? 1.036 : (activityType === 'CYCLING' ? 0.45 : 0.75);
  return Math.round(distanceKm * weightKg * factor);
}

interface UserState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  updateBodyProfile: (height: number, weight: number) => void;
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
      updateBodyProfile: (height, weight) =>
        set((state) => ({
          user: state.user ? { ...state.user, height, weight } : null,
        })),
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
