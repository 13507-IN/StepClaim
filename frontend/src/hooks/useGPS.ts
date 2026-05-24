'use client';

import { useEffect, useRef, useState } from 'react';
import { LocationPoint } from '../types';

interface UseGPSProps {
  enabled: boolean;
  onLocationUpdate: (point: LocationPoint) => void;
}

export const useGPS = ({ enabled, onLocationUpdate }: UseGPSProps) => {
  const watchIdRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<LocationPoint | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Geolocation API configs for precise real-time hardware pings
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10s
      maximumAge: 0, // no cache
    };

    const successHandler = (position: GeolocationPosition) => {
      const { latitude, longitude, speed, accuracy, altitude } = position.coords;

      // Rule 5: Ignore GPS noise and inaccurate readings (> 25 meters accuracy drift)
      if (accuracy > 25) {
        console.warn(`⚠️ GPS: Dropping noisy coordinate update (Accuracy: ${accuracy.toFixed(1)}m > 25m)`);
        return;
      }

      const point: LocationPoint = {
        latitude,
        longitude,
        speed: speed || 0,
        accuracy,
        altitude: altitude || undefined,
        timestamp: position.timestamp,
      };

      setCurrentCoords(point);
      onLocationUpdate(point);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      console.error('❌ GPS Error:', err.message);
      let errMsg = 'Failed to fetch GPS coordinates';
      if (err.code === err.PERMISSION_DENIED) {
        errMsg = 'GPS access denied by user. Please enable location permissions.';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        errMsg = 'Location coordinates unavailable';
      } else if (err.code === err.TIMEOUT) {
        errMsg = 'GPS request timed out';
      }
      setError(errMsg);
    };

    console.log('📡 GPS: Fetching quick initial position for instant map centering...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy, altitude } = position.coords;
        if (accuracy <= 25) {
          const point: LocationPoint = {
            latitude,
            longitude,
            speed: speed || 0,
            accuracy,
            altitude: altitude || undefined,
            timestamp: position.timestamp,
          };
          setCurrentCoords(point);
          onLocationUpdate(point);
        }
      },
      (err) => {
        console.warn('⚠️ GPS: Quick initial position fetch failed, relying on watch:', err.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    console.log('📡 GPS: Starting geolocation watchPosition...');
    watchIdRef.current = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      options,
    );

    return () => {
      if (watchIdRef.current !== null) {
        console.log('📡 GPS: Clearing geolocation watchPosition...');
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, onLocationUpdate]);

  return { currentCoords, error };
};
export default useGPS;
