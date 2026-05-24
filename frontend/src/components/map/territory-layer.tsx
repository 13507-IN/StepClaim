'use client';

import { Polygon, Popup } from 'react-leaflet';
import { cellToBoundary } from 'h3-js';
import type { Territory } from '@/types';

interface TerritoryLayerProps {
  territories: Territory[];
}

function getTerritoryStyle(territory: Territory) {
  if (territory.isOwnedByUser) {
    return {
      color: '#22d3ee',       // cyan-400
      fillColor: '#22d3ee',
      fillOpacity: 0.3,
      weight: 1,
    };
  }

  if (territory.ownerId) {
    return {
      color: '#a855f7',       // purple-500
      fillColor: '#a855f7',
      fillOpacity: 0.25,
      weight: 1,
    };
  }

  // Unclaimed
  return {
    color: '#475569',         // slate-600
    fillColor: '#475569',
    fillOpacity: 0.1,
    weight: 1,
  };
}

export function TerritoryLayer({ territories }: TerritoryLayerProps) {
  return (
    <>
      {territories.map((territory) => {
        // h3-js cellToBoundary returns [lat, lng][] which is what react-leaflet expects
        const boundary = cellToBoundary(territory.h3Index, true);
        // cellToBoundary with geoJson=true returns [lng, lat][], so we swap
        const positions = boundary.map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );

        const style = getTerritoryStyle(territory);

        return (
          <Polygon
            key={territory.h3Index}
            positions={positions}
            pathOptions={style}
          >
            <Popup className="territory-popup">
              <div className="min-w-[160px] rounded-lg bg-[#0f0f1a] p-3 text-sm text-white border border-white/10">
                <p className="font-semibold text-cyan-400 mb-1">Territory</p>
                <p className="text-slate-400 text-xs mb-1">
                  Hex: <span className="text-slate-300 font-mono">{territory.h3Index.slice(0, 12)}…</span>
                </p>
                {territory.ownerUsername ? (
                  <p className="text-slate-400 text-xs">
                    Owner: <span className="text-slate-200">{territory.ownerUsername}</span>
                  </p>
                ) : (
                  <p className="text-slate-500 text-xs italic">Unclaimed</p>
                )}
                {territory.captureCount !== undefined && (
                  <p className="text-slate-400 text-xs mt-1">
                    Captures: <span className="text-slate-200">{territory.captureCount}</span>
                  </p>
                )}
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}
