# AMD Music Intelligence — Master Execution Blueprint (MEB)
## Volume I — Platform Experience

> **Classification:** Implementation Blueprint · Product Experience · Volume I of V  
> **Authority:** Subordinate to [AMC](../architecture/AMD_MUSIC_INTEL_AMC.md) · Implements [EAF](../architecture/AMD_MUSIC_INTEL_EAF.md) Layer 2 (Experience)  
> **Distinction:** The AMC governs *principles*. The EAF defines *structure*. The MEB defines *what the platform must do* and *how the user experience is intended to work*.

---

## Table of Contents

1. [Document Information](#1-document-information)
2. [Executive Summary](#2-executive-summary)
3. [Purpose](#3-purpose)
4. [Scope](#4-scope)
5. [Relationship to AMC and EAF](#5-relationship-to-amc-and-eaf)
6. [Platform Experience](#6-platform-experience)
7. [Smart Link Experience](#7-smart-link-experience)
8. [Motherboard Experience](#8-motherboard-experience)
9. [Listen Now Experience](#9-listen-now-experience)
10. [User Experience Principles](#10-user-experience-principles)
11. [Platform Design Principles](#11-platform-design-principles)
12. [Implementation Boundaries](#12-implementation-boundaries)
13. [References](#13-references)

---

## 1. Document Information

| Field | Value |
|---|---|
| **Title** | AMD Music Intelligence — Master Execution Blueprint (MEB) · Volume I — Platform Experience |
| **Version** | 1.0.0 |
| **Status** | Approved Draft |
| **Owner** | AMD Solutions 007 |
| **Approval Authority** | Solutions 007 — Chief Product Architect |
| **Effective Date** | 2026-07-04 |
| **Last Updated** | 2026-07-04 |
| **Volume** | I of V — Platform Experience |
| **MEB Series** | I — Platform Experience · II — Platform Intelligence · III — Business Platform · IV — Operations & Governance · V — Evolution & Roadmap *(Volumes II–V pending)* |

---

## 2. Executive Summary

Volume I of the Master Execution Blueprint defines the **intended platform experience** for AMD Music Intelligence — how users encounter the brand, navigate the Smart Link, interact with the motherboard, and convert to streaming through Listen Now.

This volume translates constitutional principles and enterprise architecture into **product behavior**: what users see, what they can do, and how each interaction is designed to feel. It is the permanent reference for anyone building, extending, or reviewing user-facing surfaces.

Volume I covers experience only. Platform intelligence, business platform, operations, governance, and evolution are reserved for MEB Volumes II–V and domain-specific documents.

---

## 3. Purpose

The MEB Volume I exists to:

- Define **what the platform experience must deliver** from a product perspective
- Document the **Smart Link as the primary acquisition and conversion surface**
- Establish the **motherboard** as the signature interaction model
- Clarify the **separation between streaming and discovery** in user-facing design
- Define **Listen Now** as the governed streaming conversion action
- Provide **UX and design principles** that guide all future experience work
- Set **implementation boundaries** so product intent is not confused with technical specification

This document answers: *What should the user experience?* It does not answer: *How is it coded, stored, or deployed?*

---

## 4. Scope

### In Scope (Volume I)

- Hero section and brand presentation
- Smart Link philosophy and user journey principles
- Motherboard layout — streaming layer and discovery layer
- Listen Now popup behavior and intent
- User experience principles
- Platform design principles
- Product-level implementation boundaries

### Out of Scope (Volume I)

- Source code, component libraries, and framework choices
- Database schema and data models
- API specifications and endpoint design
- Campaign-specific configurations
- AI intelligence behavior *(Volume II)*
- Analytics instrumentation detail *(Analytics Architecture document)*
- Deployment and operations *(AMOM)*

---

## 5. Relationship to AMC and EAF

| Document | Relationship to MEB Volume I |
|---|---|
| **[AMC](../architecture/AMD_MUSIC_INTEL_AMC.md)** | Supreme authority. MEB Volume I must comply with all constitutional principles and architectural laws. Where this document operationalizes an AMC law into product behavior, the law prevails on conflict. |
| **[EAF](../architecture/AMD_MUSIC_INTEL_EAF.md)** | Structural parent. MEB Volume I implements EAF Layer 2 (Experience Architecture) and consumes capabilities from Layer 4 (Application) without redefining layer boundaries. |

### Document Hierarchy

```
AMC (Constitution — principles & laws)
  └── EAF (Structure — eight enterprise layers)
        └── MEB (Master Execution Blueprint — five volumes)
              ├── Volume I — Platform Experience (this document)
              ├── Volume II — Platform Intelligence (pending)
              ├── Volume III — Business Platform (pending)
              ├── Volume IV — Operations & Governance (pending)
              └── Volume V — Evolution & Roadmap (pending)
                    └── AMOM · AKB · Analytics Architecture (domain depth)
```

MEB Volume I **does not restate** AMC principles or EAF layer definitions. It **implements** them as product experience requirements.

---

## 6. Platform Experience

### 6.1 Hero Section

The hero section is the **first impression** of every Smart Link and primary campaign surface. It establishes brand authority before any platform interaction occurs.

**Intended Experience:**

| Element | Product Intent |
|---|---|
| **Visual presence** | Premium, cinematic presentation — artist imagery, brand atmosphere, and intentional composition that signals quality and cultural relevance |
| **Brand badge** | AMD Music Intelligence identity visible — the platform owns the experience, not any single external service |
| **Headline hierarchy** | Primary message dominates; secondary message supports without competing |
| **Responsive behavior** | Hero scales gracefully across desktop, tablet, and mobile without losing impact or readability |
| **Non-interactive authority** | The hero establishes trust and context; it is not cluttered with competing calls to action |

The hero is an **institutional asset**. It is not redesigned per campaign without governed approval. Campaign differentiation occurs through content (imagery, artist, playlist context) — not through structural hero redesign.

### 6.2 Platform Identity

AMD Music Intelligence presents itself as:

- A **sovereign music intelligence platform** — not a third-party link tool
- A **premium, enterprise-grade surface** — black and gold aesthetic, intentional typography, governed glow and depth effects
- A **Master Platform entry point** — the user has arrived at AMD Music Intelligence; external platforms are destinations reached *through* this experience

Platform identity must remain **consistent across all Client Hubs, artists, and campaigns**. Tenant customization operates within identity guardrails — it does not replace platform identity.

### 6.3 Brand Messaging

#### Primary Headline — "Discover Africa's Biggest Hits"

| Attribute | Product Intent |
|---|---|
| **Purpose** | Communicate the platform's discovery mission and cultural focus |
| **Tone** | Authoritative, aspirational, inclusive of African music and diaspora |
| **Hierarchy** | Primary visual weight in the hero messaging stack |
| **Permanence** | Core brand message — not campaign-disposable copy |

#### Secondary Headline — "One Link. Every Platform."

| Attribute | Product Intent |
|---|---|
| **Purpose** | Communicate platform neutrality and unified access |
| **Tone** | Confident, concise, action-oriented |
| **Hierarchy** | Secondary to discovery message; supports without overshadowing |
| **Meaning** | One AMD Music Intelligence link routes users to every streaming and discovery destination they need |

Together, these messages establish the **value proposition** before the user interacts with the motherboard: discover great music here; reach every platform from here.

---

## 7. Smart Link Experience

### 7.1 Smart Link Philosophy

The Smart Link is the **primary acquisition and conversion surface** of AMD Music Intelligence. It is not a generic URL shortener. It is a governed platform experience that:

- Captures attention from social, advertising, and direct traffic
- Presents the platform identity and brand promise
- Routes users to streaming destinations or discovery channels through intentional interaction design
- Records engagement for analytics and intelligence *(behavior defined in Volume II and Analytics Architecture)*

The Smart Link is **one layer** of the broader Discovery Engine — but it is the most visible and highest-traffic layer.

### 7.2 Streaming-First Experience

When a user arrives with **intent to listen**, the platform prioritizes streaming conversion:

- Listen Now is immediately accessible as the primary sticky action
- The motherboard streaming layer presents active DSP destinations prominently
- Friction between arrival and playback initiation is minimized
- Discovery channels do not intercept or delay streaming intent

Streaming-first does not mean discovery is hidden — it means **listening intent is never blocked by discovery intent**.

### 7.3 Discovery-First Philosophy

When a user arrives with **intent to explore**, the platform supports discovery:

- Social discovery channels are accessible on the motherboard discovery layer
- Brand building and follower growth occur through governed profile links
- Discovery drives traffic *into* the ecosystem; streaming completes the journey

Discovery-first does not mean streaming is secondary in importance — it means **audience building and brand presence are first-class capabilities**, not afterthoughts bolted onto a link page.

### 7.4 Platform Neutrality

The Smart Link presents **no preferred streaming service** over another among active destinations. All live streaming platforms receive equal visual weight, equal interaction dignity, and equal routing quality.

Platform neutrality is a product commitment:

- No paid placement of one DSP over another within the motherboard
- Coming Soon platforms are clearly marked — never presented as broken or inferior active destinations
- User choice is respected; the platform facilitates access, not preference manipulation

### 7.5 Cross-Platform Accessibility

Users arrive from diverse devices, networks, and contexts. The Smart Link must:

- Render correctly on mobile, tablet, and desktop
- Support touch and pointer interaction equally
- Maintain readable typography and tappable targets at all viewport sizes
- Load with acceptable speed on typical mobile networks
- Present Open Graph and social sharing metadata for link previews *(sharing behavior governed separately)*

### 7.6 User Journey Principles

| Journey Stage | Intended Experience |
|---|---|
| **Arrival** | Immediate brand recognition — hero, messaging, platform identity |
| **Orientation** | User understands what this link offers without instruction |
| **Exploration** | Motherboard presents available platforms clearly — streaming and discovery separated |
| **Conversion (Streaming)** | Listen Now or motherboard streaming pill → Streaming Gateway → chosen DSP |
| **Conversion (Discovery)** | Motherboard discovery pill → official social profile in new context |
| **Departure** | User leaves to external platform with positive brand impression intact |

Every journey stage must feel **intentional, premium, and friction-minimized**.

---

## 8. Motherboard Experience

### 8.1 The Motherboard as Signature Experience

The motherboard is the **canonical visual and interaction identity** of AMD Music Intelligence user-facing surfaces. It is not a generic button grid. It is a designed system:

- **Central hub** — intelligence core representing the platform's AI and routing authority
- **Circuit routing** — visual connections linking the hub to platform pills on defined axes
- **Platform pills** — modular cartridges for each streaming or discovery destination
- **Layer separation** — streaming and discovery occupy distinct columns with distinct purpose

The motherboard is an **institutional asset** protected by AMC Law 1. Redesign requires formally approved design phase — not incremental drift.

### 8.2 Interaction Philosophy

| Principle | Product Behavior |
|---|---|
| **Clarity** | Each pill identifies one platform with icon and label — no ambiguity |
| **Status honesty** | Active platforms show live indicator; Coming Soon platforms show clear unavailable state |
| **Direct action** | Active pill tap opens destination immediately — no unnecessary intermediate steps |
| **Visual feedback** | Hover and active states confirm interactivity without distracting from content |
| **Symmetry of dignity** | No platform pill is visually demoted relative to peers within its layer |

### 8.3 Streaming Layer

The streaming layer routes users to **external DSP destinations** where full playback occurs. These are listening destinations — not social profiles, not marketing pages.

| Platform | Experience State | Product Behavior |
|---|---|---|
| **Spotify** | Active | Opens official streaming destination in new browsing context |
| **Apple Music** | Active | Opens official streaming destination in new browsing context |
| **Audiomack** | Active | Opens official streaming destination in new browsing context |
| **Boomplay** | Active | Opens official streaming destination in new browsing context |
| **SoundCloud** | Active | Opens official streaming destination in new browsing context |
| **YouTube Music** | Active | Opens official streaming destination in new browsing context |
| **Amazon Music** | Coming Soon | Disabled state with clear Coming Soon indicator — no routing |
| **Deezer** | Coming Soon | Disabled state with clear Coming Soon indicator — no routing |

**Streaming layer placement:** Left column of the motherboard (or equivalent defined axis on responsive layouts). Order reflects production-certified platform ordering — reordering requires governed approval.

### 8.4 Discovery Layer

The discovery layer routes users to **social discovery profiles** where audience building, content consumption, and brand engagement occur. These are not streaming destinations.

| Platform | Experience State | Product Behavior |
|---|---|---|
| **TikTok** | Active | Opens official AMD Music Intelligence profile in new browsing context |
| **Instagram** | Active | Opens official AMD Music Intelligence profile in new browsing context |

**Discovery layer placement:** Right column of the motherboard (or equivalent defined axis on responsive layouts). Discovery pills never appear in the Streaming Gateway.

### 8.5 Why Both Layers Coexist

Streaming and discovery serve **different user intents** and **different business outcomes**. They coexist on the motherboard because both are essential — but they must never be conflated.

| Dimension | Streaming Layer | Discovery Layer |
|---|---|---|
| **User intent** | Listen to music now | Follow, explore, engage with brand content |
| **Outcome** | Playback on external DSP | Audience growth on social platform |
| **Conversion type** | Listening conversion | Discovery conversion |
| **Gateway inclusion** | Yes — Listen Now popup | No — excluded by design |
| **Business value** | Distribution reach | Audience ownership and brand building |

A user who wants to **listen** uses the streaming layer or Listen Now. A user who wants to **follow the brand** uses the discovery layer. Presenting both on one surface — with clear separation — honors both intents without forcing a false choice.

This coexistence is governed by AMC Laws 2, 3, and 4. The MEB operationalizes those laws as product experience requirements.

---

## 9. Listen Now Experience

### 9.1 Purpose

Listen Now is the **primary streaming conversion action** on every Smart Link surface. It exists to serve users who arrive with listening intent and want the fastest path to their preferred streaming platform.

Listen Now is a **product commitment**, not a generic button. Its behavior is governed and permanent.

### 9.2 Intended Behavior

| Attribute | Product Requirement |
|---|---|
| **Action** | Opens the Streaming Gateway — a focused popup presenting active streaming destinations only |
| **Content** | Streaming platforms only — mirrors active motherboard streaming layer |
| **Exclusion** | Discovery platforms (TikTok, Instagram) never appear in Listen Now |
| **Friction** | Minimal — one tap to open gateway; one tap to reach chosen DSP |
| **Persistence** | Sticky placement — accessible without scrolling on mobile and desktop |
| **Visual weight** | Primary conversion action — highest prominence among interactive elements below hero |

### 9.3 Streaming Platforms Only

The Streaming Gateway presents only destinations where **full playback occurs**:

- Active streaming layer platforms appear
- Coming Soon platforms appear with disabled state — consistent with motherboard
- Social discovery platforms are **architecturally excluded** — not hidden, not deferred, not "coming later" within this popup

This exclusion is intentional product design, not a technical limitation.

### 9.4 Immediate Listening

The user journey from Listen Now tap to DSP arrival must feel **immediate**:

- Gateway opens without page navigation or full-screen reload
- Platform selection triggers direct routing to external destination
- No intermediate forms, gates, or marketing interstitials within the gateway *(audience capture flows, when present, are governed separately and must not block gateway access)*

### 9.5 Minimal Friction

Listen Now optimizes for **conversion velocity**:

- No account creation required to reach streaming destination
- No mandatory audience capture before gateway access
- Clear platform identification — user selects familiar icon and label
- Dismissible gateway — user can close and return to motherboard without penalty

---

## 10. User Experience Principles

These principles govern all platform experience decisions in Volume I and beyond.

| Principle | Definition |
|---|---|
| **Simplicity** | Every surface presents only what the user needs at that moment. Remove before adding. |
| **Speed** | Interactions feel instant. Perceived latency erodes trust and conversion. |
| **Accessibility** | Experiences are usable across devices, abilities, and network conditions. |
| **Mobile-First** | Design originates from mobile constraints; desktop extends — not the reverse. |
| **Consistency** | Interaction patterns, visual language, and behavior are uniform across Smart Links and campaigns. |
| **Platform Independence** | The experience belongs to AMD Music Intelligence — external platforms are destinations, not identity. |
| **Trust** | Status indicators are honest. Coming Soon means unavailable. Metrics are never fabricated in experience surfaces. |
| **Premium Visual Quality** | Presentation meets enterprise and cultural standards — intentional typography, governed color, refined motion. |

---

## 11. Platform Design Principles

Permanent design principles for all user-facing work. These operationalize AMC architectural laws as design discipline.

| Principle | Requirement |
|---|---|
| **Preserve the Motherboard** | Do not redesign the motherboard layout, routing visual, or hub structure without approved design phase. Extend — do not replace. |
| **Preserve Visual Identity** | Black and gold palette, premium glow effects, circuit routing aesthetic, and pill cartridge styling are institutional — not theme variables. |
| **Separate Streaming and Discovery** | Never merge streaming and discovery into a single undifferentiated platform list. Layer separation is permanent. |
| **Listen Now Is Streaming-Only** | Never add discovery platforms, marketing links, or non-DSP destinations to Listen Now or Streaming Gateway. |
| **Translation Over Redesign** | When extending experiences for new campaigns or clients, translate existing certified patterns — do not invent new layouts per campaign. |
| **Scalable UI** | Components and layouts must accommodate additional platforms, Client Hubs, and viewport sizes without structural rebuild. |
| **Honest Platform State** | Active, Coming Soon, and unavailable states must be visually distinct and semantically accurate. |
| **Responsive Intentionality** | Mobile layout is designed — not a collapsed desktop layout. Platform ordering and hierarchy remain meaningful at every breakpoint. |

---

## 12. Implementation Boundaries

This document defines **product behavior and experience intent**. It explicitly does not define:

| Domain | Belongs In |
|---|---|
| Source code, components, and styling implementation | Application codebase and frontend engineering documents |
| Database records, schemas, and queries | Database Master Blueprint and data architecture documents |
| API routes, endpoints, and payloads | Phase specifications and application architecture documents |
| Deployment, hosting, and CI/CD | AMOM and infrastructure documents |
| AI model behavior and agent constraints | Volume II (Platform Intelligence), AKB, and AI Operating System |
| Click tracking instrumentation | Analytics Architecture document |
| Campaign-specific URLs and configurations | Campaign configuration records and AMOM |

**Rule for implementers:** If a question asks *what the user should experience*, answer from MEB Volume I. If a question asks *how to build it*, consult downstream technical documents — not this one.

**Rule for product reviewers:** Any proposed experience change that violates AMC architectural laws or MEB design principles requires executive and architectural review before implementation.

---

## 13. References

Referenced by relative path only. Contents are not reproduced herein.

### Constitutional & Structural

| Document | Path |
|---|---|
| Architecture Master Charter | [`../architecture/AMD_MUSIC_INTEL_AMC.md`](../architecture/AMD_MUSIC_INTEL_AMC.md) |
| Enterprise Architecture Framework | [`../architecture/AMD_MUSIC_INTEL_EAF.md`](../architecture/AMD_MUSIC_INTEL_EAF.md) |

### MEB Series & Enterprise Suite (Volumes II–V and Domain — Not Reproduced Here)

| Document | Path |
|---|---|
| MEB Volume II — Platform Intelligence | *Pending — same file, future section* |
| MEB Volume III — Business Platform | *Pending — same file, future section* |
| MEB Volume IV — Operations & Governance | *Pending — same file, future section* |
| MEB Volume V — Evolution & Roadmap | *Pending — same file, future section* |
| Architecture Memory & Operations Manual | [`./AMD_MUSIC_INTEL_AMOM.md`](./AMD_MUSIC_INTEL_AMOM.md) |
| Agent Knowledge Base | [`../intelligence/AMD_MUSIC_INTEL_AKB.md`](../intelligence/AMD_MUSIC_INTEL_AKB.md) |
| AI Operating System | [`../intelligence/AMD_MUSIC_INTEL_AI_OPERATING_SYSTEM.md`](../intelligence/AMD_MUSIC_INTEL_AI_OPERATING_SYSTEM.md) |
| Analytics Architecture | [`../analytics/AMD_MUSIC_INTEL_ANALYTICS_ARCHITECTURE.md`](../analytics/AMD_MUSIC_INTEL_ANALYTICS_ARCHITECTURE.md) |
| Master Documentation Ledger | [`../governance/AMD_MUSIC_INTEL_MDL.md`](../governance/AMD_MUSIC_INTEL_MDL.md) |
| Documentation Integration Protocol | [`../governance/AMD_MUSIC_INTEL_DIP.md`](../governance/AMD_MUSIC_INTEL_DIP.md) |
| Documentation Entry Point | [`../README.md`](../README.md) |

### Strategic & Experience Legacy

| Document | Path |
|---|---|
| Master Strategic README | [`../AMD_MUSIC_INTEL_MASTER_STRATEGIC_README.md`](../AMD_MUSIC_INTEL_MASTER_STRATEGIC_README.md) |
| SmartLink System | [`../AMD_MUSIC_INTEL_SMARTLINK_SYSTEM.md`](../AMD_MUSIC_INTEL_SMARTLINK_SYSTEM.md) |
| Product Blueprint | [`../AMD_MUSIC_INTEL_PRODUCT_BLUEPRINT.md`](../AMD_MUSIC_INTEL_PRODUCT_BLUEPRINT.md) |

### Historical Production Records (Immutable — Experience Certification Authority)

| Document | Path |
|---|---|
| Phase 2A — SmartLink Spec | [`../AMD_MUSIC_INTEL_PHASE2A_SMARTLINK_SPEC.md`](../AMD_MUSIC_INTEL_PHASE2A_SMARTLINK_SPEC.md) |
| Phase 2F — Frontend Verification Report | [`../AMD_MUSIC_INTEL_PHASE2F_FRONTEND_VERIFICATION_REPORT.md`](../AMD_MUSIC_INTEL_PHASE2F_FRONTEND_VERIFICATION_REPORT.md) |
| Phase 2G — Streaming Destinations Report | [`../AMD_MUSIC_INTEL_PHASE2G_STREAMING_DESTINATIONS_REPORT.md`](../AMD_MUSIC_INTEL_PHASE2G_STREAMING_DESTINATIONS_REPORT.md) |
| Phase 2H — UAT Report | [`../AMD_MUSIC_INTEL_PHASE2H_UAT_REPORT.md`](../AMD_MUSIC_INTEL_PHASE2H_UAT_REPORT.md) |

---

*AMD Music Intelligence — Master Execution Blueprint (MEB)*  
*Volume I — Platform Experience · Version 1.0.0 · Approved Draft*  
*Effective 2026-07-04 · Authority: AMD Solutions 007*
