'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Award, Flame, Moon, Sun, Shield, Compass, Navigation, Zap, Map } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface BadgeCardProps {
  name: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  delay?: number;
}

// Map textual database icon tags to glorious lucide icons and color configurations
const iconMap: Record<string, { icon: any; colorClass: string; glowClass: string }> = {
  Marathoner: {
    icon: Shield,
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    glowClass: 'shadow-rose-500/10 hover:border-rose-500/40 border-rose-500/20 hover:shadow-rose-500/10 hover:shadow-lg',
  },
  'Territory King': {
    icon: Map,
    colorClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    glowClass: 'shadow-yellow-500/10 hover:border-yellow-500/40 border-yellow-500/20 hover:shadow-yellow-500/10 hover:shadow-lg',
  },
  Explorer: {
    icon: Compass,
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'shadow-cyan-500/10 hover:border-cyan-500/40 border-cyan-500/20 hover:shadow-cyan-500/10 hover:shadow-lg',
  },
  '7 Day Streak': {
    icon: Flame,
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    glowClass: 'shadow-orange-500/10 hover:border-orange-500/40 border-orange-500/20 hover:shadow-orange-500/10 hover:shadow-lg',
  },
  'Speed Runner': {
    icon: Zap,
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    glowClass: 'shadow-purple-500/10 hover:border-purple-500/40 border-purple-500/20 hover:shadow-purple-500/10 hover:shadow-lg',
  },
  'Night Runner': {
    icon: Moon,
    colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'shadow-indigo-500/10 hover:border-indigo-500/40 border-indigo-500/20 hover:shadow-indigo-500/10 hover:shadow-lg',
  },
  'Early Bird': {
    icon: Sun,
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    glowClass: 'shadow-amber-500/10 hover:border-amber-500/40 border-amber-500/20 hover:shadow-amber-500/10 hover:shadow-lg',
  },
  '100km Club': {
    icon: Navigation,
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'shadow-emerald-500/10 hover:border-emerald-500/40 border-emerald-500/20 hover:shadow-emerald-500/10 hover:shadow-lg',
  },
  'First Capture': {
    icon: Award,
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    glowClass: 'shadow-blue-500/10 hover:border-blue-500/40 border-blue-500/20 hover:shadow-blue-500/10 hover:shadow-lg',
  },
};

export const BadgeCard: React.FC<BadgeCardProps> = ({
  name,
  description,
  iconName,
  unlocked,
  unlockedAt,
  delay = 0,
}) => {
  const config = iconMap[name] || {
    icon: Award,
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'shadow-cyan-500/10 hover:border-cyan-500/40',
  };

  const Icon = config.icon;
  const dateStr = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="w-full"
    >
      <Card
        className={cn(
          'transition-all duration-300 relative border border-white/5 bg-white/3 overflow-hidden group select-none',
          unlocked ? config.glowClass : 'opacity-40 filter grayscale hover:opacity-50',
        )}
      >
        {/* Glow backdrop behind badge */}
        {unlocked && (
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-linear-to-br from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        )}

        <CardContent className="flex flex-col items-center text-center p-5 space-y-3">
          {/* Badge Icon */}
          <div className={cn('p-4 rounded-full border shadow-inner transition-transform duration-500 group-hover:rotate-12', config.colorClass)}>
            <Icon className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-wide">{name}</h4>
            <p className="text-[11px] text-slate-400 leading-snug font-medium max-w-[150px] mx-auto">
              {description}
            </p>
          </div>

          {unlocked && dateStr && (
            <p className="text-[9px] font-mono text-slate-500 mt-2 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              Earned: {dateStr}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default BadgeCard;
