# AMD Music Intelligence — Todo Roadmap

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Objectives](#objectives)
3. [Current Status](#current-status)
4. [Future Roadmap](#future-roadmap)
5. [Dependencies](#dependencies)
6. [Risks](#risks)
7. [Decisions](#decisions)
8. [Action Items](#action-items)

---

## Executive Summary
This document outlines the tactical execution plan for building the AMD Music Intelligence Master Platform and its initial Client Hubs. 

## Objectives
- Provide a clear, linear path to a fully functional streaming, discovery, and tracking MVP.
- Integrate Audience Ownership and Click Tracking directly into the core loop.

## Current Status
- **Completed:** Strategic Validation Audit and realignment toward a multi-tenant Master Platform architecture.

## Future Roadmap

### Phase 1: The Core Foundation & Tracking (MVP)
- **1. Multi-Tenant Database Setup**
  - [ ] Run SQL migrations for `mi_client_hubs` (e.g., Chrome), `mi_artists` (e.g., VaB), `mi_tracks`, `mi_playlists`.
  - [ ] Implement `mi_audience_contacts` to store captured Email/WhatsApp/Telegram data.
- **2. AMD Click Tracking Layer & Smart Links**
  - [ ] Build the redirect interceptor middleware. (User clicks Smart Link -> Intercept -> Log Analytics -> Redirect to Spotify/Apple).
  - [ ] Ensure click tracking is tied to the correct Client Hub and Artist.
- **3. Audience Ownership Implementation**
  - [ ] Build high-conversion capture forms (Email/WhatsApp) required to unlock exclusive playlists or AI features.
- **4. Pilot Deployment**
  - [ ] Deploy the "Chrome Music Hub" as the first frontend representation.
  - [ ] Deploy "Chrome AfroFusion Radio" as the flagship playlist.

### Phase 2: The Discovery Engine
- **1. Recommendation Engine**
  - [ ] Implement collaborative filtering or tag-based similarity scoring for the African Music Discovery Engine.
- **2. AI Curator & AI DJ**
  - [ ] Launch the conversational AI interface allowing users to generate custom mixes from the master catalog.
- **3. Real Analytics Widgets**
  - [ ] Build the frontend dashboards for users and artists. *Strict Rule: No fake numbers.*

### Phase 3: Artist Intelligence & Enterprise
- **1. Artist Intelligence Portal**
  - [ ] Provide Client Hub owners (like Chrome) with deep analytics on listener demographics, retention, and DSP conversion rates.

## Dependencies
- Supabase SQL Editor access for relational schema updates.
- External DSP integrations for verifying redirect accuracy.

## Risks
- Click Tracking Layer latency. It must resolve and redirect in under 300ms to prevent drop-off.

## Decisions
- The roadmap now prioritizes the tracking layer and audience capture over standalone UI flair, ensuring the business model is viable from day one.

## Action Items
- [ ] Draft the specific Next.js API routes required for the Click Tracking Layer.
