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

        // Signal Quality assessment
        let quality: SignalQuality = 'POOR';
        if (accuracy <= 10) quality = 'EXCELLENT';
        else if (accuracy <= 20) quality = 'GOOD';
        else if (accuracy <= 35) quality = 'FAIR';
        setSignalQuality(quality);

        // Convert speed m/s to km/h when provided by the device.
        const rawSpeed = position.coords.speed;
        let speedKmH =
          rawSpeed !== null && Number.isFinite(rawSpeed) && rawSpeed >= 0
            ? rawSpeed * 3.6
            : null;

        if (accuracy > 30) {
          previousAccuratePositionRef.current = null;
        } else {
          const previous = previousAccuratePositionRef.current;
          const elapsedSeconds = previous
            ? (position.timestamp - previous.timestamp) / 1000
            : 0;
          if (
            speedKmH === null &&
            previous &&
            accuracy <= 15 &&
            previous.accuracy <= 15 &&
            elapsedSeconds >= 3 &&
            elapsedSeconds <= 10
          ) {
            const distanceKm = calculateDistance(
              previous.latitude,
              previous.longitude,
              position.coords.latitude,
              position.coords.longitude,
            );
            // Avoid turning small GPS jitter into extreme apparent speeds.
            const minimumReliableDistanceKm =
              (accuracy + previous.accuracy) / 1000;
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
            setError('Location permission denied. Please enable it in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('The request to get user location timed out.');
            break;
          default:
            setError('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
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
