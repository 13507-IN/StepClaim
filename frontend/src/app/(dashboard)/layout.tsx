import { Hexagon, LayoutDashboard, MapPin, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
          <Link href="/" className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xl">
            <Hexagon className="h-6 w-6" />
            StepClaim
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] transition-colors">
            <LayoutDashboard className="h-5 w-5 text-slate-500" />
            Dashboard
          </Link>
          <Link href="/run" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] transition-colors">
            <MapPin className="h-5 w-5 text-slate-500" />
            Live Run
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] transition-colors">
            <User className="h-5 w-5 text-slate-500" />
            Profile
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] transition-colors">
            <Settings className="h-5 w-5 text-slate-500" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-lg">
            <Hexagon className="h-5 w-5" />
            StepClaim
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-background)]">
          {children}
        </div>
      </main>
    </div>
  );
}
