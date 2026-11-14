'use client';

import React, { useState } from 'react';
import { useUserStore, calculateStepLength } from '@/store/useUserStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ruler, Weight, Footprints, Flame, Check, Sparkles, X } from 'lucide-react';

interface BodyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function BodyProfileModal({
  isOpen,
  onClose,
  title = 'Setup Body & Stride Profile',
  description = 'Your height and weight determine your exact stride size and live calorie calculation.',
}: BodyProfileModalProps) {
  const user = useUserStore((state) => state.user);
  const updateBodyProfile = useUserStore((state) => state.updateBodyProfile);

  const [height, setHeight] = useState<number>(user?.height || 175);
  const [weight, setWeight] = useState<number>(user?.weight || 70);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const stepLengthMeters = calculateStepLength(height, 'WALKING');
  const strideCm = Math.round(stepLengthMeters * 100);
  const stepsPerKm = Math.round(1000 / stepLengthMeters);

  const handleSave = () => {
    const validHeight = Math.max(120, Math.min(240, Number(height) || 175));
    const validWeight = Math.max(30, Math.min(250, Number(weight) || 70));
    updateBodyProfile(validHeight, validWeight);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleUseDefault = () => {
    updateBodyProfile(175, 70);
    setHeight(175);
    setWeight(70);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-[#0f1416] border border-white/10 p-5 md:p-6 shadow-2xl relative flex flex-col gap-4 text-white"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-3 py-1">
          {/* Height */}
          <div className="flex flex-col gap-1.5 bg-black/40 p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-sky-400" /> Height (cm)
              </label>
              <span className="text-xs font-mono font-bold text-sky-400">{height} cm</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="130"
                max="220"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="flex-1 accent-[var(--color-primary)] cursor-pointer"
              />
              <Input
                type="number"
                value={height}
                min="120"
                max="240"
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-20 h-8 text-center text-xs font-mono bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1.5 bg-black/40 p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-amber-400" /> Weight (kg)
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">{weight} kg</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="40"
                max="150"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <Input
                type="number"
                value={weight}
                min="30"
                max="250"
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-20 h-8 text-center text-xs font-mono bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Biomechanical Stride Output Preview */}
          <div className="grid grid-cols-2 gap-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl p-3 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-semibold text-gray-400">Step Stride</span>
              <span className="text-sm font-bold text-white mt-0.5">{strideCm} cm</span>
              <span className="text-[10px] text-gray-400">({stepLengthMeters.toFixed(2)}m / step)</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-semibold text-gray-400">1 km Walking</span>
              <span className="text-sm font-bold text-[var(--color-primary)] mt-0.5">~{stepsPerKm.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400">estimated steps</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
          <Button
            onClick={handleSave}
            className="w-full h-10 rounded-xl bg-[var(--color-primary)] text-black font-bold hover:bg-[var(--color-primary)]/90 transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-black" /> Saved!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Save Body Profile
              </>
            )}
          </Button>

          <button
            onClick={handleUseDefault}
            className="text-xs text-gray-400 hover:text-gray-200 text-center py-1 transition-colors"
          >
            Use standard defaults (175 cm / 70 kg)
          </button>
        </div>
      </div>
    </div>
  );
}
