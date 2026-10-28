'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Hexagon, Route } from 'lucide-react';
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
    <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 md:space-y-10 md:p-10">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm text-[#949494]">Your territory</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Overview</h1>
          <p className="mt-2 text-sm text-[#b4b4b4] sm:text-base">Every outing adds to your story, {user.username}.</p>
        </div>
        <Link href="/run">
          <Button size="lg" className="h-10 rounded-full px-5 font-semibold sm:px-6">
            <Activity className="mr-2 h-5 w-5" />
            Start a new run
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#20282b] bg-[#121719]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#b4b4b4]">Total distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{user.totalDistance?.toFixed(2) || '0.00'} <span className="text-sm font-medium text-[#949494]">km</span></div>
            <p className="mt-2 text-xs text-[#949494]">All-time distance</p>
          </CardContent>
        </Card>

        <Card className="border-[#20282b] bg-[#121719]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#b4b4b4]">Territories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{user.territoryCount || 0}</div>
            <p className="mt-2 text-xs text-[#949494]">Currently in your collection</p>
          </CardContent>
        </Card>

        <Card className="border-[#20282b] bg-[#121719]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#b4b4b4]">Active streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{user.streak || 0} <span className="text-sm font-medium text-[#949494]">days</span></div>
            <p className="mt-2 text-xs text-[#949494]">Keep your momentum going</p>
          </CardContent>
        </Card>

        <Card className="border-[#20282b] bg-[#121719]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#b4b4b4]">Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{user.level || 1}</div>
            <div className="flex items-center gap-3 mt-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-xs font-medium text-[#b4b4b4]">{Math.floor(xpProgress)}%</span>
            </div>
            <p className="mt-2 text-xs text-[#949494]">Progress to next level</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5">
        <Card className="border-[#20282b] bg-[#121719]">
          <CardHeader className="flex-row items-center justify-between border-b border-[#20282b] pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-white">Recent activity</CardTitle>
              <p className="mt-1 text-xs text-[#949494]">Your latest runs and territory captures</p>
            </div>
            <Link href="/run" className="text-xs font-medium text-[var(--color-primary)] transition hover:text-white">View live run</Link>
          </CardHeader>
          <CardContent className="p-2">
            {loading ? (
              <div className="p-6 text-sm text-[var(--color-foreground)]/60">Loading activity...</div>
            ) : activities.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-foreground)]/60">No recent activity yet. Start running!</div>
            ) : (
              <div className="space-y-1">
                {activities.map((activity, i) => (
                  <div key={i} className="group flex items-center justify-between border-b border-[#20282b] p-4 transition-colors last:border-0 hover:bg-[#1a2224]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center text-[#b4b4b4]">
                        {activity.type === 'RUN' ? (
                          <Route className="h-5 w-5" />
                        ) : (
                          <Hexagon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        {activity.type === 'RUN' ? (
                          <Link href={`/run/${activity.data.id}`} className="flex items-center gap-2 text-base font-semibold text-white transition-colors hover:text-[var(--color-primary)]">
                            {getActivityName(activity.timestamp.getHours())}
                            <span className="text-[11px] text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">View path</span>
                          </Link>
                        ) : (
                          <p className="text-base font-semibold text-white">Territory captured</p>
                        )}
                        <p className="mt-0.5 text-sm text-[#949494]">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {activity.type === 'RUN' ? `${activity.data.distance.toFixed(2)} km` : `Grid Capture`}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[var(--color-primary)]">
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
