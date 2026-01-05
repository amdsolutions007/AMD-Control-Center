#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - X (TWITTER) DEPLOYMENT (OPTIMIZED)
═══════════════════════════════════════════════════════════════════════════
Protocol: YouTube Link ONLY (Free API Rule) + Urgency
═══════════════════════════════════════════════════════════════════════════
"""

import os
from pathlib import Path
import tweepy
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")


def _env(*names: str) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return None

# YOUTUBE URL (already uploaded)
YOUTUBE_URL = "https://www.youtube.com/watch?v=lpK6yNxeHjw"  # Updated for NaijaBiz Pilot campaign

# OPTIMIZED X Caption (keep <= 280 chars)
X_CAPTION = f"""Stop losing customers while you sleep. 😴💸

NaijaBiz Pilot = 24/7 WhatsApp sales rep.
✅ Replies in 1s
✅ Closes deals at 3AM
⚡ 5 slots this week

DM "PILOT"
Demo 🎬 {YOUTUBE_URL}

#WhatsAppAutomation #AI"""

print("═" * 75)
print("🐦 X (TWITTER) DEPLOYMENT - NAIJABIZ PILOT (OPTIMIZED)")
print("═" * 75)
print()
print("ℹ️  Using YouTube link (X free-tier rule)")
print()
print("📝 OPTIMIZED Caption (with urgency + scarcity):")
print("-" * 75)
print(X_CAPTION)
print("-" * 75)
print(f"📊 Length: {len(X_CAPTION)} characters")
print()

# Hard guard: X standard limit is 280 chars
if len(X_CAPTION) > 280:
    print("❌ ERROR: Caption exceeds 280 characters. Shorten X_CAPTION.")
    print("═" * 75)
    raise SystemExit(1)

# Validate YouTube URL
if not YOUTUBE_URL.startswith("https://www.youtube.com/watch?v="):
    print("❌ ERROR: Invalid YouTube URL format in YOUTUBE_URL")
    print(f"Got: {YOUTUBE_URL}")
    print("Expected: https://www.youtube.com/watch?v=VIDEO_ID")
    print("═" * 75)
    exit(1)

try:
    # Authenticate
    client = tweepy.Client(
        consumer_key=_env('TWITTER_API_KEY', 'TWITTER_CONSUMER_KEY'),
        consumer_secret=_env('TWITTER_API_SECRET', 'TWITTER_CONSUMER_SECRET'),
        access_token=_env('TWITTER_ACCESS_TOKEN'),
        access_token_secret=_env('TWITTER_ACCESS_TOKEN_SECRET', 'TWITTER_ACCESS_SECRET')
    )
    
    print("🔑 Authenticated with X API")
    print("📤 Posting optimized caption...")
    print()
    
    # Post tweet
    response = client.create_tweet(text=X_CAPTION)
    tweet_id = response.data['id']
    
    print("✅ POSTED TO X!")
    print(f"🔗 Tweet ID: {tweet_id}")
    print(f"🔗 URL: https://twitter.com/user/status/{tweet_id}")
    print()
    print("🎬 Twitter will auto-generate video preview card from YouTube link!")
    print()
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Error ({type(e).__name__}): {e}")
    print()

    # Tweepy exceptions often include the underlying HTTP response
    resp = getattr(e, "response", None)
    status = getattr(resp, "status_code", None) if resp is not None else None
    body = None
    if resp is not None:
        try:
            body = resp.text
        except Exception:
            body = None

    if status is not None:
        print(f"📡 HTTP Status: {status}")
    if body:
        print("📡 Response body:")
        print(body)

    api_errors = getattr(e, "api_errors", None)
    if api_errors:
        print("📌 API errors:")
        print(api_errors)

    print()
    if status == 401 or "401" in str(e):
        print("🔑 401 Unauthorized: credential values missing/invalid (check .env keys)")
    elif status == 429 or "429" in str(e):
        print("⏳ 429 Rate limited: wait, then retry")
    elif status == 403 or "403" in str(e):
        print("🚫 403 Forbidden: X blocked this action (common causes: app write permission, duplicate content, account restrictions, or access level)")

    print("═" * 75)
