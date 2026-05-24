'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Flame, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInput) => {
    setLoading(true);
    try {
      const res = await login(data);
      if (res.success) {
        success('Access Granted', 'Logged in successfully!');
        
        // Save userId locally for fast maps lookups
        localStorage.setItem('userId', res.data.user.id);
        
        router.push('/dashboard');
      }
    } catch (e: any) {
      error('Authentication Failed', e.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl">
      <CardHeader className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-1.5 justify-center text-cyan-400 font-extrabold uppercase tracking-widest text-sm hover:opacity-85 transition-opacity">
          <Flame className="h-5 w-5 fill-cyan-400" />
          StepClaim
        </Link>
        <CardTitle className="text-xl uppercase font-bold text-white tracking-wide">
          Account Login
        </CardTitle>
        <CardDescription className="text-xs text-slate-400 max-w-[280px] mx-auto">
          Welcome back soldier. Key in your credentials to deploy.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. recruit@stepclaim.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
          <Button type="submit" disabled={loading} className="w-full h-10 font-bold uppercase tracking-wider text-xs shadow-md">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                Deploy Profile
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-slate-400">
            First mission?{' '}
            <Link href="/register" className="text-cyan-400 hover:underline font-bold">
              Register Sector
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
