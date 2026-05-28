"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Flame, Loader2, ArrowRight, Upload, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain alphanumeric characters and underscores",
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
        error("File Too Large", "Avatar size must be less than 5MB");
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
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await registerUser(formData);
      if (res.success) {
        success("Registration Successful", "Welcome to the grid, recruit!");
        localStorage.setItem("userId", res.data.user.id);
        router.push("/dashboard");
      }
    } catch (e: any) {
      error(
        "Registration Failed",
        e.response?.data?.message || "Error occurred during registration",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-2xl relative shadow-2xl overflow-visible">
      {/* Cyber Technical Grid Accent */}
      <div className="absolute top-0 right-12 w-24 h-1 border-x border-b border-cyan-500/30 bg-cyan-950/20 text-[7px] font-[family-name:var(--font-mono)] text-cyan-400/50 flex items-center justify-center tracking-widest px-1">
        SYS_REG_v1.4
      </div>

      <CardHeader className="text-center space-y-2 pb-3 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 justify-center text-cyan-400 font-[family-name:var(--font-header)] font-black uppercase tracking-widest text-sm hover:opacity-85 transition-opacity"
        >
          <Flame className="h-5 w-5 fill-cyan-400 animate-pulse" />
          StepClaim
        </Link>
        <CardTitle className="text-2xl uppercase font-[family-name:var(--font-header)] font-black text-white tracking-widest">
          Register Sector
        </CardTitle>

        <div className="inline-flex items-center gap-1.5 text-[9px] font-[family-name:var(--font-mono)] text-purple-400 uppercase tracking-widest bg-purple-950/40 border border-purple-500/20 px-3 py-1 rounded-full w-fit mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
          ENLISTMENT: STANDBY
        </div>

        <CardDescription className="text-[11px] font-[family-name:var(--font-mono)] text-slate-400 max-w-[290px] mx-auto pt-2">
          // Create your profile to start tracking real-life movements.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 px-6 pb-2">
          {/* Avatar Upload field */}
          <div className="flex flex-col items-center space-y-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <div
              className="relative group cursor-pointer"
              onClick={triggerFileInput}
            >
              {/* Sci-fi Target frame overlay */}
              <div className="absolute -inset-1.5 border border-cyan-500/20 rounded-full group-hover:border-cyan-500/40 transition-colors pointer-events-none" />
              <div className="absolute -inset-2.5 border border-dashed border-purple-500/10 rounded-full group-hover:border-purple-500/30 group-hover:spin transition-colors pointer-events-none" />

              <Avatar className="h-16 w-16 border-2 border-cyan-500 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:scale-105 transition-all duration-300">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-lg font-[family-name:var(--font-mono)] bg-cyan-950 text-cyan-400">
                  ?
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-cyan-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={triggerFileInput}
              className="text-[9px] text-cyan-400 font-[family-name:var(--font-mono)] font-bold uppercase tracking-wider h-6 hover:bg-cyan-950/30"
            >
              <Upload className="h-3 w-3 mr-1" />[ Upload Avatar ]
            </Button>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="username"
              className="font-[family-name:var(--font-mono)] text-[10px] text-cyan-400/70 uppercase tracking-widest"
            >
              &gt; Username (Callsign)
            </Label>
            <Input
              id="username"
              placeholder="e.g. shadow_conqueror"
              className="flex h-10 w-full rounded-md border border-white/10 bg-[#0a0a0f]/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-[10px] font-[family-name:var(--font-mono)] font-semibold text-red-400 mt-1 pl-1">
                !! {errors.username.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="font-[family-name:var(--font-mono)] text-[10px] text-cyan-400/70 uppercase tracking-widest"
            >
              &gt; Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="recruit@stepclaim.com"
              className="flex h-10 w-full rounded-md border border-white/10 bg-[#0a0a0f]/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[10px] font-[family-name:var(--font-mono)] font-semibold text-red-400 mt-1 pl-1">
                !! {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="font-[family-name:var(--font-mono)] text-[10px] text-cyan-400/70 uppercase tracking-widest"
            >
              &gt; Security Cipher (Password)
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-white/10 bg-[#0a0a0f]/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[10px] font-[family-name:var(--font-mono)] font-semibold text-red-400 mt-1 pl-1">
                !! {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="font-[family-name:var(--font-mono)] text-[10px] text-cyan-400/70 uppercase tracking-widest"
            >
              &gt; Confirm Cipher
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-white/10 bg-[#0a0a0f]/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-[10px] font-[family-name:var(--font-mono)] font-semibold text-red-400 mt-1 pl-1">
                !! {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 px-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-[family-name:var(--font-header)] font-extrabold uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border border-white/20 text-white transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                Enlisting Recruit...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Enlist Profile
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-[11px] font-[family-name:var(--font-mono)] text-center text-slate-400">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold uppercase tracking-wider ml-1"
            >
              [ Account Login ]
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
