# 🚂 RAILWAY DEPLOYMENT GUIDE - AMD Control Center

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Infrastructure Confirmed
- **Railway Project:** AMD-WhatsApp-Empire
- **Region:** EU West (Amsterdam)
- **Resources:** 8 vCPU, 8GB RAM
- **Current Status:** Ready for new service deployment

### 📦 Configuration Files Created
- ✅ `railway.json` - Railway build configuration
- ✅ `ecosystem.railway.js` - PM2 process manager (WhatsApp disabled)
- ✅ `requirements.txt` - Python dependencies

---

## 🚀 DEPLOYMENT STEPS

### **Option A: Deploy via Railway Dashboard (Recommended)**

#### 1. Access Your Railway Project
1. Go to https://railway.app/dashboard
2. Select project: **"AMD-WhatsApp-Empire"**
3. Click **"+ New Service"** button

#### 2. Connect GitHub Repository
1. Choose **"Deploy from GitHub repo"**
2. Select: **`amdsolutions007/AMD-Control-Center`**
3. Click **"Deploy"**

#### 3. Configure Environment Variables
Add these in Railway Dashboard → Service → Variables:

```bash
# Python Configuration
PYTHONUNBUFFERED=1
NODE_ENV=production
TZ=Europe/Amsterdam

# Google API Credentials (Required for YouTube, Ads)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Facebook/Meta API (Required for social posting)
FACEBOOK_ACCESS_TOKEN=your_token
FACEBOOK_PAGE_ID=your_page_id

# OpenAI API (Required for creative engine)
OPENAI_API_KEY=sk-your-key

# Optional: Monitoring & Notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

#### 4. Verify Build Configuration
Railway will automatically detect `railway.json` and:
- Install Python dependencies: `pip install -r requirements.txt`
- Install PM2: `npm install -g pm2`
- Start processes: `pm2-runtime start ecosystem.railway.js`

#### 5. Monitor Deployment
1. Watch the **Build Logs** tab
2. Once deployed, check **Deployment Logs**
3. Verify all processes started: `social-publisher`, `lead-scraper`, etc.

#### 6. Verify Services Running
Expected PM2 processes:
- ✅ `social-publisher` (Social Broadcast Engine)
- ✅ `creative-engine` (Content Generation)
- ✅ `content-manager` (Content Scheduling)
- ✅ `lead-scraper` (Lead Generation)
- ✅ `lead-outreach` (Lead Outreach)
- ✅ `facebook-poster` (Facebook Automation)
- ✅ `amd-dashboard` (Monitoring Dashboard)

---

### **Option B: Deploy via Railway CLI**

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login to Railway
```bash
railway login
```

#### 3. Link to Existing Project
```bash
cd /Users/mac/Desktop/AMD_Control_Center
railway link
# Select: AMD-WhatsApp-Empire
```

#### 4. Deploy
```bash
railway up
```

#### 5. Check Status
```bash
railway status
railway logs
```

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Set Up Custom Domain (Optional)
1. In Railway Dashboard → Service → Settings
2. Click **"Generate Domain"** or add custom domain
3. Access dashboard at: `https://your-service.up.railway.app`

### Configure Scheduled Tasks
PM2 cron jobs are configured in `ecosystem.railway.js`:
- **Social Publisher:** 9 AM & 9 PM daily
- **Lead Scraper:** 10 AM daily
- **Lead Outreach:** 11 AM daily

### Monitor Resource Usage
```bash
railway logs --service amd-control-center
```

Or view in Dashboard:
- **Metrics** tab shows CPU, Memory, Network usage
- **Logs** tab shows real-time application logs

---

## 📊 DEPLOYED SERVICES

| Service | Purpose | Memory Limit | Schedule |
|---------|---------|--------------|----------|
| social-publisher | Social media automation | 1GB | 9 AM, 9 PM |
| creative-engine | AI content generation | 2GB | On-demand |
| content-manager | Content scheduling | 500MB | Continuous |
| lead-scraper | Lead generation | 500MB | 10 AM daily |
| lead-outreach | Email/outreach automation | 500MB | 11 AM daily |
| facebook-poster | Facebook posting | 1GB | On-demand |
| amd-dashboard | Monitoring dashboard | 300MB | Continuous |

**Total Expected Memory Usage:** ~5.8GB (within 8GB limit)

---

## ⚠️ SERVICES NOT DEPLOYED (Local Only)

### WhatsApp Bot
**Status:** DISABLED in Railway config

**Reason:** 
- Requires QR code scanning for authentication
- Needs persistent browser session
- Better suited for local VPS deployment

**Alternative:** Deploy WhatsApp bot separately on local machine or dedicated VPS

---

## 🔍 TROUBLESHOOTING

### Build Fails
```bash
# Check Railway logs
railway logs --build

# Common issues:
# 1. Missing environment variables
# 2. Python version mismatch (ensure Python 3.12+)
# 3. Missing dependencies in requirements.txt
```

### Service Crashes
```bash
# Check service logs
railway logs --service amd-control-center

# PM2 will auto-restart on failure
# Max 10 retries configured
```

### Check PM2 Process Status
Railway runs `pm2-runtime` which shows all process statuses in logs.

---

## 📞 SUPPORT & MONITORING

### Real-Time Monitoring
- **Railway Dashboard:** https://railway.app/project/[your-project-id]
- **PM2 Logs:** Available in Railway Logs tab
- **Telegram Alerts:** Configure TELEGRAM_BOT_TOKEN for notifications

### Health Checks
Dashboard exposes endpoints (configure in Railway):
```
Health: GET /health
Status: GET /status
Metrics: GET /metrics
```

---

## 🎯 NEXT STEPS

1. ✅ Deploy to Railway using Option A (Dashboard)
2. ⚙️ Configure environment variables
3. 📊 Monitor first 24 hours of operation
4. 🔄 Set up automated backups for logs
5. 📈 Scale resources if needed (Railway allows easy scaling)

---

## 🚨 SAFETY LOCKS ENABLED

- ✅ WhatsApp bot DISABLED (prevents accidental cloud deployment)
- ✅ Local file paths replaced with Railway-compatible paths
- ✅ Log files redirected to `/tmp` (Railway ephemeral storage)
- ✅ Timezone set to Amsterdam (matching Railway region)
- ✅ Auto-restart enabled for all services
- ✅ Memory limits configured to prevent crashes

---

**Deployment Ready** ✨

Push this configuration to GitHub, then deploy via Railway Dashboard.
