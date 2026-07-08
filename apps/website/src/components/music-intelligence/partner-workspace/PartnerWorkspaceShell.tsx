'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: '/music-intelligence/partner', label: 'Dashboard', exact: true },
  { href: '/music-intelligence/partner/profile', label: 'Organization Profile' },
  { href: '/music-intelligence/partner/artists', label: 'Artist Management' },
  { href: '/music-intelligence/partner/submissions', label: 'Submissions' },
  { href: '/music-intelligence/partner/analytics', label: 'Analytics' },
  { href: '/music-intelligence/partner/notifications', label: 'Notifications' },
  { href: '/music-intelligence/partner/settings', label: 'Settings' },
];

export default function PartnerWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#05050e] text-gray-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(99,102,241,0.12)_0%,_rgba(124,58,237,0.14)_40%,_transparent_75%)]" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/sl/pYP56C"
            className="rounded-full border border-[#7c3aed]/50 bg-[#050512]/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00E5FF] transition hover:border-[#00E5FF]"
          >
            ← Smart Link
          </Link>
          <span className="rounded-full border border-[#6366F1]/45 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#6366F1]">
            Partner Command Center
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav
            aria-label="Partner workspace navigation"
            className="rounded-2xl border border-[#6366F1]/40 bg-[#050512]/90 p-3 h-fit"
          >
            <p className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
              Enterprise Workspace
            </p>
            <ul className="space-y-1">
              {NAV.map(({ href, label, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] transition ${
                        active
                          ? 'bg-gradient-to-r from-[#6366F1]/40 to-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className="rounded-3xl border border-[#6366F1]/45 p-6 sm:p-8"
            style={{
              background: 'rgba(5,5,18,0.94)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 0 48px rgba(99,102,241,0.18)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
