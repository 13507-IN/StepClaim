'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DynamicMap } from '@/components/map/dynamic-map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, MapPin } from 'lucide-react';
import { useGPS } from '@/hooks/useGPS';
import { calculateDistance } from '@/lib/utils';

export default function LiveRunPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [distance, setDistance] = useState(0); // distance in km
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  
  // Default fallback center
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);

  // Request GPS when component mounts
  const { location, error, loading } = useGPS(true);
  
  // Ref to hold the last processed location to calculate distance deltas
  const lastLocationRef = useRef<[number, number] | null>(null);

  // Update map center automatically whenever GPS gets a new live location
  // Also calculate distance and draw path if running
  useEffect(() => {
    if (location) {
      const currentPos: [number, number] = [location.latitude, location.longitude];
      setMapCenter(currentPos);
      
      if (isRunning) {
        setRoutePath((prev) => [...prev, currentPos]);
        
        if (lastLocationRef.current) {
          const distDelta = calculateDistance(
            lastLocationRef.current[0], lastLocationRef.current[1],
            currentPos[0], currentPos[1]
          );
          setDistance((prev) => prev + distDelta);
        }
        lastLocationRef.current = currentPos;
      } else {
        lastLocationRef.current = null;
      }
    }
  }, [location, isRunning]);

  const handleStartRun = () => {
    setIsRunning(true);
    setDistance(0);
    setRoutePath([]);
    lastLocationRef.current = null;
  };

  const handleStopRun = () => {
    setIsRunning(false);
    lastLocationRef.current = null;
    // In a full implementation, you would save the run to the backend here
  };

  return (
    <div className="flex flex-col h-full w-full relative p-4 gap-4">
      {/* Header Overlay */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] drop-shadow-md flex items-center gap-2">
          Live Run
          {loading && <span className="text-xs font-normal text-[var(--color-primary)] animate-pulse border border-[var(--color-primary)] px-2 py-0.5 rounded-full">Finding GPS...</span>}
        </h1>
        {error ? (
           <p className="text-sm text-[var(--color-destructive)] drop-shadow-sm max-w-sm mt-1 bg-black/50 p-1 rounded">{error}</p>
        ) : (
           <p className="text-sm text-[var(--color-foreground)]/80 drop-shadow-sm mt-1">Capture territories in real-time.</p>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative rounded-xl overflow-hidden shadow-lg border border-[var(--color-border)]">
        <DynamicMap center={mapCenter} interactive={true} routePath={routePath} />
      </div>

      {/* Run Controls */}
      <Card className="glass-panel shrink-0 p-4 sticky bottom-4">
        <CardContent className="p-0 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-foreground)]/60 uppercase tracking-widest">Status</span>
            <span className="text-xl font-bold">{isRunning ? 'Recording' : 'Ready'}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-foreground)]/60 uppercase tracking-widest">Distance</span>
            <span className="text-xl font-bold text-[var(--color-primary)]">{distance.toFixed(2)} km</span>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button size="lg" className="rounded-full shadow-lg" onClick={handleStartRun}>
                <Play className="h-5 w-5 mr-2" />
                Start Run
              </Button>
            ) : (
              <>
                <Button size="lg" variant="destructive" className="rounded-full shadow-lg" onClick={handleStopRun}>
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
