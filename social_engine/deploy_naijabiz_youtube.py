#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - YOUTUBE DEPLOYMENT (OPTIMIZED)
═══════════════════════════════════════════════════════════════════════════
Trinity Protocol: Video + Audio + Optimized Copy
═══════════════════════════════════════════════════════════════════════════
"""

import os
import pickle
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Paths
VIDEO_PATH = '/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job1_NaijaBiz_Pilot/NaijaBiz_Pilot_Video_Master.mp4'
TOKEN_PATH = '/Users/mac/Desktop/AMD_Control_Center/youtube_token.pickle'
CLIENT_SECRETS = '/Users/mac/Desktop/AMD_Control_Center/client_secrets.json'

# OPTIMIZED YouTube Metadata
TITLE = "NaijaBiz Pilot: Sleep While We Sell - WhatsApp AI Sales Manager for Nigerian Businesses 🇳🇬"

DESCRIPTION = """Stop losing customers because you're asleep. 😴💸

It's 2026. If your business waits for you to wake up to reply to "How much?" messages, you're losing money to competitors who reply faster.

Introducing the NaijaBiz Pilot by AMD Media Solutions. 🤖🚀

✅ Auto-Replies in 1 second
✅ Sends Price Lists automatically  
✅ Closes sales while you sleep
✅ Works 24/7 on your WhatsApp Business

ONLY 5 SERIOUS BUSINESSES THIS WEEK.

👇 DM 'PILOT' to install now.

🌍 Website: https://amdsolutions007.com
📂 Portfolio: https://amdsolutions007.github.io
🔗 All Links: https://amdsolutions007.com/links
📞 Hotline: 0818 002 1007
📧 Email: ceo@amdsolutions007.com

#WhatsAppAutomation #AI #NaijaBiz #SalesBot #AMDSolutions #NigerianBusiness #AIForAfrica #Automation #DigitalTransformation"""

TAGS = [
    "WhatsApp Automation",
    "AI Sales Bot",
    "Nigerian Business",
    "WhatsApp Business",
    "Sales Automation",
    "AI For Africa",
    "Nigeria Tech",
    "Business Automation",
    "AMD Solutions",
    "Digital Marketing"
]

CATEGORY_ID = "28"  # Science & Technology

print("═" * 75)
print("📹 YOUTUBE DEPLOYMENT - NAIJABIZ PILOT (OPTIMIZED)")
print("═" * 75)
print()
print("🎬 Video: NaijaBiz_Pilot_Video_Master.mp4 (4.58 MB)")
print()
print("📝 OPTIMIZED Title:")
print("-" * 75)
print(TITLE)
print("-" * 75)
print()
print("📝 OPTIMIZED Description (with urgency + full contact info):")
print("-" * 75)
print(DESCRIPTION[:200] + "...")
print("-" * 75)
print()

try:
    # Authenticate
    creds = None
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, 'rb') as token:
            creds = pickle.load(token)
    
    youtube = build('youtube', 'v3', credentials=creds)
    
    print("🔑 Authenticated with YouTube API")
    print("📤 Uploading video...")
    print()
    
    # Upload video
    media = MediaFileUpload(VIDEO_PATH, chunksize=-1, resumable=True)
    
    request = youtube.videos().insert(
        part='snippet,status',
        body={
            'snippet': {
                'title': TITLE,
                'description': DESCRIPTION,
                'tags': TAGS,
                'categoryId': CATEGORY_ID
            },
            'status': {
                'privacyStatus': 'public',
                'selfDeclaredMadeForKids': False
            }
        },
        media_body=media
    )
    
    response = request.execute()
    video_id = response['id']
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    
    print("✅ POSTED TO YOUTUBE!")
    print(f"🔗 Video ID: {video_id}")
    print(f"🔗 URL: {video_url}")
    print()
    print("═" * 75)
    print(f"🎯 SAVE THIS URL FOR X/TWITTER POSTING")
    print("═" * 75)
    print()
    print(video_url)
    print()
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    print("═" * 75)
