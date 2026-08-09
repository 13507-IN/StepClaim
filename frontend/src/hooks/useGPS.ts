'use client';

import { useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);
  const [signalQuality, setSignalQuality] = useState<SignalQuality>('POOR');

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;

        // Signal Quality assessment
        let quality: SignalQuality = 'POOR';
        if (accuracy <= 10) quality = 'EXCELLENT';
        else if (accuracy <= 20) quality = 'GOOD';
        else if (accuracy <= 35) quality = 'FAIR';
        setSignalQuality(quality);

        // Convert speed m/s to km/h if available
        const rawSpeed = position.coords.speed;
        const speedKmH = rawSpeed !== null && rawSpeed >= 0 ? rawSpeed * 3.6 : null;

        // Save location
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy,
          speed: speedKmH,
          timestamp: position.timestamp,
        });

        setError(null);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
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
  }, [active]);

  return { location, error, loading, signalQuality };
}

