'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Flame, Loader2, ArrowRight, Upload, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must not exceed 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  // Avatar states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('File Too Large', 'Avatar size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: RegisterFormInput) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await registerUser(formData);
      if (res.success) {
        success('Registration Successful', 'Welcome to the grid, recruit!');
        localStorage.setItem('userId', res.data.user.id);
        router.push('/dashboard');
      }
    } catch (e: any) {
      error('Registration Failed', e.response?.data?.message || 'Error occurred during registration');
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
          Register Sector
        </CardTitle>
        <CardDescription className="text-xs text-slate-400 max-w-[280px] mx-auto">
          Create your profile to start tracking real life movements and capturing virtual sectors.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Avatar Upload field */}
          <div className="flex flex-col items-center space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <Avatar className="h-16 w-16 border-2 border-cyan-500/30 hover:border-cyan-400 transition-all duration-300">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-lg">?</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={triggerFileInput}
              className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider h-6 hover:bg-white/5"
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload Avatar
            </Button>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="e.g. shadow_conqueror" {...register('username')} />
            {errors.username && (
              <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="e.g. recruit@stepclaim.com" {...register('email')} />
            {errors.email && (
              <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && (
              <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
          <Button type="submit" disabled={loading} className="w-full h-10 font-bold uppercase tracking-wider text-xs shadow-md">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enlisting...
              </>
            ) : (
              <>
                Deploy Profile
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-slate-400">
            Already registered?{' '}
            <Link href="/login" className="text-cyan-400 hover:underline font-bold">
              Account Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
