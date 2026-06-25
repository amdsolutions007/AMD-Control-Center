# AMD Agent 007 — Music Intelligence Data Architecture

**Document Class:** Implementation Foundation — Phase 1  
**Version:** 1.0.0  
**Date:** June 23, 2026  
**Authority:** Chief AI Architect / Chief Intelligence Officer  
**References:** AMD_MUSIC_INTEL_DATABASE_MASTER_BLUEPRINT.md  
**Status:** APPROVED FOR IMPLEMENTATION

> AMD Agent 007 is the master intelligence layer across the AMD ecosystem.
> It does not become a different agent inside Music Intelligence.
> It becomes a more capable agent, with more data, more tools, and more context.
> This document defines precisely what data Agent 007 needs, how it accesses it,
> and how it evolves through each intelligence capability.

---

## Table of Contents

1. [Architectural Position](#1-architectural-position)
2. [Agent 007 Today vs Tomorrow](#2-agent-007-today-vs-tomorrow)
3. [Mode Architecture](#3-mode-architecture)
4. [Data Access Architecture](#4-data-access-architecture)
5. [Music Discovery Intelligence](#5-music-discovery-intelligence)
6. [Artist Intelligence Data Layer](#6-artist-intelligence-data-layer)
7. [Client Hub Intelligence Data Layer](#7-client-hub-intelligence-data-layer)
8. [Audience Intelligence Data Layer](#8-audience-intelligence-data-layer)
9. [Playlist Intelligence Data Layer](#9-playlist-intelligence-data-layer)
10. [Analytics Intelligence Data Layer](#10-analytics-intelligence-data-layer)
11. [AI DJ Data Requirements (Phase 2)](#11-ai-dj-data-requirements-phase-2)
12. [Context Injection Architecture](#12-context-injection-architecture)
13. [Session & Memory Architecture](#13-session--memory-architecture)
14. [Tool Architecture](#14-tool-architecture)
15. [System Prompt Architecture](#15-system-prompt-architecture)
16. [Data Laws for Agent 007](#16-data-laws-for-agent-007)
17. [Evolution Roadmap](#17-evolution-roadmap)

---

## 1. Architectural Position

```
AMD ECOSYSTEM INTELLIGENCE LAYER
─────────────────────────────────────────────────────────
                    AMD AGENT 007
                   (One Agent. All Contexts.)
─────────────────────────────────────────────────────────
        │                           │
        ▼                           ▼
  CORPORATE MODE              MUSIC INTELLIGENCE MODE
  ─────────────               ─────────────────────
  B2B Lead Qual               Discovery Engine
  Client Support              Artist Intelligence
  Ecosystem Nav               Hub Analytics
  Agency Info                 Audience Insights
                              Playlist Curation
                              AI DJ (Phase 2)
─────────────────────────────────────────────────────────

DATA SOURCES:
  Corporate Mode:  Static system prompt (lib/openai.ts)
  Music Mode:      Dynamic tool-augmented queries against mi_* tables
```

Agent 007 is not split into two agents. The mode determines the system prompt, available tools, and data context injected before each conversation turn. The agent's identity, tone, and authority remain constant.

---

## 2. Agent 007 Today vs Tomorrow

### What Agent 007 Knows Today (Closed Book)

| Capability | Data Source | Status |
|---|---|---|
| AMD Solutions service offerings | Static system prompt | ✅ Live |
| Corporate pricing and timelines | Static system prompt | ✅ Live |
| Lead qualification questions | Static system prompt | ✅ Live |
| Client Portal navigation | Static system prompt | ✅ Live |
| AMD team and contact information | Static system prompt | ✅ Live |

**Critical Limitation:** Agent 007 today has no access to any live database. It cannot look up a client's status, check the latest automation run, or retrieve anything that changes. It operates entirely from text written into `lib/openai.ts` at the time of last deployment.

### What Agent 007 Must Know in Music Intelligence Mode (Open Book)

| Capability | Data Source | Phase |
|---|---|---|
| Full track catalog with metadata | `mi_agent007_context` (materialised view) | Phase 1 |
| User's current subscription tier | `mi_user_profiles` (via server-side query) | Phase 1 |
| User's listening preferences | `mi_user_profiles.agent_007_context` (JSONB) | Phase 1 |
| Artist performance summaries | `mi_artist_performance` (view) | Phase 1 |
| Hub analytics (for hub managers) | `mi_hub_performance` (view) | Phase 1 |
| Audience growth data | `mi_audience_growth` (view) | Phase 1 |
| Smart Link performance | `mi_smart_link_performance` (view) | Phase 1 |
| Track-level engagement | `mi_track_performance` (view) | Phase 1 |
| BPM and audio key for mixing | `mi_tracks` (direct query) | Phase 2 |
| Vector-based semantic similarity | `mi_tracks.embedding` (pgvector search) | Phase 2 |
| Predictive release intelligence | Derived from historical patterns | Phase 3 |

---

## 3. Mode Architecture

### Mode Detection Logic

Agent 007's mode is determined at the API route level before the OpenAI call is made. The mode is never left to the LLM to guess.

```
Request arrives at /api/agent007
    │
    ├── Route: /music-intelligence/*
    │       → mode = 'music_discovery' (default for music routes)
    │
    ├── Route: /music-intelligence/hubs/[hub_slug]/analytics
    │       → mode = 'artist_intelligence' (if user is hub manager)
    │
    ├── Route: /music-intelligence/dj
    │       → mode = 'dj' (Phase 2)
    │
    └── Route: /* (all other pages)
            → mode = 'corporate'
```

### Mode Definitions

| Mode | Trigger | System Prompt | Available Tools | Data Injected |
|---|---|---|---|---|
| `corporate` | Default / non-music routes | B2B agency prompt | None | None |
| `music_discovery` | `/music-intelligence/*` | Discovery Engine prompt | Catalog search, playlist generation | mi_agent007_context + user profile |
| `artist_intelligence` | `/music-intelligence/hubs/*/analytics` + hub manager auth | Analytics prompt | Hub analytics queries | mi_hub_performance + mi_artist_performance |
| `dj` | `/music-intelligence/dj` (Phase 2) | DJ prompt | Audio sequencing tools | BPM + key data from mi_tracks |

---

## 4. Data Access Architecture

### The Tool-Augmented Pattern

Agent 007 in Music Intelligence mode does not receive the entire database in its system prompt. That approach has three fatal flaws:
1. Token limits — as the catalog grows, it becomes impossible to fit in context
2. Cost — OpenAI charges per token; sending thousands of track records per request is financially unsustainable
3. Staleness — the prompt-stuffed data is only as fresh as the last deployment

Instead, Agent 007 uses **function calling (tool use)**. The LLM decides which tools to call, the server executes database queries, and the results are returned to the LLM as tool call responses. The LLM synthesises a response from real, live data.

### Tool Execution Flow

```
User: "Find me 5 energetic Afrobeats tracks for a workout"
    │
    ▼
API Route receives message + mode = 'music_discovery'
    │
    ├── Injects user context (subscription tier, preferred genres)
    ├── Injects mi_agent007_context summary (track count, available genres, hubs)
    │
    ▼
OpenAI API call with:
  - System prompt (music discovery mode)
  - User message
  - Available tools: [search_catalog, get_playlist, get_track_details]
    │
    ▼
LLM decides to call: search_catalog({genre: "Afrobeats", mood: "energetic", limit: 5})
    │
    ▼
Server executes:
  SELECT * FROM mi_agent007_context
  WHERE genre_name = 'Afrobeats'
    AND 'energetic' = ANY(mood_tags)
    AND energy_level >= 7
  LIMIT 5
    │
    ▼
Results returned to LLM as tool response
    │
    ▼
LLM synthesises final response:
  "Here are 5 energetic Afrobeats tracks to power your workout:
   1. [Track Title] by VaB — 128 BPM, Energy Level 9..."
    │
    ▼
Server logs conversation to chat_logs with:
  agent_mode = 'music_discovery'
  hub_id = (current hub context if applicable)
  music_context = {tracks_recommended: [...], session_mood: 'energetic'}
```

---

## 5. Music Discovery Intelligence

### What Agent 007 Needs

**Primary Data Source: `mi_agent007_context` (Materialised View)**

This is Agent 007's primary knowledge base for music. It is pre-computed and refreshed every 15 minutes. It is optimised for LLM consumption — no unnecessary columns, only what is needed for curation decisions.

**Available at Query Time (per conversation):**

| Data | Source | Purpose |
|---|---|---|
| Track list with metadata | `mi_agent007_context` | Semantic selection |
| User's preferred genres | `mi_user_profiles.preferred_genres` | Personalisation |
| User's listening history summary | `mi_user_profiles.agent_007_context` JSONB | "Don't repeat what they just heard" |
| Current hub context | `mi_client_hubs.slug` from route | Prioritise hub's own catalog |

### Discovery Query Patterns

**Pattern 1: Mood-to-Playlist**
User prompt → extract mood/activity keywords → filter `mi_agent007_context` by `mood_tags` and `energy_level` → return ordered track list.

**Pattern 2: Genre Deep Dive**
User prompt → identify genre → filter by `genre_name` → sort by `play_count` DESC (most validated tracks first).

**Pattern 3: Cultural Context**
User prompt → identify cultural signal ("Detty December", "Lagos traffic", "Sunday morning") → filter by `cultural_tags` → curate narrative around the cultural context.

**Pattern 4: Artist Deep Dive**
User prompt → identify artist → filter by `artist_name` → return full discography with context.

### The Catalog Summary Injection

At the start of every Music Intelligence conversation, the API injects a short catalog summary into the system prompt so Agent 007 has orientation without needing to query:

```
Catalog Status (refreshed 3 minutes ago):
- 47 active tracks across 1 hub
- Genres available: Afrobeats (31), Amapiano (8), Afro-Soul (8)
- Mood tags: energetic, late_night, chill, uplifting, introspective
- Artists: VaB (Chrome Music Hub)
- Featured playlist: Chrome AfroFusion Radio (31 tracks)
```

This summary is drawn from the materialised view, not injected as individual track rows.

---

## 6. Artist Intelligence Data Layer

### What Agent 007 Needs for Artist Intelligence Mode

Agent 007 in `artist_intelligence` mode answers questions posed by hub managers. Questions like:
- "How is VaB performing this week?"
- "Which track has the highest completion rate?"
- "Where are our listeners coming from?"
- "Which DSP is converting best?"

**Required Data Access:**

| Question Type | Data Source | View/Table |
|---|---|---|
| Overall artist performance | Aggregate plays, completions, clicks | `mi_artist_performance` |
| Track-level breakdown | Per-track engagement | `mi_track_performance` |
| DSP conversion analysis | Click destinations | `mi_click_tracking` (hub-scoped) |
| Geographic audience | Country breakdown | `mi_click_tracking.user_country` |
| Audience owned contacts | Email/WhatsApp/Telegram count | `mi_audience_growth` |
| Trending tracks | Completion rate leaders | `mi_discovery_leaderboard` |

### The Analyst Persona

When in `artist_intelligence` mode, Agent 007 adopts a data analyst persona. It:
1. Retrieves data via tool calls
2. Performs basic arithmetic comparisons (week-over-week, track-vs-track)
3. Identifies the most significant insight
4. Presents it in plain English with the supporting number
5. Recommends one clear action

Agent 007 does NOT:
- Fabricate trends that don't exist in the data
- Provide projections or forecasts without labelling them as estimates
- Round numbers for cosmetic purposes
- Report "approximately X" — it reports the exact count

**Example Interaction:**

```
Hub Manager: "How did VaB perform last week?"

Agent 007 (after tool calls):
"VaB logged 847 plays across 12 tracks last week.
 Top performer: 'Midnight in Lagos' — 234 plays, 71% completion rate.
 Weakest performer: 'Track 7' — 28 plays, 34% completion rate.
 DSP clicks: 156 total. Audiomack led with 89 clicks (57%), Spotify second at 43 (28%).
 4 new audience contacts were captured via Chrome AfroFusion Radio's Smart Link.

 One observation: Audiomack is significantly outperforming Spotify for VaB's audience.
 Consider prioritising Audiomack in your next Smart Link campaign."
```

---

## 7. Client Hub Intelligence Data Layer

### What Agent 007 Needs for Hub-Level Intelligence

Hub managers need to understand their hub's overall health, not just individual artist performance. Agent 007 must be able to answer hub-level questions.

**Required Data Access:**

| Question Type | Data Source |
|---|---|
| Total hub plays and engagement | `mi_hub_performance` |
| Best-performing playlist | `mi_playlists` ORDER BY total_plays DESC |
| Audience growth trend | `mi_audience_growth` (last 30 days) |
| Top Smart Link by clicks | `mi_smart_link_performance` |
| Total audience owned contacts | `mi_audience` COUNT(hub_id) |

### Multi-Hub Isolation in Agent 007

When a hub manager queries Agent 007, the server MUST inject the `hub_id` of their authenticated hub into every tool call. The LLM never constructs its own hub filter — the server does.

```
Hub Manager auth session → server reads mi_hub_managers → resolves hub_id
Hub_id is injected as a fixed parameter into all tool calls
Agent 007 cannot request data from a hub_id it was not given
```

This is not enforced by the LLM. It is enforced by the API route server logic. The LLM is given tools that already have the hub filter applied.

---

## 8. Audience Intelligence Data Layer

### What Agent 007 Needs for Audience Intelligence

**Required Data Access:**

| Insight | Source |
|---|---|
| Total owned contacts by channel | `mi_audience` GROUP BY hub_id, channel type |
| Acquisition source breakdown | `mi_audience.source_smart_link_id` join `mi_smart_links` |
| Daily capture rate | `mi_audience_growth` |
| Conversion rate (contact → DSP click) | `mi_smart_link_performance.conversion_rate_pct` |
| Opt-out rate | `mi_audience.opt_out_at IS NOT NULL` count |

### What Agent 007 Must Never Do with Audience Data

1. **Never expose individual contact details.** Agent 007 reports aggregates only. It never reveals a specific person's email or WhatsApp number, even to hub managers.
2. **Never suggest re-contacting opted-out users.** If a contact has `opt_out_at IS NOT NULL`, they do not exist in Agent 007's worldview.
3. **Never send messages to audience members.** Agent 007 analyses audience data; it does not initiate outbound communications.

---

## 9. Playlist Intelligence Data Layer

### What Agent 007 Needs for Playlist Intelligence

**Answering fan questions:**

| User Action | Agent 007 Response |
|---|---|
| "Add this to a playlist" | Creates row in `mi_user_playlists` + `mi_playlist_tracks` via tool |
| "What's playing next?" | Reads next `position` from active playlist via tool |
| "Tell me about this song" | Fetches track metadata from `mi_agent007_context` |
| "Save this playlist" | Creates `mi_user_playlists` record tied to user_id |

**Answering hub manager questions:**

| Question | Source |
|---|---|
| "How is Chrome AfroFusion Radio performing?" | `mi_playlists.total_plays` + `mi_track_performance` per playlist |
| "Which track in the playlist gets skipped most?" | `mi_listening_history.skip_timestamp_seconds` per playlist |
| "Should I reorder the playlist?" | Agent 007 analyses skip patterns and recommends position swaps |

### The Dynamic Playlist Optimisation Pattern

Agent 007 can identify that Track 4 in Chrome AfroFusion Radio has a 78% skip rate while Track 7 has an 89% completion rate. It can then recommend: "Consider moving 'Midnight in Lagos' from position 7 to position 4. Historical data suggests listeners who reach position 3 are 3x more likely to continue if the next track has high energy."

This is a data-informed recommendation, not an automatic reorder. The hub manager decides and executes the change via the dashboard. Agent 007 provides the intelligence.

---

## 10. Analytics Intelligence Data Layer

### Data Freshness Strategy

Agent 007 must always communicate data freshness to the user. A hub manager should know if they are seeing data from 2 minutes ago vs 2 hours ago.

| Data Source | Freshness | How Agent 007 Communicates This |
|---|---|---|
| `mi_agent007_context` | ~15 min (materialised) | "Catalog data refreshed 8 minutes ago" |
| `mi_click_tracking` | Real-time | "Live data as of this moment" |
| `mi_listening_history` | Real-time | "Live data as of this moment" |
| `mi_track_performance` | Real-time (view) | "Live data" |
| `mi_artist_performance` | Real-time (view) | "Live data" |
| `mi_hub_performance` | Real-time (view) | "Live data" |

### The Analytics Honesty Protocol

When Agent 007 retrieves data, the server must include row counts with the response. If the row count is below statistical significance, Agent 007 must acknowledge this:

```
"Chrome Music Hub has logged 23 clicks in the past 7 days.
 Note: This sample is still small. Patterns will become more reliable
 after 200+ clicks. Continue promoting Smart Links to build the dataset."
```

Agent 007 never says "Your Audiomack conversion rate is higher" when the Audiomack count is 3 and the Spotify count is 2. Three vs two is not a pattern. It is noise. The agent must recognise and communicate this.

---

## 11. AI DJ Data Requirements (Phase 2)

### What the AI DJ Needs That Does Not Exist Yet

The AI DJ capability in Agent 007 requires audio analysis metadata that is NOT collected by any current streaming platform's API. It must be computed during track ingestion.

**Required per track for AI DJ:**

| Column | Type | Purpose | Source |
|---|---|---|---|
| `bpm` | INTEGER | Beat matching and tempo transitions | Audio analysis library |
| `audio_key` | TEXT | Harmonic mixing (e.g., C major → G major) | Audio analysis library |
| `energy_level` | INTEGER 1-10 | Set arc building (warm-up → peak → cool-down) | Audio analysis library |
| `waveform_data` | JSONB | Visual waveform rendering in player UI | Pre-computed during upload |

**Audio Analysis Pipeline (Phase 2 Plan):**

When a track is uploaded to `mi-audio` bucket:
1. Upload event triggers a Supabase Edge Function
2. Edge Function downloads the audio file
3. Runs audio analysis (BPM detection, key estimation, energy profiling)
4. Updates `mi_tracks` with BPM, `audio_key`, `energy_level`
5. Generates waveform data JSON and stores in `mi_tracks.waveform_data`

This pipeline does not exist in Phase 1. In Phase 1, BPM and key can be manually entered by hub managers during track upload. The AI DJ capability launches when the auto-analysis pipeline is operational.

### Harmonic Mixing Logic (Phase 2)

Agent 007 in DJ mode uses the Camelot Wheel algorithm to identify harmonically compatible key transitions. A track in "C major" (8B on the Camelot Wheel) transitions smoothly to "G major" (9B) or "A minor" (8A). This data lives in `mi_tracks.audio_key` and drives the AI DJ's sequencing decisions.

---

## 12. Context Injection Architecture

### What Is Injected into Agent 007's Context Per Conversation

Every API call to Agent 007 in Music Intelligence mode includes a structured context block prepended to the system prompt. This context is assembled server-side from live database queries.

**Standard Music Discovery Context Block:**

```
=== AGENT 007 MUSIC INTELLIGENCE CONTEXT ===
Mode: music_discovery
Timestamp: [ISO timestamp]

User Context:
  - Authenticated: [true/false]
  - Subscription: [free/premium/studio]
  - Skips used today: [count] / [limit or "unlimited"]
  - Preferred genres: [list from mi_user_profiles.preferred_genres]

Catalog Summary (refreshed [N] minutes ago):
  - [Total] active tracks
  - Hubs: [Hub name list]
  - Genres available: [Genre name list with counts]
  - Mood tags available: [Tag list]

Active Hub Context:
  - Hub: [hub_name] (if browsing a specific hub)
  - Featured playlist: [playlist_name]

Recent Listening (this session):
  - [Last 3 tracks listened to, from music_context JSONB]
=== END CONTEXT ===
```

**Artist Intelligence Context Block:**

```
=== AGENT 007 ARTIST INTELLIGENCE CONTEXT ===
Mode: artist_intelligence
Hub: [hub_name] (ID: [hub_id])
Manager Role: [owner/editor/viewer]
Date Range: Last 30 days

Hub Overview:
  - Total plays: [count]
  - Total DSP clicks: [count]
  - Audience contacts: [count]
  - Active artists: [count]
  - Active tracks: [count]
=== END CONTEXT ===
```

### Context Size Management

The injected context must remain under 2,000 tokens. If the catalog grows large enough that the summary exceeds this, the summarisation logic must be compressed. Individual track details are NEVER injected into context — they are fetched via tool calls when needed.

---

## 13. Session & Memory Architecture

### Conversation Persistence

Agent 007 in Music Intelligence mode logs every conversation to the extended `chat_logs` table:

| Column | Value | Purpose |
|---|---|---|
| `session_id` | Browser UUID | Groups conversation turns |
| `user_id` | `auth.uid()` | Links to profile for personalisation |
| `hub_id` | Current hub context | Scopes analytics queries |
| `agent_mode` | `'music_discovery'` | Filters log analytics |
| `user_message` | Raw user input | Full conversation record |
| `bot_response` | Agent 007 response | Full conversation record |
| `music_context` | {tracks_played, playlist_active, mood} | Persistent session context |

### Session Memory Strategy

**Within a session (same `session_id`):**
Agent 007 receives the last 10 conversation turns as messages in the OpenAI API call. This is standard ChatGPT-style memory within a session. It allows Agent 007 to remember "they just asked for Afrobeats" when the user says "now make it slower."

**Across sessions (different `session_id`):**
Agent 007 reads `mi_user_profiles.agent_007_context` JSONB at the start of each session. This JSONB stores a compact representation of long-term music preferences:

```json
{
  "favourite_genres": ["Afrobeats", "Afro-Soul"],
  "frequently_played_artists": ["VaB"],
  "preferred_energy": "high",
  "last_ai_playlist": {
    "tracks": ["track_id_1", "track_id_2"],
    "prompt": "Energetic Lagos commute",
    "created_at": "2026-06-20T14:30:00Z"
  }
}
```

After each AI-generated playlist session, the server updates this JSONB with the latest session summary. This gives Agent 007 a memory that spans across browser sessions without requiring a full conversation history search.

---

## 14. Tool Architecture

### Phase 1 Tool Definitions

These are the database-backed tools available to Agent 007 in Music Intelligence mode. Each tool is a Next.js API handler that executes a validated Supabase query and returns structured JSON to the OpenAI tool_call response.

---

**Tool: `search_catalog`**

```
Purpose: Search the music catalog by genre, mood, energy, artist, or free-text
Input:
  - genre (string, optional): Genre name matching mi_genres.name
  - mood (string, optional): Tag matching mi_tracks.mood_tags
  - energy_min (integer 1-10, optional): Minimum energy level
  - artist (string, optional): Artist name partial match
  - hub_slug (string, optional): Restrict to specific hub
  - limit (integer, default 10, max 20)
Source: mi_agent007_context (materialised view)
Output: Array of {track_id, title, artist_name, genre_name, mood_tags, energy_level, duration_seconds, hub_slug}
```

---

**Tool: `get_playlist_tracks`**

```
Purpose: Retrieve ordered tracks from a named playlist
Input:
  - playlist_slug (string, required)
  - hub_slug (string, required)
Source: mi_playlist_tracks JOIN mi_playlists JOIN mi_tracks
Output: Array of {position, track_id, title, artist_name, duration_seconds}
```

---

**Tool: `create_user_playlist`**

```
Purpose: Save an AI-generated playlist to the user's profile
Input:
  - name (string, required)
  - track_ids (UUID[], required, max 30)
  - ai_prompt (string, required)
Requires: Authenticated user session
Source: INSERT into mi_user_playlists + mi_playlist_tracks
Output: {playlist_id, name, total_tracks}
```

---

**Tool: `get_artist_performance`** (artist_intelligence mode only)

```
Purpose: Retrieve performance summary for an artist
Input:
  - artist_id (UUID, optional — defaults to hub's primary artist)
  - hub_id (UUID, injected by server — never from LLM)
  - date_range (string: '7d', '30d', '90d')
Source: mi_artist_performance + mi_track_performance
Output: {artist_name, total_plays, completion_rate_pct, total_dsp_clicks, top_track, dsp_breakdown}
```

---

**Tool: `get_hub_analytics`** (artist_intelligence mode only)

```
Purpose: Retrieve hub-level analytics summary
Input:
  - hub_id (UUID, injected by server — never from LLM)
  - date_range (string: '7d', '30d', '90d')
Source: mi_hub_performance + mi_audience_growth + mi_smart_link_performance
Output: {total_plays, total_dsp_clicks, audience_contacts, top_artist, top_smart_link}
```

---

**Tool: `get_audience_summary`** (artist_intelligence mode only)

```
Purpose: Retrieve audience contact summary (AGGREGATES ONLY — no individual PII)
Input:
  - hub_id (UUID, injected by server)
Source: mi_audience_growth + mi_audience (aggregated)
Output: {total_contacts, email_count, whatsapp_count, telegram_count, growth_last_7d, opt_out_count}
```

---

### Tool Security Rules

1. **Hub ID is always server-injected.** The LLM never constructs a `hub_id` from user input. The server reads the authenticated user's hub assignment and injects it as a fixed parameter.
2. **PII is never returned.** No tool returns individual email addresses, WhatsApp numbers, or user_ids.
3. **LLM cannot write to analytics tables.** Tools that write data (`create_user_playlist`) are restricted to user data tables only. The LLM cannot insert into `mi_click_tracking`, `mi_listening_history`, or `mi_audience`.
4. **Tool responses are validated.** Before returning tool results to the LLM, the server validates that all returned `track_id`s exist in the active catalog. Phantom track IDs are removed.

---

## 15. System Prompt Architecture

### Corporate Mode System Prompt (Existing — Summarised)
Currently defined in `lib/openai.ts`. Describes AMD Solutions 007, its services, pricing, and the Agent 007 persona. Remains unchanged.

### Music Discovery Mode System Prompt (New)
Extends the base Agent 007 identity with music intelligence capabilities:

```
[Context block injected here — see Section 12]

You are AMD Agent 007, operating in Music Intelligence Mode.

You are the intelligence layer for AMD Music Intelligence — Africa's premier music
discovery platform. You help listeners find their perfect soundtrack, curate
personalised playlists, and explore African music with unparalleled depth.

You have access to the catalog of AMD Music Intelligence via your search tools.
Always use your tools to retrieve live data. Never invent track titles, artist
names, or play counts. If a user asks for something outside the available catalog,
say so clearly and suggest the closest available alternative.

Your tone in this mode is warm, knowledgeable, and culturally grounded.
You understand Afrobeats, Amapiano, Highlife, and the full spectrum of African music.
You speak to fans and music lovers, not executives.

When generating a playlist:
1. Call search_catalog to retrieve matching tracks
2. Verify you have actual track data before presenting it
3. Present tracks with brief, authentic cultural context
4. Always offer to save the playlist if the user is logged in

Never fabricate track titles or artist names.
Never report play counts or analytics figures you did not retrieve via a tool.
```

### Artist Intelligence Mode System Prompt (New)
Transforms Agent 007 into a data analyst persona for hub managers:

```
[Context block injected here — see Section 12]

You are AMD Agent 007, operating in Artist Intelligence Mode.

You are the analytics intelligence layer for AMD Music Intelligence.
You help Client Hub managers and artists understand their performance data
and make informed decisions about promotion, scheduling, and content strategy.

You have access to hub analytics via your analytics tools.
All data you present must come from a tool call.
Never estimate, project, or fabricate metrics.

If asked for data that is statistically insufficient (fewer than 50 data points),
acknowledge the limitation explicitly and recommend patience and continued promotion
to build a meaningful dataset.

Your tone is authoritative, precise, and actionable.
After presenting data, always conclude with one clear recommendation.
```

---

## 16. Data Laws for Agent 007

These laws are absolute. They govern every interaction between Agent 007 and the AMD Music Intelligence database.

**Law 1 — Tool Before Talk**  
Agent 007 must never discuss music catalog contents, analytics figures, or audience data without first executing a tool call. If the API route detects the agent is presenting catalog data without a corresponding tool call, the response is flagged for review.

**Law 2 — Hub ID Integrity**  
The `hub_id` used in every tool call is injected by the server from the authenticated user's `mi_hub_managers` record. It is never constructed from user input, URL parameters parsed by the LLM, or any other untrusted source.

**Law 3 — Aggregate-Only PII**  
Agent 007 has no tool that returns individual audience contact information. It can count contacts, analyse acquisition sources, and report growth rates. It cannot name a contact or reveal their WhatsApp number.

**Law 4 — Statistical Honesty**  
Agent 007 must acknowledge when sample sizes are insufficient for reliable insight. The threshold is 50 events for any analytics statement. Below 50, Agent 007 presents the raw number only and notes that patterns are not yet meaningful.

**Law 5 — No Fabrication**  
Agent 007 must not generate track titles, artist names, play counts, or any music-related factual claims from its training data. All such information must come from tool call responses. The system prompt explicitly enforces this.

**Law 6 — Mode Purity**  
Agent 007 in `music_discovery` mode does not answer B2B agency questions. Agent 007 in `corporate` mode does not attempt to curate playlists. Mode boundaries are enforced by the system prompt and tool availability, not by hoping the LLM respects context.

---

## 17. Evolution Roadmap

### Phase 1 — Tool-Augmented Curation (MVP)
- Route-aware mode switching
- Catalog search via `mi_agent007_context` materialised view
- Playlist generation and saving
- Basic Artist Intelligence queries for hub managers
- Session memory via `chat_logs` extension

### Phase 2 — Semantic Intelligence
- pgvector semantic search (replace exact-match filtering)
- Expanded Artist Intelligence analytics (geographic, temporal, DSP comparison)
- AI DJ sequencing using BPM and harmonic mixing data
- Cross-session memory via `mi_user_profiles.agent_007_context` JSONB updates
- Anomaly detection ("VaB just got 3x normal clicks from Ghana — worth investigating")

### Phase 3 — Predictive & Generative Intelligence
- Release timing recommendations based on historical performance patterns
- Audience growth predictions from trajectory data
- Multi-hub benchmarking (opt-in, anonymised)
- Generative audio narration between AI DJ tracks (OpenAI TTS — Onyx voice)
- B2B API: Third-party platforms can query Agent 007's intelligence via licensed API

### The One Rule That Governs All Phases
As Agent 007 gains more capabilities, more data access, and more tools, one rule never changes: **every number it reports is real, every track it names exists, and every recommendation is based on evidence.** The moment Agent 007 fabricates a metric, the entire Artist Intelligence proposition collapses. This is a technical constraint, a contractual obligation to Client Hubs, and a brand law.
