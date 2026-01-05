#!/usr/bin/env python3
import asyncio
from telegram import Bot
from dotenv import load_dotenv
import os

load_dotenv()

async def post():
    bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
    channel_id = os.getenv('TELEGRAM_CHAT_ID')
    
    post_text = """🎉 HAPPY NEW YEAR 2026! 🎉

TO EVERY NIGERIAN BUILDER:

This is YOUR year.
This is OUR year.
This is NIGERIA's year.

I spent 3 years proving AI works.
Now I'm showing YOU how to use it.

RiseTogether NG is LIVE:
💎 999 creatives backing 1 spotlight daily
🤖 AI tools for Nigerian businesses
🇳🇬 Building the digital future together

Want in?
Reply "RISE" to +234 818 002 1007

Let's build! 🚀

#HappyNewYear2026 #AIRevolution #NigeriaBuilding"""
    
    result = await bot.send_message(chat_id=channel_id, text=post_text)
    print(f"✅ Telegram posted! Message ID: {result.message_id}")

asyncio.run(post())
