"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  iconColorClass?: string;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  description,
  iconColorClass = "text-cyan-400",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="w-full"
    >
      <Card className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 shadow-2xl hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group relative overflow-hidden rounded-2xl">
        <CardContent className="flex items-start gap-5 p-6 relative z-10">
          <div
            className={`mt-0.5 rounded-xl border border-white/10 bg-white/5 p-3 ${iconColorClass} transition-transform duration-500 group-hover:scale-110 shadow-inner`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-[family-name:var(--font-header)]">
              {label}
            </p>
            <h4 className="mt-3 truncate text-4xl font-black leading-none text-white font-[family-name:var(--font-mono)]">
              {value}
            </h4>
            {description && (
              <p className="mt-2.5 truncate text-xs leading-relaxed text-slate-500">
                {description}
              </p>
            )}
          </div>
        </CardContent>
        {/* Subtle hover gradient flare */}
        <div className="absolute -inset-x-4 -inset-y-4 z-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl" />
      </Card>
    </motion.div>
  );
};
export default StatsCard;
