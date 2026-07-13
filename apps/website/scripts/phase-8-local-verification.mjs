#!/usr/bin/env node
/**
 * Phase 8 Local Verification — Business Intelligence Engine (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = [
  'src/lib/music-intelligence/business-engine-types.ts',
  'src/lib/music-intelligence/business-engine-constants.ts',
  'src/lib/music-intelligence/business-engine-connectors.ts',
  'src/lib/music-intelligence/business-engine-collector.ts',
  'src/lib/music-intelligence/business-engine-aggregator.ts',
  'src/lib/music-intelligence/business-engine-processor.ts',
  'src/lib/music-intelligence/business-engine-service.ts',
];

const APIS = [
  'src/app/api/music-intelligence/workspace/business-engine/route.ts',
  'src/app/api/music-intelligence/partner/business-engine/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/business-engine/BusinessEngineSection.tsx',
  'src/components/music-intelligence/business-engine/BusinessEngineModule.tsx',
  'src/components/music-intelligence/business-engine/BusinessTimelinePanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '8',
  name: 'Business Intelligence Engine',
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

const collector = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/business-engine-collector.ts'), 'utf8');
const aggregator = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/business-engine-aggregator.ts'), 'utf8');
const processor = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/business-engine-processor.ts'), 'utf8');
const connectors = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/business-engine-connectors.ts'), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');
const partnerPanel = readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8');

report.architecture = {
  orchestrationLayer: collector.includes('loadArtistIntelligence') && collector.includes('loadArtistMarketingEngine'),
  aggregatorLayer: aggregator.includes('aggregateBusinessEngineData'),
  noDuplication: !collector.includes('mi_click_tracking') && !collector.includes('mi_music_submissions'),
  separatedLayers: processor.includes('buildExecutiveKpis') && existsSync(join(websiteRoot, LAYERS[4])),
  connectorFramework: connectors.includes('buildRevenueConnectors'),
  noFabricated: !processor.includes('Math.random'),
  revenueHonest: processor.includes('hasLiveData: false') && processor.includes('Awaiting financial API'),
  crossEngineAggregation: processor.includes('buildCrossEngine'),
  executiveReport: processor.includes('buildExecutiveReport'),
  artistIntegrated: artistPanel.includes('BusinessEngineSection'),
  partnerIntegrated: partnerPanel.includes('BusinessEngineSection'),
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
  report.architecture.orchestrationLayer &&
  report.architecture.aggregatorLayer &&
  report.architecture.noDuplication &&
  report.architecture.crossEngineAggregation &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-8-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
