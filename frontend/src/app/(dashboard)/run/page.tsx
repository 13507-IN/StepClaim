'use client';

import React, { useState } from 'react';
import { DynamicMap } from '@/components/map/dynamic-map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause } from 'lucide-react';

export default function LiveRunPage() {
  const [isRunning, setIsRunning] = useState(false);
  // Default fallback center (e.g. New York)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);

  return (
    <div className="flex flex-col h-full w-full relative p-4 gap-4">
      {/* Header Overlay */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] drop-shadow-md">Live Run</h1>
        <p className="text-sm text-[var(--color-foreground)]/80 drop-shadow-sm">Capture territories in real-time.</p>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative rounded-xl overflow-hidden shadow-lg border border-[var(--color-border)]">
        <DynamicMap center={mapCenter} interactive={true} />
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
            <span className="text-xl font-bold text-[var(--color-primary)]">0.0 km</span>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button size="lg" className="rounded-full shadow-lg" onClick={() => setIsRunning(true)}>
                <Play className="h-5 w-5 mr-2" />
                Start Run
              </Button>
            ) : (
              <>
                <Button size="lg" variant="secondary" className="rounded-full shadow-md" onClick={() => setIsRunning(false)}>
                  <Pause className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="destructive" className="rounded-full shadow-lg" onClick={() => setIsRunning(false)}>
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
