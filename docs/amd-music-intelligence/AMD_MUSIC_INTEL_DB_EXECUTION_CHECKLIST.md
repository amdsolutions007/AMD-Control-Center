# AMD Music Intelligence — Database Execution Checklist

**Document Class:** Operational — Implementation Day  
**Version:** 1.0.0  
**Date:** June 23, 2026  
**Authority:** Platform Architect  
**References:**
- `AMD_MUSIC_INTEL_DATABASE_MASTER_BLUEPRINT.md`
- `AMD_MUSIC_INTEL_SUPABASE_MIGRATION_PLAN.md`
- `AMD_AGENT_007_DATA_ARCHITECTURE.md`

> This is the single document used on Database Implementation Day.
> Work through each section in order. Check every box before moving to the next section.
> If any item cannot be checked, STOP. Resolve before continuing.
> Record timestamps against each block completion.

---

## SESSION LOG

| Field | Value |
|---|---|
| Execution Date | _______________ |
| Start Time | _______________ |
| Executor Name | _______________ |
| Supabase Project URL | _______________ |
| Supabase Project Region | _______________ |
| Migration End Time | _______________ |
| Final Status | GO / ABORTED |

---

## SECTION 1 — PRE-EXECUTION CHECKLIST

Complete every item at least 1 hour before opening the Supabase SQL Editor.
Do not open the SQL Editor until this entire section is checked.

---

### 1.1 — Environment Readiness

- [ ] **Supabase dashboard accessible** — Log into Supabase. Confirm you can see the AMD Control Center project.
- [ ] **Supabase plan tier confirmed** — Navigate to Settings → Billing. Record the plan tier here: `__________`
- [ ] **pgvector availability confirmed** — Navigate to Database → Extensions. Confirm `vector` is available on this plan. YES / NO: `__________`
- [ ] **pg_cron availability confirmed** — Confirm `pg_cron` is available on this plan. YES / NO: `__________`
- [ ] **SQL Editor access confirmed** — Open SQL Editor in Supabase dashboard. Execute `SELECT 1;`. Confirm it returns `1`.
- [ ] **Service role key secured** — Confirm `SUPABASE_SERVICE_ROLE_KEY` is accessible in your `.env` file. Do NOT paste it anywhere public.
- [ ] **Anon key secured** — Confirm `NEXT_PUBLIC_SUPABASE_ANON_KEY` is accessible.
- [ ] **Supabase project URL confirmed** — Confirm `NEXT_PUBLIC_SUPABASE_URL` matches the dashboard URL.

---

### 1.2 — Existing B2B Systems Health Check

**Before touching the database, confirm all three live systems are operational.**

- [ ] **Telegram Approval Bot** — Check Railway dashboard for `telegram-approval-bot` service. Status must be `Active`. Record last successful daily fire timestamp: `__________`
- [ ] **RSS Signal Beacon** — Open `https://amd-signal-beacon.vercel.app/api/feed` in browser. Confirm HTTP 200 response in under 10 seconds. Confirm 1 item in feed. YES / NO: `__________`
- [ ] **WhatsApp Bot** — Check Railway dashboard for `amd-whatsapp-bot` / `ghost-writer-poster` service. Status must be `Active`.
- [ ] **B2B Website** — Open `https://amdsolutions007.com` (or local dev). Confirm it loads without errors.
- [ ] **Agent 007 Chat** — Send a test message to the ChatWidget. Confirm it responds. Confirm the response is logged in `chat_logs` table.

> If any B2B system is down, DO NOT proceed. The migration does not touch these systems,
> but you need a clean baseline to distinguish pre-existing issues from migration side effects.

---

### 1.3 — Existing Schema Backup

- [ ] **`clients` table exported** — In Supabase dashboard → Table Editor → `clients` → Export CSV. Save as `backup_clients_[DATE].csv`.
- [ ] **`chat_logs` table exported** — Export CSV. Save as `backup_chat_logs_[DATE].csv`.
- [ ] **`automation_runs` table exported** — Export CSV. Save as `backup_automation_runs_[DATE].csv`.
- [ ] **`portal_access` table exported** — Export CSV. Save as `backup_portal_access_[DATE].csv`.
- [ ] **Backup files saved to a location outside the repository** — Confirm backups are NOT inside `AMD_Control_Center/`.
- [ ] **Backup row counts verified:**
  - `clients`: `__________` rows
  - `chat_logs`: `__________` rows
  - `automation_runs`: `__________` rows
  - `portal_access`: `__________` rows

---

### 1.4 — Migration Plan Readiness

- [ ] **`AMD_MUSIC_INTEL_SUPABASE_MIGRATION_PLAN.md` is open and readable** — Confirm the file is accessible at `/docs/amd-music-intelligence/AMD_MUSIC_INTEL_SUPABASE_MIGRATION_PLAN.md`.
- [ ] **`AMD_MUSIC_INTEL_DATABASE_MASTER_BLUEPRINT.md` is open** — Available as reference during execution.
- [ ] **Migration log file created** — Create a plain text file named `migration_log_[DATE].txt`. This file will receive timestamps and status notes for each block.
- [ ] **pgvector fallback decision documented** — If pgvector is NOT available: the `embedding vector(1536)` column in Block 4B will be created as `embedding TEXT`. Note this decision in the migration log: `__________`
- [ ] **pg_cron fallback decision documented** — If pg_cron is NOT available: the `cron.schedule()` calls in Block 9 will be skipped and scheduled externally. Note: `__________`
- [ ] **Estimated completion time calculated** — 3–4 hours from Block 0. Expected end time: `__________`
- [ ] **No interruptions scheduled** — Confirm the executor has 4 uninterrupted hours available.

---

### 1.5 — Pre-Execution Sign-Off

**Do not proceed past this point until the sign-off is recorded.**

- [ ] All 1.1 items checked
- [ ] All 1.2 items checked (all B2B systems operational)
- [ ] All 1.3 items checked (backups complete)
- [ ] All 1.4 items checked (migration plan ready)

**Sign-off recorded at:** `__________` (timestamp)

---

## SECTION 2 — SUPABASE VERIFICATION CHECKLIST

Execute Block 0 of the Migration Plan. Do not proceed to Block 1 until all items pass.

---

### 2.1 — Block 0 Execution

Copy the Block 0 SQL from the Migration Plan exactly. Paste into SQL Editor. Execute.

```
Query 0.1: SELECT current_database(), current_schema(), version();
```
- [ ] Query executes without error
- [ ] Database name recorded: `__________`
- [ ] Schema is `public`: YES / NO: `__________`

```
Query 0.2: Existing B2B tables check
```
- [ ] Returns exactly **4 rows**: `clients`, `chat_logs`, `automation_runs`, `portal_access`
- [ ] If fewer than 4 rows returned: **STOP. Investigate before proceeding.**

```
Query 0.3: Clean slate check (mi_ tables)
```
- [ ] Returns exactly **0 rows**
- [ ] If any `mi_*` tables exist: **STOP. Review each one. Confirm they are safe to drop or that the migration should resume from a specific block.**

```
Query 0.4: update_updated_at_column() function check
```
- [ ] Returns **1 row** (function exists)
- [ ] If 0 rows: Note that Block 9 must create this function from scratch. Record: `__________`

---

### 2.2 — Block 0 Pass/Fail

- [ ] **Block 0: PASSED** — All 4 queries returned expected results. Record timestamp: `__________`
- [ ] Block 0 output saved to migration log

> ❌ If Block 0 fails any check: DO NOT proceed to Block 1.
> Resolve the discrepancy. Re-run Block 0. Only proceed when it passes cleanly.

---

## SECTION 3 — MIGRATION EXECUTION CHECKLIST

Work through each block in strict order. Check each item only after the SQL executes without errors and the verification query confirms the expected result.

---

### Block 1 — Extensions

**SQL Location:** Migration Plan → Block 1

- [ ] `CREATE EXTENSION IF NOT EXISTS vector;` — executed without error
- [ ] `CREATE EXTENSION IF NOT EXISTS pg_cron;` — executed without error (or skipped with fallback noted)
- [ ] `CREATE EXTENSION IF NOT EXISTS pg_trgm;` — executed without error
- [ ] Verification query returns **3 rows** for `vector`, `pg_cron`, `pg_trgm`
  - If pgvector unavailable: 2 rows minimum (`pg_cron`, `pg_trgm`). Fallback documented.
  - If pg_cron unavailable: 2 rows minimum (`vector`, `pg_trgm`). Fallback documented.

**Block 1 completion timestamp:** `__________`

---

### Block 2 — Foundation Tables

**SQL Location:** Migration Plan → Block 2 (A, B, C)

#### Block 2A — `mi_client_hubs`
- [ ] `CREATE TABLE mi_client_hubs` — executes without error
- [ ] 3 indexes created: `idx_mi_client_hubs_slug`, `idx_mi_client_hubs_active`, `idx_mi_client_hubs_created`
- [ ] `ALTER TABLE mi_client_hubs ENABLE ROW LEVEL SECURITY` — executed

#### Block 2B — `mi_genres`
- [ ] `CREATE TABLE mi_genres` — executes without error
- [ ] 2 indexes created: `idx_mi_genres_parent`, `idx_mi_genres_name`
- [ ] `ALTER TABLE mi_genres ENABLE ROW LEVEL SECURITY` — executed

#### Block 2C — `mi_subscription_plans`
- [ ] `CREATE TABLE mi_subscription_plans` — executes without error
- [ ] 2 indexes created: `idx_mi_sub_plans_slug`, `idx_mi_sub_plans_active`
- [ ] `ALTER TABLE mi_subscription_plans ENABLE ROW LEVEL SECURITY` — executed

#### Block 2 Verification
- [ ] Column count verification query returns:
  - `mi_client_hubs`: **12 columns**
  - `mi_genres`: **6 columns**
  - `mi_subscription_plans`: **13 columns**

**Block 2 completion timestamp:** `__________`

---

### Block 3 — Security Keystone

**SQL Location:** Migration Plan → Block 3

- [ ] `CREATE TABLE mi_hub_managers` — executes without error
  - Contains: `id`, `user_id`, `hub_id`, `role`, `invited_by`, `accepted_at`, `created_at`
  - FK to `auth.users(id) ON DELETE CASCADE` — confirmed in DDL
  - FK to `mi_client_hubs(id) ON DELETE CASCADE` — confirmed in DDL
  - CHECK constraint `role IN ('owner','editor','viewer')` — confirmed in DDL
  - UNIQUE constraint `(user_id, hub_id)` — confirmed in DDL
- [ ] 3 indexes created: `idx_mi_hub_managers_user`, `idx_mi_hub_managers_hub`, `idx_mi_hub_managers_composite`
- [ ] `ALTER TABLE mi_hub_managers ENABLE ROW LEVEL SECURITY` — executed
- [ ] Verification query returns **7 rows** for `mi_hub_managers` columns

> ⚠️ This is the most critical table in the schema. If it fails, STOP and diagnose
> before proceeding. Every multi-tenant RLS policy depends on this table existing correctly.

**Block 3 completion timestamp:** `__________`

---

### Block 4 — Content Layer

**SQL Location:** Migration Plan → Block 4 (A, B, C, D)

#### Block 4A — `mi_artists`
- [ ] `CREATE TABLE mi_artists` — executes without error
- [ ] UNIQUE constraint `(hub_id, slug)` — confirmed in DDL
- [ ] 3 indexes created: `idx_mi_artists_hub_id`, `idx_mi_artists_active`, `idx_mi_artists_name`
- [ ] `ALTER TABLE mi_artists ENABLE ROW LEVEL SECURITY` — executed

#### Block 4B — `mi_tracks`
- [ ] `CREATE TABLE mi_tracks` — executes without error
- [ ] `embedding vector(1536)` column created (or `embedding TEXT` if pgvector unavailable — note which): `__________`
- [ ] CHECK constraint on `bpm BETWEEN 40 AND 220` — confirmed in DDL
- [ ] CHECK constraint on `energy_level BETWEEN 1 AND 10` — confirmed in DDL
- [ ] UNIQUE constraint `(hub_id, slug)` — confirmed in DDL
- [ ] 10 indexes created (confirm all names starting with `idx_mi_tracks_` appear in `pg_indexes`)
- [ ] HNSW embedding index **skipped** in Phase 1 (commented out) — confirmed
- [ ] `ALTER TABLE mi_tracks ENABLE ROW LEVEL SECURITY` — executed

#### Block 4C — `mi_playlists`
- [ ] `CREATE TABLE mi_playlists` — executes without error
- [ ] UNIQUE constraint `(hub_id, slug)` — confirmed in DDL
- [ ] 3 indexes created: `idx_mi_playlists_hub_id`, `idx_mi_playlists_featured`, `idx_mi_playlists_active`
- [ ] `ALTER TABLE mi_playlists ENABLE ROW LEVEL SECURITY` — executed

#### Block 4D — `mi_playlist_tracks`
- [ ] `CREATE TABLE mi_playlist_tracks` — executes without error
- [ ] COMPOSITE PRIMARY KEY `(playlist_id, track_id)` — confirmed in DDL
- [ ] UNIQUE constraint `(playlist_id, position)` — confirmed in DDL
- [ ] ON DELETE CASCADE on both FKs — confirmed in DDL
- [ ] 2 indexes created: `idx_mi_pt_playlist_id`, `idx_mi_pt_track_id`
- [ ] `ALTER TABLE mi_playlist_tracks ENABLE ROW LEVEL SECURITY` — executed

**Block 4 completion timestamp:** `__________`

---

### Block 5 — User & Subscription Layer

**SQL Location:** Migration Plan → Block 5 (A, B, C)

#### Block 5A — `mi_user_profiles`
- [ ] `CREATE TABLE mi_user_profiles` — executes without error
- [ ] PK is `id UUID REFERENCES auth.users(id) ON DELETE CASCADE` — confirmed (1:1 extension table, no separate UUID)
- [ ] CHECK constraint on `subscription_status IN (...)` — confirmed in DDL
- [ ] 3 indexes created: `idx_mi_user_profiles_plan`, `idx_mi_user_profiles_status`, `idx_mi_user_profiles_paystack`
- [ ] `ALTER TABLE mi_user_profiles ENABLE ROW LEVEL SECURITY` — executed

#### Block 5B — `mi_subscriptions`
- [ ] `CREATE TABLE mi_subscriptions` — executes without error
- [ ] `paystack_reference TEXT UNIQUE NOT NULL` — confirmed in DDL
- [ ] CHECK constraint on `status IN ('active','cancelled','expired','failed')` — confirmed in DDL
- [ ] 4 indexes created: `idx_mi_subs_user_id`, `idx_mi_subs_status`, `idx_mi_subs_created`, `idx_mi_subs_ref`
- [ ] `ALTER TABLE mi_subscriptions ENABLE ROW LEVEL SECURITY` — executed

#### Block 5C — `mi_user_playlists`
- [ ] `CREATE TABLE mi_user_playlists` — executes without error
- [ ] FK `user_id REFERENCES auth.users(id) ON DELETE CASCADE` — confirmed in DDL
- [ ] 2 indexes created: `idx_mi_user_playlists_user`, `idx_mi_user_playlists_public`
- [ ] `ALTER TABLE mi_user_playlists ENABLE ROW LEVEL SECURITY` — executed

**Block 5 completion timestamp:** `__________`

---

### Block 6 — Linking Layer

**SQL Location:** Migration Plan → Block 6

- [ ] `CREATE TABLE mi_smart_links` — executes without error
- [ ] `short_code TEXT UNIQUE NOT NULL` — confirmed in DDL
- [ ] CHECK constraint on `destination_type IN ('track','playlist','artist','hub')` — confirmed in DDL
- [ ] All 3 FK references nullable (`artist_id`, `track_id`, `playlist_id`) — confirmed
- [ ] 4 indexes created: `idx_mi_smart_links_code`, `idx_mi_smart_links_hub_id`, `idx_mi_smart_links_track_id`, `idx_mi_smart_links_active`
- [ ] `ALTER TABLE mi_smart_links ENABLE ROW LEVEL SECURITY` — executed

**Block 6 completion timestamp:** `__________`

---

### Block 7 — Analytics Layer

**SQL Location:** Migration Plan → Block 7 (A, B, C)

#### Block 7A — `mi_click_tracking` (PARTITIONED)
- [ ] `CREATE TABLE mi_click_tracking ... PARTITION BY RANGE (created_at)` — executes without error
- [ ] Note: This table has NO primary key defined at parent level (partitioned tables require PK per partition). Confirm this is expected behaviour. YES / NO: `__________`
- [ ] CHECK constraint on `destination_dsp IN (...)` — confirmed in DDL
- [ ] Partition `mi_click_tracking_2026_06` created — confirmed
- [ ] Partition `mi_click_tracking_2026_07` created — confirmed
- [ ] Partition `mi_click_tracking_2026_08` created — confirmed
- [ ] 8 indexes created on parent table (confirm names starting with `idx_mi_ct_` exist)
- [ ] `ALTER TABLE mi_click_tracking ENABLE ROW LEVEL SECURITY` — executed

#### Block 7B — `mi_listening_history`
- [ ] `CREATE TABLE mi_listening_history` — executes without error
- [ ] `user_id REFERENCES auth.users(id) ON DELETE SET NULL` — confirmed (nullable, anonymous users allowed)
- [ ] `hub_id NOT NULL` — confirmed
- [ ] `track_id NOT NULL` — confirmed
- [ ] `session_id NOT NULL` — confirmed
- [ ] 6 indexes created: `idx_mi_lh_hub_id`, `idx_mi_lh_track_id`, `idx_mi_lh_user_id`, `idx_mi_lh_session`, `idx_mi_lh_created`, `idx_mi_lh_track_complete`
- [ ] `ALTER TABLE mi_listening_history ENABLE ROW LEVEL SECURITY` — executed

#### Block 7C — `mi_audience`
- [ ] `CREATE TABLE mi_audience` — executes without error
- [ ] `consent_timestamp TIMESTAMPTZ NOT NULL` — confirmed (LEGAL REQUIREMENT)
- [ ] `consent_text_version TEXT NOT NULL` — confirmed (LEGAL REQUIREMENT)
- [ ] `consent_ip_hash TEXT NOT NULL` — confirmed (LEGAL REQUIREMENT)
- [ ] CHECK constraint `mi_audience_contact_required` (at least one of email/whatsapp/telegram) — confirmed in DDL
- [ ] email CHECK regex constraint — confirmed in DDL
- [ ] 5 indexes created (including 2 partial indexes for email and whatsapp)
- [ ] `ALTER TABLE mi_audience ENABLE ROW LEVEL SECURITY` — executed

**Block 7 completion timestamp:** `__________`

---

### Block 8 — Extend Existing Tables (chat_logs)

**SQL Location:** Migration Plan → Block 8

> ⚠️ This block modifies a live production table. Execute carefully.

- [ ] **Row count captured BEFORE Block 8:** `SELECT COUNT(*) FROM chat_logs;` → Result: `__________`
- [ ] `ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS agent_mode` — executes without error
- [ ] `ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS hub_id` — executes without error
- [ ] `ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS music_context` — executes without error
- [ ] `ALTER TABLE chat_logs ADD COLUMN IF NOT EXISTS user_id` — executes without error
- [ ] 3 new indexes created: `idx_chat_logs_agent_mode`, `idx_chat_logs_hub_id`, `idx_chat_logs_user_id`
- [ ] **Row count captured AFTER Block 8:** `SELECT COUNT(*) FROM chat_logs;` → Result: `__________`
- [ ] **Row counts match** (no rows added or removed): YES / NO: `__________`
- [ ] Verification query: `SELECT session_id, agent_mode, hub_id FROM chat_logs LIMIT 5;`
  - Existing rows show `agent_mode = 'corporate'`: YES / NO: `__________`
  - Existing rows show `hub_id = NULL`: YES / NO: `__________`

> ❌ If row counts don't match or existing data shows unexpected values: STOP. Roll back Block 8 only using:
> `ALTER TABLE chat_logs DROP COLUMN IF EXISTS agent_mode, DROP COLUMN IF EXISTS hub_id, DROP COLUMN IF EXISTS music_context, DROP COLUMN IF EXISTS user_id;`

**Block 8 completion timestamp:** `__________`

---

### Block 9 — Functions & Triggers

**SQL Location:** Migration Plan → Block 9 (A through I)

#### Security Functions (Execute First)
- [ ] **Block 9A:** `mi_is_hub_manager()` — SECURITY DEFINER function created without error
- [ ] **Block 9B:** `mi_get_hub_role()` — SECURITY DEFINER function created without error

#### Counter & Utility Functions
- [ ] **Block 9C:** `mi_generate_short_code()` — function created without error
  - Test: `SELECT mi_generate_short_code();` — returns 6-character alphanumeric string: `__________`
- [ ] **Block 9D:** `mi_increment_play_count()` — function created without error
- [ ] **Block 9E:** `mi_increment_completion_count()` — function created without error
- [ ] **Block 9F:** `mi_increment_skip_count()` — function created without error
- [ ] **Block 9G:** `mi_increment_smart_link_clicks()` trigger function — created without error

#### Triggers
- [ ] Trigger `trg_mi_increment_smart_link_clicks` attached to `mi_click_tracking` — confirmed
- [ ] **Block 9H:** `mi_reset_daily_skip_counts()` — function created without error

#### Cron Schedules
- [ ] **`mi-daily-skip-reset` cron registered** (if pg_cron available) — or noted as external fallback: `__________`
- [ ] **`mi-agent007-context-refresh` cron registered** (if pg_cron available) — or noted as external fallback: `__________`

#### updated_at Triggers — Block 9I
- [ ] `trg_mi_client_hubs_updated_at` — created
- [ ] `trg_mi_artists_updated_at` — created
- [ ] `trg_mi_tracks_updated_at` — created
- [ ] `trg_mi_playlists_updated_at` — created
- [ ] `trg_mi_smart_links_updated_at` — created
- [ ] `trg_mi_user_profiles_updated_at` — created
- [ ] `trg_mi_user_playlists_updated_at` — created

**Block 9 completion timestamp:** `__________`

---

### Block 10 — Views & Materialised Views

**SQL Location:** Migration Plan → Block 10

- [ ] **Block 10A:** `mi_track_performance` VIEW — created without error
- [ ] **Block 10B:** `mi_artist_performance` VIEW — created without error
- [ ] **Block 10C:** `mi_hub_performance` VIEW — created without error
- [ ] **Block 10D:** `mi_smart_link_performance` VIEW — created without error
- [ ] **Block 10E:** `mi_audience_growth` VIEW — created without error
- [ ] **Block 10F:** `mi_discovery_leaderboard` VIEW — created without error
- [ ] **Block 10G:** `mi_subscription_revenue` VIEW — created without error
- [ ] **Block 10H:** `mi_agent007_context` MATERIALISED VIEW — created without error
  - 2 indexes on materialised view: `idx_mi_agent007_context_hub`, `idx_mi_agent007_context_mood` — created
  - Cron for `REFRESH MATERIALIZED VIEW CONCURRENTLY mi_agent007_context` registered (or fallback noted)

**Block 10 completion timestamp:** `__________`

---

### Block 11 — Row Level Security

**SQL Location:** Migration Plan → Block 11

> ⚠️ Block 11 is executed as a single transaction (BEGIN ... COMMIT).
> If any policy creation fails, the entire block rolls back automatically.
> Re-examine the failing policy before re-running.

- [ ] `BEGIN;` — executed
- [ ] All `mi_client_hubs` policies (3) — created without error
- [ ] All `mi_genres` policies (2) — created without error
- [ ] All `mi_subscription_plans` policies (2) — created without error
- [ ] All `mi_hub_managers` policies (4) — created without error
- [ ] All `mi_artists` policies (4) — created without error
- [ ] All `mi_tracks` policies (4) — created without error
- [ ] All `mi_playlists` policies (2) — created without error
- [ ] All `mi_playlist_tracks` policies (2) — created without error
- [ ] All `mi_user_profiles` policies (3) — created without error
- [ ] All `mi_subscriptions` policies (2) — created without error
- [ ] All `mi_user_playlists` policies (2) — created without error
- [ ] All `mi_smart_links` policies (2) — created without error
- [ ] All `mi_click_tracking` policies (3) — created without error
- [ ] All `mi_listening_history` policies (3) — created without error
- [ ] All `mi_audience` policies (4) — created without error
- [ ] `COMMIT;` — executed successfully

**Block 11 completion timestamp:** `__________`

---

### Block 12 — Storage Buckets

**SQL Location:** Migration Plan → Block 12

> Storage buckets are created via Supabase Dashboard → Storage, not SQL Editor.

#### Bucket: `mi-audio`
- [ ] Bucket `mi-audio` created in Supabase Storage dashboard
- [ ] Visibility set to **PRIVATE** — CONFIRMED. (This is non-negotiable. A public audio bucket is a security violation.)
- [ ] Max file size set to **50MB**
- [ ] Allowed MIME types set: `audio/mpeg, audio/wav, audio/flac, audio/aac, audio/ogg`

#### Bucket: `mi-covers`
- [ ] Bucket `mi-covers` created in Supabase Storage dashboard
- [ ] Visibility set to **PUBLIC**
- [ ] Max file size set to **5MB**
- [ ] Allowed MIME types set: `image/webp, image/jpeg, image/png`

#### Bucket: `mi-hub-assets`
- [ ] Bucket `mi-hub-assets` created in Supabase Storage dashboard
- [ ] Visibility set to **PUBLIC**
- [ ] Max file size set to **10MB**
- [ ] Allowed MIME types set: `image/webp, image/jpeg, image/png, image/svg+xml`

#### Storage RLS (SQL Editor)
- [ ] Storage RLS for `mi-audio` (Block 12 Step 12.4) — executed without error
- [ ] Storage RLS for `mi-covers` and `mi-hub-assets` (Block 12 Step 12.5) — executed without error

**Block 12 completion timestamp:** `__________`

---

### Block 13 — Seed Data

**SQL Location:** Migration Plan → Block 13

- [ ] **Block 13A:** Genre seed data — 17 genres inserted into `mi_genres`
  - Confirm: `SELECT COUNT(*) FROM mi_genres;` → Expected: **17** → Actual: `__________`
- [ ] **Block 13B:** Subscription plans — 3 plans inserted into `mi_subscription_plans`
  - Confirm: `SELECT name, price_ngn, slug FROM mi_subscription_plans ORDER BY sort_order;`
  - Free (₦0), Premium (₦1500), Studio (₦5000) — all present: YES / NO: `__________`
- [ ] **Block 13C:** Chrome Music Hub inserted into `mi_client_hubs`
  - Confirm: `SELECT id, name, slug, brand_color FROM mi_client_hubs;`
  - Name = `Chrome Music`, Slug = `chrome`: YES / NO: `__________`
  - Record Chrome Hub UUID: `__________` ← **SAVE THIS. Required for future operations.**
- [ ] **Block 13D:** VaB inserted into `mi_artists`
  - Confirm: `SELECT id, name, slug, hub_id FROM mi_artists;`
  - Name = `VaB`, Slug = `vab`: YES / NO: `__________`
  - Record VaB Artist UUID: `__________` ← **SAVE THIS.**
- [ ] **Block 13E:** Chrome AfroFusion Radio inserted into `mi_playlists`
  - Confirm: `SELECT id, name, slug, is_featured FROM mi_playlists;`
  - Name = `Chrome AfroFusion Radio`, `is_featured = true`: YES / NO: `__________`
  - Record Playlist UUID: `__________` ← **SAVE THIS.**

**Block 13 completion timestamp:** `__________`

---

## SECTION 4 — POST-MIGRATION VERIFICATION CHECKLIST

Execute every verification query from Block 14 of the Migration Plan. Record actual vs expected results.

---

### 4.1 — Structure Verification

| Query | Expected | Actual | Pass? |
|---|---|---|---|
| `mi_*` table count | 14 | `__________` | YES / NO |
| `mi_*` view count | 7 | `__________` | YES / NO |
| Materialised view count (`pg_matviews`) | ≥ 1 | `__________` | YES / NO |
| Tables with RLS disabled | 0 | `__________` | YES / NO |

- [ ] All 4 structure queries pass

### 4.2 — Seed Data Verification

| Query | Expected | Actual | Pass? |
|---|---|---|---|
| `SELECT COUNT(*) FROM mi_genres` | ≥ 17 | `__________` | YES / NO |
| `SELECT COUNT(*) FROM mi_subscription_plans` | 3 | `__________` | YES / NO |
| `SELECT COUNT(*) FROM mi_client_hubs` | 1 (Chrome) | `__________` | YES / NO |
| `SELECT COUNT(*) FROM mi_artists` | 1 (VaB) | `__________` | YES / NO |
| `SELECT COUNT(*) FROM mi_playlists` | 1 (Chrome AFR) | `__________` | YES / NO |

- [ ] All 5 seed data queries pass

### 4.3 — Function Verification

- [ ] `SELECT mi_generate_short_code();` — returns 6-character string: `__________`
- [ ] `SELECT mi_is_hub_manager(gen_random_uuid());` — returns `false` without error (expected — no managers yet)
- [ ] `SELECT mi_get_hub_role(gen_random_uuid());` — returns `NULL` without error (expected — no managers yet)

### 4.4 — chat_logs Extension Verification

| Query | Expected | Actual | Pass? |
|---|---|---|---|
| New columns in chat_logs | 4 (agent_mode, hub_id, music_context, user_id) | `__________` | YES / NO |
| Existing chat_logs row count | Same as pre-migration backup | `__________` | YES / NO |

- [ ] Both chat_logs queries pass

### 4.5 — Partition Verification

- [ ] `SELECT schemaname, tablename FROM pg_tables WHERE tablename LIKE 'mi_click_tracking_%';`
  - Expected: ≥ 3 rows (2026_06, 2026_07, 2026_08): Actual: `__________`

### 4.6 — Cron Job Verification

- [ ] `SELECT jobname FROM cron.job WHERE jobname LIKE 'mi-%';` (if pg_cron available)
  - Expected: 2 rows (`mi-daily-skip-reset`, `mi-agent007-context-refresh`)
  - Actual: `__________`
  - If pg_cron unavailable: external cron alternatives documented: YES / NO: `__________`

### 4.7 — Storage Bucket Verification

- [ ] Supabase Dashboard → Storage → Buckets — confirm 3 buckets visible: `mi-audio`, `mi-covers`, `mi-hub-assets`
- [ ] `mi-audio` bucket shows **PRIVATE** badge: YES / NO: `__________`
- [ ] `mi-covers` bucket shows **PUBLIC** badge: YES / NO: `__________`
- [ ] `mi-hub-assets` bucket shows **PUBLIC** badge: YES / NO: `__________`

### 4.8 — B2B System Re-Verification

After migration, confirm no B2B system was disrupted.

- [ ] `SELECT COUNT(*) FROM clients;` — matches pre-migration backup count: YES / NO: `__________`
- [ ] `SELECT COUNT(*) FROM automation_runs;` — matches pre-migration backup count: YES / NO: `__________`
- [ ] `SELECT COUNT(*) FROM portal_access;` — matches pre-migration backup count: YES / NO: `__________`
- [ ] `portal_access` seed row for `AMD-007-VIP` still present: `SELECT access_id FROM portal_access WHERE access_id = 'AMD-007-VIP';` → 1 row: YES / NO: `__________`
- [ ] Send a test message to Agent 007 ChatWidget — confirm it still responds in `corporate` mode: YES / NO: `__________`

### 4.9 — Agent 007 Music Intelligence Context Verification

- [ ] `SELECT COUNT(*) FROM mi_agent007_context;` — returns **0** (materialised view is populated but empty until tracks are added — this is expected)
- [ ] Query executes without error: YES / NO: `__________`

### 4.10 — RLS Sanity Test

Using the Supabase anon key (not service role), attempt the following:

- [ ] Anonymous SELECT on `mi_client_hubs` — returns Chrome Music Hub (is_active = true). PASS / FAIL: `__________`
- [ ] Anonymous SELECT on `mi_genres` — returns genre list. PASS / FAIL: `__________`
- [ ] Anonymous SELECT on `mi_click_tracking` — returns **empty** (no rows yet, but query should not error). PASS / FAIL: `__________`
- [ ] Anonymous SELECT on `mi_audience` — returns **empty** (query should not error, no rows inserted yet). PASS / FAIL: `__________`
- [ ] Anonymous SELECT on `mi_hub_managers` — returns **empty** (no records yet). PASS / FAIL: `__________`

---

### 4.11 — Post-Migration Sign-Off

- [ ] All Section 4.1 through 4.10 items checked
- [ ] All critical items (YES/PASS) confirmed
- [ ] Migration log file completed with all timestamps
- [ ] Chrome Hub UUID saved: `__________`
- [ ] VaB Artist UUID saved: `__________`
- [ ] Chrome AfroFusion Radio Playlist UUID saved: `__________`
- [ ] AMD_MUSIC_INTEL_INTERACTION_MEMORY_LOG.md updated with migration completion entry

**Post-Migration Sign-Off recorded at:** `__________` (timestamp)

---

## SECTION 5 — ROLLBACK EMERGENCY CHECKLIST

Use this section ONLY if a catastrophic failure occurs that cannot be resolved by fixing and re-running the failing block.

> ⚠️ ROLLBACK DESTROYS ALL MUSIC INTELLIGENCE WORK.
> B2B tables (clients, chat_logs, automation_runs, portal_access) will be unaffected.
> Only execute rollback if the migration cannot be recovered from the point of failure.

---

### 5.1 — Rollback Decision Gate

Before executing any rollback SQL, answer all three questions:

1. Can the failing block be fixed and re-run without rollback? YES / NO: `__________`
2. Does the failure affect any B2B system (Telegram bot, WhatsApp bot, RSS, Agent 007)? YES / NO: `__________`
3. Has the issue been diagnosed and confirmed unrecoverable? YES / NO: `__________`

**Rollback requires: Q1 = NO, Q2 = NO or YES (to protect B2B), Q3 = YES**

- [ ] Rollback decision confirmed. Reason documented in migration log: `__________`

---

### 5.2 — Rollback Execution Order

Execute the rollback SQL from the Migration Plan → Rollback Strategy section in this precise order:

**Step R1 — Drop Views**
- [ ] `DROP MATERIALIZED VIEW IF EXISTS mi_agent007_context;` — executed
- [ ] `DROP VIEW IF EXISTS mi_subscription_revenue;` — executed
- [ ] `DROP VIEW IF EXISTS mi_discovery_leaderboard;` — executed
- [ ] `DROP VIEW IF EXISTS mi_audience_growth;` — executed
- [ ] `DROP VIEW IF EXISTS mi_smart_link_performance;` — executed
- [ ] `DROP VIEW IF EXISTS mi_hub_performance;` — executed
- [ ] `DROP VIEW IF EXISTS mi_artist_performance;` — executed
- [ ] `DROP VIEW IF EXISTS mi_track_performance;` — executed

**Step R2 — Drop Analytics Tables (Tier 4)**
- [ ] `DROP TABLE IF EXISTS mi_listening_history CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_click_tracking CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_audience CASCADE;` — executed

**Step R3 — Drop Linking Table (Tier 5)**
- [ ] `DROP TABLE IF EXISTS mi_smart_links CASCADE;` — executed

**Step R4 — Drop User & Subscription Tables (Tier 3)**
- [ ] `DROP TABLE IF EXISTS mi_user_playlists CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_subscriptions CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_user_profiles CASCADE;` — executed

**Step R5 — Drop Content Tables (Tier 2)**
- [ ] `DROP TABLE IF EXISTS mi_playlist_tracks CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_playlists CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_tracks CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_artists CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_hub_managers CASCADE;` — executed

**Step R6 — Drop Foundation Tables (Tier 1)**
- [ ] `DROP TABLE IF EXISTS mi_subscription_plans CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_genres CASCADE;` — executed
- [ ] `DROP TABLE IF EXISTS mi_client_hubs CASCADE;` — executed

**Step R7 — Drop Functions**
- [ ] `DROP FUNCTION IF EXISTS mi_is_hub_manager(UUID);` — executed
- [ ] `DROP FUNCTION IF EXISTS mi_get_hub_role(UUID);` — executed
- [ ] `DROP FUNCTION IF EXISTS mi_generate_short_code();` — executed
- [ ] `DROP FUNCTION IF EXISTS mi_increment_play_count(UUID);` — executed
- [ ] `DROP FUNCTION IF EXISTS mi_increment_completion_count(UUID);` — executed
- [ ] `DROP FUNCTION IF EXISTS mi_increment_skip_count(UUID);` — executed
- [ ] `DROP FUNCTION IF EXISTS mi_increment_smart_link_clicks();` — executed
- [ ] `DROP FUNCTION IF EXISTS mi_reset_daily_skip_counts();` — executed

**Step R8 — Reverse chat_logs Extension (ONLY if Block 8 was executed)**
- [ ] Was Block 8 executed before the failure? YES / NO: `__________`
- [ ] If YES: `ALTER TABLE chat_logs DROP COLUMN IF EXISTS agent_mode, DROP COLUMN IF EXISTS hub_id, DROP COLUMN IF EXISTS music_context, DROP COLUMN IF EXISTS user_id;` — executed
- [ ] Confirm chat_logs row count still matches pre-migration backup: YES / NO: `__________`

**Step R9 — Cancel Cron Jobs (ONLY if pg_cron was enabled)**
- [ ] `SELECT cron.unschedule('mi-daily-skip-reset');` — executed (if registered)
- [ ] `SELECT cron.unschedule('mi-agent007-context-refresh');` — executed (if registered)

---

### 5.3 — Post-Rollback Verification

- [ ] `SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'mi_%';` → Returns **0 rows**
- [ ] `SELECT COUNT(*) FROM clients;` — matches pre-migration backup: YES / NO: `__________`
- [ ] `SELECT COUNT(*) FROM chat_logs;` — matches pre-migration backup: YES / NO: `__________`
- [ ] `SELECT COUNT(*) FROM automation_runs;` — matches pre-migration backup: YES / NO: `__________`
- [ ] `SELECT COUNT(*) FROM portal_access;` — matches pre-migration backup: YES / NO: `__________`
- [ ] Agent 007 ChatWidget sends and receives messages: YES / NO: `__________`
- [ ] Telegram bot still operational: YES / NO: `__________`
- [ ] RSS feed still returns HTTP 200: YES / NO: `__________`

### 5.4 — Post-Rollback Documentation

- [ ] Root cause of failure documented in migration log
- [ ] Specific block and query that failed recorded
- [ ] Error message captured verbatim
- [ ] Resolution plan noted
- [ ] AMD_MUSIC_INTEL_INTERACTION_MEMORY_LOG.md updated with rollback event entry

**Rollback completion recorded at:** `__________` (timestamp)

---

## QUICK REFERENCE — CRITICAL UUIDS

Record these immediately after Block 13 completes. These values are required for Phase 1 application development.

| Entity | UUID |
|---|---|
| Chrome Music Hub (`mi_client_hubs.id`) | `__________` |
| VaB Artist (`mi_artists.id`) | `__________` |
| Chrome AfroFusion Radio Playlist (`mi_playlists.id`) | `__________` |
| Free Plan (`mi_subscription_plans.id`) | `__________` |
| Premium Plan (`mi_subscription_plans.id`) | `__________` |
| Studio Plan (`mi_subscription_plans.id`) | `__________` |

---

## QUICK REFERENCE — BLOCK TIMING LOG

| Block | Description | Start | End | Status |
|---|---|---|---|---|
| Block 0 | Safety Check | `___` | `___` | PASS / FAIL |
| Block 1 | Extensions | `___` | `___` | PASS / FAIL |
| Block 2 | Foundation Tables | `___` | `___` | PASS / FAIL |
| Block 3 | Security Keystone | `___` | `___` | PASS / FAIL |
| Block 4 | Content Layer | `___` | `___` | PASS / FAIL |
| Block 5 | User & Subscription | `___` | `___` | PASS / FAIL |
| Block 6 | Linking Layer | `___` | `___` | PASS / FAIL |
| Block 7 | Analytics Layer | `___` | `___` | PASS / FAIL |
| Block 8 | Extend chat_logs | `___` | `___` | PASS / FAIL |
| Block 9 | Functions & Triggers | `___` | `___` | PASS / FAIL |
| Block 10 | Views | `___` | `___` | PASS / FAIL |
| Block 11 | RLS Policies | `___` | `___` | PASS / FAIL |
| Block 12 | Storage Buckets | `___` | `___` | PASS / FAIL |
| Block 13 | Seed Data | `___` | `___` | PASS / FAIL |
| Block 14 | Verification | `___` | `___` | PASS / FAIL |

---

## COMPLETION DECLARATION

All blocks executed. All verification queries passed. Database Phase 1 is complete.

| Field | Value |
|---|---|
| Migration Start Time | `__________` |
| Migration End Time | `__________` |
| Total Duration | `__________` |
| Final Status | **COMPLETE** |
| Executor | `__________` |

> Database Phase 1 complete. AMD Music Intelligence application development may now begin.
> Next step: Application Layer — Phase 1 API routes and UI components.
