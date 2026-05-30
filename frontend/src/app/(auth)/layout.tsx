"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06070f] p-5">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-[460px] w-[460px] rounded-full bg-cyan-500/12 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[460px] w-[460px] rounded-full bg-purple-500/12 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='54' height='54' viewBox='0 0 54 54' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M27 5 L47 16.5 L47 37.5 L27 49 L7 37.5 L7 16.5 Z' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='0.8'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-4 z-0 hidden rounded-xl border border-white/8 sm:block">
        <div className="absolute left-4 top-3 text-[10px] uppercase tracking-[0.2em] text-cyan-200/45">
          Secure Auth Portal
        </div>
        <div className="absolute right-4 top-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-purple-200/45">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
          encrypted session
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
