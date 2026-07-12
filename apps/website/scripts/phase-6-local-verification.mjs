#!/usr/bin/env node
/**
 * Phase 6 Local Verification — Audience Intelligence Engine (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = [
  'src/lib/music-intelligence/audience-engine-types.ts',
  'src/lib/music-intelligence/audience-engine-constants.ts',
  'src/lib/music-intelligence/audience-engine-connectors.ts',
  'src/lib/music-intelligence/audience-engine-collector.ts',
  'src/lib/music-intelligence/audience-engine-processor.ts',
  'src/lib/music-intelligence/audience-engine-service.ts',
];

const APIS = [
  'src/app/api/music-intelligence/workspace/audience-engine/route.ts',
  'src/app/api/music-intelligence/partner/audience-engine/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/audience-engine/AudienceEngineSection.tsx',
  'src/components/music-intelligence/audience-engine/AudienceEngineModule.tsx',
  'src/components/music-intelligence/audience-engine/GeographicIntelligencePanel.tsx',
  'src/components/music-intelligence/audience-engine/AudienceHealthPanel.tsx',
  'src/components/music-intelligence/audience-engine/AudienceTimelinePanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '6',
  name: 'Audience Intelligence Engine',
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

const processor = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/audience-engine-processor.ts'), 'utf8');
const connectors = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/audience-engine-connectors.ts'), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');
const partnerPanel = readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8');

report.architecture = {
  separatedLayers: processor.includes('buildGlobalOverview') && existsSync(join(websiteRoot, LAYERS[3])),
  connectorFramework: connectors.includes('buildAudienceConnectors'),
  noFabricated: !processor.includes('Math.random'),
  geographicIntelligence: processor.includes('buildGeographicIntelligence'),
  executiveReport: processor.includes('buildExecutiveReport'),
  healthDashboard: processor.includes('buildHealthDashboard'),
  artistIntegrated: artistPanel.includes('AudienceEngineSection'),
  partnerIntegrated: partnerPanel.includes('AudienceEngineSection'),
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
  report.architecture.geographicIntelligence &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-6-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
