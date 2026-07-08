#!/usr/bin/env node
/**
 * Phase 3D Infrastructure Discovery — read-only Supabase audit
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
config({ path: join(websiteRoot, '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const PHASE3D_NEW = ['mi_partner_profiles', 'mi_partner_members', 'mi_partner_invites'];

async function tableExists(name) {
  const { error } = await supabase.from(name).select('*', { count: 'exact', head: true });
  if (!error) return { exists: true, error: null };
  if (error.code === '42P01' || error.message?.includes('does not exist')) return { exists: false, error: error.message };
  return { exists: true, error: error.message };
}

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    phase: '3D',
    supabaseProject: url,
    partnerTables: [],
    fallbackMode: false,
    routes: [
      '/music-intelligence/partner',
      '/music-intelligence/partner/profile',
      '/music-intelligence/partner/artists',
      '/music-intelligence/partner/submissions',
      '/music-intelligence/partner/analytics',
      '/music-intelligence/partner/notifications',
      '/music-intelligence/partner/settings',
    ],
    smartLinkActivation: 'Enterprise Partner Identity card only',
  };

  for (const t of PHASE3D_NEW) {
    const r = await tableExists(t);
    report.partnerTables.push({ table: t, exists: r.exists, error: r.error });
    if (!r.exists) report.fallbackMode = true;
  }

  const outPath = join(projectRoot, '.tmp_visual_verification/phase-3d-infrastructure-discovery.json');
  mkdirSync(join(projectRoot, '.tmp_visual_verification'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
