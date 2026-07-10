import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';
import { collectArtistIntelligenceData, collectPartnerIntelligenceData } from './ai-intelligence-collector';
import { processArtistIntelligence, processPartnerIntelligence } from './ai-intelligence-processor';
import type { AIIntelligencePayload } from './ai-intelligence-types';

export async function loadArtistAiIntelligence(session: MIWorkspaceSession): Promise<AIIntelligencePayload> {
  const collected = await collectArtistIntelligenceData(session);
  return processArtistIntelligence(collected);
}

export async function loadPartnerAiIntelligence(
  session: MIPartnerWorkspaceSession,
): Promise<AIIntelligencePayload> {
  const collected = await collectPartnerIntelligenceData(session);
  return processPartnerIntelligence(collected);
}
