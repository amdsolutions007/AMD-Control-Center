#!/usr/bin/env python3
"""
Post Happy New Year to X with YouTube video link (New Protocol)
Following X-YouTube Integration Mandate
"""
import os
import sys
import tweepy
from dotenv import load_dotenv

# Load credentials
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("🐦 X POST: HAPPY NEW YEAR 2026 (WITH YOUTUBE LINK)")
print("=" * 60)

# Get credentials
api_key = os.getenv('TWITTER_API_KEY') or os.getenv('TWITTER_CONSUMER_KEY')
api_secret = os.getenv('TWITTER_API_SECRET') or os.getenv('TWITTER_CONSUMER_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_secret = os.getenv('TWITTER_ACCESS_SECRET')

# YouTube video URL (uploaded earlier)
youtube_url = "https://www.youtube.com/watch?v=LqMKV8-88SQ"

# Post with YouTube link (triggers video preview card on X)
tweet = f"""🎉 HAPPY NEW YEAR 2026! 🇳🇬

To every Nigerian builder - THIS IS YOUR YEAR!

3 years ago I partnered with AI. Today? 6 platforms automated. Everything runs while I sleep.

Now I'm showing YOU how 👇

{youtube_url}

#NewYear2026 #NigerianTech #AIRevolution #BuildInPublic"""

print(f"📝 Tweet length: {len(tweet)} chars")
print(f"📹 YouTube URL: {youtube_url}")
print("✅ Protocol: YouTube link will trigger auto video preview\n")

try:
    # Post via API v2
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )
    
    response = client.create_tweet(text=tweet)
    
    print("=" * 60)
    print("✅ POSTED TO X SUCCESSFULLY!")
    print("=" * 60)
    print(f"Tweet ID: {response.data['id']}")
    print(f"View: https://twitter.com/user/status/{response.data['id']}")
    print("\n🎯 Protocol Followed:")
    print("   ✅ YouTube URL included")
    print("   ✅ Video preview card generated automatically")
    print("   ✅ No text-only tweet")
    print("=" * 60)
    
except Exception as e:
    print(f"\n⚠️ Error: {e}")
    print("\n💡 Note: If rate limited, wait 15-30 minutes")
    sys.exit(1)
