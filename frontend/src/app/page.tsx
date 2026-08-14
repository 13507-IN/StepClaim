'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Map, Zap, Trophy, ShieldAlert } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] overflow-hidden relative">
      {/* Background Image & Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/background.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[var(--color-background)]/80 to-[var(--color-background)]" />
      </div>

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary)]/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/10 blur-[120px] rounded-full pointer-events-none z-0" />

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
      {/* How it Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black mb-4"
          >
            How StepClaim Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[var(--color-foreground)]/70 text-lg max-w-2xl mx-auto"
          >
            It's simple. Get outside, start moving, and watch your empire grow.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[40%] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)]/30 to-transparent -z-10" />
          
          <StepCard 
            number="01"
            title="Start Tracking"
            description="Open the app and start a run, walk, or bike ride. Your GPS path is recorded live."
            delay={0.2}
          />
          <StepCard 
            number="02"
            title="Claim Hexagons"
            description="As you physically move through the real world, you automatically capture H3 grid territories."
            delay={0.3}
          />
          <StepCard 
            number="03"
            title="Level Up"
            description="Gain XP for distance and captures. Outrank your friends and dominate the leaderboard."
            delay={0.4}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 bg-white/5 dark:bg-black/40 backdrop-blur-lg border-y border-white/5 py-24 mb-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatBox value="10M+" label="Hexagons Claimed" delay={0.1} />
          <StatBox value="500k" label="Active Explorers" delay={0.2} />
          <StatBox value="12M km" label="Distance Covered" delay={0.3} />
          <StatBox value="100+" label="Countries Active" delay={0.4} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black mb-6"
        >
          Ready to Build Your Empire?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-[var(--color-foreground)]/70 mb-10"
        >
          Join thousands of players already exploring their neighborhoods and claiming their territories.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/register">
            <Button size="lg" className="text-lg h-16 px-10 shadow-xl shadow-[var(--color-primary)]/20 rounded-xl">
              Create Your Account
            </Button>
          </Link>
        </motion.div>
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

function StepCard({ number, title, description, delay }: { number: string, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-2xl font-black mb-6 border border-[var(--color-primary)]/20 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)]">
        {number}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-[var(--color-foreground)]/60 leading-relaxed max-w-sm">
        {description}
      </p>
    </motion.div>
  );
}

function StatBox({ value, label, delay }: { value: string, label: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-2">
        {value}
      </div>
      <div className="text-sm uppercase tracking-widest text-[var(--color-foreground)]/50 font-semibold">
        {label}
      </div>
    </motion.div>
  );
}
