#!/usr/bin/env node
/**
 * Phase 3D Local Verification — route + module checks (no deploy)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');

const REQUIRED_FILES = [
  'src/app/music-intelligence/partner/page.tsx',
  'src/app/music-intelligence/partner/layout.tsx',
  'src/app/music-intelligence/partner/profile/page.tsx',
  'src/app/music-intelligence/partner/artists/page.tsx',
  'src/app/music-intelligence/partner/submissions/page.tsx',
  'src/app/music-intelligence/partner/analytics/page.tsx',
  'src/app/music-intelligence/partner/notifications/page.tsx',
  'src/app/music-intelligence/partner/settings/page.tsx',
  'src/lib/music-intelligence/partner-service.ts',
  'src/lib/music-intelligence/partner-auth.ts',
  'middleware.ts',
];

const REQUIRED_API = [
  'src/app/api/music-intelligence/partner/dashboard/route.ts',
  'src/app/api/music-intelligence/partner/profile/route.ts',
  'src/app/api/music-intelligence/partner/artists/route.ts',
  'src/app/api/music-intelligence/partner/submissions/route.ts',
  'src/app/api/music-intelligence/partner/notifications/route.ts',
  'src/app/api/music-intelligence/partner/settings/route.ts',
];

const report = {
  phase: '3D',
  timestamp: new Date().toISOString(),
  files: { ok: [], missing: [] },
  apis: { ok: [], missing: [] },
  build: null,
  lint: null,
  smartLink: null,
  middleware: null,
  passed: false,
};

for (const f of REQUIRED_FILES) {
  const p = join(websiteRoot, f);
  if (existsSync(p)) report.files.ok.push(f);
  else report.files.missing.push(f);
}

for (const f of REQUIRED_API) {
  const p = join(websiteRoot, f);
  if (existsSync(p)) report.apis.ok.push(f);
  else report.apis.missing.push(f);
}

const smartlink = readFileSync(join(websiteRoot, 'src/components/smartlink/SmartLinkActionButtons.tsx'), 'utf8');
report.smartLink = {
  enterprisePartnerActive: smartlink.includes("role=enterprise-partner', active: true"),
  artistStillActive: smartlink.includes("role=artist', active: true"),
};

const middleware = readFileSync(join(websiteRoot, 'middleware.ts'), 'utf8');
report.middleware = {
  partnerProtected: middleware.includes('/music-intelligence/partner'),
  accountStillProtected: middleware.includes('/music-intelligence/account'),
};

const build = spawnSync('npm', ['run', 'build'], { cwd: websiteRoot, encoding: 'utf8', shell: true });
report.build = { exitCode: build.status, ok: build.status === 0 };

const lint = spawnSync('npm', ['run', 'lint'], { cwd: websiteRoot, encoding: 'utf8', shell: true });
report.lint = { exitCode: lint.status, ok: lint.status === 0 };

report.passed =
  report.files.missing.length === 0 &&
  report.apis.missing.length === 0 &&
  report.build.ok &&
  report.smartLink.enterprisePartnerActive &&
  report.smartLink.artistStillActive &&
  report.middleware.partnerProtected &&
  report.middleware.accountStillProtected;

const outPath = join(projectRoot, '.tmp_visual_verification/phase-3d-local-verification.json');
writeReport(outPath, report);

function writeReport(path, data) {
  const { writeFileSync, mkdirSync } = require('node:fs');
  mkdirSync(join(projectRoot, '.tmp_visual_verification'), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.passed ? 0 : 1);
