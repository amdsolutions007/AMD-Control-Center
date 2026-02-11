# 🚀 Ghost Writer Pro - Deployment Checklist

**Project:** 36 States of Tech Campaign  
**Platform:** Leke Leke (www.lekeelekee.com)  
**System:** Option B - Hybrid (CEO Approval Required)  
**Status:** Phase 4 - Ready for Deployment

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### **1. Code Files (Complete)**

- [x] `36_states_data.json` - Complete 36-state database
- [x] `content_generator.py` - Caption generation engine
- [x] `graphic_generator.py` - PIL template system (1200x675px)
- [x] `telegram_approval_bot.py` - CEO control panel
- [x] `leke_leke_browser_automation.py` - Approval-triggered poster

### **2. Deployment Files (Complete)**

- [x] `Dockerfile.telegram` - Telegram bot container
- [x] `Dockerfile.ghostwriter` - Ghost Writer container
- [x] `requirements-telegram.txt` - Telegram bot dependencies
- [x] `requirements-ghostwriter.txt` - Ghost Writer dependencies
- [x] `docker-compose.yml` - Local testing setup
- [x] `.env.example` - Environment variable template
- [x] `DEPLOYMENT.md` - Complete deployment guide
- [x] `test_ghostwriter_local.py` - Pre-deployment test script

### **3. Queue Directories**

- [ ] `pending_posts/` - Created (auto-created by scripts)
- [ ] `approved_posts/` - Created (auto-created by scripts)
- [ ] `rejected_posts/` - Created (auto-created by scripts)
- [ ] `posted_archive/` - Created (auto-created by scripts)
- [ ] `generated_graphics/` - Created (auto-created by scripts)

### **4. Environment Variables**

- [ ] `TELEGRAM_BOT_TOKEN` - From @BotFather
- [ ] `CEO_TELEGRAM_ID` - From @userinfobot
- [ ] `LEKE_LEKE_EMAIL` - Your Leke Leke email
- [ ] `LEKE_LEKE_PASSWORD` - Your Leke Leke password
- [ ] `GEMINI_API_KEY` - (Optional) For future image gen

---

## 🧪 LOCAL TESTING

### **Step 1: Run Test Script**

```bash
python3 test_ghostwriter_local.py
```

**Expected Output:**
```
✅ PASS - Data Files
✅ PASS - Queue Directories
✅ PASS - Environment Variables
✅ PASS - Content Generator
✅ PASS - Graphic Generator

✅ ALL TESTS PASSED - READY FOR DEPLOYMENT
```

### **Step 2: Test Telegram Bot**

```bash
python3 telegram_approval_bot.py
```

**Expected Output:**
```
🤖 Telegram Approval Bot starting...
📱 CEO Telegram ID: 123456789
✅ Ready to receive commands
```

**Test Commands:**
1. Open Telegram → Find your bot
2. Send `/start` → Should respond with help
3. Send `/status` → Should show "Day 1/36"
4. Send `/generate` → Should send Lagos graphic + caption

### **Step 3: Test Docker Compose (Optional)**

```bash
docker-compose up --build
```

**Expected Output:**
```
ghostwriter-telegram | 🤖 Telegram Approval Bot is LIVE!
ghostwriter-poster   | 🎯 Ghost Writer watching for CEO approvals...
```

**Stop:** `Ctrl+C` then `docker-compose down`

---

## 🚢 RAILWAY DEPLOYMENT

### **Step 1: Create Railway Project**

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize GitHub → Select `AMD_Control_Center`

### **Step 2: Deploy Telegram Bot**

**Service Settings:**
- Name: `ghostwriter-telegram`
- Dockerfile Path: `Dockerfile.telegram`
- Auto-deploy: Enabled

**Environment Variables:**
```bash
TELEGRAM_BOT_TOKEN=your_bot_token
CEO_TELEGRAM_ID=your_telegram_id
LEKE_LEKE_EMAIL=your_email@example.com
LEKE_LEKE_PASSWORD=your_password
```

**Deploy:** Railway auto-deploys on push

**Verify Logs:**
```
🤖 Telegram Approval Bot is LIVE!
📱 CEO Telegram ID: 123456789
✅ Ready to receive commands
```

### **Step 3: Deploy Ghost Writer**

**Service Settings:**
- Name: `ghostwriter-poster`
- Dockerfile Path: `Dockerfile.ghostwriter`
- Auto-deploy: Enabled

**Environment Variables:**
```bash
LEKE_LEKE_EMAIL=your_email@example.com
LEKE_LEKE_PASSWORD=your_password
```

**Deploy:** Railway auto-deploys on push

**Verify Logs:**
```
🎯 Ghost Writer watching for CEO approvals...
⏳ Checking every 10 seconds...
```

---

## 🔧 CRITICAL: SELENIUM SELECTORS

**BEFORE PRODUCTION, UPDATE SELECTORS:**

1. Open [www.lekeelekee.com](https://www.lekeelekee.com) in Chrome
2. Press `F12` → "Elements" tab
3. Inspect each element:
   - Login email field
   - Login password field
   - Login submit button
   - Post composer button
   - Post text area
   - File upload input
   - Post submit button

4. Update in `leke_leke_browser_automation.py`:

```python
# LOGIN PAGE (around line 80-90)
email_field = driver.find_element(By.CSS_SELECTOR, "YOUR_SELECTOR_HERE")
password_field = driver.find_element(By.CSS_SELECTOR, "YOUR_SELECTOR_HERE")
login_button = driver.find_element(By.CSS_SELECTOR, "YOUR_SELECTOR_HERE")

# POST COMPOSER (around line 110-130)
composer_button = driver.find_element(By.CSS_SELECTOR, "YOUR_SELECTOR_HERE")
text_area = driver.find_element(By.CSS_SELECTOR, "YOUR_SELECTOR_HERE")
file_input = driver.find_element(By.CSS_SELECTOR, "YOUR_SELECTOR_HERE")
submit_button = driver.find_element(By.CSS_SELECTOR, "YOUR_SELECTOR_HERE")
```

**⚠️ Ghost Writer will FAIL without correct selectors!**

---

## 📱 CEO PRODUCTION WORKFLOW

### **1. Generate Post**

Open Telegram → Send to bot:
```
/generate
```

Bot responds:
- 📸 Graphic (1200x675px, AMD-branded)
- 📝 Caption (formatted, Day X/36)
- [✅ APPROVE] [❌ REJECT] buttons

### **2. Review Content**

Check:
- ✅ Graphic quality (state name visible, branding correct)
- ✅ Caption accuracy (facts correct, hashtags relevant)
- ✅ Day/state match (Day 1 = Lagos, Day 2 = FCT Abuja, etc.)

### **3. Approve or Reject**

- Click **✅ APPROVE** → Ghost Writer posts within 10 seconds
- Click **❌ REJECT** → Post discarded, generate new one

### **4. Monitor Status**

```
/status
```

Shows:
- 📊 Day X/36 (X% complete)
- ✅ X posts completed
- ⏳ X posts remaining
- 📥 X pending review
- 🚀 X approved (queued)

---

## 🛡️ PRODUCTION SAFETY

### **Rate Limiting**
- Max 20 actions/hour (Ghost Writer)
- 2-5 second random delays
- Human-like behavior patterns

### **Gradual Ramp-Up**
- Week 1: 1 post/day → Establish presence
- Week 2: 2 posts/day → Build momentum
- Week 3+: 3 posts/day → Full campaign speed

### **Monitoring**
- Railway logs (real-time errors)
- Telegram notifications (success/failure)
- Weekly analytics (follower growth, engagement)

### **Error Handling**
- Auto-retry on failures (3 attempts)
- CEO notification on critical errors
- Fallback to manual posting if needed

---

## 📊 SUCCESS METRICS

### **Week 1 Goals:**
- ✅ 7 posts published (1/day)
- ✅ No platform bans/warnings
- ✅ 50+ new followers (24 → 74)
- ✅ 100+ engagements total

### **Week 2 Goals:**
- ✅ 14 posts published (2/day)
- ✅ 150+ new followers (74 → 224)
- ✅ 300+ engagements total
- ✅ 1-2 viral posts (100+ likes)

### **Week 5 Goals (Campaign End):**
- ✅ 36 posts published (all states)
- ✅ 1,000+ new followers (24 → 1,024+)
- ✅ 2,000+ engagements total
- ✅ 5-10 viral posts
- ✅ 500+ group members (64 → 564+)

---

## 🚨 TROUBLESHOOTING

### **Telegram Bot Not Responding**

**Symptoms:** Bot doesn't reply to `/start`

**Fixes:**
1. Check Railway logs for errors
2. Verify `TELEGRAM_BOT_TOKEN` is correct (no spaces)
3. Test token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
4. Restart Railway service

### **Ghost Writer Not Posting**

**Symptoms:** CEO approves, but nothing posts

**Fixes:**
1. Check if `trigger_post.flag` is created in approved flow
2. Check Railway logs for Selenium errors
3. **Most likely:** CSS selectors changed → Update selectors
4. Test login manually on Leke Leke website
5. Verify credentials: `LEKE_LEKE_EMAIL`, `LEKE_LEKE_PASSWORD`

### **Graphics Not Generating**

**Symptoms:** `/generate` fails or sends blank image

**Fixes:**
1. Check if `generated_graphics/` directory exists
2. Check Railway logs for PIL/Pillow errors
3. Test locally: `python3 graphic_generator.py`
4. Verify font availability (Helvetica fallback)

### **"Chromium not found" Error**

**Symptoms:** Ghost Writer crashes on startup

**Fixes:**
1. Verify `Dockerfile.ghostwriter` includes `chromium` package
2. Check Railway buildpacks (should auto-detect)
3. Add to Dockerfile if missing:
   ```dockerfile
   RUN apt-get update && apt-get install -y chromium chromium-driver
   ```

---

## ✅ FINAL GO/NO-GO CHECKLIST

**GO IF ALL TRUE:**

- [ ] Local tests pass (`test_ghostwriter_local.py`)
- [ ] Telegram bot responds to `/start` on Railway
- [ ] CEO can generate posts with `/generate`
- [ ] Graphics display correctly (1200x675px)
- [ ] Approval buttons (✅/❌) work
- [ ] Ghost Writer logs show "watching for approvals"
- [ ] Selenium selectors updated for Leke Leke
- [ ] CEO tested full workflow (generate → approve → verify post)
- [ ] Monitoring configured (Railway + Telegram notifications)
- [ ] Gradual ramp-up plan documented

**NO-GO IF ANY TRUE:**

- [ ] Telegram bot doesn't respond
- [ ] Graphics fail to generate
- [ ] Selenium selectors not updated
- [ ] CEO cannot approve posts
- [ ] Ghost Writer crashes on startup
- [ ] Login to Leke Leke fails
- [ ] Rate limiting not configured

---

## 🎯 LAUNCH SEQUENCE

**T-24 hours:**
- [ ] Deploy both services to Railway
- [ ] Configure all environment variables
- [ ] Verify services are "LIVE" in Railway logs

**T-2 hours:**
- [ ] CEO tests `/start`, `/status`, `/generate` commands
- [ ] CEO generates test post (Lagos)
- [ ] CEO approves test post
- [ ] Verify Ghost Writer posts to Leke Leke

**T-0 (GO LIVE):**
- [ ] CEO generates Day 1 post (Lagos)
- [ ] CEO reviews and approves
- [ ] Monitor for 1 hour (check for errors)
- [ ] If successful, continue with Day 2 tomorrow

**T+24 hours:**
- [ ] Review follower growth (target: +10-20)
- [ ] Review engagement (target: 20+ total interactions)
- [ ] Identify any issues (rate limits, bans, errors)
- [ ] Optimize if needed (better captions, different timing)

---

## 📞 SUPPORT CONTACTS

**Railway Issues:**
- Dashboard: [railway.app/project/your-project](https://railway.app)
- Support: [railway.app/help](https://railway.app/help)
- Discord: [discord.gg/railway](https://discord.gg/railway)

**Leke Leke Issues:**
- Platform: [www.lekeelekee.com](https://www.lekeelekee.com)
- Profile: @amd
- Group: African Tech Ecosystem

**Telegram API Issues:**
- Status: [status.telegram.org](https://status.telegram.org)
- Docs: [core.telegram.org/bots/api](https://core.telegram.org/bots/api)

---

## 🎉 CAMPAIGN LAUNCH READY

**System:** Ghost Writer Pro (Option B - Hybrid)  
**Authorization:** CEO-approved on 2026-02-11  
**Phases Complete:** 1-4 (Content, Telegram, Ghost Writer, Deployment)  
**Status:** ✅ READY TO DEPLOY  

**Next Action:** Run local tests → Deploy to Railway → CEO tests workflow → LAUNCH Day 1 (Lagos)

**Goal:** 24 followers → 10,000+ followers in 5 weeks with high-quality, CEO-approved content.

**Constraint:** Leke Leke platform ONLY. No autonomous posting. Quality over speed.

---

**Last Updated:** 2026-02-11  
**Phase:** 4 (Railway Deployment)  
**Status:** Ready for Production
