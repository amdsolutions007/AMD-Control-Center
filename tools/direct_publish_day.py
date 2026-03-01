#!/usr/bin/env python3
"""Force-publish the next pending day via Direct API Strike (no UI/Telegram needed).
Usage: python3 tools/direct_publish_day.py [day_index]
  day_index: 0-indexed ContentGenerator day (default: read from campaign_progress.json)
"""
import os, sys, json, pathlib, datetime
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import requests
except ImportError:
    os.system("pip install requests -q")
    import requests

from content_generator import ContentGenerator

BASE_URL = "https://www.lekeelekee.com"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"
ROOT     = pathlib.Path(__file__).parent.parent


def login(email, password):
    s = requests.Session()
    s.headers.update({"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    for attempt in range(1, 4):
        r = s.post(f"{BASE_URL}/api/v1/auth/login",
                   data={"email": email, "password": password},
                   headers={"Content-Type": "application/x-www-form-urlencoded"},
                   timeout=30)
        if r.status_code == 429:
            import time; time.sleep(60 * attempt); continue
        break
    r.raise_for_status()
    d = r.json()
    if d.get("status") != "success":
        raise RuntimeError(f"Login error: {d}")
    token   = d["data"]["token"]
    user_id = d["data"]["user"]["public_id"]
    s.headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    return s, token, user_id


def post_group(session, caption):
    r = session.post(f"{BASE_URL}/api/v1/groups/{GROUP_ID}/posts",
                     json={"content": caption, "type": "post"}, timeout=30)
    if r.status_code in (200, 201):
        return r.json()
    raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")


def update_trackers(day_index, day_display, state_name, capital, post_id):
    # campaign_progress.json (advance to next)
    cp = ROOT / "campaign_progress.json"
    data = json.loads(cp.read_text()) if cp.exists() else {}
    data["current_day"]   = day_index + 1
    data["last_updated"]  = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cp.write_text(json.dumps(data, indent=2))
    print(f"✅ campaign_progress.json → current_day={day_index + 1}")

    # state_tracker.json
    st = ROOT / "state_tracker.json"
    tracker = json.loads(st.read_text()) if st.exists() else {}
    tracker["current_day"] = day_display + 1  # points to NEXT day
    history = tracker.get("history", [])
    history.append({
        "day":       day_display,
        "state":     state_name,
        "capital":   capital,
        "post_id":   post_id,
        "posted_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    })
    tracker["history"] = history
    st.write_text(json.dumps(tracker, indent=2))
    print(f"✅ state_tracker.json → Day {day_display} complete, next = Day {day_display + 1}")


def main():
    email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
    password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
    if not email or not password:
        print("❌ LEKE_LEKE_EMAIL / LEKE_LEKE_PASSWORD not set"); sys.exit(1)

    # Determine day index
    if len(sys.argv) > 1:
        day_idx = int(sys.argv[1])
    else:
        cp = ROOT / "campaign_progress.json"
        day_idx = json.loads(cp.read_text()).get("current_day", 0) if cp.exists() else 0

    gen = ContentGenerator()
    gen.current_day = day_idx
    state   = gen.get_next_state()
    caption = gen.generate_caption(state)
    day_display = day_idx + 1

    print("=" * 60)
    print(f"DIRECT PUBLISH — Day {day_display}/36: {state['name']}")
    print("=" * 60)
    print(f"Caption ({len(caption)} chars): {caption[:80]}...")

    print("\n🔐 Logging in...")
    session, _, _ = login(email, password)
    print("✅ Login OK")

    print(f"\n📤 Posting to African Tech Ecosystem group...")
    result  = post_group(session, caption)
    post_id = result.get("data", {}).get("post", {}).get("public_id", "unknown")
    print(f"✅ Group post SUCCESS — id: {post_id}")

    update_trackers(day_idx, day_display, state["name"], state.get("capital", ""), post_id)

    print("\n" + "=" * 60)
    print(f"🟢 DAY {day_display} ({state['name'].upper()}) IS LIVE")
    print(f"   Post ID: {post_id}")
    print("=" * 60)


if __name__ == "__main__":
    main()
