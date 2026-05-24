'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile.service';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, Upload, Camera } from 'lucide-react';

const settingsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Alphanumerics and underscores only'),
  email: z.string().email('Please enter a valid email address'),
});

type SettingsFormInput = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);

  // Avatar upload ref and preview
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      if (file.size > 5 * 1024 * 1024) {
        error('File Too Large', 'Avatar size must be less than 5MB');
        return;
      }

      setAvatarLoading(true);
      setAvatarPreview(URL.createObjectURL(file));

      try {
        const res = await profileService.uploadAvatar(file);
        if (res.success && res.data) {
          updateUser(res.data);
          success('Avatar Updated', 'Your profile picture was updated successfully');
        }
      } catch (err: any) {
        error('Upload Failed', err.response?.data?.message || 'Failed to upload image file');
        setAvatarPreview(null);
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: SettingsFormInput) => {
    setLoading(true);
    try {
      const res = await profileService.updateProfile(data.username, data.email);
      if (res.success && res.data) {
        updateUser(res.data);
        success('Settings Saved', 'Profile configuration committed successfully');
      }
    } catch (err: any) {
      error('Save Failed', err.response?.data?.message || 'Error occurred while saving configurations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header Section ────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
          Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure profile accounts details and avatar visual elements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── Avatar Image Manager Box ─────────────────────────────────────────── */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Avatar Settings</CardTitle>
            <CardDescription className="text-xs text-slate-400">Display photo representing your profile on map.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <Avatar className="h-24 w-24 border-2 border-cyan-500/20 hover:border-cyan-400 transition-all duration-300">
                <AvatarImage src={avatarPreview || user?.avatarUrl || undefined} />
                <AvatarFallback className="text-3xl">{user?.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              
              {/* Overlay mask */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {avatarLoading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={avatarLoading}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider"
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Upload Avatar
            </Button>
          </CardContent>
        </Card>

        {/* ─── Core Profile Edit Details Form ──────────────────────────────────── */}
        <Card className="lg:col-span-2 border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Account Details</CardTitle>
            <CardDescription className="text-xs text-slate-400">Modify credentials used for email logins and usernames.</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Username Field */}
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register('username')} />
                {errors.username && (
                  <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Email Address Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-[10px] font-semibold text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="pb-6">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto h-9 text-xs font-bold uppercase tracking-wider">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Commit Configurations
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
