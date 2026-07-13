import {
  collectArtistGlobalData,
  collectPartnerGlobalData,
} from './global-engine-collector';
import { processGlobalData } from './global-engine-processor';
import type { GlobalEnginePayload } from './global-types';
import { INDUSTRY_SEGMENT_DEFINITIONS, REGIONAL_DEFINITIONS } from './global-constants';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

function emptyPayload(scope: 'artist' | 'partner'): GlobalEnginePayload {
  const now = new Date().toISOString();
  return {
    scope,
    generatedAt: now,
    dataSource: 'fallback',
    tenantIsolationEnforced: true,
    executiveDashboard: {
      globalHealthIndex: null,
      federationCoverage: 0,
      benchmarkPosition: null,
      activeAlerts: 0,
      opportunityCount: 0,
      summary: 'Global Executive Dashboard awaiting Enterprise Intelligence federation.',
    },
    regional: {
      regions: REGIONAL_DEFINITIONS.map((def) => ({
        key: def.key,
        label: def.label,
        indexScore: null,
        trend: 'awaiting_data' as const,
        summary: 'Awaiting federated regional intelligence.',
      })),
      hasLiveData: false,
      tenantIsolated: true,
      summary: 'Regional intelligence awaiting federation.',
    },
    industry: {
      segments: INDUSTRY_SEGMENT_DEFINITIONS.map((def) => ({
        key: def.key,
        label: def.label,
        indexScore: null,
        cohortLabel: 'Awaiting Cohort',
        summary: 'Awaiting federated industry intelligence.',
      })),
      hasLiveData: false,
      tenantIsolated: true,
      summary: 'Industry intelligence awaiting federation.',
    },
    performance: {
      metrics: [],
      hasLiveData: false,
      summary: 'Global performance awaiting federation.',
    },
    benchmarks: {
      benchmarks: [],
      hasLiveData: false,
      tenantIsolated: true,
      summary: 'Global benchmarks awaiting federation.',
    },
    health: {
      globalHealthIndex: null,
      federationStrength: 'awaiting_data',
      intelligenceCoverage: 0,
      operationalReadiness: null,
      summary: 'Global health awaiting Enterprise Intelligence.',
    },
    opportunities: {
      opportunities: [],
      hasLiveData: false,
      summary: 'Global opportunities awaiting federation.',
    },
    alerts: [],
    timeline: [],
    globalReport: {
      dashboardSummary: 'Awaiting data.',
      regionalSummary: 'Awaiting data.',
      industrySummary: 'Awaiting data.',
      benchmarkSummary: 'Awaiting data.',
      opportunitySummary: 'Awaiting data.',
      risks: [],
      recommendations: ['Activate Enterprise Intelligence to enable Global Intelligence Network.'],
      summary: 'Global executive report awaiting Enterprise Intelligence federation.',
    },
  };
}

export async function loadArtistGlobalEngine(
  session: MIWorkspaceSession,
): Promise<GlobalEnginePayload> {
  const collected = await collectArtistGlobalData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');
  const processed = processGlobalData(collected);
  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    tenantIsolationEnforced: true,
    ...processed,
  };
}

export async function loadPartnerGlobalEngine(
  session: MIPartnerWorkspaceSession,
): Promise<GlobalEnginePayload> {
  const collected = await collectPartnerGlobalData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');
  const processed = processGlobalData(collected);
  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    tenantIsolationEnforced: true,
    ...processed,
  };
}
