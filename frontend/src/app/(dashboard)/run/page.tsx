'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DynamicMap } from '@/components/map/dynamic-map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, MapPin, Gauge, Timer, Flame, Navigation } from 'lucide-react';
import { useGPS } from '@/hooks/useGPS';
import { calculateDistance } from '@/lib/utils';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useSocket } from '@/hooks/useSocket';
import { runService } from '@/services/run.api';
import { authService } from '@/services/auth.api';

type ActivityType = 'WALKING' | 'RUNNING' | 'CYCLING';

export default function LiveRunPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  
  const { socket, isConnected } = useSocket();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activityType, setActivityType] = useState<ActivityType>('RUNNING');
  const [distance, setDistance] = useState(0); // distance in km
  const [durationSeconds, setDurationSeconds] = useState(0); // elapsed active time
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const [capturedTerritories, setCapturedTerritories] = useState<string[]>([]);

  // Request GPS when component mounts
  const { location, error, loading: gpsLoading, signalQuality } = useGPS(true);
  
  // Ref to hold the last processed location to calculate distance deltas
  const lastLocationRef = useRef<[number, number] | null>(null);

  // Active Timer Tick Effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isPaused]);

  // Fetch previously captured territories on load
  useEffect(() => {
    async function loadTerritories() {
      try {
        const { territoryService } = await import('@/services/territory.api');
        const territories = await territoryService.getMyTerritories();
        setCapturedTerritories(territories.map(t => t.gridId));
      } catch (err) {
        console.error('Failed to load territories:', err);
      }
    }
    loadTerritories();
  }, []);

  // Listen for real-time territory captures over Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleTerritoryCaptured = (data: { gridId: string; ownerId: string; username: string }) => {
      setCapturedTerritories((prev) => {
        if (!prev.includes(data.gridId)) {
          return [...prev, data.gridId];
        }
        return prev;
      });
    };

    socket.on('TERRITORY_CAPTURED', handleTerritoryCaptured);
    return () => {
      socket.off('TERRITORY_CAPTURED', handleTerritoryCaptured);
    };
  }, [socket]);

  // Update map center automatically whenever GPS gets a new live location
  // Filter accuracy & distance noise before appending to route path
  useEffect(() => {
    if (location) {
      const currentPos: [number, number] = [location.latitude, location.longitude];
      setMapCenter(currentPos);
      
      // Strava GPS Noise Filter: Ignore coordinates with low accuracy (> 30 meters)
      if (location.accuracy > 30) {
        return;
      }

      if (isRunning && !isPaused && activeRunId && socket) {
        if (lastLocationRef.current) {
          const distDelta = calculateDistance(
            lastLocationRef.current[0], lastLocationRef.current[1],
            currentPos[0], currentPos[1]
          );
          
          // Minimum displacement threshold (2 meters = 0.002 km) to filter static jitter
          if (distDelta >= 0.002) {
            setRoutePath((prev) => [...prev, currentPos]);
            setDistance((prev) => prev + distDelta);
            lastLocationRef.current = currentPos;

            // Stream real-time location to backend Anti-Cheat & Territory engine
            const speedKmH = location.speed ?? (distDelta / (1 / 3600)); // fall back to delta speed
            socket.emit('LOCATION_UPDATED', {
              latitude: currentPos[0],
              longitude: currentPos[1],
              speed: Math.max(0, speedKmH),
              activityType: activityType,
              runId: activeRunId
            });
          }
        } else {
          // First point of the run
          setRoutePath([currentPos]);
          lastLocationRef.current = currentPos;
        }
      }
    }
  }, [location, isRunning, isPaused, activeRunId, socket, activityType]);

  const handleStartRun = async () => {
    try {
      setIsProcessing(true);
      const run = await runService.startRun();
      setActiveRunId(run.id);
      setIsRunning(true);
      setIsPaused(false);
      setDistance(0);
      setDurationSeconds(0);
      setRoutePath([]);
      lastLocationRef.current = null;
      
      if (socket) {
        socket.emit('RUN_STARTED', { runId: run.id });
      }
    } catch (err) {
      console.error('Failed to start run:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStopRun = async () => {
    if (!activeRunId) return;
    const finishedRunId = activeRunId;
    try {
      setIsProcessing(true);
      setIsRunning(false);
      setIsPaused(false);
      lastLocationRef.current = null;
      
      if (socket) {
        socket.emit('RUN_ENDED', { runId: activeRunId });
      }
      
      await runService.endRun(activeRunId, activityType);
      
      // Refetch user stats (distance, territories) to update dashboard seamlessly
      const meRes = await authService.getMe();
      if (meRes.success && meRes.data) {
        setUser(meRes.data.user);
      }
      
      setActiveRunId(null);
      // Redirect immediately to the recorded path visualizer /run/[id] page
      router.push(`/run/${finishedRunId}`);
    } catch (err) {
      console.error('Failed to end run:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Telemetry Calculations
  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Current Pace (min/km)
  const getPaceString = () => {
    if (distance <= 0.01 || durationSeconds <= 0) return `--'--"` ;
    const paceDecimal = (durationSeconds / 60) / distance;
    if (paceDecimal > 60) return `--'--"`; // capped
    const paceMins = Math.floor(paceDecimal);
    const paceSecs = Math.round((paceDecimal - paceMins) * 60);
    return `${paceMins}'${paceSecs.toString().padStart(2, '0')}"`;
  };

  // Current Speed (km/h)
  const currentSpeed = location?.speed 
    ? location.speed.toFixed(1)
    : (distance > 0 && durationSeconds > 0 ? ((distance / durationSeconds) * 3600).toFixed(1) : '0.0');

  const getSignalBadgeColor = () => {
    switch (signalQuality) {
      case 'EXCELLENT': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'GOOD': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'FAIR': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative p-4 gap-4">
      {/* Header Overlay */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-md tracking-tight flex items-center gap-2">
            Live Tracker
          </h1>
          {gpsLoading && (
            <span className="text-xs font-medium text-[var(--color-primary)] animate-pulse border border-[var(--color-primary)]/50 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full">
              Finding GPS...
            </span>
          )}
          {!gpsLoading && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur ${getSignalBadgeColor()}`}>
              GPS {signalQuality}
            </span>
          )}
          {isConnected && (
            <span className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Sync
            </span>
          )}
        </div>
        {error ? (
          <p className="text-sm text-red-400 drop-shadow-sm max-w-sm bg-black/70 p-2 rounded-lg border border-red-500/30">{error}</p>
        ) : (
          <p className="text-sm text-gray-300 drop-shadow-sm">Real-time Strava-grade path recording & H3 territory conquest.</p>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]">
        <DynamicMap 
          center={mapCenter} 
          interactive={true} 
          routePath={routePath} 
          username={user?.username} 
          capturedTerritories={capturedTerritories} 
          trackColor="#FC4C02"
        />
      </div>

      {/* Telemetry Dashboard & Run Controls */}
      <Card className="glass-panel shrink-0 p-5 sticky bottom-4 shadow-2xl border-white/10">
        <CardContent className="p-0 flex flex-col gap-4">
          {/* Top Activity Selector (When Not Running) */}
          {!isRunning && (
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity Mode</span>
              <div className="flex items-center gap-2 bg-black/30 p-1 rounded-lg border border-white/5">
                {(['WALKING', 'RUNNING', 'CYCLING'] as ActivityType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActivityType(type)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activityType === type
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Telemetry Grid */}
          <div className="grid grid-cols-4 gap-4 text-center">
            {/* Timer */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <Timer className="w-3.5 h-3.5 text-sky-400" /> Time
              </span>
              <span className="text-2xl font-black tracking-tight text-white mt-1">{formatTimer(durationSeconds)}</span>
            </div>

            {/* Distance */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5 text-[#FC4C02]" /> Distance
              </span>
              <span className="text-2xl font-black tracking-tight text-[#FC4C02] mt-1">{distance.toFixed(2)} <span className="text-xs font-normal text-gray-400">km</span></span>
            </div>

            {/* Avg / Live Pace */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Pace
              </span>
              <span className="text-2xl font-black tracking-tight text-white mt-1">{getPaceString()} <span className="text-xs font-normal text-gray-400">/km</span></span>
            </div>

            {/* Live Speed */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Speed
              </span>
              <span className="text-2xl font-black tracking-tight text-white mt-1">{currentSpeed} <span className="text-xs font-normal text-gray-400">km/h</span></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            {!isRunning ? (
              <Button size="lg" className="rounded-full shadow-lg bg-[#FC4C02] hover:bg-[#e04300] text-white font-bold px-8" onClick={handleStartRun} disabled={isProcessing}>
                <Play className="h-5 w-5 mr-2 fill-current" />
                {isProcessing ? 'Starting...' : 'Start Workout'}
              </Button>
            ) : (
              <div className="flex items-center gap-3 w-full justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isPaused ? 'Paused' : 'Recording Path'}
                </span>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full border-white/20 hover:bg-white/10" 
                    onClick={handlePauseToggle} 
                    disabled={isProcessing}
                  >
                    {isPaused ? <Play className="h-5 w-5 mr-1 fill-current text-green-400" /> : <Pause className="h-5 w-5 mr-1 fill-current text-yellow-400" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>

                  <Button 
                    size="lg" 
                    variant="destructive" 
                    className="rounded-full shadow-lg font-bold px-6" 
                    onClick={handleStopRun} 
                    disabled={isProcessing}
                  >
                    <Square className="h-5 w-5 mr-2 fill-current" />
                    {isProcessing ? 'Saving...' : 'Finish'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
