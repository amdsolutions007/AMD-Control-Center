#!/usr/bin/env python3
"""
Upload New Year 2026 Video to YouTube
"""
import sys
sys.path.insert(0, '/Users/mac/Desktop/AMD_Control_Center')

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os
import pickle

print("🎬 UPLOADING NEW YEAR 2026 VIDEO TO YOUTUBE")
print("=" * 60)

# Video details
video_file = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026_video.mp4'
title = "🎉 Happy New Year 2026! | Nigeria's AI Revolution Begins"
description = """Happy New Year 2026!

TO EVERY NIGERIAN BUILDER:

This is YOUR year. This is OUR year. This is NIGERIA's year.

I spent 3 years proving AI works. Now I'm showing YOU how to use it.

RiseTogether NG is LIVE:
💎 999 creatives backing 1 spotlight daily
🤖 AI tools for Nigerian businesses
🇳🇬 Building the digital future together

Want in? Reply "RISE" to +234 818 002 1007

Let's build! 🚀

#HappyNewYear2026 #AIRevolution #NigeriaBuilding #TechNigeria #AIForAfrica"""

tags = ["Nigeria", "AI", "2026", "New Year", "Technology", "African Tech", "RiseTogether", "Automation"]

print(f"📹 Video: {video_file}")
print(f"📝 Title: {title}")
print(f"🏷️  Tags: {', '.join(tags)}\n")

# Check if video exists
if not os.path.exists(video_file):
    print(f"❌ Video file not found: {video_file}")
    sys.exit(1)

# YouTube API scopes
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
token_file = '/Users/mac/Desktop/AMD_Control_Center/youtube_token.pickle'
credentials_file = '/Users/mac/Desktop/AMD_Control_Center/client_secret.json'

creds = None

# Try loading existing credentials
if os.path.exists(token_file):
    with open(token_file, 'rb') as token:
        creds = pickle.load(token)
        print("✅ Found existing YouTube credentials")

# If no valid credentials, authenticate
if not creds or not creds.valid:
    if os.path.exists(credentials_file):
        print("🔐 Authenticating with YouTube...")
        flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
        creds = flow.run_local_server(port=8080)
        
        # Save credentials
        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)
        print("✅ Authentication successful!")
    else:
        print(f"❌ Missing credentials file: {credentials_file}")
        print("💡 Please download OAuth 2.0 credentials from Google Cloud Console")
        sys.exit(1)

# Build YouTube service
youtube = build('youtube', 'v3', credentials=creds)

# Prepare video upload
body = {
    'snippet': {
        'title': title,
        'description': description,
        'tags': tags,
        'categoryId': '28'  # Science & Technology
    },
    'status': {
        'privacyStatus': 'public',  # or 'private', 'unlisted'
        'selfDeclaredMadeForKids': False
    }
}

# Create media upload
media = MediaFileUpload(video_file, chunksize=-1, resumable=True, mimetype='video/mp4')

print("📤 Uploading video to YouTube...")
print("⏳ This may take a few minutes...\n")

# Execute upload
request = youtube.videos().insert(
    part=','.join(body.keys()),
    body=body,
    media_body=media
)

response = None
while response is None:
    status, response = request.next_chunk()
    if status:
        print(f"📊 Uploaded {int(status.progress() * 100)}%")

print("\n" + "=" * 60)
print("✅ VIDEO UPLOADED SUCCESSFULLY!")
print("=" * 60)
print(f"🎬 Video ID: {response['id']}")
print(f"🔗 URL: https://www.youtube.com/watch?v={response['id']}")
print("=" * 60)
