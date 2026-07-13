import { aggregateBusinessEngineData } from './business-engine-aggregator';
import {
  collectArtistBusinessEngineData,
  collectPartnerBusinessEngineData,
} from './business-engine-collector';
import { processBusinessEngineData } from './business-engine-processor';
import type { BusinessEnginePayload } from './business-engine-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

function emptyPayload(scope: 'artist' | 'partner'): BusinessEnginePayload {
  const now = new Date().toISOString();
  return {
    scope,
    generatedAt: now,
    dataSource: 'fallback',
    executiveKpis: {
      metrics: [],
      executiveScore: null,
      hasLiveData: false,
      summary: 'Executive KPI dashboard awaiting production data.',
    },
    businessHealth: {
      overallHealth: 'awaiting_data',
      growthScore: null,
      operationalHealth: 'awaiting_data',
      platformStability: 'awaiting_data',
      intelligenceCoverage: 0,
      executiveReadiness: null,
      summary: 'Business health intelligence awaiting engine data.',
    },
    growth: {
      periods: [],
      growthTrend: 'unknown',
      hasLiveData: false,
      summary: 'Growth intelligence awaiting historical data.',
    },
    revenue: {
      connectors: [],
      metrics: [],
      hasLiveData: false,
      summary: 'Revenue framework awaiting financial API integration.',
    },
    performance: {
      domains: [],
      hasLiveData: false,
      summary: 'Performance intelligence awaiting engine data.',
    },
    crossEngine: {
      unifiedSummary: 'Business Intelligence Engine awaiting upstream engine data.',
      engineStatuses: [],
      topRecommendations: ['Complete profile and submit music to activate intelligence engines.'],
      enginesWithLiveData: 0,
      totalEngines: 6,
    },
    alerts: [],
    scorecards: {
      scorecards: [],
      overallScore: null,
      summary: 'Executive scorecards awaiting production data.',
    },
    timeline: [],
    executiveReport: {
      businessStatus: 'Awaiting data.',
      operationalHealth: 'Awaiting data.',
      executiveKpiSummary: 'Awaiting data.',
      intelligenceSummary: '0/6 engines live.',
      businessRisks: [],
      growthOpportunities: ['Activate intelligence engines with production data.'],
      recommendations: ['Complete profile setup and music submissions.'],
      summary: 'Executive business report awaiting production data.',
    },
    healthDashboard: {
      executiveHealthScore: null,
      businessGrowthScore: null,
      revenueReadiness: 0,
      platformHealthScore: null,
      overallExecutiveScore: null,
      summary: 'Executive health dashboard awaiting production data.',
    },
  };
}

export async function loadArtistBusinessEngine(
  session: MIWorkspaceSession,
): Promise<BusinessEnginePayload> {
  const collected = await collectArtistBusinessEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');
  const aggregated = aggregateBusinessEngineData(collected);
  const processed = processBusinessEngineData(aggregated);
  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}

export async function loadPartnerBusinessEngine(
  session: MIPartnerWorkspaceSession,
): Promise<BusinessEnginePayload> {
  const collected = await collectPartnerBusinessEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');
  const aggregated = aggregateBusinessEngineData(collected);
  const processed = processBusinessEngineData(aggregated);
  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}
