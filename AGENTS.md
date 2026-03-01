# AGENTS.md — THE AMD CONTROL CENTER CONSTITUTION
> First Commandment for all future AI agents operating in this codebase.
> Violation of any law herein risks pipeline collapse, data loss, or platform bans.
> **Version:** 1.0.0 | **Signed:** 2026-03-01 | **Authority:** AMD Solutions 007

---

## PREAMBLE

This document is the supreme law of the AMD Control Center Skyscraper. Every agent — human or AI — that touches this codebase must read and obey it before writing a single line of code. The skyscraper has been built through hard-won lessons. These laws exist because the failures already happened. Do not repeat them.

---

## ARTICLE I — THE HIERARCHY: TWO SEPARATE SYSTEMS

### Wing A: The 24-Job Internal Engine (`social_engine/`)
The **24-Job Internal Engine** is the AMD brand's autonomous broadcasting arm. It runs on `social_engine/scheduler.py` and `amd_nexus.py`. It manages YouTube, Twitter/X, LinkedIn, Telegram, Snapchat, and internal aggregation. It is **not** a customer-facing chatbot. It is a media operation.

- **Orchestrator:** `amd_nexus.py` (daily 10:00 AM WAT)
- **Scheduler:** `social_engine/scheduler.py` (`Africa/Lagos` timezone, 09:00 / 14:00 / 20:00 WAT)
- **Config:** `social_engine/config.py` (all platform credentials)
- **Status:** Some jobs are active; some are dormant pending platform re-authentication

### Wing B: The NaijaBiz WhatsApp Sales Bot (`whatsapp_empire/`, `.tmp_amd_whatsapp_bot_deploy/`)
The **NaijaBiz WhatsApp Sales Bot** is the CEO's B2B sales secretary. It runs on Railway under the service `amd-whatsapp-bot`. It qualifies leads, scores them, books meetings, and sends proposals via WhatsApp. It is **not** a broadcast engine. It is a CRM with a chat interface.

- **Railway Service:** `amd-whatsapp-bot` — deployed from `.tmp_amd_whatsapp_bot_deploy/`
- **Intelligence Score:** 95/100 (GPT-4 backbone)
- **CRM:** SQLite (`leads.db`) with auto-scoring and meeting booking

### Wing C: The LekeeLekee 36-State Pipeline (`telegram_approval_bot.py`)
The **36-State Campaign Bot** is the CEO's daily approval system for the Nigerian state-by-state thought leadership campaign on LekeeLekee.com. It runs on Railway under the service `telegram-approval-bot`. The CEO receives a Telegram message at 09:00 WAT daily, approves or rejects, and the post publishes automatically.

- **Railway Service:** `telegram-approval-bot` (service ID: `e8b78196`)
- **Canonical File:** `telegram_approval_bot.py` — THIS is the golden bot. No other file controls LekeeLekee posting.
- **State Trackers:** `campaign_progress.json` + `state_tracker.json` (see Article V)

### DO NOT CONFLATE THESE THREE WINGS. They are independent systems with separate Railway services, separate credentials, and separate failure modes.

---

## ARTICLE II — THE 36-STATE PIPELINE LAW

### II.1 — The Scheduler
- **Fire time:** `08:00 UTC` = `09:00 WAT` — non-negotiable
- **Implementation:** `dt_time(hour=8, minute=0, second=0, tzinfo=timezone.utc)` using `from datetime import time as dt_time, timezone`
- **NEVER** use `datetime.time()` — `import datetime` is removed to prevent conflict with `from datetime import datetime`
- **Startup catch-up:** If Railway restarts after 08:00 UTC and `.last_daily_fire` ≠ today, fire `run_once(when=10)` immediately
- **Flag:** After each successful daily send, write `.last_daily_fire = date.today().isoformat()` to prevent double-fires

### II.2 — The Direct API Strike (LekeeLekee)
Selenium is **permanently retired**. Cloudflare blocks it. The only valid publish method is:

```python
# Step 1: Authenticate
POST https://www.lekeelekee.com/api/v1/auth/login
Content-Type: application/x-www-form-urlencoded
Body: email=ceo@amdsolutions007.com&password=%23%40Amdmail%40007

# Step 2: Post to group
POST https://www.lekeelekee.com/api/v1/groups/4d183887-2d5a-47b0-8226-dd6939d29694/posts
Authorization: Bearer <jwt_token>
Content-Type: application/json
Body: {"body": "<post_content>"}
```

- **GROUP_ID:** `4d183887-2d5a-47b0-8226-dd6939d29694` — African Tech Ecosystem group
- **Credentials:** Email `ceo@amdsolutions007.com` / Password `#@Amdmail@007`
- **Emergency override:** `python3 tools/direct_publish_day.py [day_index]`

### II.3 — The Badge Branding Law
The **only** valid badge asset is `assets/amd_badge.png` (477×472 RGBA, 364KB, 24K Gold metallic).

```python
# Correct lookup order in graphic_generator.py
badge_paths = [
    "assets/amd_badge.png",        # PRIMARY — always check first
    "amd_badge.png",
    "../assets/amd_badge.png",
    "assets/amd_logo.png",         # FALLBACK only
]
```

- **NEVER** use `amd_logo.png` as the primary asset. It is a fallback only.
- **Badge placement:** 60×60px, bottom-right corner, alpha=230, black pixels masked to transparent
- **Poster size:** 1200×675px
- **Colors:** Black background + 24K Gold `#D4AF37` — no exceptions

### II.4 — The Async Callback Law
The Telegram `button_callback` handler **must never block**. On CEO approval:

```python
# CORRECT — returns instantly, publishes in background
await query.edit_message_text("🔄 Processing Strike...")
asyncio.create_task(self._publish_to_leke_leke(...))
return

# WRONG — causes UI freeze and Telegram callback timeout
await self._publish_to_leke_leke(...)
```

---

## ARTICLE III — THE RSS LAW

The Signal Beacon feed at `https://amd-signal-beacon.vercel.app/api/feed` operates under the **One-Per-Hour Law**. Four constants in `apps/amd-signal-beacon/app/api/feed/route.ts` must **never** be changed:

```typescript
const forceFresh = false;               // LAW: NEVER set to true — kills the 1hr cache
const enableGraphics = false;           // LAW: NEVER set to true — DALL-E adds 5s per article
mixedContent.slice(0, 20)              // LAW: NEVER remove — source pool cap (NOT output cap)
// ONE-PER-HOUR DRIP:
const hourIndex = Math.floor(Date.now() / (1000 * 60 * 60)); // LAW: NEVER remove
```

### How the One-Per-Hour Law works:
1. `sourcePool = mixedContent.slice(0, 20)` — keeps the origin fetch fast (<10s), stays within the 30s cURL deadline
2. `hourIndex` advances every real clock-hour → selects one item: `sourcePool[hourIndex % pool.length]`
3. `pubDate` is locked to the **start of the current clock-hour** — same GUID+date means LekeeLekee de-dupes and will not re-import the same item
4. `Cache-Control: public, max-age=3600, s-maxage=3600` — Vercel CDN caches the response for a full hour; LekeeLekee's poller gets a cached 304 on subsequent requests

### Why these laws exist:
- `forceFresh = true` bypasses the 1-hour Vercel cache → every request hits origin → slow → cURL 28
- `enableGraphics = true` calls DALL-E 3 for each article → 5s × 20+ articles = 100s+ → cURL 28
- Removing the `.slice(0,20)` source pool cap → unbounded fetch time → cURL 28
- Removing the One-Per-Hour drip → 20 items × N polls/hour → **311+ imports/hour → SPAM BAN**

**Target:** HTTP 200, <10 seconds, 1 item per response, max 1 new import per hour at LekeeLekee. If the platform reports more than 1 import per hour, check the four constants above.

---

## ARTICLE IV — THE PLATFORM LAWS

### IV.1 — YouTube (OAuth — Active)
- **Method:** OAuth 2.0 with refresh token (`refresh_youtube_token.py`)
- **Token file:** `youtube_token.json` (do NOT delete — refresh it)
- **Upload:** `amd_pro_uploader.py` / `amd_uploader.py`
- **Voice:** OpenAI **Onyx** ONLY on all YouTube videos. No other voice. Ever.
- **Law:** YouTube links are the **only** URL type allowed in Twitter/X posts. No direct uploads to X.

### IV.2 — LinkedIn (60-Day Token — Active with Expiry Risk)
- **Token:** LinkedIn access tokens expire every **60 days**. Set a calendar reminder.
- **Law:** If posting fails with 401, the token is expired. Regenerate via LinkedIn Developer Portal. Do not blame the code.
- **Platform:** Thought leadership only. Professional tone. No promotional language.

### IV.3 — Twitter/X (Text + YouTube Links Only — Active)
- **LAW:** Post **text and YouTube links only**. Do NOT attempt media uploads to X.
- **Reason:** The free API tier does not support video uploads. Image uploads are unreliable.
- **Config:** `social_engine/config.py` → Twitter credentials

### IV.4 — Telegram (Bot API Only — Active)
- **LAW:** Use `python-telegram-bot` (official Bot API) **ONLY**. **NEVER** use Telethon or any userbot library.
- **Reason:** Userbots on personal accounts caused the **January 2026 Telegram channel ban**. The ban is permanent. Do not repeat this.
- **Bot Token:** `8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg` (env var: `TELEGRAM_BOT_TOKEN`)
- **CEO ID:** `8013249849` (env var: `CEO_TELEGRAM_ID`)

### IV.5 — The Manual Wing (Facebook / Instagram / TikTok)
These platforms require **manual posting by the CEO** until the Facebook CAC business verification is unblocked.

- **Facebook:** Copy formatted caption from terminal/bot output → post manually on web (`auto_facebook_poster.py` exists but is blocked by Meta approval)
- **Instagram:** Manual mobile app upload only
- **TikTok:** Manual phone upload only
- **Pinterest:** Config exists in `social_engine/config.py` but API integration is **untested** — do not assume it works
- **Law:** Do not attempt automated Facebook/Instagram posting. The Meta Developer App is under review. Attempting to post will result in further account restrictions.

### IV.6 — The AI Budget Law
- **Gemini (FREE):** Use for all text generation, content writing, analysis, Q&A, and logic
- **OpenAI (PAID):** Use ONLY for voice (Onyx TTS) and image generation (DALL-E 3)
- **Law:** Never call OpenAI APIs in loops, schedulers, or feed generation. Every OpenAI call costs real money.

---

## ARTICLE V — THE MEMORY LAW (THE COMPANY LEDGER)

The JSON tracker files are the **company's ledger**. They record what has been published, when, and to which platform. Resetting them is equivalent to destroying financial records.

### `state_tracker.json` — The Campaign Chronicle
```json
{
  "current_day": 4,
  "history": [
    {"day": 1, "state": "Lagos",     "post_id": "fb40e0e5-46f3-4466-b734-189a5488a087"},
    {"day": 2, "state": "FCT Abuja", "post_id": "0371ebd5-bbda-4bd6-8462-923f18656056"},
    {"day": 3, "state": "Kano",      "post_id": "f0b4bd4d-1826-447b-8fb4-a7b6a566fed4"}
  ]
}
```
- `current_day` = **next day to publish** (1-indexed display number)
- Every successful publish appends to `history` with the LekeeLekee post ID

### `campaign_progress.json` — The ContentGenerator Index
```json
{"current_day": 3, "last_updated": "2026-03-01T..."}
```
- `current_day` = **0-indexed array position** for `ContentGenerator.get_next_state()`
- `current_day=3` means the next content generation call uses index 3 = Day 4

### The Update Law
`_update_state_tracker()` in `telegram_approval_bot.py` **must always write BOTH files** atomically. If only one is updated, the system is in an inconsistent state.

### Laws:
1. **NEVER delete or reset `state_tracker.json`** — it is the permanent record of all 36 states
2. **NEVER delete or reset `campaign_progress.json`** — it drives the ContentGenerator index
3. **NEVER use `datetime.utcnow()`** — it is deprecated. Use `datetime.now(timezone.utc)`
4. If a day needs to be re-published, use `tools/direct_publish_day.py` — it updates both trackers correctly

---

## ARTICLE VI — THE CREDENTIAL VAULT

These are the live production credentials. Handle with absolute discretion.

| System | Credential | Value |
|---|---|---|
| LekeeLekee | Email | `ceo@amdsolutions007.com` |
| LekeeLekee | Password | `#@Amdmail@007` |
| LekeeLekee | Group ID | `4d183887-2d5a-47b0-8226-dd6939d29694` |
| Telegram Bot | Token | `8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg` |
| Telegram | CEO ID | `8013249849` |
| Gemini | API Key | `AIzaSyDEsAEZPEW0rV0W0HX7WSRnhWaz_TpPs7c` |
| Railway | Project | `confident-presence` (`04114a84-a0a4-463f-ae22-94c442e4c36b`) |
| Railway | Bot Service | `telegram-approval-bot` (`e8b78196`) |
| Railway | WA Service | `ghost-writer-poster` (`d55b15f8`) |
| Vercel | Signal Beacon | `prj_s5xWOZ9aofhoS29QpLreqRojkWjS` |

---

## ARTICLE VII — THE BRAND CONSTITUTION

AMD Solutions 007 has a single, non-negotiable brand identity.

- **Colors:** Black background + 24K Gold `#D4AF37`
- **Voice:** OpenAI TTS model `tts-1`, voice `onyx` — no substitutions
- **Badge:** `assets/amd_badge.png` (477×472 RGBA) — the only valid logo file
- **Signature (4 mandatory lines on every post):**
  ```
  🌐 amdsolutions007.com
  💼 [portfolio link]
  🔗 [relevant links]
  📞 [AMD hotline]
  ```
- **Tone:** Executive authority. Never casual. Never promotional. Always thought leadership.

---

## ARTICLE VIII — THE RAILWAY DEPLOYMENT LAW

### Services Map
| Service Label | Purpose | Restarts on push to |
|---|---|---|
| `telegram-approval-bot` | 36-State Campaign Bot | `main` branch |
| `ghost-writer-poster` | NaijaBiz WA Sales Bot mirror | `amd-whatsapp-bot` repo |

### Laws:
1. **After any code change** to `telegram_approval_bot.py`, commit and push to `main` — Railway autodeploys within 2 minutes
2. **After Railway restart**, the startup catch-up in `run()` fires the daily job within 10 seconds if it was missed
3. **To check logs:** `npx -y @railway/cli logs --follow` from `.tmp_amd_whatsapp_bot_deploy/`
4. **To force-publish any day:** `python3 tools/direct_publish_day.py [0-based-day-index]`
5. **The `nixpacks.toml` and `Procfile`** in root control how Railway builds the bot — do not modify without understanding the build pipeline

### Environment Variables (must be set in Railway dashboard):
```
TELEGRAM_BOT_TOKEN=8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg
CEO_TELEGRAM_ID=8013249849
LEKE_LEKE_EMAIL=ceo@amdsolutions007.com
LEKE_LEKE_PASSWORD=#@Amdmail@007
GEMINI_API_KEY=AIzaSyDEsAEZPEW0rV0W0HX7WSRnhWaz_TpPs7c
```

---

## ARTICLE IX — THE EMERGENCY PROTOCOL

If the bot fails to send the daily prompt at 09:00 WAT:

```bash
# Step 1: Check Railway logs
cd .tmp_amd_whatsapp_bot_deploy
npx -y @railway/cli logs --follow

# Step 2: Verify current day index
cat campaign_progress.json  # current_day = next index to publish
cat state_tracker.json      # current_day = next display day number

# Step 3: Force-generate and send approval prompt to CEO
# (Replace N with campaign_progress.json current_day value)
python3 tools/direct_publish_day.py N

# Step 4: If Day 4 specifically, check which state:
python3 -c "
import json
with open('campaign_progress.json') as f:
    d = json.load(f)
print('Next day index:', d['current_day'])
"
```

If LekeeLekee API returns 401:
- Re-authenticate: the JWT expires. `_lekee_login()` handles this automatically on each publish.
- If email/password rejected: check `LEKE_LEKE_EMAIL` / `LEKE_LEKE_PASSWORD` env vars on Railway.

If LekeeLekee API returns 403 or 404 on the group post:
- Verify `_GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"` — the group may have changed.
- Log into LekeeLekee manually and confirm the African Tech Ecosystem group ID.

---

## ARTICLE X — THE 10 COMMANDMENTS (QUICK REFERENCE)

| # | Law | Never Do |
|---|---|---|
| 1 | Twitter/X: YouTube links ONLY | Upload video/images directly to X |
| 2 | Telegram: Bot API only | Use Telethon / userbots (caused Jan 2026 ban) |
| 3 | Voice: OpenAI Onyx ONLY | Use any other TTS voice or model |
| 4 | Colors: Black + 24K Gold `#D4AF37` | Rebrand without CEO approval |
| 5 | AI Budget: Gemini FREE / OpenAI PAID | Call OpenAI in loops or feed generation |
| 6 | Facebook/Instagram/TikTok: Manual Wing | Attempt automated posting (account restricted) |
| 7 | Every post: 4-line AMD signature | Post without website + portfolio + links + hotline |
| 8 | LekeeLekee: Direct API Strike only | Use Selenium (Cloudflare blocks it) |
| 9 | RSS: 1-item-per-hour drip feed | Remove `hourIndex` logic or `.slice(0,20)` source pool |
| 10 | Trackers: NEVER reset `.json` files | Delete/overwrite `state_tracker.json` or `campaign_progress.json` |

---

## STATUS AT TIME OF SIGNING

| Day | State | Post ID | Status |
|---|---|---|---|
| 1 | Lagos | `fb40e0e5-46f3-4466-b734-189a5488a087` | ✅ Live |
| 2 | FCT Abuja | `0371ebd5-bbda-4bd6-8462-923f18656056` | ✅ Live |
| 3 | Kano | `f0b4bd4d-1826-447b-8fb4-a7b6a566fed4` | ✅ Live |
| 4 | TBD (index 3) | — | ⏳ Auto-fires 09:00 WAT |
| 5–36 | 32 states remain | — | ⏳ Pipeline active |

**RSS Feed:** `https://amd-signal-beacon.vercel.app/api/feed` — HTTP 200, <10s, 1 item/hour drip feed ✅  
**Golden Bot:** Railway `telegram-approval-bot` — `run_polling()` active ✅  
**Scheduler:** `08:00 UTC = 09:00 WAT` with startup catch-up ✅

---

*The constitution is signed. The skyscraper is stabilized. All future agents inherit these laws.*

**— GitHub Copilot, AMD Control Center Architect**  
**2026-03-01**
