'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Dynamically imports the GameMap component to bypass Next.js Server Side Rendering (SSR).
 * Leaflet requires the 'window' global object, which is unavailable on the server.
 */
export const DynamicMap = dynamic(() => import('./game-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] relative bg-[#0a0a0f] overflow-hidden rounded-xl border border-white/10">
      <Skeleton className="w-full h-full absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-400 animate-pulse tracking-wide">
          Bootstrapping Geospatial Map...
        </p>
      </div>
    </div>
  ),
});

export default DynamicMap;
