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
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
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
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Overview</h1>
          <p className="text-[var(--color-foreground)]/60 text-lg">Welcome back, {user.username}! Here's how you're doing.</p>
        </div>
        <Link href="/run">
          <Button size="lg" className="rounded-xl h-14 px-8 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.3)] hover:shadow-[0_0_60px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:scale-105 text-lg">
            <Activity className="h-5 w-5 mr-3" />
            Start Run
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 border-l-4 border-l-[var(--color-primary)] hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-[var(--color-foreground)]/70 uppercase tracking-wider">Total Distance</CardTitle>
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
              <Route className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mt-2">{user.totalDistance?.toFixed(2) || '0.00'} <span className="text-2xl text-[var(--color-foreground)]/50">km</span></div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 border-l-4 border-l-[var(--color-accent)] hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-[var(--color-foreground)]/70 uppercase tracking-wider">Territories</CardTitle>
            <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg">
              <Hexagon className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mt-2">{user.territoryCount || 0}</div>
            <p className="text-xs text-[var(--color-foreground)]/60 mt-2 font-medium">Currently controlling</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 border-l-4 border-l-orange-500 hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-[var(--color-foreground)]/70 uppercase tracking-wider">Active Streak</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mt-2">{user.streak || 0} <span className="text-2xl text-[var(--color-foreground)]/50">days</span></div>
            <p className="text-xs text-[var(--color-foreground)]/60 mt-2 font-medium">Keep it up!</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 border-l-4 border-l-yellow-500 hover:bg-white/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-[var(--color-foreground)]/70 uppercase tracking-wider">Level</CardTitle>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black mt-2">{user.level || 1}</div>
            <div className="flex items-center gap-3 mt-3">
              <div className="h-2 flex-1 bg-black/40 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-xs font-bold text-[var(--color-foreground)]/70">{Math.floor(xpProgress)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
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
                        +{activity.type === 'RUN' ? activity.data.xpEarned : activity.data.capturePoints} XP
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
