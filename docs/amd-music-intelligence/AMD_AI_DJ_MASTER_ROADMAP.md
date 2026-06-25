# AMD Music Intelligence — Discovery Engine & AI Roadmap

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Objectives](#objectives)
3. [Current Status](#current-status)
4. [Core Intelligence Pillars](#core-intelligence-pillars)
5. [Dependencies](#dependencies)
6. [Risks](#risks)
7. [Decisions](#decisions)
8. [Action Items](#action-items)

---

## Executive Summary
The AMD Music Intelligence platform is fundamentally an **African Music Discovery Engine**. The AI roadmap extends far beyond a simple chatbot, encompassing four distinct pillars: the AI Curator, the AI DJ, the Recommendation Engine, and Artist Intelligence.

## Objectives
- Position AMD Music Intelligence as the premier discovery tool for African music.
- Develop distinct roadmaps for curation, mixing, algorithmic recommendation, and B2B artist analytics.

## Current Status
- **Phase:** Roadmap Expansion and Definition.

## Core Intelligence Pillars

### 1. Recommendation Engine Roadmap
- **Goal:** Algorithmic surfacing of music based on user listening history.
- **Implementation:** Collaborative filtering and tag-based similarity (pgvector). The engine powers the "Discover" feed across all Client Hubs, helping users find artists beyond their initial entry point (e.g., discovering new artists via the Chrome Music Hub).

### 2. AI Curator Roadmap
- **Goal:** Conversational generation of playlists.
- **Implementation:** Uses `gpt-4o-mini` to map user prompts ("Energetic Lagos traffic mix") to catalog metadata. Operates as an interactive layer on top of the Recommendation Engine.

### 3. AI DJ Roadmap
- **Goal:** Generative audio and seamless transitions.
- **Implementation:** A future-state capability allowing the platform to dynamically mix tracks, crossfade, and eventually generate unique audio elements (drops, transitions) using specialized audio LLMs.

### 4. Artist Intelligence Roadmap
- **Goal:** Actionable analytics for Client Hubs and Artists.
- **Implementation:** Leveraging the AMD Click Tracking Layer to provide VaB (and future artists) with pristine, verifiable data on audience demographics, retention, and cross-platform conversions. *Rule: Zero fabricated metrics.*

## Dependencies
- Robust underlying tracking data from `mi_click_tracking` and `mi_listening_history`.
- OpenAI API for the Curator; specialized ML models for future DJ features.

## Risks
- Data sparsity in the early days may limit the effectiveness of the Recommendation Engine.
- *Mitigation:* Rely heavily on the AI Curator (metadata-driven) until sufficient user behavioral data is collected.

## Decisions
- The African Music Discovery Engine is the core product value proposition, distinguishing the platform from generic link aggregators.

## Action Items
- [ ] Define the tagging taxonomy for African music genres and moods to feed the AI Curator.
