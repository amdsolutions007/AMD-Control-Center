import {
  GOVERNANCE_MODULE_DEFINITIONS,
  GOVERNANCE_THRESHOLDS,
  scoreToGovernanceLevel,
} from './enterprise-constants';
import type { CollectedEnterpriseData } from './enterprise-collector';
import type { EnterpriseGovernance, GovernanceModule } from './enterprise-types';

function average(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n != null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

export function buildEnterpriseGovernance(collected: CollectedEnterpriseData): EnterpriseGovernance {
  const { business, automation } = collected;

  const executiveScore = business.healthDashboard.overallExecutiveScore;
  const automationHealth = automation.healthDashboard.automationHealthScore;
  const intelligenceCoverage = business.businessHealth.intelligenceCoverage;
  const pendingApprovals = automation.approvalCenter.pending.length;
  const operationalRisk =
    executiveScore != null && executiveScore < GOVERNANCE_THRESHOLDS.lowHealth ? 30 : 70;

  const modules: GovernanceModule[] = GOVERNANCE_MODULE_DEFINITIONS.map((def) => {
    let score: number | null = null;
    let summary = 'Awaiting enterprise governance data.';

    switch (def.key) {
      case 'policy_status':
        score = intelligenceCoverage;
        summary = `Intelligence policy coverage at ${intelligenceCoverage}%.`;
        break;
      case 'audit_readiness':
        score = automation.automationHistory.totalExecutions > 0 ? 75 : 40;
        summary =
          automation.automationHistory.totalExecutions > 0
            ? 'Automation audit trail active.'
            : 'Audit trail awaiting workflow executions.';
        break;
      case 'compliance_overview':
        score = executiveScore;
        summary = business.executiveReport.operationalHealth;
        break;
      case 'governance_health':
        score = average([executiveScore, automationHealth]);
        summary = 'Composite governance health from Business and Automation Intelligence.';
        break;
      case 'operational_risk':
        score = operationalRisk;
        summary =
          operationalRisk < 50
            ? 'Elevated operational risk detected from executive health signals.'
            : 'Operational risk within acceptable thresholds.';
        break;
      case 'organization_readiness':
        score = business.businessHealth.executiveReadiness;
        summary = business.businessHealth.summary;
        break;
    }

    return {
      key: def.key,
      label: def.label,
      status: scoreToGovernanceLevel(score),
      score,
      summary,
    };
  });

  const governanceHealthScore = average(modules.map((m) => m.score));

  return {
    modules,
    governanceHealthScore,
    summary:
      pendingApprovals > 0
        ? `Governance health ${governanceHealthScore ?? '—'}% · ${pendingApprovals} automation approval(s) pending.`
        : `Governance health ${governanceHealthScore ?? '—'}% · enterprise operating layer active.`,
  };
}
