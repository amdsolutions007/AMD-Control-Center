#!/usr/bin/env python3
"""
RISE UP TRILOGY - MULTI-PLATFORM DEPLOYMENT
YouTube → X → Telegram → LinkedIn (manual)
"""
import os
import sys
from pathlib import Path
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import tweepy
from dotenv import load_dotenv
import requests
import time

load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("🚀 RISE UP TRILOGY - DEPLOYMENT PROTOCOL")
print("=" * 70)

# Paths
VIDEO_FILE = '/Users/mac/Desktop/AMD_Control_Center/social_engine/RiseUp_Launch_Master.mp4'
credentials_file = '/Users/mac/Desktop/AMD_Control_Center/social_engine/client_secrets.json'
token_file = '/Users/mac/Desktop/AMD_Control_Center/youtube_token.pickle'

# Verify master exists
if not Path(VIDEO_FILE).exists():
    print(f"❌ Master not found: {VIDEO_FILE}")
    sys.exit(1)

video_size = Path(VIDEO_FILE).stat().st_size / (1024 * 1024)
print(f"✅ Master: RiseUp_Launch_Master.mp4 ({video_size:.1f} MB, 720x1280)")

# ============= YOUTUBE =============
print("\n📹 UPLOADING TO YOUTUBE...")

try:
    # OAuth2
    creds = None
    if os.path.exists(token_file):
        with open(token_file, 'rb') as token:
            creds = pickle.load(token)
    
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    
    youtube = build('youtube', 'v3', credentials=creds)
    
    # Video metadata
    body = {
        'snippet': {
            'title': 'Rise Up: The Trilogy 🇳🇬 | Nigeria\'s Digital Awakening',
            'description': '''RISE UP: THE TRILOGY

Act I - The Awakening
Act II - The Architect  
Act III - The Invitation

This is the story of Nigeria's digital transformation. From darkness to light. From silence to voice. From waiting to building.

We are not asking for permission. We are building the future.

🇳🇬 AMD Media Solutions
Built by Olawale Shoyemi

Connect on LinkedIn: https://www.linkedin.com/in/amdsolutions007
Website: https://www.amdsolutions007.com
WhatsApp: +234 818 002 1007

#RiseUpNigeria #NigerianTech #DigitalTransformation #AfricaTech #BuildInPublic #AIRevolution #TechInAfrica #Innovation #SoftwareEngineering''',
            'tags': ['Nigeria', 'Tech', 'Digital Transformation', 'Africa', 'Innovation', 'AI', 'Software Engineering', 'Rise Up'],
            'categoryId': '28'  # Science & Technology
        },
        'status': {
            'privacyStatus': 'public',
            'selfDeclaredMadeForKids': False
        }
    }
    
    print("   Uploading master film...")
    
    media = MediaFileUpload(VIDEO_FILE, chunksize=-1, resumable=True)
    request = youtube.videos().insert(
        part='snippet,status',
        body=body,
        media_body=media
    )
    
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"   Progress: {int(status.progress() * 100)}%")
    
    video_id = response['id']
    youtube_url = f"https://www.youtube.com/watch?v={video_id}"
    
    print(f"✅ YouTube: {youtube_url}")
    
    # Save video ID
    with open('/Users/mac/Desktop/AMD_Control_Center/social_engine/riseup_youtube_id.txt', 'w') as f:
        f.write(video_id)
    
except Exception as e:
    print(f"❌ YouTube upload failed: {e}")
    sys.exit(1)

# ============= X (TWITTER) =============
print("\n🐦 POSTING TO X...")

tweet = f"""RISE UP: The Trilogy 🇳🇬

Act I - The Awakening
Act II - The Architect  
Act III - The Invitation

From darkness to light. From silence to voice. From waiting to building.

We are not asking for permission. We are building the future.

Watch: {youtube_url}

#RiseUpNigeria #BuildInPublic"""

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
    tweet_url = f"https://twitter.com/user/status/{response.data['id']}"
    
    print(f"✅ X: {tweet_url}")
    
except Exception as e:
    if "429" in str(e) or "rate limit" in str(e).lower():
        print(f"⏳ X: Rate limited (retry in 15-30 min)")
        print(f"   Manual post: {youtube_url}")
    else:
        print(f"⚠️ X: {e}")

# ============= TELEGRAM =============
print("\n📱 POSTING TO TELEGRAM...")

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
CHANNEL_ID = os.getenv('TELEGRAM_CHANNEL_ID') or '@amdsolutions007'

caption = f"""🎬 RISE UP: THE TRILOGY

Act I - The Awakening
Act II - The Architect  
Act III - The Invitation

From darkness to light. From silence to voice. From waiting to building.

We are not asking for permission. We are building the future. 🇳🇬

📹 Watch in HD: {youtube_url}

🔗 Connect: https://www.linkedin.com/in/amdsolutions007

#RiseUpNigeria #NigerianTech #BuildInPublic"""

try:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendVideo"
    
    print("   Uploading master film (22 MB)...")
    
    with open(VIDEO_FILE, 'rb') as video:
        files = {'video': video}
        data = {
            'chat_id': CHANNEL_ID,
            'caption': caption,
            'supports_streaming': True
        }
        
        response = requests.post(url, files=files, data=data, timeout=300)
    
    if response.status_code == 200:
        result = response.json()
        message_id = result['result']['message_id']
        print(f"✅ Telegram: Message ID {message_id}")
    else:
        print(f"⚠️ Telegram: {response.status_code}")
        
except Exception as e:
    print(f"⚠️ Telegram: {e}")

# ============= SUMMARY =============
print("\n" + "=" * 70)
print("✅ RISE UP TRILOGY - DEPLOYMENT COMPLETE!")
print("=" * 70)
print(f"📹 YouTube: {youtube_url}")
print(f"🐦 X: Check timeline")
print(f"📱 Telegram: @amdsolutions007")
print("\n💼 LINKEDIN (Manual Upload Required):")
print(f"   1. Go to https://www.linkedin.com/in/amdsolutions007")
print(f"   2. Create new post")
print(f"   3. Upload: {VIDEO_FILE}")
print(f"   4. Caption: Same as X post")
print(f"   5. Add YouTube link: {youtube_url}")
print("=" * 70)
print("\n🎬 THE TRILOGY HAS RISEN.")
