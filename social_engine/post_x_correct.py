#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
X (TWITTER) - RISE UP TRILOGY POST
═══════════════════════════════════════════════════════════════════════════
CRITICAL: FREE API = TEXT ONLY
Solution: Post YouTube link → Twitter auto-generates video preview
═══════════════════════════════════════════════════════════════════════════
"""

import os
from pathlib import Path
import tweepy
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")


def _env(*names: str) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return None

# YouTube URL
YOUTUBE_URL = "https://www.youtube.com/watch?v=3B7Gv-1AdvU"

# Tweet text (under 280 characters)
TWEET_TEXT = f"""🇳🇬 RISE UP: The Trilogy

Three visions. One mission. Nigeria's digital transformation begins now.

Part I: The Awakening
Part II: The Architect  
Part III: The Invitation

Watch the full journey 🎬
{YOUTUBE_URL}

#RiseUpNigeria #DigitalTransformation #AIForAfrica"""

print("═" * 75)
print("🐦 X (TWITTER) - TEXT POST WITH YOUTUBE LINK")
print("═" * 75)
print()
print("📝 Tweet Text:")
print("-" * 75)
print(TWEET_TEXT)
print("-" * 75)
print(f"📊 Length: {len(TWEET_TEXT)} characters")
print()

try:
    # Authenticate
    client = tweepy.Client(
        consumer_key=_env('TWITTER_API_KEY', 'TWITTER_CONSUMER_KEY'),
        consumer_secret=_env('TWITTER_API_SECRET', 'TWITTER_CONSUMER_SECRET'),
        access_token=_env('TWITTER_ACCESS_TOKEN'),
        access_token_secret=_env('TWITTER_ACCESS_TOKEN_SECRET', 'TWITTER_ACCESS_SECRET')
    )
    
    print("🔑 Authenticated with X API")
    print("📤 Posting text with YouTube link...")
    print()
    
    # Post tweet
    response = client.create_tweet(text=TWEET_TEXT)
    tweet_id = response.data['id']
    
    print("✅ POSTED TO X!")
    print(f"🔗 Tweet ID: {tweet_id}")
    print(f"🔗 URL: https://twitter.com/user/status/{tweet_id}")
    print()
    print("🎬 Twitter will auto-generate video preview card from YouTube link!")
    print()
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    if "429" in str(e):
        print("⏳ Rate limited - wait 15-30 minutes")
    elif "403" in str(e):
        print("⏳ Rate limited - wait 15-30 minutes")
    elif "401" in str(e):
        print("🔑 Check API credentials in .env file")
    print("═" * 75)
