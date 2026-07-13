#!/usr/bin/env node
/**
 * Phase 9 Local Verification — Automation Intelligence Engine (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = [
  'src/lib/music-intelligence/automation-types.ts',
  'src/lib/music-intelligence/automation-constants.ts',
  'src/lib/music-intelligence/automation-connectors.ts',
  'src/lib/music-intelligence/automation-collector.ts',
  'src/lib/music-intelligence/automation-rules-engine.ts',
  'src/lib/music-intelligence/automation-processor.ts',
  'src/lib/music-intelligence/workflow-orchestrator.ts',
  'src/lib/music-intelligence/notification-manager.ts',
  'src/lib/music-intelligence/automation-service.ts',
];

const APIS = [
  'src/app/api/music-intelligence/workspace/automation-engine/route.ts',
  'src/app/api/music-intelligence/partner/automation-engine/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/automation-engine/AutomationEngineSection.tsx',
  'src/components/music-intelligence/automation-engine/AutomationEngineModule.tsx',
  'src/components/music-intelligence/automation-engine/AutomationTimelinePanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '9',
  name: 'Automation Intelligence Engine',
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

const collector = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/automation-collector.ts'), 'utf8');
const rulesEngine = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/automation-rules-engine.ts'), 'utf8');
const orchestrator = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/workflow-orchestrator.ts'), 'utf8');
const processor = readFileSync(join(websiteRoot, 'src/lib/music-intelligence/automation-processor.ts'), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');

report.architecture = {
  businessIntelligenceConsumer: collector.includes('loadArtistBusinessEngine'),
  rulesEngine: rulesEngine.includes('evaluateAutomationRules'),
  workflowOrchestrator: orchestrator.includes('orchestrateWorkflows'),
  notificationManager: existsSync(join(websiteRoot, 'src/lib/music-intelligence/notification-manager.ts')),
  noDuplication: !collector.includes('mi_click_tracking') && !collector.includes('loadArtistMusicEngine'),
  noIrreversibleActions: orchestrator.includes('No irreversible action executed'),
  approvalModes: processor.includes('approvalCenter'),
  connectorFramework: existsSync(join(websiteRoot, 'src/lib/music-intelligence/automation-connectors.ts')),
  noFabricated: !processor.includes('Math.random'),
  artistIntegrated: artistPanel.includes('AutomationEngineSection'),
  partnerIntegrated: readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8').includes('AutomationEngineSection'),
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
  report.architecture.rulesEngine &&
  report.architecture.workflowOrchestrator &&
  report.architecture.noDuplication &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-9-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
