#!/usr/bin/env python3
"""
Universal Direct Publisher — any day, pure API, no browser.
Usage:
  python3 tools/direct_publish.py            # publishes current_day from state_tracker.json
  python3 tools/direct_publish.py 2          # publishes Day 2 explicitly
  python3 tools/direct_publish.py 2 --force  # skip confirmation prompt

Updates state_tracker.json on success.
"""
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

try:
    import requests
except ImportError:
    os.system("pip install requests -q")
    import requests

from content_generator import ContentGenerator

BASE_URL   = "https://www.lekeelekee.com"
GROUP_ID   = "4d183887-2d5a-47b0-8226-dd6939d29694"
STATE_FILE = os.path.join(ROOT, "state_tracker.json")


def load_state() -> dict:
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except Exception:
        return {"current_day": 2, "history": []}


def save_state(state: dict):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def get_session(email: str, password: str):
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Origin": BASE_URL,
        "Referer": BASE_URL + "/",
        "Accept": "application/json",
    })
    resp = None
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
    if not resp or resp.status_code != 200:
        code = resp.status_code if resp else "?"
        raise RuntimeError(f"Login failed: HTTP {code} — {resp.text[:200] if resp else 'no response'}")
    data = resp.json()
    if data.get("status") != "success":
        raise RuntimeError(f"Login error: {data.get('message', str(data)[:100])}")
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


def main():
    import datetime

    email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
    password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
    if not email or not password:
        print("❌ LEKE_LEKE_EMAIL or LEKE_LEKE_PASSWORD not set")
        sys.exit(1)

    # ── Determine target day ──────────────────────────────────────────────────
    state_data = load_state()
    args = sys.argv[1:]
    force = "--force" in args
    day_args = [a for a in args if a.isdigit()]
    day = int(day_args[0]) if day_args else state_data.get("current_day", 2)

    # ── Build content ─────────────────────────────────────────────────────────
    gen = ContentGenerator()
    gen.current_day = day - 1
    state   = gen.get_next_state()
    caption = gen.generate_caption(state)

    sep = "=" * 60
    print(f"\n{sep}")
    print(f"  DIRECT PUBLISHER — Day {day}/36: {state['name'].upper()}")
    print(f"{sep}")
    print(f"  Capital : {state.get('capital', 'N/A')}")
    print(f"  Zone    : {state.get('zone', 'N/A')}")
    print(f"  Caption : {len(caption)} chars")
    print(f"  Target  : African Tech Ecosystem Group")
    print(f"{sep}")

    if not force:
        try:
            ans = input("\n  Proceed with LIVE post? (yes/no): ").strip().lower()
            if ans not in ("yes", "y"):
                print("  Aborted.")
                sys.exit(0)
        except (EOFError, KeyboardInterrupt):
            # Non-interactive (Railway) — proceed
            print("  Non-interactive mode — proceeding...")

    # ── Login ─────────────────────────────────────────────────────────────────
    print(f"\n🔐 Logging in as {email}...")
    try:
        session, _, _ = get_session(email, password)
    except RuntimeError as e:
        print(f"❌ {e}")
        sys.exit(1)

    # ── Post ──────────────────────────────────────────────────────────────────
    print(f"\n📤 Firing Direct API Strike — Day {day}: {state['name']}...")
    try:
        result  = post_to_group(session, caption)
        post_id = (
            result.get("data", {}).get("post", {}).get("public_id", "")
            or result.get("data", {}).get("public_id", "unknown")
        )
    except RuntimeError as e:
        print(f"❌ Group post FAILED: {e}")
        sys.exit(1)

    # ── Update state ──────────────────────────────────────────────────────────
    state_data["current_day"] = day + 1
    state_data.setdefault("history", []).append({
        "day": day,
        "state": state["name"],
        "capital": state.get("capital", ""),
        "post_id": post_id,
        "posted_at": datetime.datetime.utcnow().isoformat(),
        "platform": "lekeelekee_group",
    })
    save_state(state_data)

    # ── Done ──────────────────────────────────────────────────────────────────
    print(f"\n{sep}")
    print(f"  🟢 {state['name'].upper()} IS LIVE")
    print(f"  ✅ African Tech Ecosystem Group — POSTED")
    print(f"  🆔 Post ID : {post_id}")
    print(f"  📅 Next    : Day {day + 1} scheduled for 09:00 UTC")
    print(f"{sep}\n")


if __name__ == "__main__":
    main()
