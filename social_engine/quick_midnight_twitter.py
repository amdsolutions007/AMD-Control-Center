#!/usr/bin/env python3
import tweepy
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

def _env(*names: str) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return None

client = tweepy.Client(
    bearer_token=os.getenv('TWITTER_BEARER_TOKEN'),
    consumer_key=_env('TWITTER_API_KEY', 'TWITTER_CONSUMER_KEY'),
    consumer_secret=_env('TWITTER_API_SECRET', 'TWITTER_CONSUMER_SECRET'),
    access_token=_env('TWITTER_ACCESS_TOKEN'),
    access_token_secret=_env('TWITTER_ACCESS_TOKEN_SECRET', 'TWITTER_ACCESS_SECRET')
)

tweet = """🎉 HAPPY NEW YEAR 2026! 🎉

TO EVERY NIGERIAN BUILDER:

This is YOUR year.
This is OUR year.
This is NIGERIA's year.

I spent 3 years proving AI works.
Now I'm showing YOU how to use it.

RiseTogether NG is LIVE:
💎 999 creatives backing 1 spotlight daily
🤖 AI tools for Nigerian"""

response = client.create_tweet(text=tweet)
print(f"✅ Twitter posted! Tweet ID: {response.data['id']}")
