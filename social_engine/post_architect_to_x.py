#!/usr/bin/env python3
"""
Post The Architect's Video to X (Twitter)
LinkedIn Connection Drive
"""
import os
import sys
from pathlib import Path
import tweepy
from dotenv import load_dotenv
import time

# Load credentials
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("🐦 POSTING THE ARCHITECT'S VIDEO TO X")
print("=" * 70)

# Video path
VIDEO_PATH = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_video.mp4'

# Verify video exists
if not Path(VIDEO_PATH).exists():
    print(f"❌ Video not found: {VIDEO_PATH}")
    sys.exit(1)

video_size = Path(VIDEO_PATH).stat().st_size / (1024 * 1024)
print(f"📹 Video: linkedin_video.mp4 ({video_size:.1f} MB)")

# Get credentials
api_key = os.getenv('TWITTER_API_KEY') or os.getenv('TWITTER_CONSUMER_KEY')
api_secret = os.getenv('TWITTER_API_SECRET') or os.getenv('TWITTER_CONSUMER_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_secret = os.getenv('TWITTER_ACCESS_SECRET')

# LinkedIn URL
linkedin_url = "https://www.linkedin.com/in/amdsolutions007"

# The caption
tweet = f"""This is Olawale Shoyemi.

They told us to stay in the dark, so I built a torch. 🔦

I don't just write code - I engineer Nations. 🇳🇬

I am accepting 100 new connections.

Join the Network: {linkedin_url}"""

print(f"\n📝 Caption: {len(tweet)} chars")
print(f"🔗 LinkedIn: {linkedin_url}")

# Note: Twitter Free API doesn't support media upload
# We'll need to use text-only with video hosted elsewhere
# OR upgrade to Basic/Pro API

print("\n⚠️  Twitter Free API Limitation:")
print("   Free tier does not support video uploads")
print("   Options:")
print("   1. Post text with YouTube mirror link")
print("   2. Upgrade to Twitter API Basic ($100/month)")
print("   3. Manual upload via Twitter web interface")

print("\n🎯 Proceeding with text-only post...")
print("   (Manual video upload recommended)")

try:
    # Post via API v2 (text only)
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )
    
    response = client.create_tweet(text=tweet)
    
    print("\n" + "=" * 70)
    print("✅ POSTED TO X (TEXT ONLY)")
    print("=" * 70)
    print(f"Tweet ID: {response.data['id']}")
    print(f"View: https://twitter.com/user/status/{response.data['id']}")
    print("\n📝 NEXT STEP:")
    print("   1. Open tweet in browser")
    print("   2. Click 'Edit' or reply to thread")
    print("   3. Upload linkedin_video.mp4 manually")
    print("   OR upload to YouTube first and add link")
    print("=" * 70)
    
except Exception as e:
    print(f"\n⚠️ Error: {e}")
    
    # Check if rate limited
    if "429" in str(e) or "rate limit" in str(e).lower():
        print("\n💡 Rate limited. Wait 15-30 minutes before retry.")
    else:
        print("\n💡 Will attempt manual posting workflow...")
    
    sys.exit(1)
