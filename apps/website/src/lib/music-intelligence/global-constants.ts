import type { FederationLevel, RegionalKey } from './global-types';

export const REGIONAL_DEFINITIONS: { key: RegionalKey; label: string }[] = [
  { key: 'west_africa', label: 'West Africa' },
  { key: 'east_africa', label: 'East Africa' },
  { key: 'north_america', label: 'North America' },
  { key: 'europe', label: 'Europe' },
  { key: 'global_aggregate', label: 'Global Aggregate' },
];

export const INDUSTRY_SEGMENT_DEFINITIONS = [
  { key: 'independent_artists', label: 'Independent Artists' },
  { key: 'record_labels', label: 'Record Labels' },
  { key: 'distributors', label: 'Distributors' },
  { key: 'publishers', label: 'Music Publishers' },
  { key: 'management', label: 'Artist Management' },
  { key: 'commercial_partners', label: 'Commercial Partners' },
] as const;

export const BENCHMARK_DEFINITIONS = [
  { key: 'intelligence_maturity', label: 'Intelligence Maturity Index' },
  { key: 'operational_readiness', label: 'Operational Readiness Index' },
  { key: 'automation_adoption', label: 'Automation Adoption Index' },
  { key: 'governance_strength', label: 'Governance Strength Index' },
  { key: 'cross_engine_coverage', label: 'Cross-Engine Coverage Index' },
] as const;

export const GLOBAL_COHORT_MEDIANS = {
  intelligence_maturity: 62,
  operational_readiness: 58,
  automation_adoption: 55,
  governance_strength: 60,
  cross_engine_coverage: 65,
} as const;

export const FEDERATION_THRESHOLDS = {
  strongCoverage: 75,
  moderateCoverage: 50,
} as const;

export function scoreToPercentileBand(score: number | null): string | null {
  if (score == null) return null;
  if (score >= 80) return 'Top Quartile';
  if (score >= 65) return 'Upper Mid-Tier';
  if (score >= 50) return 'Median Cohort';
  if (score >= 35) return 'Developing Cohort';
  return 'Emerging Cohort';
}

export function scoreToFederationLevel(coverage: number): FederationLevel {
  if (coverage >= FEDERATION_THRESHOLDS.strongCoverage) return 'strong';
  if (coverage >= FEDERATION_THRESHOLDS.moderateCoverage) return 'moderate';
  if (coverage > 0) return 'developing';
  return 'awaiting_data';
}

export function scoreToTrend(current: number | null, baseline: number): 'up' | 'stable' | 'down' | 'awaiting_data' {
  if (current == null) return 'awaiting_data';
  if (current > baseline + 5) return 'up';
  if (current < baseline - 5) return 'down';
  return 'stable';
}
