import Link from 'next/link';
import React from 'react';

interface MusicIntelligenceShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  badge?: string;
}

export default function MusicIntelligenceShell({
  eyebrow = 'AMD MUSIC INTELLIGENCE',
  title,
  description,
  children,
  badge,
}: MusicIntelligenceShellProps) {
  return (
    <main className="min-h-screen bg-[#05050e] text-gray-100 flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(0,229,255,0.12)_0%,_rgba(124,58,237,0.16)_35%,_transparent_75%)]" />
      </div>
      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/sl/pYP56C"
            className="rounded-full border border-[#7c3aed]/50 bg-[#050512]/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00E5FF] transition hover:border-[#00E5FF] hover:shadow-[0_0_16px_rgba(0,229,255,0.35)]"
          >
            ← Back to Smart Link
          </Link>
          {badge && (
            <span className="rounded-full border border-[#00E5FF]/45 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.25)]">
              {badge}
            </span>
          )}
        </div>
        <div
          className="rounded-3xl border border-[#7c3aed]/45 p-6 sm:p-10"
          style={{
            background: 'rgba(5,5,18,0.94)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 0 48px rgba(124,58,237,0.22), inset 0 0 0 1px rgba(0,229,255,0.08)',
          }}
        >
          <p className="font-black uppercase tracking-[0.28em] text-[#D4AF37]/90" style={{ fontSize: 'clamp(9px,1.6vw,11px)' }}>
            {eyebrow}
          </p>
          <h1
            className="mt-3 font-black uppercase text-white"
            style={{ fontSize: 'clamp(24px,5vw,40px)', letterSpacing: '0.08em', textShadow: '0 0 24px rgba(0,229,255,0.25)' }}
          >
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-gray-300 leading-relaxed" style={{ fontSize: 'clamp(14px,2.2vw,18px)' }}>
            {description}
          </p>
          {children}
        </div>
      </div>
    </main>
  );
}
