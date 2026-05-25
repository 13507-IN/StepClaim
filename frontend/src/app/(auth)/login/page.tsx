"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Flame, Loader2, ArrowRight } from "lucide-react";
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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
        success("Access Granted", "Logged in successfully!");

        // Save userId locally for fast maps lookups
        localStorage.setItem("userId", res.data.user.id);

        router.push("/dashboard");
      }
    } catch (e: any) {
      error(
        "Authentication Failed",
        e.response?.data?.message || "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-cyber border-0 rounded-2xl relative shadow-2xl overflow-visible">
      {/* HUD Corner Brackets */}
      <div className="cyber-corner-tl" />
      <div className="cyber-corner-tr" />
      <div className="cyber-corner-bl" />
      <div className="cyber-corner-br" />

      {/* Cyber Technical Grid Accent */}
      <div className="absolute top-0 right-12 w-24 h-1 border-x border-b border-cyan-500/30 bg-cyan-950/20 text-[7px] font-cyber-mono text-cyan-400/50 flex items-center justify-center tracking-widest px-1">
        SYS_AUTH_v1.4
      </div>

      <CardHeader className="text-center space-y-2 pb-4 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 justify-center text-cyan-400 font-cyber-header font-black uppercase tracking-widest text-sm hover:opacity-85 transition-opacity"
        >
          <Flame className="h-5 w-5 fill-cyan-400 animate-pulse" />
          StepClaim
        </Link>

        <CardTitle className="text-2xl uppercase font-cyber-header font-black text-white tracking-widest">
          Account Login
        </CardTitle>

        <div className="inline-flex items-center gap-1.5 text-[9px] font-cyber-mono text-cyan-400/90 uppercase tracking-widest bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full w-fit mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          Uplink: SECURE_CHANNEL_OK
        </div>

        <CardDescription className="text-[11px] font-cyber-mono text-slate-400 max-w-[280px] mx-auto pt-2">
          // Welcome back recruit. Key in your credentials to deploy.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-6 pb-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-cyber-mono text-[10px] text-cyan-400/70 uppercase tracking-widest"
            >
              &gt; Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="recruit@stepclaim.com"
              className="cyber-input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[10px] font-cyber-mono font-semibold text-red-400 mt-1 pl-1">
                !! {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="font-cyber-mono text-[10px] text-cyan-400/70 uppercase tracking-widest"
              >
                &gt; Security Cipher (Password)
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="cyber-input"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[10px] font-cyber-mono font-semibold text-red-400 mt-1 pl-1">
                !! {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 px-6">
          <Button
            type="submit"
            disabled={loading}
            className="cyber-button w-full h-11 font-cyber-header font-extrabold uppercase tracking-widest text-xs shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                Establishing Link...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Deploy Profile
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-[11px] font-cyber-mono text-center text-slate-400">
            First mission?{" "}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold uppercase tracking-wider ml-1"
            >
              [ Register Sector ]
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
