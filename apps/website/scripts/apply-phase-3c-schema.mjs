#!/usr/bin/env node
/**
 * Apply Phase 3C migration using Supabase Management API (requires SUPABASE_ACCESS_TOKEN)
 * Fallback: documents manual apply path
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
config({ path: join(websiteRoot, '.env.local') });

const sqlPath = join(projectRoot, 'docs/amd-music-intelligence/sql/phase-3c-artist-workspace.sql');
const sql = readFileSync(sqlPath, 'utf8');
const projectRef = 'pjoijeligrgttimkqftk';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

async function applyViaManagementApi() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Management API ${res.status}: ${body.slice(0, 500)}`);
  return body;
}

async function verifyViaServiceRole() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const results = {};
  for (const t of ['mi_artist_members', 'mi_music_submissions']) {
    const { error } = await supabase.from(t).select('id').limit(1);
    results[t] = error ? { ok: false, message: error.message } : { ok: true };
  }
  return results;
}

async function main() {
  let applied = false;
  let applyError = null;

  if (accessToken) {
    try {
      await applyViaManagementApi();
      applied = true;
    } catch (e) {
      applyError = e.message;
    }
  } else {
    applyError = 'SUPABASE_ACCESS_TOKEN not set — cannot run Management API apply';
  }

  // Allow 2s for schema cache refresh
  await new Promise((r) => setTimeout(r, 2000));
  const verification = await verifyViaServiceRole();
  const success = verification.mi_artist_members?.ok && verification.mi_music_submissions?.ok;

  const report = {
    timestamp: new Date().toISOString(),
    applied,
    applyError,
    verification,
    success,
    sqlFile: sqlPath,
  };

  mkdirSync(join(projectRoot, '.tmp_visual_verification'), { recursive: true });
  writeFileSync(join(projectRoot, '.tmp_visual_verification/phase-3c-migration-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(success ? 0 : 1);
}

main();
