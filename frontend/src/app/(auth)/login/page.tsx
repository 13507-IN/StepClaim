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
    <Card className="relative overflow-visible rounded-2xl border border-white/10 bg-[#090c17]/70 shadow-2xl backdrop-blur-xl">
      <div className="absolute right-12 top-0 flex h-1 w-24 items-center justify-center border-x border-b border-cyan-500/30 bg-cyan-950/20 px-1 text-[7px] tracking-widest text-cyan-400/50">
        SYS_AUTH_v1.4
      </div>

      <CardHeader className="space-y-2 pb-4 pt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-black uppercase tracking-widest text-cyan-300 transition-opacity hover:opacity-85"
        >
          <Flame className="h-5 w-5 fill-cyan-300 animate-pulse" />
          StepClaim
        </Link>

        <CardTitle className="text-2xl font-black tracking-wide text-white">
          Welcome back
        </CardTitle>

        <div className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-950/40 px-3 py-1 text-[10px] uppercase tracking-wider text-cyan-200/85">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
          Secure login channel
        </div>

        <CardDescription className="mx-auto max-w-[300px] pt-2 text-sm text-slate-300">
          Sign in to continue tracking runs, capturing territory, and climbing the leaderboard.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-6 pb-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[11px] uppercase tracking-wider text-cyan-200/75"
            >
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

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[11px] uppercase tracking-wider text-cyan-200/75"
            >
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
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400">
            New to StepClaim?{" "}
            <Link
              href="/register"
              className="ml-1 font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
