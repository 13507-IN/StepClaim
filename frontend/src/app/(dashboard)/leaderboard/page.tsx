'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Compass, Footprints, Medal } from 'lucide-react';
import { leaderboardService } from '@/services/leaderboard.service';
import { LeaderboardTable } from '@/components/shared/leaderboard-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
  // Filters: Score type & Period
  const [scoreType, setScoreType] = useState<'XP' | 'DISTANCE' | 'TERRITORIES'>('XP');
  const [period, setPeriod] = useState<'GLOBAL' | 'WEEKLY' | 'FRIENDS'>('GLOBAL');

  // Query rankings from server
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', scoreType, period],
    queryFn: async () => {
      const res = await leaderboardService.getLeaderboard(scoreType, period);
      return res.data?.rankings || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* ─── Header Section ────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
          Leaderboards
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Compete against friends or battle global pioneers to assert your dominance.
        </p>
      </div>

      {/* ─── Tab Filter Options ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2 border-b border-white/5">
        
        {/* Score Type Tabs */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Metrics</p>
          <Tabs value={scoreType} onValueChange={(val) => setScoreType(val as any)}>
            <TabsList>
              <TabsTrigger value="XP" className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                XP
              </TabsTrigger>
              <TabsTrigger value="DISTANCE" className="flex items-center gap-1.5">
                <Footprints className="h-3.5 w-3.5" />
                Distance
              </TabsTrigger>
              <TabsTrigger value="TERRITORIES" className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                Claims
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Period Tabs */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Brackets</p>
          <Tabs value={period} onValueChange={(val) => setPeriod(val as any)}>
            <TabsList>
              <TabsTrigger value="GLOBAL" className="flex items-center gap-1.5">
                <Medal className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400/20" />
                Global
              </TabsTrigger>
              <TabsTrigger value="WEEKLY" className="flex items-center gap-1.5">
                <Medal className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/20" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="FRIENDS" className="flex items-center gap-1.5">
                <Medal className="h-3.5 w-3.5 text-purple-400 fill-purple-400/20" />
                Friends
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ─── Rankings Listing Grid ─────────────────────────────────────────────── */}
      <div className="w-full">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <LeaderboardTable entries={data || []} scoreType={scoreType} />
        )}
      </div>
    </div>
  );
}
