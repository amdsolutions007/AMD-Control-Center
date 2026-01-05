#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - TELEGRAM DEPLOYMENT (OPTIMIZED)
═══════════════════════════════════════════════════════════════════════════
Video: 4.58 MB (under 50 MB limit ✅)
═══════════════════════════════════════════════════════════════════════════
"""

import os
import asyncio
from telegram import Bot
from telegram.request import HTTPXRequest
from dotenv import load_dotenv

load_dotenv()

VIDEO_PATH = '/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job1_NaijaBiz_Pilot/NaijaBiz_Pilot_Video_Master.mp4'
CHANNEL = '@amdsolutions007'

# Optimized caption
CAPTION = """Stop losing customers because you're asleep. 😴💸

NaijaBiz Pilot = Your 24/7 WhatsApp sales rep.

✅ Auto-replies in 1 second
✅ Closes deals at 3 AM  
✅ Zero monthly salary

Only 5 spots this week.

DM "PILOT" now 👇

🌍 https://amdsolutions007.com
📞 0818 002 1007

#WhatsAppAutomation #NigeriaBusiness #AI"""

async def deploy():
    print("═" * 75)
    print("📱 DEPLOYING TO TELEGRAM (OPTIMIZED)")
    print("═" * 75)
    print()
    print(f"📹 Video: 4.58 MB")
    print(f"📢 Channel: {CHANNEL}")
    print()
    
    try:
        request = HTTPXRequest(
            connection_pool_size=8,
            read_timeout=300,
            write_timeout=300
        )
        
        bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'), request=request)
        
        print("🔑 Authenticated with Telegram")
        print("📤 Uploading video (may take 30-60s)...")
        print()
        
        with open(VIDEO_PATH, 'rb') as video:
            await bot.send_video(
                chat_id=CHANNEL,
                video=video,
                caption=CAPTION,
                supports_streaming=True,
                read_timeout=300,
                write_timeout=300
            )
        
        print("✅ POSTED TO TELEGRAM!")
        print(f"📢 Channel: {CHANNEL}")
        print()
        print("═" * 75)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if "timeout" in str(e).lower():
            print("⚠️  File too large - try Telegram Desktop for manual upload")
        print("═" * 75)

if __name__ == '__main__':
    asyncio.run(deploy())
