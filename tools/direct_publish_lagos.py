#!/usr/bin/env python3
"""
Direct Lagos post publisher — pure REST API (no browser).
Uses JWT Bearer token to post directly to LekeeLekee API.

Group API:  POST /api/v1/groups/{group_id}/posts
Feed API:   POST /api/v1/users/{user_id}/posts  (fallback variants)

Run via: npx @railway/cli run --service telegram-approval-bot python3 tools/direct_publish_lagos.py
"""
import os
import sys
import time

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import requests
except ImportError:
    os.system("pip install requests -q")
    import requests

from content_generator import ContentGenerator

BASE_URL = "https://www.lekeelekee.com"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"   # African Tech Ecosystem 🌍


def get_session(email: str, password: str):
    """Login and return (session, token, user_id)."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Origin": BASE_URL,
        "Referer": BASE_URL + "/",
        "Accept": "application/json",
    })
    for attempt in range(1, 4):
        resp = session.post(
            f"{BASE_URL}/api/v1/auth/login",
            data={"email": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        if resp.status_code == 429:
            wait = 60 * attempt
            print(f"⏳ Rate limited — waiting {wait}s (attempt {attempt}/3)...")
            time.sleep(wait)
            continue
        break
    if resp.status_code != 200:
        raise RuntimeError(f"Login failed: HTTP {resp.status_code} — {resp.text[:200]}")
    data = resp.json()
    if data.get("status") != "success":
        raise RuntimeError(f"Login error: {data.get('message', resp.text[:100])}")
    token   = data["data"]["token"]
    user_id = data["data"]["user"]["public_id"]
    print(f"  ✅ Token: {len(token)} chars | User: {user_id}")
    session.headers.update({
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    return session, token, user_id


def post_to_group(session, caption: str) -> dict:
    resp = session.post(
        f"{BASE_URL}/api/v1/groups/{GROUP_ID}/posts",
        json={"content": caption, "type": "post"},
        timeout=30,
    )
    if resp.status_code in (200, 201):
        return resp.json()
    raise RuntimeError(f"Group post failed: HTTP {resp.status_code} — {resp.text[:300]}")


def post_to_feed(session, caption: str, user_id: str) -> dict:
    """Attempt to post to general feed. Tries multiple candidate endpoints."""
    candidates = [
        f"{BASE_URL}/api/v1/users/{user_id}/posts",
        f"{BASE_URL}/api/v1/profile/posts",
        f"{BASE_URL}/api/v1/me/posts",
    ]
    for url in candidates:
        try:
            resp = session.post(url, json={"content": caption, "type": "post"}, timeout=30)
            if resp.status_code in (200, 201):
                try:
                    d = resp.json()
                    if d.get("success") or d.get("status") == "success":
                        print(f"  ✅ Feed post via {url}")
                        return d
                except Exception:
                    pass
        except Exception:
            pass
    raise RuntimeError("Feed post: all endpoints returned 404/405 — need manual post or UI automation")


def slim_caption(caption: str, max_len: int = 490) -> str:
    return caption if len(caption) <= max_len else caption[:max_len - 3].rstrip() + "..."


def main():
    print("=" * 60)
    print("DIRECT LAGOS PUBLISHER - Day 1/36 (Pure API)")
    print("=" * 60)

    email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
    password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
    if not email or not password:
        print("❌ LEKE_LEKE_EMAIL or LEKE_LEKE_PASSWORD not set")
        sys.exit(1)
    print(f"✅ Credentials: {email}")

    # Build Lagos (Day 1) post
    gen = ContentGenerator()
    gen.current_day = 0
    state   = gen.get_next_state()
    caption = gen.generate_caption(state)
    print(f"\n📝 Post: Day 1/36 — {state['name']}")
    print(f"   Caption ({len(caption)} chars): {caption[:80]}...")

    # LOGIN
    print("\n🔐 Logging in...")
    try:
        session, token, user_id = get_session(email, password)
    except RuntimeError as e:
        print(f"❌ {e}")
        sys.exit(1)

    # STEP 1: GROUP POST
    print(f"\n📤 [STEP 1/3] Posting to African Tech Ecosystem group...")
    try:
        result = post_to_group(session, caption)
        gpost_id = result.get("data", {}).get("post", {}).get("public_id", "unknown")
        print(f"✅ Group post SUCCESS — id: {gpost_id}")
    except RuntimeError as e:
        print(f"❌ Group post FAILED: {e}")
        sys.exit(1)

    # STEP 2: DELAY
    delay_secs = 300
    print(f"\n⏳ [STEP 2/3] Waiting {delay_secs // 60} min before feed post...")
    for elapsed in range(0, delay_secs, 60):
        print(f"   … {delay_secs - elapsed}s remaining")
        time.sleep(60)
    print("   … 0s remaining")

    # Re-login (token might expire)
    print("\n🔐 Re-logging in for feed post...")
    try:
        session, token, user_id = get_session(email, password)
    except RuntimeError as e:
        print(f"⚠️  Re-login failed: {e} — using existing session")

    # STEP 3: FEED POST
    slim = slim_caption(caption)
    print(f"\n📤 [STEP 3/3] Posting slim caption ({len(slim)} chars) to General Feed...")
    try:
        result2 = post_to_feed(session, slim, user_id)
        fpost_id = result2.get("data", {}).get("post", {}).get("public_id", "unknown")
        print(f"✅ Feed post SUCCESS — id: {fpost_id}")
        feed_ok = True
    except RuntimeError as e:
        print(f"⚠️  Feed post FAILED: {e}")
        feed_ok = False

    # RESULT
    print("\n" + "=" * 60)
    if feed_ok:
        print("🟢 LAGOS IS LIVE")
        print("   ✅ African Tech Ecosystem Group — POSTED")
        print("   ✅ General Feed — POSTED")
    else:
        print("🟡 LAGOS PARTIALLY LIVE")
        print("   ✅ African Tech Ecosystem Group — POSTED")
        print("   ⚠️  General Feed — MANUAL POST NEEDED")
    print("=" * 60)

    if not feed_ok:
        sys.exit(2)   # exit 2 = partial success (group ok, feed failed)


if __name__ == "__main__":
    main()



# ═══════════════════════════════════════════════════════════════════════════
# LEGACY CODE BELOW — kept for reference only, not executed
# ═══════════════════════════════════════════════════════════════════════════
def _legacy_browser_main():
    email    = os.environ.get("LEKE_LEKE_EMAIL", "")
    password = os.environ.get("LEKE_LEKE_PASSWORD", "")
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
    state   = gen.get_next_state()
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
