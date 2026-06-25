# AMD Music Intelligence — Platform Architecture

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Objectives](#objectives)
3. [Current Status](#current-status)
4. [Master Platform Database Schema](#master-platform-database-schema)
5. [Dependencies](#dependencies)
6. [Risks](#risks)
7. [Decisions](#decisions)
8. [Action Items](#action-items)

---

## Executive Summary
This document defines the technical architecture for the AMD Music Intelligence platform. It outlines the schema and infrastructure required to support a Master Platform that serves multiple labels, artists, and playlists via isolated Client Hubs.

## Objectives
- Standardize data models to support an N-tier hierarchy: Platform -> Client Hub -> Artist -> Playlist/Track.
- Implement the AMD Click Tracking Layer for external DSP redirects.
- Ensure true, verifiable analytics processing.

## Current Status
- **Architecture Defined:** Blueprint finalized based on Validation Audit to enforce multi-tenancy.

## Master Platform Database Schema

```sql
-- Client Hubs (e.g., Chrome)
CREATE TABLE mi_client_hubs (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE
);

-- Artists (e.g., VaB)
CREATE TABLE mi_artists (
  id UUID PRIMARY KEY,
  hub_id UUID REFERENCES mi_client_hubs(id),
  name TEXT
);

-- Audience Ownership
CREATE TABLE mi_audience (
  id UUID PRIMARY KEY,
  email TEXT,
  whatsapp TEXT,
  telegram TEXT,
  source_hub_id UUID REFERENCES mi_client_hubs(id)
);

-- Track Catalog
CREATE TABLE mi_tracks (
  id UUID PRIMARY KEY,
  artist_id UUID REFERENCES mi_artists(id),
  title TEXT,
  dsp_links JSONB -- Links to Spotify, Apple, etc.
);

-- Click Tracking Analytics (STRICT: Real data only)
CREATE TABLE mi_click_tracking (
  id UUID PRIMARY KEY,
  track_id UUID REFERENCES mi_tracks(id),
  destination_dsp TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ
);
```

### AMD Click Tracking Layer
- **Flow:** User clicks a "Listen on Spotify" button.
- **Action:** Request hits `GET /api/music/redirect?trackId=X&dsp=spotify`.
- **Process:** Node.js inserts a record into `mi_click_tracking`, then responds with `302 Found` redirecting the user to the actual Spotify URL.

### Analytics Architecture
- All frontend widgets pulling play counts or click-through rates MUST aggregate directly from `mi_click_tracking` or `mi_listening_history`. Hardcoding or inflating metrics is strictly prohibited.

## Dependencies
- `@supabase/ssr` for Next.js App Router.
- Vercel Edge Functions for ultra-low latency redirect handling.

## Risks
- Data isolation between Client Hubs. RLS policies must strictly prevent Client A from viewing Client B's Artist Intelligence data.

## Decisions
- Chrome is built as a row in `mi_client_hubs`, guaranteeing that future clients require zero architectural rewrites.

## Action Items
- [ ] Finalize RLS policies for multi-tenant data access.
