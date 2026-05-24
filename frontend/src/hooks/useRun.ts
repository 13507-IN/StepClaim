'use client';

import { useEffect } from 'react';
import { useRunStore } from '../store/run.store';
import { useSocket } from './useSocket';
import { useGPS } from './useGPS';
import { runService } from '../services/run.service';
import { LocationPoint } from '../types';

export const useRun = () => {
  const store = useRunStore();
  const { sendMessage } = useSocket();

  // 1. Hook up the duration counter timer (runs every second)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (store.isRunning && !store.isPaused) {
      intervalId = setInterval(() => {
        store.tickDuration();
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [store.isRunning, store.isPaused, store.tickDuration]);

  // 2. Custom callback invoked whenever GPS outputs a valid coordinate update
  const handleLocationUpdate = (point: LocationPoint) => {
    if (store.isRunning && !store.isPaused) {
      // Record point in Zustand run store to compute distances and calorie burns
      store.addLocation(point);

      // Stream geopoint coordinates to the Fastify Socket.IO backend
      sendMessage('LOCATION_UPDATED', {
        latitude: point.latitude,
        longitude: point.longitude,
        speed: point.speed || 0,
        activityType: store.activityType,
        runId: store.currentRunId,
      });
    }
  };

  // 3. Mount HTML5 watchPosition coordinates tracker
  const { currentCoords, error: gpsError } = useGPS({
    enabled: store.isRunning && !store.isPaused,
    onLocationUpdate: handleLocationUpdate,
  });

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Initialize a new GPS workout activity.
   */
  const startTracking = async (activityType: 'WALKING' | 'RUNNING' | 'CYCLING') => {
    try {
      const res = await runService.startRun();
      if (res.success && res.data) {
        const runId = res.data.id;
        
        // Update local Zustand store
        store.startRun(runId, activityType);
        
        // Notify nearby players on the web sockets grid
        sendMessage('RUN_STARTED', { runId });
      }
    } catch (e) {
      console.error('Failed to start run:', e);
      throw e;
    }
  };

  /**
   * Pause current active session.
   */
  const pauseTracking = () => {
    store.pauseRun();
  };

  /**
   * Resume paused active session.
   */
  const resumeTracking = () => {
    store.resumeRun();
  };

  /**
   * End and commit active GPS tracking workout to the cloud database.
   */
  const stopTracking = async () => {
    const { currentRunId, activityType } = store;
    if (!currentRunId) return null;

    try {
      const res = await runService.endRun(currentRunId, activityType);
      if (res.success) {
        // Notify nearby socket grids that we stopped moving
        sendMessage('RUN_ENDED', { runId: currentRunId });
        
        // Reset local run state
        store.stopRun();
        
        return res.data;
      }
      return null;
    } catch (e) {
      console.error('Failed to end run:', e);
      store.stopRun(); // ensure we stop tracking even on error
      throw e;
    }
  };

  return {
    ...store,
    currentLocation: currentCoords,
    gpsError,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
  };
};
export default useRun;
