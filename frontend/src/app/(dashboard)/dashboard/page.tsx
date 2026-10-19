'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Flame, Hexagon, Route, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { runService, RunHistoryItem } from '@/services/run.api';
import { territoryService, Territory } from '@/services/territory.api';

type ActivityItem = 
  | { type: 'RUN'; data: RunHistoryItem; timestamp: Date }
  | { type: 'TERRITORY'; data: Territory; timestamp: Date };

export default function DashboardOverview() {
  const user = useUserStore((state) => state.user);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const [runs, territories] = await Promise.all([
          runService.getHistory(1, 10),
          territoryService.getMyTerritories()
        ]);

        const combined: ActivityItem[] = [
          ...runs.map((r) => ({ type: 'RUN' as const, data: r, timestamp: new Date(r.startTime) })),
          ...territories.map((t) => ({ type: 'TERRITORY' as const, data: t, timestamp: new Date(t.capturedAt) }))
        ];

        // Sort descending
        combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(combined.slice(0, 5)); // Take top 5
      } catch (e) {
        console.error('Failed to load recent activity:', e);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadActivities();
    }
  }, [user]);

  if (!user) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  // Calculate XP progress to next level (mock logic: 1000 XP per level)
  const xpProgress = (user.xp % 1000) / 10;

  const getActivityName = (hour: number) => {
    if (hour >= 5 && hour < 12) return 'Morning Run';
    if (hour >= 12 && hour < 17) return 'Afternoon Exercise';
    if (hour >= 17 && hour < 21) return 'Evening Walk';
    return 'Night Run';
  };

  const formatRelativeTime = (date: Date) => {
    const daysDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (daysDifference === -1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 md:space-y-10 md:p-10">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Your StepClaim</p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Welcome back, {user.username}</h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">Every outing adds to your story. Here&apos;s your progress so far.</p>
        </div>
        <Link href="/run">
          <Button size="lg" className="h-12 rounded-xl px-5 font-bold shadow-lg shadow-sky-500/15 transition-transform hover:-translate-y-0.5 sm:h-13 sm:px-6">
            <Activity className="mr-2 h-5 w-5" />
            Start a new run
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-white/[0.08] border-l-2 border-l-sky-300 bg-[#101827]/80 backdrop-blur-xl transition-colors hover:bg-[#142033]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Total distance</CardTitle>
            <div className="rounded-xl bg-sky-300/10 p-2.5">
              <Route className="h-5 w-5 text-sky-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-3xl font-black tracking-tight text-white">{user.totalDistance?.toFixed(2) || '0.00'} <span className="text-lg font-semibold text-slate-500">km</span></div>
            <p className="mt-2 text-xs font-medium text-slate-500">All-time distance</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] border-l-2 border-l-violet-300 bg-[#101827]/80 backdrop-blur-xl transition-colors hover:bg-[#142033]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Territories</CardTitle>
            <div className="rounded-xl bg-violet-300/10 p-2.5">
              <Hexagon className="h-5 w-5 text-violet-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-3xl font-black tracking-tight text-white">{user.territoryCount || 0}</div>
            <p className="mt-2 text-xs font-medium text-slate-500">Currently in your collection</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] border-l-2 border-l-orange-300 bg-[#101827]/80 backdrop-blur-xl transition-colors hover:bg-[#142033]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Active streak</CardTitle>
            <div className="rounded-xl bg-orange-300/10 p-2.5">
              <Flame className="h-5 w-5 text-orange-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-3xl font-black tracking-tight text-white">{user.streak || 0} <span className="text-lg font-semibold text-slate-500">days</span></div>
            <p className="mt-2 text-xs font-medium text-slate-500">Keep your momentum going</p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.08] border-l-2 border-l-amber-300 bg-[#101827]/80 backdrop-blur-xl transition-colors hover:bg-[#142033]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Level</CardTitle>
            <div className="rounded-xl bg-amber-300/10 p-2.5">
              <Trophy className="h-5 w-5 text-amber-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-3xl font-black tracking-tight text-white">{user.level || 1}</div>
            <div className="flex items-center gap-3 mt-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-200" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-300">{Math.floor(xpProgress)}%</span>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">Progress to next level</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5">
        <Card className="border-white/[0.08] bg-[#101827]/80 shadow-xl shadow-black/10 backdrop-blur-xl">
          <CardHeader className="flex-row items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-white">Recent activity</CardTitle>
              <p className="mt-1 text-xs text-slate-500">Your latest runs and territory captures</p>
            </div>
            <Link href="/run" className="text-xs font-bold text-sky-300 transition hover:text-sky-200">View live run</Link>
          </CardHeader>
          <CardContent className="p-2">
            {loading ? (
              <div className="p-6 text-sm text-[var(--color-foreground)]/60">Loading activity...</div>
            ) : activities.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-foreground)]/60">No recent activity yet. Start running!</div>
            ) : (
              <div className="space-y-1">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-white/10 transition-all rounded-xl border border-transparent hover:border-white/10 hover:shadow-lg group">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${activity.type === 'RUN' ? 'from-[#FC4C02]/30 to-[#FC4C02]/5 border border-[#FC4C02]/40' : 'from-[var(--color-accent)]/30 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/40'}`}>
                        {activity.type === 'RUN' ? (
                          <Route className="h-6 w-6 text-[#FC4C02] drop-shadow-[0_0_8px_rgba(252,76,2,0.8)]" />
                        ) : (
                          <Hexagon className="h-6 w-6 text-[var(--color-accent)] drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        )}
                      </div>
                      <div>
                        {activity.type === 'RUN' ? (
                          <Link href={`/run/${activity.data.id}`} className="font-bold text-base text-white hover:text-[#FC4C02] transition-colors flex items-center gap-2">
                            {getActivityName(activity.timestamp.getHours())}
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FC4C02]/20 text-[#FC4C02] uppercase tracking-widest font-black border border-[#FC4C02]/30 opacity-0 group-hover:opacity-100 transition-opacity">View Path</span>
                          </Link>
                        ) : (
                          <p className="font-bold text-base text-white">Territory Captured</p>
                        )}
                        <p className="text-sm text-[var(--color-foreground)]/50 font-medium mt-0.5">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-white">
                        {activity.type === 'RUN' ? `${activity.data.distance.toFixed(2)} km` : `Grid Capture`}
                      </p>
                      <p className="text-sm text-emerald-400 font-bold mt-0.5 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">
                        +{activity.type === 'RUN' ? activity.data.xpGained : activity.data.capturePoints} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
