'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DynamicMap } from '@/components/map/dynamic-map';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, Gauge, Timer, Flame, Navigation, Footprints, Settings2 } from 'lucide-react';
import { useGPS } from '@/hooks/useGPS';
import { calculateDistance } from '@/lib/utils';

import { useRouter } from 'next/navigation';
import { useUserStore, calculateSteps, calculateCalories, calculateStepLength } from '@/store/useUserStore';
import { BodyProfileModal } from '@/components/profile/body-profile-modal';
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
  const [startError, setStartError] = useState<string | null>(null);

  const [capturedTerritories, setCapturedTerritories] = useState<string[]>([]);
  const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);

  // Request GPS when component mounts
  const { location, error, loading: gpsLoading, signalQuality } = useGPS(true);
  const estimatedSpeedKmh =
    location && location.accuracy <= 100 ? location.speed : null;
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

  // Screen Wake Lock API to prevent mobile phone screen from sleeping and halting GPS
  useEffect(() => {
    let wakeLock: any = null;

    async function acquireLock() {
      if (typeof window !== 'undefined' && 'wakeLock' in navigator && isRunning && !isPaused) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch {
          // Wake lock unavailable or denied
        }
      }
    }

    void acquireLock();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        void acquireLock();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [isRunning, isPaused]);

  // Update map center automatically whenever GPS gets a new live location
  // Filter accuracy & distance noise before appending to route path
  useEffect(() => {
    if (location) {
      const currentPos: [number, number] = [location.latitude, location.longitude];
      // Mobile GPS Noise Filter: Accept coordinates up to 100 meters (standard smartphone GPS accuracy in cities)
      if (location.accuracy > 100) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[GPS] Dropped: accuracy ${location.accuracy.toFixed(0)}m > 100m threshold`);
        }
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
            runService.sendLocation(locationPayload)
              .then((data: any) => {
                if (data?.captureResult?.captured && data.captureResult.gridId) {
                  setCapturedTerritories((prev) =>
                    prev.includes(data.captureResult.gridId) ? prev : [...prev, data.captureResult.gridId]
                  );
                }
              })
              .catch(console.error);
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
      setStartError(null);
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
    } catch (err: any) {
      console.error('Failed to start run:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to start workout. Please check your connection.';
      setStartError(msg);
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

  const userHeight = user?.height || 175;
  const userWeight = user?.weight || 70;
  const liveSteps = calculateSteps(distance, userHeight, activityTypeRef.current);
  const liveCalories = calculateCalories(distance, userWeight, activityTypeRef.current);
  const strideLengthMeters = calculateStepLength(userHeight, activityTypeRef.current);

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem-4.5rem)] md:h-full w-full relative p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
      {/* Top Floating Controls Bar (Avoids top-left zoom controls, sleek & non-overlapping) */}
      <div className="absolute top-3 left-14 right-3 z-[400] flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {gpsLoading ? (
            <span className="text-[11px] font-semibold text-[var(--color-primary)] animate-pulse border border-[var(--color-primary)]/40 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg">
              Acquiring GPS…
            </span>
          ) : (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-lg ${getSignalBadgeColor()}`}>
              GPS {signalQuality}
            </span>
          )}

          {isConnected && (
            <span className="text-[11px] font-semibold text-emerald-400 border border-emerald-500/30 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          )}
        </div>

        {/* Body Profile / Stride pill */}
        <button
          onClick={() => setIsBodyModalOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 text-[11px] font-semibold bg-black/80 hover:bg-black/95 text-gray-200 border border-white/15 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg transition-colors cursor-pointer"
          title="Click to customize height & weight for stride calibration"
        >
          <Footprints className="w-3.5 h-3.5 text-amber-400" />
          <span>{Math.round(strideLengthMeters * 100)}cm stride</span>
          <Settings2 className="w-3 h-3 text-gray-400 ml-0.5" />
        </button>
      </div>

      {/* Warning & Alerts floating container */}
      {(vehicleWarningActive || stopError || error) && (
        <div className="absolute top-12 inset-x-4 z-[400] flex flex-col gap-1.5 pointer-events-none items-center">
          {vehicleWarningActive && (
            <div
              role="alert"
              className="pointer-events-auto max-w-sm w-full rounded-xl border border-red-500/50 bg-red-950/95 px-3 py-2 text-xs font-bold text-red-100 shadow-2xl backdrop-blur"
            >
              ⚠️ Vehicle speed detected ({estimatedSpeedKmh?.toFixed(1)} km/h). Slow down.
              {vehicleAlertCount < 3
                ? ` (${vehicleAlertCount}/3 warnings)`
                : ' Stopping workout…'}
            </div>
          )}
          {stopError && (
            <div role="alert" className="pointer-events-auto max-w-sm w-full rounded-xl border border-red-500/40 bg-black/90 px-3 py-2 text-xs text-red-300 backdrop-blur">
              {stopError}
            </div>
          )}
          {error && (
            <div className="pointer-events-auto max-w-sm w-full text-xs text-red-400 bg-black/90 p-2 rounded-xl border border-red-500/30 backdrop-blur">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 w-full min-h-[220px] relative rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]">
        <DynamicMap 
          center={mapCenter} 
          interactive={true} 
          routePath={routePath} 
          username={user?.username} 
          capturedTerritories={capturedTerritories} 
          trackColor="#FC4C02"
          accuracy={location?.accuracy}
        />
      </div>

      {/* Telemetry Dashboard & Run Controls */}
      <Card className="glass-panel shrink-0 p-3 md:p-4 shadow-2xl border-white/10 rounded-2xl">
        <CardContent className="p-0 flex flex-col gap-3">
          {/* Top Activity Selector & Status Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            {!isRunning && !activeRunId ? (
              <>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Mode</span>
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                  {(['WALKING', 'RUNNING', 'CYCLING'] as ActivityType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActivityType(type)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        activityType === type
                          ? 'bg-[var(--color-primary)] text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isPaused ? 'Workout Paused' : 'Recording Path'}
                </span>

                <span className="text-[11px] font-semibold text-gray-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {activityType}
                </span>
              </div>
            )}
          </div>

          {/* Primary Hero Metrics: Steps & Distance */}
          <div className="grid grid-cols-2 gap-2 text-center bg-black/30 p-2.5 rounded-xl border border-white/5">
            {/* Live Steps */}
            <div className="flex flex-col items-center justify-center border-r border-white/10 pr-2">
              <span className="text-[10px] md:text-xs font-semibold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                <Footprints className="w-3.5 h-3.5 text-amber-400" /> Footsteps
              </span>
              <span className="text-2xl md:text-3xl font-black tracking-tight text-white mt-0.5 font-mono">
                {liveSteps.toLocaleString()}
              </span>
              <span className="text-[9px] text-gray-400">
                ~{Math.round(strideLengthMeters * 100)}cm stride
              </span>
            </div>

            {/* Distance */}
            <div className="flex flex-col items-center justify-center pl-2">
              <span className="text-[10px] md:text-xs font-semibold text-[#FC4C02] flex items-center gap-1 uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5 text-[#FC4C02]" /> Distance
              </span>
              <span className="text-2xl md:text-3xl font-black tracking-tight text-[#FC4C02] mt-0.5 font-mono">
                {distance.toFixed(2)} <span className="text-xs font-normal text-gray-400">km</span>
              </span>
              <span className="text-[9px] text-gray-400">
                {(distance * 1000).toFixed(0)} meters
              </span>
            </div>
          </div>

          {/* Secondary Telemetry: 4 balanced compact columns */}
          <div className="grid grid-cols-4 gap-1.5 text-center py-0.5">
            {/* Timer */}
            <div className="flex flex-col items-center bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
              <span className="text-[9px] md:text-[10px] font-medium text-gray-400 flex items-center gap-0.5 uppercase tracking-wider">
                <Timer className="w-2.5 h-2.5 text-sky-400" /> Time
              </span>
              <span className="text-sm md:text-base font-bold text-white mt-0.5 font-mono">
                {formatTimer(durationSeconds)}
              </span>
            </div>

            {/* Pace */}
            <div className="flex flex-col items-center bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
              <span className="text-[9px] md:text-[10px] font-medium text-gray-400 flex items-center gap-0.5 uppercase tracking-wider">
                <Gauge className="w-2.5 h-2.5 text-emerald-400" /> Pace
              </span>
              <span className="text-sm md:text-base font-bold text-white mt-0.5 font-mono">
                {getPaceString()}
              </span>
            </div>

            {/* Live Speed */}
            <div className="flex flex-col items-center bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
              <span className="text-[9px] md:text-[10px] font-medium text-gray-400 flex items-center gap-0.5 uppercase tracking-wider">
                <Flame className="w-2.5 h-2.5 text-amber-400" /> Speed
              </span>
              <span className="text-sm md:text-base font-bold text-white mt-0.5 font-mono">
                {currentSpeed} <span className="text-[9px] text-gray-400 font-normal">km/h</span>
              </span>
            </div>

            {/* Live Calories */}
            <div className="flex flex-col items-center bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
              <span className="text-[9px] md:text-[10px] font-medium text-rose-400 flex items-center gap-0.5 uppercase tracking-wider">
                <Flame className="w-2.5 h-2.5 text-rose-400" /> Cal
              </span>
              <span className="text-sm md:text-base font-bold text-white mt-0.5 font-mono">
                {liveCalories} <span className="text-[9px] text-gray-400 font-normal">kcal</span>
              </span>
            </div>
          </div>

          {/* Start Error Feedback */}
          {startError && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg text-center font-medium">
              ⚠️ {startError}
            </div>
          )}

          {/* Action Buttons (Touch-friendly, full width, no mobile overlap) */}
          <div className="pt-1">
            {!isRunning ? (
              activeRunId ? (
                <Button 
                  size="lg" 
                  variant="destructive" 
                  className="w-full h-11 rounded-xl shadow-lg font-bold text-sm" 
                  onClick={handleStopRun} 
                  disabled={isProcessing}
                >
                  <Square className="h-4 w-4 mr-2 fill-current" />
                  {isProcessing ? 'Saving Workout…' : 'Retry Finish'}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full h-12 rounded-xl shadow-lg bg-[#FC4C02] hover:bg-[#e04300] text-white font-black text-base transition-all" 
                  onClick={handleStartRun} 
                  disabled={isProcessing}
                >
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  {isProcessing ? 'Starting Tracker…' : 'Start Workout'}
                </Button>
              )
            ) : (
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-11 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 font-bold text-sm" 
                  onClick={handlePauseToggle} 
                  disabled={isProcessing}
                >
                  {isPaused ? <Play className="h-4 w-4 mr-1.5 fill-current text-green-400" /> : <Pause className="h-4 w-4 mr-1.5 fill-current text-yellow-400" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>

                <Button 
                  size="lg" 
                  variant="destructive" 
                  className="h-11 rounded-xl shadow-lg font-bold bg-rose-600 hover:bg-rose-700 text-white text-sm" 
                  onClick={handleStopRun} 
                  disabled={isProcessing}
                >
                  <Square className="h-4 w-4 mr-1.5 fill-current" />
                  {isProcessing ? 'Saving…' : 'Finish'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Body Profile Calibration Modal */}
      <BodyProfileModal 
        isOpen={isBodyModalOpen} 
        onClose={() => setIsBodyModalOpen(false)} 
      />
    </div>
  );
}
