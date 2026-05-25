"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  Trophy,
  Flame,
  Award,
  Users,
  MapPin,
  ArrowRight,
  TrendingUp,
  Globe,
  Footprints,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Dynamic Header Navbar */}
      <Navbar />

      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden flex items-center justify-center">
        {/* Glow Gradients Backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tactical Mesh Hex Grid Background Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="container max-w-6xl mx-auto px-5 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-xs font-cyber-mono font-bold uppercase tracking-wider animate-pulse">
              <Flame className="h-3.5 w-3.5 fill-cyan-400" />
              The Real-World Territory Strategy Fitness Game
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-widest leading-tight max-w-4xl mx-auto font-cyber-header uppercase">
              Claim Your Territory, <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-400 via-teal-300 to-purple-500">
                One Step at a Time
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Transform your physical walks, runs, and bike rides into strategic
              conquest. Explore your real life neighborhood, capture virtual H3
              hexagons on a live map, and defend your sector against online
              rivals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="cyber-button w-full sm:w-auto h-12 px-8 text-sm font-cyber-header font-bold uppercase tracking-wider shadow-lg"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Enlist Now
                  <ArrowRight className="h-4 w-4 animate-bounce" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-sm font-cyber-header font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <Link href="#how-it-works">[ Learn Mechanics ]</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Statistics Banner ─────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/1 backdrop-blur-md relative z-10 py-10">
        <div className="container max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-3xl font-black text-cyan-400 font-cyber-mono">
                14,200+
              </h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-cyber-mono mt-1">
                // Active Runners
              </p>
            </div>
            <div>
              <h4 className="text-3xl font-black text-cyan-400 font-cyber-mono">
                82,500+
              </h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-cyber-mono mt-1">
                // Sectors Claimed
              </p>
            </div>
            <div>
              <h4 className="text-3xl font-black text-cyan-400 font-cyber-mono">
                120,400+
              </h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-cyber-mono mt-1">
                // Kilometers Traveled
              </p>
            </div>
            <div>
              <h4 className="text-3xl font-black text-cyan-400 font-cyber-mono">
                35+
              </h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-cyber-mono mt-1">
                // Countries Claimed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Features Grid ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 relative z-10">
        <div className="container max-w-6xl mx-auto px-5">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-black text-white tracking-widest uppercase font-cyber-header">
              Game Mechanics
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-cyber-mono">
              // Engineered with advanced geospatial mathematics and premium
              tactical layouts.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* GPS Tracking */}
            <motion.div variants={itemVariants}>
              <Card className="glass-cyber border-0 h-full group relative overflow-visible shadow-lg">
                {/* HUD Corners */}
                <div className="cyber-corner-tl" />
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="cyber-corner-br" />

                <CardContent className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit group-hover:scale-110 transition-transform duration-300">
                    <Compass className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide font-cyber-header">
                    Live GPS Tracking
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Integrated directly with hardware sensors via geolocation
                    watchPosition. Monitors speeds, tracks path polyline
                    coordinates, and records routes incrementally.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* H3 Grid Map */}
            <motion.div variants={itemVariants}>
              <Card className="glass-cyber border-0 h-full group relative overflow-visible shadow-lg">
                {/* HUD Corners */}
                <div className="cyber-corner-tl" />
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="cyber-corner-br" />

                <CardContent className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide font-cyber-header">
                    H3 Hexagonal Grid
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Powered by Uber H3 resolution 9 geospatial indexes. Every
                    coordinate snaps atomically to a hexagonal sector,
                    eliminating complex polygons overlaps.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anti-Cheat Engine */}
            <motion.div variants={itemVariants}>
              <Card className="glass-cyber border-0 h-full group relative overflow-visible shadow-lg">
                {/* HUD Corners */}
                <div className="cyber-corner-tl" />
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="cyber-corner-br" />

                <CardContent className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide font-cyber-header">
                    Anti-Cheat Engine
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Advanced serverside filters. Analyzes velocities and checks
                    temporal teleport leaps via the Haversine formula to reject
                    mock coordinates.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gamification */}
            <motion.div variants={itemVariants}>
              <Card className="glass-cyber border-0 h-full group relative overflow-visible shadow-lg">
                {/* HUD Corners */}
                <div className="cyber-corner-tl" />
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="cyber-corner-br" />

                <CardContent className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 w-fit group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide font-cyber-header">
                    Progression & XP
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Earn experience points for moving. Walk, run, or cycle at
                    custom XP rates. Level up from a Beginner up to a Legend,
                    checking stats thresholds.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Badges & Streaks */}
            <motion.div variants={itemVariants}>
              <Card className="glass-cyber border-0 h-full group relative overflow-visible shadow-lg">
                {/* HUD Corners */}
                <div className="cyber-corner-tl" />
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="cyber-corner-br" />

                <CardContent className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 w-fit group-hover:scale-110 transition-transform duration-300">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide font-cyber-header">
                    Badges & Streaks
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Earn specialty achievements like Marathoner, Explorer, or
                    Night Runner. Maintain daily exercise streaks (requires 1km
                    target completed daily).
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Competitions */}
            <motion.div variants={itemVariants}>
              <Card className="glass-cyber border-0 h-full group relative overflow-visible shadow-lg">
                {/* HUD Corners */}
                <div className="cyber-corner-tl" />
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="cyber-corner-br" />

                <CardContent className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide font-cyber-header">
                    Social Networks
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Add workout friends, track their live locations on map,
                    monitor social feeds, and climb private Friends brackets on
                    leaderboards.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 border-t border-white/5 bg-white/1 relative z-10"
      >
        <div className="container max-w-5xl mx-auto px-5">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-extrabold text-white uppercase">
              Operational Loop
            </h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Three simple steps to establish command over your municipality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-linear-to-r from-cyan-500/20 to-purple-600/20 -translate-y-1/2 hidden md:block z-0"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0f] border border-cyan-500 text-cyan-400 flex items-center justify-center font-bold text-lg font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                1
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Start Moving
              </h3>
              <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                Fire up the Live Run page, select your exercise (Walking,
                Running, or Cycling), and watch your GPS track active
                coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0f] border border-purple-500 text-purple-400 flex items-center justify-center font-bold text-lg font-mono shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                2
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Capture Hexagons
              </h3>
              <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                As you physically intersect empty or enemy sectors, snapping
                triggers transfer ownership and locks the sector for 30s.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0f] border border-yellow-500 text-yellow-400 flex items-center justify-center font-bold text-lg font-mono shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                3
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Climb Leaderboard
              </h3>
              <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                Collect XP rewards, grow streaks, level up, unlock rare
                achievements, and claim your spot on the Global ranks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Call to Action ────────────────────────────────────────────────────── */}
      <section className="py-20 relative z-10 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-purple-600/10 opacity-40"></div>
        <div className="container max-w-4xl mx-auto px-5 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            Claim Your First Sector Today
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Create your account in less than a minute, set up your profile
            avatar, and step outside to capture your neighborhood.
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 px-10 text-sm font-bold uppercase tracking-wider mt-4"
          >
            <Link href="/register">Join the Battle</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
