#!/usr/bin/env python3
"""
AMD YOUTUBE TEST - OPERATION TUBE STRIKE
Upload Job1 video to YouTube as proof of concept
"""

import os
import pickle
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from pathlib import Path

# Paths
TOKEN_PATH = "youtube_token.pickle"
VIDEO_PATH = "social_engine/assets/Job1_NaijaBiz_Pilot/NaijaBiz_Pilot_Video_Master.mp4"

# Video metadata
VIDEO_TITLE = "AMD Intel Briefing: System Test"
VIDEO_DESCRIPTION = """AMD Solutions 007 - YouTube Integration Test

This is a system test of our automated content distribution infrastructure.

---
AMD Solutions 007
Building AI systems that generate real revenue.
🌐 https://amdsolutions007.com
📡 https://amd-signal-beacon.vercel.app
"""
VIDEO_TAGS = ["AMD Solutions", "AI", "Tech", "Nigeria", "System Test"]
VIDEO_CATEGORY = "28"  # Science & Technology
VIDEO_PRIVACY = "unlisted"  # Unlisted for testing

def load_youtube_credentials():
    """Load existing YouTube OAuth credentials"""
    if not os.path.exists(TOKEN_PATH):
        raise FileNotFoundError(f"❌ Token not found: {TOKEN_PATH}")
    
    with open(TOKEN_PATH, 'rb') as token:
        credentials = pickle.load(token)
    
    return credentials

def upload_video():
    """Upload video to YouTube"""
    
    print("=" * 60)
    print("🚀 OPERATION TUBE STRIKE - COMMENCING UPLOAD")
    print("=" * 60)
    
    # Load credentials
    print(f"\n🔑 Loading YouTube credentials from {TOKEN_PATH}...")
    credentials = load_youtube_credentials()
    print("✅ Credentials loaded")
    
    # Build YouTube API client
    print("\n🔧 Building YouTube API client...")
    youtube = build('youtube', 'v3', credentials=credentials)
    print("✅ YouTube API client ready")
    
    # Check video file
    video_path = Path(VIDEO_PATH)
    if not video_path.exists():
        raise FileNotFoundError(f"❌ Video not found: {VIDEO_PATH}")
    
    file_size = video_path.stat().st_size / (1024 * 1024)  # MB
    print(f"\n📹 Video file: {video_path.name}")
    print(f"   Size: {file_size:.2f} MB")
    print(f"   Path: {VIDEO_PATH}")
    
    # Prepare request body
    request_body = {
        'snippet': {
            'title': VIDEO_TITLE,
            'description': VIDEO_DESCRIPTION,
            'tags': VIDEO_TAGS,
            'categoryId': VIDEO_CATEGORY
        },
        'status': {
            'privacyStatus': VIDEO_PRIVACY,
            'selfDeclaredMadeForKids': False
        }
    }
    
    # Create media upload
    print(f"\n📤 Uploading to YouTube...")
    print(f"   Title: {VIDEO_TITLE}")
    print(f"   Privacy: {VIDEO_PRIVACY.upper()}")
    print(f"   Category: Science & Technology")
    
    media = MediaFileUpload(
        str(video_path),
        chunksize=-1,
        resumable=True,
        mimetype='video/mp4'
    )
    
    # Execute upload
    request = youtube.videos().insert(
        part='snippet,status',
        body=request_body,
        media_body=media
    )
    
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            print(f"   Upload progress: {progress}%", end='\r')
    
    print("\n")
    
    # Extract video ID
    video_id = response['id']
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    
    print("=" * 60)
    print("✅ TUBE STRIKE SUCCESSFUL")
    print("=" * 60)
    print(f"\n🎯 Video ID: {video_id}")
    print(f"📺 URL: {video_url}")
    print(f"🔒 Privacy: {VIDEO_PRIVACY.upper()}")
    print(f"\n📊 Video Details:")
    print(f"   Title: {response['snippet']['title']}")
    print(f"   Channel: {response['snippet']['channelTitle']}")
    print(f"   Published: {response['snippet']['publishedAt']}")
    print("\n" + "=" * 60)
    
    return video_url

if __name__ == "__main__":
    try:
        video_url = upload_video()
        print(f"\n🚀 MISSION COMPLETE: {video_url}")
    except Exception as e:
        print(f"\n❌ TUBE STRIKE FAILED: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
