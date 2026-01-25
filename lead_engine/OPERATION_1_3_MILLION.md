# 💰 OPERATION 1.3 MILLION - DEPLOYMENT GUIDE

## 🎯 Mission Objective
Generate 1.3 Million Naira in 14 days through aggressive outbound sales to Nigerian businesses without websites.

---

## 🛠️ Tools Deployed

### 1. **Map Hunter** (`map_hunter.py`)
**Purpose:** Extract Nigerian businesses from Google Maps that have NO website

**Capabilities:**
- ✅ Scrapes 24 high-value search queries (Real Estate, Hotels, Logistics, etc.)
- ✅ Filters for businesses WITHOUT websites (primary target)
- ✅ Extracts: Name, Phone, Address, Rating, Reviews
- ✅ Generates personalized cold messages with OpenAI GPT-4
- ✅ Calculates lead score (0-100) based on establishment level
- ✅ Saves to Railway dashboard SQLite + CSV export

**Target:** 100+ phone numbers in first run

---

### 2. **Nairaland Ghost** (`nairaland_ghost.py`)
**Purpose:** Monitor Nairaland forums for business owners actively seeking developers

**Capabilities:**
- ✅ Stealth mode (uses Google Search to bypass Cloudflare)
- ✅ 10 targeted search patterns ("I need a website", etc.)
- ✅ Filters recent threads (last 7 days)
- ✅ Extracts contact info from thread previews
- ✅ Scores leads (0-100) based on urgency and budget indicators
- ✅ Sends instant Telegram alerts for high-value leads (Score ≥ 50)

**Target:** 20-30 hot leads actively looking for help

---

## 📦 Installation & Setup

### Step 1: Install Dependencies
```bash
cd /Users/mac/Desktop/AMD_Control_Center/lead_engine

# Install Python packages
pip install playwright googlesearch-python

# Install Playwright browsers (required for Map Hunter)
playwright install chromium
```

### Step 2: Verify Environment Variables
```bash
# Check that credentials are set
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID
echo $OPENAI_API_KEY

# All should show values. If not, they're in .env file
cat ../.env | grep -E "TELEGRAM|OPENAI"
```

### Step 3: Test Run (Map Hunter)
```bash
# Test with single search query (faster)
python map_hunter.py

# Expected output:
# 🎯 MAP HUNTER - OPERATION 1.3 MILLION
# ✅ Database initialized
# 🔍 Searching: Real Estate Lekki Lagos
# 📊 Loaded 20 results
# 🎯 NO WEBSITE ✅ [Business Name]
# ✅ Extracted: [Name] | +2348012345678
```

### Step 4: Test Run (Nairaland Ghost)
```bash
python nairaland_ghost.py

# Expected output:
# 👻 NAIRALAND GHOST - STEALTH MONITOR
# ✅ Telegram bot initialized
# 🔍 Searching: site:nairaland.com "I need a website"
# ✅ Found: [Thread Title] (Score: 75/100)
# ✅ Telegram alert sent
```

---

## 🚀 Execution Plan (14-Day Sprint)

### **Day 1: Data Collection (TODAY)**
**Goal:** 100+ phone numbers

**Tasks:**
1. Run Map Hunter (full 24 queries): `python map_hunter.py`
2. Run Nairaland Ghost: `python nairaland_ghost.py`
3. Export leads: Check `lead_engine/data/hot_leads.csv`
4. Upload to Railway dashboard for tracking

**Expected Results:**
- 80-120 Google Maps leads (no website)
- 20-30 Nairaland leads (active seekers)
- Total: **100-150 qualified phone numbers**

---

### **Day 2-3: Outbound Blitz**
**Goal:** Send 150 cold messages (WhatsApp + SMS)

**Message Template (from OpenAI):**
```
Hi [Business Name],

I noticed [Business Name] on Google Maps at [Location]. You have [Rating] 
stars but no website - meaning potential customers can't find you online.

We build "Pay on Delivery" websites for Nigerian businesses. You see the 
finished site FIRST, then pay only if satisfied.

Reply YES to see samples from [Industry] businesses like yours.

- AMD Solutions 007
```

**Tools:**
- Use WhatsApp Web for bulk messaging
- Copy cold_message from CSV directly (already personalized by AI)
- Track responses in Railway dashboard (mark as "contacted")

**Expected Response Rate:** 10-15% (15-20 interested businesses)

---

### **Day 4-7: Discovery Calls & Proposals**
**Goal:** Convert 10 interested leads to paying clients

**Process:**
1. Schedule 15-min WhatsApp calls
2. Show portfolio: https://amdsolutions007.github.io
3. Quote pricing:
   - Landing Page: ₦150,000
   - Business Website: ₦300,000
   - E-commerce: ₦500,000+
4. Close with "Pay 50% now, 50% on delivery" offer

**Expected Conversion:** 50% (10 closed deals from 20 calls)

---

### **Day 8-14: Delivery & Payment**
**Goal:** Deliver 10 websites, collect ₦1.3M+

**Execution:**
- Use Next.js templates (fast deployment)
- Customize per business (logo, colors, content)
- Deploy to Vercel (free hosting included)
- Collect final payment on delivery

**Revenue Calculation:**
- 5 Landing Pages @ ₦150k = ₦750,000
- 3 Business Sites @ ₦300k = ₦900,000  
- 2 E-commerce @ ₦500k = ₦1,000,000
- **Total: ₦2,650,000** (target exceeded)

---

## 📊 Lead Scoring System

### Map Hunter Scores (0-100)
```python
Base: 50 points
+ Rating ≥4.5: +30 points (Premium business)
+ Rating ≥4.0: +20 points (Established)
+ 100+ Reviews: +20 points (Very active)
+ 50+ Reviews: +15 points (Active)

Example:
- 4.7-star hotel with 150 reviews = 100/100 (HOT LEAD)
- 3.8-star shop with 10 reviews = 65/100 (Qualified)
```

### Nairaland Ghost Scores (0-100)
```python
Base: 40 points
+ Urgency words ("ASAP", "urgent"): +20
+ Budget mentioned: +25
+ High-value project (e-commerce, app): +15
+ Lagos location: +10

Example:
- "Urgent: Need e-commerce site, budget ₦500k" = 90/100 (FIRE)
- "Looking for website developer" = 55/100 (Qualified)
```

---

## 📁 Output Files

### **leads.db** (SQLite Database)
**Location:** `lead_engine/data/leads.db`
**Access:** Railway dashboard at https://amd-control-center-production.up.railway.app

**Schema:**
```sql
company_name        TEXT    "ABC Real Estate Ltd"
phone               TEXT    "+2348012345678"
address             TEXT    "123 Lekki Phase 1, Lagos"
rating              REAL    4.5
reviews_count       INT     87
industry            TEXT    "Real Estate"
location            TEXT    "Real Estate Lekki Lagos"
lead_score          INT     85
cold_message        TEXT    "Hi ABC Real Estate..."
source              TEXT    "google_maps_hunter"
status              TEXT    "new"
```

### **hot_leads.csv** (Excel Export)
**Location:** `lead_engine/data/hot_leads.csv`
**Use:** Import to Excel/Google Sheets for bulk messaging

**Columns:**
- Company Name
- Phone Number (WhatsApp ready)
- Address (for personalization)
- Lead Score (priority sorting)
- Cold Message (copy-paste ready)

---

## 🎯 Advanced Features

### OpenAI Cold Message Generator

**Prompt Engineering:**
```python
"Write a 50-word WhatsApp message to {business_name} at {address}.
Mention they have NO WEBSITE (losing customers).
Offer Pay-on-Delivery website service.
Professional, Nigerian business context, no emojis."
```

**Example Output:**
```
Hi Grandview Hotels Ikeja,

I noticed your 4.8-star hotel on Google Maps but no website. 
Travelers searching "Ikeja hotels" can't book you directly. 
We build Pay-on-Delivery websites - you see it first, pay only 
if satisfied. Reply YES for hotel website samples.

- AMD Solutions 007
```

---

## ⚠️ Troubleshooting

### Map Hunter Issues

**Problem:** "Playwright not installed"
```bash
pip install playwright
playwright install chromium
```

**Problem:** "No results found"
- Check internet connection
- Google Maps may be blocking (use VPN or wait 1 hour)
- Reduce MAX_SCROLL_ATTEMPTS to 5

**Problem:** "No phone numbers extracted"
- Phone numbers hidden in "Show more" sections
- Script clicks details panel, wait 2 seconds for full load
- Some businesses don't list phones (expected 70% success rate)

---

### Nairaland Ghost Issues

**Problem:** "googlesearch-python not installed"
```bash
pip install googlesearch-python
```

**Problem:** "No threads found"
- Nairaland activity varies (some days have more posts)
- Try different time of day (evenings busiest)
- Expand date range: Change MAX_AGE_DAYS to 14

**Problem:** "Telegram alerts not sending"
```bash
# Verify credentials
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# Test bot manually
python -c "from telegram import Bot; Bot('YOUR_TOKEN').send_message('YOUR_CHAT_ID', 'Test')"
```

---

## 📱 Telegram Alert Format

### High-Value Nairaland Lead (Score ≥ 50)
```
🔥 **NAIRALAND GHOST ALERT** - URGENT

📋 **Thread:** "Urgent: Need professional website for my law firm"

🔗 **Link:** https://www.nairaland.com/12345678/...

📝 **Preview:**
"I run a law firm in Lekki and need a professional website ASAP. 
Budget is ₦400,000. Contact me on 080..."

📊 **Lead Score:** 85/100

📞 **Contact Found:**
- Phone: +2348012345678
- Email: info@lawfirm.com

⚡ **Action Required:**
1. Open thread and read full post
2. Send cold DM via Nairaland private message
3. Follow up on WhatsApp with portfolio link

💰 **Operation 1.3 MILLION**
```

---

## 🚀 Automation Options

### Option 1: Manual Execution (Day 1)
```bash
# Run both tools
python lead_engine/map_hunter.py
python lead_engine/nairaland_ghost.py

# Export leads
cp lead_engine/data/hot_leads.csv ~/Desktop/
```

### Option 2: Scheduled Cron (Daily Monitoring)
```bash
# Add to crontab
crontab -e

# Run Map Hunter daily at 8 AM
0 8 * * * cd /path/to/AMD_Control_Center && python lead_engine/map_hunter.py

# Run Nairaland Ghost every 6 hours
0 */6 * * * cd /path/to/AMD_Control_Center && python lead_engine/nairaland_ghost.py
```

### Option 3: Railway Deployment (24/7)
**Add to `ecosystem.config.js`:**
```javascript
{
  name: 'map-hunter',
  script: 'lead_engine/map_hunter.py',
  interpreter: 'python3',
  cron_restart: '0 8 * * *'  // Daily at 8 AM
},
{
  name: 'nairaland-ghost',
  script: 'lead_engine/nairaland_ghost.py',
  interpreter: 'python3',
  cron_restart: '0 */6 * * *'  // Every 6 hours
}
```

---

## 📈 Success Metrics (Track in Railway Dashboard)

| KPI | Target | Status |
|-----|--------|--------|
| **Phone Numbers** | 100+ | _Run map_hunter.py_ |
| **Cold Messages Sent** | 150 | _Day 2-3_ |
| **Response Rate** | 10-15% | _Track replies_ |
| **Discovery Calls** | 20 | _Day 4-7_ |
| **Closed Deals** | 10 | _Day 7_ |
| **Revenue** | ₦1.3M | _Day 14_ |

---

## 🏆 Expected Results (First Run)

### Map Hunter (24 Queries × 20 Results Each)
```
Target Queries: 24
Businesses Scraped: ~480
Businesses with NO Website: ~120 (25% conversion)
Phone Numbers Extracted: ~85 (70% success rate)
OpenAI Messages Generated: 85
Database Inserts: 85 new leads
CSV Export: 85 rows ready for outreach
```

### Nairaland Ghost (10 Queries × 5 Results Each)
```
Search Patterns: 10
Threads Found: ~50
Recent Threads (7 days): ~30
High-Value (Score ≥50): ~15
Telegram Alerts Sent: 15
Actionable Leads: 15 (click through to thread for full contact)
```

### Combined First-Day Haul
```
✅ Total Leads: 100
📞 Phone Numbers: 85 (Map Hunter) + 15 (Nairaland) = 100
🎯 Ready for Outreach: 100
💰 Potential Revenue: 10 deals × ₦260k avg = ₦2.6M
```

---

## 💡 Pro Tips

1. **Best Time to Run Map Hunter:** Early morning (7-9 AM) - less competition for Google Maps scraping
2. **Nairaland Peak Hours:** Evenings (6-10 PM) - most active posting time
3. **WhatsApp Strategy:** Send messages between 10 AM - 7 PM (Nigerian business hours)
4. **Follow-Up Formula:** If no response in 48 hours, send gentle reminder
5. **Closing Technique:** Always offer "Pay 50% now, 50% on delivery" (builds trust)

---

## 🎯 Action Plan (Next 2 Hours)

```bash
# 1. Install dependencies (5 min)
pip install playwright googlesearch-python
playwright install chromium

# 2. Run Map Hunter (45 min - includes AI generation)
python lead_engine/map_hunter.py

# 3. Run Nairaland Ghost (20 min)
python lead_engine/nairaland_ghost.py

# 4. Export and review (10 min)
open lead_engine/data/hot_leads.csv

# 5. Start outreach (40 min - first 20 messages)
# Use cold_message column, personalize slightly, send via WhatsApp
```

---

**Status:** 🟢 READY FOR DEPLOYMENT  
**Target:** 💰 ₦1.3 MILLION IN 14 DAYS  
**Tools:** 🎯 MAP HUNTER + 👻 NAIRALAND GHOST  
**Revenue Machine:** ⚡ ACTIVATED  

**This is Solutions 007 grade. Let's hunt.** 🚀
