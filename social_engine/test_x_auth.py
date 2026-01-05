#!/usr/bin/env python3
"""
X (TWITTER) - AUTH TEST
Simple text post to verify credentials
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

TEST_TEXT = """🚀 Testing automation systems.

If you see this, our AI is live and working.

#Automation #AI #Tech"""

print("═" * 75)
print("🐦 X (TWITTER) - AUTHENTICATION TEST")
print("═" * 75)
print()
print(f"📝 Test text: {TEST_TEXT}")
print()

try:
    client = tweepy.Client(
        consumer_key=_env('TWITTER_API_KEY', 'TWITTER_CONSUMER_KEY'),
        consumer_secret=_env('TWITTER_API_SECRET', 'TWITTER_CONSUMER_SECRET'),
        access_token=_env('TWITTER_ACCESS_TOKEN'),
        access_token_secret=_env('TWITTER_ACCESS_TOKEN_SECRET', 'TWITTER_ACCESS_SECRET')
    )
    
    print("🔑 Attempting authentication...")
    
    response = client.create_tweet(text=TEST_TEXT)
    tweet_id = response.data['id']
    
    print("✅ TOKEN WORKING!")
    print(f"🔗 Tweet ID: {tweet_id}")
    print(f"🔗 URL: https://twitter.com/user/status/{tweet_id}")
    print()
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Token NOT working: {e}")
    print()
    if "401" in str(e):
        print("🔑 401 = Invalid credentials")
    elif "403" in str(e) or "429" in str(e):
        print("⏳ Rate limited - wait 15 mins")
    print("═" * 75)
