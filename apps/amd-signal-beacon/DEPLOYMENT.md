# 🚀 AMD SIGNAL BEACON PRO - DEPLOYMENT GUIDE

## 📦 INSTALLATION & SETUP

### Step 1: Install Dependencies
```bash
cd /Users/mac/Desktop/AMD_Control_Center/apps/amd-signal-beacon
npm install
```

### Step 2: Test Locally
```bash
npm run dev
```
Visit: http://localhost:3005
Test RSS Feed: http://localhost:3005/api/feed

---

## 🌐 VERCEL DEPLOYMENT

### Option A: CLI Deployment (Recommended)
```bash
cd /Users/mac/Desktop/AMD_Control_Center/apps/amd-signal-beacon

# First deployment
vercel

# Production deployment
vercel --prod
```

### Option B: GitHub Integration
1. Push to GitHub:
```bash
git add .
git commit -m "Add AMD Signal Beacon Pro - RSS Content Engine"
git push origin main
```

2. Import in Vercel Dashboard:
   - Go to vercel.com/new
   - Select your repository
   - Set root directory: `apps/amd-signal-beacon`
   - Deploy

---

## 🔗 LEKE LEKE INTEGRATION

### Step 1: Get Your RSS Feed URL
After deployment, your RSS feed will be at:
```
https://your-project.vercel.app/api/feed
```

### Step 2: Add to Leke Leke
1. Go to Leke Leke → Settings → Auto-Import Feeds
2. Click "+ Add Feed"
3. Paste your RSS URL
4. Set sync frequency: **Every 2h**
5. Click "Save"

### Step 3: Verify
- Posts will start appearing in your profile feed
- Each post will have the branded footer driving traffic to your group
- Time-gated posts will only appear when their `publishTime` has passed

---

## 📝 CONTENT MANAGEMENT

### Adding New Posts
Edit `data/posts.json`:

```json
{
  "id": "unique-post-id",
  "title": "Your Post Title",
  "content": "Your content here...",
  "publishTime": "2026-02-06T08:00:00Z",
  "tags": ["Lagos", "Startups"],
  "hook": "🚀 SHIPPING:",
  "footerType": "state"
}
```

### Footer Types
- `default` - Standard group join CTA
- `state` - State-specific CTA (auto-fills {{STATE}})
- `urgent` - FOMO-driven CTA
- `ama` - AMA/discussion CTA

### Custom Hooks
Edit `data/hooks.json` to add more viral prefixes.

### Deploy Updates
```bash
git add data/posts.json
git commit -m "Add week 2 content"
git push origin main
```
Vercel auto-deploys on push.

---

## 🎯 CONTENT STRATEGY

### Posting Schedule
- **08:00 WAT**: Motivation / Industry insights
- **13:00 WAT**: State spotlight / Community engagement
- **20:00 WAT**: Reflection / Technical discussions

### State Spotlight Rotation (37 Posts)
Week 1: Lagos, Abuja, Kano
Week 2: Rivers, Kaduna, Oyo
Week 3: Delta, Imo, Ogun
(Continue for all 36 states + FCT)

### Content Mix
- 40% Original insights (your thoughts)
- 30% State spotlights (community building)
- 20% Questions/engagement (polls, challenges)
- 10% Resources/tools (developer value)

---

## 📊 MONITORING

### RSS Feed Health Check
```bash
curl https://your-project.vercel.app/api/feed
```

### Check Active Posts
Response headers show:
- `X-Total-Posts`: Number of published posts
- `X-Generated-At`: Last generation timestamp

### Analytics
Monitor in Vercel Dashboard:
- Function invocations (RSS feed requests)
- Response times
- Error rates

---

## 🔧 TROUBLESHOOTING

### No Posts Showing
- Check `publishTime` is in the past
- Verify JSON format is valid
- Check Vercel deployment logs

### Leke Leke Not Syncing
- Verify RSS URL is correct
- Check feed is valid XML (test in browser)
- Confirm sync frequency settings

### Footer Not Replacing {{STATE}}
- Ensure post has state tag in `tags` array
- State must be capitalized: "Lagos" not "lagos"
- Footer type must be "state"

---

## 🚀 SCALING TIPS

### Weekly Content Batch
Create 21 posts every Sunday (7 days × 3/day)

### A/B Test Hooks
Track which hooks get most engagement on Leke Leke

### Automate State Content
Use your existing state landing pages to generate state spotlight posts

### Cross-Platform Sync
Pull your LinkedIn/Twitter posts and auto-convert to RSS format

---

## 🎖️ SUCCESS METRICS

Week 1: 100+ group members
Week 2: 250+ group members
Week 4: 500+ group members
Month 2: 1,500+ group members
Month 3: 5,000+ group members

Target: 20% daily active rate (10x platform average)

---

Built by AMD Solutions 🌍💻
**Illuminating the Digital Dark**
