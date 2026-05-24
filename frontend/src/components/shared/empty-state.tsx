'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/2 max-w-sm mx-auto">
      <div className="p-4 rounded-full bg-white/5 border border-white/5 text-slate-400 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
      <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[250px]">{message}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction} className="mt-5">
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
