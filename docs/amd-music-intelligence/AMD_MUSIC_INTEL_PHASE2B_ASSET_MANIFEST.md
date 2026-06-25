# AMD MUSIC INTELLIGENCE — PHASE 2B ASSET MANIFEST
## PRODUCTION MEDIA & STORAGE DEPLOYMENT SPECIFICATION
> **Official Product Delivery Manifest & Infrastructure Storage Mapping Ledger**  
> **Target Platform:** AMD Music Intelligence Ecosystem (Supabase Storage Architecture)  
> **Campaign Focus:** Friday Launch Campaign (*Chrome Music Hub | VaB | Chrome AfroFusion Radio*)  
> **Document Version:** 1.0.0 | **Date:** 2026-06-25 | **Authority:** Product Delivery Architect, AMD Solutions 007  

---

## EXECUTIVE PREAMBLE

With the Phase 1 Database Foundation frozen and production certified, and the Phase 2A Smart Link Product Specification formally approved, platform engineering enters **Phase 2B**. This manifest is the authoritative single source of truth for every visual graphic, branding wordmark, vector icon pack, raster artwork variant, and private acoustic audio preview required to launch Version 1 of the Friday campaign. 

Before any frontend React / Next.js component code is authored, all physical assets cataloged herein must be optimized, formatted, named, uploaded, and verified inside the Supabase Storage infrastructure (`mi-covers`, `mi-hub-assets`, `mi-audio`) on `Client-Portal-007`.

---

## TABLE OF CONTENTS
1. [Section 1: Complete Asset Inventory](#section-1-complete-asset-inventory)
2. [Section 2: Storage Bucket Mapping & Isolation Boundaries](#section-2-storage-bucket-mapping--isolation-boundaries)
3. [Section 3: Permanent File Naming Grammar](#section-3-permanent-file-naming-grammar)
4. [Section 4: Exact Technical Image Specifications](#section-4-exact-technical-image-specifications)
5. [Section 5: CDN Caching & Invalidation Strategy](#section-5-cdn-caching--invalidation-strategy)
6. [Section 6: Frontend Asset Loading & Render Priorities](#section-6-frontend-asset-loading--render-priorities)
7. [Section 7: Developer Production Upload Verification Checklist](#section-7-developer-production-upload-verification-checklist)
8. [Section 8: Version 1 Launch Readiness Report](#section-8-version-1-launch-readiness-report)

---

## SECTION 1: COMPLETE ASSET INVENTORY

The Friday launch campaign requires exactly **22 distinct production media assets** categorized across 5 functional UI domains.

### 1.1 Master Branding Assets
1. **AMD Music Intelligence Crest:** Primary enterprise ecosystem brand emblem.
2. **Chrome Music Hub Wordmark:** B2B record label primary typography wordmark.
3. **AMD Solutions 007 Corporate Emblem:** Parent conglomerate verification stamp.
4. **Verified Gold Metallic Credential:** 24K Gold `#D4AF37` metallic authentication badge.

### 1.2 Editorial Playlist Assets
5. **Chrome AfroFusion Radio Hero Cover:** High-impact canonical release artwork.
6. **Playlist Thumbnail Medium:** Mid-tier responsive viewport catalog variant.
7. **Playlist Thumbnail Small:** Mobile list and compact player widget variant.

### 1.3 Performer & Artist Assets
8. **VaB Hero Portrait Cutout:** High-definition promotional editorial character cutout.
9. **VaB Avatar Gold Circle:** 1:1 circular profile icon bordered in metallic gold.

### 1.4 Campaign & Shell Overlays
10. **Friday Launch OG Social Card:** 1.91:1 Open Graph preview banner for WhatsApp/X.
11. **Dark Glassmorphism Ambient Canvas:** Deep charcoal background blur texture.
12. **Acoustic Vibe Waveform Overlay:** Subtle golden vector audio frequency overlay.
13. **VIP WhatsApp Community Pulse Badge:** High-conversion green pulse indicator.

### 1.5 Streaming Destination Vector Pack (Shared Pack)
14. **Spotify Vector Icon:** Monochrome & `#1DB954` branded SVG.
15. **Apple Music Vector Icon:** Monochrome & `#FA243C` branded SVG.
16. **Audiomack Vector Icon:** Monochrome & `#FFA200` branded SVG.
17. **YouTube Music Vector Icon:** Monochrome & red branded SVG.
18. **YouTube Video Vector Icon:** Standard official play button SVG.
19. **SoundCloud Vector Icon:** Orange cloud SVG mark.
20. **Boomplay Vector Icon:** Blue cyan SVG mark.
21. **Amazon Music Vector Icon:** Cyan smile SVG mark.
22. **Deezer Vector Icon:** Purple equalizer equalizer heart SVG mark.

---

## SECTION 2: STORAGE BUCKET MAPPING & ISOLATION BOUNDARIES

Every physical asset maps strictly to completed Phase 1 Supabase Storage buckets based on security clearance, bandwidth consumption, and file format topography:

```
+-----------------------------------------------------------------------------------+
| SUPABASE STORAGE CLUSTER (Client-Portal-007)                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | mi-covers (Public Raster CDN | Max 5MB | WebP, JPEG, PNG)                     |  |
|  |  ├── /chrome/covers/chrome-afrofusion-radio-cover-master.webp               |  |
|  |  ├── /chrome/covers/vab-hero-portrait-cutout.webp                           |  |
|  |  └── /chrome/campaigns/friday-launch-og-social-card.webp                    |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | mi-hub-assets (Public Vector CDN | Max 10MB | SVG, XML, WebP)               |  |
|  |  ├── /chrome/brand/chrome-music-logo-wordmark.svg                           |  |
|  |  ├── /shared/badges/amd-verified-gold-badge.svg                             |  |
|  |  └── /shared/dsp-icons/[spotify, apple-music, audiomack, boomplay...].svg   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | mi-audio (Private Encrypted Storage | Max 50MB | MP3, WAV)                    |  |
|  |  └── /chrome/audio/vab-afrofusion-preview-master-30s.mp3                    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 2.1 Bucket Allocation Rationale
* **`mi-covers`:** Allocated strictly to high-density raster photography and release artwork. This bucket utilizes Supabase public CDN edge caching to serve responsive image sizes (`width=600&quality=80`) directly to mobile viewports.
* **`mi-hub-assets`:** Allocated to lightweight, infinitely scalable vector graphics (`.svg`) and tenant UI logos. Segregating brand marks from heavy cover art prevents DOM layout shifts during initial asset hydration.
* **`mi-audio`:** Allocated exclusively to acoustic song files. Configured as **PRIVATE**, this boundary blocks direct HTTP GET requests. Frontend players must authenticate with backend API proxies to receive short-lived signed URLs (`?token=jwt_auth`), preventing unauthorized scraping or audio piracy.

---

## SECTION 3: PERMANENT FILE NAMING GRAMMAR

To prevent URL encoding collisions across fragmented ad network webhooks and guarantee clean namespace partitioning within cloud storage directories, all filenames must adhere to a permanent **lowercase kebab-case grammar**:

$$\text{directory\_namespace} + \text{"/"} + \text{tenant\_or\_project} + \text{"-"} + \text{entity\_slug} + \text{"-"} + \text{asset\_descriptor} + [\text{"-"} + \text{variant\_or\_size}] + \text{"."} + \text{extension}$$

### 3.1 Canonical Implementation Standard
* `chrome/covers/chrome-afrofusion-radio-cover-master.webp`
* `chrome/covers/chrome-afrofusion-radio-cover-thumb-md.webp`
* `chrome/covers/chrome-afrofusion-radio-cover-thumb-sm.webp`
* `chrome/covers/vab-hero-portrait-cutout.webp`
* `chrome/covers/vab-avatar-profile-gold.webp`
* `chrome/campaigns/friday-launch-og-social-card.webp`
* `chrome/brand/chrome-music-logo-wordmark.svg`
* `shared/brand/amd-music-intelligence-logo-crest.svg`
* `shared/badges/amd-verified-gold-badge.svg`
* `shared/dsp-icons/spotify-platform-icon.svg`
* `shared/dsp-icons/apple-music-platform-icon.svg`
* `shared/dsp-icons/audiomack-platform-icon.svg`
* `shared/dsp-icons/boomplay-platform-icon.svg`
* `chrome/audio/vab-afrofusion-preview-master-30s.mp3`

---

## SECTION 4: EXACT TECHNICAL IMAGE SPECIFICATIONS

Every uploaded graphic must comply with strict physical dimension boundaries, transparency masks, and compression targets:

| Asset Category | Preferred Format | Dimensions (WxH) | Alpha Transparency | Compression & Quality Rules | Maximum Payload |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Release Cover Artwork** | WebP *(Fallback JPEG)* | `1200 x 1200 px` | Opaque RGB | Lossy WebP `q=85`, sRGB color profile | `< 350 KB` |
| **Playlist Thumbnail Mid** | WebP | `600 x 600 px` | Opaque RGB | Generated via CDN transform or export | `< 120 KB` |
| **Playlist Thumbnail Min** | WebP | `300 x 300 px` | Opaque RGB | Generated via CDN transform or export | `< 45 KB` |
| **Artist Hero Portrait** | WebP *(Fallback PNG)* | `1000 x 1200 px` | Strict RGBA Mask | Lossy WebP alpha `q=90`, zero edge fringe | `< 280 KB` |
| **Artist Profile Avatar** | WebP | `400 x 400 px` | RGBA or Opaque | Circular framing safe area | `< 60 KB` |
| **Social Graph OG Card** | WebP *(Fallback JPEG)* | `1200 x 630 px` | Opaque RGB | Exact 1.91:1 ratio for WhatsApp status | `< 180 KB` |
| **Tenant & DSP Badges** | SVG Vector | ViewBox `24x24` | Native XML Vector | Sanitized via SVGO, zero base64 bitmaps | `< 5 KB` |
| **30s Audio Preview** | MP3 Audio | `30 Seconds` | N/A | 128 kbps CBR, normalized `-14 LUFS` | `< 500 KB` |

---

## SECTION 5: CDN CACHING & INVALIDATION STRATEGY

To maximize page load speeds across West African cellular networks while eliminating stale branding issues during live campaign iterations, Supabase Storage HTTP response headers must enforce declarative cache rules:

### 5.1 Caching Headers Policy
* **Public Visual Assets (`mi-covers` & `mi-hub-assets`):**  
  `Cache-Control: public, max-age=31536000, immutable`  
  *Rationale:* Assets are content-locked. Once published, the browser or Vercel edge proxy caches the byte stream locally for 1 full year without revalidating against origin.
* **Private Acoustic Streams (`mi-audio`):**  
  `Cache-Control: private, no-cache, no-store, must-revalidate`  
  *Rationale:* Forces client audio players to verify signed URL token validity on every playback request.

### 5.2 Immutable Versioning & Update Mechanics
**NEVER overwrite an existing filename in production.** Modifying `chrome-afrofusion-radio-cover-master.webp` in place causes ad network webhooks and fan browsers to serve stale cached artwork. 

When release artwork is updated:
1. Upload the fresh revision with an incremented version hash: `chrome-afrofusion-radio-cover-v2.webp`.
2. Update underlying database record `mi_playlists.custom_cover_url` to point to the new asset URI.
3. The CDN automatically treats the fresh URL as an uncached origin resource.

---

## SECTION 6: FRONTEND ASSET LOADING & RENDER PRIORITIES

The Next.js landing page shell must orchestrate asset hydration strictly according to viewport rendering priority to achieve a **Largest Contentful Paint (LCP) under 1.2 seconds**:

```
[ BROWSER DOM HYDRO-SEQUENCE ]
  │
  ├──► [ T + 0ms   ] INJECT CRITICAL PRELOADS
  │                  <link rel="preload" as="image" href=".../chrome-music-logo.svg" />
  │                  <link rel="preload" as="image" href=".../cover-thumb-md.webp" fetchpriority="high" />
  │
  ├──► [ T + 100ms ] ABOVE-THE-FOLD HYDRATION (Immediate Render)
  │                  ├── TenantHeader Logo (SVG)
  │                  ├── MediaHero Artwork (600x600 WebP)
  │                  ├── Verified Gold Badge (SVG)
  │                  └── Primary Top 3 DSP Icons (Spotify, Apple, Audiomack)
  │
  ├──► [ T + 300ms ] BELOW-THE-FOLD HYDRATION (Lazy / Async Render)
  │                  ├── Secondary DSP Grid Icons (Boomplay, YouTube, SoundCloud...)
  │                  ├── Sticky VIP WhatsApp Community Banner Graphic
  │                  └── Compliance & Footer Brand Crests
  │
  └──► [ USER TAP  ] ON-DEMAND ACOUSTIC STREAM FETCH
                     └── Fetch signed URL -> Mount HTML5 Audio Buffer -> Play 30s MP3
```

#### Fallback Shimmer Mechanics
If raster artwork encounters cellular packet loss or CDN timeout exceeding 800ms, UI components must instantly unmount broken DOM nodes and render a **pure CSS pitch-black glassmorphism skeleton shimmer** matching the entity aspect ratio.

---

## SECTION 7: DEVELOPER PRODUCTION UPLOAD VERIFICATION CHECKLIST

Any frontend developer or DevOps architect must execute this 8-step verification sweep before committing frontend UI code:

- [ ] **Step 1: Dashboard Auth:** Log into Supabase Project `Confident-Presence` / `Client-Portal-007` (`https://pjoijeligrgttimkqftk.supabase.co`).
- [ ] **Step 2: Storage Inspection:** Navigate to Storage menu; verify physical existence of buckets: `mi-covers`, `mi-hub-assets`, and `mi-audio`.
- [ ] **Step 3: Policy Verification:** Confirm public read RLS policies are active on `mi-covers` and `mi-hub-assets`, and private signed access is locked on `mi-audio`.
- [ ] **Step 4: Directory Namespace Setup:** Create foundational storage directories: `chrome/covers/`, `chrome/brand/`, `chrome/audio/`, and `shared/dsp-icons/`.
- [ ] **Step 5: Vector Optimization:** Run SVGO sweep across all 9 DSP icons and AMD crests; confirm zero embedded bitmaps and filesize `< 5KB`.
- [ ] **Step 6: Raster Upload:** Upload master release cover art and OG preview card to `mi-covers`; confirm HTTP 200 OK via direct cURL or incognito browser tab.
- [ ] **Step 7: Vector Upload:** Upload tenant wordmark and DSP vector pack to `mi-hub-assets`; verify instant XML rendering in browser.
- [ ] **Step 8: Audio Signed Token Test:** Upload `vab-afrofusion-preview-master-30s.mp3` to `mi-audio`. Execute backend RPC or Node SDK test to generate a 60-second signed URL; confirm audio stream plays cleanly via HTTP 206 Partial Content.

---

## SECTION 8: VERSION 1 LAUNCH READINESS REPORT

### 8.1 Executive Readiness Scorecard

#### ✅ ASSETS READY (Canonical Ecosystem Vectors — 11 Items)
* `shared/brand/amd-music-intelligence-crest.svg`
* `shared/badges/amd-verified-gold-badge.svg`
* `shared/dsp-icons/spotify-platform-icon.svg`
* `shared/dsp-icons/apple-music-platform-icon.svg`
* `shared/dsp-icons/audiomack-platform-icon.svg`
* `shared/dsp-icons/youtube-music-platform-icon.svg`
* `shared/dsp-icons/youtube-video-icon.svg`
* `shared/dsp-icons/soundcloud-platform-icon.svg`
* `shared/dsp-icons/boomplay-platform-icon.svg`
* `shared/dsp-icons/amazon-music-platform-icon.svg`
* `shared/dsp-icons/deezer-platform-icon.svg`

#### ⏳ ASSETS MISSING (Pending Design Studio Production Drop — 5 Items)
* `chrome/brand/chrome-music-logo-wordmark.svg` *(B2B label typography mark)*
* `chrome/covers/chrome-afrofusion-radio-cover-master.webp` *(Friday launch master cover)*
* `chrome/covers/vab-hero-portrait-cutout.webp` *(Artist promotional portrait)*
* `chrome/campaigns/friday-launch-og-social-card.webp` *(1200x630 social preview banner)*
* `chrome/audio/vab-afrofusion-preview-master-30s.mp3` *(Master normalized audio snippet)*

#### ℹ️ ASSETS OPTIONAL (Can Fallback to Pure CSS Engines)
* `chrome/campaigns/dark-glassmorphism-bg-texture.webp` *(UI shell ambient blur background)*
* `shared/overlays/gold-frequency-waveform.svg` *(Decorative hero overlay)*

#### 🚀 ASSETS FOR FUTURE VERSIONS (Phase 2 & Beyond)
* Canvas looping background promotional video clips (`.mp4` / `mi-covers`).
* AI DJ animated speaking avatar graphics (`.webm`).
* Multi-language localized CTA badge overlays (*French / Swahili*).

***
*Manifest certified for DevOps production asset provisioning.*  
**— Product Delivery Architect, AMD Solutions 007**  
**2026-06-25**
