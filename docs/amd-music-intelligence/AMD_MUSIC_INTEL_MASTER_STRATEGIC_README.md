# AMD Music Intelligence — Master Strategic README

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Objectives](#objectives)
3. [Current Status](#current-status)
4. [Master Platform Architecture vs Client Hubs](#master-platform-architecture-vs-client-hubs)
5. [Future Roadmap](#future-roadmap)
6. [Dependencies](#dependencies)
7. [Risks](#risks)
8. [Decisions](#decisions)
9. [Action Items](#action-items)

---

## Executive Summary
AMD Music Intelligence is the master platform—a proprietary African Music Discovery Engine built within the AMD Solutions ecosystem. It is not a single artist's page or a simple streaming widget; it is a B2B2C ecosystem designed to host multiple record labels, artists, and playlists via dedicated "Client Hubs." 

## Objectives
- Establish AMD Music Intelligence as the central master platform for music discovery and curation.
- Launch the **Chrome Music Hub** as the *first* Client Hub—not the entire platform.
- Introduce **VaB** as the *first* artist and **Chrome AfroFusion Radio** as the *first* playlist.
- Ensure Audience Ownership (Email, WhatsApp, Telegram) is a strategic priority at every interaction point.
- Implement the AMD Click Tracking Layer to capture analytics before redirecting users to external DSPs (Spotify, Apple Music).

## Current Status
- **Phase:** Platform validation and pivot to Client Hub architecture.
- **Infrastructure:** The `apps/website` Next.js App Router is active.
- **Readiness:** The core database schemas, tracking layers, and audience ownership mechanisms are being designed to support a multi-tenant client ecosystem.

## Master Platform Architecture vs Client Hubs
- **AMD Music Intelligence:** The Master Platform, Recommendation Engine, and AI Curator backend.
- **Client Hubs:** Frontend representations of specific labels/entities (e.g., Chrome). The architecture natively supports scaling to multiple labels and artists without rebuilding the core.
- **Smart Links:** A critical feature, but only *one layer* of the overarching Discovery Engine.

## Future Roadmap
- **Phase 1 (MVP):** Deploy the AMD Click Tracking Layer, Audience Ownership capture flows, and the Chrome Music Hub pilot.
- **Phase 2 (Growth):** Launch the AI DJ, AI Curator, and proprietary African Music Discovery Engine.
- **Phase 3 (Enterprise):** Introduce Artist Intelligence analytics tools and scale to multiple Client Hubs.

## Dependencies
- **Frontend:** Next.js (App Router), Tailwind CSS.
- **Backend:** Supabase Auth, PostgreSQL (for multi-tenant data), and Storage.
- **Tracking:** Custom Click Tracking Layer before DSP redirects.

## Risks
- **Analytics Integrity:** Analytics widgets must *never* display fake numbers. Trust is the core of the Artist Intelligence offering.
- **Audience Friction:** Capturing WhatsApp/Email before releasing tracks may cause drop-off if not incentivized correctly.

## Decisions
- Chrome is a client, not the platform. VaB is an artist, not the center of the ecosystem.
- The Discovery Engine is treated as a core product offering alongside Smart Links.

## Action Items
- [ ] Implement the AMD Click Tracking Layer redirect logic.
- [ ] Design the multi-tenant database schema to group tracks/playlists by Client Hubs.
