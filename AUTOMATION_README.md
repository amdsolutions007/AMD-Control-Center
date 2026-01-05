# 🚨 MANDATORY INTELLIGENCE PROTOCOL 🚨
* **RULE 0:** **CONTRIBUTE, DON'T JUST EXECUTE.**
  - Every time you receive a prompt, you MUST evaluate it.
  - If you see a better way, a missing hashtag, or a smarter caption, **RECOMMEND IT.**
  - Your goal is **WORLD-CLASS COMMUNICATION.**
  - **Hybrid Approval:** We combine the CEO's Vision with your AI Precision.
* **Official Links:**
  - 🌍 Website: [https://amdsolutions007.com](https://amdsolutions007.com)
  - 🔗 LinkTree: [https://amdsolutions007.com/links](https://amdsolutions007.com/links)
  - 📞 Hotline: 0818 002 1007
---------------------------------------------------

# AMD CONTROL CENTER - AUTOMATION PROTOCOL 🇳🇬🚀

## 1. CORE RULES (READ FIRST)
* **Directory:** ALWAYS operate in `AMD Control Center/social_engine`.
* **Terminal:** ALWAYS activate the repo venv:
    - From repo root: `source .venv/bin/activate`
    - From `social_engine/`: `source ../.venv/bin/activate`
* **Resource Check:** BEFORE downloading anything (Video tools, libraries), CHECK if it exists locally. **DO NOT RE-DOWNLOAD** `ffmpeg`, `imagemagick`, or `moviepy` if they are already in the folder.
* **Voice Authority:** Use ONLY **'Onyx'** (OpenAI) for all audio.

### X (Twitter) - Permanent Fix Note
* **Run location matters:** X scripts use `load_dotenv()`. Always run them from `social_engine/` so the correct `.env` is loaded.
* **Env var mismatch fixed:** Our `.env` uses `TWITTER_ACCESS_SECRET`. Some scripts previously expected `TWITTER_ACCESS_TOKEN_SECRET` (caused `401`). Scripts now accept **either** name.
* **Root causes we fixed (so it never repeats):**
    1) `.env` naming mismatch (caused `401`): our `.env` uses `TWITTER_ACCESS_SECRET` but some scripts expected `TWITTER_ACCESS_TOKEN_SECRET`.
    2) Running scripts from the wrong folder: plain `load_dotenv()` can load the wrong `.env` (or none).
* **Permanent fix implemented:**
    - X scripts now load `social_engine/.env` by file path: `load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")`
    - X scripts accept env var aliases:
        - Secret: `TWITTER_ACCESS_SECRET` OR `TWITTER_ACCESS_TOKEN_SECRET`
        - Consumer keys: `TWITTER_API_KEY`/`TWITTER_API_SECRET` OR `TWITTER_CONSUMER_KEY`/`TWITTER_CONSUMER_SECRET`
* **Verification (must pass):** `cd /Users/mac/Desktop/AMD_Control_Center/social_engine && python3 test_x_auth.py`

## 2. API DIVISION OF LABOR
* **🟢 GOOGLE GEMINI (FREE):**
    * Use for: Posting Logic, Code Generation, Text Drafting, Data Analysis.
    * *Reason:* Infinite Free Tier.
* **🔴 OPENAI (PAID):**
    * Use for: High-Res Image Gen (Flyers), Video Editing Logic, Audio (TTS).
    * *Reason:* $5 Limit (Cost Control).

## 3. PLATFORM STATUS (THE EMPIRE)

### ✅ AUTOMATED (ACTIVE)
* **WhatsApp:** 🟢 ACTIVE.
    * *Features:* NaijaBiz Pilot (Auto-Reply), Text Status, Link Sharing.
    * *Limitation:* Video Status must be <16MB. Use YouTube Links for large videos.
* **LinkedIn:** 🟢 ACTIVE. (API Verified).
* **Telegram:** 🟢 ACTIVE. (File limit 50MB).
* **X (Twitter):** 🟢 ACTIVE. (Rule: POST YOUTUBE LINKS ONLY).
* **YouTube:** 🟢 ACTIVE. (Flyer + Onyx Audio).
* **Snapchat:** 🟢 ACTIVE. (Ads Manager).

### ⏳ MANUAL (NO API YET)
* **Facebook:** Manual Web Post.
* **Instagram:** Manual Mobile App.
* **Pinterest:** Manual.

## 4. INSTALLED TOOLS (DO NOT DOWNLOAD AGAIN)
* ✅ `ffmpeg` (Video Processing) - **INSTALLED.**
* ✅ `imagemagick` (Image Processing) - **INSTALLED.**
* ✅ `selenium` / `playwright` (Browsers) - **INSTALLED.**

---

## 5. AUTHENTICATION CREDENTIALS

### YouTube
- Token: youtube_token.pickle (persistent)
- Status: ✅ Active

### LinkedIn
- Access Token: OAuth2 (60-day expiry)
- Status: ✅ Active

### X (Twitter) - FREE TIER
- API Key: Configured in .env
- **⚠️ PERMANENT RULE: NEVER POST MEDIA DIRECTLY - ALWAYS POST YOUTUBE LINK**
- Status: ✅ Active (text + links only)

### WhatsApp
- Bot: NaijaBiz Pilot (GPT-4 Turbo)
- Session: .whatsapp-session-status/ (persistent)
- Status: ✅ Active

### Telegram
- Bot Token: Configured in .env
- Channel: @amdsolutions007
- Status: ✅ Active

### OpenAI
- API Key: **NEVER store keys in docs or git**. Keep it only in `.env` / environment variables.
- Voice: **ONYX ONLY** (brand consistency)
- Status: ✅ Active

---

## 6. CURRENT DEPLOYMENTS

**Rise Up Trilogy (2 Jan 2026):**
- ✅ YouTube: https://www.youtube.com/watch?v=3B7Gv-1AdvU
- ✅ LinkedIn Profile: Posted
- ✅ WhatsApp AI Bot: Running (6 active chats)
- ⏳ X: Pending (post YouTube link)
- ⏳ Telegram: Pending (compress or use Desktop)
- ⏳ WhatsApp Channel: Pending (manual via phone)

**NaijaBiz Pilot Flyer:**
- ✅ Generated: NaijaBiz_Flyer.png (1.5 MB, 1024x1024)
- ⏳ Deployment: Pending

---

## 7. ACTIVE LEADS

**Okrika Buqaizo:**
- Budget: ₦150,000
- Project: Thrift business automation
- Status: AI bot handling conversations
- Action: Close sale

---

## 8. PROTOCOL SUMMARY

**SINGLE SOURCE OF TRUTH:**
This README is the ONLY reference for all automation agents. Read this BEFORE every operation.

**NO WASTE:**
- Check local tools before downloading
- Use FREE APIs when possible (Google Gemini)
- Use PAID APIs only for assets (OpenAI images/audio)

**BRAND CONSISTENCY:**
- Voice: Onyx ONLY
- Format: Flyer + Audio for YouTube
- X/Twitter: YouTube links ONLY (no direct media)

---

## 9. SOURCE TRUTH PROTOCOL (JOBS 3 → 24) ✅
**Non‑negotiable:** Every asset (Flyer / Video / Audio) must be derived from the Job’s **SOURCE TRUTH** image to keep the Digital Twin consistent.

**A) SOURCE TRUTH (MASTER IMAGE)**
- Each job folder must contain: `JobN_Twin_Master.png`
- Do NOT use filenames with special characters/newlines. Keep it automation-safe.

**B) FLYER (BRANDED, FROM SOURCE TRUTH)**
- Output name: `JobN_Flyer_Master.png`
- Must include a gold footer watermark.
    - Default (non-media jobs): `AMD SOLUTIONS 007`
    - Media-only exception: `AMD MEDIA SOLUTIONS`

**C) AUDIO (ONYX, BRANDED OUTRO)**
- Output name: `JobN_Audio_Master.mp3`
- Must end with a branded outro.
    - Default (non-media jobs): `Powered by AMD Solutions 007.`
    - Media-only exception: `Powered by AMD Media Solutions.`

**D) VIDEO (TALKING DIGITAL TWIN — PRIMARY STANDARD)**
- Output name: `JobN_Video_Master.mp4`
- Goal: the SOURCE TRUTH Twin must **talk / speak / move** (face + mouth movement), ideally **lip‑synced** to the Onyx script.
- Must include: gold footer watermark text (end frame or persistent).
    - Default (non-media jobs): `AMD SOLUTIONS 007`
    - Media-only exception: `AMD MEDIA SOLUTIONS`

**Fallback (ONLY if talking‑twin cannot be produced same-day):**
- `JobN_Video_Fallback.mp4` = branded flyer + Onyx audio.

**Operational rule:** When running scripts, ALWAYS run from `social_engine/`.

---

## 5. THE CONTENT VAULT (24-JOB ROTATION) 🔄
*Protocol: Pick the next job in the list each day. Once finished with Job 24, restart at Job 1.*
* **Current Status:** [Active: Job 1]

1.  **[ACTIVE]** **WhatsApp Automation Pilot (NaijaBiz)**
    * *Hook:* "Sleep while we sell."
2.  **[PENDING]** **Crypto Airdrop Auto-Claimer**
    * *Hook:* "Never miss free money."
    * *Plan:* Auto-track approved airdrops, dry-run first, then user-approved auto-claim; log every action; allowlist-only signing.
    * *World-class rec:* Ship a short demo (UI mock or screenflow) that shows: source feed → safety checks → simulated claim → signed claim; pair with a 30–45s YouTube demo, flyer (3 bullets: Auto-track, Safety filters, Full logs), and Onyx VO.
3.  **[PENDING]** **Real Estate Satellite Mapper (Naija Prop Intel)**
    * *Hook:* "See the land before you buy."
4.  **[PENDING]** **Forex/Crypto Trading Bot (Naira AI Crypto Tracker)**
    * *Hook:* "Algorithmic profit."
5.  **[PENDING]** **NaijaLaw GPT**
    * *Hook:* "Legal AI for every Nigerian."
6.  **[PENDING]** **CBN Compliance Copilot**
    * *Hook:* "Stay compliant, stay in business."
7.  **[PENDING]** **Address-Intel**
    * *Hook:* "Know the real address, avoid scams."
8.  **[PENDING]** **Naija Rent Estimator**
    * *Hook:* "What's fair rent? We tell you."
9.  **[PENDING]** **Bank Statement Parser**
    * *Hook:* "Turn PDFs into insights instantly."
10. **[PENDING]** **Naija Voice AI**
    * *Hook:* "Your voice, any language, AI-powered."
11. **[PENDING]** **AMD Global Intelligence**
    * *Hook:* "Data that drives decisions."
12. **[PENDING]** **AMD Activity Booster**
    * *Hook:* "Growth hacks that actually work."
13. **[PENDING]** **NaijaStack AI**
    * *Hook:* "Developer tools for African tech."
14. **[PENDING]** **TIL Knowledge Bank**
    * *Hook:* "Learn something new, every day."
15. **[UPCOMING]** **Upcoming Innovation #1**
    * *Hook:* "TBA - Under Development"
16. **[UPCOMING]** **Upcoming Innovation #2**
    * *Hook:* "TBA - Under Development"
17. **[UPCOMING]** **Upcoming Innovation #3**
    * *Hook:* "TBA - Under Development"
18. **[UPCOMING]** **Upcoming Innovation #4**
    * *Hook:* "TBA - Under Development"
19. **[UPCOMING]** **Upcoming Innovation #5**
    * *Hook:* "TBA - Under Development"
20. **[UPCOMING]** **Upcoming Innovation #6**
    * *Hook:* "TBA - Under Development"
21. **[UPCOMING]** **Upcoming Innovation #7**
    * *Hook:* "TBA - Under Development"
22. **[UPCOMING]** **Upcoming Innovation #8**
    * *Hook:* "TBA - Under Development"
23. **[UPCOMING]** **Upcoming Innovation #9**
    * *Hook:* "TBA - Under Development"
24. **[UPCOMING]** **Upcoming Innovation #10**
    * *Hook:* "TBA - Under Development"

---

## 6. BRANDING & VISUALS (STRICT) 🎨
* **Visual Rule:** NEVER use generic stock photos. Every post must feature:
    * **The Digital Twin** (Video/Image) OR
    * **The Gold Globe Logo** OR
    * **Actual Software Screenshots**.
* **Audio Rule:** ONLY use **Onyx** (OpenAI) voice.
* **The Signature:** Every post MUST end with:
    > 🌍 **Website:** https://amdsolutions007.com
    > 📂 **Portfolio:** https://amdsolutions007.github.io
    > 🔗 **All Links:** https://amdsolutions007.com/links
    > 📞 **Hotline:** 0818 002 1007
    > 📧 **Email:** ceo@amdsolutions007.com
* **WATERMARK (Images):**
    * **Default (Non‑Media Jobs):** Bottom footer in gold elegant font with the exact text: "AMD SOLUTIONS 007".
    * **Media‑Only Exception:** Use "AMD MEDIA SOLUTIONS" only for media/creative production offerings.
    * Aesthetic: Dark Mode, Gold Accents, Premium 8k Render.
* **OUTRO (Audio/Video):** Every video/voiceover script MUST end with a branded outro.
    * **Default (Non‑Media Jobs):** "Powered by AMD Solutions 007."
    * **Media‑Only Exception:** "Powered by AMD Media Solutions."

---

## 7. WEB SYNC & MANUAL HANDOFF ✋
* **Web Sync:** BEFORE marketing a job, verify it is listed on `amdsolutions007.github.io`. If not, alert the CEO.
* **Manual Handoff:** For Facebook, Instagram, and Pinterest, you must **PRINT** the following to the terminal:
    * "🚨 **MANUAL POST READY:** [Platform Name]"
    * "📸 **Visual:** Use Digital Twin Image."
    * "📝 **Caption:** [Paste the generated caption here]"
    * "🏷️ **Hashtags:** [Paste tags here]"

---

## 8. THE TRINITY PROTOCOL (MANDATORY ASSETS) ⚠️
For every Job in the "24-Job Rotation", you must generate THREE assets before posting:
1. 🎥 **VIDEO:** 3D Motion or Screen Recording (Veo/Screen).
2. 🖼️ **IMAGE:** High-Res Flyer (DALL-E 3).
3. 🎙️ **AUDIO:** Professional Voiceover (OpenAI TTS - Onyx).
* **Folder Rule:** Create a dedicated folder for each campaign inside `assets/`.
  (Example: `assets/Job1_NaijaBiz/` contains all 3 files).

---

**Last Updated:** 2 January 2026
**Status:** ACTIVE - Single Source of Truth Established + Infinity Content Strategy
