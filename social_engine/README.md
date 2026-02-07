# 🚀 AMD SOCIAL ENGINE
**Operation: SIGNAL DISTRIBUTION - Automated Content Amplification**

## 📋 Overview
Multi-platform social media automation system for AMD Solutions 007.  
Distributes curated content from Signal Beacon and marketing materials to all active platforms.

**Status:** ✅ LIVE - 5 Platforms Connected  
**Cost:** ₦0 (Free Tier APIs)

---

## ⚠️ CRITICAL WARNING: TELEGRAM AUTOMATION RULES

**🚨 NEVER USE USERBOTS 🚨**  
**This caused the banning of the previous official number.**

### ✅ CORRECT APPROACH
- ✅ Use official `python-telegram-bot` library with Bot Token
- ✅ Create bots via [@BotFather](https://t.me/BotFather)
- ✅ Use Bot API endpoints only
- ✅ Add bot as admin to target channel

### ❌ FORBIDDEN ACTIONS
- ❌ **DO NOT** automate a personal Telegram account via script
- ❌ **DO NOT** attempt to login as a user programmatically
- ❌ **DO NOT** use "userbot" libraries (telethon, pyrogram in user mode)
- ❌ **DO NOT** bypass official Bot API

### 📜 INCIDENT HISTORY
**Date:** Jan 2026  
**Event:** Previous Telegram infrastructure (@amdsolutions007 channel) was banned  
**Cause:** Used "userbots" to automate a personal account instead of official Bot API  
**Impact:** Lost channel access, had to rebuild entire Telegram infrastructure  

### 🔧 CURRENT INFRASTRUCTURE
**Bot:** `8250377410` (via official Bot API)  
**Target Channel:** `@AMD_Intel_Brief`  
**Library:** `python-telegram-bot` (official wrapper)  
**Status:** ✅ Compliant with Telegram Terms of Service

**Purpose of This Warning:** Ensure no future Agent or developer repeats this mistake.

---

## 🎯 Active Platforms & Status

### ✅ OPERATIONAL (Credentials Configured)
- **Twitter/X** 🐦 - ✅ Active (Test Mode - Text only, no media uploads)
- **LinkedIn** 💼 - ✅ Active (Full posting capabilities)
- **Telegram** ✈️ - ✅ Active (Bot: 8250377410 | Channel: @AMD_Intel_Brief)
- **YouTube** 📺 - ✅ Active (OAuth authenticated)
- **Snapchat** 👻 - ✅ Active (Marketing API connected)

### ❌ NOT CONFIGURED
- **Facebook** - Waiting for `pages_manage_posts` API permission (CAC issue)
- **Instagram** - Waiting for Business API access (CAC issue)
- **TikTok** - Not configured

---

## 🔑 Credential Storage

**ALL API KEYS ARE STORED IN:** `/Users/mac/Desktop/AMD_Control_Center/.env`

**Current Configuration:**
```bash
# Twitter/X (Test Mode - Text Posts Only)
TWITTER_API_KEY=0FbHk1RWfLPH95HkKrzV4Hnja
TWITTER_API_SECRET=PqFGTocuLMc43WBD8qZaAYAO6Msxt7kWvS5jLCLeraNOaGFQIy
TWITTER_ACCESS_TOKEN=1564961774864064513-8arCbbxtoFDCdFiYI56l7IxEzuoJqN
TWITTER_ACCESS_SECRET=hB6FSIbfhq96ZQVcq8HpZeP7jxsBE2akwYRZnotIaCTPX

# LinkedIn (Full Access)
LINKEDIN_ACCESS_TOKEN=AQWs6B1NrEXel_QD... (280 chars)
LINKEDIN_PERSON_URN=urn:li:person:5SCsOhPJFZ

# Telegram (New Infrastructure - Feb 2026)
TELEGRAM_BOT_TOKEN=8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg
TELEGRAM_CHAT_ID=@AMD_Intel_Brief
```

**Additional Keys Available:**
- Snapchat credentials in `apps/website/.env.local`
- YouTube OAuth tokens in `youtube_token.pickle`
- Meta/Facebook credentials in root `.env` (limited permissions)

---

## 📡 Signal Beacon Integration

**NEW SYSTEM:** `amd_signal_beacon_poster.py`

**What It Does:**
1. Reads featured video from Signal Beacon's `videos.json`
2. Extracts title, commentary (take007, why007, actionable)
3. Generates platform-specific posts
4. Posts to Twitter and LinkedIn automatically

**Usage:**
```bash
# Test mode (preview posts)
python3 amd_signal_beacon_poster.py --dry-run

# Live posting
python3 amd_signal_beacon_poster.py
```

**Output Format:**
- **Twitter**: Title + take007 + URL (231/280 chars)
- **LinkedIn**: Full 3-layer commentary + branding (969/3000 chars)

**Last Posted:** Feb 7, 2026
- Twitter: ✅ Posted successfully
- LinkedIn: ✅ Posted successfully
- Video: "But what is a Neural Network?" (3Blue1Brown)

---

## 📁 File Structure

```
social_engine/
├── __init__.py
├── config.py                 # API credentials (imports from root .env)
├── content_manager.py        # Reads & rotates content
├── scheduler.py              # Posts at optimal times
├── analytics.py              # Tracks engagement
├── run_bot.py               # Main execution script
├── platforms/
│   ├── __init__.py
│   ├── twitter.py           # Twitter automation (NEW)
│   ├── telegram.py          # Telegram automation (EXISTING)
│   ├── youtube.py           # YouTube automation (EXISTING)
│   └── snapchat.py          # Snapchat automation (EXISTING)
└── data/
    ├── posted_content.db    # SQLite - tracks what's posted
    └── analytics.json       # Engagement metrics
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
cd /Users/mac/Desktop/AMD_Control_Center/social_engine
pip install tweepy python-telegram-bot google-api-python-client schedule sqlite3
```

### Step 2: Add Twitter Credentials
Edit `config.py` and add your Twitter API keys (you have these ready).

### Step 3: Run the Bot
```bash
python run_bot.py
```

---

## ⏰ Posting Schedule

**Twitter:**
- 8:00 AM - Morning motivation
- 12:00 PM - CV Analysis service ad
- 3:00 PM - Project showcase
- 6:00 PM - Source code sale ad
- 9:00 PM - Success story/testimonial

**Telegram:**
- 9:00 AM - Daily update
- 2:00 PM - Service announcement
- 7:00 PM - Portfolio showcase

**YouTube:**
- Updates channel description daily
- Posts community updates

**Snapchat:**
- Syncs with existing campaign system

---

## 📊 Content Sources

Pulls from:
- `/REVENUE_PACKAGE/SOCIAL_MEDIA_POSTS.md` (Grand Opening posts)
- `/REVENUE_PACKAGE/CV_ANALYSIS_SERVICE.md` (CV service ads)
- `/REVENUE_PACKAGE/SOURCE_CODE_SALES.md` (Student project ads)

---

## 🚀 Running in Background

### Option A: Terminal (macOS)
```bash
nohup python run_bot.py &
```

### Option B: Launch Agent (macOS - auto-start on boot)
```bash
./install_launch_agent.sh
```

### Option C: Deploy to Railway/Render (Free Cloud)
```bash
# Instructions in deploy/README.md
```

---

## 📈 Analytics

View stats:
```bash
python analytics.py --report
```

Shows:
- Total posts per platform
- Engagement rates
- Best performing content
- Revenue attribution

---

## 🔐 Security

- ✅ Credentials imported from existing `.env` files
- ✅ No hardcoded secrets
- ✅ .gitignore configured
- ✅ Separate config for each platform

---

## ⚙️ Configuration

All settings in `config.py`:
- Posting frequency
- Content rotation rules
- Platform enable/disable
- Time zones
- Analytics tracking

---

## 🛠️ Maintenance

**Check status:**
```bash
python run_bot.py --status
```

**Manual post:**
```bash
python run_bot.py --post "Your message here" --platform twitter
```

**View logs:**
```bash
tail -f social_engine.log
```

---

## 📞 Support

Issues? Check logs or contact:
- WhatsApp: +234 818 002 1007
- Email: ceo@amdsolutions007.com

---

**Built by AMD Solutions 007 | Licensed to Automate** 🤖
