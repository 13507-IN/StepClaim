'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileService } from '@/services/profile.service';
import { StatsCard } from '@/components/shared/stats-card';
import { LevelBadge } from '@/components/game/level-badge';
import { BadgeCard } from '@/components/shared/badge-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Footprints, Flame, MapPin, Award, History } from 'lucide-react';
import { motion } from 'framer-motion';

const ALL_BADGES = [
  { name: 'First Capture', description: 'Captured their very first hexagonal territory', icon: 'First Capture' },
  { name: 'Explorer', description: 'Captured 10 hex sectors or reached Level 10', icon: 'Explorer' },
  { name: 'Territory King', description: 'Captured 50 hex sectors or reached Level 50', icon: 'Territory King' },
  { name: '100km Club', description: 'Accumulated 100 kilometers of total distance', icon: '100km Club' },
  { name: '7 Day Streak', description: 'Maintained their daily movement streak for 7 consecutive days', icon: '7 Day Streak' },
  { name: 'Marathoner', description: 'Completed a single run of 42.195 km or more', icon: 'Marathoner' },
  { name: 'Speed Runner', description: 'Exceeded an average speed of 5.5 m/s in a single run', icon: 'Speed Runner' },
  { name: 'Night Runner', description: 'Completed an exercise session between 10 PM and 4 AM', icon: 'Night Runner' },
  { name: 'Early Bird', description: 'Completed an exercise session between 5 AM and 8 AM', icon: 'Early Bird' },
];

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  // Query consolidate user details, badges, and run history
  const { data, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const res = await profileService.getProfile(userId);
      return res.data;
    },
    enabled: !!userId,
  });

  const formattedDistance = data?.user?.totalDistance
    ? data.user.totalDistance >= 1000
      ? `${(data.user.totalDistance / 1000).toFixed(2)} km`
      : `${Math.round(data.user.totalDistance)} m`
    : '0.0 km';

  // Check if a badge has been earned
  const getBadgeEarnedData = (badgeName: string) => {
    const earned = data?.badges?.find((b) => b.name === badgeName);
    return earned
      ? { unlocked: true, unlockedAt: earned.unlockedAt }
      : { unlocked: false };
  };

  return (
    <div className="space-y-8">
      {/* ─── Profile Card Emblem Header ────────────────────────────────────────── */}
      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden rounded-2xl">
          {/* Accent Glow Backdrops */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-linear-to-br from-cyan-500 to-purple-600 rounded-full blur-3xl opacity-20"></div>

          <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-5 p-6 relative z-10 text-center md:text-left">
            {/* User Avatar */}
            <Avatar className="h-20 w-20 border-2 border-cyan-500/20 shadow-lg shrink-0">
              <AvatarImage src={data?.user?.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">{data?.user?.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                  {data?.user?.username}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    Level {data?.user?.level}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-semibold">Active Sector Conqueror</p>
              </div>

              <p className="text-[11px] text-slate-500 font-mono">
                Enlisted since: {new Date(data?.user?.createdAt || '').toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Level Progression Banner ─────────────────────────────────────────── */}
      {!isLoading && <LevelBadge level={data?.user?.level || 1} xp={data?.user?.xp || 0} />}

      {/* ─── Consolidated Stats Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-24 w-full rounded-xl" />)
        ) : (
          <>
            <StatsCard label="Distance Tracked" value={formattedDistance} icon={Footprints} iconColorClass="text-emerald-400" />
            <StatsCard label="Hexes Snapped" value={data?.territoriesCount || 0} icon={MapPin} iconColorClass="text-cyan-400" />
            <StatsCard label="Activity Streak" value={data?.user?.streak || 0} icon={Flame} iconColorClass="text-orange-500 animate-pulse" />
            <StatsCard label="Badges Earned" value={data?.badges?.length || 0} icon={Award} iconColorClass="text-purple-400" />
          </>
        )}
      </div>

      {/* ─── Grid: Badges Achieved ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="h-4 w-4 text-purple-400" />
          Earned Achievements
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_BADGES.map((badge, idx) => {
              const status = getBadgeEarnedData(badge.name);
              return (
                <BadgeCard
                  key={badge.name}
                  name={badge.name}
                  description={badge.description}
                  iconName={badge.icon}
                  unlocked={status.unlocked}
                  unlockedAt={status.unlockedAt}
                  delay={idx * 0.03}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Grid: Historical Workouts ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-400" />
          Historical Activities Log
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, idx) => <Skeleton key={idx} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : !data?.runs || data.runs.length === 0 ? (
          <EmptyState
            icon={Footprints}
            title="No Activities Registered"
            message="This runner has not logged any geotracked workout paths yet."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.runs.map((run: any, idx: number) => {
              const distKm = (run.distance / 1000).toFixed(2);
              const hrs = Math.floor(run.duration / 3600);
              const mins = Math.floor((run.duration % 3600) / 60);
              const secs = run.duration % 60;
              const durationStr = `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;

              return (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                >
                  <Card className="border border-white/5 bg-white/3 hover:border-white/10 transition-all duration-300">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(run.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-cyan-500/10 text-cyan-400 font-bold uppercase">
                          Done
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Distance</p>
                          <h5 className="text-sm font-bold text-white font-mono mt-0.5">{distKm} km</h5>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Time</p>
                          <h5 className="text-sm font-bold text-white font-mono mt-0.5 truncate">{durationStr}</h5>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Score</p>
                          <h5 className="text-sm font-bold text-cyan-400 font-mono mt-0.5">+{run.xpGained} XP</h5>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
