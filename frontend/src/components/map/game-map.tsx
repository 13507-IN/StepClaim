'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationPoint } from '@/types';
import { useGameStore } from '@/store/game.store';
import { useRunStore } from '@/store/run.store';

interface GameMapProps {
  center: [number, number];
  zoom?: number;
  interactive?: boolean;
}

// ─── Custom Leaflet SVG Pulsing Icons ───────────────────────────────────────

const createPulsingIcon = (colorHex: string, pulseColorHex: string) => {
  if (typeof window === 'undefined') return undefined;

  const svgHtml = `
    <div style="position: relative; width: 24px; height: 24px; display: flex; items-content: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: ${pulseColorHex}; opacity: 0.4; transform: scale(1); animation: marker-pulse 1.6s infinite ease-out;"></div>
      <div style="position: absolute; top: 6px; left: 6px; width: 12px; height: 12px; border-radius: 50%; background-color: ${colorHex}; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-pulsing-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// ─── Map Subcomponents ───────────────────────────────────────────────────────

/**
 * Controller component that handles zooming and centering the map.
 */
const MapController: React.FC<{ center: [number, number]; autoCenter: boolean }> = ({ center, autoCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (autoCenter && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, autoCenter, map]);

  return null;
};

// ─── Main Map Component ─────────────────────────────────────────────────────

export const GameMap: React.FC<GameMapProps> = ({ center, zoom = 16, interactive = true }) => {
  const { nearbyTerritories, nearbyPlayers } = useGameStore();
  const { locations, isRunning, currentRunId } = useRunStore();

  const userMarkerIcon = React.useMemo(() => createPulsingIcon('#22d3ee', 'rgba(34, 211, 238, 0.4)'), []);
  const enemyMarkerIcon = React.useMemo(() => createPulsingIcon('#c084fc', 'rgba(192, 132, 252, 0.4)'), []);

  // 1. Convert active run locations to L.LatLngExpression for plotting paths
  const routePoints = React.useMemo(() => {
    return locations.map((loc) => [loc.latitude, loc.longitude] as [number, number]);
  }, [locations]);

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Pulse Keyframe Styles injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marker-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-container {
          background-color: #0a0a0f !important;
        }
        .leaflet-bar a {
          background-color: rgba(16, 16, 28, 0.85) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #22d3ee !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-bar a:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}} />

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        attributionControl={false}
        className="w-full h-full"
      >
        {/* Dark Mode CartoDB tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Sync Center */}
        <MapController center={center} autoCenter={interactive} />

        {/* 2. H3 Hexagonal Territories Overlays */}
        {nearbyTerritories.map((hex) => {
          const isMyTerritory = hex.captured && hex.owner && hex.owner.id === localStorage.getItem('userId');
          
          let fillOpts = {
            fillColor: 'rgba(255, 255, 255, 0.04)',
            color: 'rgba(255, 255, 255, 0.08)',
            weight: 1,
            fillOpacity: 0.5,
          };

          if (hex.captured) {
            if (isMyTerritory) {
              fillOpts = {
                fillColor: 'rgba(34, 211, 238, 0.22)', // Cyan-400 glow
                color: 'rgba(34, 211, 238, 0.6)',
                weight: 1.5,
                fillOpacity: 0.6,
              };
            } else {
              fillOpts = {
                fillColor: 'rgba(168, 85, 247, 0.18)', // Purple-500 glow
                color: 'rgba(168, 85, 247, 0.5)',
                weight: 1.5,
                fillOpacity: 0.6,
              };
            }
          }

          return (
            <Polygon
              key={hex.gridId}
              positions={hex.boundary}
              pathOptions={{
                ...fillOpts,
                className: hex.captured ? 'animate-pulse' : '',
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 bg-[#0c0c14]/90 backdrop-blur-md rounded-lg text-slate-100 text-xs space-y-1">
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider text-cyan-400">
                    Hex Sector Cell
                  </p>
                  <p className="text-slate-400">Grid ID: <span className="font-mono">{hex.gridId}</span></p>
                  <p className="text-slate-200">
                    Status: <span className={hex.captured ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      {hex.captured ? 'Occupied' : 'Neutral'}
                    </span>
                  </p>
                  {hex.captured && (
                    <p className="text-slate-200">
                      Owner: <span className="font-semibold text-purple-300">{hex.owner?.username}</span>
                    </p>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 3. Render Active Run route Polyline */}
        {isRunning && routePoints.length >= 2 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#22d3ee', // Cyan-400 glowing trackline
              weight: 4,
              opacity: 0.8,
              dashArray: '5, 8',
            }}
          />
        )}

        {/* 4. Pulsing Current Player Marker */}
        {center[0] !== 0 && center[1] !== 0 && userMarkerIcon && (
          <Marker position={center} icon={userMarkerIcon}>
            <Popup>
              <div className="text-xs p-1 text-slate-900 font-medium">Your current GPS location</div>
            </Popup>
          </Marker>
        )}

        {/* 5. Pulsing Adjacent Active Runners Markers */}
        {nearbyPlayers.map((player) => {
          if (player.userId === localStorage.getItem('userId')) return null;
          
          return (
            <Marker
              key={player.userId}
              position={[player.location.latitude, player.location.longitude]}
              icon={enemyMarkerIcon}
            >
              <Popup>
                <div className="p-2 bg-[#0c0c14]/95 text-slate-100 rounded-md text-xs space-y-1">
                  <p className="font-bold text-purple-400">{player.username}</p>
                  <p>Level {player.level}</p>
                  <p className="text-emerald-400 animate-pulse font-semibold">Online Nearby</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
export default GameMap;
