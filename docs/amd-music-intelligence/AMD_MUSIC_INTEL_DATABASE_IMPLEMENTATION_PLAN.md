# AMD Music Intelligence — Database Implementation Plan & Foundation Readiness Assessment

**Classification:** Pre-Implementation Definitive Blueprint  
**Date:** June 23, 2026  
**Authority:** Chief AI Architect / Chief Product Officer  
**Status:** APPROVED FOR REVIEW — NOT YET EXECUTED

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Existing Schema Inventory (What Exists Today)](#existing-schema-inventory)
3. [Gap Analysis — Missing Tables](#gap-analysis--missing-tables)
4. [Gap Analysis — Missing Relationships](#gap-analysis--missing-relationships)
5. [Gap Analysis — Missing RLS Policies](#gap-analysis--missing-rls-policies)
6. [Gap Analysis — Missing Storage Buckets](#gap-analysis--missing-storage-buckets)
7. [Gap Analysis — Missing Views & Functions](#gap-analysis--missing-views--functions)
8. [Gap Analysis — Agent 007 Intelligence Layer](#gap-analysis--agent-007-intelligence-layer)
9. [Scalability Risk Assessment](#scalability-risk-assessment)
10. [Future-Proofing Opportunities](#future-proofing-opportunities)
11. [Definitive Table Execution Order](#definitive-table-execution-order)
12. [Complete Schema Specification](#complete-schema-specification)
13. [RLS Policy Specification](#rls-policy-specification)
14. [Storage Architecture Specification](#storage-architecture-specification)
15. [Foundation Readiness Scorecard](#foundation-readiness-scorecard)
16. [Final Recommendation](#final-recommendation)

---

## Executive Summary

The AMD Control Center currently contains a production Supabase schema (`supabase-schema.sql`) with **4 tables**, **2 views**, **1 trigger function**, and **0 storage buckets** — all designed exclusively for the B2B agency arm (Wing A/B of the AMD ecosystem).

The AMD Music Intelligence architecture, approved across six strategic sessions, requires a **fundamentally parallel database schema** of **14 new tables**, **8 new views**, **4 new trigger functions**, **2 storage buckets**, and **31 distinct RLS policies** to support the full N-tier hierarchy:

```
AMD Music Intelligence (Master Platform)
    └── mi_client_hubs       (Chrome, Future Clients)
        └── mi_artists        (VaB, Future Artists)
            └── mi_tracks     (Chrome AfroFusion Radio tracks)
                └── mi_click_tracking (AMD Click Tracking Layer)
```

**Critical Finding:** The documentation produced across all sessions contains **conceptual schema sketches only**. No table has been formally defined with complete columns, constraints, indexes, or RLS policies. The approved architecture exists entirely as prose. The gap between documented intent and implementation-ready SQL is 100%.

**Readiness Score: 8/100** — The strategic vision is complete. The database foundation is empty.

---

## Existing Schema Inventory

### Tables (4 — B2B Agency Only)

| Table | Purpose | Row Count (Est.) | Music Intelligence Relevance |
|---|---|---|---|
| `clients` | B2B lead/CRM tracking | Active | NONE — Do not touch |
| `chat_logs` | Agent 007 conversation logs | Active | EXTEND — Add `mode` and `hub_id` columns |
| `automation_runs` | Wing A 24-Job Engine tracking | Active | NONE — Do not touch |
| `portal_access` | B2B Client Portal PIN auth | Active | NONE — Do not touch |

### Views (2 — B2B Agency Only)
- `daily_automation_stats` — Social engine performance. Music Intelligence has no relationship.
- `client_funnel` — B2B CRM funnel. Music Intelligence has no relationship.

### Functions (1)
- `update_updated_at_column()` — Generic trigger function. **Reusable** for all new `mi_*` tables.

### Storage Buckets (0)
No storage buckets exist anywhere in the current schema. Audio files have no home.

### Indexes (6 — B2B Agency Only)
All existing indexes serve the B2B tables. None are relevant to Music Intelligence.

---

## Gap Analysis — Missing Tables

The following **14 tables** are required and entirely absent from the current schema. They are ordered by dependency (no table references a table listed after it).

### TIER 1 — Platform Foundation (No Dependencies)

**1. `mi_client_hubs`** ❌ MISSING  
*Approved in: Architecture Review, Validation Audit, Agent 007 Expansion*  
Required to represent Chrome and all future clients. Currently described only in documentation prose.  
**Missing columns:** `status`, `brand_color`, `logo_url`, `contact_email`, `created_at`, `updated_at`, `is_active`  
**Missing:** Primary key default, indexes, RLS, `updated_at` trigger

**2. `mi_genres`** ❌ MISSING — COMPLETELY UNDOCUMENTED  
*Identified in: Agent 007 Discovery Engine review ("African music tagging taxonomy")*  
A normalised genre/mood reference table is essential for the Discovery Engine. Without it, genres are stored as free-text strings across tracks, making the AI Curator's filtering unreliable and the recommendation engine incoherent.  
**Why undocumented:** Every prior session referenced genres as strings (e.g., `genre TEXT`). This is a critical architectural oversight.

**3. `mi_subscription_plans`** ❌ MISSING — COMPLETELY UNDOCUMENTED  
*Approved in: Product Blueprint (Free, Premium tiers), Authentication Audit (subscription enforcement)*  
The Paystack integration requires a reference table of available plans. Without it, subscription logic is hardcoded and cannot be updated without a deployment.

### TIER 2 — Artist & Content Layer (Depends on Tier 1)

**4. `mi_artists`** ❌ MISSING  
*Approved in: Architecture Review*  
Described in documentation but critically underdeveloped. The current documentation sketch contains only `id`, `hub_id`, `name`.  
**Missing columns:** `bio`, `profile_image_url`, `social_links` (JSONB), `genre_tags` (UUID[] referencing `mi_genres`), `created_at`, `is_active`

**5. `mi_tracks`** ❌ MISSING  
*Approved in: Database Blueprint, Architecture Review*  
Currently documented with only 4 columns. Critically missing audio intelligence metadata needed by Agent 007's Discovery Engine and future AI DJ.  
**Missing columns:** `genre_id`, `mood_tags` (TEXT[]), `bpm` (INTEGER), `audio_key` (TEXT), `energy_level` (INTEGER 1-10), `duration_seconds`, `audio_url`, `cover_url`, `release_date`, `is_active`, `play_count`, `created_at`, `updated_at`  
**Missing:** All indexes, all RLS, `updated_at` trigger

**6. `mi_playlists`** ❌ MISSING  
*Approved in: Database Blueprint*  
Described in prose but never formally specified.  
**Missing columns:** `hub_id` (CRITICAL — playlists must be attributed to a Client Hub), `is_ai_generated`, `cover_url`, `description`, `total_plays`, `created_at`, `updated_at`

**7. `mi_playlist_tracks`** ❌ MISSING  
*Approved in: Database Blueprint*  
Junction table between playlists and tracks. No formal definition exists.  
**Missing:** Composite primary key definition, `position` ordering column, `added_at` timestamp, indexes on both foreign keys

### TIER 3 — User & Subscription Layer (Depends on Tiers 1 & 2)

**8. `mi_user_profiles`** ❌ MISSING — COMPLETELY UNDOCUMENTED  
*Implied in: Authentication Audit (user accounts, playlist ownership), Agent 007 Expansion (user context injection)*  
The Authentication Audit correctly identified that Supabase `auth.users` must be extended with a profile table. No profile table has ever been designed or mentioned by name in any document.  
**Why critical:** Without this table, there is no way to store subscription tier, listening preferences, or the Agent 007 context (`music_preferences`, `discovery_history`) that makes personalisation possible.  
**Required columns:** `user_id` (FK to `auth.users`), `display_name`, `avatar_url`, `subscription_plan_id`, `subscription_status`, `paystack_customer_id`, `whatsapp_verified`, `telegram_chat_id`, `preferred_genres` (UUID[]), `created_at`

**9. `mi_subscriptions`** ❌ MISSING — COMPLETELY UNDOCUMENTED  
*Approved in: Product Blueprint, Authentication Audit (subscription enforcement)*  
Every session discussed "Premium subscriptions via Paystack" but no table was ever designed to record subscription events.  
**Required columns:** `id`, `user_id`, `plan_id`, `paystack_reference`, `paystack_subscription_code`, `status`, `current_period_start`, `current_period_end`, `cancelled_at`, `created_at`  
**Why critical:** Without this table, the Paystack webhook has nowhere to write, and premium enforcement has no source of truth.

**10. `mi_user_playlists`** ❌ MISSING  
*Approved in: Database Blueprint (as `mi_playlists`)*  
Note: There are TWO distinct playlist types that were conflated in the documentation:  
  - `mi_playlists` — Admin/Client Hub managed playlists (Chrome AfroFusion Radio)  
  - `mi_user_playlists` — User-generated personal playlists (My Sunday Morning Mix)  
These must be separate tables with separate RLS policies.

### TIER 4 — Tracking & Analytics Layer (Depends on All Above)

**11. `mi_click_tracking`** ❌ MISSING  
*Approved in: Architecture Review, Agent 007 Expansion (AMD Click Tracking Layer)*  
The single most important table for the business model. Currently documented with only 5 columns.  
**Missing columns:** `smart_link_id` (FK), `hub_id`, `artist_id`, `playlist_id`, `referrer_url`, `user_country`, `user_device_type`, `session_id`, `ip_hash` (hashed, not raw — GDPR)  
**Missing:** Partitioning strategy (this table will grow by thousands of rows daily — no partition plan documented)

**12. `mi_listening_history`** ❌ MISSING  
*Approved in: Database Blueprint*  
Documented conceptually. Never formally specified with all required columns.  
**Missing columns:** `hub_id`, `skip_timestamp_seconds` (CRITICAL — where did they skip? 0:05 vs 1:30 tells a completely different story), `source_playlist_id`, `device_type`

**13. `mi_smart_links`** ❌ MISSING — COMPLETELY UNDOCUMENTED  
*Approved in: SmartLink System review*  
Every session discussed Smart Links. No table was ever designed to store them.  
**Required columns:** `id`, `short_code` (UNIQUE), `hub_id`, `artist_id`, `track_id`, `playlist_id`, `destination_type` (track/playlist/hub/artist), `custom_og_title`, `custom_og_description`, `custom_og_image_url`, `total_clicks`, `is_active`, `created_at`

**14. `mi_audience`** ❌ MISSING  
*Approved in: Architecture Review, Agent 007 Audience Intelligence*  
Documented conceptually. The current spec is dangerously minimal.  
**Missing columns:** `source_smart_link_id`, `source_playlist_id`, `acquisition_incentive` (what did we offer for the contact?), `consent_timestamp` (MANDATORY — legal requirement), `consent_text_version` (which consent copy did they see?), `is_verified`, `opt_out_at`  
**Missing:** GDPR compliance fields are entirely absent from all documentation

---

## Gap Analysis — Missing Relationships

### Orphaned References (No Foreign Key)
| Relationship | Current State | Required State |
|---|---|---|
| `mi_playlists` → `mi_client_hubs` | Not documented | `hub_id UUID REFERENCES mi_client_hubs(id)` |
| `mi_click_tracking` → `mi_smart_links` | Not documented | `smart_link_id UUID REFERENCES mi_smart_links(id)` |
| `mi_click_tracking` → `mi_client_hubs` | Not documented | `hub_id UUID REFERENCES mi_client_hubs(id)` |
| `mi_listening_history` → `mi_playlists` | Not documented | `source_playlist_id UUID REFERENCES mi_playlists(id)` |
| `mi_tracks` → `mi_genres` | Not documented | `genre_id UUID REFERENCES mi_genres(id)` |
| `mi_user_profiles` → `auth.users` | Not documented | `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` |
| `mi_subscriptions` → `mi_subscription_plans` | Not documented | `plan_id UUID REFERENCES mi_subscription_plans(id)` |
| `mi_audience` → `mi_smart_links` | Not documented | `source_smart_link_id UUID REFERENCES mi_smart_links(id)` |

### Missing Cascade Strategies
No document has defined what happens when a `mi_client_hub` is deactivated:
- Should its `mi_artists` be soft-deleted? (RECOMMENDED — `is_active = false`)
- Should its `mi_tracks` be hidden? (RECOMMENDED — `is_active = false`)
- Should its `mi_click_tracking` history be preserved? (YES — immutable audit trail)
- Should its `mi_audience` contacts remain? (YES — they are owned by AMD, not the hub)

---

## Gap Analysis — Missing RLS Policies

### Current State
Zero RLS policies exist for any Music Intelligence table. The existing B2B policies (`auth.role() = 'authenticated'`) are insufficient for the multi-tenant Client Hub model.

### Required Policy Architecture (31 Policies)

#### The Multi-Tenant Problem
The existing schema uses `auth.role() = 'authenticated'` which grants any logged-in user access to everything. For Music Intelligence, access must be scoped by:
1. **Platform Admin** — AMD Solutions staff. Access everything.
2. **Hub Manager** — Chrome's team. Access only `hub_id = their_hub_id`.
3. **Premium User** — Paid B2C listener. Access premium tracks and personal playlists.
4. **Free User** — Unpaid B2C listener. Limited access.
5. **Anonymous** — Unauthenticated visitor. Read-only public catalog.

#### The Critical Missing Architecture: `mi_hub_managers`
No document has defined HOW the system knows which authenticated user manages which Client Hub. There is no junction table linking `auth.users` to `mi_client_hubs`. Without this table, it is impossible to write correct RLS policies for Hub Managers. This is the **single most critical missing piece** in the entire database architecture.

**Required (undocumented) table:**
```
mi_hub_managers (user_id, hub_id, role: 'owner'|'editor'|'viewer', created_at)
```

This table is the keystone of the multi-tenant security model. Every Artist Intelligence RLS policy depends on it.

#### Policy Inventory Required

| Table | Policy | Grantee | Operation |
|---|---|---|---|
| `mi_client_hubs` | View active hubs | Public (anon) | SELECT |
| `mi_client_hubs` | Manage own hub | Hub Manager | ALL |
| `mi_client_hubs` | Manage all hubs | Platform Admin | ALL |
| `mi_artists` | View active artists | Public (anon) | SELECT |
| `mi_artists` | Manage hub artists | Hub Manager (own hub) | INSERT/UPDATE/DELETE |
| `mi_tracks` | View active tracks | Public (anon) | SELECT |
| `mi_tracks` | Manage hub tracks | Hub Manager (own hub) | INSERT/UPDATE/DELETE |
| `mi_playlists` | View active playlists | Public (anon) | SELECT |
| `mi_user_playlists` | Full own playlist access | Authenticated User (own) | ALL |
| `mi_click_tracking` | Insert own clicks | Public (anon) | INSERT |
| `mi_click_tracking` | View hub analytics | Hub Manager (own hub) | SELECT |
| `mi_click_tracking` | View all analytics | Platform Admin | SELECT |
| `mi_listening_history` | Insert own history | Public (anon) | INSERT |
| `mi_listening_history` | View own history | Authenticated User (own) | SELECT |
| `mi_listening_history` | View hub history | Hub Manager (own hub) | SELECT |
| `mi_audience` | Insert (capture) | Public (anon) | INSERT |
| `mi_audience` | View hub audience | Hub Manager (own hub) | SELECT |
| `mi_audience` | NEVER cross-hub | DENY | ALL |
| `mi_subscriptions` | View own subscription | Authenticated User (own) | SELECT |
| `mi_subscriptions` | Write via service role | Paystack webhook handler | INSERT/UPDATE |
| `mi_user_profiles` | View own profile | Authenticated User (own) | SELECT/UPDATE |
| `mi_smart_links` | View active links | Public (anon) | SELECT |
| `mi_smart_links` | Manage hub links | Hub Manager (own hub) | ALL |
| `mi_hub_managers` | View own assignments | Authenticated User | SELECT |
| `mi_hub_managers` | Manage all | Platform Admin | ALL |

**Total: 25 explicit policies + 6 denial policies = 31 RLS policies required**

---

## Gap Analysis — Missing Storage Buckets

### Current State
**Zero storage buckets** configured. This is a blocking issue for Phase 1 MVP.

### Required Buckets

#### Bucket 1: `mi-audio` (PRIVATE)
**Correction from previous documentation:** The earlier architecture spec recommended a **public** audio bucket. This is wrong for three reasons:
1. Public URLs allow direct MP3 download and redistribution, violating artist rights
2. A public bucket cannot enforce Premium-only gating
3. Artist Intelligence cannot track plays (if the audio is fetched directly from storage, no tracking event fires)

**Correct approach:** Private bucket. Audio is served via **short-lived signed URLs** generated by the Next.js API route. The signed URL is valid for 4 hours only. This means:
- Play tracking fires before the URL is generated
- Premium enforcement is handled in the API route before generating the URL
- Artists retain control of their content

**Configuration:**
- Visibility: PRIVATE
- Max file size: 50MB (WAV/FLAC) / 15MB (MP3)
- Allowed MIME types: `audio/mpeg`, `audio/wav`, `audio/flac`, `audio/aac`
- Path structure: `{hub_id}/{artist_id}/{track_id}.mp3`
- RLS: Service role only for upload; authenticated API route for signed URL generation

#### Bucket 2: `mi-covers` (PUBLIC)
**Correct approach:** Public. Cover art is marketing material. It should be aggressively cached.

**Configuration:**
- Visibility: PUBLIC
- Max file size: 5MB
- Allowed MIME types: `image/webp`, `image/jpeg`, `image/png`
- Path structure: `{hub_id}/{artist_id}/{track_id}.webp`
- Cache-Control: `public, max-age=31536000, immutable`
- RLS: Service role for upload; public for read

#### Bucket 3: `mi-hub-assets` (PUBLIC)
**Not previously documented.** Hub logos, banner images, and artist profile photos need a dedicated bucket separated from track artwork.

**Configuration:**
- Visibility: PUBLIC
- Max file size: 10MB
- Allowed MIME types: `image/webp`, `image/jpeg`, `image/png`, `image/svg+xml`
- Path structure: `hubs/{hub_id}/logo.webp`, `artists/{artist_id}/profile.webp`

---

## Gap Analysis — Missing Views & Functions

### Missing Views

**1. `mi_hub_performance`**  
Aggregates click tracking and listening history per hub per day. Powers the Artist Intelligence dashboard. Not documented.

**2. `mi_track_performance`**  
Per-track analytics: total plays, completion rate, skip rate, DSP click-through rate. Not documented.

**3. `mi_artist_performance`**  
Aggregates track performance to artist level. Needed by Agent 007 for Artist Intelligence queries. Not documented.

**4. `mi_audience_growth`**  
Daily audience capture counts per hub. Essential for Audience Intelligence. Not documented.

**5. `mi_discovery_leaderboard`**  
Top tracks by completion rate (not just play count — completion rate is a superior signal). Not documented.

**6. `mi_smart_link_performance`**  
Click-through rates per Smart Link, broken down by DSP destination. Not documented.

**7. `mi_subscription_revenue`**  
Monthly recurring revenue aggregated by plan. Service role only. Not documented.

**8. `mi_agent007_context`** *(CRITICAL — completely undocumented)*  
A materialised view that pre-computes the catalog summary Agent 007 needs for music intelligence queries. Instead of querying 5 tables on every conversation turn, Agent 007 queries this single pre-computed view. Not documented in any session.

### Missing Functions

**1. `mi_generate_short_code()`**  
Generates unique 6-character alphanumeric codes for Smart Links. Must guarantee uniqueness without sequential IDs.

**2. `mi_increment_play_count(track_id)`**  
Atomic counter increment on `mi_tracks.play_count`. Must use `UPDATE ... SET play_count = play_count + 1` to prevent race conditions under concurrent load.

**3. `mi_get_signed_audio_url(track_id, user_id)`**  
Database-level function that validates user subscription before returning a signed URL token. Keeps subscription enforcement logic in one place.

**4. `update_updated_at_column()`**  
Already exists. Reuse for all new `mi_*` tables that have `updated_at` columns.

---

## Gap Analysis — Agent 007 Intelligence Layer

### Missing Database Support for Agent 007 Modes

The Agent 007 Architecture session defined context-aware mode switching. The database has no structures to support this.

**Missing: `mi_agent007_sessions`**  
Agent 007 currently logs conversations to `chat_logs` with only `session_id`. For Music Intelligence, the agent needs to:
- Know which `user_id` it is talking to (personalisation)
- Know which `hub_id` context it is operating in (Chrome vs future hubs)
- Know the agent `mode` (`corporate` | `music_discovery` | `artist_intelligence` | `dj`)
- Carry `listening_context` (what the user played recently in this session)

**Recommended approach:** Extend `chat_logs` with new columns rather than creating a new table:
- ADD COLUMN `user_id UUID REFERENCES auth.users(id)`
- ADD COLUMN `hub_id UUID REFERENCES mi_client_hubs(id)`
- ADD COLUMN `agent_mode TEXT DEFAULT 'corporate'`
- ADD COLUMN `music_context JSONB` (last 5 tracks played, current playlist, active hub)

This preserves the existing B2B chat logs while extending the table for Music Intelligence context.

---

## Scalability Risk Assessment

### Risk 1 — `mi_click_tracking` Table Growth (CRITICAL)
**Severity: HIGH**  
**Assessment:** Every Smart Link click, every DSP redirect, every play event writes a row. At 1,000 daily active users clicking 10 links each, this table grows by 10,000 rows/day = 300,000 rows/month = 3.6M rows/year. Standard Supabase (PostgreSQL) handles this, but queries will degrade without proper partitioning.  
**Required:** Partition `mi_click_tracking` by `RANGE` on `created_at` (monthly partitions). Not documented anywhere.

### Risk 2 — Audio Signed URL Generation Under Load (HIGH)
**Severity: HIGH**  
**Assessment:** If 500 users simultaneously request audio playback, the API generates 500 signed URLs in parallel, each requiring a Supabase auth call and a subscription validation query. Without connection pooling (PgBouncer) and query optimization, this becomes a bottleneck at scale.  
**Required:** Enable Supabase connection pooling. Cache subscription status in the user's JWT custom claims to eliminate per-request DB validation.

### Risk 3 — Agent 007 Catalog Queries (MEDIUM)
**Severity: MEDIUM**  
**Assessment:** Every Agent 007 music query hits `mi_tracks`, `mi_artists`, `mi_genres`, and `mi_client_hubs` simultaneously. As the catalog grows to 1,000+ tracks, real-time query times will increase.  
**Required:** The `mi_agent007_context` materialised view (identified above) must be refreshed every 15 minutes and serve as Agent 007's primary catalog source.

### Risk 4 — Multi-Tenant RLS Performance (MEDIUM)
**Severity: MEDIUM**  
**Assessment:** RLS policies that JOIN to `mi_hub_managers` on every query add latency. At low user counts, this is invisible. At 10,000+ users, it becomes measurable.  
**Required:** Index `mi_hub_managers(user_id, hub_id)` as a composite index. Consider caching hub manager assignments in JWT custom claims.

### Risk 5 — GDPR / Data Protection (CRITICAL)
**Severity: CRITICAL**  
**Assessment:** The `mi_audience` table collects WhatsApp numbers and email addresses of Nigerian users. Nigeria's NDPR (Nigeria Data Protection Regulation) and EU GDPR (for international users) require explicit consent records, data retention limits, and the right to erasure. The current documentation has zero GDPR provisions.  
**Required:** `consent_timestamp`, `consent_text_version`, `ip_at_consent` (hashed), `opt_out_at`, `deletion_requested_at`. A `DELETE /api/music/audience/unsubscribe` endpoint must exist on day one.

---

## Future-Proofing Opportunities

### 1. pgvector for Recommendation Engine (Phase 2 Ready)
The Recommendation Engine session identified pgvector as the path from prompt-stuffing to scalable semantic search. The schema should reserve a `mi_tracks.embedding VECTOR(1536)` column from day one (nullable). When the Recommendation Engine is built, the column is simply populated — no migration required.

### 2. Multi-Currency Subscription Support
The current plan assumes Nigerian Naira (₦) via Paystack. But AMD Music Intelligence is an "African Music Discovery Engine" — not just Nigerian. The `mi_subscription_plans` table should include `currency TEXT DEFAULT 'NGN'` and `price_usd DECIMAL` from day one to accommodate GHS, KES, ZAR, and USD without a breaking schema change.

### 3. Artist Revenue Splits
When AMD Music Intelligence eventually facilitates premium content revenue, the database must support revenue splits between the platform and Client Hubs. Adding a `revenue_share_percentage DECIMAL DEFAULT 70.00` column to `mi_client_hubs` now costs nothing and prevents a complex migration later.

### 4. Content Licensing Tiers per Track
Some tracks in the catalog may have geographical restrictions or licensing limitations. Adding a `licensed_territories TEXT[] DEFAULT ARRAY['*']` column to `mi_tracks` from day one (default: all territories) future-proofs content licensing without re-architecturing the track model.

---

## Definitive Table Execution Order

The following represents the ONLY safe order to create these tables. Violating this order will produce foreign key constraint errors.

```
BATCH 1 — No Dependencies (Execute simultaneously)
├── mi_genres
├── mi_subscription_plans
└── mi_client_hubs

BATCH 2 — Depends on Batch 1
├── mi_hub_managers     (depends on: mi_client_hubs + auth.users)
└── mi_artists          (depends on: mi_client_hubs, mi_genres)

BATCH 3 — Depends on Batch 2
├── mi_tracks           (depends on: mi_artists, mi_genres)
└── mi_user_profiles    (depends on: auth.users, mi_subscription_plans)

BATCH 4 — Depends on Batch 3
├── mi_playlists        (depends on: mi_client_hubs, mi_user_profiles)
├── mi_subscriptions    (depends on: mi_user_profiles, mi_subscription_plans)
└── mi_audience         (depends on: mi_client_hubs)

BATCH 5 — Depends on Batch 4
├── mi_playlist_tracks  (depends on: mi_playlists, mi_tracks)
├── mi_user_playlists   (depends on: mi_user_profiles)
└── mi_smart_links      (depends on: mi_client_hubs, mi_artists, mi_tracks, mi_playlists)

BATCH 6 — Depends on Batch 5 (Analytics Layer — Execute Last)
├── mi_click_tracking   (depends on: mi_tracks, mi_smart_links, mi_client_hubs)
└── mi_listening_history (depends on: mi_tracks, mi_playlists, mi_user_profiles)

BATCH 7 — Views & Functions (Execute after all tables)
├── mi_hub_performance (VIEW)
├── mi_track_performance (VIEW)
├── mi_artist_performance (VIEW)
├── mi_audience_growth (VIEW)
├── mi_discovery_leaderboard (VIEW)
├── mi_smart_link_performance (VIEW)
├── mi_subscription_revenue (VIEW)
├── mi_agent007_context (MATERIALISED VIEW)
├── mi_generate_short_code() (FUNCTION)
├── mi_increment_play_count() (FUNCTION)
└── Triggers on all mi_* tables with updated_at
```

---

## Complete Schema Specification

### `mi_client_hubs`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `name` | TEXT | NOT NULL | "Chrome Music" |
| `slug` | TEXT | UNIQUE NOT NULL | "chrome" — URL-safe |
| `brand_color` | TEXT | | "#7B2FFF" — Hub accent |
| `logo_url` | TEXT | | Storage reference |
| `cover_url` | TEXT | | Hero banner |
| `contact_email` | TEXT | | Hub owner contact |
| `revenue_share_pct` | DECIMAL | DEFAULT 70.00 | Future-proofing |
| `is_active` | BOOLEAN | DEFAULT true | Soft delete |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Trigger |

### `mi_genres`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `name` | TEXT | UNIQUE NOT NULL | "Afrobeats", "Amapiano" |
| `parent_id` | UUID | FK → mi_genres(id) | Sub-genres (e.g., Alte under Afrobeats) |
| `region` | TEXT | | "West Africa", "Southern Africa" |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### `mi_subscription_plans`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `name` | TEXT | NOT NULL | "Free", "Premium" |
| `price_ngn` | DECIMAL | NOT NULL | ₦1,500 |
| `price_usd` | DECIMAL | | $1.00 |
| `currency` | TEXT | DEFAULT 'NGN' | |
| `interval` | TEXT | CHECK IN ('monthly','annual') | |
| `features` | JSONB | | Feature flags |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### `mi_hub_managers` *(THE KEYSTONE TABLE)*
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `user_id` | UUID | FK → auth.users(id) ON DELETE CASCADE | |
| `hub_id` | UUID | FK → mi_client_hubs(id) ON DELETE CASCADE | |
| `role` | TEXT | CHECK IN ('owner','editor','viewer') | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| **INDEX** | | UNIQUE(user_id, hub_id) | Prevent duplicates |

### `mi_artists`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `hub_id` | UUID | FK → mi_client_hubs(id) | |
| `name` | TEXT | NOT NULL | "VaB" |
| `bio` | TEXT | | |
| `profile_image_url` | TEXT | | Storage reference |
| `genre_tags` | UUID[] | | FK array → mi_genres |
| `social_links` | JSONB | | {spotify, instagram, twitter} |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Trigger |

### `mi_tracks`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `artist_id` | UUID | FK → mi_artists(id) | |
| `hub_id` | UUID | FK → mi_client_hubs(id) | Denormalized for performance |
| `title` | TEXT | NOT NULL | |
| `genre_id` | UUID | FK → mi_genres(id) | |
| `mood_tags` | TEXT[] | | ['energetic','uplifting'] |
| `bpm` | INTEGER | | For AI DJ Phase |
| `audio_key` | TEXT | | Musical key — AI DJ Phase |
| `energy_level` | INTEGER | CHECK 1-10 | Discovery Engine signal |
| `duration_seconds` | INTEGER | | |
| `audio_url` | TEXT | NOT NULL | Storage path (PRIVATE) |
| `cover_url` | TEXT | | Storage path (PUBLIC) |
| `dsp_links` | JSONB | | {spotify, apple, audiomack, boomplay} |
| `release_date` | DATE | | |
| `play_count` | INTEGER | DEFAULT 0 | Atomic increments only |
| `embedding` | VECTOR(1536) | NULLABLE | pgvector — Phase 2 |
| `licensed_territories` | TEXT[] | DEFAULT ARRAY['*'] | Future-proofing |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Trigger |

### `mi_audience`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `hub_id` | UUID | FK → mi_client_hubs(id) NOT NULL | NEVER NULL |
| `email` | TEXT | | |
| `whatsapp` | TEXT | | E.164 format |
| `telegram_username` | TEXT | | |
| `source_smart_link_id` | UUID | FK → mi_smart_links(id) | Attribution |
| `acquisition_incentive` | TEXT | | What was offered |
| `consent_timestamp` | TIMESTAMPTZ | NOT NULL | LEGAL REQUIREMENT |
| `consent_text_version` | TEXT | NOT NULL | "v1.0" — LEGAL |
| `ip_hash` | TEXT | | SHA256 hashed — NOT raw IP |
| `is_verified` | BOOLEAN | DEFAULT false | |
| `opt_out_at` | TIMESTAMPTZ | | Right to erasure |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### `mi_smart_links`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `short_code` | TEXT | UNIQUE NOT NULL | 6-char alphanumeric |
| `hub_id` | UUID | FK → mi_client_hubs(id) | |
| `artist_id` | UUID | FK → mi_artists(id) | NULLABLE |
| `track_id` | UUID | FK → mi_tracks(id) | NULLABLE |
| `playlist_id` | UUID | FK → mi_playlists(id) | NULLABLE |
| `destination_type` | TEXT | CHECK IN ('track','playlist','artist','hub') | |
| `og_title` | TEXT | | Custom Open Graph title |
| `og_description` | TEXT | | |
| `og_image_url` | TEXT | | |
| `total_clicks` | INTEGER | DEFAULT 0 | Denormalized counter |
| `is_active` | BOOLEAN | DEFAULT true | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

### `mi_click_tracking`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `smart_link_id` | UUID | FK → mi_smart_links(id) | NULLABLE if direct |
| `hub_id` | UUID | FK → mi_client_hubs(id) NOT NULL | Always attributed |
| `artist_id` | UUID | FK → mi_artists(id) | |
| `track_id` | UUID | FK → mi_tracks(id) | |
| `playlist_id` | UUID | FK → mi_playlists(id) | |
| `destination_dsp` | TEXT | CHECK IN ('spotify','apple','audiomack','boomplay','internal') | |
| `referrer_url` | TEXT | | Where they came from |
| `user_country` | TEXT | | Geolocation |
| `user_device_type` | TEXT | CHECK IN ('mobile','desktop','tablet') | |
| `session_id` | TEXT | | Browser session |
| `ip_hash` | TEXT | | SHA256 hashed |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Partition key |
| **PARTITION** | | BY RANGE (created_at) | MONTHLY — REQUIRED |

### `mi_listening_history`
| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | UUID | PK DEFAULT gen_random_uuid() | |
| `user_id` | UUID | FK → auth.users(id) | NULLABLE (anonymous) |
| `session_id` | TEXT | NOT NULL | |
| `hub_id` | UUID | FK → mi_client_hubs(id) | |
| `track_id` | UUID | FK → mi_tracks(id) ON DELETE CASCADE | |
| `source_playlist_id` | UUID | FK → mi_playlists(id) | How they found it |
| `play_duration_seconds` | INTEGER | DEFAULT 0 | |
| `skip_timestamp_seconds` | INTEGER | NULLABLE | Where they skipped |
| `completed` | BOOLEAN | DEFAULT false | |
| `device_type` | TEXT | | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

---

## RLS Policy Specification

### Hub Manager Ownership Helper Function
```
-- Required before any Hub Manager policies can work
CREATE OR REPLACE FUNCTION mi_is_hub_manager(p_hub_id UUID)
RETURNS BOOLEAN AS
  SELECT EXISTS (
    SELECT 1 FROM mi_hub_managers
    WHERE user_id = auth.uid() AND hub_id = p_hub_id
  )
LANGUAGE SQL SECURITY DEFINER;
```

This function is called inside RLS policies. It ensures that checking "is this user a manager of this hub?" is a single function call, not repeated JOIN logic in every policy.

### Policy Priority Order
1. Platform Admin policies (broadest — checked last, applied first by Postgres)
2. Hub Manager policies (mid-tier, scoped by hub)
3. Authenticated User policies (personal data only)
4. Anonymous policies (insert only, no select on sensitive data)
5. Explicit DENY policies (override all above)

---

## Storage Architecture Specification

### Bucket Configuration Summary

| Bucket | Visibility | Max Size | MIME Types | Cache-Control | Path Pattern |
|---|---|---|---|---|---|
| `mi-audio` | PRIVATE | 50MB | audio/* | N/A (signed URLs) | `{hub_id}/{artist_id}/{track_id}` |
| `mi-covers` | PUBLIC | 5MB | image/webp, jpeg, png | max-age=31536000 | `{hub_id}/{artist_id}/{track_id}` |
| `mi-hub-assets` | PUBLIC | 10MB | image/webp, jpeg, png, svg | max-age=86400 | `hubs/{hub_id}/`, `artists/{artist_id}/` |

### Audio Delivery Flow (Corrected from Previous Documentation)
```
User clicks Play
    → POST /api/music/play { track_id, user_id }
    → API validates subscription tier
    → API inserts row into mi_listening_history
    → API generates Supabase signed URL (4hr expiry)
    → API returns signed URL
    → Browser <audio> element loads from signed URL
    → Browser beacons completion/skip to POST /api/music/analytics
```

This flow ensures: (1) every play is tracked before audio loads, (2) premium gating is enforced server-side, and (3) audio files are never publicly downloadable.

---

## Foundation Readiness Scorecard

| Domain | Status | Score | Blocking? |
|---|---|---|---|
| Strategic Vision | ✅ Complete | 100/100 | No |
| Multi-Tenant Architecture Design | ✅ Complete | 95/100 | No |
| Agent 007 Intelligence Design | ✅ Complete | 90/100 | No |
| Table Definitions (conceptual) | ⚠️ Partial | 40/100 | YES |
| Table Definitions (implementation-ready) | ❌ None | 0/100 | YES |
| RLS Policy Design | ❌ None | 0/100 | YES |
| `mi_hub_managers` Keystone Table | ❌ Undocumented | 0/100 | YES — Blocker |
| `mi_user_profiles` Table | ❌ Undocumented | 0/100 | YES — Blocker |
| `mi_subscriptions` Table | ❌ Undocumented | 0/100 | YES — Blocker |
| GDPR Compliance Fields | ❌ Undocumented | 0/100 | YES — Legal |
| Storage Buckets | ❌ None | 0/100 | YES |
| Audio Delivery Architecture | ⚠️ Incorrectly specified (was public) | 20/100 | YES |
| Scalability Planning | ❌ None | 0/100 | No (Phase 2) |
| Views & Functions | ❌ None | 0/100 | No (Phase 2) |

**OVERALL FOUNDATION READINESS: 8/100**

---

## Final Recommendation

### The Three Absolute Blockers

Before a single line of application code is written for AMD Music Intelligence, three database elements are unconditional requirements:

**Blocker 1 — `mi_hub_managers`**  
This table is the keystone of the entire multi-tenant security model. Without it, it is architecturally impossible to write correct RLS policies for Artist Intelligence. Every other table's security depends on it.

**Blocker 2 — `mi_user_profiles` + `mi_subscriptions`**  
Without these two tables, Premium subscription enforcement is impossible. The Paystack webhook has nowhere to write. User personalisation for Agent 007 Music Intelligence mode has no persistence layer. These are not Phase 2 features — they are pre-requisites for Phase 1 monetisation.

**Blocker 3 — Corrected Audio Storage Architecture**  
The `mi-audio` bucket must be PRIVATE. The signed URL delivery flow must be implemented server-side. Launching with a public bucket exposes artist content to unrestricted downloading on day one, which will immediately destroy trust with Chrome Music Hub and prevent any future Client Hub from joining the platform.

### The Recommended Execution Sequence

1. **Week 1:** Execute Batch 1-3 tables (foundation + hub security model)
2. **Week 1:** Create storage buckets with correct visibility settings
3. **Week 1:** Write all 31 RLS policies
4. **Week 2:** Execute Batch 4-6 tables (user, subscription, analytics layers)
5. **Week 2:** Extend `chat_logs` with Agent 007 Music Intelligence columns
6. **Week 3:** Create all views and functions
7. **Week 3:** Seed initial data (Chrome hub, VaB artist, 20 tracks minimum)
8. **Week 4:** Begin application layer development

### The Non-Negotiable Law

Every number that appears in an analytics widget, every play count displayed on a track, every audience count shown on a dashboard must trace to a real database row. There are no exceptions. The platform's credibility with artists and labels is built entirely in the first 90 days. A single fabricated metric discovered by a Client Hub owner will permanently destroy trust that no marketing budget can rebuild.

The database is the business. Build it with the same authority that the AGENTS.md constitution commands over the rest of the AMD ecosystem.
