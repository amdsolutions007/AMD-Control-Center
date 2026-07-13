import { loadArtistAiIntelligence, loadPartnerAiIntelligence } from './ai-intelligence-service';
import type { AIIntelligencePayload } from './ai-intelligence-types';
import type { AudienceEnginePayload } from './audience-engine-types';
import { loadArtistAudienceEngine, loadPartnerAudienceEngine } from './audience-engine-service';
import type { BusinessEngineScope } from './business-engine-types';
import { loadArtistIntelligence, loadPartnerIntelligence } from './intelligence-service';
import type { IntelligenceDashboardPayload } from './intelligence-types';
import type { MarketingEnginePayload } from './marketing-engine-types';
import { loadArtistMarketingEngine, loadPartnerMarketingEngine } from './marketing-engine-service';
import type { MusicEnginePayload } from './music-engine-types';
import { loadArtistMusicEngine, loadPartnerMusicEngine } from './music-engine-service';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { StreamingEnginePayload } from './streaming-engine-types';
import { loadArtistStreamingEngine, loadPartnerStreamingEngine } from './streaming-engine-service';
import type { MIWorkspaceSession } from './workspace-auth';

export interface UpstreamEnginePayloads {
  intelligence: IntelligenceDashboardPayload;
  ai: AIIntelligencePayload;
  music: MusicEnginePayload;
  streaming: StreamingEnginePayload;
  audience: AudienceEnginePayload;
  marketing: MarketingEnginePayload;
}

export interface CollectedBusinessEngineData {
  scope: BusinessEngineScope;
  dataAvailable: boolean;
  engines: UpstreamEnginePayloads;
}

export async function collectArtistBusinessEngineData(
  session: MIWorkspaceSession,
): Promise<CollectedBusinessEngineData> {
  const [intelligence, ai, music, streaming, audience, marketing] = await Promise.all([
    loadArtistIntelligence(session),
    loadArtistAiIntelligence(session),
    loadArtistMusicEngine(session),
    loadArtistStreamingEngine(session),
    loadArtistAudienceEngine(session),
    loadArtistMarketingEngine(session),
  ]);

  const dataAvailable = [
    intelligence,
    ai,
    music,
    streaming,
    audience,
    marketing,
  ].some((e) => e.dataSource === 'live');

  return {
    scope: 'artist',
    dataAvailable,
    engines: { intelligence, ai, music, streaming, audience, marketing },
  };
}

export async function collectPartnerBusinessEngineData(
  session: MIPartnerWorkspaceSession,
): Promise<CollectedBusinessEngineData> {
  const [intelligence, ai, music, streaming, audience, marketing] = await Promise.all([
    loadPartnerIntelligence(session),
    loadPartnerAiIntelligence(session),
    loadPartnerMusicEngine(session),
    loadPartnerStreamingEngine(session),
    loadPartnerAudienceEngine(session),
    loadPartnerMarketingEngine(session),
  ]);

  const dataAvailable = [
    intelligence,
    ai,
    music,
    streaming,
    audience,
    marketing,
  ].some((e) => e.dataSource === 'live');

  return {
    scope: 'partner',
    dataAvailable,
    engines: { intelligence, ai, music, streaming, audience, marketing },
  };
}
