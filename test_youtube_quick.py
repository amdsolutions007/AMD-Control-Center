#!/usr/bin/env python3
import pickle
import os
from pathlib import Path

print("🔍 Testing YouTube credentials...")

# Check token
token_path = "youtube_token.pickle"
if not os.path.exists(token_path):
    print(f"❌ Token not found: {token_path}")
    exit(1)

print(f"✅ Token file found: {token_path}")

# Load token
try:
    with open(token_path, 'rb') as f:
        creds = pickle.load(f)
    print(f"✅ Token loaded successfully")
    print(f"   Type: {type(creds).__name__}")
    
    if hasattr(creds, 'valid'):
        print(f"   Valid: {creds.valid}")
    if hasattr(creds, 'expired'):
        print(f"   Expired: {creds.expired}")
    if hasattr(creds, 'token'):
        print(f"   Has access token: Yes")
        
except Exception as e:
    print(f"❌ Failed to load token: {e}")
    exit(1)

# Check video
video_path = Path("social_engine/assets/Job1_NaijaBiz_Pilot/NaijaBiz_Pilot_Video_Master.mp4")
if video_path.exists():
    size_mb = video_path.stat().st_size / (1024 * 1024)
    print(f"\n✅ Video found: {video_path.name}")
    print(f"   Size: {size_mb:.2f} MB")
else:
    print(f"\n❌ Video not found: {video_path}")
    exit(1)

# Try to build YouTube client
try:
    from googleapiclient.discovery import build
    print(f"\n🔧 Building YouTube API client...")
    youtube = build('youtube', 'v3', credentials=creds)
    print(f"✅ YouTube API client created")
    
    # Test API call
    print(f"\n🧪 Testing API connection...")
    request = youtube.channels().list(part='snippet', mine=True)
    response = request.execute()
    
    if 'items' in response and len(response['items']) > 0:
        channel = response['items'][0]['snippet']
        print(f"✅ Connected to YouTube!")
        print(f"   Channel: {channel['title']}")
        print(f"   Description: {channel.get('description', 'N/A')[:50]}...")
        print(f"\n🚀 CREDENTIALS ARE ACTIVE AND READY")
    else:
        print(f"⚠️ Connected but no channel found")
        
except Exception as e:
    print(f"❌ API test failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
