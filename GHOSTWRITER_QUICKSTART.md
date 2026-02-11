# ⚡ GHOST WRITER PRO - QUICK START GUIDE

**For:** CEO Olawale Shoyemi  
**Goal:** Deploy Ghost Writer Pro in < 30 minutes  
**Status:** Ready to Launch

---

## 🚀 5-STEP DEPLOYMENT

### **STEP 1: Local Testing (5 minutes)**

```bash
# Navigate to project
cd /Users/mac/Desktop/AMD_Control_Center

# Run pre-deployment tests
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

**If tests fail:**
- Check `.env` file exists (copy from `.env.example`)
- Fill in: `TELEGRAM_BOT_TOKEN`, `CEO_TELEGRAM_ID`, `LEKE_LEKE_EMAIL`, `LEKE_LEKE_PASSWORD`

---

### **STEP 2: Railway Setup (10 minutes)**

#### **A. Create Project**

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select `AMD_Control_Center`

#### **B. Deploy Telegram Bot**

1. Railway auto-detects repo
2. Click "Add Service" → "Deploy from GitHub repo"
3. **Service Settings:**
   - Name: `ghostwriter-telegram`
   - Dockerfile Path: `Dockerfile.telegram`
4. **Variables Tab → Add:**
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token
   CEO_TELEGRAM_ID=your_telegram_id
   LEKE_LEKE_EMAIL=your_email@example.com
   LEKE_LEKE_PASSWORD=your_password
   ```
5. Click "Deploy"

#### **C. Deploy Ghost Writer**

1. Click "New Service" (same project)
2. **Service Settings:**
   - Name: `ghostwriter-poster`
   - Dockerfile Path: `Dockerfile.ghostwriter`
3. **Variables Tab → Add:**
   ```bash
   LEKE_LEKE_EMAIL=your_email@example.com
   LEKE_LEKE_PASSWORD=your_password
   ```
4. Click "Deploy"

---

### **STEP 3: Verify Deployment (2 minutes)**

#### **Check Telegram Bot Logs**

Railway Dashboard → `ghostwriter-telegram` → Logs

**Expected:**
```
🤖 Telegram Approval Bot is LIVE!
📱 CEO Telegram ID: 123456789
✅ Ready to receive commands
```

#### **Check Ghost Writer Logs**

Railway Dashboard → `ghostwriter-poster` → Logs

**Expected:**
```
🎯 Ghost Writer watching for CEO approvals...
⏳ Checking every 10 seconds...
```

---

### **STEP 4: Test Telegram Bot (5 minutes)**

#### **A. Find Your Bot**

1. Open Telegram app
2. Search for your bot name (from @BotFather)
3. Click "Start"

#### **B. Test Commands**

```
/start
```
**Expected:** Welcome message with command list

```
/status
```
**Expected:**
```
📊 CAMPAIGN STATUS

🎯 Campaign: 36 States of Tech
📅 Day 1/36 (3% complete)

✅ 0 posts completed
⏳ 36 posts remaining

📥 0 posts pending review
🚀 0 posts approved (queued)
```

```
/generate
```
**Expected:**
1. Bot sends: "🎨 Generating Lagos State graphic..."
2. Bot sends: 📸 **Photo** (1200x675px, AMD-branded)
3. Bot sends: 📝 **Caption** (Day 1/36: LAGOS STATE TECH ECOSYSTEM...)
4. Bot shows: [✅ APPROVE] [❌ REJECT] buttons

---

### **STEP 5: First Post (5 minutes)**

#### **A. Review Content**

**Check graphic:**
- ✅ State name visible ("Lagos")
- ✅ AMD branding (yellow/black)
- ✅ Day number ("DAY 1/36")
- ✅ Size correct (1200x675px)

**Check caption:**
- ✅ Facts accurate (capital, zone, tech hubs)
- ✅ Hashtags relevant (#LagosTech, #YabaLeftBank, #BuildInLagos)
- ✅ Grammar correct
- ✅ Call-to-action included ("Who's building in Lagos?")

#### **B. Approve**

Click **✅ APPROVE** button

**Expected:**
```
✅ Post Approved!

Ghost Writer will post this to Leke Leke shortly.

Day 1/36 - Lagos State
```

#### **C. Verify Post**

1. Wait 10-15 seconds
2. Open [www.lekeelekee.com](https://www.lekeelekee.com)
3. Go to your profile (@amd)
4. Check latest post → Should see Lagos graphic + caption

**If post appears:**
🎉 **SUCCESS! Ghost Writer is LIVE!**

**If post fails:**
- Check Railway logs → `ghostwriter-poster` → Look for errors
- **Most likely issue:** Selenium selectors need updating (see below)

---

## 🔧 TROUBLESHOOTING

### **❌ "Telegram bot not responding"**

**Fix:**
1. Check `TELEGRAM_BOT_TOKEN` in Railway variables (no spaces)
2. Restart service: Railway Dashboard → `ghostwriter-telegram` → "Restart"
3. Test bot token:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```

---

### **❌ "Ghost Writer not posting"**

**Fix (Most Common):**

Selenium selectors need updating. Leke Leke HTML changed.

**Steps:**
1. Open [www.lekeelekee.com](https://www.lekeelekee.com) in Chrome
2. Press `F12` → "Elements" tab
3. Inspect each element:

**Login page:**
- Email field → Right-click → "Copy" → "Copy selector"
- Password field → Copy selector
- Login button → Copy selector

**Post composer:**
- Composer button → Copy selector
- Text area → Copy selector
- File input → Copy selector
- Submit button → Copy selector

4. Update in `leke_leke_browser_automation.py`:

```python
# LOGIN PAGE (around line 80-90)
email_field = driver.find_element(By.CSS_SELECTOR, "PASTE_SELECTOR_HERE")
password_field = driver.find_element(By.CSS_SELECTOR, "PASTE_SELECTOR_HERE")
login_button = driver.find_element(By.CSS_SELECTOR, "PASTE_SELECTOR_HERE")

# POST COMPOSER (around line 110-130)
composer_button = driver.find_element(By.CSS_SELECTOR, "PASTE_SELECTOR_HERE")
text_area = driver.find_element(By.CSS_SELECTOR, "PASTE_SELECTOR_HERE")
file_input = driver.find_element(By.CSS_SELECTOR, "PASTE_SELECTOR_HERE")
submit_button = driver.find_element(By.CSS_SELECTOR, "PASTE_SELECTOR_HERE")
```

5. Commit and push → Railway auto-deploys
6. Try approving post again

---

### **❌ "Graphics not generating"**

**Fix:**
1. Check Railway logs → Look for PIL/Pillow errors
2. Test locally:
   ```bash
   python3 graphic_generator.py
   ```
3. Check if `generated_graphics/` directory exists
4. If fails, reinstall Pillow:
   ```bash
   pip install --upgrade Pillow
   ```

---

## 📱 DAILY WORKFLOW (AFTER LAUNCH)

### **Morning (9:00 AM)**

```
Open Telegram → Find Ghost Writer bot

/generate
```
→ Review graphic  
→ Review caption  
→ Click **✅ APPROVE**  
→ Wait 10 seconds  
→ Post goes live

### **Afternoon (3:00 PM)**

```
/status
```
→ Check progress (Day X/36)  
→ View follower growth  
→ Respond to comments on Leke Leke

### **Evening (8:00 PM)**

```
/generate (again)
```
→ Approve  
→ 2 posts/day = faster growth

---

## 📊 SUCCESS METRICS

### **Week 1 Targets:**
- ✅ 7 posts published (1/day)
- ✅ 50+ new followers (24 → 74)
- ✅ 100+ engagements (likes + comments)
- ✅ No platform warnings

### **Week 2 Targets:**
- ✅ 14 posts published (2/day)
- ✅ 150+ new followers (74 → 224)
- ✅ 300+ engagements
- ✅ 1-2 viral posts (100+ likes)

### **Campaign Complete (Week 5):**
- ✅ 36 posts (all states)
- ✅ 1,000+ followers
- ✅ 5-10 viral posts
- ✅ 500+ group members

---

## 🎯 NEXT STEPS (AFTER FIRST POST)

### **Immediate (Today):**
- [ ] Post Day 1 (Lagos)
- [ ] Monitor for 24 hours
- [ ] Check follower growth (+10-20 expected)
- [ ] Respond to comments

### **Tomorrow:**
- [ ] Post Day 2 (FCT Abuja)
- [ ] Continue daily posting

### **Week 1:**
- [ ] Complete Days 1-7 (7 states)
- [ ] Review analytics (what works best)
- [ ] Increase to 2 posts/day if successful

### **Week 5:**
- [ ] Complete all 36 states
- [ ] Analyze results (followers, engagement, viral posts)
- [ ] Plan Phase 2 (new content cycle)

---

## 📞 SUPPORT

**Railway Issues:**
- [railway.app/help](https://railway.app/help)

**Telegram Bot Issues:**
- [core.telegram.org/bots/api](https://core.telegram.org/bots/api)

**Leke Leke Profile:**
- [@amd](https://www.lekeelekee.com/@amd)

**Documentation:**
- `DEPLOYMENT.md` - Full deployment guide
- `GHOSTWRITER_CHECKLIST.md` - Pre-launch checklist
- `GHOSTWRITER_EXECUTIVE_SUMMARY.md` - Complete system overview

---

## ✅ DEPLOYMENT COMPLETE

**Congratulations! Ghost Writer Pro is LIVE!**

**What's Running:**
- ✅ Telegram Approval Bot (CEO control panel)
- ✅ Ghost Writer Poster (Selenium automation)
- ✅ Content Engine (36-state database)
- ✅ Graphic Generator (AI-powered graphics)
- ✅ Queue System (approval workflow)

**Next Action:**
👉 **Open Telegram → Send `/generate` → Approve Day 1 (Lagos) → Launch campaign!**

**Goal:** 24 followers → 10,000+ followers in 5 weeks

**System:** Option B - Hybrid (CEO-approved, no spam, quality content only)

**Platform:** Leke Leke ONLY

---

**Status:** ✅ READY TO LAUNCH  
**Last Updated:** 2026-02-11  
**Version:** 1.0
