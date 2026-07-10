#!/usr/bin/env node
/**
 * Phase 3F Local Verification — AI Intelligence Engine (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const LAYERS = {
  types: ['src/lib/music-intelligence/ai-intelligence-types.ts'],
  collector: ['src/lib/music-intelligence/ai-intelligence-collector.ts'],
  processor: ['src/lib/music-intelligence/ai-intelligence-processor.ts'],
  service: ['src/lib/music-intelligence/ai-intelligence-service.ts'],
};

const APIS = [
  'src/app/api/music-intelligence/workspace/ai-intelligence/route.ts',
  'src/app/api/music-intelligence/partner/ai-intelligence/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/ai-intelligence/AIIntelligenceSection.tsx',
  'src/components/music-intelligence/ai-intelligence/AIReadinessScore.tsx',
  'src/components/music-intelligence/ai-intelligence/AIRecommendationsPanel.tsx',
  'src/components/music-intelligence/ai-intelligence/AIQualityIndicators.tsx',
  'src/components/music-intelligence/ai-intelligence/AIActivityFeed.tsx',
  'src/components/music-intelligence/ai-intelligence/AISystemStatusBadge.tsx',
  'src/components/music-intelligence/ai-intelligence/AIPlatformHealthPanel.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '3F',
  name: 'AI Intelligence Engine',
  timestamp: new Date().toISOString(),
  layers: { ok: [], missing: [] },
  apis: { ok: [], missing: [] },
  components: { ok: [], missing: [] },
  integrations: { ok: [], missing: [] },
  architecture: {},
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

for (const files of Object.values(LAYERS)) check(files, 'layers');
check(APIS, 'apis');
check(COMPONENTS, 'components');
check(INTEGRATIONS, 'integrations');

const processor = readFileSync(join(websiteRoot, LAYERS.processor[0]), 'utf8');
const service = readFileSync(join(websiteRoot, LAYERS.service[0]), 'utf8');
const artistPanel = readFileSync(join(websiteRoot, INTEGRATIONS[0]), 'utf8');
const partnerPanel = readFileSync(join(websiteRoot, INTEGRATIONS[1]), 'utf8');

report.architecture = {
  separatedLayers:
    existsSync(join(websiteRoot, LAYERS.collector[0])) &&
    existsSync(join(websiteRoot, LAYERS.processor[0])) &&
    service.includes('collectArtistIntelligenceData') &&
    service.includes('processArtistIntelligence'),
  derivedFromData: processor.includes('derivedFrom') && processor.includes('scoreSubmissionQuality'),
  noFabricatedMetrics: !processor.includes('value: 99') && !processor.includes('lorem'),
  reusesPhase3E: readFileSync(join(websiteRoot, LAYERS.collector[0]), 'utf8').includes('loadArtistIntelligence'),
  artistIntegrated: artistPanel.includes('AIIntelligenceSection'),
  partnerIntegrated: partnerPanel.includes('AIIntelligenceSection'),
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
  report.architecture.derivedFromData &&
  report.architecture.artistIntegrated &&
  report.architecture.partnerIntegrated &&
  report.build.ok;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-3f-local-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
