# Google APIs to Enable (Professional Setup)

You asked: “confirm all the Google API in my virtual studio” + “tell me the APIs to enable”.

## What your workspace already shows
From your repo, you already use or prepared:
- **YouTube Data API v3** (OAuth client + saved token in `social_engine/`)
- **Google Ads API** (connector exists; needs env vars)

## What to enable for Google Business Profile + Maps
Google Business Profile setup can be done manually in the GBP UI, but APIs are helpful for automation and scaling.

### A) Required if you want to automate Business Profile actions (optional)
Enable these in Google Cloud Console (same project as your OAuth client):
- **Business Profile API** (Google Business Profile)

Common automation uses:
- Manage locations, hours, descriptions
- Publish posts/updates (where supported)
- Read insights (views, calls, direction requests)

### B) Recommended for Maps presence + lead/geo features (optional)
Enable if you want location lookup, lead enrichment, or map-based features:
- **Places API** (for business discovery/search details)
- **Geocoding API** (address → coordinates)
- **Directions API** (route links, delivery/service routing)
- **Maps JavaScript API** (if embedding interactive maps on your website)

### C) Website tracking / professionalism (high value)
These are not “APIs” in the same way, but they’re the pro stack:
- **Google Analytics 4 (GA4)** — create a GA4 property
- **Google Tag Manager (GTM)** — container for tracking pixels/tags
- **Google Search Console** — verify domain + monitor SEO health

### D) Advertising (already in repo)
- **Google Ads API** (already present in code; enable in Cloud Console if you want programmatic reporting)

## OAuth credentials you’ll likely need
To use Google APIs from scripts:
- OAuth consent screen configured
- OAuth client type:
  - “Desktop app” (good for local scripts)
  - “Web application” (good for website/server)
- Test users / verified app status (depends on scopes)

## Notes on cost & safety
- Maps APIs can cost money when usage grows. Put **budgets + quotas** on day 1.
- Never store API keys in source control.
