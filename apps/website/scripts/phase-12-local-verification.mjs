#!/usr/bin/env node
/**
 * Phase 12 Local Verification — AMD Music OS™ (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = [
  'src/lib/music-intelligence/os-types.ts',
  'src/lib/music-intelligence/os-constants.ts',
  'src/lib/music-intelligence/os-engine-collector.ts',
  'src/lib/music-intelligence/os-kernel.ts',
  'src/lib/music-intelligence/os-registry.ts',
  'src/lib/music-intelligence/os-processor.ts',
  'src/lib/music-intelligence/os-service.ts',
];

const APIS = [
  'src/app/api/music-intelligence/workspace/os-engine/route.ts',
  'src/app/api/music-intelligence/partner/os-engine/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/operating-system/OperatingSystemSection.tsx',
  'src/components/music-intelligence/operating-system/OperatingSystemModule.tsx',
  'src/components/music-intelligence/operating-system/OperatingTimelinePanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '12',
  name: 'AMD Music OS',
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

const collector = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/os-engine-collector.ts'), 'utf8');
const kernel = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/os-kernel.ts'), 'utf8');
const registry = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/os-registry.ts'), 'utf8');
const processor = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/os-processor.ts'), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');

report.architecture = {
  allEnginesConsumer: collector.includes('loadArtistIntelligence') && collector.includes('loadArtistGlobalEngine'),
  osKernel: kernel.includes('buildOSKernel'),
  intelligenceRegistry: registry.includes('buildIntelligenceRegistry'),
  aiAgentFramework: processor.includes('autonomousExecution: false'),
  noDuplication: !collector.includes('mi_click_tracking') && !collector.includes('.from('),
  noFabricated: !processor.includes('Math.random'),
  artistIntegrated: artistPanel.includes('OperatingSystemSection'),
  partnerIntegrated: readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8').includes('OperatingSystemSection'),
  analyticsIntegrated: readFileSync(join(websiteRoot, INTEGRATIONS[2]), 'utf8').includes('OperatingSystemSection'),
  afterGlobal: artistPanel.includes('GlobalEngineSection') && artistPanel.indexOf('OperatingSystemSection') > artistPanel.indexOf('GlobalEngineSection'),
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
  report.architecture.allEnginesConsumer &&
  report.architecture.osKernel &&
  report.architecture.intelligenceRegistry &&
  report.architecture.aiAgentFramework &&
  report.architecture.noDuplication &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.architecture.analyticsIntegrated &&
  report.architecture.afterGlobal &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-12-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
