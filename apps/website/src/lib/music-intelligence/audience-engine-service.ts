import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';
import {
  collectArtistAudienceEngineData,
  collectPartnerAudienceEngineData,
} from './audience-engine-collector';
import { processAudienceData } from './audience-engine-processor';
import type { AudienceEnginePayload } from './audience-engine-types';

function emptyPayload(scope: 'artist' | 'partner'): AudienceEnginePayload {
  return {
    scope,
    generatedAt: new Date().toISOString(),
    dataSource: 'fallback',
    portfolioSummary: {
      totalAudienceContacts: null,
      activeSessions: null,
      geographicTerritories: 0,
      connectedPlatforms: 0,
      summary: 'No audience data on record.',
    },
    connectors: [],
    globalOverview: { metrics: [], hasLiveData: false, summary: 'Awaiting audience data.' },
    geographic: { countries: [], regions: [], cities: [], topTerritories: [], geographicGrowth: null, summary: 'No geographic data.', hasLiveData: false },
    demographic: { ageGroups: [], gender: [], languages: [], audienceSegments: [], listenerCategories: [], hasLiveData: false, summary: 'Demographic framework ready.' },
    platformDistribution: { entries: [], connectedCount: 0, summary: 'No platform data.' },
    behaviour: { metrics: [], summary: 'Awaiting behaviour data.', hasLiveData: false },
    engagement: { metrics: [], hasLiveData: false, summary: 'Awaiting engagement data.' },
    growth: { periods: [], growthTrend: 'Awaiting data', hasLiveData: false, summary: 'Awaiting growth data.' },
    executiveReport: {
      audienceHealth: 'awaiting_data',
      growthSummary: 'No data.',
      geographicSummary: 'No data.',
      demographicSummary: 'No data.',
      platformSummary: 'No data.',
      engagementSummary: 'No data.',
      recommendations: ['Activate audience capture to begin Audience Intelligence.'],
      summary: 'Audience Intelligence Engine awaiting production data.',
    },
    timeline: [],
    healthDashboard: {
      audienceHealthScore: null,
      growthScore: null,
      engagementScore: null,
      geographicCoverage: null,
      platformCoverage: null,
      intelligenceStatus: 'awaiting_integrations',
      summary: 'Awaiting production audience data.',
    },
  };
}

export async function loadArtistAudienceEngine(
  session: MIWorkspaceSession,
): Promise<AudienceEnginePayload> {
  const collected = await collectArtistAudienceEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');

  const processed = processAudienceData(collected);

  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}

export async function loadPartnerAudienceEngine(
  session: MIPartnerWorkspaceSession,
): Promise<AudienceEnginePayload> {
  const collected = await collectPartnerAudienceEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');

  const processed = processAudienceData(collected);

  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}
