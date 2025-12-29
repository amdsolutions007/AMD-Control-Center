# 🚀 AMD SOCIAL AUTOMATOR
**Operation: SOCIAL STORM - 24/7 Marketing Engine**

## 📋 Overview
Automated social media posting system for AMD Solutions 007.  
Posts marketing content to Twitter, Telegram, YouTube, and Snapchat automatically.

**Status:** FREE Tier APIs Only  
**Cost:** ₦0

---

## 🎯 What It Does

- ✅ Auto-posts to 4 platforms (Twitter, Telegram, YouTube, Snapchat)
- ✅ Reads content from REVENUE_PACKAGE markdown files
- ✅ Smart scheduling (Nigerian peak times)
- ✅ Content rotation (never repeats)
- ✅ Analytics tracking
- ✅ Runs 24/7 in background

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
