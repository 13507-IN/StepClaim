'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  xp?: number;
  totalDistance?: number;
  territoryCount?: number;
  score?: number; // fallback score
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  scoreType: 'XP' | 'DISTANCE' | 'TERRITORIES';
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, scoreType }) => {
  // Format the score value nicely based on column type
  const formatScore = (entry: LeaderboardEntry) => {
    const rawScore = entry.xp ?? entry.totalDistance ?? entry.territoryCount ?? entry.score ?? 0;
    
    if (scoreType === 'XP') {
      return `${rawScore.toLocaleString()} XP`;
    } else if (scoreType === 'DISTANCE') {
      const km = rawScore / 1000;
      return `${km.toFixed(2)} km`;
    } else if (scoreType === 'TERRITORIES') {
      return `${rawScore} hexes`;
    }
    return rawScore.toString();
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/30';
      case 2:
        return 'text-slate-300 border-slate-400/20 bg-slate-400/5 hover:border-slate-400/30';
      case 3:
        return 'text-amber-600 border-amber-600/20 bg-amber-600/5 hover:border-amber-600/30';
      default:
        return 'text-slate-400 border-white/5 bg-white/1 hover:border-white/10';
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-white/3 backdrop-blur-md">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-white/10 bg-white/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <div className="col-span-2 text-center">Rank</div>
        <div className="col-span-6">Runner Profile</div>
        <div className="col-span-4 text-right">Activity Score</div>
      </div>

      {/* Table Body */}
      {entries.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No records found for this bracket. Get moving!
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {entries.map((entry, idx) => {
            const isTopThree = entry.rank <= 3;
            const styleClass = getRankStyle(entry.rank);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className={`grid grid-cols-12 gap-2 items-center px-5 py-3.5 border border-transparent transition-all duration-300 ${styleClass}`}
              >
                {/* Rank Number */}
                <div className="col-span-2 flex items-center justify-center font-mono font-bold text-sm">
                  {isTopThree ? (
                    <Trophy className="h-5 w-5 animate-pulse" />
                  ) : (
                    `#${entry.rank}`
                  )}
                </div>

                {/* Player Profile Details */}
                <div className="col-span-6 flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={entry.avatarUrl || undefined} />
                    <AvatarFallback>{entry.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      {entry.username}
                      {entry.id === localStorage.getItem('userId') && (
                        <span className="text-[9px] px-1 py-0.2 rounded-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wide">
                          Me
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Level {entry.level}</p>
                  </div>
                </div>

                {/* Rank Score */}
                <div className="col-span-4 text-right font-bold text-sm font-mono text-cyan-400">
                  {formatScore(entry)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default LeaderboardTable;
