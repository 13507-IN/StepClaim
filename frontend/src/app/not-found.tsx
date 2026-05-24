'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden p-5">
      {/* Dynamic backdrops mesh glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hex grid mesh layout overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-6 relative z-10 border border-white/10 bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
      >
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 w-fit mx-auto animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-white tracking-tight uppercase font-mono">404</h2>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Sector Uncharted</h3>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            The coordinates you input do not snapshot to any registered virtual sectors. Redirect back to command.
          </p>
        </div>

        <Button asChild size="lg" className="w-full h-11 text-xs font-bold uppercase tracking-wider">
          <Link href="/dashboard" className="flex items-center justify-center gap-1.5">
            <Compass className="h-4 w-4 mr-1 animate-spin" style={{ animationDuration: '4s' }} />
            Back to Command
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
