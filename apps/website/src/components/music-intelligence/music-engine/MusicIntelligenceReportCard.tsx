import type { MusicIntelligenceReport, MusicEngineScope } from '@/lib/music-intelligence/music-engine-types';
import { StatusBadge } from '@/components/music-intelligence/workspace/WorkspaceShared';

const ACCENT: Record<MusicEngineScope, string> = {
  artist: 'text-[#00E5FF]',
  partner: 'text-[#6366F1]',
};

export default function MusicIntelligenceReportCard({
  report,
  scope,
}: {
  report: MusicIntelligenceReport;
  scope: MusicEngineScope;
}) {
  const accent = ACCENT[scope];

  return (
    <article
      className="rounded-2xl border border-white/10 bg-[#050512]/70 p-4"
      aria-label={`Music intelligence report for ${report.songTitle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-100">{report.songTitle}</p>
          <p className="text-xs text-gray-500">{report.artistName}</p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Score label="Quality" value={report.submissionQualityScore} accent={accent} />
        <Score label="Readiness" value={report.releaseReadinessScore} accent={accent} />
        <Score label="Metadata" value={report.metadataIntelligence.metadataQualityScore} accent={accent} />
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">Energy</p>
          <p className={`mt-1 text-sm font-bold ${accent}`}>{report.characteristics.energy ?? '—'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-gray-400 sm:grid-cols-2">
        <span>Genre: {report.characteristics.genre ?? '—'}</span>
        <span>Mood: {report.characteristics.mood ?? '—'}</span>
        <span>Language: {report.characteristics.language ?? '—'}</span>
        <span>BPM: {report.characteristics.bpm ?? '—'}</span>
      </div>
    </article>
  );
}

function Score({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-black tabular-nums ${accent}`}>{value}%</p>
    </div>
  );
}
