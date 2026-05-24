import { create } from 'zustand';
import { LocationPoint } from '../types';

interface RunState {
  isRunning: boolean;
  isPaused: boolean;
  currentRunId: string | null;
  activityType: 'WALKING' | 'RUNNING' | 'CYCLING';
  locations: LocationPoint[];
  distance: number; // meters
  duration: number; // seconds
  speed: number; // m/s
  avgSpeed: number; // m/s
  calories: number; // kcal
  xpEarned: number;
  territoriesCaptured: number;
  startTime: number | null;

  startRun: (runId: string, activityType: 'WALKING' | 'RUNNING' | 'CYCLING') => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;
  addLocation: (location: LocationPoint) => void;
  tickDuration: () => void;
  incrementCapturedCount: () => void;
  resetRun: () => void;
}

export const useRunStore = create<RunState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  currentRunId: null,
  activityType: 'WALKING',
  locations: [],
  distance: 0,
  duration: 0,
  speed: 0,
  avgSpeed: 0,
  calories: 0,
  xpEarned: 0,
  territoriesCaptured: 0,
  startTime: null,

  startRun: (runId, activityType) => {
    set({
      isRunning: true,
      isPaused: false,
      currentRunId: runId,
      activityType,
      locations: [],
      distance: 0,
      duration: 0,
      speed: 0,
      avgSpeed: 0,
      calories: 0,
      xpEarned: 0,
      territoriesCaptured: 0,
      startTime: Date.now(),
    });
  },

  pauseRun: () => {
    set({ isPaused: true });
  },

  resumeRun: () => {
    set({ isPaused: false });
  },

  stopRun: () => {
    set({ isRunning: false, isPaused: false });
  },

  addLocation: (location) => {
    const { locations, distance, duration, activityType } = get();
    const newLocations = [...locations, location];
    let newDistance = distance;

    if (locations.length > 0) {
      const prev = locations[locations.length - 1];
      const { latitude: lat1, longitude: lon1 } = prev;
      const { latitude: lat2, longitude: lon2 } = location;

      // Calculate Haversine distance delta in meters
      const R = 6371e3; // metres
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const deltaDist = R * c;

      // Filter out tiny jitters or unrealistic coordinate jumps (> 500m in one update)
      if (deltaDist >= 1 && deltaDist < 500) {
        newDistance += deltaDist;
      }
    }

    const currentSpeed = location.speed || 0;
    const computedAvgSpeed = duration > 0 ? newDistance / duration : 0;

    // Estimate Calories burned:
    // Running: ~0.08 kcal/kg/meter
    // Walking: ~0.05 kcal/kg/meter
    // Cycling: ~0.03 kcal/kg/meter
    // Assume average body weight of 70kg
    const weightFactor = 70;
    let burnRate = 0.05; // walking default
    if (activityType === 'RUNNING') burnRate = 0.08;
    else if (activityType === 'CYCLING') burnRate = 0.03;

    const newCalories = Math.round(newDistance * burnRate * weightFactor * 0.001 * 10) / 10;

    // Estimate XP earned
    // Walking: 5 XP per 100m
    // Running: 10 XP per 100m
    // Cycling: 7 XP per 100m
    let xpRate = 5;
    if (activityType === 'RUNNING') xpRate = 10;
    else if (activityType === 'CYCLING') xpRate = 7;

    const newXPEarned = Math.round((newDistance / 100) * xpRate);

    set({
      locations: newLocations,
      distance: newDistance,
      speed: currentSpeed,
      avgSpeed: computedAvgSpeed,
      calories: newCalories,
      xpEarned: newXPEarned,
    });
  },

  tickDuration: () => {
    const { isRunning, isPaused, duration, distance } = get();
    if (isRunning && !isPaused) {
      const nextDuration = duration + 1;
      set({
        duration: nextDuration,
        avgSpeed: nextDuration > 0 ? distance / nextDuration : 0,
      });
    }
  },

  incrementCapturedCount: () => {
    set((state) => ({ territoriesCaptured: state.territoriesCaptured + 1 }));
  },

  resetRun: () => {
    set({
      isRunning: false,
      isPaused: false,
      currentRunId: null,
      locations: [],
      distance: 0,
      duration: 0,
      speed: 0,
      avgSpeed: 0,
      calories: 0,
      xpEarned: 0,
      territoriesCaptured: 0,
      startTime: null,
    });
  },
}));
