'use client';

import { useMap } from 'react-leaflet';
import { Crosshair, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LocationPoint } from '@/types';

interface MapControlsProps {
  userLocation?: LocationPoint | null;
  className?: string;
}

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}

function ControlButton({ onClick, label, children, className }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center',
        'rounded-lg bg-[#0a0a0f]/80 backdrop-blur-xl',
        'border border-white/10 text-slate-400',
        'hover:bg-white/10 hover:text-white',
        'active:scale-95 transition-all duration-150',
        className
      )}
    >
      {children}
    </button>
  );
}

export function MapControls({ userLocation, className }: MapControlsProps) {
  const map = useMap();

  const handleCenterOnUser = () => {
    if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 16, {
        duration: 1,
      });
    }
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 z-[1000] flex flex-col gap-2',
        className
      )}
    >
      <ControlButton
        onClick={handleCenterOnUser}
        label="Center on my location"
      >
        <Crosshair className="h-5 w-5" />
      </ControlButton>

      <ControlButton onClick={handleZoomIn} label="Zoom in">
        <Plus className="h-5 w-5" />
      </ControlButton>

      <ControlButton onClick={handleZoomOut} label="Zoom out">
        <Minus className="h-5 w-5" />
      </ControlButton>
    </div>
  );
}
