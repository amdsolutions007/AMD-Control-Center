#!/usr/bin/env python3
"""
Direct Telegram posting without platform wrapper
"""
import os
import asyncio
from telegram import Bot
from dotenv import load_dotenv

load_dotenv()

async def post_to_telegram():
    # Initialize bot
    bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
    channel_id = os.getenv('TELEGRAM_CHAT_ID')  # Fixed: CHAT_ID not CHANNEL_ID

    # Post content
    post = """🇳🇬 3 YEARS AGO, I MADE A DECISION...

I partnered with AI. Not just used it. PARTNERED.

Today?
✅ 6 platforms automated
✅ WhatsApp empire built
✅ Social media on autopilot
✅ Videos by AI
✅ RiseTogether NG launched

In 2 hours = 2026.

AI is not the future. AI is NOW.

Ready? 🚀

#AI2026 #NigeriaBuilding #AIRevolution"""

    try:
        result = await bot.send_message(chat_id=channel_id, text=post)
        print(f"✅ Telegram posted! Message ID: {result.message_id}")
    except Exception as e:
        print(f"❌ Telegram failed: {e}")

asyncio.run(post_to_telegram())
