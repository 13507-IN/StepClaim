"use client";

import React, { useRef, useState } from "react";
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
        success("Registration Successful", "Welcome to StepClaim!");
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
    <Card className="relative overflow-visible rounded-2xl border border-white/10 bg-[#090c17]/70 shadow-2xl backdrop-blur-xl">
      <div className="absolute right-12 top-0 flex h-1 w-24 items-center justify-center border-x border-b border-purple-500/30 bg-purple-950/20 px-1 text-[7px] tracking-widest text-purple-400/50">
        SYS_REG_v1.4
      </div>

      <CardHeader className="space-y-2 pb-3 pt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-black uppercase tracking-widest text-cyan-300 transition-opacity hover:opacity-85"
        >
          <Flame className="h-5 w-5 fill-cyan-300 animate-pulse" />
          StepClaim
        </Link>

        <CardTitle className="text-2xl font-black tracking-wide text-white">
          Create your account
        </CardTitle>

        <div className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-950/35 px-3 py-1 text-[10px] uppercase tracking-wider text-purple-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-300 animate-pulse" />
          Setup in under a minute
        </div>

        <CardDescription className="mx-auto max-w-[300px] pt-2 text-sm text-slate-300">
          Add your profile details and start capturing territory from your first run.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 px-6 pb-2">
          <div className="flex flex-col items-center space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative cursor-pointer group" onClick={triggerFileInput}>
              <div className="pointer-events-none absolute -inset-1.5 rounded-full border border-cyan-400/20 transition-colors group-hover:border-cyan-300/45" />
              <Avatar className="h-16 w-16 border-2 border-cyan-400/60 bg-cyan-950/50 shadow-[0_0_18px_rgba(6,182,212,0.2)] transition-all duration-300 group-hover:scale-105">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="bg-cyan-950 text-lg text-cyan-300">
                  ?
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-cyan-950/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Camera className="h-4 w-4 text-cyan-300" />
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={triggerFileInput}
              className="h-7 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 hover:bg-cyan-950/35"
            >
              <Upload className="mr-1 h-3 w-3" />
              Upload avatar
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-[11px] uppercase tracking-wider text-cyan-200/75">
              Username
            </Label>
            <Input
              id="username"
              placeholder="e.g. shadow_conqueror"
              className="h-10 border-white/12 bg-[#0a0d18]/70 text-white placeholder:text-slate-500"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 pl-1 text-[11px] font-semibold text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-cyan-200/75">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-10 border-white/12 bg-[#0a0d18]/70 text-white placeholder:text-slate-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 pl-1 text-[11px] font-semibold text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[11px] uppercase tracking-wider text-cyan-200/75">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-10 border-white/12 bg-[#0a0d18]/70 text-white placeholder:text-slate-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 pl-1 text-[11px] font-semibold text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-[11px] uppercase tracking-wider text-cyan-200/75"
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="h-10 border-white/12 bg-[#0a0d18]/70 text-white placeholder:text-slate-500"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 pl-1 text-[11px] font-semibold text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 px-6 pb-8 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full border border-white/20 bg-gradient-to-br from-cyan-500 to-purple-600 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 hover:from-cyan-400 hover:to-purple-500"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Create account
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="ml-1 font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
