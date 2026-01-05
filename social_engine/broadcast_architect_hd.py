#!/usr/bin/env python3
"""
Post HD Architect Video to X and Telegram
"""
import os
import sys
import tweepy
from dotenv import load_dotenv
import requests
from pathlib import Path

load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("🚀 BROADCASTING THE ARCHITECT (HD VERSION)")
print("=" * 70)

# YouTube URL (HD version)
video_id = open('/Users/mac/Desktop/AMD_Control_Center/social_engine/architect_hd_youtube_id.txt').read().strip()
youtube_url = f"https://www.youtube.com/watch?v={video_id}"
linkedin_url = "https://www.linkedin.com/in/amdsolutions007"

print(f"📹 YouTube (HD): {youtube_url}")
print(f"🔗 LinkedIn: {linkedin_url}\n")

# ============= X (TWITTER) =============
print("🐦 Posting to X...")

tweet = f"""This is Olawale Shoyemi.

They told us to stay in the dark, so I built a torch. 🔦

I don't just write code - I engineer Nations. 🇳🇬

Watch the full message (HD):
{youtube_url}

I am accepting 100 new connections.
Join: {linkedin_url}

#NigerianTech #BuildInPublic"""

api_key = os.getenv('TWITTER_API_KEY') or os.getenv('TWITTER_CONSUMER_KEY')
api_secret = os.getenv('TWITTER_API_SECRET') or os.getenv('TWITTER_CONSUMER_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_secret = os.getenv('TWITTER_ACCESS_SECRET')

try:
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )
    
    response = client.create_tweet(text=tweet)
    
    print(f"✅ X: Tweet ID {response.data['id']}")
    print(f"   View: https://twitter.com/user/status/{response.data['id']}")
    
except Exception as e:
    if "429" in str(e) or "rate limit" in str(e).lower():
        print(f"⏳ X: Rate limited (retry in 15-30 min)")
    else:
        print(f"⚠️ X: {e}")

# ============= TELEGRAM =============
print("\n📱 Posting to Telegram...")

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
CHANNEL_ID = os.getenv('TELEGRAM_CHANNEL_ID') or '@amdsolutions007'

caption = f"""🎯 THE ARCHITECT (HD)

"This is Olawale Shoyemi. They told us to stay in the dark, so I built a torch."

I don't just write code - I engineer Nations. 🇳🇬

We are building the Digital Future of Nigeria.

🔗 I am accepting 100 new connections.
Join the Network: {linkedin_url}

📹 Watch in Full HD: {youtube_url}

#NigerianTech #BuildInPublic #LinkedInNetworking"""

VIDEO_FILE = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_video_hd.mp4'

try:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendVideo"
    
    with open(VIDEO_FILE, 'rb') as video:
        files = {'video': video}
        data = {
            'chat_id': CHANNEL_ID,
            'caption': caption,
            'supports_streaming': True
        }
        
        print("   Uploading HD video (3.4 MB)...")
        response = requests.post(url, files=files, data=data, timeout=300)
    
    if response.status_code == 200:
        result = response.json()
        message_id = result['result']['message_id']
        print(f"✅ Telegram: Message ID {message_id}")
    else:
        print(f"⚠️ Telegram: {response.status_code}")
        
except Exception as e:
    print(f"⚠️ Telegram: {e}")

print("\n" + "=" * 70)
print("✅ BROADCAST COMPLETE!")
print("=" * 70)
print(f"📹 YouTube HD: {youtube_url}")
print(f"🐦 X: Check timeline")
print(f"📱 Telegram: @amdsolutions007")
print("\n⚠️  Snapchat: Manual upload required")
print("=" * 70)
