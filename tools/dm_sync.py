#!/usr/bin/env python3
"""
tools/dm_sync.py
================
LekeeBot v2 — Module 6: DM Directory Sync

Fetches all direct (type=direct) conversations from LekeeLekee API,
extracts the other participant's username, and updates dm_directory.json.

Also supports opening a new DM conversation with any user by public_id.

Usage:
  python tools/dm_sync.py            # sync all DMs → update directory
  python tools/dm_sync.py --user 019c1ef0  # attempt to open DM with user public_id
"""

import os, sys, json, requests
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
try:
    from dotenv import load_dotenv; load_dotenv()
except ImportError:
    pass

BASE      = os.getenv("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
EMAIL     = os.getenv("LEKE_LEKE_EMAIL",    "ceo@amdsolutions007.com")
PASSWORD  = os.getenv("LEKE_LEKE_PASSWORD", "#@Amdmail@007")
DM_DIR    = Path(__file__).parent.parent / "intelligence_vault" / "live" / "dm_directory.json"
MY_USER   = "amd"   # CEO's username on LekeeLekee — skip in participant lists


def _auth() -> tuple[requests.Session, str]:
    s = requests.Session()
    r = s.post(f"{BASE}/api/v1/auth/login",
               headers={"Content-Type": "application/x-www-form-urlencoded"},
               data={"email": EMAIL, "password": PASSWORD}, timeout=20)
    data = r.json()
    token = data["data"]["token"]
    my_id = data["data"].get("user", {}).get("public_id", "")
    s.headers["Authorization"] = f"Bearer {token}"
    return s, my_id


def load_directory() -> dict:
    if not DM_DIR.exists():
        return {}
    with open(DM_DIR) as f:
        d = json.load(f)
    return {k: v for k, v in d.items() if not k.startswith("_")}


def save_directory(directory: dict) -> None:
    DM_DIR.parent.mkdir(parents=True, exist_ok=True)
    payload = dict(directory)
    payload["_meta"] = {
        "last_synced": datetime.now(timezone.utc).isoformat(),
        "count": len(directory),
        "note": "Maps LekeeLekee username → direct DM conversation ID. Auto-updated by dm_sync.py",
    }
    with open(DM_DIR, "w") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"[DM_SYNC] 💾 Saved {len(directory)} DM entries → {DM_DIR.name}")


def sync_dm_conversations() -> dict:
    """Fetch all direct conversations and return updated directory."""
    print("[DM_SYNC] 🔐 Authenticating...")
    s, my_id = _auth()
    print(f"[DM_SYNC] ✅ Auth OK | My public_id: {my_id[:8]}...")

    directory = load_directory()
    print(f"[DM_SYNC] 📂 Loaded {len(directory)} existing DM entries")

    page, new_found = 1, 0
    while True:
        resp = s.get(f"{BASE}/api/v1/conversations",
                     params={"page": page, "per_page": 50}, timeout=20)
        raw  = resp.json()
        convs = raw.get("conversations", raw.get("data", {}).get("conversations", []))
        if isinstance(convs, dict):
            convs = []
        if not convs:
            break

        for c in convs:
            ctype = c.get("type", "")
            if ctype != "direct":
                continue  # skip group channels

            cid  = c.get("public_id") or c.get("id", "")
            parts = c.get("participants") or c.get("members") or []
            if isinstance(parts, dict):
                parts = [parts]

            for p in parts:
                if not isinstance(p, dict):
                    continue
                u = (p.get("username") or p.get("handle", "")).lstrip("@").strip()
                if not u or u.lower() in (MY_USER.lower(), my_id.lower()):
                    continue
                if u not in directory:
                    directory[u] = cid
                    new_found += 1
                    print(f"[DM_SYNC] ➕ New DM entry: @{u} → {cid}")

        if len(convs) < 50:
            break
        page += 1

    print(f"[DM_SYNC] 📊 Sync complete: {new_found} new entries, {len(directory)} total")
    return directory


def open_dm_with_user(user_public_id: str) -> str | None:
    """
    Attempt to open (or retrieve) a DM conversation with a LekeeLekee user.
    Returns the conversation public_id if successful, else None.
    """
    print(f"[DM_SYNC] 📨 Opening DM with user_id={user_public_id[:8]}...")
    s, _ = _auth()

    # Try known endpoints for creating/fetching a direct conversation
    endpoints = [
        ("POST", f"{BASE}/api/v1/conversations",
         {"type": "direct", "user_id": user_public_id}),
        ("POST", f"{BASE}/api/v1/conversations",
         {"user_public_id": user_public_id}),
        ("POST", f"{BASE}/api/v1/conversations/direct",
         {"user_id": user_public_id}),
        ("GET",  f"{BASE}/api/v1/conversations/direct/{user_public_id}", None),
    ]

    for method, url, body in endpoints:
        try:
            if method == "POST":
                r = s.post(url, json=body, timeout=15)
            else:
                r = s.get(url, timeout=15)

            ct = r.headers.get("content-type", "")
            if "json" in ct and r.status_code in (200, 201):
                data = r.json()
                conv_id = (data.get("data", {}).get("public_id")
                           or data.get("conversation", {}).get("public_id")
                           or data.get("public_id"))
                if conv_id:
                    print(f"[DM_SYNC] ✅ Got DM conv_id: {conv_id} via {method} {url}")
                    return conv_id
            print(f"[DM_SYNC] ⚠️  {method} {url} → HTTP {r.status_code}")
        except Exception as e:
            print(f"[DM_SYNC] ❌ {method} {url} → {e}")

    print(f"[DM_SYNC] ❌ Could not open DM conversation with {user_public_id}")
    return None


def resolve_dm_conv(username: str) -> str | None:
    """
    Resolve a LekeeLekee username to a DM conversation ID.
    Checks local directory first; syncs from API if not found.
    """
    directory = load_directory()
    clean = username.lstrip("@").strip()

    if clean in directory:
        return directory[clean]

    # Not in directory — resync
    print(f"[DM_SYNC] 🔄 @{clean} not in directory — resyncing...")
    directory = sync_dm_conversations()
    save_directory(directory)

    if clean in directory:
        return directory[clean]

    print(f"[DM_SYNC] ⚠️  @{clean} has no existing DM conversation")
    return None


if __name__ == "__main__":
    args = sys.argv[1:]

    if "--user" in args:
        idx = args.index("--user")
        uid = args[idx + 1] if idx + 1 < len(args) else None
        if uid:
            conv_id = open_dm_with_user(uid)
            if conv_id:
                print(f"✅ DM conversation ID: {conv_id}")
        else:
            print("Usage: python dm_sync.py --user <public_id>")
    else:
        directory = sync_dm_conversations()
        save_directory(directory)
        print("\n=== DM DIRECTORY ===")
        for u, cid in directory.items():
            print(f"  @{u:30s} → {cid}")
