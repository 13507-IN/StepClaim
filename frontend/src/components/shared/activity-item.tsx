'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Check, Flame, Trophy, MapPin, Footprints, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItemProps {
  activity: {
    id: string;
    activityType: 'CAPTURE' | 'RUN_COMPLETED' | 'STREAK_MILESTONE' | 'LEVEL_UP' | 'BADGE_UNLOCKED';
    xpGained: number;
    distance?: number;
    createdAt: string;
    user: {
      username: string;
      avatarUrl: string | null;
      level: number;
    };
  };
  delay?: number;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, delay = 0 }) => {
  const { user, activityType, xpGained, distance, createdAt } = activity;

  // Determine Icon and color accents based on Activity Type
  const getConfig = () => {
    switch (activityType) {
      case 'CAPTURE':
        return {
          icon: MapPin,
          colorClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
          message: 'Captured a territory sector grid!',
          detail: `Sector hex. Earned +${xpGained} XP.`,
        };
      case 'RUN_COMPLETED':
        const distKm = distance ? (distance / 1000).toFixed(2) : '0.00';
        return {
          icon: Footprints,
          colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
          message: 'Completed a workout session!',
          detail: `Distance: ${distKm} km. Earned +${xpGained} XP.`,
        };
      case 'STREAK_MILESTONE':
        return {
          icon: Flame,
          colorClass: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
          message: 'Maintained their daily exercise streak!',
          detail: '1km target complete. Streak expanded!',
        };
      case 'LEVEL_UP':
        return {
          icon: Trophy,
          colorClass: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
          message: `Leveled up!`,
          detail: `Expanded capabilities and stats.`,
        };
      case 'BADGE_UNLOCKED':
        return {
          icon: Award,
          colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
          message: 'Unlocked an achievement badge!',
          detail: 'Earned special recognition.',
        };
      default:
        return {
          icon: Check,
          colorClass: 'text-slate-400 border-white/10 bg-white/5',
          message: 'Action completed',
          detail: '',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const timeStr = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date(createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="w-full"
    >
      <Card className="border border-white/5 bg-white/3 hover:border-white/10 transition-all duration-300">
        <CardContent className="flex items-start gap-4 p-4">
          {/* User Avatar */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>

          {/* Feed Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white truncate">
                {user.username}
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Lvl {user.level}
                </span>
              </p>
              <p className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                {dateStr} {timeStr}
              </p>
            </div>
            
            <p className="text-sm text-slate-200 mt-1 font-medium">{config.message}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{config.detail}</p>
          </div>

          {/* Activity Category Badge Icon */}
          <div className={`p-2.5 rounded-lg border shrink-0 ${config.colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default ActivityItem;
