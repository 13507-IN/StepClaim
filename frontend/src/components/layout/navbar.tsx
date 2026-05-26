'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  MapPin,
  Trophy,
  Users,
  Settings,
  LogOut,
  Hexagon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { getInitials } from '../../lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/run', label: 'Run', icon: MapPin },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/friends', label: 'Friends', icon: Users },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isShellRoute = pathname.startsWith('/dashboard')
    || pathname.startsWith('/run')
    || pathname.startsWith('/leaderboard')
    || pathname.startsWith('/friends')
    || pathname.startsWith('/activity')
    || pathname.startsWith('/profile')
    || pathname.startsWith('/settings');

  return (
    <>
      <nav
        className={cn(
          'z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10',
          isShellRoute ? 'sticky top-0 left-0 right-0' : 'fixed top-0 inset-x-0'
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={cn('flex h-16 items-center justify-between', isShellRoute && 'lg:justify-end')}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group lg:hidden">
              <Hexagon className="h-7 w-7 text-cyan-400 transition-transform group-hover:rotate-[30deg]" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                StepClaim
              </span>
            </Link>
 
            {/* Desktop Nav Links */}
            {isAuthenticated && (
              <div className="hidden md:flex lg:hidden items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        active
                          ? 'bg-white/10 text-cyan-400'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
 
            {/* Right Side */}
            <div className="ml-auto flex items-center gap-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full outline-none ring-offset-2 ring-offset-[#0a0a0f] focus-visible:ring-2 focus-visible:ring-cyan-400">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-cyan-400 text-xs">
                          {getInitials(user?.username ?? '')}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-[#0f0f1a]/95 backdrop-blur-xl border border-white/10 text-slate-200"
                  >
                    <DropdownMenuLabel className="text-slate-400 font-normal text-xs">
                      {user?.email ?? user?.username}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="flex items-center gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login" className="text-slate-300 hover:text-white">
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link
                      href="/register"
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500"
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sliding Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0a0a0f]/95 backdrop-blur-xl border-l border-white/10 md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  StepClaim
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-1">
                {isAuthenticated ? (
                  <>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                            active
                              ? 'bg-white/10 text-cyan-400'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}

                    <div className="my-3 border-t border-white/10" />

                    <Link
                      href="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-all"
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
export default Navbar;
