'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore, calculateStepLength } from '@/store/useUserStore';
import { BodyProfileModal } from '@/components/profile/body-profile-modal';
import { Footprints, Ruler, Weight, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);

  if (!user) {
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  const height = user.height || 175;
  const weight = user.weight || 70;
  const strideMeters = calculateStepLength(height, 'WALKING');
  const strideCm = Math.round(strideMeters * 100);
  const stepsPerKm = Math.round(1000 / strideMeters);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[var(--color-foreground)]/60">Manage your StepClaim account preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Body & Stride Calibration Card */}
        <Card className="glass-panel border border-[var(--color-primary)]/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-[var(--color-primary)]" />
                Body & Stride Profile
              </CardTitle>
              <CardDescription>
                Height and weight are used to calculate your exact footstep stride and calories burned.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsBodyModalOpen(true)}
              className="bg-[var(--color-primary)] text-black font-bold hover:bg-[var(--color-primary)]/90 text-xs rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Calibrate Stats
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center bg-black/40 p-3.5 rounded-xl border border-white/5">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-sky-400" /> Height
                </span>
                <span className="text-lg font-black text-white mt-0.5">{height} cm</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                  <Weight className="w-3 h-3 text-amber-400" /> Weight
                </span>
                <span className="text-lg font-black text-white mt-0.5">{weight} kg</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Step Stride</span>
                <span className="text-lg font-black text-[var(--color-primary)] mt-0.5">{strideCm} cm</span>
                <span className="text-[9px] text-gray-400">({strideMeters.toFixed(2)}m / step)</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">1 km Walking</span>
                <span className="text-lg font-black text-white mt-0.5">~{stepsPerKm.toLocaleString()}</span>
                <span className="text-[9px] text-gray-400">steps</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>View your registered account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--color-foreground)]/70">Username</p>
              <p className="font-semibold">{user.username}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--color-foreground)]/70">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel opacity-50 pointer-events-none">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Update Password</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border border-[var(--color-destructive)]/50">
          <CardHeader>
            <CardTitle className="text-[var(--color-destructive)]">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your StepClaim account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>Delete Account (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>

      <BodyProfileModal
        isOpen={isBodyModalOpen}
        onClose={() => setIsBodyModalOpen(false)}
      />
    </div>
  );
}
