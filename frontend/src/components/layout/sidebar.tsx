"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MapPin,
  Trophy,
  Users,
  Activity,
  User,
  Settings,
  Hexagon,
} from "lucide-react";
import { cn } from "../../lib/utils";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/run", label: "Run", icon: MapPin },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-screen">
      {/* Logo Area */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <Hexagon className="h-8 w-8 text-cyan-400 transition-transform duration-500 group-hover:rotate-[30deg] drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-widest font-[family-name:var(--font-header)] uppercase">
            StepClaim
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-2 px-4 py-6 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 font-[family-name:var(--font-header)] uppercase",
                  active
                    ? "bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-2 border-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    active ? "text-cyan-400" : "text-slate-500",
                  )}
                />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Gradient Fade */}
      <div className="px-6 py-5 border-t border-white/5 bg-[#0a0a0f]/50">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-[family-name:var(--font-mono)] uppercase tracking-widest">
          <Hexagon className="h-3 w-3 text-cyan-500/50" />
          <span>StepClaim v1.4</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
