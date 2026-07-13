import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';
import {
  collectArtistMarketingEngineData,
  collectPartnerMarketingEngineData,
} from './marketing-engine-collector';
import { processMarketingData } from './marketing-engine-processor';
import type { MarketingEnginePayload } from './marketing-engine-types';

function emptyPayload(scope: 'artist' | 'partner'): MarketingEnginePayload {
  return {
    scope,
    generatedAt: new Date().toISOString(),
    dataSource: 'fallback',
    portfolioSummary: {
      totalCampaigns: 0,
      totalClicks: null,
      totalConversions: null,
      connectedPlatforms: 0,
      summary: 'No marketing data on record.',
    },
    connectors: [],
    campaigns: { campaigns: [], totalCampaigns: 0, activeCampaigns: 0, summary: 'Awaiting data.', hasLiveData: false },
    performance: { metrics: [], hasLiveData: false, summary: 'Awaiting data.' },
    conversion: { funnel: [], conversionRate: null, hasLiveData: false, summary: 'Awaiting data.' },
    roi: { metrics: [], hasLiveData: false, summary: 'Awaiting API connectors.' },
    acquisition: { sources: [], newUsers: null, returningUsers: null, organicGrowth: null, paidGrowth: null, hasLiveData: false, summary: 'Awaiting data.' },
    geographic: { entries: [], topTerritory: null, hasLiveData: false, summary: 'Awaiting data.' },
    platformComparison: { entries: [], bestPerformingPlatform: null, highestRoi: null, lowestCpc: null, highestConversion: null, summary: 'Awaiting data.' },
    executiveReport: {
      campaignHealth: 'awaiting_data',
      budgetUtilization: 'Awaiting API.',
      marketingPerformance: 'No data.',
      roiSummary: 'Awaiting API.',
      conversionSummary: 'No data.',
      recommendations: ['Tag campaigns with UTM parameters to activate Marketing Intelligence.'],
      summary: 'Marketing Intelligence Engine awaiting production data.',
    },
    timeline: [],
    healthDashboard: {
      marketingHealthScore: null,
      campaignScore: null,
      roiScore: null,
      conversionScore: null,
      platformCoverage: null,
      attributionStatus: 'awaiting_integrations',
      summary: 'Awaiting production marketing data.',
    },
  };
}

export async function loadArtistMarketingEngine(
  session: MIWorkspaceSession,
): Promise<MarketingEnginePayload> {
  const collected = await collectArtistMarketingEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');
  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processMarketingData(collected),
  };
}

export async function loadPartnerMarketingEngine(
  session: MIPartnerWorkspaceSession,
): Promise<MarketingEnginePayload> {
  const collected = await collectPartnerMarketingEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');
  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processMarketingData(collected),
  };
}
