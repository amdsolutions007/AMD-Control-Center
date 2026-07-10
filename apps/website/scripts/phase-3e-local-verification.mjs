#!/usr/bin/env node
/**
 * Phase 3E Local Verification — Intelligence Dashboard Foundation (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
const outDir = join(projectRoot, '.tmp_visual_verification');

const SERVICE_FILES = [
  'src/lib/music-intelligence/intelligence-service.ts',
  'src/lib/music-intelligence/intelligence-types.ts',
];

const API_ROUTES = [
  'src/app/api/music-intelligence/workspace/intelligence/route.ts',
  'src/app/api/music-intelligence/partner/intelligence/route.ts',
];

const COMPONENTS = [
  'src/components/music-intelligence/intelligence/IntelligenceDashboardSection.tsx',
  'src/components/music-intelligence/intelligence/IntelligenceWidgetGrid.tsx',
  'src/components/music-intelligence/intelligence/IntelligenceWidgetCard.tsx',
  'src/components/music-intelligence/intelligence/IntelligenceActivityFeed.tsx',
  'src/components/music-intelligence/intelligence/IntelligenceWidgetIcons.tsx',
];

const INTEGRATIONS = [
  'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx',
  'src/components/music-intelligence/partner-workspace/AnalyticsFoundationPanel.tsx',
];

const report = {
  phase: '3E',
  name: 'Intelligence Dashboard Foundation',
  timestamp: new Date().toISOString(),
  service: { ok: [], missing: [] },
  apis: { ok: [], missing: [] },
  components: { ok: [], missing: [] },
  integrations: { ok: [], missing: [] },
  build: null,
  middleware: null,
  rbac: null,
  sqlMigrations: 'none — reuses existing Phase 3C/3D tables',
  passed: false,
};

function check(list, bucket, root = websiteRoot) {
  for (const f of list) {
    const p = join(root, f);
    if (existsSync(p)) report[bucket].ok.push(f);
    else report[bucket].missing.push(f);
  }
}

check(SERVICE_FILES, 'service');
check(API_ROUTES, 'apis');
check(COMPONENTS, 'components');
check(INTEGRATIONS, 'integrations');

const artistPanel = readFileSync(
  join(websiteRoot, 'src/components/music-intelligence/workspace/ArtistDashboardPanel.tsx'),
  'utf8',
);
const partnerPanel = readFileSync(
  join(websiteRoot, 'src/components/music-intelligence/partner-workspace/PartnerDashboardPanel.tsx'),
  'utf8',
);
const intelligenceService = readFileSync(
  join(websiteRoot, 'src/lib/music-intelligence/intelligence-service.ts'),
  'utf8',
);

report.integrations.artistIntelligence = artistPanel.includes('IntelligenceDashboardSection');
report.integrations.partnerIntelligence = partnerPanel.includes('IntelligenceDashboardSection');
report.service.realQueries =
  intelligenceService.includes('count: \'exact\', head: true') &&
  intelligenceService.includes('mi_music_submissions') &&
  intelligenceService.includes('mi_partner_profiles');
report.service.noHardcodedMetrics = !intelligenceService.includes('value: 42') && !intelligenceService.includes('lorem');

const middleware = readFileSync(join(websiteRoot, 'middleware.ts'), 'utf8');
report.middleware = {
  partnerProtected: middleware.includes('/music-intelligence/partner'),
  accountProtected: middleware.includes('/music-intelligence/account'),
};

const workspaceAuth = readFileSync(
  join(websiteRoot, 'src/lib/music-intelligence/workspace-auth.ts'),
  'utf8',
);
const partnerAuth = readFileSync(
  join(websiteRoot, 'src/lib/music-intelligence/partner-auth.ts'),
  'utf8',
);
report.rbac = {
  artistRouteGuard: workspaceAuth.includes('requireArtistWorkspaceSession'),
  partnerRouteGuard: partnerAuth.includes('requirePartnerWorkspaceSession'),
};

const skipBuild = process.env.SKIP_BUILD === '1';
if (!skipBuild) {
  const build = spawnSync('npm', ['run', 'build'], { cwd: websiteRoot, encoding: 'utf8', shell: true });
  report.build = { exitCode: build.status, ok: build.status === 0 };
} else {
  report.build = { skipped: true, ok: true };
}

report.passed =
  report.service.missing.length === 0 &&
  report.apis.missing.length === 0 &&
  report.components.missing.length === 0 &&
  report.integrations.missing.length === 0 &&
  report.integrations.artistIntelligence &&
  report.integrations.partnerIntelligence &&
  report.service.realQueries &&
  report.build.ok &&
  report.middleware.partnerProtected &&
  report.middleware.accountProtected &&
  report.rbac.artistRouteGuard &&
  report.rbac.partnerRouteGuard;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'phase-3e-local-verification.json'), JSON.stringify(report, null, 2));

console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
