# 🚀 AMD SOCIAL ENGINE - QUICK START GUIDE

## What is This?

A 100% FREE social media automation system that posts your marketing content to Twitter, Telegram, YouTube, and Snapchat automatically - 24/7, without you lifting a finger!

**No subscriptions. No monthly fees. Just your existing free API accounts.**

---

## ⚡ 3-Minute Setup

### Step 1: Install Dependencies

```bash
cd /Users/mac/Desktop/AMD_Control_Center/social_engine
chmod +x setup.sh
./setup.sh
```

This installs all required Python packages.

---

### Step 2: Add Twitter Credentials

You mentioned you have Twitter credentials ready. Add them to the root `.env` file:

```bash
# Open root .env file
nano ../Users/mac/Desktop/AMD_Control_Center/.env
```

Add these lines (replace with your real keys):

```
TWITTER_CONSUMER_KEY=your_key_here
TWITTER_CONSUMER_SECRET=your_secret_here
TWITTER_ACCESS_TOKEN=your_token_here
TWITTER_ACCESS_SECRET=your_secret_here
```

Save with `Ctrl+O`, exit with `Ctrl+X`.

---

### Step 3: Add Telegram Bot Token

You said Telegram credentials exist in your environment. We need to find them:

```bash
# Search for Telegram token
cd ~/Desktop
grep -r "TELEGRAM_BOT_TOKEN" --include="*.env" --include="*.py" 2>/dev/null | grep -v node_modules
```

Once found, add to root `.env`:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=@AMDSolutions007
```

---

### Step 4: Test the System

```bash
cd /Users/mac/Desktop/AMD_Control_Center/social_engine
python3 run_bot.py --test
```

This posts **once** to each platform to verify everything works.

---

### Step 5: Run 24/7 (Production)

```bash
python3 run_bot.py
```

**That's it!** The bot now posts automatically:
- **Twitter**: 5 times/day (8 AM, 12 PM, 3 PM, 6 PM, 9 PM)
- **Telegram**: 3 times/day (9 AM, 2 PM, 7 PM)
- **YouTube**: 1 update/day (10 AM)
- **Snapchat**: 2 times/day (11 AM, 5 PM)

---

## 📊 Check Status

```bash
python3 run_bot.py --status
```

Shows:
- Total posts made
- Engagement metrics
- Next scheduled posts

---

## ✍️ Manual Post

```bash
python3 run_bot.py --post "Your message here" --platform twitter
```

Available platforms: `twitter`, `telegram`, `youtube`, `snapchat`

---

## 🔄 Run in Background (Keep Running 24/7)

### Option A: Terminal (Simple)

```bash
nohup python3 run_bot.py &
```

Check if running:
```bash
ps aux | grep run_bot.py
```

Stop:
```bash
pkill -f run_bot.py
```

---

### Option B: Launch Agent (Auto-start on Mac boot)

Create file: `~/Library/LaunchAgents/com.amdsolutions.socialengine.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.amdsolutions.socialengine</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/mac/Desktop/AMD_Control_Center/social_engine/run_bot.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/mac/Desktop/AMD_Control_Center/social_engine/social_engine.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/mac/Desktop/AMD_Control_Center/social_engine/error.log</string>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.amdsolutions.socialengine.plist
```

---

## 🛠️ Troubleshooting

### "Twitter not authenticated"
- Double-check credentials in root `.env`
- Visit: https://developer.twitter.com/en/portal/dashboard

### "Telegram bot token not found"
- Search your projects: `grep -r "TELEGRAM_BOT_TOKEN" ~/Desktop`
- Create new bot: https://t.me/BotFather

### "No content available"
- Ensure `REVENUE_PACKAGE/` folder exists
- Check markdown files are present

### "Module not found"
- Run: `pip install -r requirements.txt`
- Try: `pip3 install -r requirements.txt`

---

## 📁 What Gets Posted?

The bot reads from your `REVENUE_PACKAGE/` markdown files:
- `SOCIAL_MEDIA_POSTS.md` - Grand opening posts
- `CV_ANALYSIS_SERVICE.md` - CV service ads
- `SOURCE_CODE_SALES.md` - Source code project ads

**Content rotation:**
- 30% CV Analysis ads
- 40% Source Code ads
- 20% Portfolio showcases
- 10% General updates

**Never repeats content within 7 days!**

---

## 💰 Revenue Tracking

Each post includes WhatsApp links. When customers message you, you'll know which service they saw!

**Expected leads:**
- CV Analysis: 5-10 inquiries/week
- Source Code: 3-5 inquiries/week

At ₦5K/CV and ₦25K/code, that's **₦50K-₦150K/week** potential revenue!

---

## 🔐 Security

- ✅ All credentials stay in `.env` (never committed to git)
- ✅ `.gitignore` configured to protect secrets
- ✅ Database tracks posts locally (not uploaded)
- ✅ Logs stored locally

---

## 📞 Support

Issues? Contact:
- WhatsApp: +234 818 002 1007
- Email: ceo@amdsolutions007.com

---

## 🎉 You Did It!

You now have a **FREE, fully automated marketing system** posting your services 24/7 across 4 platforms!

**Go focus on coding. Let the bot handle marketing.** 🤖💼

---

**Built with ❤️ by AMD Solutions 007**  
*"Automation so you can innovate"*
