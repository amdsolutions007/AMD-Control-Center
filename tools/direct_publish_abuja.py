#!/usr/bin/env python3
"""
Direct Abuja post publisher — pure REST API (no browser).
Day 2/36 — same Direct API Strike pattern as direct_publish_lagos.py.

Run via:
  npx @railway/cli run --service telegram-approval-bot python3 tools/direct_publish_abuja.py
  OR locally:
  python3 tools/direct_publish_abuja.py
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import requests
except ImportError:
    os.system("pip install requests -q")
    import requests

from content_generator import ContentGenerator
from tools.direct_publish_lagos import get_session, post_to_group, post_to_feed, slim_caption

GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"
BASE_URL  = "https://www.lekeelekee.com"


def update_state_tracker(state_name: str, post_id: str):
    import json, datetime, pathlib
    tracker_path = pathlib.Path(__file__).parent.parent / "state_tracker.json"
    data = {}
    if tracker_path.exists():
        try:
            data = json.loads(tracker_path.read_text())
        except Exception:
            pass
    data["current_day"] = 3  # next is Day 3 after we post Day 2
    history = data.get("history", [])
    history.append({
        "day": 2,
        "state": state_name,
        "post_id": post_id,
        "posted_at": datetime.datetime.utcnow().isoformat(),
    })
    data["history"] = history
    tracker_path.write_text(json.dumps(data, indent=2))
    print(f"✅ state_tracker.json updated — Day 2 complete, next is Day 3")


def update_campaign_progress():
    import json, pathlib
    path = pathlib.Path(__file__).parent.parent / "campaign_progress.json"
    data = {}
    if path.exists():
        try:
            data = json.loads(path.read_text())
        except Exception:
            pass
    data["current_day"] = 2  # advance to index 2 = Day 3
    from datetime import datetime
    data["last_updated"] = datetime.utcnow().isoformat()
    path.write_text(json.dumps(data, indent=2))
    print(f"✅ campaign_progress.json updated — current_day=2 (Day 3 next)")


def main():
    print("=" * 60)
    print("DIRECT ABUJA PUBLISHER - Day 2/36 (Pure API)")
    print("=" * 60)

    email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
    password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
    if not email or not password:
        print("❌ LEKE_LEKE_EMAIL or LEKE_LEKE_PASSWORD not set")
        sys.exit(1)
    print(f"✅ Credentials: {email}")

    # Build Abuja (Day 2, index 1) post
    gen = ContentGenerator()
    gen.current_day = 1   # index 1 = Abuja (FCT) = Day 2
    state   = gen.get_next_state()
    caption = gen.generate_caption(state)
    print(f"\n📝 Post: Day 2/36 — {state['name']}")
    print(f"   Caption ({len(caption)} chars): {caption[:80]}...")

    # LOGIN
    print("\n🔐 Logging in...")
    try:
        session, token, user_id = get_session(email, password)
    except RuntimeError as e:
        print(f"❌ {e}")
        sys.exit(1)

    # GROUP POST
    print(f"\n📤 Posting to African Tech Ecosystem group...")
    try:
        result   = post_to_group(session, caption)
        post_id  = result.get("data", {}).get("post", {}).get("public_id", "unknown")
        print(f"✅ Group post SUCCESS — id: {post_id}")
    except RuntimeError as e:
        print(f"❌ Group post FAILED: {e}")
        sys.exit(1)

    # Update trackers
    update_state_tracker(state["name"], post_id)
    update_campaign_progress()

    print("\n" + "=" * 60)
    print(f"🟢 ABUJA IS LIVE — Day 2/36")
    print(f"   ✅ African Tech Ecosystem Group — POSTED (id: {post_id})")
    print("=" * 60)


if __name__ == "__main__":
    main()
