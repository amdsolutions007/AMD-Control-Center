import {
  mapUtmSourceToPlatform,
  MARKETING_PLATFORM_DEFINITIONS,
  PERFORMANCE_METRIC_KEYS,
  platformLabel,
  ROI_METRIC_KEYS,
} from './marketing-engine-constants';
import { buildMarketingConnectors } from './marketing-engine-connectors';
import type { MarketingCollectedData } from './marketing-engine-collector';
import type {
  AudienceAcquisitionIntelligence,
  CampaignIntelligence,
  ConversionIntelligence,
  ExecutiveMarketingReport,
  GeographicMarketingIntelligence,
  MarketingEnginePortfolioSummary,
  MarketingHealthDashboard,
  MarketingTimelineEvent,
  PerformanceIntelligence,
  PlatformComparisonEngine,
  RoiIntelligence,
} from './marketing-engine-types';

const MS_MONTH = 86400000 * 30;

function isWithin(iso: string, ms: number): boolean {
  return Date.now() - new Date(iso).getTime() <= ms;
}

function uniqueSessions(clicks: MarketingCollectedData['clickTelemetry']): Set<string> {
  const s = new Set<string>();
  for (const row of clicks) {
    if (row.session_id?.trim()) s.add(row.session_id);
  }
  return s;
}

function groupCampaigns(clicks: MarketingCollectedData['clickTelemetry']) {
  type ClickRow = MarketingCollectedData['clickTelemetry'][number];
  const map = new Map<string, { clicks: ClickRow[]; platform: string | null }>();

  for (const row of clicks) {
    const name = row.utm_campaign?.trim() || 'Direct / Untagged';
    const existing = map.get(name);
    const platform = mapUtmSourceToPlatform(row.utm_source);
    if (existing) {
      existing.clicks.push(row);
      if (!existing.platform && platform) existing.platform = platform;
    } else {
      map.set(name, { clicks: [row], platform });
    }
  }
  return map;
}

export function buildCampaignIntelligence(data: MarketingCollectedData): CampaignIntelligence {
  const groups = groupCampaigns(data.clickTelemetry);
  const campaigns = [...groups.entries()].map(([name, group]) => {
    const platform = group.platform ? platformLabel(group.platform) : 'Multi-platform';
    const isTagged = name !== 'Direct / Untagged';

    return {
      id: `campaign-${name.toLowerCase().replace(/\s+/g, '-')}`,
      campaignName: name,
      campaignType: group.clicks[0]?.utm_medium?.trim() || (isTagged ? 'utm_campaign' : 'organic'),
      platform,
      campaignObjective: isTagged ? 'Smart Link conversion' : 'Organic discovery',
      status: 'active' as const,
      budget: null,
      spend: null,
      campaignHealth: group.clicks.length >= 10 ? 'healthy' as const : group.clicks.length > 0 ? 'active' as const : 'awaiting_data' as const,
      clickCount: group.clicks.length,
      derivedFrom: `mi_click_tracking · ${group.clicks.length} click(s)`,
    };
  });

  const hasLiveData = campaigns.some((c) => c.clickCount != null && c.clickCount > 0);

  return {
    campaigns: campaigns.sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0)).slice(0, 12),
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    summary: hasLiveData
      ? `${campaigns.length} campaign signal(s) from UTM attribution and Smart Link telemetry`
      : 'Campaign intelligence activates when UTM-tagged marketing traffic is recorded.',
    hasLiveData,
  };
}

export function buildPerformanceIntelligence(data: MarketingCollectedData): PerformanceIntelligence {
  const totalClicks = data.clickTelemetry.length;
  const uniqueClickSessions = uniqueSessions(data.clickTelemetry).size;

  const metrics = PERFORMANCE_METRIC_KEYS.map((def) => {
    if (def.key === 'clicks') {
      return {
        key: def.key,
        label: def.label,
        value: totalClicks > 0 ? totalClicks : null,
        available: totalClicks > 0,
        source: totalClicks > 0 ? ('production_data' as const) : ('none' as const),
        unit: 'clicks',
        emptyStateMessage: 'No click telemetry recorded yet.',
      };
    }
    if (def.key === 'unique_clicks') {
      return {
        key: def.key,
        label: def.label,
        value: uniqueClickSessions > 0 ? uniqueClickSessions : null,
        available: uniqueClickSessions > 0,
        source: uniqueClickSessions > 0 ? ('production_data' as const) : ('none' as const),
        unit: 'sessions',
        emptyStateMessage: 'No unique session data recorded yet.',
      };
    }
    return {
      key: def.key,
      label: def.label,
      value: null,
      available: false,
      source: 'none' as const,
      unit: def.key === 'ctr' || def.key === 'engagement_rate' ? '%' : 'count',
      emptyStateMessage: `${def.label} requires platform API integration.`,
    };
  });

  return {
    metrics,
    hasLiveData: totalClicks > 0,
    summary: totalClicks > 0
      ? `${totalClicks} click(s) · ${uniqueClickSessions} unique session(s). Platform impressions await API connectors.`
      : 'Performance metrics await marketing platform API integration and telemetry.',
  };
}

export function buildConversionIntelligence(data: MarketingCollectedData): ConversionIntelligence {
  const smartLinkClicks = data.clickTelemetry.length;
  const submissions = data.submissions.length;
  const audienceContacts = data.audienceContacts.length;
  const streamingRedirects = data.clickTelemetry.filter((c) =>
    ['spotify', 'apple_music', 'audiomack', 'boomplay', 'youtube'].includes(c.destination_dsp),
  ).length;

  const funnel = [
    { key: 'smart_link_clicks', label: 'Smart Link Clicks', value: smartLinkClicks > 0 ? smartLinkClicks : null, available: smartLinkClicks > 0 },
    { key: 'streaming_redirects', label: 'Streaming Redirects', value: streamingRedirects > 0 ? streamingRedirects : null, available: streamingRedirects > 0 },
    { key: 'music_submissions', label: 'Music Submissions', value: submissions > 0 ? submissions : null, available: submissions > 0 },
    { key: 'audience_contacts', label: 'Audience Contacts', value: audienceContacts > 0 ? audienceContacts : null, available: audienceContacts > 0 },
    { key: 'artist_registrations', label: 'Artist Registrations', value: null, available: false },
    { key: 'partner_registrations', label: 'Partner Registrations', value: null, available: false },
    { key: 'website_visits', label: 'Website Visits', value: null, available: false },
  ];

  const conversionRate =
    smartLinkClicks > 0 && streamingRedirects > 0
      ? Math.round((streamingRedirects / smartLinkClicks) * 100)
      : null;

  const hasLiveData = funnel.some((f) => f.available);

  return {
    funnel,
    conversionRate,
    hasLiveData,
    summary: hasLiveData
      ? `Funnel: ${smartLinkClicks} clicks → ${streamingRedirects} redirects → ${submissions} submissions`
      : 'Conversion intelligence awaits marketing telemetry and platform data.',
  };
}

export function buildRoiIntelligence(data: MarketingCollectedData): RoiIntelligence {
  const metrics = ROI_METRIC_KEYS.map((def) => ({
    key: def.key,
    label: def.label,
    value: null,
    available: false,
    source: 'none' as const,
    unit: def.key === 'roas' || def.key === 'roi' ? 'ratio' : 'currency',
    emptyStateMessage: `${def.label} requires ad spend data from platform API connectors.`,
  }));

  return {
    metrics,
    hasLiveData: false,
    summary: 'ROI metrics require connected ad platform spend data. Connector framework ready.',
  };
}

export function buildAcquisitionIntelligence(data: MarketingCollectedData): AudienceAcquisitionIntelligence {
  const sourceMap = new Map<string, number>();
  for (const row of data.clickTelemetry) {
    const src = row.utm_source?.trim() || 'direct';
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
  }

  const total = [...sourceMap.values()].reduce((a, b) => a + b, 0);
  const sources = [...sourceMap.entries()].map(([source, count]) => ({
    source,
    label: source === 'direct' ? 'Direct / Organic' : source,
    count,
    share: total > 0 ? Math.round((count / total) * 100) : 0,
    type: (rowType(source)) as 'organic' | 'paid' | 'direct',
  }));

  const sessions = uniqueSessions(data.clickTelemetry);
  const newContacts = data.audienceContacts.filter((c) => isWithin(c.created_at, MS_MONTH)).length;
  const paidClicks = data.clickTelemetry.filter((c) => c.utm_source?.trim()).length;
  const organicClicks = data.clickTelemetry.filter((c) => !c.utm_source?.trim()).length;

  return {
    sources: sources.sort((a, b) => b.count - a.count),
    newUsers: newContacts > 0 ? newContacts : null,
    returningUsers: sessions.size > newContacts ? sessions.size - newContacts : null,
    organicGrowth: organicClicks > 0 ? organicClicks : null,
    paidGrowth: paidClicks > 0 ? paidClicks : null,
    hasLiveData: total > 0 || newContacts > 0,
    summary: total > 0
      ? `${sources.length} acquisition source(s) · ${paidClicks} paid · ${organicClicks} organic click(s)`
      : 'Acquisition intelligence awaits UTM-tagged campaign traffic.',
  };
}

function rowType(source: string): 'organic' | 'paid' | 'direct' {
  if (source === 'direct') return 'direct';
  const platform = mapUtmSourceToPlatform(source);
  return platform ? 'paid' : 'organic';
}

export function buildGeographicMarketing(data: MarketingCollectedData): GeographicMarketingIntelligence {
  const map = new Map<string, number>();
  for (const row of data.clickTelemetry) {
    if (row.user_country?.trim()) {
      const code = row.user_country.toUpperCase();
      map.set(code, (map.get(code) ?? 0) + 1);
    }
  }

  const total = [...map.values()].reduce((a, b) => a + b, 0);
  const entries = [...map.entries()]
    .map(([territory, clicks]) => ({
      territory,
      clicks,
      conversions: null,
      share: total > 0 ? Math.round((clicks / total) * 100) : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    entries,
    topTerritory: entries[0]?.territory ?? null,
    hasLiveData: entries.length > 0,
    summary: entries.length > 0
      ? `Campaign traffic across ${entries.length} territor(ies)`
      : 'Geographic marketing intelligence awaits country telemetry.',
  };
}

export function buildPlatformComparison(data: MarketingCollectedData): PlatformComparisonEngine {
  const platformClicks = new Map<string, number>();
  for (const row of data.clickTelemetry) {
    const key = mapUtmSourceToPlatform(row.utm_source) ?? 'direct';
    platformClicks.set(key, (platformClicks.get(key) ?? 0) + 1);
  }

  const connectorInputs = MARKETING_PLATFORM_DEFINITIONS.map((def) => {
    const count = platformClicks.get(def.platformKey) ?? 0;
    return {
      platformKey: def.platformKey,
      hasTelemetry: count > 0,
      lastActivity: count > 0
        ? data.clickTelemetry.find((c) => mapUtmSourceToPlatform(c.utm_source) === def.platformKey)?.created_at ?? null
        : null,
    };
  });

  const sorted = [...platformClicks.entries()].sort((a, b) => b[1] - a[1]);
  const entries = MARKETING_PLATFORM_DEFINITIONS.map((def, i) => {
    const clicks = platformClicks.get(def.platformKey) ?? null;
    const rank = sorted.findIndex(([k]) => k === def.platformKey);
    return {
      platformKey: def.platformKey,
      label: def.label,
      clicks: clicks != null && clicks > 0 ? clicks : null,
      conversions: null,
      ctr: null,
      cpc: null,
      roi: null,
      engagementRate: null,
      connectionStatus: (clicks != null && clicks > 0 ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
      rank: rank >= 0 ? rank + 1 : null,
    };
  });

  const best = sorted[0];

  return {
    entries,
    bestPerformingPlatform: best ? platformLabel(best[0]) : null,
    highestRoi: null,
    lowestCpc: null,
    highestConversion: null,
    summary: best
      ? `Best UTM-attributed platform: ${platformLabel(best[0])} (${best[1]} clicks). ROI/CPC await API connectors.`
      : 'Platform comparison awaits UTM-tagged marketing traffic.',
  };
}

export function buildExecutiveMarketingReport(
  campaigns: CampaignIntelligence,
  performance: PerformanceIntelligence,
  conversion: ConversionIntelligence,
  roi: RoiIntelligence,
  platformComparison: PlatformComparisonEngine,
): ExecutiveMarketingReport {
  const recommendations: string[] = [];

  if (!campaigns.hasLiveData) {
    recommendations.push('Tag Smart Link campaigns with UTM parameters to activate campaign intelligence.');
  }
  if (!performance.hasLiveData) {
    recommendations.push('Drive traffic to Smart Links to begin collecting conversion telemetry.');
  }
  if (!roi.hasLiveData) {
    recommendations.push('Connect Meta Ads, Google Ads, or TikTok Ads APIs for spend-based ROI analysis.');
  }
  if (platformComparison.bestPerformingPlatform) {
    recommendations.push(`Prioritize ${platformComparison.bestPerformingPlatform} — highest UTM-attributed click volume.`);
  }
  if (conversion.conversionRate != null) {
    recommendations.push(`Current Smart Link → streaming conversion rate: ${conversion.conversionRate}%.`);
  }

  const campaignHealth: ExecutiveMarketingReport['campaignHealth'] =
    campaigns.hasLiveData && performance.hasLiveData ? 'healthy'
      : campaigns.hasLiveData || performance.hasLiveData ? 'active'
        : 'awaiting_data';

  return {
    campaignHealth,
    budgetUtilization: 'Ad spend tracking requires platform API connectors.',
    marketingPerformance: performance.summary,
    roiSummary: roi.summary,
    conversionSummary: conversion.summary,
    recommendations: recommendations.slice(0, 5),
    summary: `${campaigns.totalCampaigns} campaign signal(s). ${performance.hasLiveData ? 'Telemetry active.' : 'Awaiting telemetry.'} ROI awaits API integration.`,
  };
}

export function buildMarketingTimeline(data: MarketingCollectedData): MarketingTimelineEvent[] {
  const events: MarketingTimelineEvent[] = [];
  const groups = groupCampaigns(data.clickTelemetry);

  for (const [name, group] of groups) {
    if (name === 'Direct / Untagged') continue;
    const first = group.clicks[group.clicks.length - 1];
    const latest = group.clicks[0];
    events.push({
      id: `start-${name}`,
      type: 'campaign_started',
      label: `Campaign started: ${name}`,
      timestamp: first.created_at,
      detail: `First UTM-attributed click on ${platformLabel(group.platform ?? 'multi')}.`,
    });
    if (group.clicks.length >= 5) {
      events.push({
        id: `milestone-${name}`,
        type: 'performance_milestone',
        label: `${group.clicks.length} clicks — ${name}`,
        timestamp: latest.created_at,
        detail: 'Campaign click milestone reached.',
      });
    }
  }

  if (data.submissions.length > 0) {
    const latest = data.submissions[0];
    events.push({
      id: 'conversion-submission',
      type: 'conversion_milestone',
      label: `Submission: ${latest.song_title}`,
      timestamp: latest.created_at,
      detail: 'Music submission recorded as conversion event.',
    });
  }

  if (data.audienceContacts.length > 0) {
    events.push({
      id: 'conversion-audience',
      type: 'conversion_milestone',
      label: 'Audience contact captured',
      timestamp: data.audienceContacts[0].created_at,
      detail: 'Owned audience contact acquired via Smart Link.',
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);
}

export function buildMarketingHealthDashboard(
  campaigns: CampaignIntelligence,
  performance: PerformanceIntelligence,
  conversion: ConversionIntelligence,
  roi: RoiIntelligence,
  platformComparison: PlatformComparisonEngine,
): MarketingHealthDashboard {
  const dataPoints = [
    campaigns.hasLiveData,
    performance.hasLiveData,
    conversion.hasLiveData,
    platformComparison.entries.some((e) => e.connectionStatus === 'connected'),
  ].filter(Boolean).length;

  const healthScore = dataPoints > 0 ? Math.round((dataPoints / 5) * 100) : null;

  return {
    marketingHealthScore: healthScore,
    campaignScore: campaigns.hasLiveData ? Math.min(100, campaigns.activeCampaigns * 25) : null,
    roiScore: roi.hasLiveData ? 100 : null,
    conversionScore: conversion.conversionRate != null ? Math.min(100, conversion.conversionRate) : null,
    platformCoverage: platformComparison.entries.filter((e) => e.connectionStatus === 'connected').length > 0
      ? Math.min(100, (platformComparison.entries.filter((e) => e.connectionStatus === 'connected').length / platformComparison.entries.length) * 100)
      : null,
    attributionStatus: dataPoints >= 3 ? 'active' : dataPoints >= 1 ? 'partial' : 'awaiting_integrations',
    summary: healthScore != null
      ? `Marketing intelligence ${healthScore}% data coverage from production sources`
      : 'Marketing Health Dashboard awaiting campaign telemetry.',
  };
}

export function buildPortfolioSummary(data: MarketingCollectedData, campaigns: CampaignIntelligence): MarketingEnginePortfolioSummary {
  const conversions = data.submissions.length + data.audienceContacts.length;
  const platforms = new Set(
    data.clickTelemetry.map((c) => mapUtmSourceToPlatform(c.utm_source)).filter(Boolean),
  );

  return {
    totalCampaigns: campaigns.totalCampaigns,
    totalClicks: data.clickTelemetry.length > 0 ? data.clickTelemetry.length : null,
    totalConversions: conversions > 0 ? conversions : null,
    connectedPlatforms: platforms.size,
    summary: campaigns.hasLiveData
      ? `${campaigns.totalCampaigns} campaign(s) · ${data.clickTelemetry.length} click(s) · ${conversions} conversion signal(s)`
      : 'No marketing data on record.',
  };
}

export function processMarketingData(data: MarketingCollectedData) {
  const campaigns = buildCampaignIntelligence(data);
  const performance = buildPerformanceIntelligence(data);
  const conversion = buildConversionIntelligence(data);
  const roi = buildRoiIntelligence(data);
  const acquisition = buildAcquisitionIntelligence(data);
  const geographic = buildGeographicMarketing(data);
  const platformComparison = buildPlatformComparison(data);
  const executiveReport = buildExecutiveMarketingReport(campaigns, performance, conversion, roi, platformComparison);
  const timeline = buildMarketingTimeline(data);
  const healthDashboard = buildMarketingHealthDashboard(campaigns, performance, conversion, roi, platformComparison);
  const portfolioSummary = buildPortfolioSummary(data, campaigns);

  const connectorInputs = MARKETING_PLATFORM_DEFINITIONS.map((def) => {
    const count = data.clickTelemetry.filter((c) => mapUtmSourceToPlatform(c.utm_source) === def.platformKey).length;
    return {
      platformKey: def.platformKey,
      hasTelemetry: count > 0,
      lastActivity: count > 0
        ? data.clickTelemetry.find((c) => mapUtmSourceToPlatform(c.utm_source) === def.platformKey)?.created_at ?? null
        : null,
    };
  });

  return {
    portfolioSummary,
    connectors: buildMarketingConnectors(connectorInputs),
    campaigns,
    performance,
    conversion,
    roi,
    acquisition,
    geographic,
    platformComparison,
    executiveReport,
    timeline,
    healthDashboard,
  };
}
