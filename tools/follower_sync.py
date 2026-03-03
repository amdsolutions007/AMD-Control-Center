#!/usr/bin/env python3
"""
tools/follower_sync.py
======================
Phase 4 Follower Re-Sweep — AMD Control Center
Performs a fresh live API sweep of @amd profile followers on LekeeLekee,
diffs against the vault snapshot, adds new citizens, updates all related files.

Expected result: 60 → 64 followers, 4 new citizens identified.
"""

import json
import os
import sys
import requests
from datetime import datetime, timezone
from pathlib import Path

# ── PATHS ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
VAULT = ROOT / "intelligence_vault"
FOLLOWERS_FILE   = VAULT / "members" / "profile" / "followers.json"
GROUP_FILE       = VAULT / "members"  / "group"   / "members.json"
XREF_FILE        = VAULT / "engagement" / "cross_reference.json"
REPORT_FILE      = VAULT / "reports"    / "empire_citizen_report.json"

# ── CREDENTIALS ──────────────────────────────────────────────────────────────
BASE_URL   = os.getenv("LEKE_LEKE_BASE_URL",  "https://www.lekeelekee.com")
EMAIL      = os.getenv("LEKE_LEKE_EMAIL",     "ceo@amdsolutions007.com")
PASSWORD   = os.getenv("LEKE_LEKE_PASSWORD",  "#@Amdmail@007")

# CEO official empire counts (canonical for reports)
CEO_GROUP_OFFICIAL = 128   # official CEO count even though dedup gives 127
EXPECTED_FOLLOWERS = 64    # CEO-confirmed live count

# ── HELPERS ──────────────────────────────────────────────────────────────────

def _safe_json(resp: requests.Response):
    """Return parsed JSON or None if response is HTML/empty."""
    if resp.status_code != 200:
        return None
    text = resp.text.strip()
    if not text or text.startswith("<"):
        return None
    try:
        return resp.json()
    except Exception:
        return None


def authenticate() -> str:
    """Log in and return a Bearer token."""
    resp = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"email": EMAIL, "password": PASSWORD},
        timeout=20,
    )
    data = _safe_json(resp)
    if not data:
        raise RuntimeError(f"Auth failed — HTTP {resp.status_code}: {resp.text[:200]}")
    token = (
        data.get("data", {}).get("token")
        or data.get("token")
        or data.get("access_token")
    )
    if not token:
        raise RuntimeError(f"No token in auth response: {json.dumps(data)[:300]}")
    print(f"[AUTH] ✅ Bearer token acquired")
    return token


def get_my_public_id(token: str) -> str:
    """Fetch the CEO's public_id from /api/v1/users/me."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/v1/users/me", headers=headers, timeout=20)
    data = _safe_json(resp)
    if not data:
        raise RuntimeError(f"Could not fetch /users/me — HTTP {resp.status_code}")
    pid = data.get("data", {}).get("public_id") or data.get("data", {}).get("id")
    if not pid:
        raise RuntimeError(f"No public_id in /users/me response: {json.dumps(data)[:300]}")
    print(f"[AUTH] public_id = {pid}")
    return pid


def probe_follow_endpoints(token: str) -> list[dict]:
    """
    Sweep all pages of /api/v1/users/{public_id}/followers (page size = 20, fixed by API).
    Returns flat list of raw follower records.
    """
    public_id = get_my_public_id(token)
    endpoint  = f"/api/v1/users/{public_id}/followers"
    url       = f"{BASE_URL}{endpoint}"
    headers   = {"Authorization": f"Bearer {token}"}

    all_records: list[dict] = []
    page = 1
    total_pages = 1  # updated from first response

    while page <= total_pages:
        resp = requests.get(url, headers=headers, params={"page": page}, timeout=20)
        data = _safe_json(resp)
        if data is None:
            print(f"[SWEEP] Page {page} — HTML/error response, stopping.")
            break

        users = data.get("data", {}).get("users", [])
        pagination = data.get("data", {}).get("pagination", {})

        if page == 1:
            total_pages = pagination.get("total_pages", 1)
            api_total   = pagination.get("total", len(users))
            print(f"[SWEEP] API reports total={api_total}, total_pages={total_pages}")

        all_records.extend(users)
        print(f"[SWEEP] Page {page}/{total_pages} → {len(users)} records (running total: {len(all_records)})")
        page += 1

    print(f"[SWEEP] Full sweep complete — {len(all_records)} raw follower records pulled")
    return all_records


def _extract_list(data: dict) -> list | None:
    """Recursively try known keys to find a list of follower records."""
    for key_path in [
        ["data", "followers"],
        ["data", "members"],
        ["data", "users"],
        ["data"],
        ["followers"],
        ["members"],
        ["users"],
        ["results"],
        ["items"],
    ]:
        node = data
        for k in key_path:
            if isinstance(node, dict):
                node = node.get(k)
            else:
                node = None
                break
        if isinstance(node, list):
            return node
    return None


def build_citizen_record(raw: dict) -> dict:
    """
    Normalise a raw API follower record into Vault schema.
    Actual API shape: {id, name, username, avatar, bio, is_following, display_badges, is_page}
    May also be nested under 'user' or 'follower'.
    """
    user = raw.get("user") or raw.get("follower") or raw
    username  = user.get("username") or user.get("handle") or ""
    name      = user.get("name") or user.get("display_name") or user.get("full_name") or username
    bio       = user.get("bio") or user.get("about") or ""
    location  = user.get("location") or ""
    website   = user.get("website") or ""
    avatar    = user.get("avatar_url") or user.get("avatar") or ""
    verified  = bool(user.get("is_verified") or user.get("verified") or user.get("display_badges"))
    followers = user.get("followers_count") or user.get("followers") or 0
    following = user.get("following_count") or user.get("following") or 0
    handle    = f"@{username}" if username and not username.startswith("@") else username

    return {
        "name":          name,
        "handle":        handle,
        "role":          "follower",
        "source":        "profile_follower",
        "bio":           bio,
        "location":      location,
        "website":       website,
        "avatar_url":    avatar,
        "is_verified":   verified,
        "followers":     followers,
        "following":     following,
        "synced_at":     datetime.now(timezone.utc).isoformat(),
    }


def load_vault_followers():
    """Load existing followers.json. Returns (dict root, set of known handles)."""
    with open(FOLLOWERS_FILE) as f:
        vault = json.load(f)
    known = {m["handle"].lstrip("@").lower() for m in vault.get("members", [])}
    return vault, known


def load_group_handles():
    """Return set of handles (lowercase, no @) already in the group vault."""
    with open(GROUP_FILE) as f:
        data = json.load(f)
    return {m["handle"].lstrip("@").lower() for m in data.get("members", [])}


# ── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  AMD FOLLOWER SYNC — Phase 4 Re-Sweep")
    print("=" * 60)

    # 1. Auth
    token = authenticate()

    # 2. Live follower sweep
    raw_records = probe_follow_endpoints(token)
    print(f"\n[PULL] Raw API records: {len(raw_records)}")

    # 3. Build normalised records
    live_citizens = []
    seen_handles  = set()
    duplicates    = 0
    for raw in raw_records:
        rec = build_citizen_record(raw)
        key = rec["handle"].lstrip("@").lower()
        if not key:
            continue
        if key in seen_handles:
            duplicates += 1
            continue
        seen_handles.add(key)
        live_citizens.append(rec)

    print(f"[DEDUP] {duplicates} duplicates removed — {len(live_citizens)} unique followers")

    # 4. Diff vs vault
    vault_data, vault_handles = load_vault_followers()
    new_followers = [c for c in live_citizens if c["handle"].lstrip("@").lower() not in vault_handles]
    print(f"\n[DIFF] Vault had: {len(vault_handles)} | Live unique: {len(live_citizens)}")
    print(f"[DIFF] NEW followers found: {len(new_followers)}")

    if new_followers:
        print("\n🆕 NEW FOLLOWERS:")
        for n in new_followers:
            print(f"   • {n['name']} ({n['handle']}) — {n['bio'][:60] if n['bio'] else 'no bio'}")
    else:
        print("   (none — vault already current)")

    # 5. Merge and write followers.json
    merged_members = vault_data.get("members", []) + [
        {
            "name":   c["name"],
            "handle": c["handle"],
            "bio":    c["bio"],
            "source": "profile_follower",
        }
        for c in new_followers
    ]
    # If we got the full live list and it's larger, use the live list entirely
    if len(live_citizens) > len(merged_members):
        # Use live list (better data) but keep old bio for known handles
        bio_map = {m["handle"].lstrip("@").lower(): m.get("bio","") for m in vault_data.get("members",[])}
        merged_members = [
            {
                "name":   c["name"],
                "handle": c["handle"],
                "bio":    c["bio"] or bio_map.get(c["handle"].lstrip("@").lower(), ""),
                "source": "profile_follower",
            }
            for c in live_citizens
        ]

    new_total = len(merged_members)
    vault_data["total"]    = new_total
    vault_data["members"]  = merged_members
    vault_data["last_synced"] = datetime.now(timezone.utc).isoformat()
    vault_data["sync_source"] = "follower_sweep_v2"

    with open(FOLLOWERS_FILE, "w") as f:
        json.dump(vault_data, f, indent=2, ensure_ascii=False)
    print(f"\n[WRITE] ✅ followers.json updated → total: {new_total}")

    # 6. Update cross_reference.json
    group_handles = load_group_handles()
    follower_handles = {c["handle"].lstrip("@").lower() for c in live_citizens}

    super_fan_handles = follower_handles & group_handles
    profile_only_handles = follower_handles - group_handles
    group_only_handles   = group_handles - follower_handles

    with open(XREF_FILE) as f:
        xref = json.load(f)

    # Rebuild super_fans list (from group member records for richer data)
    with open(GROUP_FILE) as f:
        grp = json.load(f)
    handle_to_grp = {m["handle"].lstrip("@").lower(): m for m in grp.get("members", [])}
    handle_to_flw = {c["handle"].lstrip("@").lower(): c for c in live_citizens}

    super_fans_list = []
    for h in sorted(super_fan_handles):
        grp_rec = handle_to_grp.get(h, {})
        super_fans_list.append({
            "name":   grp_rec.get("name", h),
            "handle": grp_rec.get("handle", f"@{h}"),
            "role":   grp_rec.get("role", "member"),
            "source": "group_members",
        })

    profile_only_list = []
    for h in sorted(profile_only_handles):
        flw = handle_to_flw.get(h, {})
        profile_only_list.append({
            "name":   flw.get("name", h),
            "handle": flw.get("handle", f"@{h}"),
            "role":   "follower",
            "source": "profile_follower",
        })

    group_only_list = []
    for h in sorted(group_only_handles):
        grp_rec = handle_to_grp.get(h, {})
        group_only_list.append({
            "name":   grp_rec.get("name", h),
            "handle": grp_rec.get("handle", f"@{h}"),
            "role":   grp_rec.get("role", "member"),
            "source": "group_members",
        })

    xref["super_fans"] = {"count": len(super_fans_list), "members": super_fans_list}
    xref["profile_only"] = {"count": len(profile_only_list), "members": profile_only_list}
    xref["group_only"]   = {"count": len(group_only_list),   "members": group_only_list}
    xref["last_synced"]  = datetime.now(timezone.utc).isoformat()

    with open(XREF_FILE, "w") as f:
        json.dump(xref, f, indent=2, ensure_ascii=False)
    print(f"[WRITE] ✅ cross_reference.json updated")
    print(f"         Super-fans: {len(super_fans_list)} | Profile-only: {len(profile_only_list)} | Group-only: {len(group_only_list)}")

    # 7. Update empire_citizen_report.json
    overlap  = len(super_fan_handles)
    unique_reach = CEO_GROUP_OFFICIAL + new_total - overlap
    group_only_count = CEO_GROUP_OFFICIAL - overlap   # using official CEO count

    with open(REPORT_FILE) as f:
        report = json.load(f)

    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    report["empire_citizen_report"]["profile_followers"]   = new_total
    report["empire_citizen_report"]["group_members"]       = CEO_GROUP_OFFICIAL
    report["empire_citizen_report"]["overlap_super_fans"]  = overlap
    report["empire_citizen_report"]["unique_total_reach"]  = unique_reach
    report["empire_citizen_report"]["formula"] = (
        f"{new_total} profile followers + {CEO_GROUP_OFFICIAL} group members "
        f"− {overlap} overlap = {unique_reach} unique citizens"
    )

    report["growth_intelligence"]["live_api_count"]           = len(seen_handles)
    report["growth_intelligence"]["profile_followers_live"]   = new_total
    report["growth_intelligence"]["followers_net_new"]        = len(new_followers)
    report["growth_intelligence"]["group_only_unconverted"]   = group_only_count
    report["growth_intelligence"]["profile_only_unconverted"] = len(profile_only_list)
    report["growth_intelligence"]["conversion_note"] = (
        f"{group_only_count} group members haven't followed the CEO profile yet — "
        f"highest-priority invite targets. {len(profile_only_list)} profile followers "
        f"haven't joined the group yet."
    )

    report["vault_structure"]["members/profile/followers.json"] = f"{new_total} profile followers (v2 sync)"
    report["vault_structure"]["members/group/members.json"]     = "127 unique group members (v2 detailed)"

    with open(REPORT_FILE, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"[WRITE] ✅ empire_citizen_report.json updated")

    # 8. Final summary
    print("\n" + "=" * 60)
    print("  FOLLOWER SYNC COMPLETE")
    print("=" * 60)
    print(f"  Group Members (official):   {CEO_GROUP_OFFICIAL}")
    print(f"  Profile Followers:          {new_total}")
    print(f"  Super-fans (overlap):       {overlap}")
    print(f"  Unique Total Reach:         {unique_reach}")
    print(f"  Group-only unconverted:     {group_only_count}")
    print(f"  Profile-only unconverted:   {len(profile_only_list)}")
    print(f"  NEW followers added:        {len(new_followers)}")
    if new_followers:
        for n in new_followers:
            print(f"    ↳ {n['name']} ({n['handle']})")
    print("=" * 60)

    return new_followers


if __name__ == "__main__":
    new = main()
    sys.exit(0)
