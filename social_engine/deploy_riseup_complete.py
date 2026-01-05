#!/usr/bin/env python3
"""
Rise Up Trilogy - Complete Multi-Platform Deployment
X + Telegram + LinkedIn (Profile + Business Page)
"""
import os
import sys
from dotenv import load_dotenv
import tweepy
import requests
from pathlib import Path

load_dotenv('/Users/mac/Desktop/AMD_Control_Center/social_engine/.env')

print("🚀 RISE UP TRILOGY - COMPLETE DEPLOYMENT")
print("=" * 70)

YOUTUBE_URL = 'https://www.youtube.com/watch?v=3B7Gv-1AdvU'
VIDEO_FILE = '/Users/mac/Desktop/AMD_Control_Center/social_engine/RiseUp_Launch_Master.mp4'

print(f"📹 YouTube: {YOUTUBE_URL}")
print(f"📁 Video File: {Path(VIDEO_FILE).name}\n")

# ============= X (TWITTER) =============
print("🐦 POSTING TO X (WITH YOUTUBE LINK)...")

tweet = f"""RISE UP: The Trilogy 🇳🇬

Act I - The Awakening
Act II - The Architect  
Act III - The Invitation

From darkness to light. From silence to voice. From waiting to building.

We are not asking for permission. We are building the future.

Watch: {YOUTUBE_URL}

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
    
    print(f"✅ X: Posted successfully!")
    print(f"   Tweet ID: {response.data['id']}")
    print(f"   View: {tweet_url}")
    
except Exception as e:
    if "429" in str(e) or "rate limit" in str(e).lower():
        print(f"⏳ X: Rate limited - retry in 15-30 minutes")
    elif "403" in str(e):
        print(f"⏳ X: Rate limited (403) - retry in 15-30 minutes")
    else:
        print(f"⚠️ X: {e}")

# ============= TELEGRAM =============
print("\n📱 POSTING TO TELEGRAM (RETRY)...")

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
CHANNEL_ID = os.getenv('TELEGRAM_CHANNEL_ID') or '@amdsolutions007'

caption = f"""🎬 RISE UP: THE TRILOGY

Act I - The Awakening
Act II - The Architect  
Act III - The Invitation

From darkness to light. From silence to voice. From waiting to building.

We are not asking for permission. We are building the future. 🇳🇬

📹 Watch in HD: {YOUTUBE_URL}

#RiseUpNigeria #NigerianTech #BuildInPublic"""

try:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendVideo"
    
    print("   Uploading video (52 MB)...")
    
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
        print(f"✅ Telegram: Posted successfully!")
        print(f"   Message ID: {message_id}")
        print(f"   Channel: {CHANNEL_ID}")
    else:
        print(f"⚠️ Telegram: {response.status_code} - {response.text[:100]}")
        
except Exception as e:
    print(f"⚠️ Telegram: {str(e)[:100]}")

# ============= LINKEDIN BUSINESS PAGE =============
print("\n💼 POSTING TO LINKEDIN BUSINESS PAGE...")

ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN')

if ACCESS_TOKEN:
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # Get organizations (business pages)
    org_url = 'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&projection=(elements*(organizationalTarget~(localizedName)))'
    
    try:
        org_response = requests.get(org_url, headers=headers)
        
        if org_response.status_code == 200:
            orgs = org_response.json()
            
            if 'elements' in orgs and len(orgs['elements']) > 0:
                # Get first organization
                org_urn = orgs['elements'][0]['organizationalTarget']
                org_name = orgs['elements'][0]['organizationalTarget~']['localizedName']
                
                print(f"   Found business page: {org_name}")
                
                # Post to business page
                post_text = f"""RISE UP: The Trilogy 🇳🇬

Act I - The Awakening
Act II - The Architect  
Act III - The Invitation

From darkness to light. From silence to voice. From waiting to building.

We are not asking for permission. We are building the future.

This is the story of Nigeria's digital transformation. Every line of code. Every late night. Every "impossible" problem solved.

Watch the full trilogy: {YOUTUBE_URL}

Built by AMD Media Solutions.
Founded by a father of 4 who refused to wait.

#RiseUpNigeria #NigerianTech #DigitalTransformation #AfricaTech #BuildInPublic #SoftwareEngineering #Innovation"""

                business_post = {
                    "author": org_urn,
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
                
                ugc_url = 'https://api.linkedin.com/v2/ugcPosts'
                post_response = requests.post(ugc_url, headers=headers, json=business_post)
                
                if post_response.status_code == 201:
                    post_data = post_response.json()
                    print(f"✅ LinkedIn Business Page: Posted successfully!")
                    print(f"   Page: {org_name}")
                    print(f"   Post ID: {post_data['id']}")
                else:
                    print(f"⚠️ LinkedIn Business Page: {post_response.status_code}")
                    print(f"   Response: {post_response.text[:200]}")
            else:
                print("⚠️ No business pages found on this account")
        else:
            print(f"⚠️ Could not fetch organizations: {org_response.status_code}")
            
    except Exception as e:
        print(f"⚠️ LinkedIn Business Page: {str(e)[:100]}")
else:
    print("⚠️ No LinkedIn access token")

# ============= SUMMARY =============
print("\n" + "=" * 70)
print("✅ DEPLOYMENT COMPLETE")
print("=" * 70)
print(f"📹 YouTube: {YOUTUBE_URL}")
print(f"🐦 X: Check status above")
print(f"📱 Telegram: Check status above")
print(f"💼 LinkedIn Profile: Already posted (ID: urn:li:share:7412651210727497728)")
print(f"💼 LinkedIn Business: Check status above")
print("=" * 70)
