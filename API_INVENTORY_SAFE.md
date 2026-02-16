# 📊 AMD SOLUTIONS - API INVENTORY GUIDE

**Last Updated:** February 16, 2026  
**Location:** This file is LOCAL ONLY (not committed to git for security)  

---

## ⚠️ IMPORTANT: ACTUAL CREDENTIALS

**Full API keys and credentials are stored in:**

1. **Primary Source:** `/Users/mac/Desktop/AMD_Control_Center/.env`
2. **Signal Beacon:** `/apps/amd-signal-beacon/.env.local`
3. **Main Website:** `/apps/website/.env.local`
4. **WhatsApp Empire:** `/whatsapp_empire/.env`
5. **Railway Dashboard:** https://railway.com/project/04114a84-a0a4-463f-ae22-94c442e4c36b (Variables tab)

**Access Method:**
```bash
# View all credentials
cat /Users/mac/Desktop/AMD_Control_Center/.env

# Search for specific API
grep "OPENAI" /Users/mac/Desktop/AMD_Control_Center/.env
```

---

## 🔑 API SERVICES INVENTORY (18 Total)

### **AI & ML (3)**
1. ✅ OpenAI GPT ($16 balance) - Signal Beacon AI Assistant, content generation
2. ✅ Google Gemini AI - Graphics, transcription, alt to OpenAI
3. ⚠️ Anthropic Claude - Mentioned in docs but not found in .env

### **Communication (2)**
4. ✅ Telegram Bot (@AMDSolutions007_bot) - Ghost Writer Pro approval
5. ⏳ WhatsApp Business API - Pending setup

### **Social Media (5)**
6. ✅ Twitter/X API - Automated posting
7. ✅ Facebook/Meta API - Page posting, ads (expires every 60 days)
8. ✅ LinkedIn API - Professional posting, lead gen
9. ✅ Pinterest API - Pin automation
10. ⏳ Snapchat Marketing API - Configured in website .env.local

### **Payments (3)**
11. ✅ PayPal (Live) - Payment processing
12. ✅ Paystack (Nigeria) - Local payments
13. ✅ Snapchat Ads API - Ad campaigns

### **Database & Backend (2)**
14. ⚠️ Supabase - Keys incomplete (see SUPABASE_API_KEYS_NEEDED.md)
15. ✅ Vercel Token - Automated deployments

### **Other (3)**
16. ✅ Leke Leke Credentials - Nigerian tech platform (Ghost Writer)
17. ✅ Railway CLI - Authenticated as ceo@amdsolutions007.com
18. ✅ Google Analytics 4 (G-246XMJQERK) - 15 users/week, Nigeria 53%

---

## 📂 README FILES (14 Total)

1. `/README.md` - Master index (all projects)
2. `/apps/amd-signal-beacon/README.md` - Most comprehensive docs
3. `/apps/website/README.md` - Main website
4. `/amd-whatsapp-bot/README.md` - WhatsApp bot
5. `/whatsapp_empire/README.md` - Business assets
6. `/social_engine/README.md` - Social automation
7. `/lead_engine/README.md` - Lead generation
8. `/client_bot/README.md` - Client bot
9. `/google_setup_profile/README.md` - Google ecosystem
10. `/REVENUE_PACKAGE/README.md` - Revenue systems
11. `/apps/website/src/scripts/ad-engine/README.md` - Ad engine
12. `/apps/website/public/README.md` - Public assets
13. `/amdsolutions007.github.io/README.md` - GitHub Pages
14. `/.tmp_amd_whatsapp_bot_deploy/README.md` - Temp deployment

---

## ✅ QUICK ACCESS

**View All APIs:**
```bash
# Main .env with 18 services
cat ~/./../Desktop/AMD_Control_Center/.env
```

**Test Key APIs:**
```bash
# OpenAI
curl -s https://api.openai.com/v1/models -H "Authorization: Bearer $(grep OPENAI_API_KEY .env | cut -d= -f2)" | head -20

# Telegram
curl "https://api.telegram.org/bot$(grep TELEGRAM_BOT_TOKEN .env | cut -d= -f2 | head -1)/getMe"

# Railway
npx -y @railway/cli whoami
```

**Missing/Incomplete:**
1. Supabase ANON_KEY + SERVICE_ROLE_KEY (see /apps/website/SUPABASE_API_KEYS_NEEDED.md)
2. WhatsApp Business API (not set up)
3. Anthropic Claude (mentioned but not in .env)

---

## 🚀 RECOMMENDATION: FIX RAILWAY FIRST

Based on user screenshots showing Railway dashboard with telegram-approval-bot "Online" but not responding:

**IMMEDIATE ACTION:**
1. Open Railway: https://railway.com/project/04114a84-a0a4-463f-ae22-94c442e4c36b
2. Click `telegram-approval-bot` service
3. Click `Deployments` tab → View logs
4. Click ⚙️ `Settings` → Restart service
5. Test: Send `/start` to @AMDSolutions007_bot

**THEN SAVE TOOLS:**
After bot is working, update this guide with any new findings.

---

**Note:** This file contains no actual secrets - all real credentials are in local .env files only.
