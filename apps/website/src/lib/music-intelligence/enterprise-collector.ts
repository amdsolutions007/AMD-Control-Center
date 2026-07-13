import { loadArtistAutomationEngine, loadPartnerAutomationEngine } from './automation-service';
import type { AutomationEnginePayload } from './automation-types';
import { loadArtistBusinessEngine, loadPartnerBusinessEngine } from './business-engine-service';
import type { BusinessEnginePayload } from './business-engine-types';
import type { EnterpriseEngineScope } from './enterprise-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

export interface CollectedEnterpriseData {
  scope: EnterpriseEngineScope;
  dataAvailable: boolean;
  business: BusinessEnginePayload;
  automation: AutomationEnginePayload;
  userId: string;
}

export async function collectArtistEnterpriseData(
  session: MIWorkspaceSession,
): Promise<CollectedEnterpriseData> {
  const [business, automation] = await Promise.all([
    loadArtistBusinessEngine(session),
    loadArtistAutomationEngine(session),
  ]);
  const dataAvailable = business.dataSource === 'live' || automation.dataSource === 'live';
  return { scope: 'artist', dataAvailable, business, automation, userId: session.userId };
}

export async function collectPartnerEnterpriseData(
  session: MIPartnerWorkspaceSession,
): Promise<CollectedEnterpriseData> {
  const [business, automation] = await Promise.all([
    loadPartnerBusinessEngine(session),
    loadPartnerAutomationEngine(session),
  ]);
  const dataAvailable = business.dataSource === 'live' || automation.dataSource === 'live';
  return { scope: 'partner', dataAvailable, business, automation, userId: session.userId };
}
