"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-5">
      {/* Backdrops glowing gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>

      {/* Tactical Mesh Hex Grid Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E\")" }}
      ></div>

      {/* Screen Boundary Tech Accents (HUD Borders) */}
      <div className="absolute inset-4 border border-cyan-500/10 pointer-events-none z-0 rounded-lg hidden sm:block">
        {/* Faint Tech Details */}
        <div className="absolute top-3 left-4 text-[9px] font-[family-name:var(--font-mono)] text-cyan-400/40 uppercase tracking-widest">
          [StepClaim UI Core v1.4]
        </div>
        <div className="absolute top-3 right-4 text-[9px] font-[family-name:var(--font-mono)] text-purple-400/40 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          Secure Link: Stable
        </div>
        <div className="absolute bottom-3 left-4 text-[9px] font-[family-name:var(--font-mono)] text-slate-500/40 uppercase tracking-widest">
          Sector Latency: 24ms // Uplink active
        </div>
        <div className="absolute bottom-3 right-4 text-[9px] font-[family-name:var(--font-mono)] text-slate-500/40 uppercase tracking-widest">
          Coordinate Lock: Resolution 9
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
