#!/usr/bin/env python3
"""Quick Twitter Post for New Year"""

import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import tweepy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Twitter API credentials
API_KEY = os.getenv('TWITTER_API_KEY')
API_SECRET = os.getenv('TWITTER_API_SECRET')
ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN')
ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET')

# Authenticate
auth = tweepy.OAuth1UserHandler(API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET)
api = tweepy.API(auth)
client = tweepy.Client(
    consumer_key=API_KEY,
    consumer_secret=API_SECRET,
    access_token=ACCESS_TOKEN,
    access_token_secret=ACCESS_SECRET
)

# New Year Post
tweet = """🇳🇬 3 YEARS AGO, I MADE A DECISION...

I partnered with AI. Not just used it. PARTNERED.

Today?
✅ 6 platforms automated
✅ WhatsApp empire
✅ Social media on autopilot
✅ Videos by AI
✅ RiseTogether NG launched

In 2 hours = 2026.

AI is not the future.
AI is NOW.

Ready? 🚀

#AI2026"""

print("📤 Posting to Twitter...")
response = client.create_tweet(text=tweet)
tweet_id = response.data['id']
print(f"✅ SUCCESS! Tweet ID: {tweet_id}")
print(f"🔗 https://twitter.com/user/status/{tweet_id}")
