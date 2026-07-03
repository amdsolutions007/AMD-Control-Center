import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MusicIntelligenceShell from '@/components/music-intelligence/MusicIntelligenceShell';
import { getComingSoonModule } from '@/lib/music-intelligence-modules';

interface PageProps {
  params: Promise<{ module: string }> | { module: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const mod = getComingSoonModule(resolved.module);
  if (!mod) return { title: 'Module Not Found' };
  return {
    title: `${mod.headline} — Coming Soon | AMD Music Intelligence`,
    description: mod.description,
  };
}

export default async function ComingSoonModulePage({ params }: PageProps) {
  const resolved = await params;
  const mod = getComingSoonModule(resolved.module);
  if (!mod) notFound();

  return (
    <MusicIntelligenceShell
      badge="Coming Soon"
      title={mod.headline}
      description={mod.description}
    >
      <p className="mt-6 text-sm text-gray-500 uppercase tracking-[0.2em] font-bold">
        Phase 2 Intelligence Platform — In Development
      </p>
      <Link
        href="/sl/pYP56C"
        className="mt-8 inline-flex rounded-full border border-[#00E5FF]/45 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#00E5FF] transition hover:shadow-[0_0_20px_rgba(0,229,255,0.35)]"
      >
        Return to Smart Link
      </Link>
    </MusicIntelligenceShell>
  );
}
