'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/useUserStore';

export default function ProfilePage() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="glass-panel md:col-span-1 border-t-4 border-t-[var(--color-primary)] h-fit">
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <div className="h-24 w-24 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center mb-4 border-4 border-[var(--color-background)] shadow-sm">
              <UserIcon className="h-12 w-12 text-[var(--color-foreground)]/40" />
            </div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-sm text-[var(--color-foreground)]/60 mb-6">Level {user.level} Runner</p>
            <div className="w-full space-y-2">
              <Button className="w-full" variant="outline">Edit Profile</Button>
              <Button className="w-full text-[var(--color-destructive)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10" variant="ghost">Logout</Button>
            </div>
          </CardContent>
        </Card>

        {/* Details List */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[var(--color-foreground)]/50" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-xs text-[var(--color-foreground)]/60">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[var(--color-foreground)]/50" />
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-[var(--color-foreground)]/60">••••••••••</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Change</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {/* Mock Badges */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-xs font-semibold">100km Club</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
