# AMD SOLUTIONS - WhatsApp Auto-Responder Bot

## 🎯 FULLY AUTOMATED - NO MORE MANUAL CONSOLE PASTE!

This bot runs 24/7 in the background, automatically responding to WhatsApp messages. No more pasting code in Chrome console. Just run it and **go spend time with your family**.

---

## 🚀 Quick Start (First Time Setup - 2 Minutes)

### Step 1: Start the Bot
```bash
cd ~/Desktop/AMD_Control_Center/whatsapp_empire
./start_whatsapp_bot.sh start
```

### Step 2: Scan QR Code (Only Once)
- Chrome will open automatically
- You'll see the WhatsApp Web QR code
- Open WhatsApp on your phone → Settings → Linked Devices → Link Device
- Scan the QR code
- **Done!** Session is saved forever, you never need to scan again

### Step 3: Watch It Work
```bash
./start_whatsapp_bot.sh logs
```

Press **Ctrl+C** to stop watching logs. Bot keeps running in background.

---

## 📋 Daily Usage (10 Seconds)

### Start Bot (Morning)
```bash
cd ~/Desktop/AMD_Control_Center/whatsapp_empire
./start_whatsapp_bot.sh start
```

### Check Status (Anytime)
```bash
./start_whatsapp_bot.sh status
```

### Stop Bot (Night - Optional, can run 24/7)
```bash
./start_whatsapp_bot.sh stop
```

---

## 🎛️ All Commands

| Command | What It Does |
|---------|-------------|
| `./start_whatsapp_bot.sh start` | Start the bot |
| `./start_whatsapp_bot.sh stop` | Stop the bot |
| `./start_whatsapp_bot.sh restart` | Restart the bot |
| `./start_whatsapp_bot.sh status` | Check if running |
| `./start_whatsapp_bot.sh logs` | Watch live logs |

---

## ✅ What This Bot Does Automatically

1. **Monitors WhatsApp** - Checks for unread messages every 10 seconds
2. **Detects Intent** - Understands what customer wants (CV, source code, pricing, etc.)
3. **Responds Intelligently** - Sends the right template based on keywords
4. **Anti-Ban Protection**:
   - Waits 5-15 seconds before responding (human-like)
   - Won't reply to same person within 60 seconds (spam protection)
   - Saves session so WhatsApp doesn't flag you
5. **Auto-Reconnects** - If WhatsApp disconnects, bot reconnects automatically
6. **Logs Everything** - All activity saved to `whatsapp_bot.log`

---

## 🎯 Response Templates

The bot automatically detects these keywords and responds:

| Keywords | Response |
|----------|----------|
| cv, resume, job, hire | Professional CV Writing Service offer |
| code, source, software, system | Premium Source Code Marketplace |
| price, cost, how much | Full Pricing Guide |
| menu, service, help, what | Services Menu |
| custom, build, website, app | Custom Development info |
| train, course, learn | Training Programs |
| **Anything else** | Smart catch-all (introduces AMD Solutions) |

---

## 📁 Files Created

- `puppeteer_whatsapp_bot.js` - Main bot code (548 lines)
- `start_whatsapp_bot.sh` - Launcher script
- `whatsapp_bot.log` - Activity logs
- `.whatsapp-session/` - Saved WhatsApp login (never scan QR again)
- `.whatsapp_bot.pid` - Process ID file

---

## 🔧 Troubleshooting

### Bot Won't Start
```bash
cd ~/Desktop/AMD_Control_Center/whatsapp_empire
npm install
./start_whatsapp_bot.sh start
```

### Check If Bot Is Running
```bash
./start_whatsapp_bot.sh status
```

### View Errors
```bash
tail -50 ~/Desktop/AMD_Control_Center/whatsapp_empire/whatsapp_bot.log
```

### Clear Session (Force Re-Login)
```bash
rm -rf ~/Desktop/AMD_Control_Center/whatsapp_empire/.whatsapp-session
./start_whatsapp_bot.sh restart
```

### Kill Stuck Bot
```bash
pkill -f puppeteer_whatsapp_bot
./start_whatsapp_bot.sh start
```

---

## 🎉 YOU'RE DONE!

**That's it!** No more:
- ❌ Opening Chrome console
- ❌ Pasting code manually
- ❌ Keeping browser open
- ❌ Worrying about WhatsApp Web

**Just run:**
```bash
./start_whatsapp_bot.sh start
```

**And go be with your 4 children. The bot handles everything.**

---

## 📞 Contact Details (Automatically Included in All Responses)

- Phone: **+234 818 002 1007**
- Email: **ceo@amdsolutions007.com**
- Website: **https://amdsolutions007.com**
- LinkTree: **https://linktr.ee/amdsolutions007**

---

## 🔮 Future Enhancements (Optional)

If you want even MORE automation, we can add:
- **Web Dashboard** - View bot stats in browser
- **SMS Alerts** - Get notified when bot responds
- **AI Integration** - ChatGPT-powered custom responses
- **Multi-Number Support** - Run multiple WhatsApp accounts

But for now, this handles **80% of customer inquiries automatically**.

---

**Built with ❤️ by AMD Solutions**
