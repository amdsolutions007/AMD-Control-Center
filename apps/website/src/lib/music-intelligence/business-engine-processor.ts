import type { AggregatedBusinessData } from './business-engine-aggregator';
import {
  ALERT_THRESHOLDS,
  REVENUE_METRIC_KEYS,
  SCORECARD_KEYS,
} from './business-engine-constants';
import { buildRevenueConnectors } from './business-engine-connectors';
import type {
  BusinessEngineScope,
  BusinessHealthDashboard,
  BusinessHealthIntelligence,
  BusinessKpiMetric,
  BusinessTimelineEvent,
  CrossEngineIntelligence,
  EngineKey,
  ExecutiveAlert,
  ExecutiveBusinessReport,
  ExecutiveKpiDashboard,
  ExecutivePerformanceIntelligence,
  ExecutiveScorecard,
  ExecutiveScorecards,
  GrowthIntelligence,
  GrowthPeriodMetric,
  HealthLevel,
  PerformanceDomain,
  RevenueIntelligenceFramework,
  RevenueMetric,
} from './business-engine-types';

function widgetValue(
  aggregated: AggregatedBusinessData,
  id: string,
): number | string | null {
  const w = aggregated.widgetMap.get(id);
  if (!w || w.emptyState) return null;
  return w.value;
}

function healthFromScore(score: number | null): HealthLevel {
  if (score == null) return 'awaiting_data';
  if (score >= 70) return 'healthy';
  if (score >= 45) return 'developing';
  return 'needs_attention';
}

function averageScores(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s != null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function buildExecutiveKpis(aggregated: AggregatedBusinessData): ExecutiveKpiDashboard {
  const { engines, scope } = aggregated;
  const metrics: BusinessKpiMetric[] = [
    {
      key: 'total_artists',
      label: 'Total Artists',
      value: widgetValue(aggregated, 'total_artists'),
      available: scope === 'partner',
      source: 'intelligence',
      emptyStateMessage: scope === 'artist' ? 'Artist scope — roster KPI available in partner view.' : 'Awaiting artist data.',
    },
    {
      key: 'total_partners',
      label: 'Total Partners',
      value: widgetValue(aggregated, 'total_partners'),
      available: scope === 'partner',
      source: 'intelligence',
      emptyStateMessage: 'Awaiting partner data.',
    },
    {
      key: 'total_organizations',
      label: 'Total Organizations',
      value: widgetValue(aggregated, 'total_organizations'),
      available: scope === 'partner',
      source: 'intelligence',
      emptyStateMessage: 'Awaiting organization data.',
    },
    {
      key: 'total_submissions',
      label: 'Total Music Submissions',
      value: engines.music.portfolioSummary.totalSubmissions,
      available: engines.music.dataSource === 'live',
      source: 'music',
      emptyStateMessage: 'No submissions on record.',
    },
    {
      key: 'active_campaigns',
      label: 'Active Campaigns',
      value: engines.marketing.campaigns.activeCampaigns,
      available: engines.marketing.campaigns.hasLiveData,
      source: 'marketing',
      emptyStateMessage: 'Tag campaigns with UTM parameters.',
    },
    {
      key: 'streaming_activity',
      label: 'Streaming Activity',
      value: engines.streaming.portfolioSummary.totalRedirectClicks,
      available: engines.streaming.portfolioSummary.totalRedirectClicks != null,
      source: 'streaming',
      emptyStateMessage: 'Awaiting streaming telemetry.',
    },
    {
      key: 'audience_growth',
      label: 'Audience Contacts',
      value: engines.audience.portfolioSummary.totalAudienceContacts,
      available: engines.audience.portfolioSummary.totalAudienceContacts != null,
      source: 'audience',
      emptyStateMessage: 'Awaiting audience data.',
    },
    {
      key: 'marketing_clicks',
      label: 'Marketing Clicks',
      value: engines.marketing.portfolioSummary.totalClicks,
      available: engines.marketing.portfolioSummary.totalClicks != null,
      source: 'marketing',
      emptyStateMessage: 'Awaiting marketing telemetry.',
    },
    {
      key: 'platform_health',
      label: 'Platform Health',
      value: engines.ai.platformHealth?.score ?? engines.ai.readinessScore,
      available: engines.ai.readinessScore != null || engines.ai.platformHealth?.score != null,
      source: 'ai',
      emptyStateMessage: 'Awaiting platform health data.',
    },
    {
      key: 'executive_score',
      label: 'Executive Score',
      value: null,
      available: false,
      source: 'composite',
      emptyStateMessage: 'Computed from health dashboard.',
    },
  ];

  const hasLiveData = metrics.some((m) => m.available && m.value != null);

  return {
    metrics,
    executiveScore: null,
    hasLiveData,
    summary: hasLiveData
      ? 'Executive KPIs aggregated from production intelligence engines.'
      : 'Executive KPI dashboard awaiting production data across engines.',
  };
}

function buildBusinessHealth(
  aggregated: AggregatedBusinessData,
  healthDashboard: BusinessHealthDashboard,
): BusinessHealthIntelligence {
  const coverage = Math.round((aggregated.liveEngineCount / 6) * 100);
  const growthScore = healthDashboard.businessGrowthScore;
  const executiveReadiness = aggregated.engines.ai.readinessScore;

  const overallScore = healthDashboard.executiveHealthScore;
  const operationalHealth: HealthLevel =
    aggregated.engines.music.portfolioSummary.totalSubmissions > 0 ? 'developing' : 'awaiting_data';

  return {
    overallHealth: healthFromScore(overallScore),
    growthScore,
    operationalHealth,
    platformStability: healthFromScore(aggregated.engines.ai.platformHealth?.score ?? null),
    intelligenceCoverage: coverage,
    executiveReadiness,
    summary: `Intelligence coverage: ${coverage}% · ${aggregated.liveEngineCount}/6 engines live.`,
  };
}

function buildGrowthIntelligence(aggregated: AggregatedBusinessData): GrowthIntelligence {
  const audienceGrowth = aggregated.engines.audience.growth;
  const periods: GrowthPeriodMetric[] = audienceGrowth.periods.map((p) => ({
    period: p.period,
    label: p.label,
    value: p.value,
    trend: p.trend,
    available: p.available,
  }));

  const hasLiveData = periods.some((p) => p.available && p.value != null);

  return {
    periods,
    growthTrend: audienceGrowth.growthTrend,
    hasLiveData,
    summary: hasLiveData
      ? audienceGrowth.summary
      : 'Growth intelligence awaiting sufficient historical data across engines.',
  };
}

function buildRevenueFramework(): RevenueIntelligenceFramework {
  const connectors = buildRevenueConnectors();
  const metrics: RevenueMetric[] = REVENUE_METRIC_KEYS.map((m) => ({
    key: m.key,
    label: m.label,
    value: null,
    available: false,
    emptyStateMessage: 'Awaiting financial API integration.',
  }));

  return {
    connectors,
    metrics,
    hasLiveData: false,
    summary: 'Revenue framework ready. Financial connectors await executive authorization.',
  };
}

function buildPerformanceIntelligence(aggregated: AggregatedBusinessData): ExecutivePerformanceIntelligence {
  const { engines } = aggregated;
  const domains: PerformanceDomain[] = [
    {
      key: 'artist',
      label: 'Artist Performance',
      score: engines.music.portfolioSummary.averageReadinessScore,
      summary: engines.music.portfolioSummary.summary,
      source: 'music',
    },
    {
      key: 'partner',
      label: 'Partner Performance',
      score: engines.ai.platformHealth?.score ?? null,
      summary: engines.ai.platformHealth?.summary ?? 'Awaiting partner performance data.',
      source: 'ai',
    },
    {
      key: 'campaign',
      label: 'Campaign Performance',
      score: engines.marketing.healthDashboard.marketingHealthScore,
      summary: engines.marketing.executiveReport.marketingPerformance,
      source: 'marketing',
    },
    {
      key: 'audience',
      label: 'Audience Performance',
      score: engines.audience.healthDashboard.audienceHealthScore,
      summary: engines.audience.executiveReport.summary,
      source: 'audience',
    },
    {
      key: 'streaming',
      label: 'Streaming Performance',
      score: engines.streaming.metrics.hasTelemetryData
        ? engines.streaming.portfolioSummary.platformsWithTelemetry * 20
        : null,
      summary: engines.streaming.executiveReport.summary,
      source: 'streaming',
    },
    {
      key: 'platform',
      label: 'Platform Performance',
      score: engines.ai.readinessScore,
      summary: engines.ai.readinessLabel,
      source: 'ai',
    },
  ];

  const hasLiveData = domains.some((d) => d.score != null);

  return {
    domains,
    hasLiveData,
    summary: hasLiveData
      ? 'Executive performance aggregated from upstream intelligence engines.'
      : 'Performance intelligence awaiting production data.',
  };
}

function buildCrossEngine(aggregated: AggregatedBusinessData): CrossEngineIntelligence {
  const { engines, engineStatuses, allRecommendations, liveEngineCount } = aggregated;

  const summaries = [
    engines.intelligence.widgets.length > 0 ? 'Dashboard metrics active.' : null,
    engines.ai.executiveInsights[0] ?? engines.ai.readinessLabel,
    engines.music.portfolioSummary.summary,
    engines.streaming.executiveReport.summary,
    engines.audience.executiveReport.summary,
    engines.marketing.executiveReport.summary,
  ].filter(Boolean);

  return {
    unifiedSummary: summaries.join(' '),
    engineStatuses,
    topRecommendations: allRecommendations.slice(0, 8),
    enginesWithLiveData: liveEngineCount,
    totalEngines: 6,
  };
}

function buildAlerts(
  aggregated: AggregatedBusinessData,
  healthDashboard: BusinessHealthDashboard,
): ExecutiveAlert[] {
  const alerts: ExecutiveAlert[] = [];
  const now = new Date().toISOString();

  for (const status of aggregated.engineStatuses) {
    if (status.status === 'fallback') {
      alerts.push({
        id: `missing-${status.engine}`,
        type: 'missing_data',
        severity: 'warning',
        title: `${status.label} awaiting data`,
        detail: status.summary,
        source: status.engine,
        timestamp: now,
      });
    }
  }

  if (aggregated.liveEngineCount < ALERT_THRESHOLDS.intelligenceGapMinEngines) {
    alerts.push({
      id: 'intelligence-gap',
      type: 'intelligence_gap',
      severity: 'warning',
      title: 'Intelligence coverage gap',
      detail: `${aggregated.liveEngineCount}/6 engines reporting live data.`,
      source: 'composite',
      timestamp: now,
    });
  }

  const growthUp = aggregated.engines.audience.growth.periods.find(
    (p) => p.trend === 'up' && p.value != null && p.value >= ALERT_THRESHOLDS.rapidGrowthValue,
  );
  if (growthUp) {
    alerts.push({
      id: 'rapid-growth',
      type: 'rapid_growth',
      severity: 'opportunity',
      title: 'Rapid audience growth detected',
      detail: `${growthUp.label}: ${growthUp.value} new contacts.`,
      source: 'audience',
      timestamp: now,
    });
  }

  if (
    healthDashboard.executiveHealthScore != null &&
    healthDashboard.executiveHealthScore < ALERT_THRESHOLDS.lowHealthScore
  ) {
    alerts.push({
      id: 'declining-health',
      type: 'declining_performance',
      severity: 'critical',
      title: 'Executive health below threshold',
      detail: `Score: ${healthDashboard.executiveHealthScore}% — review engine performance.`,
      source: 'composite',
      timestamp: now,
    });
  }

  if (aggregated.engines.marketing.campaigns.totalCampaigns === 0) {
    alerts.push({
      id: 'campaign-opportunity',
      type: 'campaign_opportunity',
      severity: 'info',
      title: 'Campaign attribution opportunity',
      detail: 'Tag Smart Links with UTM parameters to activate Marketing Intelligence.',
      source: 'marketing',
      timestamp: now,
    });
  }

  return alerts;
}

function buildScorecards(aggregated: AggregatedBusinessData): ExecutiveScorecards {
  const { engines } = aggregated;

  const scoreMap: Record<string, { score: number | null; summary: string }> = {
    platform: {
      score: engines.ai.readinessScore,
      summary: engines.ai.readinessLabel,
    },
    artists: {
      score: engines.music.portfolioSummary.averageQualityScore,
      summary: engines.music.portfolioSummary.summary,
    },
    partners: {
      score: engines.ai.platformHealth?.score ?? null,
      summary: engines.ai.platformHealth?.summary ?? 'Awaiting partner metrics.',
    },
    campaigns: {
      score: engines.marketing.healthDashboard.campaignScore,
      summary: engines.marketing.executiveReport.summary,
    },
    audience: {
      score: engines.audience.healthDashboard.audienceHealthScore,
      summary: engines.audience.healthDashboard.summary,
    },
    streaming: {
      score: engines.streaming.metrics.hasTelemetryData
        ? Math.min(100, engines.streaming.portfolioSummary.platformsWithTelemetry * 25)
        : null,
      summary: engines.streaming.executiveReport.summary,
    },
    marketing: {
      score: engines.marketing.healthDashboard.marketingHealthScore,
      summary: engines.marketing.healthDashboard.summary,
    },
  };

  const scorecards: ExecutiveScorecard[] = SCORECARD_KEYS.map((def) => {
    const entry = scoreMap[def.key];
    return {
      key: def.key,
      label: def.label,
      score: entry.score,
      status: healthFromScore(entry.score),
      summary: entry.summary,
    };
  });

  const overallScore = averageScores(scorecards.map((s) => s.score));

  return {
    scorecards,
    overallScore,
    summary: overallScore != null
      ? `Executive scorecard composite: ${overallScore}% across ${scorecards.filter((s) => s.score != null).length} domains.`
      : 'Executive scorecards awaiting production data.',
  };
}

function buildTimeline(aggregated: AggregatedBusinessData): BusinessTimelineEvent[] {
  const { engines } = aggregated;
  const events: BusinessTimelineEvent[] = [];

  const pushEvents = (
    engine: EngineKey,
    items: { id: string; type: string; label: string; timestamp: string; detail: string }[],
  ) => {
    for (const item of items) {
      events.push({ engine, ...item });
    }
  };

  for (const act of engines.intelligence.recentActivity) {
    events.push({
      id: `intel-${act.id}`,
      engine: 'intelligence',
      type: act.type,
      label: act.title,
      timestamp: act.timestamp,
      detail: act.subtitle,
    });
  }

  for (const item of engines.ai.aiActivity) {
    events.push({
      id: `ai-${item.id}`,
      engine: 'ai',
      type: item.type,
      label: item.title,
      timestamp: item.timestamp,
      detail: item.detail,
    });
  }

  for (const report of engines.music.reports) {
    pushEvents('music', report.timeline);
  }

  pushEvents('streaming', engines.streaming.timeline);
  pushEvents('audience', engines.audience.timeline);
  pushEvents('marketing', engines.marketing.timeline);

  return events
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);
}

function buildHealthDashboard(aggregated: AggregatedBusinessData): BusinessHealthDashboard {
  const { engines } = aggregated;

  const engineScores = [
    engines.ai.readinessScore,
    engines.music.portfolioSummary.averageReadinessScore,
    engines.audience.healthDashboard.audienceHealthScore,
    engines.marketing.healthDashboard.marketingHealthScore,
    engines.streaming.metrics.hasTelemetryData
      ? Math.min(100, engines.streaming.portfolioSummary.platformsWithTelemetry * 25)
      : null,
    engines.ai.platformHealth?.score ?? null,
  ];

  const executiveHealthScore = averageScores(engineScores);
  const businessGrowthScore = engines.audience.healthDashboard.growthScore;
  const revenueReadiness = 0;
  const platformHealthScore = engines.ai.platformHealth?.score ?? engines.ai.readinessScore;
  const coverageBonus = Math.round((aggregated.liveEngineCount / 6) * 100);
  const overallExecutiveScore = averageScores([
    executiveHealthScore,
    businessGrowthScore,
    platformHealthScore,
    coverageBonus,
  ]);

  return {
    executiveHealthScore,
    businessGrowthScore,
    revenueReadiness,
    platformHealthScore,
    overallExecutiveScore,
    summary: overallExecutiveScore != null
      ? `Overall executive score: ${overallExecutiveScore}% · ${aggregated.liveEngineCount}/6 engines live.`
      : 'Executive health dashboard awaiting production data.',
  };
}

function buildExecutiveReport(
  aggregated: AggregatedBusinessData,
  kpis: ExecutiveKpiDashboard,
  health: BusinessHealthIntelligence,
  crossEngine: CrossEngineIntelligence,
  alerts: ExecutiveAlert[],
  scorecards: ExecutiveScorecards,
): ExecutiveBusinessReport {
  const risks = alerts
    .filter((a) => a.severity === 'critical' || a.severity === 'warning')
    .map((a) => a.title);

  const opportunities = alerts
    .filter((a) => a.severity === 'opportunity' || a.severity === 'info')
    .map((a) => a.title);

  const recommendations = crossEngine.topRecommendations;

  return {
    businessStatus: crossEngine.unifiedSummary,
    operationalHealth: health.summary,
    executiveKpiSummary: kpis.summary,
    intelligenceSummary: `${crossEngine.enginesWithLiveData}/${crossEngine.totalEngines} engines reporting live data.`,
    businessRisks: risks.length > 0 ? risks : ['No critical risks detected from current engine data.'],
    growthOpportunities:
      opportunities.length > 0 ? opportunities : ['Activate UTM tagging and complete profiles to unlock intelligence.'],
    recommendations,
    summary:
      scorecards.overallScore != null
        ? `Executive business report · composite score ${scorecards.overallScore}% · ${health.intelligenceCoverage}% intelligence coverage.`
        : 'Executive business report awaiting production data across intelligence engines.',
  };
}

export function processBusinessEngineData(aggregated: AggregatedBusinessData) {
  const healthDashboard = buildHealthDashboard(aggregated);
  const executiveKpis = buildExecutiveKpis(aggregated);
  executiveKpis.executiveScore = healthDashboard.overallExecutiveScore;

  const kpiMetrics = executiveKpis.metrics.find((m) => m.key === 'executive_score');
  if (kpiMetrics) {
    kpiMetrics.value = healthDashboard.overallExecutiveScore;
    kpiMetrics.available = healthDashboard.overallExecutiveScore != null;
  }

  const businessHealth = buildBusinessHealth(aggregated, healthDashboard);
  const growth = buildGrowthIntelligence(aggregated);
  const revenue = buildRevenueFramework();
  const performance = buildPerformanceIntelligence(aggregated);
  const crossEngine = buildCrossEngine(aggregated);
  const alerts = buildAlerts(aggregated, healthDashboard);
  const scorecards = buildScorecards(aggregated);
  const timeline = buildTimeline(aggregated);
  const executiveReport = buildExecutiveReport(
    aggregated,
    executiveKpis,
    businessHealth,
    crossEngine,
    alerts,
    scorecards,
  );

  return {
    executiveKpis,
    businessHealth,
    growth,
    revenue,
    performance,
    crossEngine,
    alerts,
    scorecards,
    timeline,
    executiveReport,
    healthDashboard,
  };
}

export type ProcessedBusinessEngineData = ReturnType<typeof processBusinessEngineData>;
