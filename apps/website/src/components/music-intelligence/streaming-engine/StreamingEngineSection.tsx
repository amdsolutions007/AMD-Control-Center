'use client';

import { useEffect, useState } from 'react';
import { AuthMessage } from '@/components/music-intelligence/workspace/WorkspaceShared';
import type { StreamingEnginePayload, StreamingEngineScope } from '@/lib/music-intelligence/streaming-engine-types';
import { MI_DSP_PLATFORMS } from '@/lib/music-intelligence/constants';
import StreamingEngineModule from './StreamingEngineModule';
import StreamingMetricsPanel from './StreamingMetricsPanel';
import PlatformComparisonPanel from './PlatformComparisonPanel';
import PlaylistPerformancePanel from './PlaylistPerformancePanel';
import StreamingTimelinePanel from './StreamingTimelinePanel';
import StreamingStatusPanelView from './StreamingStatusPanel';

const ENDPOINTS: Record<StreamingEngineScope, string> = {
  artist: '/api/music-intelligence/workspace/streaming-engine',
  partner: '/api/music-intelligence/partner/streaming-engine',
};

interface StreamingEngineSectionProps {
  scope: StreamingEngineScope;
  className?: string;
}

export default function StreamingEngineSection({ scope, className = 'mt-6' }: StreamingEngineSectionProps) {
  const [data, setData] = useState<StreamingEnginePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS[scope])
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load streaming intelligence engine.');
        }
        return res.json() as Promise<StreamingEnginePayload>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [scope]);

  if (loading) {
    return (
      <div className={className}>
        <AuthMessage type="info">Loading streaming intelligence engine…</AuthMessage>
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

  const heading = scope === 'artist' ? 'Streaming Overview' : 'Portfolio Streaming';
  const accent = scope === 'artist' ? 'text-[#00E5FF]' : 'text-[#6366F1]';
  const labelFor = (key: string) => MI_DSP_PLATFORMS.find((p) => p.key === key)?.label ?? key;

  return (
    <section className={className} aria-labelledby={`${scope}-streaming-engine-heading`}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Streaming Intelligence Engine</p>
        <h2 id={`${scope}-streaming-engine-heading`} className="mt-1 text-lg font-black text-gray-100">
          {heading}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          DSP connector framework · {data.dataSource === 'live' ? 'Production data' : 'Fallback mode'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StreamingEngineModule title="Connected DSPs">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.connectedPlatforms}
          </p>
          <p className="mt-1 text-xs text-gray-500">{data.portfolioSummary.summary}</p>
        </StreamingEngineModule>
        <StreamingEngineModule title="Smart Link Redirects">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.totalRedirectClicks ?? '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {data.metrics.hasTelemetryData ? 'Live telemetry' : 'Awaiting telemetry'}
          </p>
        </StreamingEngineModule>
        <StreamingEngineModule title="Platforms with Telemetry">
          <p className={`text-2xl font-black tabular-nums ${accent}`}>
            {data.portfolioSummary.platformsWithTelemetry}
          </p>
          <p className="mt-1 text-xs text-gray-500">Active redirect tracking</p>
        </StreamingEngineModule>
        <StreamingEngineModule title={scope === 'partner' ? 'Streaming Health' : 'Connection Health'}>
          <p className={`text-2xl font-black capitalize ${accent}`}>
            {data.executiveReport.connectionHealth}
          </p>
          <p className="mt-1 text-xs text-gray-500 capitalize">
            Streaming: {data.executiveReport.streamingHealth.replace(/_/g, ' ')}
          </p>
        </StreamingEngineModule>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <StreamingEngineModule title="Connected DSPs">
          {data.connectors.filter((c) => c.connectionStatus === 'connected').length === 0 ? (
            <p className="text-sm text-gray-500">Add DSP release URLs to submissions to connect platforms.</p>
          ) : (
            <ul className="space-y-2 text-sm text-gray-300">
              {data.connectors
                .filter((c) => c.connectionStatus === 'connected')
                .map((c) => (
                  <li key={c.platformKey} className="rounded-xl border border-white/10 px-3 py-2">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold text-gray-100">{c.label}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500">
                        {c.synchronizationHealth.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{c.summary}</p>
                  </li>
                ))}
            </ul>
          )}
        </StreamingEngineModule>

        <StreamingEngineModule title="Streaming Status">
          <StreamingStatusPanelView panel={data.statusPanel} />
        </StreamingEngineModule>
      </div>

      <StreamingEngineModule title="Streaming Metrics" className="mt-4">
        <StreamingMetricsPanel metrics={data.metrics} />
      </StreamingEngineModule>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <StreamingEngineModule title={scope === 'partner' ? 'Platform Comparison' : 'Platform Performance'}>
          <PlatformComparisonPanel comparison={data.platformComparison} />
        </StreamingEngineModule>

        <StreamingEngineModule title={scope === 'partner' ? 'Portfolio Playlist Performance' : 'Playlist Performance'}>
          <PlaylistPerformancePanel items={data.playlistPerformance} />
        </StreamingEngineModule>
      </div>

      <StreamingEngineModule title={scope === 'partner' ? 'Executive Streaming Summary' : 'Executive Streaming Report'} className="mt-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>{data.executiveReport.summary}</p>
          {data.executiveReport.bestPerformingPlatform ? (
            <p className="text-xs text-gray-500">
              Best performing: {data.executiveReport.bestPerformingPlatform}
            </p>
          ) : null}
          <p className="text-xs text-gray-500">{data.executiveReport.platformDistribution}</p>
          {data.executiveReport.recommendations.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs">
              {data.executiveReport.recommendations.map((rec, i) => (
                <li key={i}>→ {rec}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </StreamingEngineModule>

      <StreamingEngineModule title="Streaming Timeline" className="mt-4">
        <StreamingTimelinePanel timeline={data.timeline} />
      </StreamingEngineModule>

      {data.streamingProfile.connectedPlatforms.length > 0 ? (
        <div className="mt-4 text-xs text-gray-500">
          Profile: {data.streamingProfile.connectedPlatforms.map(labelFor).join(' · ')} ·{' '}
          {data.streamingProfile.summary}
        </div>
      ) : null}
    </section>
  );
}
