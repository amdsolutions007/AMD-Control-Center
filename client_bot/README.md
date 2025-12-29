# 🤖 AMD CLIENT ACQUISITION BOT

**Mission: Convert every inquiry into a booked meeting**

## What It Does

1. **Auto-Responds to Inquiries** (< 2 minutes)
   - WhatsApp messages
   - Email inquiries
   - Website form submissions
   - Social media DMs

2. **Qualifies Leads Automatically**
   - Budget assessment
   - Timeline identification
   - Pain point discovery
   - Decision maker verification

3. **Books Meetings**
   - Sends calendar link
   - Confirms availability
   - Sends reminders
   - Reschedules automatically

4. **Sends Proposals**
   - Custom proposals generated
   - Follow-up sequences
   - Payment links
   - Contract signing automation

## Quick Start

```bash
cd ~/Desktop/AMD_Control_Center/client_bot
python3 bot.py --platform all
```

## Architecture

- **WhatsApp Bot:** Meta Business API + python-telegram-bot
- **Email Bot:** Gmail API with smart responses
- **Telegram Bot:** Same as social engine
- **CRM Integration:** SQLite database with lead scoring

## Expected Results

- **Response Time:** < 2 minutes (was 4+ hours manual)
- **Meeting Book Rate:** 60% (was 20% manual)
- **Follow-up Rate:** 100% (was 30% manual)
- **Close Rate:** 35% (was 15% manual)

**Impact:** 3x more deals closed from same lead volume
