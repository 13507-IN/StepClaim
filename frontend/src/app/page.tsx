'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Map, Zap, Trophy, ShieldAlert } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[var(--color-primary)] flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">StepClaim</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="font-semibold shadow-lg shadow-[var(--color-primary)]/20">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-8 border border-[var(--color-primary)]/20"
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-[var(--color-primary)]"></span>
            <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
          </span>
          Live GPS Tracking Active
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6"
        >
          Conquer The World <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
            With Every Step.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-[var(--color-foreground)]/70 max-w-2xl mb-10"
        >
          Transform your daily runs, walks, and cycling into a real-world territory conquest game. Claim neighborhoods, level up your avatar, and dominate the global leaderboard.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-lg h-14 px-8 shadow-xl shadow-[var(--color-primary)]/20 rounded-xl">
              Start Claiming Now
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-lg h-14 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              View Dashboard
            </Button>
          </Link>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Map className="w-6 h-6 text-[var(--color-primary)]" />}
            title="Real-World Conquest"
            description="Our H3 Hexagonal Grid system maps the globe. Your live GPS coordinates actively capture territories as you move."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Trophy className="w-6 h-6 text-[#f59e0b]" />}
            title="RPG Progression"
            description="Gain XP for every kilometer traveled and every new hex captured. Level up to unlock new tiers and achievements."
            delay={0.5}
          />
          <FeatureCard 
            icon={<ShieldAlert className="w-6 h-6 text-[var(--color-destructive)]" />}
            title="Anti-Cheat Engine"
            description="Advanced backend velocity heuristics ensure all captures are performed at realistic human speeds."
            delay={0.6}
          />
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--color-border)] py-8 text-center">
        <p className="text-sm text-[var(--color-foreground)]/50">
          © {new Date().getFullYear()} StepClaim. Real-world movement game.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="p-6 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-sm"
    >
      <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center mb-4 border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-[var(--color-foreground)]/60 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
