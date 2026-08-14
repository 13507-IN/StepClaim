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
    <div className="p-6 md:p-10 space-y-10 max-w-4xl mx-auto relative z-10">
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 md:col-span-1 border-t-4 border-t-[var(--color-primary)] h-fit shadow-xl shadow-black/20">
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <div className="h-24 w-24 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center mb-4 border-4 border-[var(--color-background)] shadow-sm">
              <UserIcon className="h-12 w-12 text-[var(--color-foreground)]/40" />
            </div>
            <h2 className="text-2xl font-black mt-2">{user.username}</h2>
            <p className="text-sm text-[var(--color-foreground)]/60 mb-6 font-semibold uppercase tracking-wider">Level {user.level} Runner</p>
            <div className="w-full space-y-3">
              <Button className="w-full border-white/10 hover:bg-white/10" variant="outline">Edit Profile</Button>
              <Button className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all font-semibold" variant="ghost">Logout</Button>
            </div>
          </CardContent>
        </Card>

        {/* Details List */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xl font-bold">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              <div className="flex items-center justify-between border-b border-white/5 p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Mail className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-foreground)]/60">Email Address</p>
                    <p className="text-base font-bold text-white mt-0.5">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-white/10">Edit</Button>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <Shield className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-foreground)]/60">Password</p>
                    <p className="text-base font-bold text-white mt-0.5">••••••••••</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-white/10">Change</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xl font-bold">Recent Badges</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                {/* Mock Badges */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 hover:scale-105 transition-transform shadow-lg shadow-black/20 cursor-pointer">
                    <Trophy className="h-10 w-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                    <span className="text-sm font-bold text-yellow-100">100km Club</span>
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
