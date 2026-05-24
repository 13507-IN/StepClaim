'use client';

import { Polyline } from 'react-leaflet';
import type { LocationPoint } from '@/types';

interface RoutePolylineProps {
  positions: LocationPoint[];
}

export function RoutePolyline({ positions }: RoutePolylineProps) {
  const latLngs: [number, number][] = positions.map((point) => [
    point.latitude,
    point.longitude,
  ]);

  if (latLngs.length < 2) {
    return null;
  }

  return (
    <Polyline
      positions={latLngs}
      pathOptions={{
        color: '#22d3ee',
        weight: 4,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}
