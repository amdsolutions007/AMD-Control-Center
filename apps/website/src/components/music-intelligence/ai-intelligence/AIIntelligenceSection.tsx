'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { AIIntelligencePayload, AIIntelligenceScope } from '@/lib/music-intelligence/ai-intelligence-types';
import AIActivityFeed from './AIActivityFeed';
import AIPlatformHealthPanel from './AIPlatformHealthPanel';
import AIQualityIndicators from './AIQualityIndicators';
import AIReadinessScore from './AIReadinessScore';
import AIRecommendationsPanel from './AIRecommendationsPanel';
import AISystemStatusBadge from './AISystemStatusBadge';

const ENDPOINTS: Record<AIIntelligenceScope, string> = {
  artist: '/api/music-intelligence/workspace/ai-intelligence',
  partner: '/api/music-intelligence/partner/ai-intelligence',
};

interface AIIntelligenceSectionProps {
  scope: AIIntelligenceScope;
  className?: string;
}

function IntelligenceModule({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#050512]/60 p-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function AIIntelligenceSection({ scope, className = 'mt-6' }: AIIntelligenceSectionProps) {
  const [data, setData] = useState<AIIntelligencePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load AI intelligence engine.');
        }
        return res.json() as Promise<AIIntelligencePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading AI intelligence engine…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Artist AI Intelligence' : 'Enterprise AI Intelligence';

  return (
    <section className={className} aria-labelledby={`${scope}-ai-intelligence-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">AI Intelligence Engine</p>
        <h2 id={`${scope}-ai-intelligence-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Deterministic analysis from production records · {data.dataSource === 'live' ? 'Live data' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AISystemStatusBadge
          scope={scope}
          label={data.systemStatus.label}
          detail={data.systemStatus.detail}
          status={data.systemStatus.status}
        />
        <AIReadinessScore scope={scope} score={data.readinessScore} label={data.readinessLabel} />
        {data.platformHealth ? (
          <AIPlatformHealthPanel scope={scope} health={data.platformHealth} />
        ) : (
          <IntelligenceModule title="Profile Completion Intelligence">
            <p className="text-2xl font-black text-gray-100">{data.profileIntelligence.completionPercent}%</p>
            <p className="mt-2 text-xs text-gray-500">{data.profileIntelligence.summary}</p>
            {data.profileIntelligence.missingFields.length > 0 ? (
              <p className="mt-2 text-xs text-gray-500">
                Open: {data.profileIntelligence.missingFields.join(', ')}
              </p>
            ) : null}
          </IntelligenceModule>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <IntelligenceModule title="Submission Intelligence">
          <p className="text-sm text-gray-300">{data.submissionIntelligence.summary}</p>
          {data.submissionIntelligence.averageQualityScore != null ? (
            <p className="mt-2 text-xs text-gray-500">
              Average quality: {data.submissionIntelligence.averageQualityScore}%
            </p>
          ) : null}
        </IntelligenceModule>

        <IntelligenceModule title="Submission Quality Indicators">
          <AIQualityIndicators indicators={data.qualityIndicators} />
        </IntelligenceModule>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <IntelligenceModule title="AI Recommendations">
          <AIRecommendationsPanel scope={scope} recommendations={data.recommendations} />
        </IntelligenceModule>

        <IntelligenceModule title="AI Executive Insights">
          {data.executiveInsights.length === 0 ? (
            <p className="text-sm text-gray-500">Insights activate as platform data accumulates.</p>
          ) : (
            <ul className="space-y-2">
              {data.executiveInsights.map((insight, i) => (
                <li key={i} className="text-sm text-gray-300 leading-relaxed">
                  {insight}
                </li>
              ))}
            </ul>
          )}
        </IntelligenceModule>
      </div>

      <div className="mt-4">
        <IntelligenceModule title="AI Activity Feed">
          <AIActivityFeed
            items={data.aiActivity}
            emptyMessage="No AI activity yet. Profile updates and submissions will populate this feed."
          />
        </IntelligenceModule>
      </div>
    </section>
  );
}
