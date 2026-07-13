import type { GovernanceLevel } from './enterprise-types';

export const GOVERNANCE_MODULE_DEFINITIONS = [
  { key: 'policy_status', label: 'Policy Status' },
  { key: 'audit_readiness', label: 'Audit Readiness' },
  { key: 'compliance_overview', label: 'Compliance Overview' },
  { key: 'governance_health', label: 'Governance Health' },
  { key: 'operational_risk', label: 'Operational Risk' },
  { key: 'organization_readiness', label: 'Organization Readiness' },
] as const;

export const ADMINISTRATION_ENTITY_TYPES = [
  { type: 'organization' as const, label: 'Organizations' },
  { type: 'department' as const, label: 'Departments' },
  { type: 'team' as const, label: 'Teams' },
  { type: 'member' as const, label: 'Members' },
  { type: 'invitation' as const, label: 'Invitations' },
  { type: 'enterprise_account' as const, label: 'Enterprise Accounts' },
];

export const RBAC_ROLE_DEFINITIONS = [
  { key: 'artist_workspace', label: 'Artist Workspace', scope: 'artist' as const, permissions: ['workspace:read', 'submissions:write', 'intelligence:read'] },
  { key: 'partner_workspace', label: 'Partner Workspace', scope: 'partner' as const, permissions: ['partner:read', 'artists:manage', 'analytics:read', 'intelligence:read'] },
  { key: 'enterprise_admin', label: 'Enterprise Administrator', scope: 'enterprise' as const, permissions: ['enterprise:admin', 'governance:read', 'reports:read'] },
  { key: 'delegated_admin', label: 'Delegated Administrator', scope: 'delegated' as const, permissions: ['delegated:admin', 'members:invite', 'teams:manage'] },
];

export const ENTERPRISE_API_CONNECTORS = [
  { key: 'workspace_api', label: 'Workspace Enterprise API' },
  { key: 'partner_api', label: 'Partner Enterprise API' },
  { key: 'governance_api', label: 'Governance API' },
  { key: 'audit_api', label: 'Audit Trail API' },
  { key: 'sso_api', label: 'Enterprise SSO API' },
] as const;

export const GOVERNANCE_THRESHOLDS = {
  lowHealth: 40,
  minIntelligenceCoverage: 50,
} as const;

export function scoreToGovernanceLevel(score: number | null): GovernanceLevel {
  if (score == null) return 'awaiting_data';
  if (score >= 70) return 'compliant';
  if (score >= 45) return 'developing';
  return 'needs_attention';
}
