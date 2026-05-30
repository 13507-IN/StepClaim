import Link from 'next/link';
import { Github, Twitter, Hexagon } from 'lucide-react';
import { Separator } from '../ui/separator';

const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Live Run', href: '/run' },
];

const appLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Friends', href: '/friends' },
  { label: 'Leaderboard', href: '/leaderboard' },
];

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/stepclaim', icon: Github },
  { label: 'Twitter', href: 'https://twitter.com/stepclaim', icon: Twitter },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06080f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Hexagon className="h-6 w-6 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-lg font-bold text-transparent">
                StepClaim
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Claim territory in the real world. Walk, run, and compete to
              dominate the map with every step you take.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              App
            </h3>
            <ul className="space-y-3">
              {appLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Connect
            </h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} StepClaim. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
