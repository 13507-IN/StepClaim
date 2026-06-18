'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Flame, Hexagon, Route, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';

export default function DashboardOverview() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  // Calculate XP progress to next level (mock logic: 1000 XP per level)
  const xpProgress = (user.xp % 1000) / 10;

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-[var(--color-foreground)]/60">Welcome back, {user.username}! Here's how you're doing.</p>
        </div>
        <Link href="/run">
          <Button size="lg" className="rounded-full shadow-lg hover:scale-105 transition-transform">
            <Activity className="h-5 w-5 mr-2" />
            Start Run
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-l-4 border-l-[var(--color-primary)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">Total Distance</CardTitle>
            <Route className="h-4 w-4 text-[var(--color-primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.totalDistance?.toFixed(2) || '0.00'} km</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-[var(--color-accent)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">Territories</CardTitle>
            <Hexagon className="h-4 w-4 text-[var(--color-accent)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.territoryCount || 0}</div>
            <p className="text-xs text-[var(--color-foreground)]/60 mt-1">Currently controlling</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">Active Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.streak || 0} days</div>
            <p className="text-xs text-[var(--color-foreground)]/60 mt-1">Keep it up!</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.level || 1}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 flex-1 bg-[var(--color-surface-muted)] rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-xs text-[var(--color-foreground)]/60">{Math.floor(xpProgress)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Route className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Morning Run</p>
                  <p className="text-xs text-[var(--color-foreground)]/60">Today, 7:00 AM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">5.2 km</p>
                <p className="text-xs text-[var(--color-success)]">+120 XP</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                  <Hexagon className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Territory Captured</p>
                  <p className="text-xs text-[var(--color-foreground)]/60">Yesterday, 6:30 PM</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">Downtown Park</p>
                <p className="text-xs text-[var(--color-success)]">+50 XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
