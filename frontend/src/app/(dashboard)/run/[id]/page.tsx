'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { DynamicMap } from '@/components/map/dynamic-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Flame, Gauge, Navigation, Route, Trophy, Share2 } from 'lucide-react';
import { runService, RunDetailItem } from '@/services/run.api';
import { territoryService } from '@/services/territory.api';
import { useUserStore } from '@/store/useUserStore';
import { calculateDistance } from '@/lib/utils';

export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const runId = resolvedParams.id;
  const currentUser = useUserStore((state) => state.user);

  const [run, setRun] = useState<RunDetailItem | null>(null);
  const [capturedTerritories, setCapturedTerritories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [runDetails, territories] = await Promise.all([
          runService.getRunDetails(runId),
          territoryService.getMyTerritories().catch(() => [])
        ]);
        setRun(runDetails);
        setCapturedTerritories(territories.map(t => t.gridId));
      } catch (err: any) {
        console.error('Failed to load run details:', err);
        setError(err.message || 'Failed to fetch run details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
        <div className="w-10 h-10 border-4 border-[#FC4C02] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-medium">Reconstructing Recorded GPS Path...</p>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-400">Activity Not Found</h2>
        <p className="text-gray-400">{error || 'Could not load recorded activity path.'}</p>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Extract Route Path coordinates [lat, lng] array
  const routePath: [number, number][] = (run.locations || []).map((loc) => [loc.latitude, loc.longitude]);

  // Center map on middle point of routePath or first location
  const mapCenter: [number, number] = routePath.length > 0 
    ? routePath[Math.floor(routePath.length / 2)] 
    : [40.7128, -74.0060];

  // Duration Formatter
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m ${remainingSecs}s`;
    }
    return `${mins}m ${remainingSecs}s`;
  };

  // Average Pace
  const avgPaceString = () => {
    if (!run.distance || run.distance <= 0 || !run.duration) return `--'--"`;
    const paceDecimal = (run.duration / 60) / run.distance;
    const paceMins = Math.floor(paceDecimal);
    const paceSecs = Math.round((paceDecimal - paceMins) * 60);
    return `${paceMins}'${paceSecs.toString().padStart(2, '0')}" /km`;
  };

  // Average Speed (km/h)
  const avgSpeedKmH = run.duration > 0 ? ((run.distance / run.duration) * 3600).toFixed(1) : '0.0';

  // Activity Title generator
  const startDate = new Date(run.startTime);
  const hour = startDate.getHours();
  const activityTitle = hour >= 5 && hour < 12 
    ? 'Morning Run' 
    : hour >= 12 && hour < 17 
    ? 'Afternoon Workout' 
    : hour >= 17 && hour < 21 
    ? 'Evening Run' 
    : 'Night Conquest';

  // Calculate Kilometer Split Breakdown
  const splits: { km: number; splitTimeSecs: number; pace: string }[] = [];
  if (routePath.length > 1 && run.locations.length > 1) {
    let accDist = 0;
    let targetKm = 1.0;
    let prevTime = new Date(run.locations[0].timestamp).getTime();

    for (let i = 1; i < run.locations.length; i++) {
      const loc1 = run.locations[i - 1];
      const loc2 = run.locations[i];
      const stepDist = calculateDistance(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
      accDist += stepDist;

      if (accDist >= targetKm) {
        const currentTime = new Date(loc2.timestamp).getTime();
        const splitSecs = Math.max(1, Math.round((currentTime - prevTime) / 1000));
        const paceDecimal = splitSecs / 60; // 1km split
        const pMins = Math.floor(paceDecimal);
        const pSecs = Math.round((paceDecimal - pMins) * 60);
        
        splits.push({
          km: Math.floor(targetKm),
          splitTimeSecs: splitSecs,
          pace: `${pMins}'${pSecs.toString().padStart(2, '0')}"`,
        });

        targetKm += 1.0;
        prevTime = currentTime;
      }
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" className="rounded-full text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Overview
          </Button>
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FC4C02]/10 border border-[#FC4C02]/30 text-[#FC4C02] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FC4C02]" />
          Strava GPS Recorded Path
        </span>
      </div>

      {/* Header Profile & Title Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 glass-panel">
        <div>
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-1">
            <span className="font-semibold text-white">{currentUser?.username || 'Runner'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {startDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{activityTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FC4C02]/10 border border-[#FC4C02]/30 text-[#FC4C02] px-4 py-2 rounded-xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider block">XP Awarded</span>
            <span className="text-xl font-extrabold">+{run.xpEarned || 0} XP</span>
          </div>
        </div>
      </div>

      {/* Interactive Full Path Map */}
      <div className="h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
        <DynamicMap 
          center={mapCenter} 
          interactive={true} 
          routePath={routePath} 
          username={currentUser?.username} 
          capturedTerritories={capturedTerritories} 
          trackColor="#FC4C02"
        />
      </div>

      {/* Stat Summaries Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-panel border-l-4 border-l-[#FC4C02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Distance</CardTitle>
            <Navigation className="h-4 w-4 text-[#FC4C02]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{run.distance.toFixed(2)} <span className="text-sm font-normal text-gray-400">km</span></div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-sky-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Moving Time</CardTitle>
            <Clock className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{formatDuration(run.duration)}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-emerald-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Avg Pace</CardTitle>
            <Gauge className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{avgPaceString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-amber-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Avg Speed</CardTitle>
            <Flame className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{avgSpeedKmH} <span className="text-sm font-normal text-gray-400">km/h</span></div>
          </CardContent>
        </Card>
      </div>

      {/* KM Splits Table */}
      {splits.length > 0 && (
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-[#FC4C02]" />
              Kilometer Splits Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-white/10">
              <div className="grid grid-cols-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span>Kilometer</span>
                <span>Split Time</span>
                <span>Pace</span>
              </div>
              {splits.map((split) => (
                <div key={split.km} className="grid grid-cols-3 py-3 text-sm font-semibold text-white">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-xs text-[#FC4C02]">
                      {split.km}
                    </span>
                    Km {split.km}
                  </span>
                  <span className="text-gray-300">{formatDuration(split.splitTimeSecs)}</span>
                  <span className="text-emerald-400">{split.pace} /km</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
