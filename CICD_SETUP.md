# CI/CD Setup Instructions

## 🎯 Zero-Touch Deployment - Configured

### GitHub Actions → Vercel Pipeline
**Status:** ✅ Created  
**Location:** `.github/workflows/deploy.yml`

#### Required GitHub Secrets
To enable automatic deployments, add these secrets to your GitHub repository:

1. Go to: `https://github.com/amdsolutions007/AMD-Control-Center/settings/secrets/actions`
2. Add the following secrets:

| Secret Name | How to Get It |
|------------|---------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Run in terminal: `vercel whoami` or check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Located in `apps/website/.vercel/project.json` after first deploy |

#### Get Your Vercel Credentials

```bash
# 1. Login to Vercel (if not already logged in)
cd /Users/mac/Desktop/AMD_Control_Center/apps/website
vercel login

# 2. Link project to get IDs
vercel link

# 3. View project info
cat .vercel/project.json
```

The output will show:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

#### Workflow Behavior
- **Triggers:** Automatically on every push to `main` branch
- **Also:** Manual trigger via GitHub Actions UI (workflow_dispatch)
- **Steps:**
  1. Checkout code
  2. Install Vercel CLI
  3. Pull environment configuration
  4. Build Next.js app
  5. Deploy to production

---

## 🤖 PM2 Process Management
**Status:** ✅ Created  
**Location:** `ecosystem.config.js`

### Configured Automation Scripts (16 processes)

#### Core Revenue Engine
- `revenue-machine` - Main revenue generation system

#### Social Media Automation  
- `social-publisher` - Scheduled posts (9 AM & 9 PM daily)
- `creative-engine` - Video content generation
- `content-manager` - Content pipeline orchestration

#### Upload Automation
- `amd-uploader` - Standard video uploader
- `amd-pro-uploader` - Pro-tier upload system

#### Video Production Pipeline
- `viral-editor` - Viral content editor
- `stitcher` - Video stitching automation

#### Meta/Facebook Advertising
- `facebook-poster` - Facebook auto-poster
- `meta-campaign` - Campaign launcher

#### WhatsApp Automation
- `whatsapp-bot` - Client communication bot

#### Lead Generation Engine
- `lead-scraper` - Daily lead scraping (10 AM)
- `lead-outreach` - Automated outreach (11 AM)

#### Dashboard & Monitoring
- `amd-dashboard` - Central monitoring dashboard

### PM2 Commands

```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Start all processes
pm2 start ecosystem.config.js

# Start specific process
pm2 start ecosystem.config.js --only revenue-machine

# Monitor all processes
pm2 monit

# View logs
pm2 logs
pm2 logs revenue-machine --lines 100

# View status
pm2 status

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Save process list (persist across reboots)
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Log Management
All logs are stored in `/Users/mac/Desktop/AMD_Control_Center/logs/`
- Each process has separate error and output logs
- Automatic log rotation recommended via PM2 module:
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  ```

---

## 🚀 Activation Checklist

### For GitHub Actions (Zero-Touch Deployment)
- [ ] Add `VERCEL_TOKEN` to GitHub Secrets
- [ ] Add `VERCEL_ORG_ID` to GitHub Secrets  
- [ ] Add `VERCEL_PROJECT_ID` to GitHub Secrets
- [ ] Push to `main` branch to trigger first automated deployment
- [ ] Verify deployment in GitHub Actions tab

### For PM2 (Server Automation)
- [ ] Install PM2: `npm install -g pm2`
- [ ] Create logs directory: `mkdir -p logs`
- [ ] Test single process: `pm2 start ecosystem.config.js --only revenue-machine`
- [ ] Start all processes: `pm2 start ecosystem.config.js`
- [ ] Save configuration: `pm2 save`
- [ ] Setup auto-restart on reboot: `pm2 startup`

---

## 📊 Monitoring & Maintenance

### GitHub Actions
- View workflow runs: https://github.com/amdsolutions007/AMD-Control-Center/actions
- Monitor deployment status in real-time
- Check build logs for errors

### PM2 Dashboard
```bash
# Real-time monitoring
pm2 monit

# Web dashboard (optional)
pm2 plus
```

### Troubleshooting
- **Deployment fails:** Check GitHub Secrets are correct
- **Build errors:** Verify `apps/website/.env.local` has all required variables
- **PM2 process crashes:** Check logs with `pm2 logs <process-name>`
- **Memory issues:** Adjust `max_memory_restart` in ecosystem.config.js

---

## ✅ Next Steps
1. Add GitHub Secrets for Vercel deployment
2. Push code to trigger first automated deployment  
3. Install PM2 and test process management
4. Monitor systems and adjust configurations as needed

**Status:** Phase 2 (CI/CD + Automation) infrastructure complete. Ready for activation.
