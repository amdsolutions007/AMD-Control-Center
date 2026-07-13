import type { AgentFrameworkStatus, KernelStatus } from './os-types';

export const ENGINE_REGISTRY_DEFINITIONS = [
  { key: 'intelligence', label: 'Intelligence Dashboard Foundation', phase: '3E', loaderKey: 'intelligence' as const },
  { key: 'ai', label: 'AI Intelligence Engine', phase: '3F', loaderKey: 'ai' as const },
  { key: 'music', label: 'Music Intelligence Engine', phase: '4', loaderKey: 'music' as const },
  { key: 'streaming', label: 'Streaming Intelligence Engine', phase: '5', loaderKey: 'streaming' as const },
  { key: 'audience', label: 'Audience Intelligence Engine', phase: '6', loaderKey: 'audience' as const },
  { key: 'marketing', label: 'Marketing Intelligence Engine', phase: '7', loaderKey: 'marketing' as const },
  { key: 'business', label: 'Business Intelligence Engine', phase: '8', loaderKey: 'business' as const },
  { key: 'automation', label: 'Automation Intelligence Engine', phase: '9', loaderKey: 'automation' as const },
  { key: 'enterprise', label: 'Enterprise Intelligence Engine', phase: '10', loaderKey: 'enterprise' as const },
  { key: 'global', label: 'Global Intelligence Network', phase: '11', loaderKey: 'global' as const },
] as const;

export const AI_AGENT_DEFINITIONS = [
  { key: 'executive', label: 'Executive AI Agent', domain: 'executive', capabilities: ['KPI synthesis', 'Decision support', 'Report generation'] },
  { key: 'marketing', label: 'Marketing AI Agent', domain: 'marketing', capabilities: ['Campaign analysis', 'ROI forecasting', 'Channel optimization'] },
  { key: 'audience', label: 'Audience AI Agent', domain: 'audience', capabilities: ['Segment analysis', 'Growth modeling', 'Geographic insights'] },
  { key: 'enterprise', label: 'Enterprise AI Agent', domain: 'enterprise', capabilities: ['Governance monitoring', 'Compliance review', 'Administration support'] },
  { key: 'music', label: 'Music AI Agent', domain: 'music', capabilities: ['Release readiness', 'Metadata analysis', 'Playlist intelligence'] },
  { key: 'automation', label: 'Automation AI Agent', domain: 'automation', capabilities: ['Workflow optimization', 'Rule evaluation', 'Approval routing'] },
  { key: 'compliance', label: 'Compliance AI Agent', domain: 'compliance', capabilities: ['Policy monitoring', 'Audit preparation', 'Risk assessment'] },
] as const;

export const UNIFIED_SEARCH_CATALOG = [
  { id: 'search-kpi', label: 'Executive KPIs', category: 'Business', engineKey: 'business' },
  { id: 'search-music', label: 'Music Intelligence Reports', category: 'Music', engineKey: 'music' },
  { id: 'search-streaming', label: 'Streaming Metrics', category: 'Streaming', engineKey: 'streaming' },
  { id: 'search-audience', label: 'Audience Analytics', category: 'Audience', engineKey: 'audience' },
  { id: 'search-marketing', label: 'Campaign Performance', category: 'Marketing', engineKey: 'marketing' },
  { id: 'search-automation', label: 'Workflow Status', category: 'Automation', engineKey: 'automation' },
  { id: 'search-governance', label: 'Governance Modules', category: 'Enterprise', engineKey: 'enterprise' },
  { id: 'search-global', label: 'Global Benchmarks', category: 'Global', engineKey: 'global' },
  { id: 'search-ai', label: 'AI Readiness Scores', category: 'AI', engineKey: 'ai' },
  { id: 'search-dashboard', label: 'Dashboard Metrics', category: 'Foundation', engineKey: 'intelligence' },
] as const;

export function enginesLiveToKernelStatus(live: number, total: number): KernelStatus {
  if (live === 0) return 'standby';
  if (live >= total * 0.7) return 'operational';
  return 'degraded';
}

export function averageScores(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s != null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

export function agentStatus(): AgentFrameworkStatus {
  return 'framework_ready';
}
