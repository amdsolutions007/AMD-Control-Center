#!/usr/bin/env python3
"""
Post The Architect's Video to X with YouTube Link
Following X-YouTube Integration Protocol
"""
import os
import sys
import tweepy
from dotenv import load_dotenv

# Load credentials
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("🐦 POSTING THE ARCHITECT TO X (WITH YOUTUBE LINK)")
print("=" * 70)

# Get YouTube video ID
with open('/Users/mac/Desktop/AMD_Control_Center/social_engine/architect_youtube_id.txt', 'r') as f:
    video_id = f.read().strip()

youtube_url = f"https://www.youtube.com/watch?v={video_id}"
linkedin_url = "https://www.linkedin.com/in/amdsolutions007"

# The caption with YouTube link (Protocol)
tweet = f"""This is Olawale Shoyemi.

They told us to stay in the dark, so I built a torch. 🔦

I don't just write code - I engineer Nations. 🇳🇬

Watch the full message:
{youtube_url}

I am accepting 100 new connections.
Join: {linkedin_url}

#NigerianTech #BuildInPublic"""

print(f"📝 Tweet length: {len(tweet)} chars")
print(f"📹 YouTube: {youtube_url}")
print(f"🔗 LinkedIn: {linkedin_url}")
print("✅ Protocol: YouTube link triggers auto video preview\n")

# Get credentials
api_key = os.getenv('TWITTER_API_KEY') or os.getenv('TWITTER_CONSUMER_KEY')
api_secret = os.getenv('TWITTER_API_SECRET') or os.getenv('TWITTER_CONSUMER_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_secret = os.getenv('TWITTER_ACCESS_SECRET')

try:
    # Post via API v2
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )
    
    response = client.create_tweet(text=tweet)
    
    print("=" * 70)
    print("✅ POSTED TO X SUCCESSFULLY!")
    print("=" * 70)
    print(f"Tweet ID: {response.data['id']}")
    print(f"View: https://twitter.com/user/status/{response.data['id']}")
    print("\n🎯 Protocol Followed:")
    print("   ✅ YouTube URL included")
    print("   ✅ Video preview card generated automatically")
    print("   ✅ LinkedIn connection CTA included")
    print("=" * 70)
    
except Exception as e:
    print(f"\n⚠️ Error: {e}")
    
    if "429" in str(e) or "rate limit" in str(e).lower():
        print("\n💡 Rate limited. Wait 15-30 minutes before retry.")
    
    sys.exit(1)
