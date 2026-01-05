#!/usr/bin/env python3
"""
LinkedIn API - Post Rise Up Trilogy
"""
import os
import sys
from dotenv import load_dotenv
import requests

load_dotenv('/Users/mac/Desktop/AMD_Control_Center/social_engine/.env')

print("💼 LINKEDIN - RISE UP TRILOGY POST")
print("=" * 70)

# Get credentials
ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN')
YOUTUBE_URL = 'https://www.youtube.com/watch?v=3B7Gv-1AdvU'

if not ACCESS_TOKEN:
    print("❌ LINKEDIN_ACCESS_TOKEN not found in .env")
    sys.exit(1)

print(f"✅ Access Token: {ACCESS_TOKEN[:20]}...")
print(f"✅ YouTube URL: {YOUTUBE_URL}")

# Step 1: Get user profile (person URN)
print("\n📋 STEP 1: Getting your LinkedIn profile...")

headers = {
    'Authorization': f'Bearer {ACCESS_TOKEN}',
    'Content-Type': 'application/json'
}

# Get user info
userinfo_url = 'https://api.linkedin.com/v2/userinfo'
response = requests.get(userinfo_url, headers=headers)

if response.status_code != 200:
    print(f"❌ Failed to get profile: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)

user_info = response.json()
user_sub = user_info['sub']  # This is the user ID
print(f"✅ LinkedIn Profile: {user_info.get('name', 'Unknown')}")
print(f"   User ID: {user_sub}")

# Step 2: Create the post
print("\n📝 STEP 2: Creating LinkedIn post...")

# Post content
post_text = """RISE UP: The Trilogy 🇳🇬

Act I - The Awakening
Act II - The Architect  
Act III - The Invitation

From darkness to light. From silence to voice. From waiting to building.

We are not asking for permission. We are building the future.

This is the story of Nigeria's digital transformation. Every line of code. Every late night. Every "impossible" problem solved.

Watch the full trilogy: https://www.youtube.com/watch?v=3B7Gv-1AdvU

Built by AMD Media Solutions.
Founded by a father of 4 who refused to wait.

#RiseUpNigeria #NigerianTech #DigitalTransformation #AfricaTech #BuildInPublic #SoftwareEngineering #Innovation"""

# LinkedIn API v2 UGC Post format
post_data = {
    "author": f"urn:li:person:{user_sub}",
    "lifecycleState": "PUBLISHED",
    "specificContent": {
        "com.linkedin.ugc.ShareContent": {
            "shareCommentary": {
                "text": post_text
            },
            "shareMediaCategory": "ARTICLE",
            "media": [
                {
                    "status": "READY",
                    "description": {
                        "text": "Rise Up: The Trilogy - Nigeria's Digital Awakening"
                    },
                    "originalUrl": YOUTUBE_URL,
                    "title": {
                        "text": "Rise Up: The Trilogy 🇳🇬"
                    }
                }
            ]
        }
    },
    "visibility": {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
}

# Post to LinkedIn
ugc_url = 'https://api.linkedin.com/v2/ugcPosts'
response = requests.post(ugc_url, headers=headers, json=post_data)

if response.status_code == 201:
    post_response = response.json()
    post_id = post_response['id']
    
    print("\n" + "=" * 70)
    print("✅ POSTED TO LINKEDIN!")
    print("=" * 70)
    print(f"Post ID: {post_id}")
    print(f"Caption: {post_text[:100]}...")
    print(f"YouTube Link: {YOUTUBE_URL}")
    print("\n💼 Check your LinkedIn profile to see the post!")
    print("=" * 70)
    
elif response.status_code == 422:
    print(f"\n⚠️  Post validation failed: {response.status_code}")
    print(f"Response: {response.text}")
    print("\n💡 Trying simpler text-only post...")
    
    # Fallback: Simple text post without media
    simple_post = {
        "author": f"urn:li:person:{user_sub}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": post_text
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    response2 = requests.post(ugc_url, headers=headers, json=simple_post)
    
    if response2.status_code == 201:
        post_response = response2.json()
        post_id = post_response['id']
        
        print("\n" + "=" * 70)
        print("✅ POSTED TO LINKEDIN (TEXT-ONLY)!")
        print("=" * 70)
        print(f"Post ID: {post_id}")
        print(f"Caption includes YouTube link: {YOUTUBE_URL}")
        print("\n💼 Check your LinkedIn profile!")
        print("=" * 70)
    else:
        print(f"\n❌ Text post also failed: {response2.status_code}")
        print(f"Response: {response2.text}")
        sys.exit(1)
else:
    print(f"\n❌ Post failed: {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)

print("\n🎬 THE TRILOGY HAS BEEN SHARED ON LINKEDIN.")
