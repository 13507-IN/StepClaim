'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/useUserStore';

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[var(--color-foreground)]/60">Manage your StepClaim account preferences.</p>
      </div>

      <div className="grid gap-6">
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
    </div>
  );
}
