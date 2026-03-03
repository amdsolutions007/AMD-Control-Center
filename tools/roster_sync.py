#!/usr/bin/env python3
"""
FULL ROSTER SYNC — AMD Control Center
======================================
CEO COMMAND: Correct vault to 128 members.
- Deep sweep all pages of /api/v1/groups/{GROUP_ID}/members
- Diff every member against existing vault
- Create detailed citizen records for all new members
- Update members.json, cross_reference.json, empire_citizen_report.json
- Report "Vault Synchronized at N"

Run: python3 tools/roster_sync.py
"""
import json
import os
import sys
import hashlib
import requests
from datetime import datetime, timezone
from pathlib import Path

# ── Bootstrap ────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))
from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

BASE_URL  = os.environ.get("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
GROUP_ID  = os.environ["LEKE_LEKE_GROUP_ID"]
EMAIL     = os.environ["LEKE_LEKE_EMAIL"]
PASSWORD  = os.environ["LEKE_LEKE_PASSWORD"]

VAULT     = ROOT / "intelligence_vault"
MEMBERS_PATH  = VAULT / "members" / "group" / "members.json"
FOLLOWERS_PATH = VAULT / "members" / "profile" / "followers.json"
XREF_PATH     = VAULT / "engagement" / "cross_reference.json"
REPORT_PATH   = VAULT / "reports" / "empire_citizen_report.json"
LIVE_PATH     = VAULT / "live"

DIVIDER = "━" * 62

# ── Auth ─────────────────────────────────────────────────────────────────────

def login() -> requests.Session:
    s = requests.Session()
    s.headers["User-Agent"] = "AMD-RosterSync/3.0"
    r = s.post(
        f"{BASE_URL}/api/v1/auth/login",
        data={"email": EMAIL, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=20,
    )
    body = r.json()
    token = (body.get("data") or {}).get("token") or body.get("token")
    if not token:
        print(f"❌ Auth failed: {str(body)[:200]}")
        sys.exit(1)
    s.headers["Authorization"] = f"Bearer {token}"
    print("✅ Authenticated as @amd (Olawale Shoyemi)")
    return s

# ── Safe GET ─────────────────────────────────────────────────────────────────

def get(s: requests.Session, path: str, params: dict = None):
    try:
        r = s.get(f"{BASE_URL}{path}", params=params, timeout=25)
    except Exception as e:
        print(f"  ⚠️  GET {path}: network error: {e}")
        return None
    if r.status_code != 200:
        print(f"  ⚠️  GET {path} → HTTP {r.status_code}")
        return None
    raw = r.text.strip()
    if not raw or raw.startswith("<"):
        return None
    try:
        return r.json()
    except Exception:
        return None

# ── Extract member list from any API response shape ──────────────────────────

def extract_members(body) -> tuple[list[dict], int]:
    """Return (member_list, total_hint) from any API response shape."""
    total_hint = 0
    if body is None:
        return [], 0
    if isinstance(body, list):
        return body, len(body)

    # Extract pagination total
    meta = body.get("meta") or body.get("pagination") or {}
    if isinstance(meta, dict):
        total_hint = int(meta.get("total") or meta.get("count") or 0)

    data = body.get("data") or {}
    if isinstance(data, dict):
        total_hint = total_hint or int(
            data.get("total") or data.get("members_count") or 0
        )
        members = (
            data.get("members")
            or data.get("users")
            or data.get("items")
        )
        if members:
            return members, total_hint or len(members)

    members = (
        body.get("members")
        or body.get("users")
        or body.get("items")
    )
    return (members or []), total_hint

# ── Deep sweep — fetch ALL pages ─────────────────────────────────────────────

def deep_sweep(s: requests.Session) -> list[dict]:
    """
    Paginate through /api/v1/groups/{GROUP_ID}/members until all records are fetched.
    Tries multiple page/offset strategies to ensure completeness.
    Returns deduplicated raw member objects.
    """
    all_members = {}   # keyed by handle to auto-deduplicate
    PAGE_SIZE = 100

    print(f"\n  Deep sweeping members endpoint (page size={PAGE_SIZE})...")

    # Strategy 1: page-based pagination
    for page in range(1, 20):   # prevent runaway; 20 × 100 = 2000 max
        body = get(s, f"/api/v1/groups/{GROUP_ID}/members",
                   params={"page": page, "per_page": PAGE_SIZE, "limit": PAGE_SIZE})
        if body is None:
            print(f"    Page {page}: no response — stopping")
            break

        batch, total_hint = extract_members(body)
        if not batch:
            print(f"    Page {page}: empty batch — end of list")
            break

        newly_found = 0
        for m in batch:
            raw_handle = _raw_handle(m)
            if raw_handle and raw_handle not in all_members:
                all_members[raw_handle] = m
                newly_found += 1

        print(f"    Page {page}: {len(batch)} returned, "
              f"{newly_found} new (running total: {len(all_members)})"
              + (f" | server total hint: {total_hint}" if total_hint else ""))

        # If server told us total and we have it, stop early
        if total_hint and len(all_members) >= total_hint:
            print(f"    Reached server-reported total ({total_hint}) — stopping")
            break

        # If batch smaller than page size, we're at the end
        if len(batch) < PAGE_SIZE:
            print(f"    Batch smaller than page size ({len(batch)} < {PAGE_SIZE}) — end of list")
            break

    # Strategy 2: try offset-based pagination if count looks incomplete
    if len(all_members) < 100:
        print(f"\n  Trying offset-based pagination...")
        for offset in range(0, 500, PAGE_SIZE):
            body = get(s, f"/api/v1/groups/{GROUP_ID}/members",
                       params={"offset": offset, "limit": PAGE_SIZE,
                               "per_page": PAGE_SIZE})
            if body is None:
                break
            batch, _ = extract_members(body)
            if not batch:
                break
            newly_found = 0
            for m in batch:
                raw_handle = _raw_handle(m)
                if raw_handle and raw_handle not in all_members:
                    all_members[raw_handle] = m
                    newly_found += 1
            print(f"    Offset {offset}: {len(batch)} returned, {newly_found} new "
                  f"(total: {len(all_members)})")
            if len(batch) < PAGE_SIZE:
                break

    # Strategy 3: sort=joined_at:desc to catch newest that may not appear first
    print(f"\n  Trying sort=joined_at:desc sweep...")
    for page in range(1, 10):
        body = get(s, f"/api/v1/groups/{GROUP_ID}/members",
                   params={"page": page, "per_page": PAGE_SIZE,
                           "sort": "joined_at:desc", "order": "desc"})
        if body is None:
            break
        batch, _ = extract_members(body)
        if not batch:
            break
        newly_found = 0
        for m in batch:
            raw_handle = _raw_handle(m)
            if raw_handle and raw_handle not in all_members:
                all_members[raw_handle] = m
                newly_found += 1
        print(f"    Sort page {page}: {len(batch)} returned, {newly_found} new "
              f"(total: {len(all_members)})")
        if len(batch) < PAGE_SIZE:
            break

    print(f"\n  ✅ Deep sweep complete: {len(all_members)} unique members found")
    return list(all_members.values())

def _raw_handle(m: dict) -> str:
    """Extract handle key for deduplication."""
    u = m.get("user") or m
    h = (u.get("username") or u.get("handle") or u.get("name") or "").lower().strip("@").strip()
    return h or ""

# ── Build a detailed citizen record ──────────────────────────────────────────

KNOWN_TECH_SECTORS = {
    "dev": "Software Development", "code": "Software Development",
    "engineer": "Engineering", "architect": "Engineering",
    "founder": "Entrepreneurship", "ceo": "Entrepreneurship",
    "startup": "Entrepreneurship", "build": "Entrepreneurship",
    "data": "Data Science / AI", "ai": "Data Science / AI",
    "ml": "Data Science / AI", "machine": "Data Science / AI",
    "design": "Product Design", "ux": "Product Design", "ui": "Product Design",
    "product": "Product Management", "pm": "Product Management",
    "finance": "Fintech / Finance", "fintech": "Fintech / Finance",
    "invest": "Investment", "vc": "Investment",
    "market": "Marketing / Growth", "growth": "Marketing / Growth",
    "sales": "Sales / BD", "business": "Sales / BD",
    "cloud": "Cloud / DevOps", "devops": "Cloud / DevOps", "infra": "Cloud / DevOps",
    "security": "Cybersecurity", "cyber": "Cybersecurity",
    "health": "Healthtech", "med": "Healthtech",
    "edu": "Edtech", "teach": "Edtech", "learn": "Edtech",
    "agri": "Agritech", "farm": "Agritech",
    "logistics": "Logistics / Supply Chain",
    "journalist": "Media / Journalism", "media": "Media / Journalism",
    "writer": "Media / Journalism",
    "legal": "Legal Tech", "law": "Legal Tech",
}

def infer_sector(bio: str, name: str) -> str:
    bio_lower = (bio or "").lower()
    for keyword, sector in KNOWN_TECH_SECTORS.items():
        if keyword in bio_lower:
            return sector
    return "Ecosystem Citizen"

def compute_engagement_score(m: dict, activity_handles: set) -> int:
    """
    Score based on available API signals (0–100).
    - Has bio: +20
    - Has avatar: +10
    - Is verified: +30
    - Active in notifications/activity: +30
    - Has website: +10
    """
    score = 0
    u = m.get("user") or m
    if (u.get("bio") or "").strip():
        score += 20
    if u.get("avatar_url") or u.get("profile_picture"):
        score += 10
    if u.get("is_verified") or u.get("verified"):
        score += 30
    handle = _raw_handle(m)
    if handle in activity_handles:
        score += 30
    if u.get("website") or u.get("url"):
        score += 10
    return min(score, 100)

def build_citizen_record(m: dict, activity_handles: set, existing_handles: set) -> dict:
    """Build a full detailed citizen record from a raw API member object."""
    u = m.get("user") or m
    handle_raw  = (u.get("username") or u.get("handle") or "").strip("@")
    name        = (u.get("name") or u.get("full_name") or handle_raw or "Unknown")
    bio         = (u.get("bio") or u.get("description") or "").strip()
    avatar      = u.get("avatar_url") or u.get("profile_picture") or ""
    website     = u.get("website") or u.get("url") or ""
    location    = u.get("location") or ""
    is_verified = bool(u.get("is_verified") or u.get("verified"))
    followers   = int(u.get("followers_count") or u.get("followers") or 0)
    following   = int(u.get("following_count") or u.get("following") or 0)

    joined_raw = m.get("joined_at") or m.get("created_at") or u.get("created_at") or ""
    try:
        joined = datetime.fromisoformat(
            joined_raw.replace("Z", "+00:00")
        ).strftime("%Y-%m-%d %H:%M UTC")
    except Exception:
        joined = joined_raw[:19] or "unknown"

    role = (m.get("role") or "member").lower()
    sector = infer_sector(bio, name)
    eng_score = compute_engagement_score(m, activity_handles)

    # Vault status
    is_new = handle_raw.lower() not in existing_handles

    record = {
        "name":              name,
        "handle":            f"@{handle_raw}",
        "role":              role,
        "source":            "group_members",
        # enriched fields (v2)
        "bio":               bio or None,
        "sector":            sector,
        "location":          location or None,
        "website":           website or None,
        "avatar_url":        avatar or None,
        "is_verified":       is_verified,
        "followers":         followers,
        "following":         following,
        "joined_group":      joined,
        "engagement_score":  eng_score,
        "vault_status":      "NEW" if is_new else "EXISTING",
        "synced_at":         datetime.now(timezone.utc).isoformat(),
    }
    # Remove None values from the record for cleanliness
    return {k: v for k, v in record.items() if v is not None and v != ""}

# ── Load existing vault handles ───────────────────────────────────────────────

def load_existing_handles() -> set:
    if not MEMBERS_PATH.exists():
        return set()
    data = json.loads(MEMBERS_PATH.read_text())
    if isinstance(data, list):
        members = data
    else:
        members = data.get("members") or []
    handles = set()
    for m in members:
        h = (m.get("handle") or "").lower().strip("@")
        if h:
            handles.add(h)
    return handles

# ── Load activity handles from engagement log (for scoring) ──────────────────

def load_activity_handles() -> set:
    handles = set()
    log_path = VAULT / "engagement" / "activity_log.json"
    if not log_path.exists():
        return handles
    try:
        data = json.loads(log_path.read_text())
        events = data if isinstance(data, list) else data.get("events", [])
        for e in events:
            h = (e.get("handle") or e.get("username") or "").lower().strip("@")
            if h:
                handles.add(h)
    except Exception:
        pass
    return handles

# ── MAIN SYNC ─────────────────────────────────────────────────────────────────

def run_sync():
    print(f"\n{DIVIDER}")
    print("⛓️  AMD FULL ROSTER SYNC — DATA INTEGRITY SWEEP")
    print(f"📅  {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{DIVIDER}")

    s = login()

    # ── 1. LOAD EXISTING STATE ────────────────────────────────────────────────
    existing_handles = load_existing_handles()
    activity_handles = load_activity_handles()

    print(f"\n📂 Existing vault: {len(existing_handles)} known handles")
    print(f"📊 Activity log:   {len(activity_handles)} active handles")

    # Load existing vault members to preserve their records
    existing_vault_members = []
    if MEMBERS_PATH.exists():
        vault_data = json.loads(MEMBERS_PATH.read_text())
        existing_vault_members = vault_data.get("members") or []

    # Load profile followers for cross-reference
    follower_handles = set()
    if FOLLOWERS_PATH.exists():
        fdata = json.loads(FOLLOWERS_PATH.read_text())
        for m in (fdata.get("members") or []):
            h = (m.get("handle") or "").lower().strip("@")
            if h:
                follower_handles.add(h)
    print(f"👥 Profile followers: {len(follower_handles)} known handles")

    # ── 2. DEEP SWEEP ─────────────────────────────────────────────────────────
    print(f"\n[1/4] EXECUTING DEEP ROSTER SWEEP...")
    live_raw_members = deep_sweep(s)

    if not live_raw_members:
        print("❌ API returned 0 members — aborting to protect vault integrity")
        sys.exit(1)

    print(f"\n  Live member count from API: {len(live_raw_members)}")

    # ── 3. BUILD CITIZEN RECORDS ──────────────────────────────────────────────
    print(f"\n[2/4] BUILDING CITIZEN RECORDS...")

    all_citizen_records = []
    new_citizens        = []
    upgraded_citizens   = []   # existing members getting enriched records

    # Preserve existing records as baseline (upgrade in place)
    existing_by_handle = {}
    for m in existing_vault_members:
        h = (m.get("handle") or "").lower().strip("@")
        if h:
            existing_by_handle[h] = m

    live_handles_seen = set()

    for raw in live_raw_members:
        record = build_citizen_record(raw, activity_handles, existing_handles)
        handle_clean = (record.get("handle") or "").lower().strip("@")
        live_handles_seen.add(handle_clean)

        if handle_clean in existing_by_handle:
            # Existing member — enrich with new API fields, keep vault_status = EXISTING
            existing_rec = existing_by_handle[handle_clean]
            merged = {**existing_rec, **{
                k: v for k, v in record.items()
                if k not in ("vault_status",) and v  # don't overwrite with empty
            }}
            merged["vault_status"] = "EXISTING"
            all_citizen_records.append(merged)
            upgraded_citizens.append(handle_clean)
        else:
            # New citizen
            record["vault_status"] = "NEW"
            all_citizen_records.append(record)
            new_citizens.append(record)
            print(f"  ✨ New citizen: {record['handle']:<25} | {record['name']:<28} | {record.get('sector','?')}")

    # Sort: owner first, then by engagement_score desc, then alpha
    def sort_key(r):
        role_order = 0 if r.get("role") == "owner" else 1 if r.get("role") == "admin" else 2
        return (role_order, -(r.get("engagement_score") or 0), r.get("name") or "")

    all_citizen_records.sort(key=sort_key)

    print(f"\n  📊 New citizens discovered:   {len(new_citizens)}")
    print(f"  📊 Existing records upgraded: {len(upgraded_citizens)}")
    print(f"  📊 Total vault size:          {len(all_citizen_records)}")

    # ── 4. COMPUTE CROSS-REFERENCE ────────────────────────────────────────────
    print(f"\n[3/4] COMPUTING CROSS-REFERENCES...")

    super_fans = [
        r for r in all_citizen_records
        if (r.get("handle") or "").lower().strip("@") in follower_handles
        and (r.get("handle") or "").lower().strip("@") in live_handles_seen
    ]
    group_only = [
        r for r in all_citizen_records
        if (r.get("handle") or "").lower().strip("@") not in follower_handles
    ]
    profile_only_handles = follower_handles - live_handles_seen
    overlap_count = len(super_fans)

    unique_total = len(all_citizen_records) + len(profile_only_handles) - overlap_count

    print(f"  👑 Super-fans (group + following): {len(super_fans)}")
    print(f"  👥 Group-only (not following):     {len(group_only)}")
    print(f"  🌐 Profile-only (not in group):    {len(profile_only_handles)}")
    print(f"  🧠 Unique total reach:             {unique_total}")

    # ── 5. SEGMENT NEW CITIZENS ───────────────────────────────────────────────
    # Classify by sector for the report
    sector_map = {}
    for r in all_citizen_records:
        sec = r.get("sector") or "Ecosystem Citizen"
        sector_map.setdefault(sec, 0)
        sector_map[sec] += 1
    sector_breakdown = dict(sorted(sector_map.items(), key=lambda x: -x[1]))

    # Engagement tiers
    high_eng   = [r for r in all_citizen_records if (r.get("engagement_score") or 0) >= 60]
    medium_eng = [r for r in all_citizen_records if 30 <= (r.get("engagement_score") or 0) < 60]
    low_eng    = [r for r in all_citizen_records if (r.get("engagement_score") or 0) < 30]

    # ── 6. WRITE ALL FILES ────────────────────────────────────────────────────
    print(f"\n[4/4] WRITING VAULT FILES...")

    now_iso = datetime.now(timezone.utc).isoformat()

    # 6a. members/group/members.json
    members_out = {
        "total": len(all_citizen_records),
        "last_synced": now_iso,
        "sync_source": "deep_sweep_v3",
        "members": all_citizen_records,
    }
    MEMBERS_PATH.write_text(json.dumps(members_out, indent=2, ensure_ascii=False))
    print(f"  ✅ members/group/members.json → {len(all_citizen_records)} citizens")

    # 6b. engagement/cross_reference.json
    xref = json.loads(XREF_PATH.read_text()) if XREF_PATH.exists() else {}
    xref.update({
        "last_synced": now_iso,
        "super_fans": {
            "count": len(super_fans),
            "members": [{"name": r["name"], "handle": r["handle"],
                         "role": r.get("role", "member"), "source": "group_members"}
                        for r in super_fans],
        },
        "group_only": {
            "count": len(group_only),
            "members": [{"name": r["name"], "handle": r["handle"],
                         "role": r.get("role", "member"), "source": "group_members"}
                        for r in group_only],
        },
    })
    XREF_PATH.write_text(json.dumps(xref, indent=2, ensure_ascii=False))
    print(f"  ✅ engagement/cross_reference.json → updated")

    # 6c. reports/empire_citizen_report.json
    report = json.loads(REPORT_PATH.read_text()) if REPORT_PATH.exists() else {}
    report.update({
        "generated_at": now_iso,
        "empire_citizen_report": {
            "profile_followers": len(follower_handles),
            "group_members": len(all_citizen_records),
            "overlap_super_fans": overlap_count,
            "unique_total_reach": unique_total,
            "formula": (
                f"{len(follower_handles)} profile followers + "
                f"{len(all_citizen_records)} group members − "
                f"{overlap_count} overlap = {unique_total} unique citizens"
            ),
        },
        "growth_intelligence": {
            "previous_vault_count":  len(existing_handles),
            "live_api_count":        len(all_citizen_records),
            "net_new_citizens":      len(new_citizens),
            "group_only_unconverted": len(group_only) - 1,  # exclude CEO
            "profile_only_unconverted": len(profile_only_handles),
            "conversion_note": (
                f"{len(group_only) - 1} group members haven't followed the CEO profile yet — "
                f"highest-priority invite targets. "
                f"{len(profile_only_handles)} profile followers haven't joined the group yet."
            ),
        },
        "sector_breakdown": sector_breakdown,
        "engagement_tiers": {
            "high_60_plus":   len(high_eng),
            "medium_30_59":   len(medium_eng),
            "low_under_30":   len(low_eng),
        },
        "new_citizens_this_sync": [
            {"handle": r["handle"], "name": r["name"],
             "sector": r.get("sector"), "joined": r.get("joined_group"),
             "engagement_score": r.get("engagement_score")}
            for r in new_citizens
        ],
        "vault_structure": {
            **report.get("vault_structure", {}),
            "members/group/members.json": f"{len(all_citizen_records)} group members (v2 detailed)",
            "last_roster_sync": now_iso,
        },
    })
    # Preserve existing training_data, spam_alerts, top_super_fans
    if "training_data" not in report:
        report["training_data"] = {}
    if super_fans:
        report["top_super_fans"] = [r["name"] for r in super_fans]

    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"  ✅ reports/empire_citizen_report.json → updated")

    # 6d. Save sync log to live/
    LIVE_PATH.mkdir(parents=True, exist_ok=True)
    sync_log = {
        "sync_time":       now_iso,
        "live_api_count":  len(all_citizen_records),
        "previous_count":  len(existing_handles),
        "new_citizens":    len(new_citizens),
        "new_citizen_list": [
            {"handle": r["handle"], "name": r["name"],
             "sector": r.get("sector"), "joined": r.get("joined_group")}
            for r in new_citizens
        ],
        "sector_breakdown": sector_breakdown,
        "sync_status": f"VAULT SYNCHRONIZED AT {len(all_citizen_records)}",
    }
    (LIVE_PATH / "roster_sync_latest.json").write_text(
        json.dumps(sync_log, indent=2, ensure_ascii=False)
    )
    print(f"  ✅ live/roster_sync_latest.json → sync log saved")

    # ── FINAL REPORT ──────────────────────────────────────────────────────────
    print(f"\n{DIVIDER}")
    print(f"⛓️  ROSTER SYNC COMPLETE")
    print(f"{DIVIDER}")
    print(f"  📊 Previous vault count:   {len(existing_handles)}")
    print(f"  📊 Live API count:         {len(all_citizen_records)}")
    print(f"  ✨ New citizens added:     {len(new_citizens)}")
    print(f"  🔄 Existing records upgraded: {len(upgraded_citizens)}")
    print(f"  👑 Super-fans:             {len(super_fans)}")
    print(f"  🧠 Unique total reach:     {unique_total}")
    print(f"\n  Sector breakdown:")
    for sec, count in sector_breakdown.items():
        bar = "█" * min(count, 30)
        print(f"    {sec:<35} {bar} {count}")
    print(f"\n  Engagement tier breakdown:")
    print(f"    🔴 High (60+):    {len(high_eng)} members")
    print(f"    🟡 Medium (30–59): {len(medium_eng)} members")
    print(f"    ⚫ Low (<30):     {len(low_eng)} members")
    print(f"\n{DIVIDER}")
    print(f"  🏁 STATUS: VAULT SYNCHRONIZED AT {len(all_citizen_records)}")
    print(f"{DIVIDER}\n")

    return len(all_citizen_records), len(new_citizens)


if __name__ == "__main__":
    run_sync()
