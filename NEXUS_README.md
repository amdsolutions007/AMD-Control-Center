# 🤖 AMD NEXUS - AUTONOMOUS BUSINESS ENGINE

## MISSION BRIEFING

AMD NEXUS keeps your business alive on full autopilot while you handle family matters. It generates content, engages leads, and alerts you only when money is ready to be collected.

---

## WHAT IT DOES (DAILY)

### 1. **CONTENT ENGINE** (10:00 AM WAT)
- Generates fresh AI content using your company voice
- Posts to LinkedIn (automated)
- Posts to X/Twitter (automated)
- Sends Telegram broadcast (automated)
- Saves Facebook/Instagram/TikTok posts for manual copy-paste
- Creates video scripts for YouTube Shorts/Snapchat

### 2. **AUTO-RESPONDER** (24/7)
- Monitors Gmail Scout Sniper for new leads
- AI analyzes lead quality (SPAM / LOW / MEDIUM / HIGH)
- **SPAM**: Ignores automatically
- **LOW**: Sends polite "check our website" auto-reply
- **MEDIUM**: Drafts qualifying response (saved for review)
- **HIGH**: Drafts full proposal + alerts CEO via Telegram 🚨

### 3. **DAILY CEO REPORT**
- Summary of all activities
- Manual post files ready to copy-paste
- Hot leads requiring immediate attention

---

## QUICK START (5 MINUTES)

### Step 1: Install Dependencies
```bash
cd ~/Desktop/AMD_Control_Center
pip3 install -r requirements-nexus.txt
```

### Step 2: Set Environment Variables (Already Done in Railway)
```bash
# Required (Already configured)
export OPENAI_API_KEY="sk-proj-..."
export TELEGRAM_BOT_TOKEN="8599161577:..."
export TELEGRAM_CHAT_ID="-1003663009693"

# Optional (For automated posting)
export LINKEDIN_ACCESS_TOKEN="your_token"
export LINKEDIN_PERSON_URN="your_urn"
export TWITTER_API_KEY="your_key"
export TWITTER_API_SECRET="your_secret"
export TWITTER_ACCESS_TOKEN="your_token"
export TWITTER_ACCESS_SECRET="your_secret"
```

### Step 3: Test Run (Manual)
```bash
python3 amd_nexus.py
```

Expected output:
- ✅ AI content generated
- ✅ Posts published (if APIs configured)
- ✅ Manual posts saved to `nexus_output/`
- ✅ Leads processed
- ✅ CEO report sent to Telegram

### Step 4: Schedule Daily Automation
```bash
# Option A: Using cron (macOS/Linux)
crontab -e

# Add this line (runs daily at 10:00 AM)
0 10 * * * cd /Users/mac/Desktop/AMD_Control_Center && /usr/local/bin/python3 amd_nexus.py >> logs/nexus.log 2>&1

# Option B: Using Railway (Add to ecosystem.config.js)
# See instructions below
```

---

## RAILWAY DEPLOYMENT

### Update ecosystem.config.js
Add this to your Railway PM2 configuration:

```javascript
{
  name: "amd-nexus",
  script: "amd_nexus.py",
  interpreter: "python3",
  cron_restart: "0 10 * * *",  // Daily at 10:00 AM
  autorestart: false,
  watch: false,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    LINKEDIN_ACCESS_TOKEN: process.env.LINKEDIN_ACCESS_TOKEN || "",
    LINKEDIN_PERSON_URN: process.env.LINKEDIN_PERSON_URN || "",
    TWITTER_API_KEY: process.env.TWITTER_API_KEY || "",
    TWITTER_API_SECRET: process.env.TWITTER_API_SECRET || "",
    TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN || "",
    TWITTER_ACCESS_SECRET: process.env.TWITTER_ACCESS_SECRET || ""
  }
}
```

Then deploy:
```bash
git add .
git commit -m "Add AMD NEXUS - Autopilot System"
git push origin main
```

---

## HOW IT WORKS

### Content Generation Flow
```
OpenAI GPT-4 
  ↓
Company Profile + Today's Date
  ↓
Generates 5 unique pieces:
  - LinkedIn post (250-350 words, professional)
  - X/Twitter thread (3 tweets)
  - Telegram broadcast (150-200 words, personal)
  - Video script (15-30 seconds, text-on-screen)
  - Facebook/Instagram/TikTok caption
  ↓
Posts to APIs (LinkedIn, X, Telegram)
  ↓
Saves manual posts to nexus_output/ folder
```

### Auto-Responder Flow
```
Gmail Scout Sniper detects new lead
  ↓
Lead data → OpenAI Analysis
  ↓
Quality Assessment:
  ├─ SPAM (0-29) → Ignore
  ├─ LOW (30-49) → Auto-reply template
  ├─ MEDIUM (50-79) → Draft qualifying response
  └─ HIGH (80-100) → Draft full proposal + Alert CEO
  ↓
Update database + Send Telegram notification
```

---

## COMPANY VOICE TRAINING

The AI is trained on your company profile:

**Identity:**
- Name: AMD Solutions 007
- CEO: Olawale Ahmed Shoyemi ("Solutions")
- Founded: 2011 (as AMD Media Office)
- Mission: "Bringing Light to Every Dark Issue"

**Tone:**
- Professional, Visionary, Confident
- 007-style intelligence meets Nigerian excellence
- Data-driven, results-focused
- Not salesy (provides value first)

**Services:**
- AI Automation (WhatsApp Chatbots)
- Custom Software Development
- High-Performance Websites & Apps
- Digital Marketing & Targeted Ads
- Business Intelligence

**Achievements:**
- 19+ projects across 6 sectors
- ₦2.5B+ generated for clients
- 3 Pharmacy Systems, 5 Restaurant POS, 4 School Platforms

---

## DAILY WORKFLOW

### Morning (10:00 AM - Automated)
1. AI generates fresh content
2. Posts to LinkedIn, X, Telegram
3. Saves manual posts to `nexus_output/`
4. Processes overnight leads
5. Sends CEO report via Telegram

### Your Action (5 minutes)
1. Open Telegram → Read daily report
2. Go to `nexus_output/` → Copy manual posts
3. Paste to Facebook/Instagram/TikTok
4. Check Railway dashboard for hot leads
5. Respond to high-value leads (if any)

### Evening (Optional)
- Review lead proposals in database
- Approve/edit AI drafts before sending
- Book discovery calls with interested clients

---

## OUTPUT EXAMPLES

### LinkedIn Post Sample
```
The biggest mistake Nigerian businesses make with AI?

They think it's too expensive.

Here's the reality:

NOT automating costs you MORE.

A Lagos e-commerce company came to us last year:
- 5 staff manually processing orders
- 200+ orders/day
- 30% error rate (wrong addresses, duplicate charges)
- Customer complaints through the roof

We built them an AI order processor. Cost: ₦1.2M

Results (6 months):
- 2 staff reassigned to growth roles
- 1,000+ orders/day processed
- 0.3% error rate (99.7% accuracy)
- ₦180M revenue increase

ROI: 150x

The lesson?

AI isn't an expense. It's the cheapest employee you'll ever hire.

Need help with automation? Let's talk: +234 818 002 1007

---
Olawale Shoyemi | AMD Solutions 007

#NigerianTech #AIforBusiness #DigitalTransformation #Lagos #SMEs
```

### X/Twitter Thread Sample
```
[TWEET 1]
80% of Nigerian businesses still use pen & paper for inventory.

In 2026.

🤯

Here's what they're losing daily:

[TWEET 2]
Without automation:
• 2 hours lost to manual entry
• ₦50K in errors per month
• Missed sales (stockouts)
• Staff burnout

With AI:
• Real-time updates
• Zero errors
• Automated reordering
• Happy staff 😊

[TWEET 3]
We've automated 19 Nigerian businesses.

From ₦30K/month to ₦2.5M one-time.

DM for free audit or WhatsApp: +234 818 002 1007

Let's automate your business too. 🚀

#NigerianTech #AIforBusiness #Automation
```

### Telegram Broadcast Sample
```
Good morning! Quick insight:

Yesterday, I met a restaurant owner who told me:

"We lose ₦200K every month because waiters forget orders."

200,000 Naira. Every month. For 3 years.

That's ₦7.2M in lost revenue.

We built them a simple POS system. Cost: ₦500K.

Now?
- Orders go straight to kitchen (no forgetting)
- Bills are 100% accurate
- Customer complaints dropped 90%

ROI in 3 months.

If you're losing money to manual processes, let's talk.

Questions? Hit reply or call: +234 818 002 1007

---
Olawale Shoyemi
CEO, AMD Solutions 007
```

---

## TELEGRAM ALERTS YOU'LL RECEIVE

### Daily Report (Every morning)
```
📊 AMD NEXUS DAILY REPORT
Date: January 26, 2026

CONTENT PUBLISHED:
✅ LinkedIn: Posted
✅ X/Twitter: Posted
✅ Telegram: Posted
📁 Manual Posts: Saved to nexus_output/

LEADS PROCESSED:
- 8 new leads analyzed
- 3 spam (ignored)
- 2 low-quality (auto-replied)
- 2 medium (drafts ready)
- 1 HIGH-VALUE (🚨 ACTION REQUIRED)

ACTION REQUIRED:
1. Copy-paste manual posts to Facebook/Instagram/TikTok
2. Review high-value lead proposal (Lead #47)
3. Respond within 2 hours for best conversion

Manual Posts File: nexus_output/manual_posts_20260126_100015.txt

---
AMD NEXUS running on autopilot 🤖
```

### High-Value Lead Alert (When detected)
```
🚨 HIGH-VALUE LEAD DETECTED!

📊 Quality Score: 92/100
🏢 Company: TechCorp Nigeria
📌 Project: E-commerce Platform with AI Recommendations

💰 ACTION REQUIRED:
Proposal drafted and ready to send.

📄 View Lead: Railway Dashboard (Lead #47)
📞 Contact: cto@techcorp.ng

⚡ RESPOND WITHIN 2 HOURS FOR BEST CONVERSION

---
AMD NEXUS Auto-Responder
```

---

## FILE STRUCTURE

```
AMD_Control_Center/
├── amd_nexus.py              # Main autopilot engine
├── requirements-nexus.txt    # Dependencies
├── NEXUS_README.md           # This file
├── nexus_output/             # Manual posts saved here
│   └── manual_posts_YYYYMMDD_HHMMSS.txt
├── lead_engine/
│   ├── gmail_scout_sniper.py # Lead detection (already built)
│   └── data/
│       └── leads.db          # Lead database
└── logs/
    └── nexus.log             # Execution logs
```

---

## TROUBLESHOOTING

### "❌ OPENAI_API_KEY not set"
```bash
# Check if it's set
echo $OPENAI_API_KEY

# If empty, export it
export OPENAI_API_KEY="sk-proj-..."

# Or add to Railway variables
```

### "⚠️ LinkedIn API not configured - Skipping"
This is OK. Manual posting still works. To enable:
1. Get LinkedIn Access Token from https://www.linkedin.com/developers/apps
2. Set `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_PERSON_URN` in Railway

### "No new leads to process"
This is normal if Gmail Scout Sniper hasn't detected leads yet. It runs every 30 seconds on Railway.

### Manual Posts Not Saved
Check `nexus_output/` folder exists:
```bash
mkdir -p ~/Desktop/AMD_Control_Center/nexus_output
```

---

## PROTOCOL 007 COMPLIANCE ✅

- ✅ Uses Official APIs only (no scraping)
- ✅ Respects platform ToS (no spam, rate limits followed)
- ✅ User informed via Telegram (full transparency)
- ✅ Manual approval for Facebook/Instagram/TikTok (no unauthorized posting)
- ✅ AI responses are helpful (not spam)
- ✅ Protects user identity (professional communication always)

---

## ADVANCED: CUSTOMIZATION

### Change Posting Time
Edit cron schedule in Railway or crontab:
```bash
# Currently: 10:00 AM (0 10 * * *)
# Change to 9:00 AM: 0 9 * * *
# Change to 2:00 PM: 0 14 * * *
```

### Adjust AI Tone
Edit `COMPANY_PROFILE` in `amd_nexus.py`:
```python
"tone": "Your preferred tone here"
"philosophy": ["Your philosophy here"]
```

### Change Lead Scoring
Edit `analyze_lead_with_ai()` function:
```python
HIGH QUALITY (90-100 points):
- Add your criteria here
```

---

## SUPPORT

**Created by:** AMD Solutions 007  
**For:** Olawale Ahmed Shoyemi  
**Purpose:** Keep the business alive during family matters  

**Questions?**  
Check Railway logs: `railway logs amd-nexus`  
Or review saved posts: `cat nexus_output/manual_posts_*.txt`

---

## THE BOTTOM LINE

**YOU DO THIS:**
- 5 minutes/day: Copy-paste manual posts
- 10 minutes/day: Review hot leads

**AI DOES THIS:**
- Content generation (30 min/day saved)
- Platform posting (15 min/day saved)
- Lead analysis (60 min/day saved)
- Proposal drafting (90 min/day saved)

**TIME SAVED:** 3+ hours/day  
**REVENUE PROTECTED:** Business stays visible, leads get responses, deals close automatically  

---

🤖 **AMD NEXUS: Your business runs even when you don't.**
