"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Footprints,
  Globe,
  Map,
  MapPin,
  ShieldCheck,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Active players", value: "14.2K+" },
  { label: "Hexes claimed", value: "82.5K+" },
  { label: "Distance tracked", value: "120.4K km" },
  { label: "Countries active", value: "35+" },
];

const features = [
  {
    title: "Real-time GPS tracking",
    description:
      "Track routes live and turn movement into map control with accurate pace and distance data.",
    icon: MapPin,
    tone: "text-cyan-300",
  },
  {
    title: "Hex-based territory map",
    description:
      "H3 hexes make every capture easy to understand while keeping gameplay fair and strategic.",
    icon: Map,
    tone: "text-violet-300",
  },
  {
    title: "Anti-cheat protection",
    description:
      "Server-side speed and location validation helps keep progression and competition trustworthy.",
    icon: ShieldCheck,
    tone: "text-emerald-300",
  },
  {
    title: "Leveling and streaks",
    description:
      "Earn XP each run, keep daily streaks alive, and climb through levels by staying consistent.",
    icon: Trophy,
    tone: "text-amber-300",
  },
  {
    title: "Competitive leaderboards",
    description:
      "Compete globally or with friends to see who owns the most territory and momentum.",
    icon: TrendingUp,
    tone: "text-sky-300",
  },
  {
    title: "Social fitness loop",
    description:
      "Follow friends, compare activity, and stay motivated through collaborative competition.",
    icon: Users,
    tone: "text-indigo-300",
  },
];

const steps = [
  {
    title: "Start a run",
    description:
      "Choose walking, running, or cycling, then begin a live session from your dashboard.",
  },
  {
    title: "Capture nearby hexes",
    description:
      "As you move, your route intersects territory cells that get claimed in real time.",
  },
  {
    title: "Build your rank",
    description:
      "Stack XP, defend your map control, and rise in the leaderboard with every session.",
  },
];

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
  };

  return (
    <div className="min-h-screen bg-[#06070f] flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden pt-30 pb-18 md:pt-36 md:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute left-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-cyan-200">
              <Flame className="h-3.5 w-3.5 fill-cyan-300 text-cyan-300" />
              Real-world movement meets strategy gameplay
            </span>

            <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              Capture territory with every
              <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-purple-300 bg-clip-text text-transparent">
                {" "}
                step you take
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              StepClaim turns walks, runs, and rides into a competitive map game.
              Explore your city, claim hexes, and build your rank with every session.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 w-full border border-white/20 bg-gradient-to-br from-cyan-500 to-purple-600 px-8 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:from-cyan-400 hover:to-purple-500 sm:w-auto"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Start Playing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full border border-white/15 bg-white/5 px-8 text-sm text-slate-100 hover:bg-white/10 sm:w-auto"
              >
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/8 bg-white/4 py-10 backdrop-blur-lg">
        <div className="container mx-auto max-w-5xl px-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/8 bg-white/4 px-4 py-5 text-center"
              >
                <p className="text-2xl font-black text-cyan-200 md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto max-w-6xl px-5">
          <div className="mb-14 space-y-3 text-center">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              Built for consistent training and real competition
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              Every mechanic is designed to make movement rewarding, strategic, and social.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div variants={itemVariants} key={feature.title}>
                  <Card className="group h-full overflow-hidden rounded-2xl border-white/8 bg-white/5 shadow-2xl backdrop-blur-xl">
                    <CardContent className="space-y-4 p-6">
                      <div
                        className={`w-fit rounded-lg border border-white/15 bg-white/5 p-3 transition-transform duration-300 group-hover:scale-105 ${feature.tone}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 border-y border-white/8 bg-white/4 py-20"
      >
        <div className="container mx-auto max-w-5xl px-5">
          <div className="mb-14 space-y-3 text-center">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              How StepClaim works
            </h2>
            <p className="mx-auto max-w-xl text-sm text-slate-300 md:text-base">
              Three steps to convert everyday activity into progression and map control.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-500/10 text-sm font-bold text-cyan-200">
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden border-t border-white/8 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/12 to-purple-500/12" />
        <div className="container relative z-10 mx-auto max-w-4xl space-y-6 px-5 text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Ready to claim your first hex?
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-200 md:text-base">
            Create your account, head outside, and start building a territory map from your real routes.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 border border-white/20 bg-gradient-to-br from-cyan-500 to-purple-600 px-10 text-sm font-semibold text-white hover:from-cyan-400 hover:to-purple-500"
            >
              <Link href="/register">Create free account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/15 bg-white/5 px-8 text-sm text-slate-100"
            >
              <Link href="/leaderboard" className="flex items-center gap-2">
                View leaderboard
                <Trophy className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/8 py-10">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              Fitness with strategy, community, and progression.
            </p>
            <p className="text-sm text-slate-400">
              Walk more. Capture more. Improve consistently.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <Footprints className="h-3.5 w-3.5 text-cyan-300" />
            <Globe className="h-3.5 w-3.5 text-purple-300" />
            Global multiplayer fitness map
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
