'use client';

import { Hexagon, LayoutDashboard, MapPin, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { authService } from '@/services/auth.api';

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
      <div className="relative flex h-dvh min-h-screen overflow-hidden bg-[#0a0d0f] text-[var(--color-foreground)]">
      {/* Shared shell: elevation comes from a single surface step, not glass or glow. */}
      <aside className="relative z-10 hidden w-60 shrink-0 flex-col border-r border-[#20282b] bg-[#0a0d0f] md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="group flex items-center gap-3 font-black tracking-tight text-white transition-opacity hover:opacity-85">
            <span className="flex h-9 w-9 items-center justify-center bg-[var(--color-primary)] text-[#071011] [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)]">
              <Hexagon className="h-5 w-5" />
            </span>
            <span className="text-xl">StepClaim</span>
          </Link>
        </div>
        <p className="px-6 pt-7 text-xs text-[#949494]">Your territory</p>
        <nav aria-label="Dashboard navigation" className="mt-3 flex flex-1 flex-col gap-1 px-4">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === '/run' && pathname.startsWith('/run/'));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#1a2224] text-white'
                    : 'text-[#a4b1b3] hover:text-white'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] transition-colors ${active ? 'text-white' : 'text-[#949fa2] group-hover:text-white'}`} />
                {label}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="m-4 border-t border-[#20282b] pt-3">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#e86f70] transition-colors hover:bg-[#281719] hover:text-[#f29494]"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#20282b] bg-[#0a0d0f] px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center bg-[var(--color-primary)] text-[#071011] [clip-path:polygon(25%_6%,75%_6%,100%_50%,75%_94%,25%_94%,0_50%)]">
              <Hexagon className="h-4 w-4" />
            </span>
            <span className="text-lg">StepClaim</span>
          </Link>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="p-2.5 text-[#a4b1b3] transition-colors hover:bg-[#281719] hover:text-[#e86f70]"
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
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#20282b] bg-[#0a0d0f] px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 md:hidden"
        >
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === '/run' && pathname.startsWith('/run/'));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors ${
                  active ? 'text-white' : 'text-[#949494] hover:text-white'
                }`}
              >
                <span className={`flex h-7 w-10 items-center justify-center ${active ? 'border-b border-[var(--color-primary)]' : ''}`}>
                  <Icon className={`h-[18px] w-[18px] ${active ? 'text-white' : ''}`} />
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
