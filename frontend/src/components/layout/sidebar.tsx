'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Trophy,
  Users,
  Activity,
  User,
  Settings,
  Hexagon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const sidebarItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/run', label: 'Run', icon: MapPin },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/friends', label: 'Friends', icon: Users },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-screen">
      {/* Logo Area */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <Hexagon className="h-7 w-7 text-cyan-400 transition-transform group-hover:rotate-[30deg]" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            StepClaim
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-white/5 text-cyan-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    active ? 'text-cyan-400' : 'text-slate-500'
                  )}
                />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Gradient Fade */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Hexagon className="h-3.5 w-3.5" />
          <span>StepClaim v1.0</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
