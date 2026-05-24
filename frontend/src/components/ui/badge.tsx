import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400',
        secondary: 'bg-purple-500/10 border border-purple-500/30 text-purple-300',
        destructive: 'bg-red-500/10 border border-red-500/30 text-red-400',
        success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
        outline: 'border border-white/10 text-slate-300 bg-white/5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
export default Badge;
