#!/usr/bin/env node
/**
 * Phase 3C Infrastructure Discovery — read-only Supabase audit
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
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

const PHASE1_TABLES = [
  'mi_client_hubs', 'mi_genres', 'mi_subscription_plans', 'mi_hub_managers',
  'mi_artists', 'mi_tracks', 'mi_playlists', 'mi_playlist_tracks',
  'mi_user_profiles', 'mi_subscriptions', 'mi_user_playlists',
  'mi_smart_links', 'mi_click_tracking', 'mi_listening_history', 'mi_audience',
];

const PHASE3C_NEW = ['mi_artist_members', 'mi_music_submissions'];

async function tableExists(name) {
  const { error } = await supabase.from(name).select('*', { count: 'exact', head: true });
  if (!error) return { exists: true, error: null };
  if (error.code === '42P01' || error.message?.includes('does not exist')) return { exists: false, error: error.message };
  return { exists: true, error: error.message };
}

async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    supabaseProject: url,
    authentication: 'Supabase Auth (auth.users) + Phase 3B @supabase/ssr cookie sessions',
    tables: { existing: [], phase3cNew: [], missing: [] },
    storageBuckets: [],
    duplicatesFound: [],
    conflictsFound: [],
    reused: [],
    extended: [],
    newObjects: [],
  };

  for (const t of PHASE1_TABLES) {
    const r = await tableExists(t);
    if (r.exists) {
      report.tables.existing.push(t);
      report.reused.push(`table:${t}`);
    } else {
      report.tables.missing.push({ table: t, error: r.error });
    }
  }

  for (const t of PHASE3C_NEW) {
    const r = await tableExists(t);
    report.tables.phase3cNew.push({ table: t, existsBeforeMigration: r.exists });
    if (r.exists) report.duplicatesFound.push(`table:${t} already exists`);
  }

  report.extended = [
    'mi_user_profiles (trigger mi_handle_new_user — auto-create on signup)',
    'mi_artists (3 new RLS policies for artist self-service)',
  ];
  report.newObjects = [
    'table:mi_artist_members',
    'table:mi_music_submissions',
    'function:mi_handle_new_user (CREATE OR REPLACE)',
    'trigger:on_auth_user_created_mi_profile',
    'trigger:trg_mi_music_submissions_updated_at',
    'RLS: 8 policies on new tables + 3 on mi_artists',
  ];

  const buckets = ['mi-audio', 'mi-covers', 'mi-hub-assets'];
  for (const b of buckets) {
    const { data, error } = await supabase.storage.from(b).list('', { limit: 1 });
    report.storageBuckets.push({ bucket: b, accessible: !error, error: error?.message ?? null });
    if (!error) report.reused.push(`storage:${b}`);
  }

  const outPath = join(projectRoot, '.tmp_visual_verification/phase-3c-infrastructure-discovery.json');
  const { writeFileSync, mkdirSync } = await import('node:fs');
  mkdirSync(join(projectRoot, '.tmp_visual_verification'), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
