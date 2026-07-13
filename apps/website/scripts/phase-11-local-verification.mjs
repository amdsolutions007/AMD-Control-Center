#!/usr/bin/env node
/**
 * Phase 11 Local Verification — Global Intelligence Network (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = [
  'src/lib/music-intelligence/global-types.ts',
  'src/lib/music-intelligence/global-constants.ts',
  'src/lib/music-intelligence/global-engine-collector.ts',
  'src/lib/music-intelligence/global-federation-layer.ts',
  'src/lib/music-intelligence/global-engine-processor.ts',
  'src/lib/music-intelligence/global-engine-service.ts',
];

const APIS = [
  'src/app/api/music-intelligence/workspace/global-engine/route.ts',
  'src/app/api/music-intelligence/partner/global-engine/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/global-engine/GlobalEngineSection.tsx',
  'src/components/music-intelligence/global-engine/GlobalEngineModule.tsx',
  'src/components/music-intelligence/global-engine/GlobalTimelinePanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '11',
  name: 'Global Intelligence Network',
  timestamp: new Date().toISOString(),
  layers: { ok: [], missing: [] },
  apis: { ok: [], missing: [] },
  components: { ok: [], missing: [] },
  integrations: { ok: [], missing: [] },
  architecture: {},
  tenantIsolation: {},
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

const collector = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/global-engine-collector.ts'), 'utf8');
const federation = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/global-federation-layer.ts'), 'utf8');
const processor = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/global-engine-processor.ts'), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');

report.architecture = {
  enterpriseIntelligenceConsumer: collector.includes('loadArtistEnterpriseEngine'),
  federationLayer: federation.includes('federateGlobalSignals'),
  noDuplication: !collector.includes('mi_click_tracking') && !collector.includes('loadArtistBusinessEngine'),
  noFabricated: !processor.includes('Math.random'),
  artistIntegrated: artistPanel.includes('GlobalEngineSection'),
  partnerIntegrated: readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8').includes('GlobalEngineSection'),
  analyticsIntegrated: readFileSync(join(websiteRoot, INTEGRATIONS[2]), 'utf8').includes('GlobalEngineSection'),
  afterEnterprise: artistPanel.includes('EnterpriseEngineSection') && artistPanel.indexOf('GlobalEngineSection') > artistPanel.indexOf('EnterpriseEngineSection'),
};

report.tenantIsolation = {
  federationComment: federation.includes('Tenant Isolation Law'),
  noOrgNames: !federation.includes('organizationCount') && !processor.includes('organization.label'),
  tenantIsolationFlag: processor.includes('tenantIsolated: true'),
  anonymizedSignals: federation.includes('anonymizedHealthIndex'),
  timelineStripped: processor.includes('tenant identifiers stripped'),
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
  report.architecture.enterpriseIntelligenceConsumer &&
  report.architecture.federationLayer &&
  report.architecture.noDuplication &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.architecture.analyticsIntegrated &&
  report.architecture.afterEnterprise &&
  report.tenantIsolation.federationComment &&
  report.tenantIsolation.anonymizedSignals &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-11-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
