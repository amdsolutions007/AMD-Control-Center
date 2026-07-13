import { loadArtistBusinessEngine, loadPartnerBusinessEngine } from './business-engine-service';
import type { BusinessEnginePayload } from './business-engine-types';
import type { AutomationEngineScope } from './automation-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

export interface CollectedAutomationData {
  scope: AutomationEngineScope;
  dataAvailable: boolean;
  business: BusinessEnginePayload;
  userId: string;
}

export async function collectArtistAutomationData(
  session: MIWorkspaceSession,
): Promise<CollectedAutomationData> {
  const business = await loadArtistBusinessEngine(session);
  return {
    scope: 'artist',
    dataAvailable: business.dataSource === 'live',
    business,
    userId: session.userId,
  };
}

export async function collectPartnerAutomationData(
  session: MIPartnerWorkspaceSession,
): Promise<CollectedAutomationData> {
  const business = await loadPartnerBusinessEngine(session);
  return {
    scope: 'partner',
    dataAvailable: business.dataSource === 'live',
    business,
    userId: session.userId,
  };
}
