# AMD Music Intelligence — Product Blueprint

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Objectives](#objectives)
3. [Current Status](#current-status)
4. [Master Platform Ecosystem](#master-platform-ecosystem)
5. [Dependencies](#dependencies)
6. [Risks](#risks)
7. [Decisions](#decisions)
8. [Action Items](#action-items)

---

## Executive Summary
This document provides the high-level business blueprint for AMD Music Intelligence. It outlines the strategic positioning of the Master Platform, its B2B2C business model, and the critical importance of Audience Ownership and verifiable analytics in building the ultimate African Music Discovery Engine.

## Objectives
- Launch a Master Platform capable of housing infinite Client Hubs.
- Deploy the Chrome Music Hub, VaB, and Chrome AfroFusion Radio as successful pilots to prove the model.
- Capture Audience Ownership (Email, WhatsApp, Telegram) to build a proprietary marketing database.

## Current Status
- **Strategy Realignment Complete:** The product is definitively architected as a Master Platform. Features like Smart Links are demoted to tactical tools, while the Discovery Engine is elevated to the core product.

## Master Platform Ecosystem

### 1. B2B2C Business Model
- **B2B (Client Hubs):** Record labels, collectives, or agencies (like Chrome) utilize the platform to host their artists, distribute Smart Links, and access the Artist Intelligence dashboard for verifiable analytics.
- **B2C (Listeners):** Users interact with the African Music Discovery Engine to find new music, interact with the AI Curator, and stream playlists like Chrome AfroFusion Radio.

### 2. Audience Ownership as Capital
Instead of blindly passing traffic to external DSPs, AMD Music Intelligence intercepts users to capture contact information. This owned audience (Email/WhatsApp/Telegram lists) becomes the platform's most valuable asset, enabling direct-to-fan marketing free from algorithmic suppression.

### 3. Verifiable Analytics
The AMD Click Tracking Layer ensures every interaction is recorded. The platform distinguishes itself by providing strictly factual, unmanipulated data to Artist Intelligence dashboards, building absolute trust with Client Hub owners.

## Dependencies
- Multi-tenant database architecture.
- Seamless, low-friction Audience Ownership capture mechanisms.

## Risks
- Client Hubs may prefer to bypass the AMD Click Tracking Layer to send users directly to DSPs. 
- *Mitigation:* Demonstrate the superior ROI of Audience Ownership and Artist Intelligence compared to raw DSP streams.

## Decisions
- Chrome is officially the first Client Hub. It will serve as the template for onboarding future labels and collectives.
- Every architectural decision must pass the "Does this scale to multiple clients and artists?" test.

## Action Items
- [ ] Prepare the B2B pitch deck outlining the Artist Intelligence benefits to onboard the second Client Hub.
