#!/usr/bin/env python3
"""
Post New Year 2026 Message to Twitter/X
Using existing credentials
"""
import os
import sys
import tweepy
from dotenv import load_dotenv

# Load credentials from root .env
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("🐦 TWITTER/X NEW YEAR POST")
print("=" * 60)

# Get credentials
api_key = os.getenv('TWITTER_API_KEY') or os.getenv('TWITTER_CONSUMER_KEY')
api_secret = os.getenv('TWITTER_API_SECRET') or os.getenv('TWITTER_CONSUMER_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_secret = os.getenv('TWITTER_ACCESS_SECRET')

if not all([api_key, api_secret, access_token, access_secret]):
    print("❌ Missing Twitter credentials")
    sys.exit(1)

print("✅ Credentials loaded")

# New Year message with YouTube URL for Link Preview (FREE API - generates video card automatically)
tweet = """🎉 HAPPY NEW YEAR 2026! 🇳🇬

To every Nigerian builder - THIS IS YOUR YEAR!

3 years ago I partnered with AI. Today? 6 platforms automated. Everything running while I sleep.

Now I'm showing YOU how: https://www.youtube.com/watch?v=LqMKV8-88SQ

RiseTogether NG is LIVE! Reply 'RISE' to +234 818 002 1007

Let's build! 💪"""

print(f"📝 Tweet length: {len(tweet)} chars")
print("📹 Using YouTube URL for automatic video card preview (FREE API)")

try:
    # Try API v2 (recommended)
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )
    
    response = client.create_tweet(text=tweet)
    print("\n" + "=" * 60)
    print("✅ TWEET POSTED SUCCESSFULLY!")
    print("=" * 60)
    print(f"Tweet ID: {response.data['id']}")
    print(f"View: https://twitter.com/user/status/{response.data['id']}")
    print("=" * 60)
    
except Exception as e:
    error_msg = str(e)
    print(f"\n⚠️ API v2 failed: {error_msg}")
    
    # Try API v1.1 fallback
    try:
        print("\n🔄 Trying API v1.1...")
        auth = tweepy.OAuth1UserHandler(
            api_key, api_secret,
            access_token, access_secret
        )
        api = tweepy.API(auth)
        
        status = api.update_status(tweet)
        print("\n" + "=" * 60)
        print("✅ TWEET POSTED (v1.1)!")
        print("=" * 60)
        print(f"Tweet ID: {status.id}")
        print(f"View: https://twitter.com/user/status/{status.id}")
        print("=" * 60)
        
    except Exception as e2:
        print(f"\n❌ Both APIs failed!")
        print(f"v2 error: {error_msg}")
        print(f"v1.1 error: {str(e2)}")
        print("\n💡 Possible issues:")
        print("   - Credentials may need to be regenerated")
        print("   - App permissions may need updating")
        print("   - Account may have restrictions")
        sys.exit(1)
