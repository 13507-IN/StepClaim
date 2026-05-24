'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRun } from '@/hooks/useRun';
import { useGameStore } from '@/store/game.store';
import { territoryService } from '@/services/territory.service';
import { useToast } from '@/components/ui/toast';
import { DynamicMap } from '@/components/map/dynamic-map';
import { RunControls } from '@/components/game/run-controls';
import { RunStats } from '@/components/game/run-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, MoveUp, MoveDown, MoveLeft, MoveRight, HelpCircle } from 'lucide-react';

export default function LiveRunPage() {
  const runTracker = useRun();
  const { setNearbyTerritories, addNotification } = useGameStore();
  const { success, warning, info } = useToast();

  // Current map coordinates focus: default to New York center fallback, or user coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [useSimulatedGps, setUseSimulatedGps] = useState(false);

  // 1. Sync Map Center with user's real GPS coordinates once logged
  useEffect(() => {
    if (runTracker.currentLocation && !useSimulatedGps) {
      setMapCenter([runTracker.currentLocation.latitude, runTracker.currentLocation.longitude]);
    }
  }, [runTracker.currentLocation, useSimulatedGps]);

  // 2. Fetch H3 Hexagonal Grid mapping around the active center
  const { refetch } = useQuery({
    queryKey: ['nearby-territories', mapCenter[0], mapCenter[1]],
    queryFn: async () => {
      if (mapCenter[0] === 0 && mapCenter[1] === 0) return [];
      const res = await territoryService.getNearbyTerritories(mapCenter[0], mapCenter[1]);
      if (res.success && res.data) {
        setNearbyTerritories(res.data);
      }
      return res.data || [];
    },
    enabled: mapCenter[0] !== 0 && mapCenter[1] !== 0,
  });

  // Listen to capture events globally to trigger manual H3 grid refreshes
  useEffect(() => {
    const refreshHandler = () => {
      refetch();
    };
    window.addEventListener('territory-captured-refresh', refreshHandler);
    return () => {
      window.removeEventListener('territory-captured-refresh', refreshHandler);
    };
  }, [refetch]);

  // ─── Developer Simulation Panel Logic ─────────────────────────────────────

  /**
   * Helper that injects mock geocoordinates updates,
   * simulating movement, speed violations, or teleport jumps to test anti-cheat filters.
   */
  const injectSimulatedCoordinate = (lat: number, lng: number, customSpeed = 4) => {
    setUseSimulatedGps(true);
    const newCenter: [number, number] = [lat, lng];
    setMapCenter(newCenter);

    const point = {
      latitude: lat,
      longitude: lng,
      speed: customSpeed, // m/s
      accuracy: 3, // high precision
      timestamp: Date.now(),
    };

    // Inject directly into GPS update callback
    if (runTracker.isRunning && !runTracker.isPaused) {
      runTracker.addLocation(point);
      
      // Emit socket LOCATION_UPDATED
      const socket = (window as any).ioSocket; // fallbacks
      runTracker.startTracking // standard callbacks
    }

    // Trigger manual coordinates update event broadcast
    const customGpsEvent = new CustomEvent('simulated-gps-ping', { detail: point });
    window.dispatchEvent(customGpsEvent);
  };

  const simulateMove = (direction: 'N' | 'S' | 'E' | 'W') => {
    // Roughly 0.0008 degrees corresponds to ~90 meters
    const offset = 0.0008;
    let [lat, lng] = mapCenter;

    if (direction === 'N') lat += offset;
    else if (direction === 'S') lat -= offset;
    else if (direction === 'E') lng += offset;
    else if (direction === 'W') lng -= offset;

    injectSimulatedCoordinate(lat, lng, 4); // 4 m/s walking speed
    info('Coordinates Simulated', `Moved ${direction} ~90m (Speed: 4 m/s)`);
  };

  const simulateTeleport = () => {
    // 0.008 degrees corresponds to ~900 meters (exceeds 500m threshold)
    const [lat, lng] = mapCenter;
    const newLat = lat + 0.008;
    
    injectSimulatedCoordinate(newLat, lng, 120); // 120 m/s teleport speed
    warning('Cheat Simulation', 'Triggered teleport jump. Inspecting anti-cheat logs...');
  };

  const simulateSpeeding = () => {
    // Exceeds 10m/s speed limit for running mode
    const [lat, lng] = mapCenter;
    const newLat = lat + 0.0003; // move ~35 meters
    
    injectSimulatedCoordinate(newLat, lng, 28); // 28 m/s speed (~100km/h)
    warning('Cheat Simulation', 'Simulating speed limit violation. Inspecting anti-cheat logs...');
  };

  return (
    <div className="flex-1 flex flex-col relative h-full w-full">
      
      {/* ─── Main Map Container ─── */}
      <div className="flex-1 w-full h-full relative z-0">
        <DynamicMap center={mapCenter} interactive={true} />

        {/* ─── Floating Top Stats Overlay ─── */}
        {runTracker.isRunning && (
          <div className="absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-80 z-10 pointer-events-auto">
            <RunStats
              distance={runTracker.distance}
              duration={runTracker.duration}
              speed={runTracker.speed}
              calories={runTracker.calories}
              xpEarned={runTracker.xpEarned}
              territoriesCaptured={runTracker.territoriesCaptured}
            />
          </div>
        )}

        {/* ─── Floating Developer Simulation Controls ─── */}
        <div className="absolute bottom-24 right-4 z-10 pointer-events-auto max-w-xs w-full">
          <Card className="border border-cyan-500/20 bg-[#0c0c14]/90 backdrop-blur-md shadow-2xl">
            <CardHeader className="p-3 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase font-extrabold text-cyan-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 fill-cyan-400" />
                Simulate Location
              </CardTitle>
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
            </CardHeader>
            <CardContent className="p-3 space-y-2.5">
              {/* Walking Simulator buttons */}
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Walk Simulator</p>
                <div className="grid grid-cols-4 gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 border-white/5 bg-white/5" onClick={() => simulateMove('N')}>
                    <MoveUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 border-white/5 bg-white/5" onClick={() => simulateMove('S')}>
                    <MoveDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 border-white/5 bg-white/5" onClick={() => simulateMove('W')}>
                    <MoveLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 border-white/5 bg-white/5" onClick={() => simulateMove('E')}>
                    <MoveRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Anti-cheat Simulator buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={simulateTeleport}
                  className="h-8 text-[9px] font-bold uppercase tracking-wider"
                >
                  Teleport
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={simulateSpeeding}
                  className="h-8 text-[9px] font-bold uppercase tracking-wider"
                >
                  Speed Violation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Bottom Active Tracking Controls ─── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full px-4">
          <RunControls
            isRunning={runTracker.isRunning}
            isPaused={runTracker.isPaused}
            onStart={runTracker.startTracking}
            onPause={runTracker.pauseTracking}
            onResume={runTracker.resumeTracking}
            onStop={async () => {
              const res = await runTracker.stopTracking();
              if (res) {
                success('Workout Ended!', `Distance: ${(res.run.distance/1000).toFixed(2)}km. Earned +${res.xpGained} XP!`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
