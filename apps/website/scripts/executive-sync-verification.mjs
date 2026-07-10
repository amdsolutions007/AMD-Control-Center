#!/usr/bin/env node
/**
 * Executive Production Verification — read-only audit
 * Outputs sanitized report to .tmp_visual_verification/
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
config({ path: join(projectRoot, '.env') });
config({ path: join(websiteRoot, '.env.local') });

const PROJECT_REF = 'pjoijeligrgttimkqftk';
const PRODUCTION_ORIGIN = 'https://www.amdsolutions007.com';
const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const report = {
  timestamp: new Date().toISOString(),
  supabaseAccessToken: { present: Boolean(token), verified: false },
  supabaseProject: { ref: PROJECT_REF, accessible: false },
  authConfig: null,
  phase3cTables: {},
  phase3dTables: {},
  vercelSiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
};

async function managementApi(path, { method = 'GET', body } = {}) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

async function tableExists(supabase, name) {
  const { error } = await supabase.from(name).select('*', { count: 'exact', head: true });
  if (!error) return { exists: true, error: null };
  if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache'))
    return { exists: false, error: error.message };
  return { exists: true, error: error.message };
}

async function main() {
  if (!token) {
    console.error('SUPABASE_ACCESS_TOKEN missing');
    process.exit(2);
  }

  try {
    const projects = await managementApi('/projects');
    const project = projects.find((p) => p.id === PROJECT_REF || p.ref === PROJECT_REF);
    report.supabaseAccessToken.verified = true;
    report.supabaseProject.accessible = Boolean(project);
    report.supabaseProject.name = project?.name ?? null;
    report.supabaseProject.region = project?.region ?? null;
  } catch (e) {
    report.supabaseAccessToken.error = e.message;
  }

  try {
    const auth = await managementApi(`/projects/${PROJECT_REF}/config/auth`);
    report.authConfig = {
      site_url: auth.site_url,
      uri_allow_list: auth.uri_allow_list,
      mailer_autoconfirm: auth.mailer_autoconfirm,
      external_email_enabled: auth.external_email_enabled,
      siteUrlMatchesProduction: auth.site_url === PRODUCTION_ORIGIN,
      productionInAllowList: String(auth.uri_allow_list ?? '').includes(PRODUCTION_ORIGIN),
      localhostInAllowList: String(auth.uri_allow_list ?? '').includes('localhost:3000'),
    };
  } catch (e) {
    report.authConfig = { error: e.message };
  }

  if (url && serviceKey) {
    const supabase = createClient(url, serviceKey);
    for (const t of ['mi_artist_members', 'mi_music_submissions']) {
      report.phase3cTables[t] = await tableExists(supabase, t);
    }
    for (const t of ['mi_partner_profiles', 'mi_partner_members', 'mi_partner_invites']) {
      report.phase3dTables[t] = await tableExists(supabase, t);
    }
  }

  mkdirSync(join(projectRoot, '.tmp_visual_verification'), { recursive: true });
  const out = join(projectRoot, '.tmp_visual_verification/executive-sync-verification.json');
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
