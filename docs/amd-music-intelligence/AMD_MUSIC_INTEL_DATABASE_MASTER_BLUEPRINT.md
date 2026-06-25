# AMD Music Intelligence — Database Master Blueprint

**Document Class:** Implementation Foundation — Phase 1  
**Version:** 1.0.0  
**Date:** June 23, 2026  
**Authority:** Chief AI Architect / Platform Architect  
**Status:** APPROVED FOR IMPLEMENTATION

> This document is the supreme law of the AMD Music Intelligence database layer.
> Every table, column, constraint, index, and policy defined here is final unless
> amended through a formal architectural decision recorded in the Interaction Memory Log.
> Do not deviate from this blueprint without written approval.

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Design Principles](#2-design-principles)
3. [Platform Hierarchy](#3-platform-hierarchy)
4. [Relationship Diagram](#4-relationship-diagram)
5. [Tier 1 — Platform Foundation Tables](#5-tier-1--platform-foundation-tables)
6. [Tier 2 — Content Layer Tables](#6-tier-2--content-layer-tables)
7. [Tier 3 — User & Subscription Tables](#7-tier-3--user--subscription-tables)
8. [Tier 4 — Analytics & Tracking Tables](#8-tier-4--analytics--tracking-tables)
9. [Tier 5 — Intelligence & Linking Tables](#9-tier-5--intelligence--linking-tables)
10. [Index Strategy](#10-index-strategy)
11. [Trigger & Function Architecture](#11-trigger--function-architecture)
12. [View Architecture](#12-view-architecture)
13. [Multi-Tenancy Architecture](#13-multi-tenancy-architecture)
14. [RLS Policy Architecture](#14-rls-policy-architecture)
15. [Storage Architecture](#15-storage-architecture)
16. [Data Integrity Laws](#16-data-integrity-laws)
17. [Scalability Architecture](#17-scalability-architecture)
18. [GDPR & NDPR Compliance Architecture](#18-gdpr--ndpr-compliance-architecture)

---

## 1. Architectural Overview

The AMD Music Intelligence database layer is a **parallel, isolated subsystem** living inside the AMD Control Center Supabase project. It does not modify, reference, or depend on any existing B2B tables (`clients`, `chat_logs`, `automation_runs`, `portal_access`).

The system is designed as an **N-tier multi-tenant platform** capable of hosting an unlimited number of Client Hubs, each with their own roster of artists, tracks, playlists, audiences, and analytics — all isolated from one another by Row Level Security enforced at the database level.

### Two Separate Worlds — One Supabase Project

```
AMD Control Center (Supabase Project)
│
├── B2B Agency Layer (EXISTING — DO NOT TOUCH)
│   ├── clients
│   ├── chat_logs          ← EXTEND ONLY (add columns, never modify existing)
│   ├── automation_runs
│   └── portal_access
│
└── AMD Music Intelligence Layer (NEW — ALL PREFIXED mi_)
    ├── Foundation:  mi_client_hubs, mi_genres, mi_subscription_plans
    ├── Security:    mi_hub_managers
    ├── Content:     mi_artists, mi_tracks, mi_playlists, mi_playlist_tracks
    ├── Users:       mi_user_profiles, mi_subscriptions, mi_user_playlists
    ├── Linking:     mi_smart_links
    ├── Analytics:   mi_click_tracking, mi_listening_history, mi_audience
    └── Views:       mi_* (8 views, 1 materialised view)
```

### The `mi_` Prefix Law
Every object belonging to AMD Music Intelligence — tables, views, functions, indexes, policies — carries the `mi_` prefix. This is non-negotiable. It prevents namespace collisions with the existing schema and makes migrations auditable.

---

## 2. Design Principles

### Principle 1 — Data Integrity Above All
The AMD Music Intelligence platform's credibility with artists and Client Hub owners depends on the absolute accuracy of every number it reports. The database enforces this through:
- Atomic counter increments (never client-side updates)
- Immutable audit trails (analytics rows are never updated or deleted)
- Strict NOT NULL constraints on attribution columns

### Principle 2 — Multi-Tenancy by Default
Every analytics, audience, and content table includes a `hub_id` foreign key. This is non-optional. A row without a `hub_id` cannot be attributed and therefore cannot be reported. This column is enforced as NOT NULL on all tables where it is required.

### Principle 3 — Soft Deletes Only
No content row is ever hard-deleted. `is_active = false` deactivates content. This preserves analytics history, prevents broken foreign keys in audit trails, and enables content restoration.

### Principle 4 — Analytics Rows Are Immutable
Rows in `mi_click_tracking` and `mi_listening_history` are INSERT-only. No UPDATE or DELETE is ever performed on them. They are an audit log, not a mutable record.

### Principle 5 — Private Audio by Default
Audio files are never publicly accessible. All audio delivery is gated through server-side signed URLs that expire after 4 hours. This enforces both premium subscription gating and artist content protection.

### Principle 6 — Legal Compliance Is Structural, Not Optional
GDPR and NDPR compliance fields (`consent_timestamp`, `consent_text_version`, `opt_out_at`) are defined as NOT NULL where required. The system cannot capture audience contacts without consent metadata.

---

## 3. Platform Hierarchy

```
AMD Music Intelligence (Master Platform)
│
└── mi_client_hubs  (e.g., Chrome Music)
    │
    ├── mi_hub_managers  (Chrome's team members)
    │
    └── mi_artists  (e.g., VaB)
        │
        ├── mi_tracks  (Individual songs)
        │   │
        │   ├── mi_playlist_tracks  (Track-to-playlist junction)
        │   ├── mi_click_tracking   (DSP redirect analytics)
        │   └── mi_listening_history (On-platform engagement)
        │
        └── mi_playlists  (e.g., Chrome AfroFusion Radio)
            │
            └── mi_smart_links  (Shareable tracked links)

AMD Music Intelligence Users (B2C)
│
├── auth.users  (Supabase native auth)
│   │
│   └── mi_user_profiles  (Extended profile + subscription)
│       │
│       ├── mi_subscriptions  (Payment history)
│       └── mi_user_playlists (Personal playlists)
│
└── mi_audience  (Anonymous contacts — Email/WhatsApp/Telegram)
```

---

## 4. Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PLATFORM FOUNDATION                             │
│                                                                         │
│  mi_subscription_plans ──────────────────────────────────┐             │
│  mi_genres ─────────────────────────────┐                │             │
│  mi_client_hubs ──┬──────────────────────────────────────┼─────────┐   │
│                   │                     │                │         │   │
└───────────────────┼─────────────────────┼────────────────┼─────────┼───┘
                    │                     │                │         │
┌───────────────────┼─────────────────────┼────────────────┼─────────┼───┐
│   SECURITY LAYER  │                     │                │         │   │
│                   │                     │                │         │   │
│  mi_hub_managers ─┤ (hub_id + user_id)  │                │         │   │
│                   │                     │                │         │   │
└───────────────────┼─────────────────────┼────────────────┼─────────┼───┘
                    │                     │                │         │
┌───────────────────┼─────────────────────┼────────────────┼─────────┼───┐
│   CONTENT LAYER   │                     │                │         │   │
│                   │                     │                │         │   │
│  mi_artists ──────┘ (hub_id)            │                │         │   │
│      │                                  │                │         │   │
│  mi_tracks ────────────────────────────-┘ (genre_id)     │         │   │
│      │                                                   │         │   │
│  mi_playlists ────────────────────────────────────────── ┘ (hub_id)│   │
│      │                                                             │   │
│  mi_playlist_tracks (track_id ←→ playlist_id junction)             │   │
│                                                                    │   │
└────────────────────────────────────────────────────────────────────┼───┘
                                                                     │
┌────────────────────────────────────────────────────────────────────┼───┐
│   USER LAYER                                                        │   │
│                                                                     │   │
│  auth.users ──────────────────────────────────────────────────────-┤   │
│      │                                                              │   │
│  mi_user_profiles ──────────────────────────── (plan_id) ──────────┘   │
│      │                                                                  │
│  mi_subscriptions (user_id + plan_id)                                   │
│  mi_user_playlists (user_id)                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                    │
┌───────────────────┼─────────────────────────────────────────────────────┐
│   ANALYTICS LAYER │                                                      │
│                   │                                                      │
│  mi_smart_links ──┤ (hub_id + track_id + playlist_id + artist_id)       │
│      │            │                                                      │
│  mi_click_tracking (smart_link_id + hub_id + track_id + artist_id)      │
│  mi_listening_history (user_id + track_id + hub_id + playlist_id)       │
│  mi_audience (hub_id + smart_link_id)                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Tier 1 — Platform Foundation Tables

These tables have zero foreign key dependencies. They are created first. No other table can exist without them.

---

### Table: `mi_client_hubs`
**Purpose:** Represents each B2B client (e.g., Chrome Music). The root of the multi-tenant hierarchy.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Immutable identifier |
| `name` | TEXT | NOT NULL | Display name: "Chrome Music" |
| `slug` | TEXT | UNIQUE NOT NULL | URL-safe: "chrome" |
| `description` | TEXT | | Hub description for public profile |
| `brand_color` | TEXT | DEFAULT '#7B2FFF' | Hub accent color (hex) |
| `logo_url` | TEXT | | Storage path: mi-hub-assets bucket |
| `cover_url` | TEXT | | Hero banner storage path |
| `contact_email` | TEXT | | Hub owner contact |
| `website_url` | TEXT | | Hub's own website |
| `revenue_share_pct` | DECIMAL(5,2) | DEFAULT 70.00 | Future revenue split |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated by trigger |

**Indexes:**
- `UNIQUE INDEX` on `slug`
- `INDEX` on `is_active`
- `INDEX` on `created_at DESC`

**Trigger:** `update_updated_at_column()` on BEFORE UPDATE

---

### Table: `mi_genres`
**Purpose:** Normalised reference table for African music genres and sub-genres. Powers Discovery Engine filtering and Agent 007 curation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `name` | TEXT | UNIQUE NOT NULL | "Afrobeats", "Amapiano", "Highlife" |
| `parent_id` | UUID | FK → mi_genres(id) NULLABLE | Enables sub-genres ("Alte" under "Afrobeats") |
| `region` | TEXT | | "West Africa", "Southern Africa", "East Africa" |
| `description` | TEXT | | Cultural context for Agent 007 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Seed Data Required:**
```
Afrobeats, Amapiano, Highlife, Fuji, Juju, Afro-Soul, Alte,
Afropop, Naija Pop, Afro-House, Gqom, Bongo Flava, Benga,
Azonto, Hiplife, Afro-Jazz, Gospel (Nigerian), Nollywood OST
```

**Indexes:**
- `UNIQUE INDEX` on `name`
- `INDEX` on `parent_id`

**RLS:** Public SELECT. Platform Admin INSERT/UPDATE only.

---

### Table: `mi_subscription_plans`
**Purpose:** Reference table of available subscription tiers. Decouples pricing logic from application code.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `name` | TEXT | NOT NULL | "Free", "Premium", "Studio" |
| `slug` | TEXT | UNIQUE NOT NULL | "free", "premium", "studio" |
| `price_ngn` | DECIMAL(10,2) | NOT NULL DEFAULT 0 | Naira pricing |
| `price_usd` | DECIMAL(10,2) | DEFAULT 0 | USD for international users |
| `currency` | TEXT | NOT NULL DEFAULT 'NGN' | ISO 4217 currency code |
| `billing_interval` | TEXT | CHECK IN ('free','monthly','annual') | |
| `features` | JSONB | NOT NULL DEFAULT '{}' | Feature flags: {skip_limit, download, ai_curator} |
| `skip_limit` | INTEGER | DEFAULT 5 | Null = unlimited (Premium) |
| `paystack_plan_code` | TEXT | | Paystack plan code for recurring billing |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | |
| `sort_order` | INTEGER | DEFAULT 0 | Display ordering |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Seed Data Required:**
```
Free:    price_ngn=0,    skip_limit=5,    features={ai_curator: false, downloads: false}
Premium: price_ngn=1500, skip_limit=null, features={ai_curator: true, downloads: false}
Studio:  price_ngn=5000, skip_limit=null, features={ai_curator: true, downloads: true, analytics: true}
```

**RLS:** Public SELECT. Platform Admin INSERT/UPDATE only.

---

## 6. Tier 2 — Content Layer Tables

These tables represent the music catalog. They depend on Tier 1 tables.

---

### Table: `mi_hub_managers` *(THE KEYSTONE TABLE)*
**Purpose:** Junction table linking Supabase Auth users to Client Hubs with a specific role. This table is the foundation of the entire multi-tenant security model. No RLS policy on any hub-scoped table can function correctly without it.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `user_id` | UUID | NOT NULL FK → auth.users(id) ON DELETE CASCADE | Supabase Auth user |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) ON DELETE CASCADE | |
| `role` | TEXT | NOT NULL CHECK IN ('owner','editor','viewer') | Access level |
| `invited_by` | UUID | FK → auth.users(id) NULLABLE | Audit trail |
| `accepted_at` | TIMESTAMPTZ | | Invitation accepted timestamp |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `UNIQUE INDEX` on `(user_id, hub_id)` — one role per user per hub
- `INDEX` on `hub_id` — for RLS policy lookups
- `INDEX` on `user_id` — for user dashboard queries

**Critical Note:** This table has no `updated_at`. Roles are revoked and re-invited, never modified in place.

---

### Table: `mi_artists`
**Purpose:** Represents artists within a Client Hub. VaB is Chrome's first artist.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) | Artist's owning hub |
| `name` | TEXT | NOT NULL | "VaB" |
| `slug` | TEXT | NOT NULL | "vab" — URL-safe |
| `bio` | TEXT | | Artist biography |
| `profile_image_url` | TEXT | | Storage path: mi-hub-assets |
| `cover_image_url` | TEXT | | Hero banner path |
| `genre_tags` | UUID[] | | Array of FK → mi_genres(id) |
| `social_links` | JSONB | DEFAULT '{}' | {spotify, apple, instagram, twitter, tiktok} |
| `dsp_profile_links` | JSONB | DEFAULT '{}' | {spotify_artist_id, apple_artist_id} |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Soft delete |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `UNIQUE INDEX` on `(hub_id, slug)`
- `INDEX` on `hub_id`
- `INDEX` on `is_active`

**Trigger:** `update_updated_at_column()` on BEFORE UPDATE

---

### Table: `mi_tracks`
**Purpose:** Individual song/track records. The atomic unit of the music catalog and the AI Discovery Engine.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `artist_id` | UUID | NOT NULL FK → mi_artists(id) | |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) | Denormalised for performance |
| `title` | TEXT | NOT NULL | |
| `slug` | TEXT | NOT NULL | URL-safe title |
| `genre_id` | UUID | FK → mi_genres(id) | Primary genre |
| `mood_tags` | TEXT[] | DEFAULT '{}' | ['energetic','uplifting','late_night'] |
| `cultural_tags` | TEXT[] | DEFAULT '{}' | ['detty_december','lagos','surulere'] |
| `bpm` | INTEGER | CHECK bpm BETWEEN 40 AND 220 | For AI DJ Phase |
| `audio_key` | TEXT | | Musical key: "C major", "F# minor" |
| `energy_level` | INTEGER | CHECK 1 <= energy_level <= 10 | Discovery signal |
| `duration_seconds` | INTEGER | NOT NULL | |
| `audio_url` | TEXT | NOT NULL | Storage path: mi-audio (PRIVATE) |
| `cover_url` | TEXT | | Storage path: mi-covers (PUBLIC) |
| `waveform_data` | JSONB | | Pre-computed waveform for player UI |
| `dsp_links` | JSONB | DEFAULT '{}' | {spotify, apple, audiomack, boomplay} |
| `release_date` | DATE | | |
| `play_count` | INTEGER | NOT NULL DEFAULT 0 | Atomic increments ONLY |
| `skip_count` | INTEGER | NOT NULL DEFAULT 0 | Atomic increments ONLY |
| `completion_count` | INTEGER | NOT NULL DEFAULT 0 | Tracks full listens |
| `embedding` | VECTOR(1536) | | pgvector — Phase 2 Recommendation Engine |
| `licensed_territories` | TEXT[] | DEFAULT ARRAY['*'] | ['*'] = global, or ['NG','GH','ZA'] |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Soft delete |
| `is_explicit` | BOOLEAN | NOT NULL DEFAULT false | Content flag |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `INDEX` on `hub_id`
- `INDEX` on `artist_id`
- `INDEX` on `genre_id`
- `INDEX` on `is_active`
- `INDEX` on `release_date DESC`
- `GIN INDEX` on `mood_tags` — for array search
- `GIN INDEX` on `cultural_tags` — for array search
- `HNSW INDEX` on `embedding` — pgvector approximate nearest neighbour (Phase 2)

**Trigger:** `update_updated_at_column()` on BEFORE UPDATE

---

### Table: `mi_playlists`
**Purpose:** Admin-managed playlists within a Client Hub (e.g., "Chrome AfroFusion Radio"). Distinct from user-created playlists.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) | Owning hub |
| `name` | TEXT | NOT NULL | "Chrome AfroFusion Radio" |
| `slug` | TEXT | NOT NULL | "chrome-afrofusion-radio" |
| `description` | TEXT | | |
| `cover_url` | TEXT | | Storage path: mi-covers |
| `is_ai_generated` | BOOLEAN | NOT NULL DEFAULT false | Tracks AI vs human curation |
| `ai_prompt` | TEXT | | Original prompt if AI-generated |
| `total_plays` | INTEGER | NOT NULL DEFAULT 0 | Denormalised counter |
| `total_tracks` | INTEGER | NOT NULL DEFAULT 0 | Denormalised counter |
| `is_featured` | BOOLEAN | NOT NULL DEFAULT false | For Discovery Engine surfacing |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Soft delete |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `UNIQUE INDEX` on `(hub_id, slug)`
- `INDEX` on `hub_id`
- `INDEX` on `is_featured`
- `INDEX` on `is_active`

**Trigger:** `update_updated_at_column()` on BEFORE UPDATE

---

### Table: `mi_playlist_tracks`
**Purpose:** Junction table linking tracks to playlists with ordering. Tracks can exist in multiple playlists.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `playlist_id` | UUID | NOT NULL FK → mi_playlists(id) ON DELETE CASCADE | |
| `track_id` | UUID | NOT NULL FK → mi_tracks(id) ON DELETE CASCADE | |
| `position` | INTEGER | NOT NULL | 1-indexed ordering within playlist |
| `added_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `added_by` | UUID | FK → auth.users(id) | Who added the track |

**Primary Key:** COMPOSITE `(playlist_id, track_id)`

**Indexes:**
- `INDEX` on `playlist_id` — for ordering lookups
- `INDEX` on `track_id` — for "which playlists contain this track"
- `UNIQUE INDEX` on `(playlist_id, position)` — prevents duplicate positions

---

## 7. Tier 3 — User & Subscription Tables

These tables manage B2C user accounts and their subscription states.

---

### Table: `mi_user_profiles`
**Purpose:** Extended profile for B2C music users. References `auth.users` (Supabase native). One profile per auth user.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | Same UUID as auth.users |
| `display_name` | TEXT | | Public display name |
| `avatar_url` | TEXT | | Profile image |
| `subscription_plan_id` | UUID | FK → mi_subscription_plans(id) | Current plan |
| `subscription_status` | TEXT | CHECK IN ('active','cancelled','past_due','trialing','free') DEFAULT 'free' | |
| `subscription_expires_at` | TIMESTAMPTZ | | Null = free forever |
| `paystack_customer_id` | TEXT | | Paystack customer code |
| `whatsapp_number` | TEXT | | E.164 format |
| `whatsapp_verified` | BOOLEAN | DEFAULT false | |
| `telegram_chat_id` | TEXT | | For Telegram notifications |
| `preferred_genres` | UUID[] | DEFAULT '{}' | FK array → mi_genres |
| `skip_count_today` | INTEGER | NOT NULL DEFAULT 0 | Resets daily |
| `skip_reset_date` | DATE | | Date when skip_count_today was last reset |
| `agent_007_context` | JSONB | DEFAULT '{}' | Persistent music preferences for Agent 007 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `INDEX` on `subscription_plan_id`
- `INDEX` on `subscription_status`
- `INDEX` on `paystack_customer_id`

**Trigger:** `update_updated_at_column()` on BEFORE UPDATE

**Critical Note:** The `id` column IS the `auth.users.id`. No separate UUID. This is a 1:1 extension table.

---

### Table: `mi_subscriptions`
**Purpose:** Immutable payment event log. Every Paystack webhook event creates a new row. Source of truth for billing history.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `user_id` | UUID | NOT NULL FK → auth.users(id) | |
| `plan_id` | UUID | NOT NULL FK → mi_subscription_plans(id) | |
| `paystack_reference` | TEXT | UNIQUE NOT NULL | Paystack transaction reference |
| `paystack_subscription_code` | TEXT | | Recurring subscription code |
| `event_type` | TEXT | NOT NULL | 'charge.success', 'subscription.disable', etc. |
| `amount_ngn` | DECIMAL(10,2) | NOT NULL | Actual amount charged |
| `currency` | TEXT | NOT NULL DEFAULT 'NGN' | |
| `status` | TEXT | NOT NULL CHECK IN ('active','cancelled','expired','failed') | |
| `period_start` | TIMESTAMPTZ | | Billing period start |
| `period_end` | TIMESTAMPTZ | | Billing period end |
| `cancelled_at` | TIMESTAMPTZ | | If subscription was cancelled |
| `raw_webhook` | JSONB | | Full Paystack webhook payload for debugging |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Webhook received timestamp |

**Indexes:**
- `INDEX` on `user_id`
- `UNIQUE INDEX` on `paystack_reference`
- `INDEX` on `status`
- `INDEX` on `created_at DESC`

**RLS:** Service role only for INSERT/UPDATE. Authenticated users can SELECT their own rows.

**Analytics Immutability Law:** No row in this table is ever deleted. Status transitions are recorded as new rows, not updates.

---

### Table: `mi_user_playlists`
**Purpose:** Personal playlists created by authenticated B2C users. Separate from hub-managed playlists.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `user_id` | UUID | NOT NULL FK → auth.users(id) ON DELETE CASCADE | Owner |
| `name` | TEXT | NOT NULL | "My Sunday Morning Mix" |
| `description` | TEXT | | |
| `cover_url` | TEXT | | User-uploaded or auto-generated |
| `is_ai_generated` | BOOLEAN | NOT NULL DEFAULT false | |
| `ai_prompt` | TEXT | | Original Agent 007 prompt |
| `is_public` | BOOLEAN | NOT NULL DEFAULT false | Shareable playlists |
| `total_tracks` | INTEGER | NOT NULL DEFAULT 0 | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `INDEX` on `user_id`
- `INDEX` on `is_public`

**Note:** User playlist tracks use `mi_playlist_tracks` with `playlist_id` pointing to `mi_user_playlists.id`. This requires a polymorphic reference strategy — see Migration Plan for implementation detail.

---

## 8. Tier 4 — Analytics & Tracking Tables

These are the platform's most business-critical tables. They are INSERT-only audit logs.

---

### Table: `mi_click_tracking`
**Purpose:** Records every outbound click through the AMD Click Tracking Layer. The foundation of Artist Intelligence and Smart Link analytics. IMMUTABLE.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `smart_link_id` | UUID | FK → mi_smart_links(id) NULLABLE | Source smart link (null if direct) |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) | ALWAYS attributed |
| `artist_id` | UUID | FK → mi_artists(id) NULLABLE | |
| `track_id` | UUID | FK → mi_tracks(id) NULLABLE | |
| `playlist_id` | UUID | FK → mi_playlists(id) NULLABLE | |
| `destination_dsp` | TEXT | NOT NULL CHECK IN ('spotify','apple_music','audiomack','boomplay','youtube','internal','other') | |
| `destination_url` | TEXT | | Actual URL clicked |
| `referrer_url` | TEXT | | HTTP Referer header |
| `utm_source` | TEXT | | UTM tracking |
| `utm_medium` | TEXT | | |
| `utm_campaign` | TEXT | | |
| `user_country` | TEXT(2) | | ISO 3166-1 alpha-2: "NG", "GH" |
| `user_device_type` | TEXT | CHECK IN ('mobile','desktop','tablet','unknown') | |
| `user_browser` | TEXT | | Parsed from user agent |
| `session_id` | TEXT | | Browser session identifier |
| `ip_hash` | TEXT | | SHA256(ip + salt) — never raw IP |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | **Partition key** |

**Partitioning Strategy (REQUIRED):**
```
PARTITION BY RANGE (created_at)
Monthly partitions: mi_click_tracking_2026_06, mi_click_tracking_2026_07, etc.
Retention: Keep all partitions (immutable audit law)
```

**Indexes (per partition):**
- `INDEX` on `hub_id`
- `INDEX` on `track_id`
- `INDEX` on `smart_link_id`
- `INDEX` on `destination_dsp`
- `INDEX` on `created_at DESC`
- `INDEX` on `user_country`

**RLS:** Anonymous INSERT allowed. SELECT restricted to Hub Managers (own hub) and Platform Admin.

---

### Table: `mi_listening_history`
**Purpose:** Records on-platform audio playback events. Tracks completion rates, skip timestamps, and engagement depth. IMMUTABLE.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `user_id` | UUID | FK → auth.users(id) ON DELETE SET NULL NULLABLE | Null for anonymous |
| `session_id` | TEXT | NOT NULL | Browser session (anonymous + auth) |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) | Always attributed |
| `track_id` | UUID | NOT NULL FK → mi_tracks(id) | |
| `source_playlist_id` | UUID | FK → mi_playlists(id) NULLABLE | How they discovered it |
| `play_duration_seconds` | INTEGER | NOT NULL DEFAULT 0 | Seconds actually listened |
| `skip_timestamp_seconds` | INTEGER | | WHERE they skipped (null = not skipped) |
| `completed` | BOOLEAN | NOT NULL DEFAULT false | Listened to ≥90% |
| `device_type` | TEXT | CHECK IN ('mobile','desktop','tablet','unknown') | |
| `ip_hash` | TEXT | | SHA256(ip + salt) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `INDEX` on `hub_id`
- `INDEX` on `track_id`
- `INDEX` on `user_id`
- `INDEX` on `session_id`
- `INDEX` on `created_at DESC`

**RLS:** Anonymous INSERT allowed. Authenticated user can SELECT their own rows. Hub Managers can SELECT their hub's rows. Platform Admin unrestricted.

---

### Table: `mi_audience`
**Purpose:** Stores owned audience contacts (Email/WhatsApp/Telegram) captured through the platform. Legal compliance fields are NOT NULL — a contact cannot be captured without them.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) | ALWAYS attributed — never null |
| `email` | TEXT | | Validated format |
| `whatsapp` | TEXT | | E.164 format: +2348012345678 |
| `telegram_username` | TEXT | | Without @ prefix |
| `source_smart_link_id` | UUID | FK → mi_smart_links(id) NULLABLE | Which link brought them |
| `source_page_url` | TEXT | | Which page they were on |
| `acquisition_incentive` | TEXT | | "Unlock exclusive Chrome mix" |
| `consent_timestamp` | TIMESTAMPTZ | NOT NULL | LEGAL — NEVER NULLABLE |
| `consent_text_version` | TEXT | NOT NULL | "v1.0" — LEGAL — NEVER NULLABLE |
| `consent_ip_hash` | TEXT | NOT NULL | SHA256(ip + salt) — LEGAL |
| `is_verified` | BOOLEAN | NOT NULL DEFAULT false | WhatsApp/email verified |
| `opt_out_at` | TIMESTAMPTZ | | Right to erasure timestamp |
| `deletion_requested_at` | TIMESTAMPTZ | | NDPR/GDPR erasure request |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Constraint:** CHECK that at least one of `email`, `whatsapp`, or `telegram_username` is NOT NULL.

**Indexes:**
- `INDEX` on `hub_id`
- `INDEX` on `email` (partial: WHERE email IS NOT NULL)
- `INDEX` on `whatsapp` (partial: WHERE whatsapp IS NOT NULL)
- `INDEX` on `created_at DESC`
- `INDEX` on `opt_out_at` (partial: WHERE opt_out_at IS NOT NULL)

**RLS:** Anonymous INSERT allowed (public capture forms). Hub Manager SELECT scoped to own hub. Cross-hub SELECT STRICTLY DENIED. Platform Admin unrestricted.

---

## 9. Tier 5 — Intelligence & Linking Tables

---

### Table: `mi_smart_links`
**Purpose:** Shareable, trackable links with custom Open Graph metadata. The AMD Click Tracking Layer's entry point.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `short_code` | TEXT | UNIQUE NOT NULL | 6-char alphanumeric: "aF3kZ9" |
| `hub_id` | UUID | NOT NULL FK → mi_client_hubs(id) | |
| `artist_id` | UUID | FK → mi_artists(id) NULLABLE | |
| `track_id` | UUID | FK → mi_tracks(id) NULLABLE | |
| `playlist_id` | UUID | FK → mi_playlists(id) NULLABLE | |
| `destination_type` | TEXT | NOT NULL CHECK IN ('track','playlist','artist','hub') | |
| `og_title` | TEXT | | Custom Open Graph title |
| `og_description` | TEXT | | Custom OG description |
| `og_image_url` | TEXT | | Custom OG image |
| `cta_text` | TEXT | | Button text on landing page |
| `total_clicks` | INTEGER | NOT NULL DEFAULT 0 | Denormalised — updated by trigger |
| `audience_gate` | BOOLEAN | NOT NULL DEFAULT false | Require contact capture before reveal |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | |
| `expires_at` | TIMESTAMPTZ | | Optional expiry |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Indexes:**
- `UNIQUE INDEX` on `short_code`
- `INDEX` on `hub_id`
- `INDEX` on `track_id`
- `INDEX` on `is_active`

**Trigger:** `update_updated_at_column()` on BEFORE UPDATE  
**Trigger:** Increment `total_clicks` atomically when `mi_click_tracking` INSERT occurs for this `smart_link_id`

---

## 10. Index Strategy

### Composite Index Priority
The following composite indexes are required for query performance across the most frequent access patterns:

| Index | Table | Columns | Purpose |
|---|---|---|---|
| Hub + Active | `mi_tracks` | `(hub_id, is_active)` | List all active tracks per hub |
| Hub + Genre | `mi_tracks` | `(hub_id, genre_id)` | Genre filtering within hub |
| Hub + Date | `mi_click_tracking` | `(hub_id, created_at DESC)` | Analytics date ranges per hub |
| Hub + DSP | `mi_click_tracking` | `(hub_id, destination_dsp)` | DSP comparison per hub |
| User + Status | `mi_hub_managers` | `(user_id, hub_id)` | RLS policy resolution — CRITICAL |
| Track + Completed | `mi_listening_history` | `(track_id, completed)` | Completion rate queries |

---

## 11. Trigger & Function Architecture

### Functions Required

**`update_updated_at_column()`** — ALREADY EXISTS  
Reuse on all `mi_*` tables with `updated_at` column.

Tables requiring this trigger:
- `mi_client_hubs`
- `mi_artists`
- `mi_tracks`
- `mi_playlists`
- `mi_user_playlists`
- `mi_smart_links`
- `mi_user_profiles`

**`mi_generate_short_code()`** — NEW  
Generates unique 6-character alphanumeric codes for Smart Links. Uses a retry loop to guarantee uniqueness without sequential IDs. Called during `mi_smart_links` INSERT.

**`mi_increment_play_count(p_track_id UUID)`** — NEW  
```
UPDATE mi_tracks SET play_count = play_count + 1 WHERE id = p_track_id
```
Called server-side when a signed audio URL is generated. Atomic — safe under concurrent load.

**`mi_increment_smart_link_clicks(p_link_id UUID)`** — NEW  
```
UPDATE mi_smart_links SET total_clicks = total_clicks + 1 WHERE id = p_link_id
```
Called by a TRIGGER on `mi_click_tracking` INSERT when `smart_link_id IS NOT NULL`.

**`mi_reset_daily_skip_counts()`** — NEW  
```
UPDATE mi_user_profiles SET skip_count_today = 0, skip_reset_date = CURRENT_DATE
WHERE skip_reset_date < CURRENT_DATE
```
Called by a Supabase Cron job at 00:00 UTC daily.

**`mi_is_hub_manager(p_hub_id UUID)`** — NEW (SECURITY FUNCTION)  
```
SELECT EXISTS (
  SELECT 1 FROM mi_hub_managers
  WHERE user_id = auth.uid() AND hub_id = p_hub_id
)
```
Used inside all Hub Manager RLS policies. SECURITY DEFINER to bypass RLS on `mi_hub_managers` itself.

---

## 12. View Architecture

### `mi_agent007_context` (MATERIALISED VIEW — refreshed every 15 min)
**Purpose:** Pre-computed catalog summary for Agent 007 music queries. Eliminates per-conversation multi-table joins.

**Contains:** Track ID, title, artist name, genre name, mood tags, energy level, hub slug. Optimised for LLM context injection.

---

### `mi_track_performance` (VIEW)
**Purpose:** Per-track analytics aggregated from `mi_listening_history` and `mi_click_tracking`.

**Columns:** `track_id`, `title`, `artist_name`, `total_plays`, `total_completions`, `completion_rate`, `total_skips`, `skip_rate`, `avg_listen_duration`, `total_dsp_clicks`, `dsp_click_breakdown` (JSONB)

---

### `mi_artist_performance` (VIEW)
**Purpose:** Artist-level aggregation. Feeds Artist Intelligence dashboard.

**Columns:** `artist_id`, `artist_name`, `hub_id`, `total_tracks`, `total_plays`, `avg_completion_rate`, `total_dsp_clicks`, `top_track_id`, `top_track_title`

---

### `mi_hub_performance` (VIEW)
**Purpose:** Hub-level aggregation. Feeds the Client Hub analytics overview.

**Columns:** `hub_id`, `hub_name`, `total_artists`, `total_tracks`, `total_plays`, `total_audience_contacts`, `total_dsp_clicks`, `top_artist_id`, `top_playlist_id`

---

### `mi_smart_link_performance` (VIEW)
**Purpose:** Smart Link conversion analytics.

**Columns:** `smart_link_id`, `short_code`, `hub_id`, `total_clicks`, `clicks_by_dsp` (JSONB), `clicks_by_country` (JSONB), `audience_captures`, `conversion_rate`

---

### `mi_audience_growth` (VIEW)
**Purpose:** Daily audience capture counts per hub.

**Columns:** `hub_id`, `date`, `new_contacts`, `email_captures`, `whatsapp_captures`, `telegram_captures`, `cumulative_total`

---

### `mi_discovery_leaderboard` (VIEW)
**Purpose:** Top tracks ranked by completion rate (not play count — completion rate is a superior quality signal).

**Columns:** `track_id`, `title`, `artist_name`, `hub_id`, `completion_rate`, `total_plays`, `energy_level`, `mood_tags`

---

### `mi_subscription_revenue` (VIEW — Service Role Only)
**Purpose:** Monthly recurring revenue reporting.

**Columns:** `month`, `total_revenue_ngn`, `active_subscriptions`, `new_subscriptions`, `cancelled_subscriptions`, `churn_rate`

---

## 13. Multi-Tenancy Architecture

### The Three-Layer Isolation Model

**Layer 1 — Database (RLS)**  
Every sensitive query is filtered at the database level using Row Level Security. A Hub Manager querying `mi_click_tracking` will only receive rows where `hub_id` matches their assigned hub, regardless of how the query is written in application code. This is the last line of defence.

**Layer 2 — API (Server-Side Validation)**  
Every API route that handles hub-specific operations validates the requesting user's hub membership against `mi_hub_managers` before executing any database query. This is defence-in-depth — the application layer should never expose multi-tenant data even if RLS is temporarily misconfigured.

**Layer 3 — JWT Claims (Performance)**  
For high-frequency operations (audio URL generation, skip tracking), hub membership is cached in the user's JWT custom claims to eliminate per-request database lookups. Claims are refreshed on login and when hub assignments change.

### Cross-Hub Access — Explicit Prohibition
The following operations are architecturally prohibited and enforced by DENY RLS policies:
- Hub Manager A reading Hub B's `mi_audience` contacts
- Hub Manager A reading Hub B's `mi_click_tracking` analytics
- Hub Manager A modifying Hub B's `mi_tracks` or `mi_artists`

A PostgreSQL DENY policy (USING (false)) is applied explicitly to each of these cases, overriding any broader policies.

---

## 14. RLS Policy Architecture

### The Hub Manager Helper Function (Must Exist Before Any Policy)

```
mi_is_hub_manager(p_hub_id UUID) → BOOLEAN
```

All Hub Manager policies call this function. It is defined as SECURITY DEFINER so it can bypass RLS on `mi_hub_managers` itself when resolving membership.

### Policy Matrix

| Table | Grantee | Operation | Condition |
|---|---|---|---|
| `mi_client_hubs` | Public (anon) | SELECT | is_active = true |
| `mi_client_hubs` | Hub Manager | UPDATE | mi_is_hub_manager(id) AND role = 'owner' |
| `mi_client_hubs` | Platform Admin | ALL | auth.jwt()->>'role' = 'platform_admin' |
| `mi_genres` | Public (anon) | SELECT | (always) |
| `mi_genres` | Platform Admin | ALL | auth.jwt()->>'role' = 'platform_admin' |
| `mi_subscription_plans` | Public (anon) | SELECT | is_active = true |
| `mi_hub_managers` | Authenticated | SELECT | user_id = auth.uid() |
| `mi_hub_managers` | Hub Owner | INSERT/DELETE | mi_is_hub_manager(hub_id) AND role = 'owner' |
| `mi_hub_managers` | Platform Admin | ALL | auth.jwt()->>'role' = 'platform_admin' |
| `mi_artists` | Public (anon) | SELECT | is_active = true |
| `mi_artists` | Hub Manager | INSERT/UPDATE | mi_is_hub_manager(hub_id) |
| `mi_artists` | Hub Manager | DELETE | mi_is_hub_manager(hub_id) AND role = 'owner' |
| `mi_tracks` | Public (anon) | SELECT | is_active = true |
| `mi_tracks` | Hub Manager | INSERT/UPDATE | mi_is_hub_manager(hub_id) |
| `mi_tracks` | Hub Manager | DELETE | mi_is_hub_manager(hub_id) AND role = 'owner' |
| `mi_playlists` | Public (anon) | SELECT | is_active = true |
| `mi_playlists` | Hub Manager | ALL | mi_is_hub_manager(hub_id) |
| `mi_playlist_tracks` | Public (anon) | SELECT | (via playlist join) |
| `mi_playlist_tracks` | Hub Manager | ALL | (via playlist hub_id join) |
| `mi_user_profiles` | Authenticated | SELECT/UPDATE | id = auth.uid() |
| `mi_user_profiles` | Service Role | ALL | auth.role() = 'service_role' |
| `mi_subscriptions` | Authenticated | SELECT | user_id = auth.uid() |
| `mi_subscriptions` | Service Role | INSERT/UPDATE | auth.role() = 'service_role' |
| `mi_user_playlists` | Authenticated | ALL | user_id = auth.uid() |
| `mi_smart_links` | Public (anon) | SELECT | is_active = true |
| `mi_smart_links` | Hub Manager | ALL | mi_is_hub_manager(hub_id) |
| `mi_click_tracking` | Public (anon) | INSERT | (always — tracking beacon) |
| `mi_click_tracking` | Hub Manager | SELECT | hub_id matches managed hub |
| `mi_click_tracking` | Hub B Manager | SELECT (DENY) | USING (false) where hub_id ≠ managed hub |
| `mi_click_tracking` | Platform Admin | ALL | auth.jwt()->>'role' = 'platform_admin' |
| `mi_listening_history` | Public (anon) | INSERT | (always) |
| `mi_listening_history` | Authenticated | SELECT | user_id = auth.uid() |
| `mi_listening_history` | Hub Manager | SELECT | hub_id matches managed hub |
| `mi_audience` | Public (anon) | INSERT | consent_timestamp IS NOT NULL AND consent_text_version IS NOT NULL |
| `mi_audience` | Hub Manager | SELECT | hub_id matches managed hub |
| `mi_audience` | Hub B Manager | SELECT (DENY) | USING (false) where hub_id ≠ managed hub |
| `mi_audience` | Platform Admin | ALL | auth.jwt()->>'role' = 'platform_admin' |

**Total: 32 policies across 14 tables**

---

## 15. Storage Architecture

### Bucket: `mi-audio` — PRIVATE
| Property | Value |
|---|---|
| Visibility | PRIVATE — no public URLs ever |
| Max File Size | 50MB |
| Allowed MIME Types | audio/mpeg, audio/wav, audio/flac, audio/aac, audio/ogg |
| Path Structure | `{hub_id}/{artist_id}/{track_id}.{ext}` |
| Cache-Control | N/A — served via signed URLs only |
| Signed URL Expiry | 4 hours |
| Upload Access | Service role only (admin upload flow) |
| Read Access | Server-side API route (validates subscription before generating URL) |

### Bucket: `mi-covers` — PUBLIC
| Property | Value |
|---|---|
| Visibility | PUBLIC — aggressively cached |
| Max File Size | 5MB |
| Allowed MIME Types | image/webp, image/jpeg, image/png |
| Path Structure | `{hub_id}/{artist_id}/{track_id}.webp` |
| Cache-Control | public, max-age=31536000, immutable |
| Upload Access | Hub Manager (own hub path only) |
| Read Access | Unrestricted public |

### Bucket: `mi-hub-assets` — PUBLIC
| Property | Value |
|---|---|
| Visibility | PUBLIC |
| Max File Size | 10MB |
| Allowed MIME Types | image/webp, image/jpeg, image/png, image/svg+xml |
| Path Structure | `hubs/{hub_id}/logo.webp`, `artists/{artist_id}/profile.webp` |
| Cache-Control | public, max-age=86400 |
| Upload Access | Hub Manager (own hub path only) |
| Read Access | Unrestricted public |

### Audio Delivery Flow (Complete)
```
1. User clicks Play on track [track_id]
2. Browser → POST /api/music/play { track_id }
3. Server reads auth session cookie (via @supabase/ssr)
4. Server queries mi_user_profiles WHERE id = user_id
5. Server validates: subscription_status, skip_count_today
6. If validation passes:
   a. INSERT into mi_listening_history (session started)
   b. Call mi_increment_play_count(track_id)
   c. Generate Supabase signed URL for mi-audio/{path} (4hr expiry)
   d. Return { signed_url, expires_at }
7. Browser loads <audio src={signed_url}>
8. Browser beacons to POST /api/music/analytics every 30s (play_duration_seconds)
9. On track end or skip: POST /api/music/analytics { completed, skip_timestamp_seconds }
10. Server UPDATE mi_listening_history SET completed, skip_timestamp_seconds
```

---

## 16. Data Integrity Laws

**Law 1 — Immutable Analytics:** Rows in `mi_click_tracking` and `mi_listening_history` are INSERT-only. No application code, API route, or database function shall UPDATE or DELETE them. Violations invalidate Artist Intelligence data.

**Law 2 — Atomic Counters:** `play_count`, `skip_count`, `completion_count` on `mi_tracks` and `total_clicks` on `mi_smart_links` are only modified via the dedicated `mi_increment_*` functions. Direct UPDATE in application code is prohibited.

**Law 3 — No Fabricated Metrics:** Any frontend component displaying analytics must source its data from a database view or query. Hardcoded numbers, estimated values, or projected figures are prohibited.

**Law 4 — Consent Before Capture:** A row cannot be inserted into `mi_audience` without `consent_timestamp`, `consent_text_version`, and `consent_ip_hash`. The database constraint enforces this, and the application layer must never attempt to bypass it.

**Law 5 — Hub Attribution is Mandatory:** Analytics rows (`mi_click_tracking`, `mi_listening_history`, `mi_audience`) must always carry a `hub_id`. An unattributed analytics event is worthless to Artist Intelligence.

**Law 6 — Soft Deletes Only:** No content row (`mi_tracks`, `mi_artists`, `mi_playlists`, `mi_client_hubs`) is hard-deleted. Set `is_active = false`.

---

## 17. Scalability Architecture

### Partition Strategy for `mi_click_tracking`
Monthly range partitions. At 10,000 clicks/day, the table reaches 300K rows/month. Without partitioning, 12-month queries scan 3.6M rows. With monthly partitions, the same query scans one 300K-row partition.

### Connection Pooling
Enable Supabase PgBouncer (transaction mode) for all application connections. Audio delivery requires high concurrency — 500 simultaneous users generating signed URLs will exhaust direct connections without pooling.

### Read Replicas (Phase 2)
Route analytics queries (hub dashboard, Artist Intelligence) to a Supabase read replica. Write operations (play events, audience capture) remain on the primary. This prevents analytics workloads from impacting real-time user experience.

### Materialised View Refresh Schedule
`mi_agent007_context` — refresh every 15 minutes via Supabase Cron  
`mi_discovery_leaderboard` — refresh every 1 hour  
All other views are standard (real-time) views.

---

## 18. GDPR & NDPR Compliance Architecture

### Nigeria Data Protection Regulation (NDPR) Requirements
- Explicit consent before collecting personal data ✓ (`consent_timestamp` NOT NULL)
- Record of consent version ✓ (`consent_text_version` NOT NULL)
- Right to erasure (deletion) ✓ (`deletion_requested_at` + 30-day processing SLA)
- Data minimisation ✓ (IP addresses are hashed, not stored raw)
- Purpose limitation ✓ (`acquisition_incentive` documents why data was collected)

### Right to Erasure Flow
```
1. User requests deletion via /api/music/audience/unsubscribe
2. Server sets opt_out_at = now(), deletion_requested_at = now()
3. Cron job (daily) finds records where deletion_requested_at < 30 days ago
4. Personal fields (email, whatsapp, telegram_username) are SET TO NULL
5. Row remains for aggregate count integrity, personal data is scrubbed
6. mi_click_tracking ip_hash is already anonymised — no action needed
```

### Data Retention Policy
| Data Type | Retention | Basis |
|---|---|---|
| Audience contacts (active) | Until opt-out | Consent |
| Audience contacts (opted out) | Scrubbed within 30 days | NDPR Article 3.1(9) |
| Click tracking rows | Indefinite (anonymised) | Legitimate interest — business analytics |
| Listening history (anonymous) | 12 months | Legitimate interest |
| Listening history (authenticated) | Duration of account + 90 days | Contractual |
| Subscription records | 7 years | Financial regulation |
