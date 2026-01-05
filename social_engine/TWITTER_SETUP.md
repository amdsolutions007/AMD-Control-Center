# 🐦 X (TWITTER) SETUP - STABLE & REPEATABLE

## Current Status: ✅ SETUP VERIFIED (CREDENTIALS LOADING)

This doc is written to be stable and repeatable across machines.

### Why it was failing before (the real root cause)
1) **Wrong working directory**
   - The X scripts load credentials using `load_dotenv()`.
   - If you run scripts from a different folder (e.g. `apps/website`), Python may load the wrong `.env` (or none).

2) **Environment variable name mismatch**
   - Your `.env` uses `TWITTER_ACCESS_SECRET`.
   - Some scripts were expecting `TWITTER_ACCESS_TOKEN_SECRET`.
   - That results in a missing secret at runtime → X returns `401 Unauthorized`.

### What I changed so it won’t happen again
**Permanent Fix (so any agent can run it without drama):**
1) **Env var alias support** (prevents 401 from missing secret)
    - Access token secret can be **either**:
       - `TWITTER_ACCESS_SECRET` (your current `.env`)
       - `TWITTER_ACCESS_TOKEN_SECRET` (alternate naming)
    - Consumer keys can be **either**:
       - `TWITTER_API_KEY` / `TWITTER_API_SECRET`
       - `TWITTER_CONSUMER_KEY` / `TWITTER_CONSUMER_SECRET`
2) **Dotenv loads from file path, not working directory**
    - Key scripts now load credentials using:
       - `load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")`
    - Meaning: even if you run the script from `apps/website` by mistake, it still reads `social_engine/.env`.

So even if the `.env` naming varies or the terminal starts in a different folder, posting works reliably.

---

## Where to Find the Keys

### Step 1: Go to Twitter Developer Portal
https://developer.twitter.com/en/portal/dashboard

### Step 2: Select Your App
Click on your app name

### Step 3: Go to "Keys and Tokens" Tab

### Step 4: Find "Consumer Keys" Section
You'll see:
- **API Key** (starts with random letters/numbers)
- **API Key Secret** (longer random string)

These are different from the Client ID/Secret you provided!

### Step 5: Copy Both Keys

---

## How to Store the Keys (Recommended)

### Option A: Use `social_engine/.env` (Best)

Put credentials in `social_engine/.env` (this is what the scripts load when you run from `social_engine`).

Required keys for posting (OAuth 1.0a user-context):
```
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
```

Notes:
- Some older scripts may refer to `TWITTER_CONSUMER_KEY` / `TWITTER_CONSUMER_SECRET` (also supported).
- `TWITTER_ACCESS_TOKEN_SECRET` is also supported.

### Option B: Use the root `.env`

```bash
nano ~/Desktop/AMD_Control_Center/.env
```

Add:
```
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
```

---

## Current Platform Status

Keep platform status notes free of real tokens, secrets, or account identifiers.

### ✅ Typically working now (3/4 platforms):
1. **Telegram** - ✅ Configured
2. **Snapchat** - ✅ Configured
3. **YouTube** - ⚠️ Optional (needs `client_secrets.json`)

### ⏳ Waiting on keys (1/4):
4. **X (Twitter)** - ⏳ Needs API Key + API Secret

---

## Test After Adding Keys

```bash
python3 test_x_auth.py
```

Recommended (standard ops):
```bash
cd /Users/mac/Desktop/AMD_Control_Center/social_engine
python3 test_x_auth.py
```

Should show:
```
✅ TOKEN WORKING!
```

---

## Quick Summary

✅ **Always run from the right directory:**
```bash
cd /Users/mac/Desktop/AMD_Control_Center/social_engine
```

✅ **Posting requires these env vars:**
- `TWITTER_API_KEY` + `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN` + (`TWITTER_ACCESS_SECRET` OR `TWITTER_ACCESS_TOKEN_SECRET`)

✅ **Verification command:**
```bash
python3 test_x_auth.py
```
