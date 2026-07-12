import { MI_DSP_PLATFORMS, type MIDspPlatformKey } from './constants';
import { MI_PLAYLIST_RULES } from './music-engine-constants';
import { buildConnectorFramework, type DspConnectorInput } from './streaming-engine-connectors';
import {
  aggregateClicksByPlatform,
  type ArtistStreamingEngineData,
  type CollectedDspLink,
  type PartnerStreamingEngineData,
} from './streaming-engine-collector';
import { STREAMING_METRIC_DEFINITIONS } from './streaming-engine-constants';
import type {
  ExecutiveStreamingReport,
  PlatformComparison,
  PlatformPerformanceEntry,
  PlaylistPerformanceItem,
  StreamingEnginePortfolioSummary,
  StreamingMetricsBundle,
  StreamingProfile,
  StreamingStatusPanel,
  StreamingTimelineEvent,
} from './streaming-engine-types';

function bestReleaseUrlPerPlatform(links: CollectedDspLink[]): Map<MIDspPlatformKey, CollectedDspLink> {
  const map = new Map<MIDspPlatformKey, CollectedDspLink>();
  for (const link of links) {
    const existing = map.get(link.platformKey);
    if (!existing || link.addedAt > existing.addedAt) {
      map.set(link.platformKey, link);
    }
  }
  return map;
}

function buildConnectorInputs(
  links: CollectedDspLink[],
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
): DspConnectorInput[] {
  const best = bestReleaseUrlPerPlatform(links);
  return MI_DSP_PLATFORMS.map((p) => ({
    platformKey: p.key,
    releaseUrl: best.get(p.key)?.url ?? null,
    lastClickAt: clickMap.get(p.key)?.lastAt ?? null,
  }));
}

export function buildStreamingProfile(
  links: CollectedDspLink[],
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
): StreamingProfile {
  const framework = buildConnectorFramework(buildConnectorInputs(links, clickMap));
  const platformIds: Partial<Record<MIDspPlatformKey, string>> = {};
  for (const c of framework.connectors) {
    if (c.platformId) platformIds[c.platformKey] = c.platformId;
  }

  const releaseIds = links.map((l) => l.submissionId);
  const lastSync = framework.connectors
    .map((c) => c.lastSynchronization)
    .filter(Boolean)
    .sort()
    .reverse()[0] ?? null;

  const syncHealth = framework.connectors.some((c) => c.synchronizationHealth === 'healthy')
    ? 'healthy'
    : framework.connectors.some((c) => c.synchronizationHealth === 'stale')
      ? 'stale'
      : framework.connected.length > 0
        ? 'never_synced'
        : 'api_pending';

  const connectionStatus = framework.connected.length > 0 ? 'connected' : 'disconnected';

  return {
    connectedPlatforms: framework.connected,
    pendingPlatforms: framework.pending,
    disconnectedPlatforms: framework.disconnected,
    platformIds,
    releaseIds: [...new Set(releaseIds)],
    connectionStatus,
    lastSynchronization: lastSync,
    synchronizationHealth: syncHealth,
    totalConnected: framework.connected.length,
    summary:
      framework.connected.length > 0
        ? `${framework.connected.length} platform(s) connected via release URLs. ${clickMap.size > 0 ? 'Smart Link telemetry active.' : 'Awaiting redirect telemetry.'}`
        : 'No streaming platforms connected. Add DSP release URLs to submissions.',
  };
}

export function buildStreamingMetrics(
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
): StreamingMetricsBundle {
  const totalRedirects = [...clickMap.values()].reduce((sum, v) => sum + v.count, 0);
  const hasTelemetry = totalRedirects > 0;

  const metrics = STREAMING_METRIC_DEFINITIONS.map((def) => {
    if (def.key === 'smart_link_redirects') {
      return {
        key: def.key,
        label: def.label,
        value: hasTelemetry ? totalRedirects : null,
        available: hasTelemetry,
        source: hasTelemetry ? ('smart_link_telemetry' as const) : ('none' as const),
        unit: def.unit,
        emptyStateMessage: def.emptyStateMessage,
      };
    }
    return {
      key: def.key,
      label: def.label,
      value: null,
      available: false,
      source: 'none' as const,
      unit: def.unit,
      emptyStateMessage: def.emptyStateMessage,
    };
  });

  return {
    metrics,
    hasLivePlatformMetrics: false,
    hasTelemetryData: hasTelemetry,
    summary: hasTelemetry
      ? `${totalRedirects} Smart Link redirect(s) recorded. Platform API metrics pending connector activation.`
      : 'Platform stream metrics require DSP API integration. Smart Link telemetry not yet recorded.',
  };
}

export function buildPlatformComparison(
  links: CollectedDspLink[],
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
): PlatformComparison {
  const best = bestReleaseUrlPerPlatform(links);
  const totalClicks = [...clickMap.values()].reduce((sum, v) => sum + v.count, 0);

  const entries: PlatformPerformanceEntry[] = MI_DSP_PLATFORMS.map((p) => {
    const hasUrl = best.has(p.key);
    const clicks = clickMap.get(p.key);
    const redirectClicks = clicks?.count ?? null;
    const relativeShare =
      redirectClicks != null && totalClicks > 0
        ? Math.round((redirectClicks / totalClicks) * 100)
        : null;

    return {
      platformKey: p.key,
      label: p.label,
      connectionStatus: hasUrl ? 'connected' : 'disconnected',
      redirectClicks,
      relativeShare,
      growthIndicator: redirectClicks != null && redirectClicks > 0 ? 'stable' : 'unknown',
    };
  });

  const withClicks = entries.filter((e) => e.redirectClicks != null && e.redirectClicks > 0);
  const bestPlatform = withClicks.sort((a, b) => (b.redirectClicks ?? 0) - (a.redirectClicks ?? 0))[0];

  const connectedCount = entries.filter((e) => e.connectionStatus === 'connected').length;

  return {
    entries,
    bestPerformingPlatform: bestPlatform?.platformKey ?? null,
    connectedCount,
    distributionSummary:
      withClicks.length > 0
        ? `Redirect traffic distributed across ${withClicks.length} platform(s). Best: ${bestPlatform?.label ?? 'N/A'}.`
        : connectedCount > 0
          ? `${connectedCount} platform(s) connected. Awaiting Smart Link redirect telemetry.`
          : 'No platforms connected. Add DSP release URLs to activate comparison.',
  };
}

function matchPlaylistRules(submission: { genre?: string; mood?: string; language?: string }) {
  const genre = submission.genre ?? '';
  const mood = submission.mood ?? '';
  const language = submission.language ?? '';

  return MI_PLAYLIST_RULES.filter((rule) => {
    const genreMatch = rule.genrePatterns.some((p) => p.test(genre));
    const moodMatch = !rule.moodPatterns || rule.moodPatterns.some((p) => p.test(mood));
    const langMatch = !rule.languagePatterns || rule.languagePatterns.some((p) => p.test(language));
    return genreMatch && moodMatch && langMatch;
  });
}

export function buildPlaylistPerformance(
  submissions: Array<{ id: string; song_title: string; genre?: string; mood?: string; language?: string; created_at: string; dsp_links?: Record<string, string> }>,
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
): PlaylistPerformanceItem[] {
  const items: PlaylistPerformanceItem[] = [];

  for (const sub of submissions) {
    const rules = matchPlaylistRules(sub);
    const platforms = Object.keys(sub.dsp_links ?? {}).filter((k) => sub.dsp_links?.[k]?.trim());

    for (const rule of rules.slice(0, 2)) {
      const platform = platforms[0] ?? 'Multi-platform';
      const platformClicks = platforms
        .map((p) => clickMap.get(p as MIDspPlatformKey)?.count ?? 0)
        .reduce((a, b) => a + b, 0);

      const estimatedImpact: PlaylistPerformanceItem['estimatedImpact'] =
        platformClicks > 10 ? 'high' : platformClicks > 0 ? 'medium' : rule.baseConfidence >= 60 ? 'medium' : 'low';

      items.push({
        id: `${sub.id}-${rule.id}`,
        playlistName: rule.playlistName,
        platform: MI_DSP_PLATFORMS.find((p) => p.key === platform)?.label ?? platform,
        playlistType: 'routing_candidate',
        position: null,
        dateAdded: sub.created_at,
        estimatedImpact,
        impactExplanation: platformClicks > 0
          ? `Routing candidate with ${platformClicks} redirect(s) to connected platform(s).`
          : rule.explanation,
        derivedFrom: `Submission "${sub.song_title}" · rule: ${rule.id}`,
      });
    }
  }

  return items.slice(0, 12);
}

export function buildStreamingTimeline(
  links: CollectedDspLink[],
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
  submissions: Array<{ id: string; song_title: string; created_at: string }>,
): StreamingTimelineEvent[] {
  const events: StreamingTimelineEvent[] = [];

  const byPlatform = bestReleaseUrlPerPlatform(links);
  for (const [key, link] of byPlatform) {
    events.push({
      id: `connect-${key}`,
      type: 'platform_connected',
      label: `${MI_DSP_PLATFORMS.find((p) => p.key === key)?.label ?? key} connected`,
      timestamp: link.addedAt,
      detail: `Release URL added for "${link.songTitle}".`,
      platformKey: key,
    });
  }

  const firstClick = [...clickMap.entries()].sort((a, b) => a[1].lastAt.localeCompare(b[1].lastAt))[0];
  if (firstClick) {
    events.push({
      id: 'first-sync',
      type: 'first_synchronization',
      label: 'First Smart Link redirect recorded',
      timestamp: firstClick[1].lastAt,
      detail: `Initial redirect telemetry for ${MI_DSP_PLATFORMS.find((p) => p.key === firstClick[0])?.label ?? firstClick[0]}.`,
      platformKey: firstClick[0],
    });
  }

  for (const [key, data] of clickMap) {
    if (data.count >= 5) {
      events.push({
        id: `milestone-${key}`,
        type: 'growth_milestone',
        label: `${data.count} redirects milestone`,
        timestamp: data.lastAt,
        detail: `${MI_DSP_PLATFORMS.find((p) => p.key === key)?.label ?? key} reached ${data.count} Smart Link redirect(s).`,
        platformKey: key,
      });
    }
  }

  for (const sub of submissions.slice(0, 5)) {
    events.push({
      id: `submission-${sub.id}`,
      type: 'playlist_added',
      label: `Submission: ${sub.song_title}`,
      timestamp: sub.created_at,
      detail: 'Release submitted for playlist routing evaluation.',
    });
  }

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

export function buildExecutiveStreamingReport(
  profile: StreamingProfile,
  comparison: PlatformComparison,
  metrics: StreamingMetricsBundle,
): ExecutiveStreamingReport {
  const recommendations: string[] = [];

  if (profile.totalConnected === 0) {
    recommendations.push('Add DSP release URLs to at least one submission to activate streaming intelligence.');
  }
  if (profile.totalConnected > 0 && profile.totalConnected < 3) {
    recommendations.push(`Expand DSP coverage — ${profile.totalConnected}/7 platforms connected.`);
  }
  if (!metrics.hasTelemetryData) {
    recommendations.push('Share Smart Links to begin collecting redirect telemetry for platform comparison.');
  }
  if (metrics.hasTelemetryData && !metrics.hasLivePlatformMetrics) {
    recommendations.push('DSP API connectors are framework-ready. Executive authorization required for live stream sync.');
  }
  if (comparison.bestPerformingPlatform) {
    const label = MI_DSP_PLATFORMS.find((p) => p.key === comparison.bestPerformingPlatform)?.label;
    recommendations.push(`Prioritize ${label} — highest Smart Link redirect volume in current telemetry.`);
  }

  const streamingHealth: ExecutiveStreamingReport['streamingHealth'] =
    metrics.hasTelemetryData && profile.totalConnected >= 3
      ? 'healthy'
      : metrics.hasTelemetryData || profile.totalConnected > 0
        ? 'developing'
        : 'awaiting_data';

  const connectionHealth: ExecutiveStreamingReport['connectionHealth'] =
    profile.totalConnected >= 4
      ? 'strong'
      : profile.totalConnected >= 2
        ? 'partial'
        : profile.totalConnected >= 1
          ? 'minimal'
          : 'none';

  const bestLabel = comparison.bestPerformingPlatform
    ? MI_DSP_PLATFORMS.find((p) => p.key === comparison.bestPerformingPlatform)?.label ?? null
    : null;

  return {
    bestPerformingPlatform: bestLabel,
    platformDistribution: comparison.distributionSummary,
    streamingHealth,
    connectionHealth,
    recommendations: recommendations.slice(0, 5),
    summary: `${profile.totalConnected} platform(s) connected. ${metrics.hasTelemetryData ? 'Telemetry active.' : 'Awaiting telemetry.'} Platform API metrics pending.`,
  };
}

export function buildStreamingStatusPanel(
  links: CollectedDspLink[],
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
): StreamingStatusPanel {
  const framework = buildConnectorFramework(buildConnectorInputs(links, clickMap));

  const syncStatus = framework.connectors.some((c) => c.synchronizationHealth === 'healthy')
    ? 'healthy'
    : framework.connectors.some((c) => c.synchronizationHealth === 'stale')
      ? 'stale'
      : framework.connected.length > 0
        ? 'never_synced'
        : 'api_pending';

  return {
    connectedDsps: framework.connected,
    activeConnectors: framework.connectors.filter((c) => c.connectionStatus === 'connected').length,
    pendingConnections: framework.disconnected,
    synchronizationStatus: syncStatus,
    apiConnectorsReady: framework.connectors.length,
    summary: `${framework.connected.length} DSP(s) connected · ${framework.connectors.length} connector(s) framework-ready · API sync pending`,
  };
}

export function buildPortfolioSummary(
  submissions: number,
  connectedPlatforms: number,
  clickMap: Map<MIDspPlatformKey, { count: number; lastAt: string }>,
): StreamingEnginePortfolioSummary {
  const totalClicks = [...clickMap.values()].reduce((sum, v) => sum + v.count, 0);

  return {
    totalSubmissions: submissions,
    connectedPlatforms,
    totalRedirectClicks: clickMap.size > 0 ? totalClicks : null,
    platformsWithTelemetry: clickMap.size,
    summary:
      submissions > 0
        ? `${submissions} submission(s) · ${connectedPlatforms} platform(s) · ${clickMap.size > 0 ? `${totalClicks} redirect(s)` : 'no telemetry yet'}`
        : 'No submissions on record.',
  };
}

export function processArtistStreamingData(data: ArtistStreamingEngineData) {
  const clickMap = aggregateClicksByPlatform(data.clickTelemetry);
  const framework = buildConnectorFramework(buildConnectorInputs(data.dspLinks, clickMap));
  const profile = buildStreamingProfile(data.dspLinks, clickMap);
  const metrics = buildStreamingMetrics(clickMap);
  const comparison = buildPlatformComparison(data.dspLinks, clickMap);
  const playlistPerformance = buildPlaylistPerformance(data.submissions, clickMap);
  const timeline = buildStreamingTimeline(data.dspLinks, clickMap, data.submissions);
  const executiveReport = buildExecutiveStreamingReport(profile, comparison, metrics);
  const statusPanel = buildStreamingStatusPanel(data.dspLinks, clickMap);
  const portfolioSummary = buildPortfolioSummary(
    data.submissions.length,
    framework.connected.length,
    clickMap,
  );

  return {
    connectors: framework.connectors,
    streamingProfile: profile,
    metrics,
    platformComparison: comparison,
    playlistPerformance,
    timeline,
    executiveReport,
    statusPanel,
    portfolioSummary,
  };
}

export function processPartnerStreamingData(data: PartnerStreamingEngineData) {
  return processArtistStreamingData({
    ...data,
    artistId: null,
    dataAvailable: data.dataAvailable,
  });
}
