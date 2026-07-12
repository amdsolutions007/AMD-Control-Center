import {
  AUDIENCE_PLATFORM_DEFINITIONS,
  countryLabel,
  ENGAGEMENT_METRIC_KEYS,
  GLOBAL_AUDIENCE_METRIC_KEYS,
} from './audience-engine-constants';
import { buildAudienceConnectors } from './audience-engine-connectors';
import type { AudienceCollectedData } from './audience-engine-collector';
import type {
  AudienceBehaviourIntelligence,
  AudienceEnginePortfolioSummary,
  AudienceHealthDashboard,
  AudienceTimelineEvent,
  DemographicIntelligence,
  EngagementIntelligence,
  ExecutiveAudienceReport,
  GeographicIntelligence,
  GlobalAudienceOverview,
  GrowthIntelligence,
  PlatformAudienceDistribution,
} from './audience-engine-types';

const MS_DAY = 86400000;
const MS_WEEK = MS_DAY * 7;
const MS_MONTH = MS_DAY * 30;

function isWithin(iso: string, ms: number): boolean {
  return Date.now() - new Date(iso).getTime() <= ms;
}

function countInWindow<T extends { created_at: string }>(rows: T[], ms: number): number {
  return rows.filter((r) => isWithin(r.created_at, ms)).length;
}

function uniqueSessions(clicks: AudienceCollectedData['clickTelemetry']): Set<string> {
  const sessions = new Set<string>();
  for (const row of clicks) {
    if (row.session_id?.trim()) sessions.add(row.session_id);
  }
  return sessions;
}

function returningSessions(clicks: AudienceCollectedData['clickTelemetry']): number {
  const counts = new Map<string, number>();
  for (const row of clicks) {
    if (!row.session_id?.trim()) continue;
    counts.set(row.session_id, (counts.get(row.session_id) ?? 0) + 1);
  }
  return [...counts.values()].filter((c) => c > 1).length;
}

function growthPercent(current: number, prior: number): number | null {
  if (prior === 0 && current === 0) return null;
  if (prior === 0) return 100;
  return Math.round(((current - prior) / prior) * 100);
}

export function buildGlobalOverview(data: AudienceCollectedData): GlobalAudienceOverview {
  const totalContacts = data.audienceContacts.length;
  const sessions = uniqueSessions(data.clickTelemetry);
  const activeSessions = data.clickTelemetry.filter((c) => isWithin(c.created_at, MS_MONTH)).length > 0
    ? [...new Set(data.clickTelemetry.filter((c) => isWithin(c.created_at, MS_MONTH) && c.session_id).map((c) => c.session_id))].length
    : 0;
  const newContacts = countInWindow(data.audienceContacts, MS_MONTH);
  const returning = returningSessions(data.clickTelemetry);

  const priorContacts = data.audienceContacts.filter(
    (c) => !isWithin(c.created_at, MS_MONTH) && isWithin(c.created_at, MS_MONTH * 2),
  ).length;
  const audienceGrowth = growthPercent(newContacts, priorContacts);

  const hasLiveData = totalContacts > 0 || data.clickTelemetry.length > 0;

  const metrics = GLOBAL_AUDIENCE_METRIC_KEYS.map((def) => {
    let value: number | null = null;
    let available = false;
    let source: 'production_data' | 'none' = 'none';
    let emptyStateMessage = 'Awaiting audience data from connected integrations.';

    if (def.key === 'total_audience' && totalContacts > 0) {
      value = totalContacts;
      available = true;
      source = 'production_data';
      emptyStateMessage = '';
    } else if (def.key === 'active_audience' && activeSessions > 0) {
      value = activeSessions;
      available = true;
      source = 'production_data';
      emptyStateMessage = '';
    } else if (def.key === 'returning_audience' && returning > 0) {
      value = returning;
      available = true;
      source = 'production_data';
      emptyStateMessage = '';
    } else if (def.key === 'new_audience' && newContacts > 0) {
      value = newContacts;
      available = true;
      source = 'production_data';
      emptyStateMessage = '';
    } else if (def.key === 'audience_growth' && audienceGrowth != null) {
      value = audienceGrowth;
      available = true;
      source = 'production_data';
      emptyStateMessage = '';
    }

    return {
      key: def.key,
      label: def.label,
      value,
      available,
      source,
      unit: def.unit,
      emptyStateMessage: available ? '' : emptyStateMessage,
    };
  });

  return {
    metrics,
    hasLiveData,
    summary: hasLiveData
      ? `${totalContacts} owned contact(s) · ${sessions.size} unique session(s) tracked`
      : 'Audience data activates when Smart Link telemetry and audience capture are recorded.',
  };
}

export function buildGeographicIntelligence(data: AudienceCollectedData): GeographicIntelligence {
  const countryMap = new Map<string, number>();
  for (const row of data.clickTelemetry) {
    if (row.user_country?.trim()) {
      const code = row.user_country.toUpperCase();
      countryMap.set(code, (countryMap.get(code) ?? 0) + 1);
    }
  }

  const totalGeo = [...countryMap.values()].reduce((a, b) => a + b, 0);
  const countries = [...countryMap.entries()]
    .map(([code, count]) => ({
      territory: countryLabel(code),
      count,
      share: totalGeo > 0 ? Math.round((count / totalGeo) * 100) : 0,
      growthIndicator: 'stable' as const,
    }))
    .sort((a, b) => b.count - a.count);

  const territoryFromSubs = new Map<string, number>();
  for (const sub of data.submissions) {
    if (sub.territory?.trim()) {
      const t = sub.territory.trim();
      territoryFromSubs.set(t, (territoryFromSubs.get(t) ?? 0) + 1);
    }
  }

  const regions = [...territoryFromSubs.entries()].map(([territory, count]) => ({
    territory,
    count,
    share: data.submissions.length > 0 ? Math.round((count / data.submissions.length) * 100) : 0,
    growthIndicator: 'unknown' as const,
  }));

  const hasLiveData = countries.length > 0 || regions.length > 0;

  return {
    countries,
    regions,
    cities: [],
    topTerritories: countries.slice(0, 5).map((c) => c.territory),
    geographicGrowth: countries.length > 1 ? countries.length : null,
    summary: hasLiveData
      ? `${countries.length} country signal(s) from Smart Link telemetry`
      : 'Geographic intelligence activates when audience telemetry includes country data.',
    hasLiveData,
  };
}

export function buildDemographicIntelligence(data: AudienceCollectedData): DemographicIntelligence {
  const languages = new Map<string, number>();
  for (const sub of data.submissions) {
    if (sub.language?.trim()) {
      const lang = sub.language.trim();
      languages.set(lang, (languages.get(lang) ?? 0) + 1);
    }
  }

  const langSegments = [...languages.entries()].map(([label, value]) => ({
    key: label.toLowerCase().replace(/\s+/g, '_'),
    label,
    value,
    available: true,
    emptyStateMessage: '',
  }));

  const emptySegment = (label: string) => ({
    key: label.toLowerCase().replace(/\s+/g, '_'),
    label,
    value: null as number | null,
    available: false,
    emptyStateMessage: 'Demographic data requires platform API integration.',
  });

  return {
    ageGroups: [emptySegment('18-24'), emptySegment('25-34'), emptySegment('35-44'), emptySegment('45+')],
    gender: [emptySegment('Female'), emptySegment('Male'), emptySegment('Non-binary'), emptySegment('Prefer not to say')],
    languages: langSegments.length > 0 ? langSegments : [emptySegment('Language')],
    audienceSegments: [emptySegment('Core Listeners'), emptySegment('Casual Listeners'), emptySegment('Discovery Audience')],
    listenerCategories: [emptySegment('Playlist Listeners'), emptySegment('Direct Followers'), emptySegment('Campaign Acquired')],
    hasLiveData: langSegments.length > 0,
    summary: langSegments.length > 0
      ? 'Language signals from submission metadata. Age/gender segments await platform API connectors.'
      : 'Demographic intelligence framework ready. Platform API integration required for age and gender data.',
  };
}

export function buildPlatformDistribution(data: AudienceCollectedData): PlatformAudienceDistribution {
  const dspCounts = new Map<string, number>();
  for (const row of data.clickTelemetry) {
    dspCounts.set(row.destination_dsp, (dspCounts.get(row.destination_dsp) ?? 0) + 1);
  }

  const totalClicks = [...dspCounts.values()].reduce((a, b) => a + b, 0);
  const connectorInputs = AUDIENCE_PLATFORM_DEFINITIONS.map((def) => {
    const telemetryKey = def.telemetryKey;
    const count = telemetryKey ? (dspCounts.get(telemetryKey) ?? dspCounts.get('youtube') ?? 0) : 0;
    return {
      platformKey: def.platformKey,
      hasTelemetry: count > 0,
      lastActivity: count > 0
        ? data.clickTelemetry.find((c) => c.destination_dsp === telemetryKey || c.destination_dsp === 'youtube')?.created_at ?? null
        : null,
    };
  });

  const connectors = buildAudienceConnectors(connectorInputs);
  const entries = connectors.map((c) => {
    const def = AUDIENCE_PLATFORM_DEFINITIONS.find((d) => d.platformKey === c.platformKey)!;
    const count = def.telemetryKey
      ? (dspCounts.get(def.telemetryKey) ?? (def.telemetryKey === 'youtube' ? dspCounts.get('youtube') : 0) ?? 0)
      : null;

    return {
      platformKey: c.platformKey,
      label: c.label,
      connectionStatus: c.connectionStatus,
      audienceCount: count != null && count > 0 ? count : null,
      share: count != null && count > 0 && totalClicks > 0 ? Math.round((count / totalClicks) * 100) : null,
      apiReady: def.apiIntegrationReady,
    };
  });

  const connectedCount = entries.filter((e) => e.connectionStatus === 'connected').length;

  return {
    entries,
    connectedCount,
    summary: connectedCount > 0
      ? `Audience signals across ${connectedCount} platform(s) from Smart Link telemetry`
      : 'Platform audience distribution awaits connected integrations and telemetry.',
  };
}

export function buildBehaviourIntelligence(data: AudienceCollectedData): AudienceBehaviourIntelligence {
  const sessions = uniqueSessions(data.clickTelemetry);
  const returning = returningSessions(data.clickTelemetry);
  const newContacts = countInWindow(data.audienceContacts, MS_MONTH);
  const mobileClicks = data.clickTelemetry.filter((c) => c.user_device_type === 'mobile').length;
  const desktopClicks = data.clickTelemetry.filter((c) => c.user_device_type === 'desktop').length;

  const metrics = [
    { key: 'returning', label: 'Returning Audience', value: returning > 0 ? returning : null, available: returning > 0, detail: 'Sessions with multiple Smart Link interactions' },
    { key: 'new', label: 'New Audience', value: newContacts > 0 ? newContacts : null, available: newContacts > 0, detail: 'Owned contacts captured in last 30 days' },
    { key: 'listening', label: 'Listening Behaviour', value: null, available: false, detail: 'Listening history integration pending' },
    { key: 'engagement', label: 'Engagement Behaviour', value: data.clickTelemetry.length > 0 ? data.clickTelemetry.length : null, available: data.clickTelemetry.length > 0, detail: 'Smart Link click interactions' },
    { key: 'platform', label: 'Platform Behaviour', value: sessions.size > 0 ? sessions.size : null, available: sessions.size > 0, detail: 'Unique session footprint across platforms' },
    { key: 'growth', label: 'Growth Behaviour', value: newContacts > 0 ? newContacts : null, available: newContacts > 0, detail: `${mobileClicks} mobile · ${desktopClicks} desktop clicks` },
  ];

  const hasLiveData = metrics.some((m) => m.available);

  return {
    metrics,
    summary: hasLiveData ? 'Behaviour signals derived from production telemetry and owned contacts.' : 'Behaviour intelligence awaiting audience telemetry.',
    hasLiveData,
  };
}

export function buildEngagementIntelligence(data: AudienceCollectedData): EngagementIntelligence {
  const totalClicks = data.clickTelemetry.length;
  const totalContacts = data.audienceContacts.length;

  const metrics = ENGAGEMENT_METRIC_KEYS.map((def) => {
    if (def.key === 'smart_link_clicks') {
      return {
        key: def.key,
        label: def.label,
        value: totalClicks > 0 ? totalClicks : null,
        available: totalClicks > 0,
        source: totalClicks > 0 ? ('production_data' as const) : ('none' as const),
        emptyStateMessage: 'No Smart Link click telemetry recorded yet.',
      };
    }
    if (def.key === 'owned_contacts') {
      return {
        key: def.key,
        label: def.label,
        value: totalContacts > 0 ? totalContacts : null,
        available: totalContacts > 0,
        source: totalContacts > 0 ? ('production_data' as const) : ('none' as const),
        emptyStateMessage: 'No owned audience contacts captured yet.',
      };
    }
    return {
      key: def.key,
      label: def.label,
      value: null,
      available: false,
      source: 'none' as const,
      emptyStateMessage: `${def.label} metrics require platform API integration.`,
    };
  });

  const hasLiveData = metrics.some((m) => m.available);

  return {
    metrics,
    hasLiveData,
    summary: hasLiveData
      ? `${totalClicks} click(s) · ${totalContacts} owned contact(s)`
      : 'Engagement metrics await platform integrations and audience capture.',
  };
}

export function buildGrowthIntelligence(data: AudienceCollectedData): GrowthIntelligence {
  const daily = countInWindow(data.audienceContacts, MS_DAY) + data.clickTelemetry.filter((c) => isWithin(c.created_at, MS_DAY)).length;
  const weekly = countInWindow(data.audienceContacts, MS_WEEK) + data.clickTelemetry.filter((c) => isWithin(c.created_at, MS_WEEK)).length;
  const monthly = countInWindow(data.audienceContacts, MS_MONTH) + data.clickTelemetry.filter((c) => isWithin(c.created_at, MS_MONTH)).length;

  const priorMonthly = data.audienceContacts.filter(
    (c) => !isWithin(c.created_at, MS_MONTH) && isWithin(c.created_at, MS_MONTH * 2),
  ).length;

  const periods = [
    { period: 'daily' as const, label: 'Daily Growth', value: daily > 0 ? daily : null, trend: 'stable' as const, available: daily > 0 },
    { period: 'weekly' as const, label: 'Weekly Growth', value: weekly > 0 ? weekly : null, trend: 'stable' as const, available: weekly > 0 },
    { period: 'monthly' as const, label: 'Monthly Growth', value: monthly > 0 ? monthly : null, trend: monthly > priorMonthly ? 'up' as const : 'stable' as const, available: monthly > 0 },
    { period: 'quarterly' as const, label: 'Quarterly Growth', value: null, trend: 'unknown' as const, available: false },
    { period: 'yearly' as const, label: 'Yearly Growth', value: null, trend: 'unknown' as const, available: false },
  ];

  const hasLiveData = periods.some((p) => p.available);

  return {
    periods,
    growthTrend: hasLiveData ? 'Developing audience signals from production telemetry' : 'Awaiting growth data',
    hasLiveData,
    summary: hasLiveData
      ? `Monthly audience activity: ${monthly} signal(s)`
      : 'Growth intelligence activates when audience capture and telemetry accumulate.',
  };
}

export function buildExecutiveReport(
  overview: GlobalAudienceOverview,
  geographic: GeographicIntelligence,
  demographic: DemographicIntelligence,
  platform: PlatformAudienceDistribution,
  engagement: EngagementIntelligence,
  growth: GrowthIntelligence,
): ExecutiveAudienceReport {
  const recommendations: string[] = [];

  if (!overview.hasLiveData) {
    recommendations.push('Activate Smart Link audience capture to begin building owned audience intelligence.');
  }
  if (geographic.countries.length === 0) {
    recommendations.push('Share Smart Links internationally to populate geographic audience signals.');
  }
  if (!demographic.hasLiveData) {
    recommendations.push('Connect platform APIs for age, gender, and segment-level demographic intelligence.');
  }
  if (platform.connectedCount < 3) {
    recommendations.push('Expand platform connector coverage for unified audience distribution.');
  }
  if (geographic.topTerritories.length > 0) {
    recommendations.push(`Prioritize ${geographic.topTerritories[0]} — top performing territory in current telemetry.`);
  }

  const audienceHealth: ExecutiveAudienceReport['audienceHealth'] =
    overview.hasLiveData && geographic.hasLiveData ? 'healthy'
      : overview.hasLiveData || engagement.hasLiveData ? 'developing'
        : 'awaiting_data';

  return {
    audienceHealth,
    growthSummary: growth.summary,
    geographicSummary: geographic.summary,
    demographicSummary: demographic.summary,
    platformSummary: platform.summary,
    engagementSummary: engagement.summary,
    recommendations: recommendations.slice(0, 5),
    summary: `${overview.hasLiveData ? 'Audience signals active' : 'Awaiting audience data'}. Platform API connectors framework-ready.`,
  };
}

export function buildAudienceTimeline(data: AudienceCollectedData): AudienceTimelineEvent[] {
  const events: AudienceTimelineEvent[] = [];

  const firstContact = data.audienceContacts[data.audienceContacts.length - 1];
  if (firstContact) {
    events.push({
      id: 'first-audience',
      type: 'first_audience',
      label: 'First audience contact captured',
      timestamp: firstContact.created_at,
      detail: 'Initial owned audience contact recorded in production database.',
    });
  }

  const milestones = [5, 10, 25, 50, 100];
  for (const m of milestones) {
    if (data.audienceContacts.length >= m) {
      const contact = data.audienceContacts[data.audienceContacts.length - m];
      if (contact) {
        events.push({
          id: `milestone-${m}`,
          type: 'growth_milestone',
          label: `${m} audience contacts milestone`,
          timestamp: contact.created_at,
          detail: `Owned audience reached ${m} contact(s).`,
        });
      }
    }
  }

  const countries = new Set(data.clickTelemetry.map((c) => c.user_country).filter(Boolean));
  if (countries.size > 1) {
    const latest = data.clickTelemetry.find((c) => c.user_country);
    if (latest) {
      events.push({
        id: 'geo-expansion',
        type: 'geographic_expansion',
        label: `Geographic expansion — ${countries.size} countries`,
        timestamp: latest.created_at,
        detail: `Audience signals detected across ${countries.size} territories.`,
      });
    }
  }

  const dsps = new Set(data.clickTelemetry.map((c) => c.destination_dsp));
  if (dsps.size > 1) {
    const latest = data.clickTelemetry[0];
    events.push({
      id: 'platform-expansion',
      type: 'platform_expansion',
      label: `Platform expansion — ${dsps.size} destinations`,
      timestamp: latest.created_at,
      detail: 'Audience engagement across multiple streaming destinations.',
    });
  }

  const campaigns = data.clickTelemetry.filter((c) => c.utm_campaign?.trim());
  if (campaigns.length > 0) {
    events.push({
      id: 'campaign-impact',
      type: 'campaign_impact',
      label: `Campaign activity — ${campaigns[0].utm_campaign}`,
      timestamp: campaigns[0].created_at,
      detail: 'UTM-tagged audience traffic recorded.',
    });
  }

  if (data.clickTelemetry.length > 0) {
    events.push({
      id: 'audience-peak',
      type: 'audience_peak',
      label: 'Latest audience activity',
      timestamp: data.clickTelemetry[0].created_at,
      detail: 'Most recent Smart Link audience interaction.',
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);
}

export function buildHealthDashboard(
  overview: GlobalAudienceOverview,
  geographic: GeographicIntelligence,
  platform: PlatformAudienceDistribution,
  engagement: EngagementIntelligence,
  growth: GrowthIntelligence,
): AudienceHealthDashboard {
  const dataPoints = [
    overview.hasLiveData,
    geographic.hasLiveData,
    engagement.hasLiveData,
    growth.hasLiveData,
    platform.connectedCount > 0,
  ].filter(Boolean).length;

  const maxPoints = 5;
  const healthScore = dataPoints > 0 ? Math.round((dataPoints / maxPoints) * 100) : null;

  return {
    audienceHealthScore: healthScore,
    growthScore: growth.hasLiveData ? Math.min(100, (growth.periods.find((p) => p.period === 'monthly')?.value ?? 0) * 10) : null,
    engagementScore: engagement.hasLiveData ? Math.min(100, (engagement.metrics.filter((m) => m.available).length / engagement.metrics.length) * 100) : null,
    geographicCoverage: geographic.countries.length > 0 ? Math.min(100, geographic.countries.length * 20) : null,
    platformCoverage: platform.connectedCount > 0 ? Math.min(100, (platform.connectedCount / platform.entries.length) * 100) : null,
    intelligenceStatus: dataPoints >= 4 ? 'active' : dataPoints >= 2 ? 'partial' : 'awaiting_integrations',
    summary: healthScore != null
      ? `Audience intelligence ${healthScore}% data coverage from production sources`
      : 'Audience Health Dashboard awaiting production audience data.',
  };
}

export function buildPortfolioSummary(data: AudienceCollectedData): AudienceEnginePortfolioSummary {
  const sessions = uniqueSessions(data.clickTelemetry);
  const countries = new Set(data.clickTelemetry.map((c) => c.user_country).filter(Boolean));

  return {
    totalAudienceContacts: data.audienceContacts.length > 0 ? data.audienceContacts.length : null,
    activeSessions: sessions.size > 0 ? sessions.size : null,
    geographicTerritories: countries.size,
    connectedPlatforms: new Set(data.clickTelemetry.map((c) => c.destination_dsp)).size,
    summary: data.audienceContacts.length > 0 || data.clickTelemetry.length > 0
      ? `${data.audienceContacts.length} contact(s) · ${sessions.size} session(s) · ${countries.size} territor(ies)`
      : 'No audience data on record.',
  };
}

export function processAudienceData(data: AudienceCollectedData) {
  const globalOverview = buildGlobalOverview(data);
  const geographic = buildGeographicIntelligence(data);
  const demographic = buildDemographicIntelligence(data);
  const platformDistribution = buildPlatformDistribution(data);
  const behaviour = buildBehaviourIntelligence(data);
  const engagement = buildEngagementIntelligence(data);
  const growth = buildGrowthIntelligence(data);
  const executiveReport = buildExecutiveReport(globalOverview, geographic, demographic, platformDistribution, engagement, growth);
  const timeline = buildAudienceTimeline(data);
  const healthDashboard = buildHealthDashboard(globalOverview, geographic, platformDistribution, engagement, growth);
  const portfolioSummary = buildPortfolioSummary(data);
  const connectors = buildAudienceConnectors(
    AUDIENCE_PLATFORM_DEFINITIONS.map((def) => {
      const count = def.telemetryKey
        ? data.clickTelemetry.filter((c) => c.destination_dsp === def.telemetryKey || (def.telemetryKey === 'youtube' && c.destination_dsp === 'youtube')).length
        : 0;
      return {
        platformKey: def.platformKey,
        hasTelemetry: count > 0,
        lastActivity: count > 0 ? data.clickTelemetry.find((c) => c.destination_dsp === def.telemetryKey)?.created_at ?? null : null,
      };
    }),
  );

  return {
    portfolioSummary,
    connectors,
    globalOverview,
    geographic,
    demographic,
    platformDistribution,
    behaviour,
    engagement,
    growth,
    executiveReport,
    timeline,
    healthDashboard,
  };
}
