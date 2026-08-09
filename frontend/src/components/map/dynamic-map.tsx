'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for React-Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });

import { cellToBoundary } from 'h3-js';
import { calculateDistance } from '@/lib/utils';

interface DynamicMapProps {
  center: [number, number];
  interactive?: boolean;
  routePath?: [number, number][];
  username?: string;
  capturedTerritories?: string[];
  trackColor?: string;
}

export function DynamicMap({ 
  center, 
  interactive = true, 
  routePath = [], 
  username, 
  capturedTerritories = [],
  trackColor = '#FC4C02' // Strava signature orange
}: DynamicMapProps) {
  // Fix Leaflet icons issue in Next.js
  useEffect(() => {
    (async function init() {
      const L = await import('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    })();
  }, []);

  // Compute 1km split markers along routePath
  const splits: { position: [number, number]; km: number }[] = [];
  if (routePath.length > 1) {
    let accumulatedDist = 0;
    let nextMilestone = 1.0; // 1 km
    for (let i = 1; i < routePath.length; i++) {
      const prev = routePath[i - 1];
      const curr = routePath[i];
      const dist = calculateDistance(prev[0], prev[1], curr[0], curr[1]);
      accumulatedDist += dist;

      if (accumulatedDist >= nextMilestone) {
        splits.push({ position: curr, km: Math.floor(nextMilestone) });
        nextMilestone += 1.0;
      }
    }
  }

  const startPoint = routePath.length > 0 ? routePath[0] : null;
  const endPoint = routePath.length > 1 ? routePath[routePath.length - 1] : null;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)]">
      <MapContainer 
        center={center} 
        zoom={16} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="w-full h-full"
      >
        <MapUpdater center={center} />
        {/* Sleek Premium Dark Mode map tiles from CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Render captured territories from H3 indices */}
        {capturedTerritories.map((gridId) => {
          try {
            const boundary = cellToBoundary(gridId);
            return (
              <Polygon 
                key={gridId}
                positions={boundary} 
                pathOptions={{ 
                  color: 'var(--color-primary)', 
                  weight: 1.5, 
                  fillColor: 'var(--color-primary)', 
                  fillOpacity: 0.18,
                  opacity: 0.6
                }}
              />
            );
          } catch (e) {
            return null;
          }
        })}

        {/* Strava-style Glow Polyline Background */}
        {routePath.length >= 2 && (
          <Polyline 
            positions={routePath} 
            pathOptions={{ 
              color: trackColor, 
              weight: 8, 
              opacity: 0.3,
              lineCap: 'round',
              lineJoin: 'round'
            }} 
          />
        )}

        {/* Strava-style Main Track Polyline */}
        {routePath.length >= 2 && (
          <Polyline 
            positions={routePath} 
            pathOptions={{ 
              color: trackColor, 
              weight: 4.5, 
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round'
            }} 
          >
            {username && (
              <Tooltip permanent direction="top" className="custom-map-tooltip">
                {username}'s Route
              </Tooltip>
            )}
          </Polyline>
        )}

        {/* Start Point Marker (Green Flag / Pin) */}
        {startPoint && (
          <CircleMarker 
            center={startPoint} 
            radius={7} 
            pathOptions={{ fillColor: '#22c55e', color: '#ffffff', weight: 2, fillOpacity: 1 }}
          >
            <Tooltip permanent direction="bottom" offset={[0, 6]}>
              Start
            </Tooltip>
          </CircleMarker>
        )}

        {/* Kilometer Split Badges */}
        {splits.map((split, idx) => (
          <CircleMarker 
            key={`split-${idx}`}
            center={split.position} 
            radius={8} 
            pathOptions={{ fillColor: '#000000', color: '#ffffff', weight: 2, fillOpacity: 0.9 }}
          >
            <Tooltip permanent direction="center" interactive={false}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#ffffff' }}>{split.km}k</span>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* User Location Marker & Pulse Indicator */}
        <Marker position={center} />
        
        {/* User Location accuracy circle indicator */}
        <Circle 
          center={center} 
          pathOptions={{ fillColor: trackColor, color: trackColor, weight: 1, fillOpacity: 0.15 }} 
          radius={30} 
        />
      </MapContainer>
    </div>
  );
}

// Inner component to handle flyTo because useMap must be inside MapContainer
function MapUpdater({ center }: { center: [number, number] }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);
  return null;
}

