'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { calculateDistance } from '@/lib/utils';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null; // speed in km/h if available from device
  timestamp: number;
}

export type SignalQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export function useGPS(active: boolean = true) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signalQuality, setSignalQuality] = useState<SignalQuality>('POOR');
  const previousAccuratePositionRef = useRef<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);
  const geolocationAvailable = useSyncExternalStore(
    () => () => undefined,
    () => 'geolocation' in navigator,
    () => true,
  );

  useEffect(() => {
    if (!active || !geolocationAvailable) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;

        // Signal Quality assessment (calibrated for real-world smartphone GPS)
        let quality: SignalQuality = 'POOR';
        if (accuracy <= 15) quality = 'EXCELLENT';
        else if (accuracy <= 30) quality = 'GOOD';
        else if (accuracy <= 100) quality = 'FAIR';
        setSignalQuality(quality);

        // Convert speed m/s to km/h when provided by the device.
        const rawSpeed = position.coords.speed;
        let speedKmH =
          rawSpeed !== null && Number.isFinite(rawSpeed) && rawSpeed >= 0
            ? rawSpeed * 3.6
            : null;

        if (accuracy > 100) {
          previousAccuratePositionRef.current = null;
        } else {
          const previous = previousAccuratePositionRef.current;
          const elapsedSeconds = previous
            ? (position.timestamp - previous.timestamp) / 1000
            : 0;
          if (
            speedKmH === null &&
            previous &&
            accuracy <= 65 &&
            previous.accuracy <= 65 &&
            elapsedSeconds >= 2 &&
            elapsedSeconds <= 12
          ) {
            const distanceKm = calculateDistance(
              previous.latitude,
              previous.longitude,
              position.coords.latitude,
              position.coords.longitude,
            );
            // Avoid turning small GPS jitter into extreme apparent speeds.
            const minimumReliableDistanceKm =
              (accuracy + previous.accuracy) / 1500;
            if (distanceKm >= minimumReliableDistanceKm) {
              const estimatedSpeed = (distanceKm / elapsedSeconds) * 3600;
              speedKmH = Number.isFinite(estimatedSpeed) ? estimatedSpeed : null;
            }
          }

          previousAccuratePositionRef.current = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy,
            timestamp: position.timestamp,
          };
        }

        // Save location
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy,
          speed: speedKmH,
          timestamp: position.timestamp,
        });

        setError(null);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable Precise Location in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Check your device GPS.');
            break;
          case err.TIMEOUT:
            // Do not permanently show blocking error if we already have a fix
            setLocation((prev) => {
              if (!prev) setError('Waiting for GPS satellite fix. Please move outdoors with clear sky view.');
              return prev;
            });
            break;
          default:
            setError('An unknown GPS error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 27000,
        maximumAge: 2000,
      }
    );

    // Refresh position immediately when user unlocks or returns to browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              speed: pos.coords.speed ? pos.coords.speed * 3.6 : null,
              timestamp: pos.timestamp,
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [active, geolocationAvailable]);

  return {
    location,
    error: error ?? (
      active && !geolocationAvailable
        ? 'Geolocation is not supported by your browser.'
        : null
    ),
    loading: active && geolocationAvailable && !location && !error,
    signalQuality,
  };
}
