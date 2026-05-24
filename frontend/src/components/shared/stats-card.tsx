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
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`p-3 rounded-lg bg-white/5 border border-white/10 ${iconColorClass} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <h4 className="text-2xl font-bold text-white mt-1 font-mono truncate">{value}</h4>
            {description && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default StatsCard;
