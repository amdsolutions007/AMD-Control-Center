# AMD Music Intelligence — SmartLink System

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Objectives](#objectives)
3. [Current Status](#current-status)
4. [Layer Integration](#layer-integration)
5. [Dependencies](#dependencies)
6. [Risks](#risks)
7. [Decisions](#decisions)
8. [Action Items](#action-items)

---

## Executive Summary
The SmartLink System is a critical feature, but it is *only one layer* of the overarching AMD Music Intelligence Discovery Engine. It serves as the primary acquisition funnel, routing social traffic into the Master Platform and enforcing Click Tracking and Audience Ownership before handoff to external DSPs.

## Objectives
- Create dynamic, trackable links with rich Open Graph metadata.
- Intercept external outbound traffic using the AMD Click Tracking Layer.
- Convert anonymous clickers into owned audiences (Email, WhatsApp, Telegram).

## Current Status
- **Strategy Updated:** SmartLinks are no longer viewed as the core product, but as the transport layer feeding the African Music Discovery Engine.

## Layer Integration

### 1. Audience Ownership Gate
Before a SmartLink resolves to external streaming platforms (or the internal player), users may be presented with a lightweight capture flow (e.g., "Enter WhatsApp to unlock exclusive Chrome AfroFusion Radio mixes").

### 2. The AMD Click Tracking Layer
When a user selects their preferred DSP (Spotify, Apple Music) from a SmartLink landing page:
1. They hit an internal API route (e.g., `/api/go/spotify/[track_id]`).
2. The server logs the click, timestamp, and referring Client Hub to ensure accurate Artist Intelligence analytics.
3. The server executes a `302 Redirect` to the DSP.

## Dependencies
- Next.js Metadata API for Open Graph.
- Vercel Edge Middleware for sub-100ms redirects.

## Risks
- Over-gating with Audience Ownership forms could decrease DSP conversion rates. 
- *Mitigation:* Make Audience capture optional or incentivize it heavily (e.g., exclusive AI Curator access).

## Decisions
- SmartLinks must be natively multi-tenant. A link must attribute its traffic back to the specific Client Hub (e.g., Chrome) and Artist (e.g., VaB).

## Action Items
- [ ] Design the UI for the SmartLink landing page incorporating the Click Tracking DSP buttons and the Audience Ownership form.
