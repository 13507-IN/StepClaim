'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StreakIndicatorProps {
  streak: number;
  className?: string;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak, className }) => {
  const active = streak > 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all duration-300',
        active
          ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)] hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]'
          : 'bg-white/5 border-white/5 text-slate-500',
        className,
      )}
    >
      <Flame className={cn('h-4 w-4', active && 'animate-pulse fill-orange-500')} />
      <span>{streak} {streak === 1 ? 'Day' : 'Days'}</span>
    </div>
  );
};
export default StreakIndicator;
