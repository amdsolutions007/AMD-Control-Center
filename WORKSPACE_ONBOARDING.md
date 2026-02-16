# 🎓 AMD CONTROL CENTER - AGENT ONBOARDING PROTOCOL

**Purpose:** Complete A-Z guide for any new AI agent or developer joining AMD Solutions 007  
**Last Updated:** 14 February 2026  
**Mandatory Reading Time:** 10 minutes

---

## 🚦 START HERE (FIRST 60 SECONDS)

### **WHO ARE WE?**
- **Company:** AMD Solutions 007
- **CEO:** Olawale Shoyemi (+234 818 002 1007)
- **Mission:** AI-powered automation + intelligence for African tech ecosystem
- **Projects:** 25+ active systems generating ₦2.5M+/month revenue potential

### **WHAT IS THIS WORKSPACE?**
- **Repository:** AMD-Control-Center (GitHub: amdsolutions007/AMD-Control-Center)
- **Structure:** Monorepo with 3 main apps + 20+ automation scripts
- **Tech Stack:** Next.js 14, Python 3.9, Node.js, OpenAI GPT-4o-mini, Selenium, Railway, Vercel

### **YOUR FIRST ACTION:**
```bash
# 1. Read this file completely (you're doing it now ✅)
# 2. Read main README.md (executive summary of all 25+ projects)
# 3. Check INCOMPLETE_WORK.md (prioritized task list)
# 4. Verify environment variables in .env files
```

---

## 📂 WORKSPACE STRUCTURE (MASTER MAP)

```
AMD_Control_Center/
│
├── 📋 README.md                    ← MASTER INDEX (all projects catalog)
├── 📋 WORKSPACE_ONBOARDING.md      ← YOU ARE HERE (start guide)
├── 📋 INCOMPLETE_WORK.md           ← PRIORITY TASK LIST (what's pending)
├── 📋 .env.example                 ← ALL API KEYS TEMPLATE
│
├── 🌐 apps/
│   ├── website/                    ← PROJECT 1: Main Website (amdsolutions007.com)
│   │   ├── README.md               ← Project-specific documentation
│   │   ├── .env.local              ← Project environment variables
│   │   └── SUPABASE_API_KEYS_NEEDED.md ← ⚠️ INCOMPLETE CONFIG
│   │
│   ├── amd-signal-beacon/          ← PROJECT 2: Signal Beacon (Intelligence Hub)
│   │   ├── README.md               ← COMPREHENSIVE DOCS (live metrics, features)
│   │   ├── .env.local              ← OpenAI + GA4 configured
│   │   └── VIDEO_TESTIMONIALS_PLAN.md ← Implementation roadmap
│   │
│   └── amd-whatsapp-bot/           ← PROJECT 3: WhatsApp Automation Bot
│       └── README.md
│
├── 🤖 automation/                   ← Social media automation scripts
│   ├── leke_leke_onboarding.py
│   ├── facebook_browser_poster.py
│   └── auto_facebook_poster.py
│
├── 🚀 deployment/                   ← Deployment configs
│   ├── Dockerfile.telegram
│   ├── Dockerfile.ghostwriter
│   ├── ecosystem.config.js         ← PM2 config
│   └── railway.json
│
├── 📊 whatsapp_empire/              ← WhatsApp Business Assets
│   ├── ASSETS_CHECKLIST.md        ← ⚠️ 2/5 INCOMPLETE (E-book PDF, Book Cover)
│   ├── LITTLE_DROP_EBOOK.md        ← Markdown source (needs PDF conversion)
│   └── VIRAL_MARKETING_STRATEGY.md
│
├── 🛠️ tools/                        ← Utility scripts
│   ├── meta_token_exchanger.py
│   └── ops_telegram_watch.py
│
└── 📦 Documentation Files/
    ├── DEPLOYMENT_MONITORING.md
    ├── RAILWAY_DEPLOYMENT.md
    ├── NEXUS_LIVE_STATUS.md
    └── [50+ other .md files]
```

---

## 🔑 CRITICAL ENVIRONMENT VARIABLES (MASTER LIST)

### **Location Priority:**
1. **Local:** `/apps/{project}/.env.local` (Git-ignored, machine-specific)
2. **Example:** `/apps/{project}/.env.local.example` (Committed template)
3. **Production:** Vercel/Railway dashboard (deployed environments)

### **ALL APIS & CREDENTIALS:**

#### **🤖 AI/ML Services**
```bash
# OpenAI (GPT-4o-mini for AI Assistant)
OPENAI_API_KEY=sk-proj-CWOqewjJJ...
# Status: ✅ ACTIVE ($16 credit balance)
# Usage: Signal Beacon AI Assistant, content generation
# Docs: https://platform.openai.com/api-keys

# Google Gemini (Graphics + content generation)
GEMINI_API_KEY=AIzaSyDlsrzao8JEYP4siBqjv6sMSazhBr5xcDc
# Status: ✅ ACTIVE
# Usage: Ghost Writer graphic generation, transcription
# Docs: https://ai.google.dev/

# Anthropic Claude (Advanced reasoning)
ANTHROPIC_API_KEY=sk-ant-api03-5d-Xh...
# Status: ✅ ACTIVE
# Usage: Content analysis, code review
```

#### **📊 Analytics & Tracking**
```bash
# Google Analytics 4 (Global property)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-246XMJQERK
# Status: ✅ CONFIGURED (Feb 8, 2026)
# Tracks: Main website + Signal Beacon
# Dashboard: https://analytics.google.com/analytics/web/#/a383703211p523704298
# Live Data: 15 users/week, 90 events, Nigeria 53%, USA 40%

# Custom Analytics
NEXT_PUBLIC_ADMIN_PASSWORD=amd007
# Status: ✅ ACTIVE
# Usage: Signal Beacon admin dashboard (/admin-analytics)
```

#### **💬 Communication APIs**
```bash
# Telegram Bot (CEO approval system)
TELEGRAM_BOT_TOKEN=8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg
CEO_TELEGRAM_ID=8013249849
# Status: ✅ DEPLOYED (Railway)
# Bot: @AMDSolutions007_bot
# Usage: Ghost Writer Pro approval workflow

# WhatsApp Business API
# Status: ⏳ PENDING SETUP
# Needed for: WhatsApp Bot automation
```

#### **🗄️ Databases**
```bash
# Supabase (Client Portal)
NEXT_PUBLIC_SUPABASE_URL=https://pjoijeligrgttimkqftk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=⚠️ MISSING (see apps/website/SUPABASE_API_KEYS_NEEDED.md)
SUPABASE_SERVICE_ROLE_KEY=⚠️ MISSING
# Status: ⚠️ INCOMPLETE
# Dashboard: https://supabase.com/dashboard/project/pjoijeligrgttimkqftk
# Urgency: HIGH (blocks client portal Phase 2)
```

#### **🎨 Social Media Credentials**
```bash
# Leke Leke (Nigerian tech platform)
LEKE_LEKE_EMAIL=ceo@amdsolutions007.com
LEKE_LEKE_PASSWORD=#@Amdmail@007
# Status: ✅ ACTIVE
# Campaign: 36 States of Tech (5 weeks, 10,000+ followers goal)

# Facebook/Instagram API
FACEBOOK_PAGE_ID=[REDACTED - check .env]
FACEBOOK_ACCESS_TOKEN=[REDACTED - check .env]
# Status: ✅ CONFIGURED (expires every 60 days)
# Refresh: tools/meta_token_exchanger.py
```

---

## ⚠️ INCOMPLETE WORK (BEFORE YOU START NEW TASKS)

### **🔴 HIGH PRIORITY (Do These First)**

#### **1. Supabase API Keys Configuration** ⚠️
**Status:** Keys missing, blocks client portal authentication  
**File:** `/apps/website/SUPABASE_API_KEYS_NEEDED.md`  
**Time:** 5 minutes  
**Action:**
```bash
# 1. Open dashboard
open https://supabase.com/dashboard/project/pjoijeligrgttimkqftk/settings/api

# 2. Copy anon key + service_role key
# 3. Paste into /apps/website/.env.local
# 4. Test connection:
cd /Users/mac/Desktop/AMD_Control_Center/apps/website
node --env-file=.env.local test-supabase-connection.mjs
```

#### **2. Little Drop E-Book Assets** ⏳
**Status:** 2/5 incomplete (PDF + Book Cover missing)  
**File:** `/whatsapp_empire/ASSETS_CHECKLIST.md`  
**Time:** 2 hours  
**Action:**
```bash
# Task A: Convert Markdown to PDF
cd /Users/mac/Desktop/AMD_Control_Center/whatsapp_empire
pandoc LITTLE_DROP_EBOOK.md -o LITTLE_DROP_EBOOK.pdf --pdf-engine=xelatex --toc

# Task B: Design book cover
# Option 1: Canva.com (free template)
# Option 2: Fiverr ($15-30, 24-hour delivery)
# Specs: 1600×2560px, JPEG/PNG, "LITTLE DROP 💧 MIGHTY OCEAN"
```

#### **3. Ghost Writer Pro - Final Deploy Test** ⏳
**Status:** Code complete, Selenium selectors need verification  
**File:** `README.md` (Project 0 section)  
**Time:** 30 minutes  
**Action:**
```bash
# 1. Inspect Leke Leke HTML to update selectors
# 2. Test Telegram approval workflow end-to-end
# 3. Verify posting to Leke Leke works in production
```

### **🟡 MEDIUM PRIORITY (This Month)**

#### **4. Signal Beacon - GA4 Conversion Goals** ⏳
**File:** `/apps/amd-signal-beacon/README.md` (line 125)  
**Time:** 15 minutes  
**What:** Mark `cta_click`, `video_click`, `scroll_depth_100` as conversions in GA4

#### **5. Signal Beacon - Video Testimonials** ⏳
**File:** `/apps/amd-signal-beacon/VIDEO_TESTIMONIALS_PLAN.md`  
**Time:** 4 weeks  
**What:** Contact 3 clients, record 60-sec testimonials, embed on homepage

#### **6. Search Console Integration** ⏳
**Time:** 10 minutes  
**What:** Link Google Search Console to GA4 for organic search insights

---

## 🧠 SYSTEM MEMORY (WHAT YOU MUST KNOW)

### **Recent Achievements (Feb 13-14, 2026):**
1. ✅ Deployed AMD Intelligence Core to Signal Beacon (24-project knowledge base)
2. ✅ Configured Google Analytics 4 (live tracking 15 users, 90 events/week)
3. ✅ Added lazy loading optimization (50+ images)
4. ✅ Deployed Ghost Writer Pro to Railway (2 services)
5. ✅ Updated README with verified live metrics

### **Active Revenue Streams:**
- Client projects: ₦2.5B+ generated for clients
- Signal Beacon Premium Tier: Planning $9/month (not launched yet)
- WhatsApp Bot services: Development phase
- Ghost Writer automation: Growth tool (indirect revenue)

### **Key Performance Indicators:**
- **Signal Beacon Traffic:** 15 users/week (industry average, target: 4x growth)
- **Geographic:** Nigeria 53%, USA 40%, China 7%
- **Traffic Source:** Direct 89% (need SEO/social diversification)
- **Leke Leke Followers:** 24 (goal: 10,000+ in 5 weeks)

### **Critical Constraints:**
1. **OpenAI Credits:** $16 balance (monitor usage, refill at $5)
2. **Facebook Token:** Expires every 60 days (refresh via tools/meta_token_exchanger.py)
3. **Leke Leke Rate Limits:** Max 20 actions/hour
4. **Railway Free Tier:** Monitor service uptime and usage

---

## 🎯 AGENT WORKFLOW (HOW TO WORK EFFECTIVELY)

### **Rule #1: VERIFY BEFORE RECOMMENDING**
**Anti-Pattern:** "We should add Google Analytics"  
**Correct Pattern:**
```bash
# 1. Search for existing implementation
grep -r "GA_MEASUREMENT_ID" apps/
# 2. Check README for mentions
rg "Google Analytics" README.md
# 3. Only if not found, recommend implementation
```

### **Rule #2: UPDATE README IMMEDIATELY**
After completing ANY task:
```bash
# 1. Update project README with new status
# 2. Update INCOMPLETE_WORK.md (remove completed items)
# 3. Commit with descriptive message
git add . && git commit -m "feat: [what you did]" && git push
```

### **Rule #3: DOCUMENT ALL APIS & CONFIGS**
When adding new service:
```bash
# 1. Add to .env.local
# 2. Add to .env.local.example with documentation comment
# 3. Update this WORKSPACE_ONBOARDING.md (Environment Variables section)
# 4. Add to INCOMPLETE_WORK.md if setup is partial
```

### **Rule #4: CHECK INCOMPLETE_WORK.md FIRST**
Before starting new features:
```bash
# 1. Read INCOMPLETE_WORK.md
# 2. Prioritize finishing HIGH priority incomplete tasks
# 3. Only start new work if user explicitly requests it
```

### **Rule #5: USE PROJECT-SPECIFIC READMES**
Each project has detailed README:
- `/apps/website/README.md` - Main website docs
- `/apps/amd-signal-beacon/README.md` - Signal Beacon comprehensive guide
- Root `README.md` - Executive summary of ALL projects

When working on Signal Beacon, read Signal Beacon README.  
When working on Ghost Writer, read main README Project 0 section.

---

## 📚 DOCUMENTATION HIERARCHY

```
Level 1: WORKSPACE_ONBOARDING.md (this file)
         ↓ [10 min read - orientation]
         
Level 2: README.md (root)
         ↓ [30 min read - all 25+ projects summary]
         
Level 3: INCOMPLETE_WORK.md
         ↓ [5 min read - current priorities]
         
Level 4: Project-specific READMEs
         ↓ [10-20 min each - deep dive]
         - apps/amd-signal-beacon/README.md (live metrics, features)
         - apps/website/README.md (architecture, deployment)
         
Level 5: Implementation Plans
         ↓ [Task-specific guides]
         - VIDEO_TESTIMONIALS_PLAN.md
         - SUPABASE_API_KEYS_NEEDED.md
         - ASSETS_CHECKLIST.md
```

---

## 🚨 COMMON PITFALLS (AVOID THESE)

### ❌ **Pitfall 1: Assuming Features Don't Exist**
**Example:** Recommending "We should add Google Analytics" without checking `.env` files  
**Solution:** Always `grep -r "GA_MEASUREMENT"` or search README first

### ❌ **Pitfall 2: Creating Duplicate Documentation**
**Example:** Creating `NEW_ANALYTICS_PLAN.md` when README already has analytics section  
**Solution:** Update existing docs, don't create new files unless truly needed

### ❌ **Pitfall 3: Partial Environment Setup**
**Example:** Adding API key to `.env.local` but not to `.env.local.example`  
**Solution:** Always update both + document in WORKSPACE_ONBOARDING.md

### ❌ **Pitfall 4: Not Testing After Config Changes**
**Example:** Adding Supabase keys but not running `test-supabase-connection.mjs`  
**Solution:** Every config change needs verification test

### ❌ **Pitfall 5: Starting New Work Without Checking Incomplete**
**Example:** Building new feature while Supabase keys are still missing  
**Solution:** INCOMPLETE_WORK.md is priority queue - finish HIGH priority first

---

## ✅ ONBOARDING CHECKLIST

**For New Agents (Complete This in Order):**

- [ ] Read this WORKSPACE_ONBOARDING.md completely (you're here)
- [ ] Read root README.md executive summary (lines 1-150)
- [ ] Read INCOMPLETE_WORK.md (full file)
- [ ] Verify you can access all API keys in `.env` files
- [ ] Open Signal Beacon README (most comprehensive example)
- [ ] Confirm you understand documentation hierarchy
- [ ] Check current date and compare to "Last Updated" dates (context freshness)
- [ ] Ask user: "I've reviewed the workspace. Should I prioritize incomplete work or start new tasks?"

**For Returning Agents:**
- [ ] Check INCOMPLETE_WORK.md for new HIGH priority items
- [ ] Verify API credits haven't expired (OpenAI, Facebook token)
- [ ] Read recent commits: `git log --oneline -10`
- [ ] Continue where previous agent left off

---

## 🎓 KNOWLEDGE BASE (QUICK FACTS)

**AMD Solutions 007 Projects:**
- **24 AI/automation projects** in knowledge base (Naija-Prop-Intel, CBN-Compliance-Copilot, NaijaLaw-GPT, etc.)
- **9 live deployments** (websites, bots, automation systems)
- **3 main web apps** (Main Website, Signal Beacon, WhatsApp Bot)
- **₦2.5M+/month** revenue generation potential
- **CEO availability:** WhatsApp +234 818 002 1007 (business hours Nigerian time)

**Tech Stack Expertise:**
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Python 3.9, Node.js, Express
- **AI:** OpenAI GPT-4o-mini, Google Gemini, Anthropic Claude
- **Automation:** Selenium, Puppeteer, python-telegram-bot
- **Deployment:** Vercel (web apps), Railway (bots), PM2 (legacy)
- **Analytics:** Google Analytics 4, custom localStorage tracking

**Key People & Contacts:**
- **CEO:** Olawale Shoyemi (ceo@amdsolutions007.com, +234 818 002 1007)
- **Telegram Bot:** @AMDSolutions007_bot (CEO control panel)
- **GitHub Org:** [@amdsolutions007](https://github.com/amdsolutions007)

**Critical URLs:**
- **Main Site:** https://amdsolutions007.vercel.app
- **Signal Beacon:** https://amd-signal-beacon.vercel.app
- **Admin Analytics:** https://amd-signal-beacon.vercel.app/admin-analytics (password: amd007)
- **GA4 Dashboard:** https://analytics.google.com/analytics/web/#/a383703211p523704298
- **Supabase Dashboard:** https://supabase.com/dashboard/project/pjoijeligrgttimkqftk

---

## 🔄 MAINTENANCE REMINDERS

### **Monthly Tasks:**
- [ ] Check OpenAI credit balance (minimum $10)
- [ ] Refresh Facebook access token (60-day expiry)
- [ ] Review GA4 metrics (growth tracking)
- [ ] Update README with new deployments

### **Quarterly Tasks:**
- [ ] Audit all API keys (active/expired)
- [ ] Review incomplete work (re-prioritize)
- [ ] Update knowledge base with new projects
- [ ] Backup critical .env files to secure location

---

## 🆘 EMERGENCY CONTACTS

**If Something Breaks:**
1. **Check service status:** [Railway Dashboard](https://railway.app) | [Vercel Dashboard](https://vercel.com/dashboard)
2. **Check API credits:** [OpenAI Usage](https://platform.openai.com/usage)
3. **Contact CEO:** WhatsApp +234 818 002 1007
4. **Review error logs:** `npx -y @railway/cli logs` or Vercel deployment logs

**Common Emergency Scenarios:**
- **AI Assistant down:** Check OpenAI credits & API key validity
- **Telegram bot not responding:** Verify `TELEGRAM_BOT_TOKEN` on Railway
- **Analytics not tracking:** Confirm GA4 script in page source (view-source)
- **Build failures:** Check TypeScript errors with `npm run build`

---

## 🎉 YOU'RE READY!

You now have complete context of AMD Solutions 007 workspace. Next steps:

1. **User asks for new feature?** → Check INCOMPLETE_WORK.md first
2. **Need API key?** → Check .env files + this doc's Environment Variables section
3. **Working on specific project?** → Read that project's README
4. **Unsure about anything?** → Ask user before assuming

**Remember:** We prioritize **completing incomplete work** over starting new features unless user explicitly requests otherwise.

---

**Last Updated:** 14 February 2026  
**Maintained By:** AMD Solutions 007 Team  
**Version:** 1.0.0
