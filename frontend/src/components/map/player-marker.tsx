'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { NearbyPlayer } from '@/types';

interface PlayerMarkerProps {
  player: NearbyPlayer;
}

function createPlayerIcon(player: NearbyPlayer) {
  // Generate a consistent color from player ID
  const hash = player.userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  if (player.avatarUrl) {
    return L.divIcon({
      className: 'player-marker',
      html: `
        <div style="
          width:28px;height:28px;
          border-radius:50%;
          overflow:hidden;
          border:2px solid hsl(${hue},70%,60%);
          box-shadow:0 0 8px hsla(${hue},70%,60%,0.4);
        ">
          <img
            src="${player.avatarUrl}"
            alt="${player.username}"
            style="width:100%;height:100%;object-fit:cover;"
          />
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  // Fallback: colored dot with initial
  const initial = player.username?.charAt(0).toUpperCase() ?? '?';
  return L.divIcon({
    className: 'player-marker',
    html: `
      <div style="
        width:28px;height:28px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        background:hsl(${hue},60%,25%);
        border:2px solid hsl(${hue},70%,50%);
        box-shadow:0 0 8px hsla(${hue},70%,50%,0.4);
        color:hsl(${hue},80%,80%);
        font-size:12px;
        font-weight:600;
        font-family:system-ui,sans-serif;
      ">${initial}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function PlayerMarker({ player }: PlayerMarkerProps) {
  const icon = createPlayerIcon(player);

  return (
    <Marker
      position={[player.location.latitude, player.location.longitude]}
      icon={icon}
    >
      <Popup>
        <div className="min-w-[140px] rounded-lg bg-[#0f0f1a] p-3 text-sm text-white border border-white/10">
          <p className="font-semibold text-cyan-400">{player.username}</p>
          {player.level !== undefined && (
            <p className="text-slate-400 text-xs mt-1">
              Level <span className="text-slate-200 font-medium">{player.level}</span>
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
