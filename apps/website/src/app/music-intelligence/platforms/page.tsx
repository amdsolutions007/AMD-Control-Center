import type { Metadata } from 'next';
import Link from 'next/link';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';

export const metadata: Metadata = {
  title: 'Supported Streaming Platforms — AMD Music Intelligence',
  description: 'Every DSP connected through the Chrome AfroFusion Radio Smart Link gateway.',
};

const PLATFORMS = [
  { name: 'Spotify', status: 'Live' },
  { name: 'Apple Music', status: 'Live' },
  { name: 'Audiomack', status: 'Live' },
  { name: 'Boomplay', status: 'Live' },
  { name: 'SoundCloud', status: 'Live' },
  { name: 'YouTube Music', status: 'Live' },
  { name: 'Amazon Music', status: 'Coming Soon' },
  { name: 'Deezer', status: 'Coming Soon' },
];

export default function MusicIntelligencePlatformsPage() {
  return (
    <MusicIntelligenceShell
      title="Supported Streaming Platforms"
      description="The AMD Music Intelligence Smart Link gateway routes fans to every active DSP from a single premium entry point."
    >
      <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PLATFORMS.map(({ name, status }) => {
          const live = status === 'Live';
          return (
            <div
              key={name}
              className="rounded-xl border px-3 py-4 text-center"
              style={{
                background: 'rgba(5,5,18,0.92)',
                borderColor: live ? 'rgba(0,229,255,0.35)' : 'rgba(124,58,237,0.35)',
                boxShadow: live ? '0 0 16px rgba(0,229,255,0.12)' : 'none',
              }}
            >
              <p className="font-black uppercase text-white" style={{ fontSize: 'clamp(9px,1.6vw,11px)' }}>{name}</p>
              <p className={`mt-2 text-[9px] font-black uppercase tracking-wider ${live ? 'text-[#00E5FF]' : 'text-[#7c3aed]'}`}>
                {status}
              </p>
            </div>
          );
        })}
      </div>
      <Link
        href="/sl/pYP56C"
        className="mt-8 inline-flex rounded-full border border-[#D4AF37]/50 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C] px-6 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[0_0_24px_rgba(255,215,0,0.35)]"
      >
        Open Streaming Gateway
      </Link>
    </MusicIntelligenceShell>
  );
}
