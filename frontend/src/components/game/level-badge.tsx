'use client';

import React from 'react';
import { Progress } from '../ui/progress';
import { Trophy } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
  xp: number;
}

// Gameplay Level Threshold Definitions (aligned with backend src/config/constants.ts)
const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: 'Beginner' },
  { level: 5, xpRequired: 500, title: 'Runner' },
  { level: 10, xpRequired: 2000, title: 'Explorer' },
  { level: 25, xpRequired: 10000, title: 'Champion' },
  { level: 50, xpRequired: 50000, title: 'Territory King' },
  { level: 100, xpRequired: 200000, title: 'Legend' },
];

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, xp }) => {
  // Find current and next level configurations
  const currentConfig = [...LEVEL_THRESHOLDS].reverse().find((t) => xp >= t.xpRequired) || LEVEL_THRESHOLDS[0];
  const currentLevelIndex = LEVEL_THRESHOLDS.findIndex((t) => t.level === currentConfig.level);
  
  const nextConfig =
    currentLevelIndex < LEVEL_THRESHOLDS.length - 1
      ? LEVEL_THRESHOLDS[currentLevelIndex + 1]
      : { level: 999, xpRequired: 9999999, title: 'Godlike' };

  // Calculate percentage toward next milestone
  const prevRequired = currentConfig.xpRequired;
  const nextRequired = nextConfig.xpRequired;
  
  const range = nextRequired - prevRequired;
  const currentProgress = xp - prevRequired;
  
  const percent = Math.min(Math.max((currentProgress / range) * 100, 0), 100);

  return (
    <div className="w-full border border-white/10 bg-white/5 backdrop-blur-md p-4 rounded-xl shadow-xl flex items-center gap-4">
      {/* Level Emblem Ring */}
      <div className="shrink-0 flex items-center justify-center relative w-12 h-12 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
        <Trophy className="h-5 w-5" />
        <span className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 bg-purple-600 rounded-full border border-white/10 text-white font-mono shadow-sm">
          {level}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{currentConfig.title}</h4>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            {xp.toLocaleString()} / {nextRequired.toLocaleString()} XP
          </span>
        </div>

        {/* Progress Bar indicator */}
        <Progress value={percent} className="mt-2" />
        <p className="text-[9px] text-slate-400 mt-1">
          {Math.round(nextRequired - xp).toLocaleString()} XP needed to level up
        </p>
      </div>
    </div>
  );
};
export default LevelBadge;
