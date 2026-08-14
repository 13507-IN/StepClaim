'use client';

import { Hexagon, LayoutDashboard, MapPin, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { authService } from '@/services/auth.api';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const clearAuth = useUserStore((state) => state.clearAuth);

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

  return (
    <div className="min-h-screen flex text-[var(--color-foreground)] overflow-hidden relative">
      {/* Shared Background Ambience for all Dashboard pages */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/background.jpg" 
          alt="Dashboard Background" 
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[var(--color-background)]/90 to-black/80" />
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent)]/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl hidden md:flex flex-col relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 text-[var(--color-primary)] font-black text-2xl tracking-tight hover:scale-105 transition-transform">
            <Hexagon className="h-7 w-7" />
            StepClaim
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 font-medium transition-all group">
            <LayoutDashboard className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            Dashboard
          </Link>
          <Link href="/run" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 font-medium transition-all group">
            <MapPin className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            Live Run
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 font-medium transition-all group">
            <User className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            Profile
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white text-slate-300 font-medium transition-all group">
            <Settings className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            Settings
          </Link>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-white/10 mb-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all font-semibold"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--color-primary)] font-black text-xl">
            <Hexagon className="h-6 w-6" />
            StepClaim
          </Link>
          <button onClick={handleLogout} className="p-2 text-red-400 rounded-lg hover:bg-red-500/20">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
