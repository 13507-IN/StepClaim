'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Shield, Trophy, Footprints, Ruler, Weight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore, calculateStepLength } from '@/store/useUserStore';
import { BodyProfileModal } from '@/components/profile/body-profile-modal';

export default function ProfilePage() {
  const user = useUserStore((state) => state.user);
  const clearAuth = useUserStore((state) => state.clearAuth);
  const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);

  if (!user) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  const height = user.height || 175;
  const weight = user.weight || 70;
  const strideMeters = calculateStepLength(height, 'WALKING');
  const strideCm = Math.round(strideMeters * 100);
  const stepsPerKm = Math.round(1000 / strideMeters);

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
              <Button 
                onClick={() => setIsBodyModalOpen(true)}
                className="w-full border-white/10 hover:bg-white/10 flex items-center justify-center gap-2" 
                variant="outline"
              >
                <Footprints className="w-4 h-4 text-amber-400" />
                Calibrate Stride
              </Button>
              <Button 
                onClick={clearAuth}
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all font-semibold" 
                variant="ghost"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details List */}
        <div className="md:col-span-2 space-y-6">
          {/* Body & Stride Card */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-amber-400" />
                  Body & Footstep Stride
                </CardTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Calibrated to your height & weight for live step counting.
                </p>
              </div>
              <Button 
                onClick={() => setIsBodyModalOpen(true)}
                variant="ghost" 
                size="sm" 
                className="hover:bg-white/10 text-xs text-[var(--color-primary)] font-bold"
              >
                Edit
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-sky-400" /> Height
                  </span>
                  <span className="text-base font-bold text-white mt-0.5">{height} cm</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1">
                    <Weight className="w-3 h-3 text-amber-400" /> Weight
                  </span>
                  <span className="text-base font-bold text-white mt-0.5">{weight} kg</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-semibold text-gray-400">Step Size</span>
                  <span className="text-base font-bold text-[var(--color-primary)] mt-0.5">{strideCm} cm</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-semibold text-gray-400">1 km Walking</span>
                  <span className="text-base font-bold text-white mt-0.5">~{stepsPerKm.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xl font-bold">Recent Badges</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                {(() => {
                  const badges = [];
                  if ((user.totalDistance || 0) >= 10) badges.push("10km Club");
                  if ((user.totalDistance || 0) >= 50) badges.push("50km Club");
                  if ((user.totalDistance || 0) >= 100) badges.push("100km Explorer");
                  if ((user.territoryCount || 0) >= 1) badges.push("Territory Rookie");
                  if ((user.territoryCount || 0) >= 10) badges.push("Hex Conqueror");
                  if ((user.streak || 0) >= 3) badges.push("Streak Starter");
                  if ((user.streak || 0) >= 7) badges.push("Consistent Runner");
                  if ((user.level || 0) >= 5) badges.push("Veteran (Lvl 5)");
                  
                  if (badges.length === 0) badges.push("New Explorer");

                  return badges.map((badge, i) => (
                    <div key={i} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 hover:scale-105 transition-transform shadow-lg shadow-black/20 cursor-pointer w-32">
                      <Trophy className="h-10 w-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                      <span className="text-sm font-bold text-yellow-100 text-center">{badge}</span>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BodyProfileModal 
        isOpen={isBodyModalOpen} 
        onClose={() => setIsBodyModalOpen(false)} 
      />
    </div>
  );
}
