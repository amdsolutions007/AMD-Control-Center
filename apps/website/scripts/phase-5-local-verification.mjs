#!/usr/bin/env node
/**
 * Phase 5 Local Verification — Streaming Intelligence Engine (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = [
  'src/lib/music-intelligence/streaming-engine-types.ts',
  'src/lib/music-intelligence/streaming-engine-constants.ts',
  'src/lib/music-intelligence/streaming-engine-connectors.ts',
  'src/lib/music-intelligence/streaming-engine-collector.ts',
  'src/lib/music-intelligence/streaming-engine-processor.ts',
  'src/lib/music-intelligence/streaming-engine-service.ts',
];

const APIS = [
  'src/app/api/music-intelligence/workspace/streaming-engine/route.ts',
  'src/app/api/music-intelligence/partner/streaming-engine/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/streaming-engine/StreamingEngineSection.tsx',
  'src/components/music-intelligence/streaming-engine/StreamingEngineModule.tsx',
  'src/components/music-intelligence/streaming-engine/StreamingMetricsPanel.tsx',
  'src/components/music-intelligence/streaming-engine/PlatformComparisonPanel.tsx',
  'src/components/music-intelligence/streaming-engine/PlaylistPerformancePanel.tsx',
  'src/components/music-intelligence/streaming-engine/StreamingTimelinePanel.tsx',
  'src/components/music-intelligence/streaming-engine/StreamingStatusPanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '5',
  name: 'Streaming Intelligence Engine',
  timestamp: new Date().toISOString(),
  layers: { ok: [], missing: [] },
  apis: { ok: [], missing: [] },
  components: { ok: [], missing: [] },
  integrations: { ok: [], missing: [] },
  architecture: {},
  sqlMigration: 'none',
  build: null,
  passed: false,
};

function check(files, bucket) {
  for (const f of files) {
    const p = join(websiteRoot, f);
    if (existsSync(p)) report[bucket].ok.push(f);
    else report[bucket].missing.push(f);
  }
}

check(LAYERS, 'layers');
check(APIS, 'apis');
check(COMPONENTS, 'components');
check(INTEGRATIONS, 'integrations');

const processor = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/streaming-engine-processor.ts'), 'utf8');
const connectors = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/streaming-engine-connectors.ts'), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');
const partnerPanel = readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8');

report.architecture = {
  separatedLayers: processor.includes('buildStreamingMetrics') && existsSync(join(websiteRoot, LAYERS[3])),
  connectorFramework: connectors.includes('buildConnectorFramework'),
  noFabricatedMetrics: processor.includes('hasLivePlatformMetrics: false') || processor.includes("value: null"),
  noRandom: !processor.includes('Math.random'),
  streamingProfile: processor.includes('buildStreamingProfile'),
  executiveReport: processor.includes('buildExecutiveStreamingReport'),
  artistIntegrated: artistPanel.includes('StreamingEngineSection'),
  partnerIntegrated: partnerPanel.includes('StreamingEngineSection'),
  placeholderRemoved: !artistPanel.includes('activate in Phase 5'),
};

const skipBuild = process.env.SKIP_BUILD === '1';
if (!skipBuild) {
  const build = spawnSync('npm', ['run', 'build'], { cwd: websiteRoot, encoding: 'utf8', shell: true });
  report.build = { exitCode: build.status, ok: build.status === 0 };
} else {
  report.build = { skipped: true, ok: true };
}

report.passed =
  report.layers.missing.length === 0 &&
  report.apis.missing.length === 0 &&
  report.components.missing.length === 0 &&
  report.integrations.missing.length === 0 &&
  report.architecture.separatedLayers &&
  report.architecture.connectorFramework &&
  report.architecture.noFabricatedMetrics &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-5-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
