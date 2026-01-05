#!/usr/bin/env python3
"""
Post The Architect's Video to Telegram
LinkedIn Connection Drive
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load credentials
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("📱 POSTING THE ARCHITECT TO TELEGRAM")
print("=" * 70)

# Get Telegram credentials
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
CHANNEL_ID = os.getenv('TELEGRAM_CHANNEL_ID') or '@amdsolutions007'

if not BOT_TOKEN:
    print("❌ TELEGRAM_BOT_TOKEN not found in .env")
    sys.exit(1)

# Paths
VIDEO_FILE = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_video.mp4'
YOUTUBE_URL = 'https://www.youtube.com/watch?v=ImyJr6QXf18'
LINKEDIN_URL = 'https://www.linkedin.com/in/amdsolutions007'

# Verify video exists
if not Path(VIDEO_FILE).exists():
    print(f"❌ Video not found: {VIDEO_FILE}")
    sys.exit(1)

video_size = Path(VIDEO_FILE).stat().st_size / (1024 * 1024)
print(f"✅ Video: linkedin_video.mp4 ({video_size:.1f} MB)")

# Caption
caption = f"""🎯 THE ARCHITECT

"This is Olawale Shoyemi. They told us to stay in the dark, so I built a torch."

I don't just write code - I engineer Nations. 🇳🇬

We are building the Digital Future of Nigeria.

🔗 I am accepting 100 new connections.
Join the Network: {LINKEDIN_URL}

📹 Watch on YouTube: {YOUTUBE_URL}

#NigerianTech #BuildInPublic #LinkedInNetworking"""

print(f"\n📝 Caption: {len(caption)} chars")
print(f"📍 Channel: {CHANNEL_ID}")

try:
    # Send video to Telegram
    print("\n📤 Uploading to Telegram...")
    
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendVideo"
    
    with open(VIDEO_FILE, 'rb') as video:
        files = {'video': video}
        data = {
            'chat_id': CHANNEL_ID,
            'caption': caption,
            'parse_mode': 'HTML',
            'supports_streaming': True
        }
        
        response = requests.post(url, files=files, data=data, timeout=300)
    
    if response.status_code == 200:
        result = response.json()
        message_id = result['result']['message_id']
        
        print("\n" + "=" * 70)
        print("✅ POSTED TO TELEGRAM!")
        print("=" * 70)
        print(f"Message ID: {message_id}")
        print(f"Channel: {CHANNEL_ID}")
        print("=" * 70)
    else:
        print(f"\n❌ Failed: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
