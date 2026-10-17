'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);

  return null;
}
