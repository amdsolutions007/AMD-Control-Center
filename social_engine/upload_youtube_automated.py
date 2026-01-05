#!/usr/bin/env python3
"""
Automated YouTube Upload - New Year 2026 Video
Using EXISTING credentials (no manual upload needed)
"""
import os
import pickle
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

print("🚀 Automated YouTube Upload")
print("=" * 60)

# Paths (CORRECT ones with existing credentials)
credentials_file = '/Users/mac/Desktop/AMD_Control_Center/social_engine/client_secrets.json'
token_file = '/Users/mac/Desktop/AMD_Control_Center/youtube_token.pickle'
video_file = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026_final.mp4'

# Check files exist
if not os.path.exists(credentials_file):
    print(f"❌ Credentials not found: {credentials_file}")
    exit(1)

if not os.path.exists(video_file):
    print(f"❌ Video not found: {video_file}")
    print("⏳ Video may still be rendering...")
    exit(1)

print(f"✅ Credentials: {credentials_file}")
print(f"✅ Video: {video_file}")

# Authenticate
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
creds = None

# Load saved token if exists
if os.path.exists(token_file):
    with open(token_file, 'rb') as token:
        creds = pickle.load(token)
    print("✅ Using saved authentication token")

# If no valid credentials, authenticate
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        print("🔄 Refreshing expired token...")
        creds.refresh(Request())
    else:
        print("🔐 Starting OAuth flow...")
        flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
        creds = flow.run_local_server(port=0)
    
    # Save token
    with open(token_file, 'wb') as token:
        pickle.dump(creds, token)
    print("✅ Authentication token saved")

# Build YouTube API client
youtube = build('youtube', 'v3', credentials=creds)

# Video metadata
body = {
    'snippet': {
        'title': '🎉 Happy New Year 2026! | Nigeria\'s AI Revolution Begins 🇳🇬',
        'description': '''HAPPY NEW YEAR 2026! 🎊

To every Nigerian builder - this is YOUR year. This is OUR year. This is NIGERIA's year.

Three years ago, I made a decision. I partnered with AI. Not just used it... I PARTNERED with it.

Today? Six platforms automated. WhatsApp empire built. Social media on autopilot. Videos created by AI. Everything running while I sleep.

And now, I'm showing YOU how to do the same.

🚀 RiseTogether NG is LIVE
Nine hundred and ninety-nine Nigerian creatives, backing one spotlight daily. AI tools for Nigerian businesses. Building the digital future together.

Want in? Reply 'RISE' to +234 818 002 1007

2026. The year Nigeria rises. Let's build! 💪

#NewYear2026 #Nigeria #AIRevolution #AfricanTech #NigerianCreatives #RiseTogetherNG #TechInAfrica #BuildInPublic''',
        'tags': ['Nigeria', 'AI', '2026', 'Technology', 'African Tech', 'New Year', 'Innovation', 'Automation', 'Nigerian Business', 'AI Revolution'],
        'categoryId': '28'  # Science & Technology
    },
    'status': {
        'privacyStatus': 'public',
        'selfDeclaredMadeForKids': False
    }
}

print("\n📤 Uploading to YouTube...")
print(f"Title: {body['snippet']['title']}")

# Upload
media = MediaFileUpload(video_file, chunksize=-1, resumable=True)
request = youtube.videos().insert(
    part='snippet,status',
    body=body,
    media_body=media
)

response = None
while response is None:
    status, response = request.next_chunk()
    if status:
        progress = int(status.progress() * 100)
        print(f"⏳ Uploaded: {progress}%")

print("\n" + "=" * 60)
print("✅ VIDEO UPLOADED SUCCESSFULLY!")
print("=" * 60)
print(f"Video ID: {response['id']}")
print(f"Watch: https://www.youtube.com/watch?v={response['id']}")
print("=" * 60)
