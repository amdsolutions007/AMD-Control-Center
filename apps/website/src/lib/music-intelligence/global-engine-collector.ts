import { loadArtistEnterpriseEngine, loadPartnerEnterpriseEngine } from './enterprise-service';
import type { EnterpriseEnginePayload } from './enterprise-types';
import type { GlobalEngineScope } from './global-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

export interface CollectedGlobalData {
  scope: GlobalEngineScope;
  dataAvailable: boolean;
  enterprise: EnterpriseEnginePayload;
  userId: string;
}

export async function collectArtistGlobalData(session: MIWorkspaceSession): Promise<CollectedGlobalData> {
  const enterprise = await loadArtistEnterpriseEngine(session);
  const dataAvailable = enterprise.dataSource === 'live';
  return { scope: 'artist', dataAvailable, enterprise, userId: session.userId };
}

export async function collectPartnerGlobalData(
  session: MIPartnerWorkspaceSession,
): Promise<CollectedGlobalData> {
  const enterprise = await loadPartnerEnterpriseEngine(session);
  const dataAvailable = enterprise.dataSource === 'live';
  return { scope: 'partner', dataAvailable, enterprise, userId: session.userId };
}
