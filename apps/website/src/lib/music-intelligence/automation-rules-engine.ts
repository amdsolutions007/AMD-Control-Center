import { AUTOMATION_RULE_DEFINITIONS, HEALTH_THRESHOLDS } from './automation-constants';
import type { CollectedAutomationData } from './automation-collector';
import type { AutomationRule, AutomationRulesEngine } from './automation-types';
import type { BusinessEnginePayload } from './business-engine-types';

function evaluateRule(
  def: (typeof AUTOMATION_RULE_DEFINITIONS)[number],
  business: BusinessEnginePayload,
): { matched: boolean; reason: string | null } {
  switch (def.id) {
    case 'rule-intelligence-gap':
      if (business.crossEngine.enginesWithLiveData < HEALTH_THRESHOLDS.intelligenceGapEngines) {
        return {
          matched: true,
          reason: `${business.crossEngine.enginesWithLiveData}/6 engines live.`,
        };
      }
      return { matched: false, reason: null };

    case 'rule-declining-health': {
      const score = business.healthDashboard.executiveHealthScore;
      if (score != null && score < HEALTH_THRESHOLDS.lowExecutiveScore) {
        return { matched: true, reason: `Executive health at ${score}%.` };
      }
      return { matched: false, reason: null };
    }

    case 'rule-campaign-opportunity': {
      const campaigns = business.executiveKpis.metrics.find((m) => m.key === 'active_campaigns');
      if (!campaigns?.available || campaigns.value === 0 || campaigns.value === '0') {
        return { matched: true, reason: 'No active campaigns with UTM attribution.' };
      }
      return { matched: false, reason: null };
    }

    case 'rule-rapid-growth': {
      const growthAlert = business.alerts.find((a) => a.type === 'rapid_growth');
      if (growthAlert) return { matched: true, reason: growthAlert.detail };
      const upPeriod = business.growth.periods.find((p) => p.trend === 'up' && p.available);
      if (upPeriod) return { matched: true, reason: `${upPeriod.label} trend up.` };
      return { matched: false, reason: null };
    }

    case 'rule-missing-data': {
      const fallback = business.crossEngine.engineStatuses.filter((e) => e.status === 'fallback');
      if (fallback.length > 0) {
        return { matched: true, reason: `${fallback.length} engine(s) in fallback mode.` };
      }
      return { matched: false, reason: null };
    }

    case 'rule-executive-recommendation':
      if (business.executiveReport.recommendations.length > 0) {
        return {
          matched: true,
          reason: `${business.executiveReport.recommendations.length} recommendation(s) available.`,
        };
      }
      return { matched: false, reason: null };

    default:
      return { matched: false, reason: null };
  }
}

export function evaluateAutomationRules(collected: CollectedAutomationData): AutomationRulesEngine {
  const { business } = collected;
  const rules: AutomationRule[] = AUTOMATION_RULE_DEFINITIONS.map((def) => {
    const evaluation = evaluateRule(def, business);
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      trigger: def.trigger,
      condition: def.condition,
      action: def.action,
      approvalMode: def.approvalMode,
      enabled: true,
      matched: evaluation.matched,
      matchReason: evaluation.reason,
    };
  });

  const matchedRules = rules.filter((r) => r.matched).length;

  return {
    rules,
    activeRules: rules.length,
    matchedRules,
    summary:
      matchedRules > 0
        ? `${matchedRules} rule(s) matched against Business Intelligence signals.`
        : 'No automation rules matched current Business Intelligence state.',
  };
}

export function getMatchedRuleIds(rulesEngine: AutomationRulesEngine): string[] {
  return rulesEngine.rules.filter((r) => r.matched).map((r) => r.id);
}
