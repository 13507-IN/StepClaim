'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Play, Map, Trophy, Compass, Footprints, Flame, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { StatsCard } from '@/components/shared/stats-card';
import { LevelBadge } from '@/components/game/level-badge';
import { ActivityItem } from '@/components/shared/activity-item';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();

  // Query consolidate user details & activity logs
  const { data, isLoading } = useQuery({
    queryKey: ['my-dashboard-stats'],
    queryFn: async () => {
      const res = await authService.getMe();
      return res.data;
    },
  });

  const formattedDistance = data?.user?.totalDistance
    ? data.user.totalDistance >= 1000
      ? `${(data.user.totalDistance / 1000).toFixed(2)} km`
      : `${Math.round(data.user.totalDistance)} m`
    : '0.0 km';

  return (
    <div className="space-y-6">
      {/* ─── Header Section ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="font-bold text-white">{user?.username}</span>. Check your progress and ready your gear.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
            <Link href="/run" className="flex items-center gap-1.5">
              <Map className="h-4 w-4" />
              View Map
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-linear-to-r from-cyan-500 to-purple-600 font-bold uppercase tracking-wider text-xs">
            <Link href="/run" className="flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5 fill-white" />
              Start Run
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Level & XP Emblem Row ────────────────────────────────────────────── */}
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : (
        <LevelBadge level={data?.user?.level || 1} xp={data?.user?.xp || 0} />
      )}

      {/* ─── Quick Stats Card Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-24 w-full rounded-xl" />)
        ) : (
          <>
            {/* Level Card */}
            <StatsCard
              label="Player Level"
              value={data?.user?.level || 1}
              icon={Trophy}
              iconColorClass="text-yellow-400"
              description="Current game tier"
              delay={0.05}
            />

            {/* Total Distance Card */}
            <StatsCard
              label="Total Distance"
              value={formattedDistance}
              icon={Footprints}
              iconColorClass="text-emerald-400"
              description="Cumulative fitness effort"
              delay={0.1}
            />

            {/* Captured Territories Card */}
            <StatsCard
              label="Hexes Claimed"
              value={data?.territoriesCount || 0}
              icon={MapPin}
              iconColorClass="text-cyan-400"
              description="Active captured sectors"
              delay={0.15}
            />

            {/* Daily Streak Card */}
            <StatsCard
              label="Day Streak"
              value={data?.user?.streak || 0}
              icon={Flame}
              iconColorClass="text-orange-500 animate-pulse"
              description="1km movement streak"
              delay={0.2}
            />
          </>
        )}
      </div>

      {/* ─── Recent Activity Log Feed ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider">
          Recent Activity Timeline
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : !data?.runs || data.runs.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No Activity Logs"
            message="You haven't completed any movement runs yet. Step outside to capture your first territory!"
            actionText="Start First Run"
            onAction={() => window.location.href = '/run'}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {data.runs.slice(0, 5).map((run: any, idx: number) => {
              // Convert run log into unified activity feed structure
              const act = {
                id: run.id,
                activityType: 'RUN_COMPLETED' as const,
                xpGained: run.xpGained,
                distance: run.distance,
                createdAt: run.createdAt,
                user: {
                  username: user?.username || 'Unknown',
                  avatarUrl: user?.avatarUrl || null,
                  level: user?.level || 1,
                },
              };

              return <ActivityItem key={run.id} activity={act} delay={idx * 0.05} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
