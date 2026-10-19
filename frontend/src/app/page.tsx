'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowRight,
  Footprints,
  Hexagon,
  Map,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Map,
    title: 'Make the map yours',
    description:
      'Head outside and explore. Your route becomes a chance to claim new territory in the world around you.',
    tone: 'text-sky-300 bg-sky-400/10 ring-sky-300/15',
  },
  {
    icon: Trophy,
    title: 'Progress with every move',
    description:
      'Build your distance, earn XP, grow your streak, and see your profile evolve as you keep showing up.',
    tone: 'text-amber-300 bg-amber-400/10 ring-amber-300/15',
  },
  {
    icon: ShieldCheck,
    title: 'Move with confidence',
    description:
      'Activity checks help keep territory fair, while clear live-run feedback keeps you in control.',
    tone: 'text-emerald-300 bg-emerald-400/10 ring-emerald-300/15',
  },
];

const steps = [
  { number: '01', title: 'Pick your pace', description: 'Choose a run, walk, or ride that fits your day.' },
  { number: '02', title: 'Explore nearby', description: 'Track your route and discover territory as you move.' },
  { number: '03', title: 'Build your legacy', description: 'Collect XP, grow your streak, and come back stronger.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Image
          src="/background.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.16] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080d19]/50 via-[var(--color-background)]/90 to-[var(--color-background)]" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-sky-500/15 blur-[120px]" />
        <div className="absolute -right-32 top-[30rem] h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="StepClaim home" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-transform group-hover:-rotate-6">
            <Hexagon className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">StepClaim</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold text-slate-300 hover:text-white">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-xl px-4 font-bold shadow-lg shadow-sky-500/20">
              <span className="hidden sm:inline">Create account</span>
              <span className="sm:hidden">Sign up</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-12 sm:px-8 md:pb-32 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-300/[0.07] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Your city is the playing field
            </div>
            <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl md:text-7xl">
              Go farther.
              <br />
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                Claim your world.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 lg:mx-0">
              Turn the miles you move into territory you own. Explore your neighborhood, build your streak, and make every outing count.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="h-13 w-full rounded-xl px-7 text-base font-bold shadow-xl shadow-sky-500/20 sm:w-auto">
                  Start your first run
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-13 w-full rounded-xl border-white/10 bg-white/[0.04] px-7 text-base font-semibold text-white hover:bg-white/10 sm:w-auto">
                  I have an account
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400 lg:justify-start">
              <Footprints className="h-4 w-4 text-sky-300" />
              Made for runs, walks, and rides
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative mx-auto w-full max-w-[540px]"
          >
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-sky-400/15 to-violet-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101827]/90 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-4">
              <div className="flex items-center justify-between px-3 pb-3 pt-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">The world is yours</p>
                  <p className="mt-1 text-lg font-bold text-white">Every route tells a story</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sky-300">
                  <MapPin className="h-5 w-5" />
                </span>
              </div>
              <div className="relative isolate aspect-[1.18] overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-[#101e2d]">
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(35deg,transparent_48%,rgba(148,163,184,.22)_49%,rgba(148,163,184,.22)_50%,transparent_51%),linear-gradient(145deg,transparent_46%,rgba(148,163,184,.16)_47%,rgba(148,163,184,.16)_48%,transparent_49%)] [background-size:110px_90px,140px_120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#101e2d_90%)]" />
                <div className="absolute left-[14%] top-[19%] h-[58%] w-[38%] rotate-[-17deg] rounded-[40%] border border-dashed border-sky-300/25 bg-sky-300/[0.035]" />
                <div className="absolute right-[9%] top-[14%] h-[46%] w-[35%] rotate-[21deg] rounded-[42%] border border-dashed border-violet-300/25 bg-violet-300/[0.035]" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 420" fill="none" aria-hidden="true">
                  <path d="M86 310C134 280 121 234 177 225C219 218 223 176 275 185C326 194 330 139 389 122" stroke="#38BDF8" strokeOpacity=".22" strokeWidth="16" strokeLinecap="round" />
                  <path d="M86 310C134 280 121 234 177 225C219 218 223 176 275 185C326 194 330 139 389 122" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
                  <circle cx="86" cy="310" r="10" fill="#7DD3FC" />
                  <circle cx="86" cy="310" r="20" stroke="#7DD3FC" strokeOpacity=".35" strokeWidth="2" />
                  <circle cx="389" cy="122" r="8" fill="#C4B5FD" />
                  <circle cx="389" cy="122" r="17" stroke="#C4B5FD" strokeOpacity=".35" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-[#09111f]/85 px-3.5 py-2.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-sky-300" />
                    Explore. Move. Make it yours.
                  </div>
                </div>
                <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#09111f]/75 text-violet-200 backdrop-blur-md">
                  <Hexagon className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5 pt-3">
                <PreviewStat label="Explore" value="Your city" />
                <PreviewStat label="Collect" value="Territory" />
                <PreviewStat label="Progress" value="Your way" />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#121c2b]/95 px-4 py-3 shadow-xl sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-400">Your next adventure</p>
                <p className="text-sm font-bold text-white">Starts just outside</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 md:pb-28">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Why StepClaim</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Movement with a little more meaning.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400 sm:text-right">
              A simple reason to take the long way home—and a satisfying way to see how far you&apos;ve come.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06]"
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${feature.tone}`}>
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.02]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Three steps. A whole new map.</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Your next chapter starts with a step.</h2>
              <Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-sky-300 transition hover:text-sky-200">
                Get started <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl border border-white/[0.08] bg-[#101827]/80 p-5">
                  <span className="text-xs font-black tracking-[0.16em] text-sky-300">{step.number}</span>
                  <h3 className="mt-4 font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-sky-300/15 bg-gradient-to-br from-sky-500/15 via-[#111b2c] to-violet-500/10 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
            <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-sky-200">Ready when you are</p>
            <h2 className="relative mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">The best route is the one you take.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Create your account, head outside, and start turning your movement into something you can call your own.
            </p>
            <Link href="/register" className="relative mt-7 inline-flex">
              <Button size="lg" className="h-12 rounded-xl px-6 font-bold shadow-xl shadow-sky-500/20">
                Claim your first territory <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <Link href="/" className="flex items-center gap-2 text-sm font-extrabold text-slate-300">
            <Hexagon className="h-4 w-4 text-sky-300" /> StepClaim
          </Link>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} StepClaim. Move your way.</p>
        </div>
      </footer>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-slate-200 sm:text-sm">{value}</p>
    </div>
  );
}
