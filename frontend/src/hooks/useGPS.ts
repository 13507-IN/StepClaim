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
  const MAX_ACCEPTABLE_ACCURACY_METERS = 200;

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

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const buildPoint = (position: GeolocationPosition): LocationPoint => {
      const { latitude, longitude, speed, accuracy, altitude } = position.coords;
      return {
        latitude,
        longitude,
        speed: speed && speed > 0 ? speed : 0,
        accuracy,
        altitude: altitude || undefined,
        timestamp: position.timestamp,
      };
    };

    const successHandler = (position: GeolocationPosition) => {
      const accuracy = position.coords.accuracy;

      // Accept normal phone jitter; only reject clearly unusable points.
      if (!Number.isFinite(accuracy) || accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
        console.warn(`GPS: Dropping very noisy coordinate update (accuracy: ${accuracy.toFixed(1)}m)`);
        return;
      }

      const point = buildPoint(position);
      setCurrentCoords(point);
      onLocationUpdate(point);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      console.error('GPS Error:', err.message);
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (position.coords.accuracy <= MAX_ACCEPTABLE_ACCURACY_METERS) {
          const point = buildPoint(position);
          setCurrentCoords(point);
          onLocationUpdate(point);
        }
      },
      () => {
        // Fallback to watchPosition path.
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );

    watchIdRef.current = navigator.geolocation.watchPosition(successHandler, errorHandler, options);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, onLocationUpdate]);

  return { currentCoords, error };
};

export default useGPS;
