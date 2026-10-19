'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DynamicMap } from '@/components/map/dynamic-map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, Gauge, Timer, Flame, Navigation } from 'lucide-react';
import { useGPS } from '@/hooks/useGPS';
import { calculateDistance } from '@/lib/utils';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useSocket } from '@/hooks/useSocket';
import { runService } from '@/services/run.api';
import { authService } from '@/services/auth.api';

type ActivityType = 'WALKING' | 'RUNNING' | 'CYCLING';
type ActivityEstimate = ActivityType | 'STATIONARY' | 'VEHICLE' | 'UNKNOWN';

const VEHICLE_SPEED_THRESHOLD_KMH = 45;
const VEHICLE_ALERT_INTERVAL_MS = 10_000;
const GPS_SAMPLE_MAX_AGE_MS = 5_000;

function estimateActivity(speedKmh: number | null): ActivityEstimate {
  if (speedKmh === null || !Number.isFinite(speedKmh)) return 'UNKNOWN';
  if (speedKmh >= VEHICLE_SPEED_THRESHOLD_KMH) return 'VEHICLE';
  if (speedKmh >= 20) return 'CYCLING';
  if (speedKmh >= 8) return 'RUNNING';
  if (speedKmh >= 1) return 'WALKING';
  return 'STATIONARY';
}

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
  const [vehicleWarningActive, setVehicleWarningActive] = useState(false);
  const [vehicleAlertCount, setVehicleAlertCount] = useState(0);
  const [stopError, setStopError] = useState<string | null>(null);

  const [capturedTerritories, setCapturedTerritories] = useState<string[]>([]);

  // Request GPS when component mounts
  const { location, error, loading: gpsLoading, signalQuality } = useGPS(true);
  const estimatedSpeedKmh =
    location && location.accuracy <= 30 ? location.speed : null;
  const mapCenter: [number, number] = location
    ? [location.latitude, location.longitude]
    : [28.6139, 77.2090]; // New Delhi fallback
  
  // Ref to hold the last processed location to calculate distance deltas
  const lastLocationRef = useRef<[number, number] | null>(null);
  const latestSpeedSampleRef = useRef<{
    speedKmh: number | null;
    receivedAt: number;
  } | null>(null);
  const activityTypeRef = useRef(activityType);
  const activityCandidateRef = useRef<{ type: ActivityType; count: number } | null>(null);
  const vehicleSinceRef = useRef<number | null>(null);
  const vehicleAlertCountRef = useRef(0);
  const autoStopTriggeredRef = useRef(false);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopInProgressRef = useRef(false);

  useEffect(() => {
    activityTypeRef.current = activityType;
  }, [activityType]);

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
      // Strava GPS Noise Filter: Ignore coordinates with low accuracy (> 30 meters)
      if (location.accuracy > 30) {
        latestSpeedSampleRef.current = null;
        return;
      }

      latestSpeedSampleRef.current = {
        speedKmh: estimatedSpeedKmh,
        receivedAt: Date.now(),
      };

      const speedActivity = estimateActivity(estimatedSpeedKmh);
      if (isRunning && !isPaused && activeRunId && (
        speedActivity === 'WALKING' ||
        speedActivity === 'RUNNING' ||
        speedActivity === 'CYCLING'
      )) {
        const candidate = activityCandidateRef.current;
        const count = candidate?.type === speedActivity ? candidate.count + 1 : 1;
        activityCandidateRef.current = { type: speedActivity, count };
        if (count >= 2 && activityTypeRef.current !== speedActivity) {
          activityTypeRef.current = speedActivity;
          setActivityType(speedActivity);
          activityCandidateRef.current = null;
        }
      } else {
        activityCandidateRef.current = null;
      }

      if (isRunning && !isPaused && activeRunId) {
        if (autoStopTriggeredRef.current) return;
        // Do not submit vehicle-speed fixes for territory capture or workout
        // distance. The run remains active during the warning period.
        if (
          estimatedSpeedKmh !== null &&
          estimatedSpeedKmh >= VEHICLE_SPEED_THRESHOLD_KMH
        ) {
          lastLocationRef.current = currentPos;
          return;
        }

        const locationPayload = {
          latitude: currentPos[0],
          longitude: currentPos[1],
          accuracy: location.accuracy,
          speed: Math.max(0, estimatedSpeedKmh ?? 0),
          activityType: activityTypeRef.current,
          runId: activeRunId,
        };

        const sendUpdate = () => {
          if (socket && isConnected) {
            socket.emit('LOCATION_UPDATED', locationPayload);
          } else {
            runService.sendLocation(locationPayload).catch(console.error);
          }
        };

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
            sendUpdate();
          }
        } else {
          // First point of the run
          setRoutePath([currentPos]);
          lastLocationRef.current = currentPos;
          sendUpdate();
        }
      }
    }
  }, [location, estimatedSpeedKmh, isRunning, isPaused, activeRunId, socket, isConnected]);

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
      latestSpeedSampleRef.current = null;
      vehicleSinceRef.current = null;
      vehicleAlertCountRef.current = 0;
      autoStopTriggeredRef.current = false;
      stopInProgressRef.current = false;
      activityCandidateRef.current = null;
      setVehicleWarningActive(false);
      setVehicleAlertCount(0);
      setStopError(null);
      
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

  const handleStopRun = useCallback(async () => {
    if (!activeRunId || stopInProgressRef.current) return;
    stopInProgressRef.current = true;
    setStopError(null);
    const finishedRunId = activeRunId;
    try {
      setIsProcessing(true);
      setIsRunning(false);
      setIsPaused(false);
      lastLocationRef.current = null;
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }
      
      if (socket) {
        socket.emit('RUN_ENDED', { runId: activeRunId });
      }
      
      await runService.endRun(activeRunId, activityTypeRef.current);
      setActiveRunId(null);
      
      // Refetch user stats (distance, territories) to update dashboard seamlessly
      try {
        const meRes = await authService.getMe();
        if (meRes.success && meRes.data) {
          setUser(meRes.data.user);
        }
      } catch (err) {
        console.error('Run saved, but user stats could not be refreshed:', err);
      }
      
      // Redirect immediately to the recorded path visualizer /run/[id] page
      router.push(`/run/${finishedRunId}`);
    } catch (err) {
      console.error('Failed to end run:', err);
      setStopError('Could not save this workout. Check your connection and retry finishing.');
    } finally {
      setIsProcessing(false);
      stopInProgressRef.current = false;
    }
  }, [activeRunId, socket, setUser, router]);

  // Treat speed as a heuristic: label the activity, warn at sustained
  // vehicle-like speed, and stop after three 10-second warnings.
  useEffect(() => {
    if (!isRunning || isPaused || !activeRunId) {
      if (!autoStopTriggeredRef.current) {
        vehicleSinceRef.current = null;
        vehicleAlertCountRef.current = 0;
        setVehicleWarningActive(false);
        setVehicleAlertCount(0);
      }
      return;
    }

    const monitor = setInterval(() => {
      if (autoStopTriggeredRef.current) return;

      const sample = latestSpeedSampleRef.current;
      const now = Date.now();
      const isVehicleSpeed =
        sample !== null &&
        sample.speedKmh !== null &&
        sample.speedKmh >= VEHICLE_SPEED_THRESHOLD_KMH &&
        now - sample.receivedAt <= GPS_SAMPLE_MAX_AGE_MS;

      if (!isVehicleSpeed) {
        vehicleSinceRef.current = null;
        vehicleAlertCountRef.current = 0;
        setVehicleWarningActive(false);
        setVehicleAlertCount(0);
        return;
      }

      if (vehicleSinceRef.current === null) {
        vehicleSinceRef.current = now;
      }
      setVehicleWarningActive(true);

      const elapsedMs = now - vehicleSinceRef.current;
      const alertsDue = Math.min(
        3,
        Math.floor(elapsedMs / VEHICLE_ALERT_INTERVAL_MS),
      );
      while (vehicleAlertCountRef.current < alertsDue) {
        vehicleAlertCountRef.current += 1;
        setVehicleAlertCount(vehicleAlertCountRef.current);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([250, 150, 250]);
        }
      }

      if (vehicleAlertCountRef.current >= 3) {
        autoStopTriggeredRef.current = true;
        autoStopTimeoutRef.current = setTimeout(() => {
          void handleStopRun();
        }, 900);
      }
    }, 250);

    return () => clearInterval(monitor);
  }, [isRunning, isPaused, activeRunId, handleStopRun]);

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
  const currentSpeed = estimatedSpeedKmh !== null
    ? estimatedSpeedKmh.toFixed(1)
    : (distance > 0 && durationSeconds > 0 ? ((distance / durationSeconds) * 3600).toFixed(1) : '0.0');
  const activityEstimate = estimateActivity(estimatedSpeedKmh);
  const activityEstimateLabel = activityEstimate === 'UNKNOWN'
    ? 'Waiting for GPS'
    : activityEstimate === 'STATIONARY'
      ? 'Stationary / unclear'
      : activityEstimate === 'VEHICLE'
        ? 'Vehicle-like speed'
        : activityEstimate.charAt(0) + activityEstimate.slice(1).toLowerCase();

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
        <p className="w-fit rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-medium text-gray-200 backdrop-blur">
          Speed-based estimate: <span className="font-bold text-white">{activityEstimateLabel}</span>
        </p>
        <p className="text-xs text-gray-400">
          Speed-only estimate; a very fast cyclist may be mistaken for a vehicle.
        </p>
        {vehicleWarningActive && (
          <p
            role="alert"
            aria-live="assertive"
            className="max-w-md rounded-xl border border-red-400/60 bg-red-950/90 px-4 py-3 text-sm font-bold text-red-100 shadow-xl"
          >
            Vehicle-like speed detected ({estimatedSpeedKmh?.toFixed(1)} km/h). Slow down.
            {vehicleAlertCount < 3
              ? ` Alert ${vehicleAlertCount} of 3; another warning comes every 10 seconds.`
              : ' Three warnings reached — stopping your workout…'}
          </p>
        )}
        {stopError && (
          <p role="alert" className="max-w-md rounded-lg border border-red-500/40 bg-black/80 px-3 py-2 text-sm text-red-300">
            {stopError}
          </p>
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
          {!isRunning && !activeRunId && (
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
              activeRunId ? (
                <Button size="lg" variant="destructive" className="rounded-full shadow-lg font-bold px-6" onClick={handleStopRun} disabled={isProcessing}>
                  <Square className="h-5 w-5 mr-2 fill-current" />
                  {isProcessing ? 'Saving...' : 'Retry Finish'}
                </Button>
              ) : (
                <Button size="lg" className="rounded-full shadow-lg bg-[#FC4C02] hover:bg-[#e04300] text-white font-bold px-8" onClick={handleStartRun} disabled={isProcessing}>
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  {isProcessing ? 'Starting...' : 'Start Workout'}
                </Button>
              )
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
