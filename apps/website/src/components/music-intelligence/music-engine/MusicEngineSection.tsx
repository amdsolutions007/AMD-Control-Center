'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { MusicEnginePayload, MusicEngineScope, MusicIntelligenceReport } from '@/lib/music-intelligence/music-engine-types';
import MusicEngineModule from './MusicEngineModule';
import MusicIntelligenceReportCard from './MusicIntelligenceReportCard';
import SubmissionTimelinePanel from './SubmissionTimelinePanel';

const ENDPOINTS: Record<MusicEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/music-engine',
  partner: '/api/music-intelligence/partner/music-engine',
};

interface MusicEngineSectionProps {
  scope: MusicEngineScope;
  className?: string;
}

function ReportDetail({ report, scope }: { report: MusicIntelligenceReport; scope: MusicEngineScope }) {
  return (
    <div className="mt-4 space-y-4">
      <MusicEngineModule title="Metadata Intelligence" scope={scope}>
        <div className="text-gray-300 text-sm space-y-1">
          <p>{report.metadataIntelligence.summary}</p>
          <p className="text-xs text-gray-500">
            Artwork: {report.metadataIntelligence.artworkStatus} · DSP:{' '}
            {report.metadataIntelligence.dspLinkStatus.connected}/
            {report.metadataIntelligence.dspLinkStatus.total} connected
          </p>
          {report.metadataIntelligence.missingFields.length > 0 ? (
            <p className="text-xs text-gray-500">
              Missing: {report.metadataIntelligence.missingFields.join(', ')}
            </p>
          ) : null}
        </div>
      </MusicEngineModule>

      <MusicEngineModule title="Rights Intelligence" scope={scope}>
        <div className="text-gray-300 text-sm space-y-1">
          <p>{report.rightsIntelligence.summary}</p>
          <p className="text-xs text-gray-500">
            Ownership: {report.rightsIntelligence.ownershipStatus} · Licensing:{' '}
            {report.rightsIntelligence.licensingReadiness}
          </p>
        </div>
      </MusicEngineModule>

      <MusicEngineModule title="Playlist Intelligence" scope={scope}>
        {report.playlistRecommendations.length === 0 ? (
          <p className="text-sm text-gray-500">Add genre metadata to activate playlist routing.</p>
        ) : (
          <ul className="space-y-2">
            {report.playlistRecommendations.map((rec) => (
              <li key={rec.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-gray-100">{rec.playlistName}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500">
                    {rec.confidence} · {rec.confidencePercent}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{rec.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </MusicEngineModule>

      <MusicEngineModule title="Executive Music Report" scope={scope}>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-300">
          <ListBlock title="Strengths" items={report.executiveReport.strengths} />
          <ListBlock title="Weaknesses" items={report.executiveReport.weaknesses} />
          <ListBlock title="Risks" items={report.executiveReport.risks} />
          <ListBlock title="Recommended Actions" items={report.executiveReport.recommendedActions} />
        </div>
      </MusicEngineModule>

      <MusicEngineModule title="Submission Timeline" scope={scope}>
        <SubmissionTimelinePanel timeline={report.timeline} />
      </MusicEngineModule>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 mb-1">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-gray-600">None identified from production data.</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MusicEngineSection({ scope, className = 'mt-6' }: MusicEngineSectionProps) {
  const [data, setData] = useState<MusicEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load music intelligence engine.');
        }
        return res.json() as Promise<MusicEnginePayload>;
      })
      .then((payload) => {
        setData(payload);
        if (payload.reports[0]) setSelectedId(payload.reports[0].submissionId);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading music intelligence engine…</AuthMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <AuthMessage type="error">{error}</AuthMessage>
      </div>
    );
  }

  if (!data) return null;

  const heading = scope === 'artist' ? 'Music Intelligence' : 'Portfolio Music Intelligence';
  const selected = data.reports.find((r) => r.submissionId === selectedId) ?? data.reports[0] ?? null;
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';

  return (
    <section className={className} aria-labelledby={`${scope}-music-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Music Intelligence Engine</p>
        <h2 id={`${scope}-music-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Deterministic submission analysis · {data.dataSource === 'live' ? 'Production data' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MusicEngineModule title="Portfolio Summary" scope={scope}>
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.totalSubmissions}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.portfolioSummary.summary}</p>
        </MusicEngineModule>
        <MusicEngineModule title="Avg Quality Score" scope={scope}>
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.averageQualityScore ?? '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Weighted submission completeness</p>
        </MusicEngineModule>
        <MusicEngineModule title="Avg Readiness" scope={scope}>
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.averageReadinessScore ?? '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Release readiness across portfolio</p>
        </MusicEngineModule>
        <MusicEngineModule title={scope === 'partner' ? 'Submission Health' : 'Release Readiness'} scope={scope}>
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.metadataIssues}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {scope === 'partner'
              ? `Metadata issues · ${data.portfolioSummary.rightsGaps} rights gaps`
              : 'Submissions with metadata gaps'}
          </p>
        </MusicEngineModule>
      </div>

      {data.reports.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No submissions on record. Submit music to activate the Music Intelligence Engine.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {data.reports.map((report) => (
              <button
                key={report.submissionId}
                type="button"
                onClick={() => setSelectedId(report.submissionId)}
                className={`text-left transition-opacity ${selectedId === report.submissionId ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                aria-pressed={selectedId === report.submissionId}
              >
                <MusicIntelligenceReportCard report={report} scope={scope} />
              </button>
            ))}
          </div>

          {selected ? <ReportDetail report={selected} scope={scope} /> : null}
        </>
      )}
    </section>
  );
}
