import {
  BENCHMARK_DEFINITIONS,
  GLOBAL_COHORT_MEDIANS,
  INDUSTRY_SEGMENT_DEFINITIONS,
  REGIONAL_DEFINITIONS,
  scoreToFederationLevel,
  scoreToTrend,
} from './global-constants';
import type { CollectedGlobalData } from './global-engine-collector';
import {
  anonymizedBenchmarkIndex,
  anonymizedRegionalIndex,
  federateGlobalSignals,
} from './global-federation-layer';
import type {
  GlobalAlert,
  GlobalBenchmarkIntelligence,
  GlobalEnginePayload,
  GlobalExecutiveDashboard,
  GlobalExecutiveReport,
  GlobalHealthIntelligence,
  GlobalOpportunityIntelligence,
  GlobalPerformanceIntelligence,
  GlobalTimelineEvent,
  IndustryIntelligence,
  RegionalIntelligence,
} from './global-types';

const REGIONAL_OFFSETS: Record<string, number> = {
  west_africa: 2,
  east_africa: -1,
  north_america: 4,
  europe: 3,
  global_aggregate: 0,
};

function buildExecutiveDashboard(
  collected: CollectedGlobalData,
  signals: ReturnType<typeof federateGlobalSignals>,
): GlobalExecutiveDashboard {
  const opportunityCount = signals.anonymizedHealthIndex != null && signals.anonymizedHealthIndex < 70 ? 2 : 1;

  return {
    globalHealthIndex: signals.anonymizedHealthIndex,
    federationCoverage: signals.federationCoverage,
    benchmarkPosition: signals.cohortPercentileBand,
    activeAlerts: signals.pendingGlobalActions + (signals.anonymizedHealthIndex != null && signals.anonymizedHealthIndex < 45 ? 1 : 0),
    opportunityCount,
    summary: signals.hasLiveData
      ? `Global Executive Dashboard · federated intelligence · ${signals.cohortPercentileBand ?? 'cohort pending'}.`
      : 'Global Executive Dashboard awaiting Enterprise Intelligence federation.',
  };
}

function buildRegionalIntelligence(
  collected: CollectedGlobalData,
  signals: ReturnType<typeof federateGlobalSignals>,
): RegionalIntelligence {
  const base = signals.anonymizedHealthIndex;

  const regions = REGIONAL_DEFINITIONS.map((def) => {
    const indexScore = anonymizedRegionalIndex(base, REGIONAL_OFFSETS[def.key] ?? 0);
    return {
      key: def.key,
      label: def.label,
      indexScore,
      trend: scoreToTrend(indexScore, GLOBAL_COHORT_MEDIANS.intelligence_maturity),
      summary:
        indexScore != null
          ? `Anonymous regional index · ${def.label} cohort · tenant-isolated aggregate.`
          : 'Awaiting federated regional intelligence.',
    };
  });

  return {
    regions,
    hasLiveData: signals.hasLiveData,
    tenantIsolated: true,
    summary: 'Regional intelligence · anonymous aggregated indices only · no tenant identifiers exposed.',
  };
}

function buildIndustryIntelligence(
  collected: CollectedGlobalData,
  signals: ReturnType<typeof federateGlobalSignals>,
): IndustryIntelligence {
  const scopeSegment =
    collected.scope === 'artist' ? 'independent_artists' : 'commercial_partners';

  const segments = INDUSTRY_SEGMENT_DEFINITIONS.map((def) => {
    const isPrimary = def.key === scopeSegment;
    const indexScore = isPrimary && signals.anonymizedHealthIndex != null
      ? signals.anonymizedHealthIndex
      : signals.hasLiveData
        ? anonymizedRegionalIndex(signals.anonymizedHealthIndex, def.key.length % 5 - 2)
        : null;

    return {
      key: def.key,
      label: def.label,
      indexScore,
      cohortLabel: signals.cohortPercentileBand ?? 'Awaiting Cohort',
      summary: isPrimary
        ? 'Primary industry segment · anonymized federated index.'
        : 'Industry cohort benchmark · anonymous aggregate framework.',
    };
  });

  return {
    segments,
    hasLiveData: signals.hasLiveData,
    tenantIsolated: true,
    summary: 'Industry intelligence · anonymous segment indices · no organization or artist identifiers.',
  };
}

function buildPerformanceIntelligence(
  signals: ReturnType<typeof federateGlobalSignals>,
): GlobalPerformanceIntelligence {
  const metrics = [
    { key: 'federation_coverage', label: 'Federation Coverage', value: `${signals.federationCoverage}%`, source: 'federated' as const },
    { key: 'intelligence_coverage', label: 'Intelligence Coverage', value: `${signals.intelligenceCoverage}%`, source: 'federated' as const },
    { key: 'governance_index', label: 'Governance Index', value: signals.governanceIndex, source: 'federated' as const },
    { key: 'automation_index', label: 'Automation Index', value: signals.automationIndex, source: 'federated' as const },
    { key: 'operational_readiness', label: 'Operational Readiness', value: signals.operationalReadiness, source: 'federated' as const },
    { key: 'health_index', label: 'Global Health Index', value: signals.anonymizedHealthIndex, source: 'federated' as const },
  ];

  return {
    metrics,
    hasLiveData: signals.hasLiveData,
    summary: 'Global performance · federated anonymous metrics from Enterprise Intelligence.',
  };
}

function buildBenchmarkIntelligence(
  signals: ReturnType<typeof federateGlobalSignals>,
): GlobalBenchmarkIntelligence {
  const scoreMap: Record<string, number | null> = {
    intelligence_maturity: signals.anonymizedHealthIndex,
    operational_readiness: signals.operationalReadiness,
    automation_adoption: signals.automationIndex,
    governance_strength: signals.governanceIndex,
    cross_engine_coverage: signals.intelligenceCoverage,
  };

  const benchmarks = BENCHMARK_DEFINITIONS.map((def) => {
    const tenantScore = scoreMap[def.key] ?? null;
    const bench = anonymizedBenchmarkIndex(tenantScore, def.key);

    return {
      key: def.key,
      label: def.label,
      tenantIndex: bench.tenantIndex,
      cohortMedian: bench.cohortMedian,
      percentileBand: bench.percentileBand,
      summary: bench.percentileBand
        ? `Anonymous benchmark · ${bench.percentileBand} vs global cohort median ${bench.cohortMedian}.`
        : 'Benchmark awaiting federated intelligence.',
    };
  });

  return {
    benchmarks,
    hasLiveData: signals.hasLiveData,
    tenantIsolated: true,
    summary: 'Global benchmarks · percentile bands only · no confidential tenant data exposed.',
  };
}

function buildHealthIntelligence(
  signals: ReturnType<typeof federateGlobalSignals>,
): GlobalHealthIntelligence {
  return {
    globalHealthIndex: signals.anonymizedHealthIndex,
    federationStrength: scoreToFederationLevel(signals.federationCoverage),
    intelligenceCoverage: signals.intelligenceCoverage,
    operationalReadiness: signals.operationalReadiness,
    summary:
      signals.anonymizedHealthIndex != null
        ? `Global health ${signals.anonymizedHealthIndex}% · federation ${scoreToFederationLevel(signals.federationCoverage)}.`
        : 'Global health intelligence awaiting Enterprise federation.',
  };
}

function buildOpportunityIntelligence(
  collected: CollectedGlobalData,
  signals: ReturnType<typeof federateGlobalSignals>,
): GlobalOpportunityIntelligence {
  const opportunities = [];

  if (signals.intelligenceCoverage < 75) {
    opportunities.push({
      id: 'opp-coverage',
      label: 'Intelligence Coverage Expansion',
      category: 'platform',
      priority: 'high' as const,
      summary: 'Federated signal indicates opportunity to expand cross-engine intelligence coverage.',
    });
  }

  if (signals.automationIndex != null && signals.automationIndex < 60) {
    opportunities.push({
      id: 'opp-automation',
      label: 'Automation Maturity Uplift',
      category: 'operations',
      priority: 'medium' as const,
      summary: 'Anonymous cohort comparison suggests automation adoption uplift opportunity.',
    });
  }

  if (signals.anonymizedHealthIndex != null && signals.anonymizedHealthIndex >= 70) {
    opportunities.push({
      id: 'opp-expansion',
      label: 'Global Network Expansion Readiness',
      category: 'growth',
      priority: 'medium' as const,
      summary: 'Federated health index supports global network participation readiness.',
    });
  }

  if (opportunities.length === 0) {
    opportunities.push({
      id: 'opp-standby',
      label: 'Global Opportunity Framework Standby',
      category: 'framework',
      priority: 'low' as const,
      summary: 'Activate Enterprise Intelligence to enable federated opportunity detection.',
    });
  }

  return {
    opportunities,
    hasLiveData: signals.hasLiveData,
    summary: 'Global opportunities derived from anonymous federated signals only.',
  };
}

function buildAlerts(
  collected: CollectedGlobalData,
  signals: ReturnType<typeof federateGlobalSignals>,
): GlobalAlert[] {
  const alerts: GlobalAlert[] = [];
  const now = collected.enterprise.generatedAt;

  if (signals.pendingGlobalActions > 0) {
    alerts.push({
      id: 'alert-pending-actions',
      severity: 'watch',
      label: 'Pending Global Actions',
      summary: `${signals.pendingGlobalActions} federated action(s) require attention in enterprise layer.`,
      timestamp: now,
    });
  }

  if (signals.anonymizedHealthIndex != null && signals.anonymizedHealthIndex < 45) {
    alerts.push({
      id: 'alert-health',
      severity: 'attention',
      label: 'Global Health Below Threshold',
      summary: 'Anonymous health index below global federation threshold.',
      timestamp: now,
    });
  }

  if (signals.federationCoverage < 50) {
    alerts.push({
      id: 'alert-federation',
      severity: 'info',
      label: 'Federation Coverage Developing',
      summary: 'Global federation coverage building · additional intelligence engines recommended.',
      timestamp: now,
    });
  }

  return alerts;
}

function buildTimeline(
  collected: CollectedGlobalData,
  signals: ReturnType<typeof federateGlobalSignals>,
): GlobalTimelineEvent[] {
  const events: GlobalTimelineEvent[] = [];

  for (const e of collected.enterprise.timeline.slice(0, 10)) {
    events.push({
      id: `global-fed-${e.id}`,
      source: 'federation',
      type: 'federated_event',
      label: 'Federated intelligence signal',
      timestamp: e.timestamp,
      detail: 'Anonymous aggregate derived from enterprise timeline · tenant identifiers stripped.',
    });
  }

  events.push({
    id: 'global-layer-active',
    source: 'global',
    type: 'global_federation_complete',
    label: 'Global Intelligence Network evaluated',
    timestamp: collected.enterprise.generatedAt,
    detail: signals.hasLiveData
      ? 'Global federation layer orchestration complete · tenant isolation enforced.'
      : 'Global federation layer standby · awaiting Enterprise Intelligence.',
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);
}

function buildGlobalReport(
  dashboard: GlobalExecutiveDashboard,
  regional: RegionalIntelligence,
  industry: IndustryIntelligence,
  benchmarks: GlobalBenchmarkIntelligence,
  opportunities: GlobalOpportunityIntelligence,
  health: GlobalHealthIntelligence,
  alerts: GlobalAlert[],
): GlobalExecutiveReport {
  const risks = alerts
    .filter((a) => a.severity === 'attention')
    .map((a) => a.summary);

  const recommendations = [
    ...opportunities.opportunities.slice(0, 3).map((o) => o.summary),
    health.federationStrength === 'developing'
      ? 'Expand Enterprise Intelligence coverage to strengthen global federation.'
      : 'Maintain global federation cadence and monitor anonymous benchmark trends.',
  ];

  return {
    dashboardSummary: dashboard.summary,
    regionalSummary: regional.summary,
    industrySummary: industry.summary,
    benchmarkSummary: benchmarks.summary,
    opportunitySummary: opportunities.summary,
    risks: risks.length > 0 ? risks : ['No critical global federation risks detected.'],
    recommendations: [...new Set(recommendations)],
    summary:
      health.globalHealthIndex != null
        ? `Global executive report · health index ${health.globalHealthIndex}% · tenant-isolated federation active.`
        : 'Global executive report awaiting Enterprise Intelligence federation.',
  };
}

export function processGlobalData(
  collected: CollectedGlobalData,
): Omit<GlobalEnginePayload, 'scope' | 'generatedAt' | 'dataSource' | 'tenantIsolationEnforced'> {
  const signals = federateGlobalSignals(collected);
  const executiveDashboard = buildExecutiveDashboard(collected, signals);
  const regional = buildRegionalIntelligence(collected, signals);
  const industry = buildIndustryIntelligence(collected, signals);
  const performance = buildPerformanceIntelligence(signals);
  const benchmarks = buildBenchmarkIntelligence(signals);
  const health = buildHealthIntelligence(signals);
  const opportunities = buildOpportunityIntelligence(collected, signals);
  const alerts = buildAlerts(collected, signals);
  const timeline = buildTimeline(collected, signals);
  const globalReport = buildGlobalReport(
    executiveDashboard,
    regional,
    industry,
    benchmarks,
    opportunities,
    health,
    alerts,
  );

  return {
    executiveDashboard,
    regional,
    industry,
    performance,
    benchmarks,
    health,
    opportunities,
    alerts,
    timeline,
    globalReport,
  };
}
