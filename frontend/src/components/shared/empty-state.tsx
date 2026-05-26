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
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 px-6 py-10 text-center">
      <div className="mb-5 rounded-full border border-white/10 bg-white/5 p-3.5 text-slate-400">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-bold leading-tight text-white">{title}</h3>
      <p className="mt-3 max-w-xl text-base leading-8 text-slate-300">{message}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction} className="mt-6 h-10 px-5 text-sm font-semibold tracking-wide">
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
