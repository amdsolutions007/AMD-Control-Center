import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';
import {
  collectArtistStreamingEngineData,
  collectPartnerStreamingEngineData,
} from './streaming-engine-collector';
import {
  processArtistStreamingData,
  processPartnerStreamingData,
} from './streaming-engine-processor';
import type { StreamingEnginePayload } from './streaming-engine-types';

function emptyPayload(scope: 'artist' | 'partner'): StreamingEnginePayload {
  return {
    scope,
    generatedAt: new Date().toISOString(),
    dataSource: 'fallback',
    portfolioSummary: {
      totalSubmissions: 0,
      connectedPlatforms: 0,
      totalRedirectClicks: null,
      platformsWithTelemetry: 0,
      summary: 'No streaming data on record.',
    },
    connectors: [],
    streamingProfile: {
      connectedPlatforms: [],
      pendingPlatforms: [],
      disconnectedPlatforms: [],
      platformIds: {},
      releaseIds: [],
      connectionStatus: 'disconnected',
      lastSynchronization: null,
      synchronizationHealth: 'api_pending',
      totalConnected: 0,
      summary: 'Connect streaming platforms to activate the Streaming Intelligence Engine.',
    },
    metrics: {
      metrics: [],
      hasLivePlatformMetrics: false,
      hasTelemetryData: false,
      summary: 'Awaiting production data.',
    },
    platformComparison: {
      entries: [],
      bestPerformingPlatform: null,
      connectedCount: 0,
      distributionSummary: 'No platform data available.',
    },
    playlistPerformance: [],
    timeline: [],
    executiveReport: {
      bestPerformingPlatform: null,
      platformDistribution: 'No data.',
      streamingHealth: 'awaiting_data',
      connectionHealth: 'none',
      recommendations: ['Submit music with DSP release URLs to begin streaming intelligence.'],
      summary: 'Streaming Intelligence Engine awaiting production data.',
    },
    statusPanel: {
      connectedDsps: [],
      activeConnectors: 0,
      pendingConnections: [],
      synchronizationStatus: 'api_pending',
      apiConnectorsReady: 0,
      summary: 'Connector framework ready. Awaiting platform connections.',
    },
  };
}

export async function loadArtistStreamingEngine(
  session: MIWorkspaceSession,
): Promise<StreamingEnginePayload> {
  const collected = await collectArtistStreamingEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');

  const processed = processArtistStreamingData(collected);

  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}

export async function loadPartnerStreamingEngine(
  session: MIPartnerWorkspaceSession,
): Promise<StreamingEnginePayload> {
  const collected = await collectPartnerStreamingEngineData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');

  const processed = processPartnerStreamingData(collected);

  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}
