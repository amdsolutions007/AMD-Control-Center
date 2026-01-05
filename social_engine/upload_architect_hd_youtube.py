#!/usr/bin/env python3
"""
Upload HD Architect Video to YouTube and Post to All Platforms
"""
import os
import sys
from pathlib import Path
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

print("📹 UPLOADING HD ARCHITECT VIDEO TO YOUTUBE")
print("=" * 70)

# Paths
VIDEO_FILE = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_video_hd.mp4'
credentials_file = '/Users/mac/Desktop/AMD_Control_Center/social_engine/client_secrets.json'
token_file = '/Users/mac/Desktop/AMD_Control_Center/youtube_token.pickle'

video_size = Path(VIDEO_FILE).stat().st_size / (1024 * 1024)
print(f"✅ Video: linkedin_video_hd.mp4 ({video_size:.1f} MB, 1920x1080 Full HD)")

# OAuth2
creds = None
if os.path.exists(token_file):
    with open(token_file, 'rb') as token:
        creds = pickle.load(token)

if creds and creds.expired and creds.refresh_token:
    creds.refresh(Request())

youtube = build('youtube', 'v3', credentials=creds)

body = {
    'snippet': {
        'title': 'The Architect: Building Nigeria\'s Digital Future 🇳🇬 | Olawale Shoyemi',
        'description': '''This is Olawale Shoyemi - Founder of AMD Media Solutions.

"They told us to stay in the dark, so I built a torch." 🔦

I don't just write code; I engineer Nations.
We are building the Digital Future of Nigeria.

🔗 Connect with me on LinkedIn (Accepting 100 new connections):
https://www.linkedin.com/in/amdsolutions007

🇳🇬 AMD Media Solutions
🌐 https://www.amdsolutions007.com
📧 Contact: +234 818 002 1007

#NigerianTech #SoftwareEngineering #AIRevolution #BuildInPublic #LinkedInNetworking #DigitalTransformation #AfricaTech''',
        'tags': ['Nigerian Tech', 'Software Engineering', 'LinkedIn', 'Networking', 'CEO', 'Founder', 'Digital Transformation', 'Africa'],
        'categoryId': '28'
    },
    'status': {
        'privacyStatus': 'public',
        'selfDeclaredMadeForKids': False
    }
}

print("\n📤 Uploading...")

try:
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
    
    # Save for X posting
    with open('/Users/mac/Desktop/AMD_Control_Center/social_engine/architect_hd_youtube_id.txt', 'w') as f:
        f.write(video_id)
    
    print(f"\n✅ Ready for multi-platform broadcast!")
    
except Exception as e:
    print(f"\n❌ Upload failed: {e}")
    sys.exit(1)
