'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, Square, Flame, Footprints, Bike, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RunControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: (activityType: 'WALKING' | 'RUNNING' | 'CYCLING') => Promise<void>;
  onPause: () => void;
  onResume: () => void;
  onStop: () => Promise<void>;
}

export const RunControls: React.FC<RunControlsProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleStart = async (type: 'WALKING' | 'RUNNING' | 'CYCLING') => {
    setLoading(true);
    try {
      await onStart(type);
      setShowConfig(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await onStop();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto p-4 z-40">
      <AnimatePresence mode="wait">
        {!isRunning ? (
          /* Start Config Drawer */
          !showConfig ? (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <Button
                size="lg"
                onClick={() => setShowConfig(true)}
                className="w-full h-12 bg-linear-to-r from-cyan-500 to-purple-600 font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300"
              >
                <Play className="h-4 w-4 mr-2" />
                Initialize Activity
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-3 gap-3 w-full bg-[#0d0d15]/95 border border-white/10 p-4 rounded-xl backdrop-blur-md"
            >
              {/* Walking Option */}
              <Button
                onClick={() => handleStart('WALKING')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1.5 h-20 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 text-slate-200"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Footprints className="h-5 w-5 text-cyan-400" />}
                <span className="text-[10px] font-bold uppercase tracking-wide">Walk</span>
              </Button>

              {/* Running Option */}
              <Button
                onClick={() => handleStart('RUNNING')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1.5 h-20 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 text-slate-200"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Flame className="h-5 w-5 text-purple-400" />}
                <span className="text-[10px] font-bold uppercase tracking-wide">Run</span>
              </Button>

              {/* Cycling Option */}
              <Button
                onClick={() => handleStart('CYCLING')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1.5 h-20 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 text-slate-200"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bike className="h-5 w-5 text-emerald-400" />}
                <span className="text-[10px] font-bold uppercase tracking-wide">Cycle</span>
              </Button>
            </motion.div>
          )
        ) : (
          /* Active Workout Controls */
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-4 bg-[#0d0d15]/95 border border-white/10 p-3 rounded-full backdrop-blur-md shadow-2xl"
          >
            {/* Pause/Resume Toggle */}
            {isPaused ? (
              <Button
                size="icon"
                onClick={onResume}
                className="h-12 w-12 rounded-full bg-linear-to-r from-emerald-500 to-cyan-500 hover:opacity-90 shadow-md active:scale-95"
              >
                <Play className="h-5 w-5 text-white" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={onPause}
                className="h-12 w-12 rounded-full bg-linear-to-r from-amber-500 to-orange-500 hover:opacity-90 shadow-md active:scale-95"
              >
                <Pause className="h-5 w-5 text-white" />
              </Button>
            )}

            {/* Stop Workout Button */}
            <Button
              size="icon"
              onClick={handleStop}
              disabled={loading}
              className="h-12 w-12 rounded-full bg-linear-to-r from-rose-500 to-red-600 hover:opacity-90 shadow-md active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Square className="h-5 w-5 text-white" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default RunControls;
