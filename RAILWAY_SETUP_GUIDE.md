# 🚀 RAILWAY DEPLOYMENT GUIDE - GHOST WRITER PRO

**Current Status:** Variables configured ✅, Code pushed ✅, Services need creation

---

## ⚡ 3-STEP DEPLOYMENT (Railway Dashboard)

### **STEP 1: Create Telegram Bot Service (2 minutes)**

1. Go to Railway: https://railway.app/project/04114a84-a0a4-463f-ae22-94c442e4c36b
2. Click **"New Service"**
3. Select **"Deploy from GitHub repo"**
4. Select repository: `AMD-Control-Center`
5. **Service Settings:**
   - Click ⚙️ Settings
   - **Service Name:** `ghostwriter-telegram-bot`
   - **Root Directory:** `/` (leave default)
   - **Builder:** Docker
   - **Dockerfile Path:** `Dockerfile.telegram`
6. Click **"Deploy"**

**Wait for deployment** (1-2 minutes)

**Verify in Logs:**
```
🤖 Telegram Approval Bot is LIVE!
📱 CEO Telegram ID: 8013249849
✅ Ready to receive commands
```

---

### **STEP 2: Create Ghost Writer Service (2 minutes)**

1. In same Railway project, click **"New Service"** again
2. Select **"Deploy from GitHub repo"**
3. Select repository: `AMD-Control-Center`
4. **Service Settings:**
   - Click ⚙️ Settings
   - **Service Name:** `ghostwriter-poster`
   - **Root Directory:** `/` (leave default)
   - **Builder:** Docker
   - **Dockerfile Path:** `Dockerfile.ghostwriter`
5. Click **"Deploy"**

**Wait for deployment** (2-3 minutes - installs Chromium)

**Verify in Logs:**
```
🎯 Ghost Writer watching for CEO approvals...
⏳ Checking every 10 seconds...
```

---

### **STEP 3: Test System (5 minutes)**

1. Open **Telegram** on your phone
2. Search: `@AMDSolutions007_bot`
3. Click **"Start"**
4. Send command: `/start`

**Bot should respond:**
```
🤖 AMD GHOST WRITER PRO

Welcome to the 36 States of Tech Campaign!

Commands:
/generate - Create new post for review
/status - Check campaign progress
/queue - View pending posts

Ready to dominate Leke Leke! 🚀
```

5. Send command: `/generate`

**Bot should send:**
- 📸 Lagos State graphic (1200x675px)
- 📝 Caption with Day 1/36 content
- [✅ APPROVE] [❌ REJECT] buttons

6. Click **✅ APPROVE**

**Bot confirms:**
```
✅ Post Approved!
Ghost Writer will post this to Leke Leke shortly.
```

7. Wait 10-15 seconds
8. Check Leke Leke: www.lekeelekee.com/@amd
9. Verify post appears with graphic + caption

---

## ✅ SUCCESS CRITERIA

**Telegram Bot Service:**
- ✅ Status: Running (green)
- ✅ Logs show: "Telegram Approval Bot is LIVE!"
- ✅ Bot responds to /start on Telegram

**Ghost Writer Service:**
- ✅ Status: Running (green)
- ✅ Logs show: "Ghost Writer watching for CEO approvals..."
- ✅ Posts to Leke Leke after CEO approval

**End-to-End Test:**
- ✅ /generate sends graphic + caption
- ✅ CEO approves via Telegram
- ✅ Post appears on Leke Leke within 15 seconds

---

## 🚨 TROUBLESHOOTING

### **"Service won't deploy"**
**Solution:**
- Check Dockerfile path is correct
- Verify Railway has access to GitHub repo
- Check Railway logs for build errors

### **"Telegram bot not responding"**
**Solution:**
- Check `TELEGRAM_BOT_TOKEN` is set (8250377410:...)
- Check `CEO_TELEGRAM_ID` is set (8013249849)
- Restart Telegram Bot service in Railway

### **"Ghost Writer not posting"**
**Solution:**
- Check `LEKE_LEKE_EMAIL` is set (ceo@amdsolutions007.com)
- Check `LEKE_LEKE_PASSWORD` is set
- Check Railway logs for Selenium errors
- **Most likely:** CSS selectors need updating (see DEPLOYMENT.md)

### **"Chromium not found"**
**Solution:**
- Verify Dockerfile.ghostwriter includes chromium install
- Check Railway build logs
- Rebuild service if needed

---

## 📊 MONITORING

**Railway Dashboard:**
- Check CPU/RAM usage (should be <10%)
- Monitor deployment logs
- View real-time errors

**Telegram:**
- Bot sends success/failure notifications
- CEO gets approval requests instantly
- Error messages sent to CEO Telegram

**Leke Leke:**
- Check posts appear: www.lekeelekee.com/@amd
- Monitor follower growth
- Track engagement (likes, comments)

---

## 🎯 FIRST POST CHECKLIST

After deployment:
- [ ] Both services show "Running" status in Railway
- [ ] Telegram bot responds to /start
- [ ] CEO sends /generate command
- [ ] Bot sends Lagos State graphic + caption
- [ ] CEO clicks ✅ APPROVE button
- [ ] Ghost Writer posts within 15 seconds
- [ ] Post visible on Leke Leke with graphic
- [ ] Campaign begins: 24 → 10,000+ followers

---

## 📞 SUPPORT

**Railway Dashboard:**
https://railway.app/project/04114a84-a0a4-463f-ae22-94c442e4c36b

**Telegram Bot:**
@AMDSolutions007_bot

**Documentation:**
- GHOSTWRITER_QUICKSTART.md
- DEPLOYMENT.md
- GHOSTWRITER_CHECKLIST.md

---

**Status:** Ready for Railway Dashboard deployment  
**Time Required:** 10 minutes total  
**Next Action:** Follow Step 1 above to create Telegram Bot service
