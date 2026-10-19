'use client';

import { Hexagon, LayoutDashboard, MapPin, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { authService } from '@/services/auth.api';
import Image from 'next/image';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/run', label: 'Live Run', icon: MapPin },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useUserStore((state) => state.token);
  const setAuth = useUserStore((state) => state.setAuth);
  const clearAuth = useUserStore((state) => state.clearAuth);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (token) {
        setSessionReady(true);
        return;
      }

      try {
        const refresh = await authService.refresh();
        const accessToken = refresh.data?.accessToken;
        if (!refresh.success || !accessToken) {
          throw new Error('Session could not be refreshed');
        }
        const currentUser = await authService.getMe();
        if (!currentUser.success || !currentUser.data?.user) {
          throw new Error('User session could not be restored');
        }
        setAuth(currentUser.data.user, accessToken);
      } catch {
        clearAuth();
        router.replace('/login');
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [token, setAuth, clearAuth, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Restoring your session…
      </div>
    );
  }

  return (
      <div className="relative flex h-dvh min-h-screen overflow-hidden text-[var(--color-foreground)]">
      {/* Shared Background Ambience for all Dashboard pages */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/background.jpg" 
          alt="Dashboard Background" 
          fill
          sizes="100vw"
          className="object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[var(--color-background)]/90 to-black/80" />
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent)]/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="relative z-10 hidden w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#090f1a]/75 backdrop-blur-xl md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="group flex items-center gap-3 font-black tracking-tight text-white transition-opacity hover:opacity-85">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/15">
              <Hexagon className="h-5 w-5" />
            </span>
            <span className="text-xl">StepClaim</span>
          </Link>
        </div>
        <nav aria-label="Dashboard navigation" className="mt-5 flex flex-1 flex-col gap-1.5 px-3">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === '/run' && pathname.startsWith('/run/'));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-sky-300/10 text-sky-200 ring-1 ring-inset ring-sky-300/15'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] transition-colors ${active ? 'text-sky-300' : 'text-slate-500 group-hover:text-slate-200'}`} />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-300" />}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="mb-3 border-t border-white/[0.08] p-3 pt-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-400/10 hover:text-rose-200"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#090f1a]/85 px-4 backdrop-blur-xl md:hidden">
          <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-400 text-slate-950">
              <Hexagon className="h-4 w-4" />
            </span>
            <span className="text-lg">StepClaim</span>
          </Link>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Page Content */}
        <div className="min-h-0 flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </div>

        <nav
          aria-label="Mobile dashboard navigation"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/10 bg-[#090f1a]/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_35px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:hidden"
        >
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === '/run' && pathname.startsWith('/run/'));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${
                  active ? 'text-sky-200' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                <span className={`flex h-7 w-10 items-center justify-center rounded-xl ${active ? 'bg-sky-300/10' : ''}`}>
                  <Icon className={`h-[18px] w-[18px] ${active ? 'text-sky-300' : ''}`} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
