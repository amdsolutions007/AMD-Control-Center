import { loadArtistAiIntelligence, loadPartnerAiIntelligence } from './ai-intelligence-service';
import type { AIIntelligencePayload } from './ai-intelligence-types';
import type { AudienceEnginePayload } from './audience-engine-types';
import { loadArtistAudienceEngine, loadPartnerAudienceEngine } from './audience-engine-service';
import { loadArtistAutomationEngine, loadPartnerAutomationEngine } from './automation-service';
import type { AutomationEnginePayload } from './automation-types';
import { loadArtistBusinessEngine, loadPartnerBusinessEngine } from './business-engine-service';
import type { BusinessEnginePayload } from './business-engine-types';
import { loadArtistEnterpriseEngine, loadPartnerEnterpriseEngine } from './enterprise-service';
import type { EnterpriseEnginePayload } from './enterprise-types';
import { loadArtistGlobalEngine, loadPartnerGlobalEngine } from './global-engine-service';
import type { GlobalEnginePayload } from './global-types';
import { loadArtistIntelligence, loadPartnerIntelligence } from './intelligence-service';
import type { IntelligenceDashboardPayload } from './intelligence-types';
import type { MarketingEnginePayload } from './marketing-engine-types';
import { loadArtistMarketingEngine, loadPartnerMarketingEngine } from './marketing-engine-service';
import type { MusicEnginePayload } from './music-engine-types';
import { loadArtistMusicEngine, loadPartnerMusicEngine } from './music-engine-service';
import type { OSEngineScope } from './os-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { StreamingEnginePayload } from './streaming-engine-types';
import { loadArtistStreamingEngine, loadPartnerStreamingEngine } from './streaming-engine-service';
import type { MIWorkspaceSession } from './workspace-auth';

export interface CollectedOSData {
  scope: OSEngineScope;
  dataAvailable: boolean;
  engines: {
    intelligence: IntelligenceDashboardPayload;
    ai: AIIntelligencePayload;
    music: MusicEnginePayload;
    streaming: StreamingEnginePayload;
    audience: AudienceEnginePayload;
    marketing: MarketingEnginePayload;
    business: BusinessEnginePayload;
    automation: AutomationEnginePayload;
    enterprise: EnterpriseEnginePayload;
    global: GlobalEnginePayload;
  };
  userId: string;
}

export async function collectArtistOSData(session: MIWorkspaceSession): Promise<CollectedOSData> {
  const [
    intelligence,
    ai,
    music,
    streaming,
    audience,
    marketing,
    business,
    automation,
    enterprise,
    global,
  ] = await Promise.all([
    loadArtistIntelligence(session),
    loadArtistAiIntelligence(session),
    loadArtistMusicEngine(session),
    loadArtistStreamingEngine(session),
    loadArtistAudienceEngine(session),
    loadArtistMarketingEngine(session),
    loadArtistBusinessEngine(session),
    loadArtistAutomationEngine(session),
    loadArtistEnterpriseEngine(session),
    loadArtistGlobalEngine(session),
  ]);

  const payloads = [intelligence, ai, music, streaming, audience, marketing, business, automation, enterprise, global];
  const dataAvailable = payloads.some((e) => e.dataSource === 'live');

  return {
    scope: 'artist',
    dataAvailable,
    engines: { intelligence, ai, music, streaming, audience, marketing, business, automation, enterprise, global },
    userId: session.userId,
  };
}

export async function collectPartnerOSData(session: MIPartnerWorkspaceSession): Promise<CollectedOSData> {
  const [
    intelligence,
    ai,
    music,
    streaming,
    audience,
    marketing,
    business,
    automation,
    enterprise,
    global,
  ] = await Promise.all([
    loadPartnerIntelligence(session),
    loadPartnerAiIntelligence(session),
    loadPartnerMusicEngine(session),
    loadPartnerStreamingEngine(session),
    loadPartnerAudienceEngine(session),
    loadPartnerMarketingEngine(session),
    loadPartnerBusinessEngine(session),
    loadPartnerAutomationEngine(session),
    loadPartnerEnterpriseEngine(session),
    loadPartnerGlobalEngine(session),
  ]);

  const payloads = [intelligence, ai, music, streaming, audience, marketing, business, automation, enterprise, global];
  const dataAvailable = payloads.some((e) => e.dataSource === 'live');

  return {
    scope: 'partner',
    dataAvailable,
    engines: { intelligence, ai, music, streaming, audience, marketing, business, automation, enterprise, global },
    userId: session.userId,
  };
}
