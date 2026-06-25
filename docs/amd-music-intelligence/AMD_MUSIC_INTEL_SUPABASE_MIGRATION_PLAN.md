# AMD Music Intelligence — Supabase Migration Plan

**Document Class:** Implementation Foundation — Phase 1  
**Version:** 1.0.0  
**Date:** June 23, 2026  
**Authority:** Platform Architect  
**References:** AMD_MUSIC_INTEL_DATABASE_MASTER_BLUEPRINT.md  
**Status:** READY FOR EXECUTION — Pending CEO Approval

> This document defines the precise, step-by-step Supabase migration execution plan.
> Each migration block is atomic. If a block fails, the failure must be resolved
> before proceeding to the next block. Never skip a block.

---

## Table of Contents

1. [Pre-Migration Checklist](#1-pre-migration-checklist)
2. [Migration Execution Order](#2-migration-execution-order)
3. [Block 0 — Safety & Environment](#block-0--safety--environment)
4. [Block 1 — Extensions](#block-1--extensions)
5. [Block 2 — Foundation Tables](#block-2--foundation-tables)
6. [Block 3 — Security Keystone](#block-3--security-keystone)
7. [Block 4 — Content Layer](#block-4--content-layer)
8. [Block 5 — User & Subscription Layer](#block-5--user--subscription-layer)
9. [Block 6 — Linking Layer](#block-6--linking-layer)
10. [Block 7 — Analytics Layer](#block-7--analytics-layer)
11. [Block 8 — Extend Existing Tables](#block-8--extend-existing-tables)
12. [Block 9 — Functions & Triggers](#block-9--functions--triggers)
13. [Block 10 — Views & Materialised Views](#block-10--views--materialised-views)
14. [Block 11 — Row Level Security](#block-11--row-level-security)
15. [Block 12 — Storage Buckets](#block-12--storage-buckets)
16. [Block 13 — Seed Data](#block-13--seed-data)
17. [Block 14 — Validation & Verification](#block-14--validation--verification)
18. [Rollback Strategy](#rollback-strategy)
19. [Post-Migration Checklist](#post-migration-checklist)

---

## 1. Pre-Migration Checklist

Complete every item before executing any migration block.

- [ ] **Supabase project confirmed:** AMD Control Center project (confirm URL matches `.env`)
- [ ] **Supabase SQL Editor access confirmed:** Can execute DDL statements
- [ ] **Supabase service role key secured:** Required for post-migration API testing
- [ ] **Existing tables backed up:** Export `clients`, `chat_logs`, `automation_runs`, `portal_access` as CSV
- [ ] **Existing B2B systems verified operational:** Confirm Telegram bot, WhatsApp bot, RSS feed are live before migration
- [ ] **pgvector extension available:** Confirm Supabase project supports pgvector (required for embedding column)
- [ ] **Supabase Storage accessible:** Can create buckets via dashboard or API
- [ ] **Environment variables documented:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Migration log file created:** Record each block's execution timestamp and outcome

---

## 2. Migration Execution Order

```
Block 0:  Safety Checks & Environment Validation
Block 1:  Enable Required Extensions (pgvector, pg_cron)
Block 2:  Foundation Tables (mi_client_hubs, mi_genres, mi_subscription_plans)
Block 3:  Security Keystone Table (mi_hub_managers)
Block 4:  Content Layer (mi_artists, mi_tracks, mi_playlists, mi_playlist_tracks)
Block 5:  User & Subscription Layer (mi_user_profiles, mi_subscriptions, mi_user_playlists)
Block 6:  Linking Layer (mi_smart_links)
Block 7:  Analytics Layer (mi_click_tracking, mi_listening_history, mi_audience)
Block 8:  Extend Existing Tables (chat_logs — Agent 007 music columns)
Block 9:  Functions & Triggers (mi_generate_short_code, mi_increment_*, mi_is_hub_manager, cron)
Block 10: Views & Materialised Views (8 views + mi_agent007_context)
Block 11: Row Level Security (32 policies across 14 tables)
Block 12: Storage Buckets (mi-audio, mi-covers, mi-hub-assets)
Block 13: Seed Data (genres, subscription plans, Chrome hub, VaB artist)
Block 14: Validation & Verification Queries
```

**Estimated Execution Time:** 3–4 hours for careful, verified execution.  
**Do not rush.** Each block must be verified before proceeding.

---

## Block 0 — Safety & Environment

**Purpose:** Verify the target project and confirm no conflicting objects exist.

**Execute in Supabase SQL Editor:**

```sql
-- BLOCK 0: Safety Verification
-- Run this FIRST. Review output before proceeding.

-- 0.1: Confirm project identity
SELECT current_database(), current_schema(), version();

-- 0.2: Confirm existing AMD tables are present (B2B layer)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('clients', 'chat_logs', 'automation_runs', 'portal_access')
ORDER BY table_name;
-- EXPECTED: 4 rows returned. If fewer, STOP and investigate.

-- 0.3: Confirm NO mi_ tables exist yet (clean slate)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'mi_%'
ORDER BY table_name;
-- EXPECTED: 0 rows returned. If any exist, review carefully before proceeding.

-- 0.4: Confirm update_updated_at_column function exists (reusable)
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_updated_at_column';
-- EXPECTED: 1 row. If 0, Block 9 must create it from scratch.
```

**✅ Pass Criteria:** 4 existing tables confirmed, 0 mi_ tables, function exists.  
**❌ Fail Action:** Do not proceed. Investigate the discrepancy.

---

## Block 1 — Extensions

**Purpose:** Enable database extensions required by the Music Intelligence schema.

```sql
-- BLOCK 1: Extensions
-- pgvector: Required for mi_tracks.embedding (Phase 2 Recommendation Engine)
-- pg_cron: Required for daily skip count reset and materialised view refresh

-- 1.1: Enable pgvector (Supabase supports this natively)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1.2: Enable pg_cron (available on Supabase Pro and above)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1.3: Enable pg_trgm (for fuzzy search on track titles and artist names)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1.4: Verify extensions
SELECT extname, extversion FROM pg_extension
WHERE extname IN ('vector', 'pg_cron', 'pg_trgm');
-- EXPECTED: 3 rows
```

**⚠️ Note on pgvector:** If the Supabase plan does not support pgvector, the `embedding VECTOR(1536)` column in `mi_tracks` must be added as `TEXT` (nullable) for now and migrated to VECTOR type when the plan is upgraded. This does not block Phase 1.

---

## Block 2 — Foundation Tables

**Purpose:** Create the three tables with zero foreign key dependencies.

```sql
-- BLOCK 2A: mi_client_hubs
CREATE TABLE mi_client_hubs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  description   TEXT,
  brand_color   TEXT        DEFAULT '#7B2FFF',
  logo_url      TEXT,
  cover_url     TEXT,
  contact_email TEXT,
  website_url   TEXT,
  revenue_share_pct DECIMAL(5,2) DEFAULT 70.00,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mi_client_hubs_slug     ON mi_client_hubs(slug);
CREATE INDEX idx_mi_client_hubs_active   ON mi_client_hubs(is_active);
CREATE INDEX idx_mi_client_hubs_created  ON mi_client_hubs(created_at DESC);

ALTER TABLE mi_client_hubs ENABLE ROW LEVEL SECURITY;

-- BLOCK 2B: mi_genres
CREATE TABLE mi_genres (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        UNIQUE NOT NULL,
  parent_id   UUID        REFERENCES mi_genres(id) ON DELETE SET NULL,
  region      TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mi_genres_parent ON mi_genres(parent_id);
CREATE INDEX idx_mi_genres_name   ON mi_genres USING gin(name gin_trgm_ops);

ALTER TABLE mi_genres ENABLE ROW LEVEL SECURITY;

-- BLOCK 2C: mi_subscription_plans
CREATE TABLE mi_subscription_plans (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  slug                TEXT        UNIQUE NOT NULL,
  price_ngn           DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_usd           DECIMAL(10,2) DEFAULT 0,
  currency            TEXT        NOT NULL DEFAULT 'NGN',
  billing_interval    TEXT        CHECK (billing_interval IN ('free','monthly','annual')),
  features            JSONB       NOT NULL DEFAULT '{}',
  skip_limit          INTEGER,
  paystack_plan_code  TEXT,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  sort_order          INTEGER     DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_mi_sub_plans_slug   ON mi_subscription_plans(slug);
CREATE INDEX idx_mi_sub_plans_active        ON mi_subscription_plans(is_active);

ALTER TABLE mi_subscription_plans ENABLE ROW LEVEL SECURITY;
```

**Verification:**
```sql
-- Confirm all three tables created with correct column counts
SELECT table_name, COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('mi_client_hubs', 'mi_genres', 'mi_subscription_plans')
GROUP BY table_name;
-- EXPECTED: mi_client_hubs=12, mi_genres=6, mi_subscription_plans=13
```

---

## Block 3 — Security Keystone

**Purpose:** Create `mi_hub_managers` — the table that makes multi-tenant RLS possible.

```sql
-- BLOCK 3: mi_hub_managers (THE KEYSTONE TABLE)
-- This table MUST exist before any hub-scoped RLS policies are written.

CREATE TABLE mi_hub_managers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hub_id      UUID        NOT NULL REFERENCES mi_client_hubs(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('owner','editor','viewer')),
  invited_by  UUID        REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, hub_id)
);

CREATE INDEX idx_mi_hub_managers_user   ON mi_hub_managers(user_id);
CREATE INDEX idx_mi_hub_managers_hub    ON mi_hub_managers(hub_id);
CREATE INDEX idx_mi_hub_managers_composite ON mi_hub_managers(user_id, hub_id);

ALTER TABLE mi_hub_managers ENABLE ROW LEVEL SECURITY;
```

**Verification:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mi_hub_managers'
ORDER BY ordinal_position;
-- EXPECTED: 8 rows (id, user_id, hub_id, role, invited_by, accepted_at, created_at + constraints)
```

---

## Block 4 — Content Layer

**Purpose:** Create artist, track, playlist, and junction tables.

```sql
-- BLOCK 4A: mi_artists
CREATE TABLE mi_artists (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id            UUID        NOT NULL REFERENCES mi_client_hubs(id),
  name              TEXT        NOT NULL,
  slug              TEXT        NOT NULL,
  bio               TEXT,
  profile_image_url TEXT,
  cover_image_url   TEXT,
  genre_tags        UUID[]      DEFAULT '{}',
  social_links      JSONB       DEFAULT '{}',
  dsp_profile_links JSONB       DEFAULT '{}',
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hub_id, slug)
);

CREATE INDEX idx_mi_artists_hub_id   ON mi_artists(hub_id);
CREATE INDEX idx_mi_artists_active   ON mi_artists(is_active);
CREATE INDEX idx_mi_artists_name     ON mi_artists USING gin(name gin_trgm_ops);

ALTER TABLE mi_artists ENABLE ROW LEVEL SECURITY;

-- BLOCK 4B: mi_tracks
CREATE TABLE mi_tracks (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id             UUID          NOT NULL REFERENCES mi_artists(id),
  hub_id                UUID          NOT NULL REFERENCES mi_client_hubs(id),
  title                 TEXT          NOT NULL,
  slug                  TEXT          NOT NULL,
  genre_id              UUID          REFERENCES mi_genres(id),
  mood_tags             TEXT[]        DEFAULT '{}',
  cultural_tags         TEXT[]        DEFAULT '{}',
  bpm                   INTEGER       CHECK (bpm BETWEEN 40 AND 220),
  audio_key             TEXT,
  energy_level          INTEGER       CHECK (energy_level BETWEEN 1 AND 10),
  duration_seconds      INTEGER       NOT NULL,
  audio_url             TEXT          NOT NULL,
  cover_url             TEXT,
  waveform_data         JSONB,
  dsp_links             JSONB         DEFAULT '{}',
  release_date          DATE,
  play_count            INTEGER       NOT NULL DEFAULT 0,
  skip_count            INTEGER       NOT NULL DEFAULT 0,
  completion_count      INTEGER       NOT NULL DEFAULT 0,
  embedding             vector(1536),
  licensed_territories  TEXT[]        DEFAULT ARRAY['*'],
  is_active             BOOLEAN       NOT NULL DEFAULT true,
  is_explicit           BOOLEAN       NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(hub_id, slug)
);

CREATE INDEX idx_mi_tracks_hub_id         ON mi_tracks(hub_id);
CREATE INDEX idx_mi_tracks_artist_id      ON mi_tracks(artist_id);
CREATE INDEX idx_mi_tracks_genre_id       ON mi_tracks(genre_id);
CREATE INDEX idx_mi_tracks_active         ON mi_tracks(is_active);
CREATE INDEX idx_mi_tracks_release        ON mi_tracks(release_date DESC);
CREATE INDEX idx_mi_tracks_hub_active     ON mi_tracks(hub_id, is_active);
CREATE INDEX idx_mi_tracks_hub_genre      ON mi_tracks(hub_id, genre_id);
CREATE INDEX idx_mi_tracks_mood_tags      ON mi_tracks USING GIN(mood_tags);
CREATE INDEX idx_mi_tracks_cultural_tags  ON mi_tracks USING GIN(cultural_tags);
CREATE INDEX idx_mi_tracks_title          ON mi_tracks USING gin(title gin_trgm_ops);
-- Embedding index created separately when pgvector is confirmed:
-- CREATE INDEX idx_mi_tracks_embedding ON mi_tracks USING hnsw(embedding vector_cosine_ops);

ALTER TABLE mi_tracks ENABLE ROW LEVEL SECURITY;

-- BLOCK 4C: mi_playlists
CREATE TABLE mi_playlists (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id           UUID        NOT NULL REFERENCES mi_client_hubs(id),
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL,
  description      TEXT,
  cover_url        TEXT,
  is_ai_generated  BOOLEAN     NOT NULL DEFAULT false,
  ai_prompt        TEXT,
  total_plays      INTEGER     NOT NULL DEFAULT 0,
  total_tracks     INTEGER     NOT NULL DEFAULT 0,
  is_featured      BOOLEAN     NOT NULL DEFAULT false,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hub_id, slug)
);

CREATE INDEX idx_mi_playlists_hub_id   ON mi_playlists(hub_id);
CREATE INDEX idx_mi_playlists_featured ON mi_playlists(is_featured);
CREATE INDEX idx_mi_playlists_active   ON mi_playlists(is_active);

ALTER TABLE mi_playlists ENABLE ROW LEVEL SECURITY;

-- BLOCK 4D: mi_playlist_tracks (junction)
CREATE TABLE mi_playlist_tracks (
  playlist_id UUID        NOT NULL REFERENCES mi_playlists(id) ON DELETE CASCADE,
  track_id    UUID        NOT NULL REFERENCES mi_tracks(id) ON DELETE CASCADE,
  position    INTEGER     NOT NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by    UUID        REFERENCES auth.users(id),
  PRIMARY KEY (playlist_id, track_id),
  UNIQUE(playlist_id, position)
);

CREATE INDEX idx_mi_pt_playlist_id ON mi_playlist_tracks(playlist_id);
CREATE INDEX idx_mi_pt_track_id    ON mi_playlist_tracks(track_id);

ALTER TABLE mi_playlist_tracks ENABLE ROW LEVEL SECURITY;
```

---

## Block 5 — User & Subscription Layer

```sql
-- BLOCK 5A: mi_user_profiles
CREATE TABLE mi_user_profiles (
  id                    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name          TEXT,
  avatar_url            TEXT,
  subscription_plan_id  UUID        REFERENCES mi_subscription_plans(id),
  subscription_status   TEXT        NOT NULL DEFAULT 'free'
                        CHECK (subscription_status IN ('active','cancelled','past_due','trialing','free')),
  subscription_expires_at TIMESTAMPTZ,
  paystack_customer_id  TEXT,
  whatsapp_number       TEXT,
  whatsapp_verified     BOOLEAN     DEFAULT false,
  telegram_chat_id      TEXT,
  preferred_genres      UUID[]      DEFAULT '{}',
  skip_count_today      INTEGER     NOT NULL DEFAULT 0,
  skip_reset_date       DATE,
  agent_007_context     JSONB       DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mi_user_profiles_plan     ON mi_user_profiles(subscription_plan_id);
CREATE INDEX idx_mi_user_profiles_status   ON mi_user_profiles(subscription_status);
CREATE INDEX idx_mi_user_profiles_paystack ON mi_user_profiles(paystack_customer_id);

ALTER TABLE mi_user_profiles ENABLE ROW LEVEL SECURITY;

-- BLOCK 5B: mi_subscriptions (payment event log — immutable)
CREATE TABLE mi_subscriptions (
  id                          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID          NOT NULL REFERENCES auth.users(id),
  plan_id                     UUID          NOT NULL REFERENCES mi_subscription_plans(id),
  paystack_reference          TEXT          UNIQUE NOT NULL,
  paystack_subscription_code  TEXT,
  event_type                  TEXT          NOT NULL,
  amount_ngn                  DECIMAL(10,2) NOT NULL,
  currency                    TEXT          NOT NULL DEFAULT 'NGN',
  status                      TEXT          NOT NULL CHECK (status IN ('active','cancelled','expired','failed')),
  period_start                TIMESTAMPTZ,
  period_end                  TIMESTAMPTZ,
  cancelled_at                TIMESTAMPTZ,
  raw_webhook                 JSONB,
  created_at                  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_mi_subs_user_id    ON mi_subscriptions(user_id);
CREATE INDEX idx_mi_subs_status     ON mi_subscriptions(status);
CREATE INDEX idx_mi_subs_created    ON mi_subscriptions(created_at DESC);
CREATE UNIQUE INDEX idx_mi_subs_ref ON mi_subscriptions(paystack_reference);

ALTER TABLE mi_subscriptions ENABLE ROW LEVEL SECURITY;

-- BLOCK 5C: mi_user_playlists (B2C personal playlists)
CREATE TABLE mi_user_playlists (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  description      TEXT,
  cover_url        TEXT,
  is_ai_generated  BOOLEAN     NOT NULL DEFAULT false,
  ai_prompt        TEXT,
  is_public        BOOLEAN     NOT NULL DEFAULT false,
  total_tracks     INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mi_user_playlists_user   ON mi_user_playlists(user_id);
CREATE INDEX idx_mi_user_playlists_public ON mi_user_playlists(is_public);

ALTER TABLE mi_user_playlists ENABLE ROW LEVEL SECURITY;
```

---

## Block 6 — Linking Layer

```sql
-- BLOCK 6: mi_smart_links
CREATE TABLE mi_smart_links (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code        TEXT        UNIQUE NOT NULL,
  hub_id            UUID        NOT NULL REFERENCES mi_client_hubs(id),
  artist_id         UUID        REFERENCES mi_artists(id),
  track_id          UUID        REFERENCES mi_tracks(id),
  playlist_id       UUID        REFERENCES mi_playlists(id),
  destination_type  TEXT        NOT NULL CHECK (destination_type IN ('track','playlist','artist','hub')),
  og_title          TEXT,
  og_description    TEXT,
  og_image_url      TEXT,
  cta_text          TEXT,
  total_clicks      INTEGER     NOT NULL DEFAULT 0,
  audience_gate     BOOLEAN     NOT NULL DEFAULT false,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_mi_smart_links_code   ON mi_smart_links(short_code);
CREATE INDEX idx_mi_smart_links_hub_id        ON mi_smart_links(hub_id);
CREATE INDEX idx_mi_smart_links_track_id      ON mi_smart_links(track_id);
CREATE INDEX idx_mi_smart_links_active        ON mi_smart_links(is_active);

ALTER TABLE mi_smart_links ENABLE ROW LEVEL SECURITY;
```

---

## Block 7 — Analytics Layer

```sql
-- BLOCK 7A: mi_click_tracking (PARTITIONED — INSERT ONLY)
CREATE TABLE mi_click_tracking (
  id                UUID        NOT NULL DEFAULT gen_random_uuid(),
  smart_link_id     UUID        REFERENCES mi_smart_links(id),
  hub_id            UUID        NOT NULL REFERENCES mi_client_hubs(id),
  artist_id         UUID        REFERENCES mi_artists(id),
  track_id          UUID        REFERENCES mi_tracks(id),
  playlist_id       UUID        REFERENCES mi_playlists(id),
  destination_dsp   TEXT        NOT NULL CHECK (destination_dsp IN
                    ('spotify','apple_music','audiomack','boomplay','youtube','internal','other')),
  destination_url   TEXT,
  referrer_url      TEXT,
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  user_country      CHAR(2),
  user_device_type  TEXT        CHECK (user_device_type IN ('mobile','desktop','tablet','unknown')),
  user_browser      TEXT,
  session_id        TEXT,
  ip_hash           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Create first partitions (add new ones monthly)
CREATE TABLE mi_click_tracking_2026_06
  PARTITION OF mi_click_tracking
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE mi_click_tracking_2026_07
  PARTITION OF mi_click_tracking
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE mi_click_tracking_2026_08
  PARTITION OF mi_click_tracking
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- Indexes on parent table (cascade to all partitions)
CREATE INDEX idx_mi_ct_hub_id       ON mi_click_tracking(hub_id);
CREATE INDEX idx_mi_ct_track_id     ON mi_click_tracking(track_id);
CREATE INDEX idx_mi_ct_smart_link   ON mi_click_tracking(smart_link_id);
CREATE INDEX idx_mi_ct_dsp          ON mi_click_tracking(destination_dsp);
CREATE INDEX idx_mi_ct_created      ON mi_click_tracking(created_at DESC);
CREATE INDEX idx_mi_ct_country      ON mi_click_tracking(user_country);
CREATE INDEX idx_mi_ct_hub_dsp      ON mi_click_tracking(hub_id, destination_dsp);
CREATE INDEX idx_mi_ct_hub_created  ON mi_click_tracking(hub_id, created_at DESC);

ALTER TABLE mi_click_tracking ENABLE ROW LEVEL SECURITY;

-- BLOCK 7B: mi_listening_history (INSERT ONLY)
CREATE TABLE mi_listening_history (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id           TEXT        NOT NULL,
  hub_id               UUID        NOT NULL REFERENCES mi_client_hubs(id),
  track_id             UUID        NOT NULL REFERENCES mi_tracks(id),
  source_playlist_id   UUID        REFERENCES mi_playlists(id),
  play_duration_seconds INTEGER    NOT NULL DEFAULT 0,
  skip_timestamp_seconds INTEGER,
  completed            BOOLEAN     NOT NULL DEFAULT false,
  device_type          TEXT        CHECK (device_type IN ('mobile','desktop','tablet','unknown')),
  ip_hash              TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mi_lh_hub_id       ON mi_listening_history(hub_id);
CREATE INDEX idx_mi_lh_track_id     ON mi_listening_history(track_id);
CREATE INDEX idx_mi_lh_user_id      ON mi_listening_history(user_id);
CREATE INDEX idx_mi_lh_session      ON mi_listening_history(session_id);
CREATE INDEX idx_mi_lh_created      ON mi_listening_history(created_at DESC);
CREATE INDEX idx_mi_lh_track_complete ON mi_listening_history(track_id, completed);

ALTER TABLE mi_listening_history ENABLE ROW LEVEL SECURITY;

-- BLOCK 7C: mi_audience (GDPR/NDPR compliant)
CREATE TABLE mi_audience (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id                UUID        NOT NULL REFERENCES mi_client_hubs(id),
  email                 TEXT        CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  whatsapp              TEXT,
  telegram_username     TEXT,
  source_smart_link_id  UUID        REFERENCES mi_smart_links(id),
  source_page_url       TEXT,
  acquisition_incentive TEXT,
  consent_timestamp     TIMESTAMPTZ NOT NULL,
  consent_text_version  TEXT        NOT NULL,
  consent_ip_hash       TEXT        NOT NULL,
  is_verified           BOOLEAN     NOT NULL DEFAULT false,
  opt_out_at            TIMESTAMPTZ,
  deletion_requested_at TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT mi_audience_contact_required
    CHECK (email IS NOT NULL OR whatsapp IS NOT NULL OR telegram_username IS NOT NULL)
);

CREATE INDEX idx_mi_audience_hub_id    ON mi_audience(hub_id);
CREATE INDEX idx_mi_audience_created   ON mi_audience(created_at DESC);
CREATE INDEX idx_mi_audience_email     ON mi_audience(email) WHERE email IS NOT NULL;
CREATE INDEX idx_mi_audience_whatsapp  ON mi_audience(whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX idx_mi_audience_opt_out   ON mi_audience(opt_out_at) WHERE opt_out_at IS NOT NULL;

ALTER TABLE mi_audience ENABLE ROW LEVEL SECURITY;
```

---

## Block 8 — Extend Existing Tables

**Purpose:** Add Agent 007 Music Intelligence context columns to `chat_logs`. The existing columns and data are untouched.

```sql
-- BLOCK 8: Extend chat_logs for Agent 007 Music Intelligence Mode
-- CRITICAL: Only ADD columns. Never modify, rename, or drop existing columns.

ALTER TABLE chat_logs
  ADD COLUMN IF NOT EXISTS agent_mode       TEXT    DEFAULT 'corporate'
    CHECK (agent_mode IN ('corporate','music_discovery','artist_intelligence','dj')),
  ADD COLUMN IF NOT EXISTS hub_id           UUID    REFERENCES mi_client_hubs(id),
  ADD COLUMN IF NOT EXISTS music_context    JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS user_id          UUID    REFERENCES auth.users(id);

-- Index the new columns
CREATE INDEX IF NOT EXISTS idx_chat_logs_agent_mode ON chat_logs(agent_mode);
CREATE INDEX IF NOT EXISTS idx_chat_logs_hub_id     ON chat_logs(hub_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id    ON chat_logs(user_id);
```

**Verification:**
```sql
-- Confirm existing data is unaffected
SELECT COUNT(*) FROM chat_logs;
SELECT session_id, agent_mode, hub_id FROM chat_logs LIMIT 5;
-- Existing rows should show agent_mode = 'corporate', hub_id = NULL
```

---

## Block 9 — Functions & Triggers

```sql
-- BLOCK 9A: mi_is_hub_manager (SECURITY FUNCTION — MUST BE FIRST)
-- SECURITY DEFINER: Bypasses RLS on mi_hub_managers for policy evaluation
CREATE OR REPLACE FUNCTION mi_is_hub_manager(p_hub_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM mi_hub_managers
    WHERE user_id = auth.uid()
      AND hub_id = p_hub_id
  );
$$;

-- BLOCK 9B: mi_hub_manager_role (Returns specific role for policy conditions)
CREATE OR REPLACE FUNCTION mi_get_hub_role(p_hub_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM mi_hub_managers
  WHERE user_id = auth.uid()
    AND hub_id = p_hub_id
  LIMIT 1;
$$;

-- BLOCK 9C: mi_generate_short_code (Smart Link code generation)
CREATE OR REPLACE FUNCTION mi_generate_short_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  code  TEXT := '';
  i     INTEGER;
  attempts INTEGER := 0;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (SELECT 1 FROM mi_smart_links WHERE short_code = code);

    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Failed to generate unique short code after 100 attempts';
    END IF;
  END LOOP;

  RETURN code;
END;
$$;

-- BLOCK 9D: mi_increment_play_count (Atomic counter)
CREATE OR REPLACE FUNCTION mi_increment_play_count(p_track_id UUID)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE mi_tracks
  SET play_count = play_count + 1
  WHERE id = p_track_id;
$$;

-- BLOCK 9E: mi_increment_completion_count
CREATE OR REPLACE FUNCTION mi_increment_completion_count(p_track_id UUID)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE mi_tracks
  SET completion_count = completion_count + 1
  WHERE id = p_track_id;
$$;

-- BLOCK 9F: mi_increment_skip_count
CREATE OR REPLACE FUNCTION mi_increment_skip_count(p_track_id UUID)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE mi_tracks
  SET skip_count = skip_count + 1
  WHERE id = p_track_id;
$$;

-- BLOCK 9G: mi_increment_smart_link_clicks (Called by trigger on mi_click_tracking INSERT)
CREATE OR REPLACE FUNCTION mi_increment_smart_link_clicks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.smart_link_id IS NOT NULL THEN
    UPDATE mi_smart_links
    SET total_clicks = total_clicks + 1
    WHERE id = NEW.smart_link_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to mi_click_tracking
CREATE TRIGGER trg_mi_increment_smart_link_clicks
  AFTER INSERT ON mi_click_tracking
  FOR EACH ROW EXECUTE FUNCTION mi_increment_smart_link_clicks();

-- BLOCK 9H: mi_reset_daily_skip_counts (Called by pg_cron at 00:00 UTC)
CREATE OR REPLACE FUNCTION mi_reset_daily_skip_counts()
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE mi_user_profiles
  SET skip_count_today = 0,
      skip_reset_date  = CURRENT_DATE
  WHERE skip_reset_date IS NULL
     OR skip_reset_date < CURRENT_DATE;
$$;

-- Schedule the daily skip reset (runs at 00:00 UTC = 01:00 WAT)
SELECT cron.schedule(
  'mi-daily-skip-reset',
  '0 0 * * *',
  $$SELECT mi_reset_daily_skip_counts();$$
);

-- BLOCK 9I: Apply update_updated_at_column() trigger to all mi_* tables
CREATE TRIGGER trg_mi_client_hubs_updated_at
  BEFORE UPDATE ON mi_client_hubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mi_artists_updated_at
  BEFORE UPDATE ON mi_artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mi_tracks_updated_at
  BEFORE UPDATE ON mi_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mi_playlists_updated_at
  BEFORE UPDATE ON mi_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mi_smart_links_updated_at
  BEFORE UPDATE ON mi_smart_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mi_user_profiles_updated_at
  BEFORE UPDATE ON mi_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mi_user_playlists_updated_at
  BEFORE UPDATE ON mi_user_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Block 10 — Views & Materialised Views

```sql
-- BLOCK 10A: mi_track_performance
CREATE OR REPLACE VIEW mi_track_performance AS
SELECT
  t.id                                                                AS track_id,
  t.title,
  t.hub_id,
  a.name                                                              AS artist_name,
  t.play_count,
  t.completion_count,
  t.skip_count,
  CASE WHEN t.play_count > 0
       THEN ROUND(100.0 * t.completion_count / t.play_count, 2)
       ELSE 0 END                                                     AS completion_rate_pct,
  CASE WHEN t.play_count > 0
       THEN ROUND(100.0 * t.skip_count / t.play_count, 2)
       ELSE 0 END                                                     AS skip_rate_pct,
  COUNT(ct.id)                                                        AS total_dsp_clicks,
  jsonb_object_agg(ct.destination_dsp, COUNT(ct.id))
    FILTER (WHERE ct.destination_dsp IS NOT NULL)                     AS dsp_click_breakdown
FROM mi_tracks t
JOIN mi_artists a ON a.id = t.artist_id
LEFT JOIN mi_click_tracking ct ON ct.track_id = t.id
GROUP BY t.id, t.title, t.hub_id, a.name, t.play_count, t.completion_count, t.skip_count;

-- BLOCK 10B: mi_artist_performance
CREATE OR REPLACE VIEW mi_artist_performance AS
SELECT
  a.id                                  AS artist_id,
  a.name                                AS artist_name,
  a.hub_id,
  COUNT(DISTINCT t.id)                  AS total_tracks,
  SUM(t.play_count)                     AS total_plays,
  SUM(t.completion_count)               AS total_completions,
  CASE WHEN SUM(t.play_count) > 0
       THEN ROUND(100.0 * SUM(t.completion_count) / SUM(t.play_count), 2)
       ELSE 0 END                        AS avg_completion_rate_pct,
  COUNT(DISTINCT ct.id)                 AS total_dsp_clicks,
  MAX(t.play_count)                     AS top_track_play_count
FROM mi_artists a
LEFT JOIN mi_tracks t ON t.artist_id = a.id AND t.is_active = true
LEFT JOIN mi_click_tracking ct ON ct.artist_id = a.id
GROUP BY a.id, a.name, a.hub_id;

-- BLOCK 10C: mi_hub_performance
CREATE OR REPLACE VIEW mi_hub_performance AS
SELECT
  h.id                                  AS hub_id,
  h.name                                AS hub_name,
  COUNT(DISTINCT a.id)                  AS total_artists,
  COUNT(DISTINCT t.id)                  AS total_tracks,
  SUM(t.play_count)                     AS total_plays,
  COUNT(DISTINCT aud.id)                AS total_audience_contacts,
  COUNT(DISTINCT ct.id)                 AS total_dsp_clicks
FROM mi_client_hubs h
LEFT JOIN mi_artists a  ON a.hub_id = h.id AND a.is_active = true
LEFT JOIN mi_tracks t   ON t.hub_id = h.id AND t.is_active = true
LEFT JOIN mi_audience aud ON aud.hub_id = h.id AND aud.opt_out_at IS NULL
LEFT JOIN mi_click_tracking ct ON ct.hub_id = h.id
GROUP BY h.id, h.name;

-- BLOCK 10D: mi_smart_link_performance
CREATE OR REPLACE VIEW mi_smart_link_performance AS
SELECT
  sl.id                                 AS smart_link_id,
  sl.short_code,
  sl.hub_id,
  sl.destination_type,
  sl.total_clicks,
  COUNT(DISTINCT aud.id)                AS audience_captures,
  CASE WHEN sl.total_clicks > 0
       THEN ROUND(100.0 * COUNT(DISTINCT aud.id) / sl.total_clicks, 2)
       ELSE 0 END                        AS conversion_rate_pct
FROM mi_smart_links sl
LEFT JOIN mi_audience aud ON aud.source_smart_link_id = sl.id
GROUP BY sl.id, sl.short_code, sl.hub_id, sl.destination_type, sl.total_clicks;

-- BLOCK 10E: mi_audience_growth
CREATE OR REPLACE VIEW mi_audience_growth AS
SELECT
  hub_id,
  DATE(created_at)                      AS date,
  COUNT(*)                              AS new_contacts,
  COUNT(*) FILTER (WHERE email IS NOT NULL)             AS email_captures,
  COUNT(*) FILTER (WHERE whatsapp IS NOT NULL)          AS whatsapp_captures,
  COUNT(*) FILTER (WHERE telegram_username IS NOT NULL) AS telegram_captures
FROM mi_audience
WHERE opt_out_at IS NULL
GROUP BY hub_id, DATE(created_at)
ORDER BY hub_id, date DESC;

-- BLOCK 10F: mi_discovery_leaderboard
CREATE OR REPLACE VIEW mi_discovery_leaderboard AS
SELECT
  t.id,
  t.title,
  a.name    AS artist_name,
  t.hub_id,
  t.energy_level,
  t.mood_tags,
  t.play_count,
  t.completion_count,
  CASE WHEN t.play_count >= 10
       THEN ROUND(100.0 * t.completion_count / t.play_count, 2)
       ELSE NULL END  AS completion_rate_pct
FROM mi_tracks t
JOIN mi_artists a ON a.id = t.artist_id
WHERE t.is_active = true
  AND t.play_count >= 10
ORDER BY completion_rate_pct DESC NULLS LAST;

-- BLOCK 10G: mi_subscription_revenue (service role access only)
CREATE OR REPLACE VIEW mi_subscription_revenue AS
SELECT
  DATE_TRUNC('month', created_at)        AS month,
  SUM(amount_ngn)
    FILTER (WHERE status = 'active')     AS total_revenue_ngn,
  COUNT(*) FILTER (WHERE status = 'active' AND event_type = 'charge.success') AS successful_charges,
  COUNT(*) FILTER (WHERE status = 'cancelled')  AS cancellations
FROM mi_subscriptions
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- BLOCK 10H: mi_agent007_context (MATERIALISED VIEW — refreshed every 15 min)
CREATE MATERIALIZED VIEW mi_agent007_context AS
SELECT
  t.id                  AS track_id,
  t.title,
  t.mood_tags,
  t.cultural_tags,
  t.energy_level,
  t.bpm,
  t.duration_seconds,
  t.is_explicit,
  a.name                AS artist_name,
  h.slug                AS hub_slug,
  h.name                AS hub_name,
  g.name                AS genre_name,
  g.region              AS genre_region
FROM mi_tracks t
JOIN mi_artists a       ON a.id = t.artist_id
JOIN mi_client_hubs h   ON h.id = t.hub_id
LEFT JOIN mi_genres g   ON g.id = t.genre_id
WHERE t.is_active = true
  AND a.is_active = true
  AND h.is_active = true;

CREATE INDEX idx_mi_agent007_context_hub  ON mi_agent007_context(hub_slug);
CREATE INDEX idx_mi_agent007_context_mood ON mi_agent007_context USING GIN(mood_tags);

-- Schedule materialised view refresh every 15 minutes
SELECT cron.schedule(
  'mi-agent007-context-refresh',
  '*/15 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY mi_agent007_context;$$
);
```

---

## Block 11 — Row Level Security

```sql
-- BLOCK 11: ALL RLS POLICIES
-- Execute in full as a single transaction

BEGIN;

-- mi_client_hubs policies
CREATE POLICY "Public can view active hubs"
  ON mi_client_hubs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Hub owners can update their hub"
  ON mi_client_hubs FOR UPDATE
  USING (mi_get_hub_role(id) = 'owner');

CREATE POLICY "Platform admin manages all hubs"
  ON mi_client_hubs FOR ALL
  USING ((auth.jwt() ->> 'user_role') = 'platform_admin');

-- mi_genres policies
CREATE POLICY "Public can view genres"
  ON mi_genres FOR SELECT USING (true);

CREATE POLICY "Platform admin manages genres"
  ON mi_genres FOR ALL
  USING ((auth.jwt() ->> 'user_role') = 'platform_admin');

-- mi_subscription_plans policies
CREATE POLICY "Public can view active plans"
  ON mi_subscription_plans FOR SELECT USING (is_active = true);

CREATE POLICY "Platform admin manages plans"
  ON mi_subscription_plans FOR ALL
  USING ((auth.jwt() ->> 'user_role') = 'platform_admin');

-- mi_hub_managers policies
CREATE POLICY "Users see their own manager records"
  ON mi_hub_managers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Hub owners manage their hub team"
  ON mi_hub_managers FOR INSERT WITH CHECK (
    mi_get_hub_role(hub_id) = 'owner'
  );

CREATE POLICY "Hub owners remove team members"
  ON mi_hub_managers FOR DELETE
  USING (mi_get_hub_role(hub_id) = 'owner');

CREATE POLICY "Platform admin manages all hub managers"
  ON mi_hub_managers FOR ALL
  USING ((auth.jwt() ->> 'user_role') = 'platform_admin');

-- mi_artists policies
CREATE POLICY "Public can view active artists"
  ON mi_artists FOR SELECT USING (is_active = true);

CREATE POLICY "Hub managers can insert artists"
  ON mi_artists FOR INSERT WITH CHECK (mi_is_hub_manager(hub_id));

CREATE POLICY "Hub managers can update own artists"
  ON mi_artists FOR UPDATE USING (mi_is_hub_manager(hub_id));

CREATE POLICY "Hub owners can delete artists"
  ON mi_artists FOR DELETE
  USING (mi_get_hub_role(hub_id) = 'owner');

-- mi_tracks policies
CREATE POLICY "Public can view active tracks"
  ON mi_tracks FOR SELECT USING (is_active = true);

CREATE POLICY "Hub managers can insert tracks"
  ON mi_tracks FOR INSERT WITH CHECK (mi_is_hub_manager(hub_id));

CREATE POLICY "Hub managers can update own tracks"
  ON mi_tracks FOR UPDATE USING (mi_is_hub_manager(hub_id));

CREATE POLICY "Hub owners can delete tracks"
  ON mi_tracks FOR DELETE
  USING (mi_get_hub_role(hub_id) = 'owner');

-- mi_playlists policies
CREATE POLICY "Public can view active playlists"
  ON mi_playlists FOR SELECT USING (is_active = true);

CREATE POLICY "Hub managers manage own playlists"
  ON mi_playlists FOR ALL USING (mi_is_hub_manager(hub_id));

-- mi_playlist_tracks policies
CREATE POLICY "Public can view playlist tracks"
  ON mi_playlist_tracks FOR SELECT USING (true);

CREATE POLICY "Hub managers manage playlist tracks"
  ON mi_playlist_tracks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM mi_playlists p
      WHERE p.id = playlist_id
        AND mi_is_hub_manager(p.hub_id)
    )
  );

-- mi_user_profiles policies
CREATE POLICY "Users view own profile"
  ON mi_user_profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON mi_user_profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Service role manages profiles"
  ON mi_user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- mi_subscriptions policies
CREATE POLICY "Users view own subscriptions"
  ON mi_subscriptions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role manages subscriptions"
  ON mi_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- mi_user_playlists policies
CREATE POLICY "Users manage own playlists"
  ON mi_user_playlists FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view public playlists"
  ON mi_user_playlists FOR SELECT USING (is_public = true);

-- mi_smart_links policies
CREATE POLICY "Public can view active smart links"
  ON mi_smart_links FOR SELECT USING (is_active = true);

CREATE POLICY "Hub managers manage own smart links"
  ON mi_smart_links FOR ALL USING (mi_is_hub_manager(hub_id));

-- mi_click_tracking policies
CREATE POLICY "Anyone can insert click events"
  ON mi_click_tracking FOR INSERT WITH CHECK (true);

CREATE POLICY "Hub managers view own hub clicks"
  ON mi_click_tracking FOR SELECT
  USING (mi_is_hub_manager(hub_id));

CREATE POLICY "Platform admin views all clicks"
  ON mi_click_tracking FOR SELECT
  USING ((auth.jwt() ->> 'user_role') = 'platform_admin');

-- mi_listening_history policies
CREATE POLICY "Anyone can insert listening events"
  ON mi_listening_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Users view own listening history"
  ON mi_listening_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Hub managers view own hub history"
  ON mi_listening_history FOR SELECT
  USING (mi_is_hub_manager(hub_id));

-- mi_audience policies
CREATE POLICY "Anyone can submit audience contact (with consent)"
  ON mi_audience FOR INSERT
  WITH CHECK (
    consent_timestamp IS NOT NULL
    AND consent_text_version IS NOT NULL
    AND consent_ip_hash IS NOT NULL
  );

CREATE POLICY "Hub managers view own audience"
  ON mi_audience FOR SELECT
  USING (mi_is_hub_manager(hub_id));

CREATE POLICY "DENY cross-hub audience access"
  ON mi_audience FOR SELECT
  USING (
    mi_is_hub_manager(hub_id)
    OR (auth.jwt() ->> 'user_role') = 'platform_admin'
  );

CREATE POLICY "Platform admin manages audience"
  ON mi_audience FOR ALL
  USING ((auth.jwt() ->> 'user_role') = 'platform_admin');

COMMIT;
```

---

## Block 12 — Storage Buckets

**Note:** Storage buckets are created via the Supabase Dashboard or Management API, not SQL Editor. Execute the following steps manually in the Supabase Storage dashboard.

### Step 12.1 — Create `mi-audio` bucket
- Name: `mi-audio`
- Public: **NO** (PRIVATE)
- File size limit: 50MB
- Allowed MIME types: `audio/mpeg, audio/wav, audio/flac, audio/aac, audio/ogg`

### Step 12.2 — Create `mi-covers` bucket
- Name: `mi-covers`
- Public: **YES**
- File size limit: 5MB
- Allowed MIME types: `image/webp, image/jpeg, image/png`

### Step 12.3 — Create `mi-hub-assets` bucket
- Name: `mi-hub-assets`
- Public: **YES**
- File size limit: 10MB
- Allowed MIME types: `image/webp, image/jpeg, image/png, image/svg+xml`

### Step 12.4 — Storage RLS for `mi-audio`
```sql
-- mi-audio: only service role can upload; no public download
CREATE POLICY "Service role uploads audio"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'mi-audio');

CREATE POLICY "Authenticated can request audio (signed URL generated by API)"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'mi-audio');
```

### Step 12.5 — Storage RLS for `mi-covers` and `mi-hub-assets`
```sql
-- Public read, hub manager write
CREATE POLICY "Public reads covers"
  ON storage.objects FOR SELECT USING (bucket_id IN ('mi-covers', 'mi-hub-assets'));

CREATE POLICY "Authenticated uploads covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('mi-covers', 'mi-hub-assets'));
```

---

## Block 13 — Seed Data

```sql
-- BLOCK 13A: Seed Genres (African Music Taxonomy)
INSERT INTO mi_genres (name, region, description) VALUES
  ('Afrobeats',      'West Africa',     'Contemporary African popular music blending traditional African rhythms with Western influences'),
  ('Amapiano',       'Southern Africa', 'South African jazz and house music fusion characterised by log drums and piano keys'),
  ('Highlife',       'West Africa',     'Ghanaian and Nigerian genre blending traditional music with jazz and swing'),
  ('Afropop',        'Pan-Africa',      'Commercial African pop music with broad regional appeal'),
  ('Naija Pop',      'West Africa',     'Nigerian commercial pop music targeting youth audiences'),
  ('Fuji',           'West Africa',     'Yoruba Muslim genre rooted in were music and percussion'),
  ('Juju',           'West Africa',     'Yoruba traditional music popularised by King Sunny Ade'),
  ('Afro-Soul',      'Pan-Africa',      'Soul music with distinct African melodic and rhythmic influences'),
  ('Alte',           'West Africa',     'Alternative Nigerian music blending afropop with indie and electronic influences'),
  ('Afro-House',     'Southern Africa', 'South African house music with African percussion and vocal elements'),
  ('Gqom',           'Southern Africa', 'Raw, dark electronic music from Durban townships'),
  ('Bongo Flava',    'East Africa',     'Tanzanian urban music blending hip hop, R&B, and taarab'),
  ('Benga',          'East Africa',     'Kenyan popular music characterised by fast-paced rhythms and electric guitars'),
  ('Hiplife',        'West Africa',     'Ghanaian blend of hiplife and local Ghanaian music'),
  ('Afro-Jazz',      'Pan-Africa',      'African jazz incorporating traditional instruments and polyrhythmic structures'),
  ('Nigerian Gospel','West Africa',     'Contemporary Nigerian Christian music'),
  ('Nollywood OST',  'West Africa',     'Original soundtrack music from Nigerian film productions')
ON CONFLICT (name) DO NOTHING;

-- Seed sub-genres (parent references)
INSERT INTO mi_genres (name, parent_id, region, description)
SELECT 'Alte', id, 'West Africa', 'Alternative Nigerian music — sub-genre of Afrobeats'
FROM mi_genres WHERE name = 'Afrobeats'
ON CONFLICT (name) DO NOTHING;

-- BLOCK 13B: Seed Subscription Plans
INSERT INTO mi_subscription_plans
  (name, slug, price_ngn, price_usd, billing_interval, features, skip_limit, sort_order)
VALUES
  (
    'Free', 'free', 0, 0, 'free',
    '{"ai_curator": false, "downloads": false, "analytics": false, "skip_limit": 5}',
    5, 1
  ),
  (
    'Premium', 'premium', 1500, 1.00, 'monthly',
    '{"ai_curator": true, "downloads": false, "analytics": false, "skip_limit": null}',
    NULL, 2
  ),
  (
    'Studio', 'studio', 5000, 3.00, 'monthly',
    '{"ai_curator": true, "downloads": true, "analytics": true, "skip_limit": null}',
    NULL, 3
  )
ON CONFLICT (slug) DO NOTHING;

-- BLOCK 13C: Seed Chrome Music Hub (Client #1)
INSERT INTO mi_client_hubs
  (name, slug, description, brand_color, contact_email)
VALUES
  (
    'Chrome Music',
    'chrome',
    'Home of Chrome AfroFusion Radio and the artist VaB. Afrofusion from Lagos to the world.',
    '#C0C0C0',
    'chrome@amdsolutions007.com'
  )
ON CONFLICT (slug) DO NOTHING;

-- BLOCK 13D: Seed VaB as Chrome's first artist
INSERT INTO mi_artists (hub_id, name, slug, bio)
SELECT
  h.id,
  'VaB',
  'vab',
  'VaB is the pioneering artist of Chrome Music Hub and the first artist on AMD Music Intelligence.'
FROM mi_client_hubs h
WHERE h.slug = 'chrome'
ON CONFLICT (hub_id, slug) DO NOTHING;

-- BLOCK 13E: Seed Chrome AfroFusion Radio playlist
INSERT INTO mi_playlists (hub_id, name, slug, description, is_featured)
SELECT
  h.id,
  'Chrome AfroFusion Radio',
  'chrome-afrofusion-radio',
  'The flagship playlist of Chrome Music Hub. Curated Afrofusion from VaB and the Chrome collective.',
  true
FROM mi_client_hubs h
WHERE h.slug = 'chrome'
ON CONFLICT (hub_id, slug) DO NOTHING;
```

---

## Block 14 — Validation & Verification

Execute these queries after all blocks are complete. Every query must return the expected result.

```sql
-- 14.1: Table count verification
SELECT COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'mi_%'
  AND table_type = 'BASE TABLE';
-- EXPECTED: 14

-- 14.2: View count verification
SELECT COUNT(*) AS view_count
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'mi_%';
-- EXPECTED: 7

-- 14.3: Materialised view verification
SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public';
-- EXPECTED: >= 1 (mi_agent007_context)

-- 14.4: RLS enabled on all mi_ tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'mi_%'
  AND rowsecurity = false;
-- EXPECTED: 0 rows (all tables have RLS enabled)

-- 14.5: Seed data verification
SELECT COUNT(*) FROM mi_genres;              -- EXPECTED: >= 17
SELECT COUNT(*) FROM mi_subscription_plans;  -- EXPECTED: 3
SELECT COUNT(*) FROM mi_client_hubs;         -- EXPECTED: 1 (Chrome)
SELECT COUNT(*) FROM mi_artists;             -- EXPECTED: 1 (VaB)
SELECT COUNT(*) FROM mi_playlists;           -- EXPECTED: 1 (Chrome AfroFusion Radio)

-- 14.6: Security function verification
SELECT mi_generate_short_code();  -- EXPECTED: 6-character alphanumeric string

-- 14.7: chat_logs extension verification
SELECT column_name FROM information_schema.columns
WHERE table_name = 'chat_logs'
  AND column_name IN ('agent_mode', 'hub_id', 'music_context', 'user_id');
-- EXPECTED: 4 rows

-- 14.8: Partitioned click tracking verification
SELECT schemaname, tablename FROM pg_tables
WHERE tablename LIKE 'mi_click_tracking_%';
-- EXPECTED: >= 3 rows (current + next 2 months)

-- 14.9: Cron jobs registered
SELECT jobname FROM cron.job WHERE jobname LIKE 'mi-%';
-- EXPECTED: 2 rows (mi-daily-skip-reset, mi-agent007-context-refresh)
```

**✅ All 14.x queries must return expected values before Phase 1 application development begins.**

---

## Rollback Strategy

If any block fails and cannot be resolved, execute the rollback in reverse order:

```sql
-- EMERGENCY ROLLBACK (execute in order if catastrophic failure occurs)
-- NOTE: This removes ALL Music Intelligence tables. B2B tables are unaffected.

DROP MATERIALIZED VIEW IF EXISTS mi_agent007_context;
DROP VIEW IF EXISTS mi_subscription_revenue;
DROP VIEW IF EXISTS mi_discovery_leaderboard;
DROP VIEW IF EXISTS mi_audience_growth;
DROP VIEW IF EXISTS mi_smart_link_performance;
DROP VIEW IF EXISTS mi_hub_performance;
DROP VIEW IF EXISTS mi_artist_performance;
DROP VIEW IF EXISTS mi_track_performance;

DROP TABLE IF EXISTS mi_listening_history CASCADE;
DROP TABLE IF EXISTS mi_click_tracking CASCADE;
DROP TABLE IF EXISTS mi_audience CASCADE;
DROP TABLE IF EXISTS mi_smart_links CASCADE;
DROP TABLE IF EXISTS mi_user_playlists CASCADE;
DROP TABLE IF EXISTS mi_subscriptions CASCADE;
DROP TABLE IF EXISTS mi_user_profiles CASCADE;
DROP TABLE IF EXISTS mi_playlist_tracks CASCADE;
DROP TABLE IF EXISTS mi_playlists CASCADE;
DROP TABLE IF EXISTS mi_tracks CASCADE;
DROP TABLE IF EXISTS mi_artists CASCADE;
DROP TABLE IF EXISTS mi_hub_managers CASCADE;
DROP TABLE IF EXISTS mi_subscription_plans CASCADE;
DROP TABLE IF EXISTS mi_genres CASCADE;
DROP TABLE IF EXISTS mi_client_hubs CASCADE;

DROP FUNCTION IF EXISTS mi_is_hub_manager(UUID);
DROP FUNCTION IF EXISTS mi_get_hub_role(UUID);
DROP FUNCTION IF EXISTS mi_generate_short_code();
DROP FUNCTION IF EXISTS mi_increment_play_count(UUID);
DROP FUNCTION IF EXISTS mi_increment_completion_count(UUID);
DROP FUNCTION IF EXISTS mi_increment_skip_count(UUID);
DROP FUNCTION IF EXISTS mi_increment_smart_link_clicks();
DROP FUNCTION IF EXISTS mi_reset_daily_skip_counts();

-- Reverse chat_logs extension (if block 8 was executed)
ALTER TABLE chat_logs
  DROP COLUMN IF EXISTS agent_mode,
  DROP COLUMN IF EXISTS hub_id,
  DROP COLUMN IF EXISTS music_context,
  DROP COLUMN IF EXISTS user_id;

-- Remove cron jobs
SELECT cron.unschedule('mi-daily-skip-reset');
SELECT cron.unschedule('mi-agent007-context-refresh');
```

**After rollback:** Verify B2B tables (`clients`, `chat_logs`, `automation_runs`, `portal_access`) are intact and operational.

---

## Post-Migration Checklist

- [ ] All 14 verification queries returned expected values
- [ ] Supabase Storage buckets created (`mi-audio`, `mi-covers`, `mi-hub-assets`)
- [ ] `mi-audio` bucket confirmed as PRIVATE
- [ ] Chrome Music Hub appears in Supabase table browser
- [ ] VaB artist record confirmed
- [ ] Chrome AfroFusion Radio playlist confirmed
- [ ] All 3 subscription plans present
- [ ] All 17 genres seeded
- [ ] B2B system health check: Telegram bot, RSS feed, WhatsApp bot all confirmed operational
- [ ] Migration completion timestamp recorded in AMD_MUSIC_INTEL_INTERACTION_MEMORY_LOG.md
