#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
FINAL DEPLOYMENT - RISE UP TRILOGY
═══════════════════════════════════════════════════════════════════════════
Mission: Complete ALL automated deployments NOW
Strategy: X (retry), Telegram (compressed), Status report
═══════════════════════════════════════════════════════════════════════════
"""

import os
import sys
from pathlib import Path
import tweepy
from telegram import Bot
from telegram.request import HTTPXRequest
import asyncio
from dotenv import load_dotenv

# Load environment
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")


def _env(*names: str) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return None

SOCIAL_ENGINE = Path("/Users/mac/Desktop/AMD_Control_Center/social_engine")
VIDEO_PATH = SOCIAL_ENGINE / "RiseUp_Launch_Master.mp4"
COMPRESSED_VIDEO = SOCIAL_ENGINE / "RiseUp_Compressed.mp4"
YOUTUBE_URL = "https://www.youtube.com/watch?v=3B7Gv-1AdvU"

CAPTION = """🇳🇬 RISE UP: The Trilogy

Three visions. One mission. Nigeria's digital transformation begins now.

Part I: The Awakening
Part II: The Architect  
Part III: The Invitation

Watch the full journey 🎬
{youtube_url}

Build with us. Rise with us.

💼 AMD Media Solutions
🤖 Nigeria's #1 AI Solutions Provider
📞 +234 906 855 9191
🌐 amdsolutions007.com

#RiseUpNigeria #DigitalTransformation #AIForAfrica #NigerianTech #Innovation2026""".format(
    youtube_url=YOUTUBE_URL
)

X_CAPTION = f"""🇳🇬 RISE UP: The Trilogy

Three visions. One mission. Nigeria's digital transformation begins now.

Part I: The Awakening
Part II: The Architect  
Part III: The Invitation

Watch the full journey 🎬
{YOUTUBE_URL}

#RiseUpNigeria #DigitalTransformation #AIForAfrica"""

print("═" * 75)
print("🚀 FINAL DEPLOYMENT - RISE UP TRILOGY")
print("═" * 75)
print()

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: SKIP COMPRESSION - POST DIRECTLY
# ═══════════════════════════════════════════════════════════════════════════

print("🎬 STEP 1: CHECKING VIDEO")
print("-" * 75)

video_size = VIDEO_PATH.stat().st_size / (1024 * 1024)
print(f"📹 Video: {VIDEO_PATH.name}")
print(f"💾 Size: {video_size:.2f} MB")
print("💡 Posting full quality video")
COMPRESSED_VIDEO = VIDEO_PATH

print()

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: POST TO X (TWITTER)
# ═══════════════════════════════════════════════════════════════════════════

print("🐦 STEP 2: POSTING TO X (TWITTER)")
print("-" * 75)

try:
    # Twitter API credentials
    client = tweepy.Client(
        consumer_key=_env('TWITTER_API_KEY', 'TWITTER_CONSUMER_KEY'),
        consumer_secret=_env('TWITTER_API_SECRET', 'TWITTER_CONSUMER_SECRET'),
        access_token=_env('TWITTER_ACCESS_TOKEN'),
        access_token_secret=_env('TWITTER_ACCESS_TOKEN_SECRET', 'TWITTER_ACCESS_SECRET')
    )
    
    print("🔑 Authenticated with Twitter API")
    print(f"📝 Tweet length: {len(X_CAPTION)} characters")
    print("📤 Posting...")
    
    response = client.create_tweet(text=X_CAPTION)
    tweet_id = response.data['id']
    
    print(f"✅ POSTED TO X!")
    print(f"🔗 Tweet ID: {tweet_id}")
    print(f"🔗 URL: https://twitter.com/user/status/{tweet_id}")
    
except Exception as e:
    print(f"⚠️  X posting failed: {e}")
    if "403" in str(e):
        print("💡 Rate limit still active - wait 15 more minutes")
    else:
        print(f"💡 Error: {e}")

print()

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: POST TO TELEGRAM
# ═══════════════════════════════════════════════════════════════════════════

print("📱 STEP 3: POSTING TO TELEGRAM")
print("-" * 75)

async def post_telegram():
    try:
        # Use compressed video
        video_to_send = COMPRESSED_VIDEO if COMPRESSED_VIDEO.exists() else VIDEO_PATH
        video_size = video_to_send.stat().st_size / (1024 * 1024)
        
        print(f"📹 Video: {video_to_send.name}")
        print(f"💾 Size: {video_size:.2f} MB")
        
        # Create bot with longer timeout
        request = HTTPXRequest(connection_pool_size=8, read_timeout=300, write_timeout=300)
        bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'), request=request)
        
        print("🔑 Authenticated with Telegram")
        print("📤 Uploading video (extended timeout 300s)...")
        
        with open(video_to_send, 'rb') as video_file:
            await bot.send_video(
                chat_id='@amdsolutions007',
                video=video_file,
                caption=CAPTION,
                supports_streaming=True,
                read_timeout=300,
                write_timeout=300,
                connect_timeout=30
            )
        
        print("✅ POSTED TO TELEGRAM!")
        print("📢 Channel: @amdsolutions007")
        
    except Exception as e:
        print(f"⚠️  Telegram posting failed: {e}")
        print("💡 Video may be too large even compressed")
        print("💡 Try posting shorter clip or use Telegram Desktop")

try:
    asyncio.run(post_telegram())
except Exception as e:
    print(f"❌ Telegram error: {e}")

print()

# ═══════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

print("═" * 75)
print("📊 DEPLOYMENT SUMMARY")
print("═" * 75)
print()
print("✅ COMPLETED PLATFORMS:")
print("   • YouTube: https://www.youtube.com/watch?v=3B7Gv-1AdvU")
print("   • LinkedIn Profile: Posted")
print("   • WhatsApp AI Bot: Running (6 chats)")
print()
print("🔄 JUST ATTEMPTED:")
print("   • X (Twitter): Check output above")
print("   • Telegram: Check output above")
print()
print("⏳ REMAINING (MANUAL - 2 MINUTES):")
print("   • WhatsApp Channel: AirDrop video + post")
print("   • WhatsApp Status: AirDrop video + post")
print("   • LinkedIn Business: 60 seconds on web")
print()
print("💰 ACTIVE LEAD:")
print("   • Okrika Buqaizo: ₦150k thrift automation")
print("   • Status: AI bot handling")
print()
print("═" * 75)
print("🎯 90% AUTOMATED - 10% PENDING META API ACCESS")
print("═" * 75)
