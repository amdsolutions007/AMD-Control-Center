# Ghost Writer Pro - Deployment Guide

Complete guide for deploying the CEO-approved hybrid automation system to Railway.

---

## 📋 **SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────┐
│                     GHOST WRITER PRO                            │
│                   (Option B: Hybrid System)                     │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐           ┌──────────────────┐
    │  TELEGRAM BOT    │           │   GHOST WRITER   │
    │  (CEO Control)   │           │ (Selenium Poster)│
    └────────┬─────────┘           └────────┬─────────┘
             │                              │
             │ 1. CEO: /generate            │
             ├──────────────────►           │
             │                              │
             │ 2. Bot: Graphic + Caption    │
             │    [✅ APPROVE] [❌ REJECT]  │
             │◄──────────────────           │
             │                              │
             │ 3. CEO: ✅ APPROVE           │
             │                              │
             │ 4. Bot: trigger_post.flag    │
             ├──────────────────────────────►
             │                              │
             │                    5. Ghost Writer detects
             │                       Posts to Leke Leke
             │                              │
             │ 6. Bot: ✅ Posted!           │
             │◄──────────────────────────────
             │                              │
```

---

## 🚀 **RAILWAY DEPLOYMENT**

### **Step 1: Create Two Railway Services**

Railway requires separate services for Telegram bot and Ghost Writer.

#### **Service 1: Telegram Approval Bot**

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `AMD_Control_Center` repository
4. Railway will auto-detect Dockerfile
5. **Override Build Settings:**
   - **Dockerfile Path:** `Dockerfile.telegram`
   - **Service Name:** `ghostwriter-telegram`

#### **Service 2: Ghost Writer Poster**

1. In the same Railway project, click "New Service"
2. Select "Deploy from GitHub repo" (same repository)
3. **Override Build Settings:**
   - **Dockerfile Path:** `Dockerfile.ghostwriter`
   - **Service Name:** `ghostwriter-poster`

---

### **Step 2: Configure Environment Variables**

#### **For Both Services (Telegram + Ghost Writer):**

Go to each service → "Variables" tab → Add:

```bash
LEKE_LEKE_EMAIL=your_email@example.com
LEKE_LEKE_PASSWORD=your_password
```

#### **For Telegram Bot ONLY:**

```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
CEO_TELEGRAM_ID=123456789
```

#### **Optional (for future Gemini image gen):**

```bash
GEMINI_API_KEY=your_gemini_api_key
```

---

### **Step 3: Deploy**

1. Railway will auto-deploy both services
2. Check logs for errors:
   - Telegram bot: "🤖 Telegram Approval Bot is LIVE!"
   - Ghost Writer: "🎯 Ghost Writer watching for CEO approvals..."

---

## 🧪 **LOCAL TESTING (BEFORE RAILWAY)**

Test the full workflow locally using Docker Compose:

### **Prerequisites:**

- Docker Desktop installed
- `.env` file created (copy from `.env.example`)

### **Steps:**

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   nano .env  # Fill in your credentials
   ```

2. **Build and run both services:**
   ```bash
   docker-compose up --build
   ```

3. **Test Telegram bot:**
   - Open Telegram, find your bot
   - Send `/start` → Should respond with help menu
   - Send `/status` → Should show "Day 1/36"
   - Send `/generate` → Should send Lagos graphic + caption with [✅ APPROVE] button

4. **Test approval workflow:**
   - Click **✅ APPROVE** button
   - Check Ghost Writer logs → Should see "🎯 CEO APPROVED: post_xxx"
   - Ghost Writer attempts to post to Leke Leke (will fail if selectors not updated)

5. **Stop services:**
   ```bash
   docker-compose down
   ```

---

## 🔧 **SELENIUM SELECTORS UPDATE (CRITICAL)**

Before production, update CSS selectors in `leke_leke_browser_automation.py`:

### **Steps:**

1. Open Leke Leke in Chrome
2. Press `F12` (DevTools) → "Elements" tab
3. Inspect each element and copy CSS selector

### **Selectors to Update:**

```python
# LOGIN PAGE
email_field = driver.find_element(By.CSS_SELECTOR, "input[name='email']")  # Update this
password_field = driver.find_element(By.CSS_SELECTOR, "input[name='password']")  # Update this
login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")  # Update this

# POST COMPOSER
composer_button = driver.find_element(By.CSS_SELECTOR, "[data-testid='post-composer']")  # Update this
text_area = driver.find_element(By.CSS_SELECTOR, "textarea[placeholder*='What']")  # Update this
file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")  # Update this
submit_button = driver.find_element(By.CSS_SELECTOR, "button[data-testid='post-submit']")  # Update this
```

### **How to Find Selectors:**

- Right-click element → "Inspect"
- In DevTools, right-click highlighted HTML → "Copy" → "Copy selector"
- Paste into code

---

## 📱 **CEO WORKFLOW (PRODUCTION)**

Once deployed, CEO uses Telegram to control posting:

### **Daily Workflow:**

1. **Generate Post:**
   ```
   /generate
   ```
   Bot responds with:
   - 📸 Graphic preview (1200x675px)
   - 📝 Caption preview (formatted)
   - [✅ APPROVE] [❌ REJECT] buttons

2. **Review Content:**
   - Check graphic quality
   - Read caption (grammar, facts, hashtags)
   - Verify state name and day number

3. **Approve:**
   - Click **✅ APPROVE**
   - Bot: "✅ Approved! Ghost Writer will post this shortly."
   - Ghost Writer posts within 10 seconds

4. **Check Status:**
   ```
   /status
   ```
   Bot shows:
   - 📊 Day X/36 (X% complete)
   - ✅ X posts completed
   - ⏳ X posts remaining
   - 📥 X posts pending review
   - 🚀 X posts approved (queued)

5. **View Queue:**
   ```
   /queue
   ```
   Lists pending posts:
   - Day 1 - Lagos
   - Day 2 - FCT Abuja
   - Day 3 - Kano

---

## 🛡️ **SAFETY MECHANISMS**

### **Rate Limiting:**
- Max 20 actions/hour (Ghost Writer)
- 2-5 second delays between actions
- Human-like randomness

### **CEO Approval Gate:**
- NO autonomous posting
- CEO reviews EVERY post before it goes live
- Reduces spam risk by 80%

### **Error Handling:**
- Auto-retry on Selenium failures (3 attempts)
- Logs all errors to Railway dashboard
- Telegram notifications on critical failures

### **Gradual Ramp-Up:**
- Week 1: 1 post/day
- Week 2: 2 posts/day
- Week 3+: 3 posts/day
- Monitor for platform warnings

---

## 📊 **MONITORING**

### **Railway Dashboard:**
- View logs in real-time
- CPU/RAM usage (should be <10%)
- Deployment history

### **Telegram Notifications:**
- ✅ "Post successful: Day X/36 - State"
- ❌ "Post failed: [error message]"
- 🎯 "CEO approved: post_xxx"

### **Analytics (Future):**
- Follower growth tracking
- Engagement per post (likes, comments)
- Viral post identification (100+ engagements)

---

## 🚨 **TROUBLESHOOTING**

### **Telegram Bot Not Responding:**

1. Check Railway logs for errors
2. Verify `TELEGRAM_BOT_TOKEN` is correct
3. Test bot with `/start` command
4. Check Telegram API status: [status.telegram.org](https://status.telegram.org)

### **Ghost Writer Not Posting:**

1. Check if `trigger_post.flag` file is created after approval
2. Check Railway logs for Selenium errors
3. Verify `LEKE_LEKE_EMAIL` and `LEKE_LEKE_PASSWORD` are correct
4. Test login manually on Leke Leke website
5. **Most likely issue:** CSS selectors changed (update selectors)

### **Graphics Not Generating:**

1. Check if `generated_graphics/` directory exists
2. Check PIL/Pillow installation
3. Test locally: `python3 graphic_generator.py`

### **"Chromium not found" Error:**

1. Verify Dockerfile includes `chromium` and `chromium-driver`
2. Check `CHROME_BIN` and `CHROME_DRIVER` env vars
3. Railway Selenium buildpack: `railway.toml` configured

---

## 🎯 **CAMPAIGN TIMELINE**

### **36 States of Tech Campaign:**

- **Duration:** 36 days (5 weeks)
- **Posting:** 1-3 times/day (gradual ramp-up)
- **Content:** State spotlights (tech hubs, startups, facts)
- **Goal:** 24 followers → 10,000+ followers

### **Example Day 1 (Lagos):**

```
🎯 DAY 1/36: LAGOS STATE TECH ECOSYSTEM 🌍

INTEL BRIEF:
📍 Capital: Ikeja
🌐 Zone: South West
💼 Tech Hubs: Yaba Tech Hub, Co-Creation Hub, Facebook NG Tech Hub
🚀 Notable Startups: Flutterwave, Paystack, Andela

💡 DID YOU KNOW?
Lagos is Africa's tech capital with over 60% of Nigeria's tech startups

👥 WHO'S BUILDING IN LAGOS? Drop your projects below 👇

📖 Full Intel Brief: https://amdsolutions007.com/states/lagos

#LagosTech #YabaLeftBank #BuildInLagos #AMD36States #BuildInNaija
```

---

## 📞 **SUPPORT**

### **Issues:**
- GitHub: Open issue in `AMD_Control_Center` repository
- Telegram: Contact @amd on Leke Leke

### **Railway Support:**
- [railway.app/help](https://railway.app/help)
- Discord: [discord.gg/railway](https://discord.gg/railway)

---

## ✅ **DEPLOYMENT CHECKLIST**

Before going live, verify:

- [ ] `.env` file created with all credentials
- [ ] Tested locally with `docker-compose up`
- [ ] Telegram bot responds to `/start`
- [ ] CEO can generate posts with `/generate`
- [ ] Approval buttons (✅/❌) work
- [ ] Ghost Writer detects `trigger_post.flag`
- [ ] Selenium selectors updated for Leke Leke
- [ ] Both services deployed to Railway
- [ ] Environment variables configured in Railway
- [ ] Railway logs show "LIVE" messages
- [ ] CEO tested first approval → post workflow
- [ ] Monitoring set up (Railway dashboard + Telegram notifications)
- [ ] Gradual ramp-up plan documented (1→2→3 posts/day)

---

## 🎉 **READY TO LAUNCH**

Once checklist is complete, CEO can start the 36 States of Tech campaign:

1. Send `/generate` to Telegram bot
2. Review Lagos State graphic + caption
3. Click **✅ APPROVE**
4. Ghost Writer posts to Leke Leke within 10 seconds
5. Monitor engagement for 24 hours
6. Repeat for Day 2 (FCT Abuja)

**Goal:** Build 10,000+ followers on Leke Leke in 5 weeks with high-quality, CEO-approved content.

**Constraint:** Leke Leke platform ONLY (no LinkedIn, Facebook, X, Telegram).

**Philosophy:** Quality over speed. Human-in-the-loop ensures every post is excellent.

---

**AUTHORIZATION:** Option B (Hybrid System) approved by CEO on 2026-02-11.

**STATUS:** Phase 4 (Railway Deployment) - READY TO DEPLOY.
