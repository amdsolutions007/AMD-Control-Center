import {
  AI_AGENT_DEFINITIONS,
  UNIFIED_SEARCH_CATALOG,
  agentStatus,
  averageScores,
} from './os-constants';
import type { CollectedOSData } from './os-engine-collector';
import { buildOSKernel } from './os-kernel';
import { buildIntelligenceRegistry } from './os-registry';
import type {
  AIAgentFramework,
  ExecutiveDecisionCenter,
  OSCommandCenter,
  OSEnginePayload,
  OSExecutiveReport,
  OSdashboard,
  OperatingTimelineEvent,
  SystemAlert,
  SystemHealthCenter,
  UnifiedIntelligenceSearch,
} from './os-types';

function buildCommandCenter(
  collected: CollectedOSData,
  kernel: ReturnType<typeof buildOSKernel>,
  registry: ReturnType<typeof buildIntelligenceRegistry>,
  health: SystemHealthCenter,
  decisions: ExecutiveDecisionCenter,
  alerts: SystemAlert[],
): OSCommandCenter {
  return {
    systemHealthScore: health.overallScore,
    enginesLive: registry.liveCount,
    enginesRegistered: registry.registeredCount,
    activeAlerts: alerts.length,
    pendingDecisions: decisions.pendingCount,
    summary: `AMD Music OS™ Command Center · ${kernel.status} · ${registry.liveCount} engine(s) live · ${alerts.length} alert(s).`,
  };
}

function buildHealthCenter(collected: CollectedOSData): SystemHealthCenter {
  const { engines } = collected;
  const metrics = [
    { key: 'executive', label: 'Executive Health', score: engines.business.healthDashboard?.overallExecutiveScore ?? null, source: 'business' },
    { key: 'automation', label: 'Automation Health', score: engines.automation.healthDashboard?.automationHealthScore ?? null, source: 'automation' },
    { key: 'enterprise', label: 'Enterprise Health', score: engines.enterprise.healthDashboard?.enterpriseHealthScore ?? null, source: 'enterprise' },
    { key: 'global', label: 'Global Health', score: engines.global.health?.globalHealthIndex ?? null, source: 'global' },
    { key: 'ai_readiness', label: 'AI Readiness', score: engines.ai.readinessScore ?? null, source: 'ai' },
    { key: 'intelligence_coverage', label: 'Intelligence Coverage', score: engines.business.businessHealth?.intelligenceCoverage ?? null, source: 'business' },
  ];

  const overallScore = averageScores(metrics.map((m) => m.score));

  return {
    overallScore,
    metrics,
    summary:
      overallScore != null
        ? `System Health Center · overall ${overallScore}% · orchestrating all intelligence subsystems.`
        : 'System Health Center · awaiting intelligence engine data.',
  };
}

function buildDecisionCenter(collected: CollectedOSData): ExecutiveDecisionCenter {
  const { engines } = collected;
  const decisions = [];

  for (const rec of engines.business.executiveReport?.recommendations?.slice(0, 2) ?? []) {
    decisions.push({
      id: `dec-biz-${decisions.length}`,
      priority: 'high' as const,
      label: 'Business Intelligence Recommendation',
      source: 'business',
      summary: rec,
    });
  }

  for (const rec of engines.automation.executiveReport?.recommendations?.slice(0, 2) ?? []) {
    decisions.push({
      id: `dec-auto-${decisions.length}`,
      priority: 'medium' as const,
      label: 'Automation Decision',
      source: 'automation',
      summary: rec,
    });
  }

  for (const rec of engines.global.globalReport?.recommendations?.slice(0, 2) ?? []) {
    decisions.push({
      id: `dec-global-${decisions.length}`,
      priority: 'medium' as const,
      label: 'Global Federation Recommendation',
      source: 'global',
      summary: rec,
    });
  }

  const pendingApprovals = engines.automation.approvalCenter?.pending?.length ?? 0;
  if (pendingApprovals > 0) {
    decisions.push({
      id: 'dec-approval',
      priority: 'high' as const,
      label: 'Pending Automation Approval',
      source: 'automation',
      summary: `${pendingApprovals} workflow(s) awaiting approval.`,
    });
  }

  if (decisions.length === 0) {
    decisions.push({
      id: 'dec-standby',
      priority: 'low' as const,
      label: 'Executive Decision Framework Standby',
      source: 'os',
      summary: 'Activate intelligence engines to enable executive decision synthesis.',
    });
  }

  return {
    decisions,
    pendingCount: pendingApprovals,
    summary: `Executive Decision Center · ${decisions.length} decision signal(s) · ${pendingApprovals} pending approval(s).`,
  };
}

function buildUnifiedSearch(collected: CollectedOSData): UnifiedIntelligenceSearch {
  const items = UNIFIED_SEARCH_CATALOG.map((item) => {
    const engineLive = collected.engines[item.engineKey as keyof typeof collected.engines]?.dataSource === 'live';
    return {
      id: item.id,
      label: item.label,
      category: item.category,
      engineKey: item.engineKey,
      searchable: engineLive,
    };
  });

  return {
    items,
    totalItems: items.length,
    frameworkReady: true,
    summary: 'Unified Intelligence Search · catalog framework ready · indexes all registered engines.',
  };
}

function buildTimeline(collected: CollectedOSData): OperatingTimelineEvent[] {
  const events: OperatingTimelineEvent[] = [];
  const { engines } = collected;

  const sources: { key: string; timeline: { id: string; label: string; timestamp: string; detail: string }[] }[] = [
    { key: 'business', timeline: engines.business.timeline ?? [] },
    { key: 'automation', timeline: engines.automation.timeline ?? [] },
    { key: 'enterprise', timeline: engines.enterprise.timeline ?? [] },
    { key: 'global', timeline: engines.global.timeline ?? [] },
  ];

  for (const src of sources) {
    for (const e of src.timeline.slice(0, 5)) {
      events.push({
        id: `os-${src.key}-${e.id}`,
        source: src.key,
        label: e.label,
        timestamp: e.timestamp,
        detail: e.detail,
      });
    }
  }

  events.push({
    id: 'os-kernel-eval',
    source: 'os',
    label: 'AMD Music OS™ kernel evaluation complete',
    timestamp: engines.business.generatedAt ?? new Date().toISOString(),
    detail: collected.dataAvailable
      ? 'Operating system orchestration cycle complete.'
      : 'Operating system standby · awaiting engine activation.',
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 25);
}

function buildAlerts(collected: CollectedOSData): SystemAlert[] {
  const alerts: SystemAlert[] = [];
  const now = collected.engines.business.generatedAt ?? new Date().toISOString();

  for (const a of collected.engines.automation.executiveAlerts?.alerts?.slice(0, 3) ?? []) {
    alerts.push({
      id: `os-auto-${a.id}`,
      severity: a.severity === 'critical' ? 'attention' : 'watch',
      label: a.title,
      source: 'automation',
      summary: a.detail,
      timestamp: now,
    });
  }

  for (const a of collected.engines.global.alerts?.slice(0, 3) ?? []) {
    alerts.push({
      id: `os-global-${a.id}`,
      severity: a.severity,
      label: a.label,
      source: 'global',
      summary: a.summary,
      timestamp: a.timestamp,
    });
  }

  if (collected.engines.business.alerts?.length) {
    for (const a of collected.engines.business.alerts.slice(0, 2)) {
      alerts.push({
        id: `os-biz-${a.id}`,
        severity: a.severity === 'critical' ? 'attention' : 'info',
        label: a.title,
        source: 'business',
        summary: a.detail,
        timestamp: a.timestamp,
      });
    }
  }

  return alerts;
}

function buildExecutiveReport(
  commandCenter: OSCommandCenter,
  kernel: ReturnType<typeof buildOSKernel>,
  registry: ReturnType<typeof buildIntelligenceRegistry>,
  health: SystemHealthCenter,
  decisions: ExecutiveDecisionCenter,
  alerts: SystemAlert[],
): OSExecutiveReport {
  const risks = alerts.filter((a) => a.severity === 'attention').map((a) => a.summary);
  const recommendations = decisions.decisions.slice(0, 5).map((d) => d.summary);

  return {
    commandCenterSummary: commandCenter.summary,
    kernelSummary: kernel.summary,
    registrySummary: registry.summary,
    healthSummary: health.summary,
    decisionSummary: decisions.summary,
    risks: risks.length > 0 ? risks : ['No critical OS-level risks detected.'],
    recommendations: recommendations.length > 0 ? recommendations : ['AMD Music OS™ operating normally.'],
    summary:
      health.overallScore != null
        ? `AMD Music OS™ executive report · system health ${health.overallScore}% · ${registry.liveCount} engines live.`
        : 'AMD Music OS™ executive report · awaiting intelligence subsystem data.',
  };
}

function buildAIAgentFramework(): AIAgentFramework {
  const status = agentStatus();
  return {
    agents: AI_AGENT_DEFINITIONS.map((def) => ({
      key: def.key,
      label: def.label,
      domain: def.domain,
      status,
      capabilities: [...def.capabilities],
      summary: `${def.label} · framework ready · no autonomous execution in Phase 12.`,
    })),
    autonomousExecution: false,
    summary: 'AI Agent Framework · 7 agent definitions · framework only · no autonomous execution.',
  };
}

function buildOSDashboard(
  collected: CollectedOSData,
  health: SystemHealthCenter,
  registry: ReturnType<typeof buildIntelligenceRegistry>,
): OSdashboard {
  return {
    platformName: 'AMD Music OS™',
    scope: collected.scope,
    enginesStacked: registry.registeredCount,
    healthScore: health.overallScore,
    summary: `AMD Music OS™ Dashboard · ${collected.scope} scope · ${registry.liveCount}/${registry.registeredCount} engines operational.`,
  };
}

export function processOSData(
  collected: CollectedOSData,
): Omit<OSEnginePayload, 'scope' | 'generatedAt' | 'dataSource'> {
  const kernel = buildOSKernel(collected);
  const registry = buildIntelligenceRegistry(collected);
  const healthCenter = buildHealthCenter(collected);
  const decisionCenter = buildDecisionCenter(collected);
  const unifiedSearch = buildUnifiedSearch(collected);
  const timeline = buildTimeline(collected);
  const alerts = buildAlerts(collected);
  const commandCenter = buildCommandCenter(collected, kernel, registry, healthCenter, decisionCenter, alerts);
  const executiveReport = buildExecutiveReport(commandCenter, kernel, registry, healthCenter, decisionCenter, alerts);
  const aiAgentFramework = buildAIAgentFramework();
  const osDashboard = buildOSDashboard(collected, healthCenter, registry);

  return {
    commandCenter,
    kernel,
    registry,
    healthCenter,
    decisionCenter,
    unifiedSearch,
    timeline,
    alerts,
    executiveReport,
    aiAgentFramework,
    osDashboard,
  };
}
