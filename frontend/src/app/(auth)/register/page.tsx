'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/store/useUserStore';
import { authService } from '@/services/auth.api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useUserStore((state) => state.setAuth);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        router.push('/dashboard');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent)]/20 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md glass-panel relative z-10">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription>
            Join StepClaim and start conquering territories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-white bg-[var(--color-destructive)]/80 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Input
                type="text"
                placeholder="Username"
                {...register('username')}
              />
              {errors.username && <p className="text-xs text-[var(--color-destructive)]">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email address"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-[var(--color-destructive)]">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-[var(--color-destructive)]">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-[var(--color-foreground)]/60">
            Already have an account? <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium">Sign In</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
