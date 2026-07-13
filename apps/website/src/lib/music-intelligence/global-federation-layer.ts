import {
  GLOBAL_COHORT_MEDIANS,
  scoreToPercentileBand,
} from './global-constants';
import type { CollectedGlobalData } from './global-engine-collector';
import type { FederatedGlobalSignals } from './global-types';

/**
 * Global Federation Layer — anonymizes Enterprise Intelligence outputs.
 * Tenant Isolation Law: no org names, financials, private artist/campaign data, or internal enterprise metrics.
 */
export function federateGlobalSignals(collected: CollectedGlobalData): FederatedGlobalSignals {
  const { enterprise } = collected;

  const anonymizedHealthIndex = enterprise.healthDashboard.enterpriseHealthScore;
  const intelligenceCoverage = enterprise.commandCenter.intelligenceCoverage;
  const operationalReadiness = enterprise.healthDashboard.operationalReadiness;
  const governanceIndex = enterprise.governance.governanceHealthScore;
  const automationIndex = enterprise.healthDashboard.automationScore;

  const federationCoverage = Math.min(
    100,
    Math.round(
      (intelligenceCoverage +
        (anonymizedHealthIndex ?? 0) +
        (governanceIndex ?? 0) +
        (automationIndex ?? 0)) /
        4,
    ),
  );

  const cohortPercentileBand = scoreToPercentileBand(anonymizedHealthIndex);
  const pendingGlobalActions = enterprise.commandCenter.pendingApprovals;
  const hasLiveData = collected.dataAvailable;

  return {
    anonymizedHealthIndex,
    intelligenceCoverage,
    operationalReadiness,
    governanceIndex,
    automationIndex,
    federationCoverage,
    cohortPercentileBand,
    pendingGlobalActions,
    hasLiveData,
  };
}

export function anonymizedRegionalIndex(
  baseScore: number | null,
  regionalOffset: number,
): number | null {
  if (baseScore == null) return null;
  return Math.min(100, Math.max(0, Math.round(baseScore + regionalOffset)));
}

export function anonymizedBenchmarkIndex(
  tenantScore: number | null,
  benchmarkKey: keyof typeof GLOBAL_COHORT_MEDIANS,
): { tenantIndex: number | null; cohortMedian: number; percentileBand: string | null } {
  const cohortMedian = GLOBAL_COHORT_MEDIANS[benchmarkKey];
  return {
    tenantIndex: tenantScore,
    cohortMedian,
    percentileBand: scoreToPercentileBand(tenantScore),
  };
}
