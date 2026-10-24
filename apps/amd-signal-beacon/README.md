# AMD Signal Beacon

AMD Signal Beacon is a curated technology briefing surface within the AMD Solutions 007 ecosystem.

## Public role

Signal Beacon organizes selected technology, AI and African digital-economy briefings from attributed sources. It is designed for discovery and RSS distribution.

It is **not** presented as:
- a prediction engine;
- a verified client-results database;
- a premium war-room product;
- a secure analytics command center;
- or a substitute for checking original sources.

## Public surfaces

- Main briefing surface: https://amd-signal-beacon.vercel.app/
- RSS feed: https://amd-signal-beacon.vercel.app/api/feed
- Main AMD Intelligence service: https://www.amdsolutions007.com/intelligence

## Evidence rule

Summaries and classifications should preserve source attribution. Material claims, dates and decisions should be checked against the original publication. Public performance, revenue, client, rating or accuracy claims require supporting evidence before publication.

## Analytics security

The historical browser-password / sessionStorage admin dashboard has been retired. Do not restore it with a NEXT_PUBLIC_* password or another browser-visible secret.

Any future administrative analytics surface must use one of:
- server-side authentication;
- Supabase/Vercel/provider-managed access;
- or another independently reviewed protected backend.

Historical localStorage telemetry may be used as local browser diagnostics only. It is not a central source of truth.

## Environment variables

Use local or provider-managed secrets. Do not commit credentials.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=
OPENAI_API_KEY=
```

## Development

```bash
npm install
npm run dev
```

## Content

- Article/feed sources are handled by the Signal Beacon ingestion layer.
- Briefings appear under `/signal/[slug]`.
- The RSS endpoint is `/api/feed`.

## Current governance

Signal Beacon is maintained as a discovery/content surface. Commercial consulting and decision-support requests should route back to AMD Solutions 007 rather than being represented as autonomous Signal Beacon products.
