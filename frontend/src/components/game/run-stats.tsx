'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ShieldAlert, Compass, Flame, Timer, Footprints } from 'lucide-react';

interface RunStatsProps {
  distance: number; // meters
  duration: number; // seconds
  speed: number; // m/s
  calories: number; // kcal
  xpEarned: number;
  territoriesCaptured: number;
}

export const RunStats: React.FC<RunStatsProps> = ({
  distance,
  duration,
  speed,
  calories,
  xpEarned,
  territoriesCaptured,
}) => {
  // Format seconds to HH:MM:SS timer
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${hrs > 0 ? pad(hrs) + ':' : ''}${pad(mins)}:${pad(secs)}`;
  };

  // Convert m/s speed to Pace min/km
  const getPace = (speedMs: number) => {
    if (speedMs <= 0.2) return '--:--';
    const paceMinPerKm = (1000 / speedMs) / 60;
    const mins = Math.floor(paceMinPerKm);
    const secs = Math.floor((paceMinPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')} /km`;
  };

  const formattedDistance = distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`;

  return (
    <Card className="w-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl rounded-xl">
      <CardContent className="grid grid-cols-3 gap-4 p-5 text-center divide-x divide-white/5">
        {/* Distance Stat */}
        <div className="flex flex-col items-center">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mb-2 border border-cyan-500/20">
            <Footprints className="h-4 w-4" />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Distance</p>
          <h4 className="text-lg font-bold text-white font-mono mt-0.5 truncate w-full">
            {formattedDistance}
          </h4>
        </div>

        {/* Duration Stat */}
        <div className="flex flex-col items-center pl-2">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mb-2 border border-purple-500/20">
            <Timer className="h-4 w-4" />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
          <h4 className="text-lg font-bold text-white font-mono mt-0.5 truncate w-full">
            {formatTime(duration)}
          </h4>
        </div>

        {/* Calories Burned Stat */}
        <div className="flex flex-col items-center pl-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
            <Flame className="h-4 w-4" />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Calories</p>
          <h4 className="text-lg font-bold text-white font-mono mt-0.5 truncate w-full">
            {Math.round(calories)} kcal
          </h4>
        </div>
      </CardContent>

      {/* Gameplay Stats Panel */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/10 px-5 py-3 bg-white/2 rounded-b-xl text-center">
        <p className="text-[10px] font-semibold text-slate-300 flex items-center justify-center gap-1">
          <Compass className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          Captured: <span className="font-bold text-white font-mono">{territoriesCaptured} hexes</span>
        </p>
        <p className="text-[10px] font-semibold text-slate-300 flex items-center justify-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          Gained: <span className="font-bold text-white font-mono">+{xpEarned} XP</span>
        </p>
      </div>
    </Card>
  );
};
export default RunStats;
