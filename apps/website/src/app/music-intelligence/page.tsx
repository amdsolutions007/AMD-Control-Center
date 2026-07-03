import type { Metadata } from 'next';
import Link from 'next/link';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';

export const metadata: Metadata = {
  title: 'AMD Music Intelligence — About',
  description: 'The official intelligence layer powering Chrome AfroFusion Radio and the AMD Music Intelligence ecosystem.',
};

export default function MusicIntelligenceAboutPage() {
  return (
    <MusicIntelligenceShell
      title="About AMD Music Intelligence"
      description="AMD Music Intelligence is the strategic command layer behind Chrome AfroFusion Radio — unifying smart links, streaming routing, audience signals, and AI-powered curation into one premium ecosystem."
    >
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Smart Link Gateway', detail: 'One link routes fans to every major streaming platform.' },
          { label: 'Editorial Intelligence', detail: 'Curated Afrofusion programming with weekly flagship drops.' },
          { label: 'Audience Signals', detail: 'Campaign analytics and platform intelligence in development.' },
          { label: 'Agent 007 Mode', detail: 'Executive-grade music intelligence reporting on the roadmap.' },
        ].map(({ label, detail }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-[#050512]/80 p-4"
            style={{ boxShadow: '0 0 18px rgba(124,58,237,0.15)' }}
          >
            <h2 className="font-black uppercase tracking-[0.12em] text-[#00E5FF]" style={{ fontSize: 'clamp(10px,1.8vw,12px)' }}>
              {label}
            </h2>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/music-intelligence/platforms"
          className="rounded-full border border-[#00E5FF]/50 bg-[#050512]/90 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#00E5FF] transition hover:shadow-[0_0_20px_rgba(0,229,255,0.35)]"
        >
          Supported Platforms
        </Link>
        <Link
          href="/sl/pYP56C"
          className="rounded-full border border-[#D4AF37]/50 bg-[#050512]/90 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] transition hover:shadow-[0_0_20px_rgba(212,175,55,0.35)]"
        >
          Open Smart Link
        </Link>
      </div>
    </MusicIntelligenceShell>
  );
}
