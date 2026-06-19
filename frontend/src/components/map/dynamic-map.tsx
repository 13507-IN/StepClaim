'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for React-Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });

import { cellToBoundary } from 'h3-js';

interface DynamicMapProps {
  center: [number, number];
  interactive?: boolean;
  routePath?: [number, number][];
  username?: string;
  capturedTerritories?: string[];
}

export function DynamicMap({ center, interactive = true, routePath = [], username, capturedTerritories = [] }: DynamicMapProps) {
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

  // Component to handle map re-centering
  const MapRecenter = ({ center }: { center: [number, number] }) => {
    const map = import('react-leaflet').then(mod => mod.useMap) as any;
    return null;
  };

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

        {/* Render previously captured territories from H3 indices */}
        {capturedTerritories.map((gridId) => {
          try {
            // cellToBoundary returns [lat, lng][] for the hexagon vertices
            const boundary = cellToBoundary(gridId);
            return (
              <Polygon 
                key={gridId}
                positions={boundary} 
                pathOptions={{ 
                  color: 'var(--color-primary)', 
                  weight: 2, 
                  fillColor: 'var(--color-primary)', 
                  fillOpacity: 0.15,
                  opacity: 0.5
                }}
              />
            );
          } catch (e) {
            return null; // Ignore invalid H3 indices
          }
        })}

        {/* Draw the user's claimed territory as a Polygon */}
        {routePath.length > 2 && (
          <Polygon 
            positions={routePath} 
            pathOptions={{ 
              color: 'var(--color-primary)', 
              weight: 3, 
              dashArray: '10, 10', // Dotted line
              fillColor: 'var(--color-primary)', 
              fillOpacity: 0.2 
            }}
          >
            {username && (
              <Tooltip permanent direction="center" className="custom-map-tooltip">
                {username}'s Territory
              </Tooltip>
            )}
          </Polygon>
        )}

        {/* Fallback to Polyline if less than 3 points (cannot form a polygon yet) */}
        {routePath.length === 2 && (
           <Polygon 
             positions={routePath} 
             pathOptions={{ color: 'var(--color-primary)', weight: 3, dashArray: '10, 10' }} 
           />
        )}

        {/* User Location Marker */}
        <Marker position={center} />
        
        {/* User Location accuracy circle indicator */}
        <Circle 
          center={center} 
          pathOptions={{ fillColor: 'var(--color-primary)', color: 'var(--color-primary)', weight: 1 }} 
          radius={50} 
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
