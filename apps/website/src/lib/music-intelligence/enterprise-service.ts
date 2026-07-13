import {
  collectArtistEnterpriseData,
  collectPartnerEnterpriseData,
} from './enterprise-collector';
import { processEnterpriseData } from './enterprise-processor';
import type { EnterpriseEnginePayload } from './enterprise-types';
import type { MIPartnerWorkspaceSession } from './partner-auth';
import type { MIWorkspaceSession } from './workspace-auth';

function emptyPayload(scope: 'artist' | 'partner'): EnterpriseEnginePayload {
  const now = new Date().toISOString();
  return {
    scope,
    generatedAt: now,
    dataSource: 'fallback',
    commandCenter: {
      executiveScore: null,
      automationHealth: null,
      intelligenceCoverage: 0,
      pendingApprovals: 0,
      activeWorkflows: 0,
      organizationCount: null,
      summary: 'Enterprise Command Center awaiting intelligence data.',
    },
    organization: { metrics: [], hasLiveData: false, summary: 'Awaiting organization data.' },
    administration: { entities: [], delegatedAdminEnabled: false, summary: 'Awaiting administration data.' },
    governance: { modules: [], governanceHealthScore: null, summary: 'Awaiting governance data.' },
    rbac: { roles: [], currentScope: scope, sessionProtected: true, summary: 'RBAC active · awaiting enterprise context.' },
    analytics: { items: [], hasLiveData: false, summary: 'Awaiting analytics data.' },
    healthDashboard: {
      enterpriseHealthScore: null,
      governanceScore: null,
      automationScore: null,
      businessScore: null,
      operationalReadiness: null,
      summary: 'Awaiting enterprise health data.',
    },
    timeline: [],
    enterpriseReport: {
      commandCenterSummary: 'Awaiting data.',
      governanceSummary: 'Awaiting data.',
      administrationSummary: 'Awaiting data.',
      analyticsSummary: 'Awaiting data.',
      risks: [],
      recommendations: ['Activate Business and Automation Intelligence to enable Enterprise layer.'],
      summary: 'Enterprise report awaiting intelligence data.',
    },
    apiFramework: { connectors: [], protectedRoutes: [], summary: 'Enterprise API framework ready.' },
  };
}

export async function loadArtistEnterpriseEngine(
  session: MIWorkspaceSession,
): Promise<EnterpriseEnginePayload> {
  const collected = await collectArtistEnterpriseData(session);
  if (!collected.dataAvailable) return emptyPayload('artist');
  const processed = processEnterpriseData(collected);
  return {
    scope: 'artist',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}

export async function loadPartnerEnterpriseEngine(
  session: MIPartnerWorkspaceSession,
): Promise<EnterpriseEnginePayload> {
  const collected = await collectPartnerEnterpriseData(session);
  if (!collected.dataAvailable) return emptyPayload('partner');
  const processed = processEnterpriseData(collected);
  return {
    scope: 'partner',
    generatedAt: new Date().toISOString(),
    dataSource: 'live',
    ...processed,
  };
}
