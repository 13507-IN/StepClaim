'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
  iconColorClass = 'text-cyan-400',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="w-full"
    >
      <Card className="hover:border-white/20 transition-all duration-300 hover:shadow-cyan-500/5 group">
        <CardContent className="flex items-start gap-4 p-5">
          <div className={`mt-0.5 rounded-lg border border-white/10 bg-white/5 p-2.5 ${iconColorClass} transition-transform duration-300 group-hover:scale-105`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
            <h4 className="mt-2 truncate font-mono text-4xl font-bold leading-none text-white">{value}</h4>
            {description && (
              <p className="mt-2 truncate text-xs leading-5 text-slate-500">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default StatsCard;
