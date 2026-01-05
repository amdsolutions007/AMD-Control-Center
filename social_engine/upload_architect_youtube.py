#!/usr/bin/env python3
"""
Upload The Architect's Video to YouTube
Then post to X with video link (following protocol)
"""
import os
import sys
from pathlib import Path
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from dotenv import load_dotenv

# Load environment
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("📹 UPLOADING THE ARCHITECT'S VIDEO TO YOUTUBE")
print("=" * 70)

# Paths
VIDEO_FILE = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_video.mp4'
credentials_file = '/Users/mac/Desktop/AMD_Control_Center/social_engine/client_secrets.json'
token_file = '/Users/mac/Desktop/AMD_Control_Center/youtube_token.pickle'

# Verify files exist
if not Path(VIDEO_FILE).exists():
    print(f"❌ Video not found: {VIDEO_FILE}")
    sys.exit(1)

video_size = Path(VIDEO_FILE).stat().st_size / (1024 * 1024)
print(f"✅ Video: linkedin_video.mp4 ({video_size:.1f} MB)")

# OAuth2 authentication
creds = None
if os.path.exists(token_file):
    with open(token_file, 'rb') as token:
        creds = pickle.load(token)
        print("✅ Using saved YouTube credentials")

if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        print("✅ Refreshed YouTube credentials")
    else:
        print("❌ No valid credentials - run setup first")
        sys.exit(1)

# Build YouTube client
youtube = build('youtube', 'v3', credentials=creds)

# Video metadata
body = {
    'snippet': {
        'title': 'The Architect: Building Nigeria\'s Digital Future 🇳🇬',
        'description': '''This is Olawale Shoyemi - Founder of AMD Media Solutions.

"They told us to stay in the dark, so I built a torch."

I don't just write code; I engineer Nations.
We are building the Digital Future of Nigeria.

Connect with me on LinkedIn:
https://www.linkedin.com/in/amdsolutions007

🇳🇬 AMD Media Solutions
🌐 https://www.amdsolutions007.com
📧 Contact: +234 818 002 1007

#NigerianTech #SoftwareEngineering #AIRevolution #BuildInPublic #LinkedInNetworking''',
        'tags': ['Nigerian Tech', 'Software Engineering', 'AI', 'LinkedIn', 'Networking', 'Digital Transformation', 'Africa Tech'],
        'categoryId': '28'  # Science & Technology
    },
    'status': {
        'privacyStatus': 'public',
        'selfDeclaredMadeForKids': False
    }
}

print("\n📤 Uploading to YouTube...")
print(f"   Title: {body['snippet']['title']}")
print(f"   Category: Science & Technology")
print(f"   Privacy: Public")

try:
    # Upload video
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
            print(f"   Upload: {int(status.progress() * 100)}%")
    
    video_id = response['id']
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    
    print("\n" + "=" * 70)
    print("✅ UPLOADED TO YOUTUBE!")
    print("=" * 70)
    print(f"Video ID: {video_id}")
    print(f"URL: {video_url}")
    print("=" * 70)
    
    # Save video ID for X posting
    with open('/Users/mac/Desktop/AMD_Control_Center/social_engine/architect_youtube_id.txt', 'w') as f:
        f.write(video_id)
    
    print("\n✅ Video ID saved - ready for X posting with protocol!")
    
    sys.exit(0)
    
except Exception as e:
    print(f"\n❌ Upload failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
