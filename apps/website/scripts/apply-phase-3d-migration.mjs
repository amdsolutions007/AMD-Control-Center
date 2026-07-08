#!/usr/bin/env node
/**
 * Apply Phase 3D migration via direct Postgres connection.
 * Requires SUPABASE_DB_URL or DATABASE_URL in apps/website/.env.local
 */
import { config } from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const websiteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = join(websiteRoot, '../..');
config({ path: join(websiteRoot, '.env.local') });

const sqlPath = join(projectRoot, 'docs/amd-music-intelligence/sql/phase-3d-partner-workspace.sql');
const sql = readFileSync(sqlPath, 'utf8');
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

const PARTNER_TABLES = ['mi_partner_profiles', 'mi_partner_members', 'mi_partner_invites'];

async function verifyTables(client) {
  const tables = {};
  for (const t of PARTNER_TABLES) {
    const r = await client.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) AS ok`,
      [t],
    );
    tables[t] = r.rows[0].ok;
  }
  const policies = await client.query(`
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY($1::text[])
    ORDER BY tablename, policyname
  `, [PARTNER_TABLES]);
  return { tables, policies: policies.rows };
}

async function main() {
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL or DATABASE_URL required.');
    process.exit(2);
  }

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const pre = await verifyTables(client);
  console.log('Pre-migration:', JSON.stringify(pre, null, 2));

  await client.query(sql);

  const post = await verifyTables(client);
  const report = {
    timestamp: new Date().toISOString(),
    phase: '3D',
    success: PARTNER_TABLES.every((t) => post.tables[t]),
    preMigration: pre,
    postMigration: post,
  };

  mkdirSync(join(projectRoot, '.tmp_visual_verification'), { recursive: true });
  writeFileSync(join(projectRoot, '.tmp_visual_verification/phase-3d-migration-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await client.end();
  process.exit(report.success ? 0 : 1);
}

main().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
