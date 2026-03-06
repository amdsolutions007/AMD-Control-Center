#!/usr/bin/env python3
"""
Live group member sync — fetches ALL current members from LekeeLekee API with
pagination, overwrites group_members_full.json, reports delta.
Delete this tool after use or keep for periodic re-sync.

Usage: python3 tools/sync_group_members.py
"""
import json
import requests
from datetime import datetime, timezone
from pathlib import Path

EMAIL    = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
BASE_URL = "https://www.lekeelekee.com/api/v1"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"

ROOT    = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "intelligence_vault" / "live" / "group_members_full.json"

def run_sync():
    print("🔐 Authenticating...")
    s = requests.Session()
    r = s.post(f"{BASE_URL}/auth/login",
               data={"email": EMAIL, "password": PASSWORD}, timeout=20)
    r.raise_for_status()
    token = r.json()["data"]["token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    print("✅ Auth OK")

    # Load existing members for delta report
    existing = []
    if OUT_FILE.exists():
        try:
            old = json.loads(OUT_FILE.read_text())
            existing = old.get("members", old) if isinstance(old, dict) else old
        except Exception:
            pass
    existing_ids = {m.get("public_id") for m in existing}
    print(f"📋 Existing local count: {len(existing)}")

    # Paginate through all group members
    all_members = []
    page = 1
    per_page = 50
    while True:
        resp = s.get(
            f"{BASE_URL}/groups/{GROUP_ID}/members",
            params={"page": page, "per_page": per_page},
            timeout=20,
        )
        if resp.status_code != 200:
            print(f"⚠️  HTTP {resp.status_code} on page {page}, stopping.")
            break
        data = resp.json()
        # Handle various response shapes
        payload = data.get("data", data)
        if isinstance(payload, dict):
            members_page = (
                payload.get("members")
                or payload.get("data")
                or []
            )
        else:
            members_page = payload if isinstance(payload, list) else []

        if not members_page:
            break

        for m in members_page:
            user = m.get("user") or {}
            entry = {
                "public_id": user.get("public_id") or m.get("public_id", ""),
                "name":      user.get("name") or m.get("name", ""),
                "username":  user.get("username") or m.get("username", ""),
            }
            if entry["public_id"]:
                all_members.append(entry)

        print(f"  Page {page}: +{len(members_page)} members (total so far: {len(all_members)})")

        # Check if we've hit the last page
        meta = payload.get("meta", {}) if isinstance(payload, dict) else {}
        last_page = meta.get("last_page") or meta.get("total_pages")
        if last_page and page >= int(last_page):
            break
        if len(members_page) < per_page:
            break
        page += 1

    if not all_members:
        print("❌ No members returned — API may have changed shape.")
        return

    # Deduplicate by public_id
    seen = set()
    deduped = []
    for m in all_members:
        pid = m["public_id"]
        if pid and pid not in seen:
            seen.add(pid)
            deduped.append(m)

    new_ids = {m["public_id"] for m in deduped}
    new_members = [m for m in deduped if m["public_id"] not in existing_ids]

    print(f"\n{'='*60}")
    print(f"✅ SYNC COMPLETE")
    print(f"   Live platform count : {len(deduped)}")
    print(f"   Previous local count: {len(existing)}")
    print(f"   Net new members     : {len(new_members)}")
    if new_members:
        print(f"   NEW members captured:")
        for m in new_members:
            print(f"     + {m['username']:<20} {m['name']}")
    print(f"{'='*60}")

    # Save with metadata
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps({
        "members": deduped,
        "_meta": {
            "synced_at":    datetime.now(timezone.utc).isoformat(),
            "api_total":    len(deduped),
            "pages_fetched": page,
            "new_vs_prev":  len(new_members),
        }
    }, indent=2))
    print(f"💾 Saved → {OUT_FILE}  ({len(deduped)} members)")

if __name__ == "__main__":
    run_sync()
