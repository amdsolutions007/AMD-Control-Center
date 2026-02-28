#!/usr/bin/env python3
"""
Direct Lagos post publisher — bypasses Telegram bot, runs inline.
Uses BrightData Scraping Browser (BRIGHTDATA_WS_ENDPOINT) for CF bypass.
Run via: npx @railway/cli run python3 tools/direct_publish_lagos.py
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from content_generator import ContentGenerator
from leke_leke_browser_automation import LekeLekeeAutomation

def main():
    print("=" * 60)
    print("DIRECT LAGOS PUBLISHER - Day 1/36")
    print("=" * 60)

    # Verify BrightData endpoint is set
    bd_endpoint = os.environ.get("BRIGHTDATA_WS_ENDPOINT", "").strip()
    if bd_endpoint:
        host = bd_endpoint.split("@")[-1] if "@" in bd_endpoint else bd_endpoint[:40]
        print(f"\u2705 BrightData endpoint active: ...@{host}")
    else:
        print("\u26a0\ufe0f  BRIGHTDATA_WS_ENDPOINT not set \u2014 CF bypass will NOT be active")

    email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
    password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
    if not email or not password:
        print("\u274c LEKE_LEKE_EMAIL or LEKE_LEKE_PASSWORD not set \u2014 aborting")
        sys.exit(1)
    print(f"\u2705 Credentials: {email}")

    # Build Lagos (Day 1) post
    gen = ContentGenerator()
    gen.current_day = 0          # Force Day 1 = Lagos
    state   = gen.get_current_state()
    caption = gen.generate_caption(state)
    post_data = {
        "day": 1,
        "state_name": state["name"],
        "capital":    state.get("capital", "Ikeja"),
        "zone":       state.get("zone", "South West"),
        "caption":    caption,
        "image_path": None,
    }

    print(f"\n\U0001f4dd Post: Day {post_data['day']}/36 \u2014 {post_data['state_name']}")
    print(f"   Caption ({len(caption)} chars): {caption[:80]}...")

    # Launch browser + login + dual-post
    print("\n\U0001f310 Starting browser...")
    browser = LekeLekeeAutomation(email=email, password=password, headless=True)
    try:
        if not browser.start_browser():
            print("\u274c Browser failed to start")
            sys.exit(1)

        print("\U0001f510 Logging in...")
        if not browser.login():
            print("\u274c Login failed")
            sys.exit(1)
        print("\u2705 Logged in")

        print("\n\U0001f680 Running dual-post (Group \u2192 5-min delay \u2192 Feed)...")
        success = browser.post_dual_destination(post_data)

        if success:
            browser.archive_posted("post_1_20260228_110046", post_data)
            print("\n" + "=" * 60)
            print("\U0001f7e2 LAGOS IS LIVE")
            print("   \u2705 African Tech Ecosystem Group \u2014 POSTED")
            print("   \u2705 General Feed \u2014 POSTED")
            print("=" * 60)
        else:
            print("\n\u274c Dual-post FAILED")
            sys.exit(1)

    finally:
        browser.close()

    email    = os.environ.get("LEKE_LEKE_EMAIL", "")
    password = os.environ.get("LEKE_LEKE_PASSWORD", "")
    if not email:
        print("❌ LEKE_LEKE_EMAIL not set")
        sys.exit(1)

    # Build Lagos (Day 1) post
    gen = ContentGenerator()
    gen.current_day = 0  # Force Day 1 = Lagos
    state = gen.get_current_state()
    caption = gen.generate_caption(state)
    post = {
        "day": 1,
        "state_name": state["name"],
        "capital": state.get("capital", "Ikeja"),
        "zone": state.get("zone", "South West"),
        "caption": caption,
        "graphic_path": None,
        "post_id": "post_1_20260228_110046",
    }

    print(f"\n📝 Post: Day {post['day']}/36 — {post['state_name']}")
    print(f"   Caption preview: {caption[:80]}...")

    # --- Group post (full caption) ---
    print("\n🚀 Step 1: Posting to GROUP (African Tech Ecosystem)...")
    bot_group = LekeLeekeBrowserAutomation(email=email, password=password)
    try:
        ok = bot_group.post_to_leke_leke(
            caption=caption,
            image_path=post.get("graphic_path"),
            destination="group",
        )
        if ok:
            print("✅ Group post: SUCCESS")
        else:
            print("❌ Group post: FAILED")
            sys.exit(1)
    finally:
        bot_group.close()

    # --- 5-minute delay ---
    delay = 300
    print(f"\n⏳ Waiting {delay}s before General Feed post...")
    import time
    time.sleep(delay)

    # --- Feed post (slim caption ≤490 chars) ---
    slim = caption[:487] + "..." if len(caption) > 490 else caption
    print("\n🚀 Step 2: Posting to GENERAL FEED...")
    bot_feed = LekeLeekeBrowserAutomation(email=email, password=password)
    try:
        ok = bot_feed.post_to_leke_leke(
            caption=slim,
            image_path=post.get("graphic_path"),
            destination="feed",
        )
        if ok:
            print("✅ Feed post: SUCCESS")
        else:
            print("❌ Feed post: FAILED")
            sys.exit(1)
    finally:
        bot_feed.close()

    print("\n" + "=" * 60)
    print("✅ LAGOS IS LIVE — Day 1/36 posted to Group + Feed")
    print("=" * 60)


if __name__ == "__main__":
    main()
