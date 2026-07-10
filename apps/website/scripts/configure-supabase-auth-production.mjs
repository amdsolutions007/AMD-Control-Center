#!/usr/bin/env node
/**
 * Apply Supabase Auth production URL configuration via Management API.
 * Requires SUPABASE_ACCESS_TOKEN in apps/website/.env.local
 * Does NOT modify application code.
 */
import { config } from 'dotenv';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
config({ path: join(websiteRoot, '.env.local') });

const PROJECT_REF = 'pjoijeligrgttimkqftk';
const PRODUCTION_ORIGIN = 'https://www.amdsolutions007.com';

const REDIRECT_ALLOW_LIST = [
  `${PRODUCTION_ORIGIN}/**`,
  `${PRODUCTION_ORIGIN}/music-intelligence/auth/callback`,
  `${PRODUCTION_ORIGIN}/music-intelligence/auth/callback/**`,
  `${PRODUCTION_ORIGIN}/music-intelligence/reset-password`,
  `${PRODUCTION_ORIGIN}/music-intelligence/verify-email`,
  `${PRODUCTION_ORIGIN}/music-intelligence/onboarding`,
  'http://localhost:3000/**',
  'http://localhost:3000/music-intelligence/auth/callback',
  'http://localhost:3000/music-intelligence/auth/callback/**',
  'http://localhost:3000/music-intelligence/reset-password',
].join(',');

const token = process.env.SUPABASE_ACCESS_TOKEN;
const apiBase = 'https://api.supabase.com/v1';

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return data;
}

async function main() {
  if (!token) {
    console.error('SUPABASE_ACCESS_TOKEN missing. Add to apps/website/.env.local or export before running.');
    console.error('Create token: https://supabase.com/dashboard/account/tokens');
    console.error('\nManual dashboard fix:');
    console.error(`  Site URL: ${PRODUCTION_ORIGIN}`);
    console.error(`  Redirect URLs: ${REDIRECT_ALLOW_LIST}`);
    process.exit(2);
  }

  const before = await api(`/projects/${PROJECT_REF}/config/auth`);
  const patch = {
    site_url: PRODUCTION_ORIGIN,
    uri_allow_list: REDIRECT_ALLOW_LIST,
  };
  const after = await api(`/projects/${PROJECT_REF}/config/auth`, { method: 'PATCH', body: patch });

  const report = {
    timestamp: new Date().toISOString(),
    projectRef: PROJECT_REF,
    productionOrigin: PRODUCTION_ORIGIN,
    before: {
      site_url: before.site_url,
      uri_allow_list: before.uri_allow_list,
    },
    after: {
      site_url: after.site_url,
      uri_allow_list: after.uri_allow_list,
    },
    success:
      after.site_url === PRODUCTION_ORIGIN &&
      String(after.uri_allow_list ?? '').includes(PRODUCTION_ORIGIN),
  };

  mkdirSync(join(projectRoot, '.tmp_visual_verification'), { recursive: true });
  writeFileSync(
    join(projectRoot, '.tmp_visual_verification/supabase-auth-production-config.json'),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
