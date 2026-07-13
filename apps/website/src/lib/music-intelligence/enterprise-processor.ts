import { buildEnterpriseApiConnectors } from './enterprise-connectors';
import {
  ADMINISTRATION_ENTITY_TYPES,
  RBAC_ROLE_DEFINITIONS,
} from './enterprise-constants';
import type { CollectedEnterpriseData } from './enterprise-collector';
import { buildEnterpriseGovernance } from './enterprise-governance-engine';
import type {
  EnterpriseAdministration,
  EnterpriseAnalytics,
  EnterpriseApiFramework,
  EnterpriseCommandCenter,
  EnterpriseEnginePayload,
  EnterpriseHealthDashboard,
  EnterpriseReport,
  EnterpriseRbac,
  EnterpriseTimelineEvent,
  OrganizationIntelligence,
} from './enterprise-types';

function kpiValue(
  collected: CollectedEnterpriseData,
  key: string,
): number | string | null {
  const m = collected.business.executiveKpis.metrics.find((x) => x.key === key);
  if (!m || !m.available) return null;
  return m.value;
}

function buildCommandCenter(collected: CollectedEnterpriseData): EnterpriseCommandCenter {
  const { business, automation } = collected;
  return {
    executiveScore: business.healthDashboard.overallExecutiveScore,
    automationHealth: automation.healthDashboard.automationHealthScore,
    intelligenceCoverage: business.businessHealth.intelligenceCoverage,
    pendingApprovals: automation.approvalCenter.pending.length,
    activeWorkflows: automation.workflowAutomation.activeWorkflows,
    organizationCount: kpiValue(collected, 'total_organizations') as number | null,
    summary: `Enterprise Command Center · ${business.crossEngine.enginesWithLiveData}/6 intelligence engines · ${automation.workflowAutomation.activeWorkflows} active workflow(s).`,
  };
}

function buildOrganizationIntelligence(collected: CollectedEnterpriseData): OrganizationIntelligence {
  const { scope, business } = collected;
  const metrics = [
    {
      key: 'total_organizations',
      label: 'Organizations',
      value: kpiValue(collected, 'total_organizations'),
      available: scope === 'partner',
      emptyStateMessage: 'Organization metrics available in partner enterprise view.',
    },
    {
      key: 'total_partners',
      label: 'Partners',
      value: kpiValue(collected, 'total_partners'),
      available: scope === 'partner',
      emptyStateMessage: 'Partner roster metrics available in partner view.',
    },
    {
      key: 'total_artists',
      label: 'Artists',
      value: kpiValue(collected, 'total_artists'),
      available: scope === 'partner',
      emptyStateMessage: 'Artist roster metrics available in partner view.',
    },
    {
      key: 'total_submissions',
      label: 'Submissions',
      value: kpiValue(collected, 'total_submissions'),
      available: true,
      emptyStateMessage: 'Awaiting submission data.',
    },
  ];

  const hasLiveData = metrics.some((m) => m.available && m.value != null);

  return {
    metrics,
    hasLiveData,
    summary: hasLiveData
      ? 'Organization intelligence aggregated from Business Intelligence KPIs.'
      : 'Organization intelligence awaiting enterprise production data.',
  };
}

function buildAdministration(collected: CollectedEnterpriseData): EnterpriseAdministration {
  const { scope, business, automation } = collected;

  const orgCount = scope === 'partner' ? (kpiValue(collected, 'total_organizations') as number | null) : null;
  const artistCount = scope === 'partner' ? (kpiValue(collected, 'total_artists') as number | null) : 1;
  const partnerCount = scope === 'partner' ? (kpiValue(collected, 'total_partners') as number | null) : null;

  const entities = ADMINISTRATION_ENTITY_TYPES.map((def) => {
    let count: number | null = null;
    let status = 'awaiting_data';
    let summary = 'Enterprise administration framework ready.';

    switch (def.type) {
      case 'organization':
        count = orgCount;
        status = orgCount != null ? 'active' : 'awaiting_data';
        summary = orgCount != null ? `${orgCount} organization(s) on record.` : 'Awaiting organization registry.';
        break;
      case 'department':
        count = scope === 'partner' ? null : null;
        status = 'framework_ready';
        summary = 'Department structure framework ready. Awaiting enterprise registry integration.';
        break;
      case 'team':
        count = scope === 'partner' ? artistCount : null;
        status = artistCount != null ? 'active' : 'framework_ready';
        summary = artistCount != null ? `Team roster derived from ${artistCount} artist context(s).` : 'Team framework ready.';
        break;
      case 'member':
        count = artistCount;
        status = 'active';
        summary = 'Member context from authenticated workspace session.';
        break;
      case 'invitation':
        count = automation.approvalCenter.pending.length;
        status = count > 0 ? 'pending' : 'clear';
        summary = count > 0 ? `${count} pending enterprise action(s).` : 'No pending invitations.';
        break;
      case 'enterprise_account':
        count = partnerCount ?? (scope === 'artist' ? 1 : null);
        status = 'active';
        summary = 'Enterprise account context from authenticated session.';
        break;
    }

    return {
      id: `admin-${def.type}`,
      type: def.type,
      label: def.label,
      count,
      status,
      summary,
    };
  });

  return {
    entities,
    delegatedAdminEnabled: scope === 'partner',
    summary:
      scope === 'partner'
        ? 'Enterprise administration active for partner organization context.'
        : 'Artist enterprise administration · delegated structures available upon partner linkage.',
  };
}

function buildRbac(collected: CollectedEnterpriseData): EnterpriseRbac {
  const { scope } = collected;
  const roles = RBAC_ROLE_DEFINITIONS.map((def) => ({
    key: def.key,
    label: def.label,
    scope: def.scope,
    permissions: def.permissions,
    active:
      (scope === 'artist' && def.scope === 'artist') ||
      (scope === 'partner' && (def.scope === 'partner' || def.scope === 'delegated')) ||
      def.scope === 'enterprise',
  }));

  return {
    roles,
    currentScope: scope,
    sessionProtected: true,
    summary: `Enterprise RBAC active · ${scope} workspace scope · session-gated APIs enforced.`,
  };
}

function buildAnalytics(collected: CollectedEnterpriseData): EnterpriseAnalytics {
  const { business, automation } = collected;
  const items = [
    { key: 'executive_score', label: 'Executive Score', value: business.healthDashboard.overallExecutiveScore, source: 'business' as const },
    { key: 'automation_health', label: 'Automation Health', value: automation.healthDashboard.automationHealthScore, source: 'automation' as const },
    { key: 'matched_rules', label: 'Matched Rules', value: automation.rulesEngine.matchedRules, source: 'automation' as const },
    { key: 'intelligence_coverage', label: 'Intelligence Coverage', value: `${business.businessHealth.intelligenceCoverage}%`, source: 'business' as const },
    { key: 'pending_approvals', label: 'Pending Approvals', value: automation.approvalCenter.pending.length, source: 'composite' as const },
    { key: 'governance_health', label: 'Governance Health', value: buildEnterpriseGovernance(collected).governanceHealthScore, source: 'composite' as const },
  ];

  return {
    items,
    hasLiveData: business.dataSource === 'live' || automation.dataSource === 'live',
    summary: 'Enterprise analytics orchestrated from Business and Automation Intelligence outputs.',
  };
}

function buildHealthDashboard(
  collected: CollectedEnterpriseData,
  governance: ReturnType<typeof buildEnterpriseGovernance>,
): EnterpriseHealthDashboard {
  const { business, automation } = collected;
  const businessScore = business.healthDashboard.overallExecutiveScore;
  const automationScore = automation.healthDashboard.automationHealthScore;
  const governanceScore = governance.governanceHealthScore;
  const operationalReadiness = business.businessHealth.executiveReadiness;

  const scores = [businessScore, automationScore, governanceScore, operationalReadiness].filter(
    (s): s is number => s != null,
  );
  const enterpriseHealthScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return {
    enterpriseHealthScore,
    governanceScore,
    automationScore,
    businessScore,
    operationalReadiness,
    summary:
      enterpriseHealthScore != null
        ? `Enterprise health ${enterpriseHealthScore}% · operating layer orchestrating BI + Automation Intelligence.`
        : 'Enterprise health dashboard awaiting intelligence data.',
  };
}

function buildTimeline(collected: CollectedEnterpriseData): EnterpriseTimelineEvent[] {
  const events: EnterpriseTimelineEvent[] = [];

  for (const e of collected.business.timeline.slice(0, 15)) {
    events.push({
      id: `ent-biz-${e.id}`,
      source: 'business',
      type: e.type,
      label: e.label,
      timestamp: e.timestamp,
      detail: e.detail,
    });
  }

  for (const e of collected.automation.timeline.slice(0, 15)) {
    events.push({
      id: `ent-auto-${e.id}`,
      source: 'automation',
      type: e.type,
      label: e.label,
      timestamp: e.timestamp,
      detail: e.detail,
    });
  }

  events.push({
    id: 'ent-layer-active',
    source: 'enterprise',
    type: 'enterprise_layer_active',
    label: 'Enterprise Operating Layer evaluated',
    timestamp: collected.business.generatedAt,
    detail: 'Enterprise Intelligence orchestration complete.',
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 25);
}

function buildEnterpriseReport(
  collected: CollectedEnterpriseData,
  commandCenter: EnterpriseCommandCenter,
  governance: ReturnType<typeof buildEnterpriseGovernance>,
  administration: EnterpriseAdministration,
  analytics: EnterpriseAnalytics,
  health: EnterpriseHealthDashboard,
): EnterpriseReport {
  const risks = [
    ...collected.business.executiveReport.businessRisks.slice(0, 3),
    ...collected.automation.executiveReport.risks.slice(0, 2),
  ].filter(Boolean);

  const recommendations = [
    ...collected.business.executiveReport.recommendations.slice(0, 3),
    ...collected.automation.executiveReport.recommendations.slice(0, 3),
  ];

  return {
    commandCenterSummary: commandCenter.summary,
    governanceSummary: governance.summary,
    administrationSummary: administration.summary,
    analyticsSummary: analytics.summary,
    risks: risks.length > 0 ? [...new Set(risks)] : ['No critical enterprise risks detected.'],
    recommendations: recommendations.length > 0 ? [...new Set(recommendations)] : ['Enterprise operating layer standby.'],
    summary:
      health.enterpriseHealthScore != null
        ? `Enterprise report · health ${health.enterpriseHealthScore}% · ${collected.scope} scope.`
        : 'Enterprise report awaiting Business and Automation Intelligence data.',
  };
}

function buildApiFramework(scope: 'artist' | 'partner'): EnterpriseApiFramework {
  const route =
    scope === 'artist'
      ? '/api/music-intelligence/workspace/enterprise-engine'
      : '/api/music-intelligence/partner/enterprise-engine';

  return {
    connectors: buildEnterpriseApiConnectors(),
    protectedRoutes: [route],
    summary: `Enterprise API framework · protected route ${route} active.`,
  };
}

export function processEnterpriseData(collected: CollectedEnterpriseData): Omit<EnterpriseEnginePayload, 'scope' | 'generatedAt' | 'dataSource'> {
  const governance = buildEnterpriseGovernance(collected);
  const commandCenter = buildCommandCenter(collected);
  const organization = buildOrganizationIntelligence(collected);
  const administration = buildAdministration(collected);
  const rbac = buildRbac(collected);
  const analytics = buildAnalytics(collected);
  const healthDashboard = buildHealthDashboard(collected, governance);
  const timeline = buildTimeline(collected);
  const enterpriseReport = buildEnterpriseReport(
    collected,
    commandCenter,
    governance,
    administration,
    analytics,
    healthDashboard,
  );
  const apiFramework = buildApiFramework(collected.scope);

  return {
    commandCenter,
    organization,
    administration,
    governance,
    rbac,
    analytics,
    healthDashboard,
    timeline,
    enterpriseReport,
    apiFramework,
  };
}
