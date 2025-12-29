#!/usr/bin/env python3
"""Test Twitter authentication"""

import tweepy

# Your credentials
access_token = "1564961774864064513-8arCbbxtoFDCdFiYI56l7IxEzuoJqN"
access_secret = "hB6FSIbfhq96ZQVcq8HpZeP7jxsBE2akwYRZnotIaCTPX"
bearer_token = "AAAAAAAAAAAAAAAAAAAAALsw6gEAAAAAS3SgVVOcL82%2B3cT11MCZ2XyBU70%3DoqLiImu9ebxEjXF8dfHKxYdCo0DzPa5uTcUypvxtREi7rmQjkF"

# Test 1: Bearer token only (read-only)
print("Test 1: Bearer Token Authentication")
print("=" * 60)
try:
    client = tweepy.Client(bearer_token=bearer_token)
    me = client.get_me()
    if me and me.data:
        print(f"✅ SUCCESS! Authenticated as: @{me.data.username}")
        print(f"   Name: {me.data.name}")
        print(f"   ID: {me.data.id}")
    else:
        print("❌ Authentication failed - no user data returned")
except Exception as e:
    print(f"❌ ERROR: {e}")

print("\n" + "=" * 60)
print("\nNOTE: To POST tweets, you need Consumer Key/Secret.")
print("Go to: https://developer.twitter.com/en/portal/dashboard")
print("Find: 'Consumer Keys' or 'API Key and Secret'")
