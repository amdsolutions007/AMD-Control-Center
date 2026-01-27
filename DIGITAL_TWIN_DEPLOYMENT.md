# AMD DIGITAL TWIN - Deployment Guide

## 🎯 MISSION
Deploy "Set-and-Forget" Email Bot that mimics human CEO behavior while traveling.

---

## ✅ CONFIGURATION COMPLETE

**SMTP Details:**
- Server: `mail.privateemail.com`
- Port: `465` (SSL)
- Email: `ceo@amdsolutions007.com`
- Password: Stored in `.env`

**Behavior:**
- Sends 1 email every 30-60 minutes (random)
- Maximum 5 emails per day
- Resets at midnight
- Human-like timing patterns

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Railway (Recommended for Travel)

1. **Add to Railway:**
   ```bash
   cd ~/Desktop/AMD_Control_Center
   git add amd_digital_twin.py .env requirements.txt
   git commit -m "Add AMD Digital Twin - Travel Mode Email Bot"
   git push origin main
   ```

2. **Configure Railway Service:**
   - Go to Railway Dashboard
   - Add New Service → `amd_digital_twin.py`
   - Set environment variable: `SMTP_PASS=#@Amd@007?`
   - Start command: `python3 amd_digital_twin.py`

3. **Verify deployment:**
   ```bash
   railway logs amd-digital-twin --follow
   ```

---

### Option 2: Local Machine (Background Process)

#### Using `nohup` (Simple):
```bash
cd ~/Desktop/AMD_Control_Center
nohup python3 amd_digital_twin.py > digital_twin.log 2>&1 &
```

**Monitor logs:**
```bash
tail -f digital_twin.log
```

**Stop the bot:**
```bash
ps aux | grep amd_digital_twin
kill <PID>
```

---

#### Using `pm2` (Professional):

**Install PM2:**
```bash
npm install -g pm2
```

**Start Digital Twin:**
```bash
cd ~/Desktop/AMD_Control_Center
pm2 start amd_digital_twin.py --name digital-twin --interpreter python3
```

**Monitor:**
```bash
pm2 status
pm2 logs digital-twin
```

**Auto-restart on reboot:**
```bash
pm2 startup
pm2 save
```

**Stop the bot:**
```bash
pm2 stop digital-twin
pm2 delete digital-twin
```

---

## 📊 MONITORING

### Check Sent Emails:
```bash
cat data/digital_twin_sent.log
```

### Real-time Logs (Railway):
```bash
railway logs amd-digital-twin --follow
```

### Expected Output:
```
🤖 AMD DIGITAL TWIN - TRAVEL MODE ACTIVATED
📧 SMTP: ceo@amdsolutions007.com
⏱️  Human delay: 30-60 minutes
📊 Daily limit: 5 emails
✅ Configuration valid
🚀 Starting email sequence...

📤 [1/5] Sending to: jobs@example.com
✅ Email sent to: jobs@example.com
   Subject: Agency Partnership - AMD Solutions 007
💤 [Human Mode] Resting for 45.3 mins...
   Next email at: 03:45 PM
```

---

## ⚙️ CUSTOMIZATION

### Add More Email Targets:
Edit `amd_digital_twin.py`:

```python
EMAIL_TARGETS = [
    {
        "to": "newlead@company.com",
        "subject": "Your Custom Subject",
        "name": "Contact Name"
    },
    # Add more...
]
```

### Adjust Timing:
```python
MIN_SLEEP_SECONDS = 1800  # 30 minutes
MAX_SLEEP_SECONDS = 3600  # 60 minutes
MAX_EMAILS_PER_DAY = 5
```

---

## 🛡️ PROTOCOL 007 COMPLIANCE

✅ **Official SMTP API** (Namecheap Private Email)  
✅ **Human-like timing** (30-60 min delays)  
✅ **Rate limiting** (5 emails/day max)  
✅ **SSL encryption** (Port 465)  
✅ **No spam triggers** (random delays, personalized content)

---

## 📱 TELEGRAM ALERTS (Optional Upgrade)

To get notifications when emails are sent:

1. Add to `amd_digital_twin.py`:
   ```python
   import telegram
   
   def send_telegram_alert(message):
       bot = telegram.Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
       bot.send_message(chat_id=os.getenv("TELEGRAM_CHAT_ID"), text=message)
   ```

2. Call after each email:
   ```python
   send_telegram_alert(f"✅ Digital Twin sent email to {target['to']}")
   ```

---

## 🧪 TESTING

### Test Single Email:
```bash
python3 amd_digital_twin.py
# Press Ctrl+C after first email
```

### Verify SMTP Connection:
```bash
python3 -c "
import smtplib, ssl
context = ssl.create_default_context()
server = smtplib.SMTP_SSL('mail.privateemail.com', 465, context=context)
server.login('ceo@amdsolutions007.com', '#@Amd@007?')
print('✅ SMTP connection successful')
server.quit()
"
```

---

## ⚠️ TROUBLESHOOTING

**Error: "Authentication failed"**
- Check `.env` file has correct `SMTP_PASS`
- Verify Namecheap account is active

**Error: "Connection refused"**
- Check port (should be 465, not 587)
- Verify SSL is enabled

**Emails going to spam:**
- Reduce daily limit to 3 emails
- Increase sleep time to 60-120 minutes
- Add more personalization to templates

---

## 📈 EXPECTED RESULTS

**Daily Output:**
- 5 agency pitch emails sent
- 4-6 hours total operation time (with human delays)
- Automatic reset at midnight

**Weekly Impact:**
- 35 emails sent (7 days × 5 emails)
- Expected: 2-3 responses (5-10% response rate)
- Potential: 1-2 discovery calls

**Monthly Revenue Potential:**
- If 1 agency contract closed: ₦2M-5M
- Fully automated while traveling

---

## 🎯 NEXT STEPS

1. **Test locally first:**
   ```bash
   python3 amd_digital_twin.py
   # Watch first email send, then Ctrl+C
   ```

2. **Deploy to Railway:**
   ```bash
   git add . && git commit -m "Digital Twin ready" && git push
   ```

3. **Monitor first day:**
   ```bash
   railway logs amd-digital-twin --follow
   ```

4. **Add more targets** as you collect leads from LinkedIn/Google Alerts

---

**STATUS:** ✅ Ready for deployment  
**CREATED:** January 27, 2026  
**MODE:** Travel-Safe Autonomous Operation
