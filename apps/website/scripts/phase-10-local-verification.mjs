#!/usr/bin/env node
/**
 * Phase 10 Local Verification — Enterprise Intelligence Engine (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = [
  'src/lib/music-intelligence/enterprise-types.ts',
  'src/lib/music-intelligence/enterprise-constants.ts',
  'src/lib/music-intelligence/enterprise-connectors.ts',
  'src/lib/music-intelligence/enterprise-collector.ts',
  'src/lib/music-intelligence/enterprise-governance-engine.ts',
  'src/lib/music-intelligence/enterprise-processor.ts',
  'src/lib/music-intelligence/enterprise-service.ts',
];

const APIS = [
  'src/app/api/music-intelligence/workspace/enterprise-engine/route.ts',
  'src/app/api/music-intelligence/partner/enterprise-engine/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/enterprise-engine/EnterpriseEngineSection.tsx',
  'src/components/music-intelligence/enterprise-engine/EnterpriseEngineModule.tsx',
  'src/components/music-intelligence/enterprise-engine/EnterpriseTimelinePanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '10',
  name: 'Enterprise Intelligence Engine',
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

const collector = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/enterprise-collector.ts'), 'utf8');
const governance = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/enterprise-governance-engine.ts'), 'utf8');
const processor = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/enterprise-processor.ts'), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');

report.architecture = {
  businessIntelligenceConsumer: collector.includes('loadArtistBusinessEngine'),
  automationIntelligenceConsumer: collector.includes('loadArtistAutomationEngine'),
  governanceEngine: governance.includes('buildEnterpriseGovernance'),
  noDuplication: !collector.includes('mi_click_tracking') && !collector.includes('loadArtistMusicEngine'),
  noFabricated: !processor.includes('Math.random'),
  connectorFramework: existsSync(join(websiteRoot, 'src/lib/music-intelligence/enterprise-connectors.ts')),
  artistIntegrated: artistPanel.includes('EnterpriseEngineSection'),
  partnerIntegrated: readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8').includes('EnterpriseEngineSection'),
  analyticsIntegrated: readFileSync(join(websiteRoot, INTEGRATIONS[2]), 'utf8').includes('EnterpriseEngineSection'),
  afterAutomation: artistPanel.includes('AutomationEngineSection') && artistPanel.indexOf('EnterpriseEngineSection') > artistPanel.indexOf('AutomationEngineSection'),
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
  report.architecture.businessIntelligenceConsumer &&
  report.architecture.automationIntelligenceConsumer &&
  report.architecture.governanceEngine &&
  report.architecture.noDuplication &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.architecture.analyticsIntegrated &&
  report.architecture.afterAutomation &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-10-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
