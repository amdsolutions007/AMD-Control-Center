import { ENGINE_LABELS } from './business-engine-constants';
import type { CollectedBusinessEngineData, UpstreamEnginePayloads } from './business-engine-collector';
import type {
  BusinessEngineScope,
  EngineKey,
  EngineStatus,
  EngineStatusItem,
} from './business-engine-types';
import type { IntelligenceWidgetMetric } from './intelligence-types';

export interface AggregatedBusinessData {
  scope: BusinessEngineScope;
  dataAvailable: boolean;
  engines: UpstreamEnginePayloads;
  engineStatuses: EngineStatusItem[];
  liveEngineCount: number;
  widgetMap: Map<string, IntelligenceWidgetMetric>;
  allRecommendations: string[];
}

function resolveEngineStatus(dataSource: 'live' | 'fallback'): EngineStatus {
  return dataSource === 'live' ? 'live' : 'fallback';
}

function buildEngineStatuses(engines: UpstreamEnginePayloads): EngineStatusItem[] {
  const entries: { key: EngineKey; dataSource: 'live' | 'fallback'; summary: string }[] = [
    {
      key: 'intelligence',
      dataSource: engines.intelligence.dataSource,
      summary: `${engines.intelligence.widgets.length} dashboard widgets loaded.`,
    },
    {
      key: 'ai',
      dataSource: engines.ai.dataSource,
      summary: engines.ai.readinessLabel || engines.ai.systemStatus.detail,
    },
    {
      key: 'music',
      dataSource: engines.music.dataSource,
      summary: engines.music.portfolioSummary.summary,
    },
    {
      key: 'streaming',
      dataSource: engines.streaming.dataSource,
      summary: engines.streaming.portfolioSummary.summary,
    },
    {
      key: 'audience',
      dataSource: engines.audience.dataSource,
      summary: engines.audience.portfolioSummary.summary,
    },
    {
      key: 'marketing',
      dataSource: engines.marketing.dataSource,
      summary: engines.marketing.portfolioSummary.summary,
    },
  ];

  return entries.map((e) => ({
    engine: e.key,
    label: ENGINE_LABELS[e.key],
    status: resolveEngineStatus(e.dataSource),
    dataSource: e.dataSource,
    summary: e.summary,
  }));
}

function collectRecommendations(engines: UpstreamEnginePayloads): string[] {
  const recs: string[] = [];

  for (const r of engines.ai.recommendations) {
    recs.push(r.title);
  }
  recs.push(...engines.ai.executiveInsights);
  recs.push(...engines.marketing.executiveReport.recommendations);
  recs.push(...engines.audience.executiveReport.recommendations);
  recs.push(...engines.streaming.executiveReport.recommendations);

  for (const report of engines.music.reports) {
    recs.push(...report.executiveReport.recommendedActions);
  }

  return [...new Set(recs)].slice(0, 12);
}

export function aggregateBusinessEngineData(
  collected: CollectedBusinessEngineData,
): AggregatedBusinessData {
  const engineStatuses = buildEngineStatuses(collected.engines);
  const liveEngineCount = engineStatuses.filter((e) => e.status === 'live').length;
  const widgetMap = new Map(
    collected.engines.intelligence.widgets.map((w) => [w.id, w]),
  );

  return {
    scope: collected.scope,
    dataAvailable: collected.dataAvailable,
    engines: collected.engines,
    engineStatuses,
    liveEngineCount,
    widgetMap,
    allRecommendations: collectRecommendations(collected.engines),
  };
}
