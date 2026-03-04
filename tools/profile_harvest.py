#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║      OPERATION PROFILE HARVEST — LekeeBot v2 Module 8                      ║
║   63-follower "Hard Truth" DM blast → African Tech Ecosystem group join     ║
║   Bio-Aware Priority Queue · 450–750s stealth jitter · DOME wired          ║
║   Signature: — Olawale | AMD Solutions 007 🛰️🌾                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Usage:
  python3 tools/profile_harvest.py             # Full blast (all 63 followers)
  python3 tools/profile_harvest.py --dry-run   # Preview only, no sends
  python3 tools/profile_harvest.py --limit 5   # First 5 only (smoke test)
  python3 tools/profile_harvest.py --resume    # Skip already-blasted handles
  python3 tools/profile_harvest.py --no-sort   # Disable bio-priority sort

Bio-Aware Priority Queue:
  HIGH-intent bios (startup/founder/CEO/tech/entrepreneur/analyst/investor)
  are blasted FIRST to maximise early DOME reply volume.

TARGET: followers.json → 63 mutual followers → 100% delivery guarantee.
LINK  : https://www.lekeelekee.com  (African Tech Ecosystem group)
DOME  : Every successful conv_id is written to dm_directory.json for
        Railway intel engine to track replies automatically.
"""

import argparse
import base64
import json
import os
import random
import re
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

# ── Credentials ───────────────────────────────────────────────────────────────
EMAIL     = "ceo@amdsolutions007.com"
PASSWORD  = "#@Amdmail@007"
BASE_URL  = "https://www.lekeelekee.com/api/v1"
STATIC_IV = "MDAwMDAwMDAwMDAwMDAwMA=="

# ── Group link (The Destination) ─────────────────────────────────────────────
GROUP_SLUG     = "african-tech-ecosystem"
GROUP_ID       = "4d183887-2d5a-47b0-8226-dd6939d29694"
GROUP_LINK     = f"https://www.lekeelekee.com/groups/{GROUP_SLUG}"
WEBSITE_LINK   = "https://www.amdsolutions007.com/tech"

# ── Telegram alert ─────────────────────────────────────────────────────────────
TG_TOKEN  = os.getenv("TELEGRAM_BOT_TOKEN", "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg")
CEO_TG_ID = os.getenv("CEO_TELEGRAM_ID",   "8013249849")

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT          = Path(__file__).resolve().parent.parent
VAULT_LIVE    = ROOT / "intelligence_vault" / "live"
FOLLOWERS_FILE = ROOT / "intelligence_vault" / "members" / "profile" / "followers.json"
DM_DIR_FILE   = VAULT_LIVE / "dm_directory.json"
LOG_FILE      = ROOT / "logs" / f"profile_harvest_{datetime.now().strftime('%Y%m%d_%H%M')}.log"

# ── Blast config ───────────────────────────────────────────────────────────────
BATCH_SIZE = 5
JITTER_MIN = 450   # seconds — non-negotiable stealth law
JITTER_MAX = 750   # seconds

# ── Bio-Aware Priority Keywords (Award-Winning Sort) ─────────────────────────
HIGH_INTENT_KEYWORDS = [
    "startup", "founder", "ceo", "entrepreneur", "investor", "tech",
    "engineer", "developer", "analyst", "business", "digital", "marketing",
    "product", "manager", "consultant", "fintech", "saas", "software",
    "data", "strategy", "growth", "revenue", "sales", "automation",
    "media", "creator", "content", "leadership", "executive",
]

def _bio_score(bio: str) -> int:
    """Score a bio by keyword density. Higher = more likely to convert."""
    if not bio:
        return 0
    bio_lower = bio.lower()
    return sum(1 for kw in HIGH_INTENT_KEYWORDS if kw in bio_lower)


# ── The Caption (LOCKED) ───────────────────────────────────────────────────────
def build_caption(first_name: str) -> str:
    """Profile Harvest 'Hard Truth' hook with group link."""
    name = (first_name.split()[0] if first_name else "there").strip()
    # Clean up names that start with numbers/symbols
    clean = re.sub(r"^[^a-zA-Z]+", "", name).strip()
    if not clean:
        clean = "there"
    return (
        f"Hard question for you, {clean}:\n\n"
        "If you stopped working tomorrow, would your startup still make money?\n\n"
        "If the answer is NO — you have a job, not a business. "
        "You have a salary, not a system.\n\n"
        "I've moved my daily 36-State Blueprints and automation strategies "
        "into the private African Tech Ecosystem group. "
        "Every morning I drop the exact frameworks I use to build revenue machines "
        "that run without the founder in the room.\n\n"
        f"Join here → {GROUP_LINK}\n\n"
        "Reply with one word: your biggest bottleneck right now.\n\n"
        f"— Olawale | AMD Solutions 007 🛰️🌍\n"
        f"🌐 {WEBSITE_LINK}"
    )


# ── API helpers ────────────────────────────────────────────────────────────────
_session: requests.Session | None = None
_token: str = ""


def _auth() -> None:
    global _session, _token
    _session = requests.Session()
    r = _session.post(
        f"{BASE_URL}/auth/login",
        data={"email": EMAIL, "password": PASSWORD},
        timeout=20,
    )
    r.raise_for_status()
    _token = r.json()["data"]["token"]
    _session.headers.update({"Authorization": f"Bearer {_token}"})


def _safe_json(resp: requests.Response) -> dict:
    try:
        return resp.json()
    except Exception:
        return {}


def _encode(text: str) -> str:
    return base64.b64encode(text.encode()).decode()


def _send_tg(msg: str) -> None:
    try:
        requests.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={"chat_id": CEO_TG_ID, "text": msg, "parse_mode": "HTML"},
            timeout=10,
        )
    except Exception:
        pass


def _log(line: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
    entry = f"[{ts}] {line}"
    print(entry)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")


def _load_dm_directory() -> dict:
    if DM_DIR_FILE.exists():
        try:
            return json.loads(DM_DIR_FILE.read_text())
        except Exception:
            return {}
    return {}


def _save_dm_directory(dm_dir: dict) -> None:
    VAULT_LIVE.mkdir(parents=True, exist_ok=True)
    DM_DIR_FILE.write_text(json.dumps(dm_dir, indent=2))


# ── UID Resolver ───────────────────────────────────────────────────────────────
_uid_cache: dict[str, str] = {}
_group_uid_map: dict[str, str] = {}   # pre-built from group_members_full.json


def _build_group_uid_map() -> None:
    """
    Pre-populate uid cache from group_members_full.json (no API call needed).
    Covers followers who are also group members.
    """
    global _group_uid_map
    gf = ROOT / "intelligence_vault" / "live" / "group_members_full.json"
    if not gf.exists():
        return
    try:
        gdata = json.loads(gf.read_text())
        members = gdata.get("members", gdata) if isinstance(gdata, dict) else gdata
        for m in members:
            uname = (m.get("username") or "").lstrip("@").lower()
            uid = m.get("public_id", "")
            if uname and uid:
                _group_uid_map[uname] = uid
                _uid_cache[uname] = uid
    except Exception:
        pass


def _resolve_uid(username: str) -> str | None:
    """
    Resolve @username → public_id.
    1. Check local cache (pre-built from group_members_full.json)
    2. Search API: GET /api/v1/search/users?q={username}
       → filter results for exact username match (case-insensitive)
    """
    uname = username.lstrip("@").strip()
    uname_lower = uname.lower()

    if uname_lower in _uid_cache:
        return _uid_cache[uname_lower]

    try:
        resp = _session.get(
            f"{BASE_URL}/search/users",
            params={"q": uname},
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        data = _safe_json(resp)
        users = (
            data.get("data", {}).get("users", {}).get("data")
            or data.get("users", {}).get("data")
            or []
        )
        for u in users:
            if (u.get("username") or "").lower() == uname_lower:
                uid = u.get("public_id") or u.get("id", "")
                if uid:
                    _uid_cache[uname_lower] = str(uid)
                    return str(uid)
    except Exception:
        pass

    return None


# ── DM helpers ─────────────────────────────────────────────────────────────────
def _open_or_get_dm(uid: str) -> tuple[str | None, str]:
    r = _session.post(
        f"{BASE_URL}/conversations",
        json={"type": "direct", "member_ids": [uid]},
        timeout=20,
    )
    if r.status_code in (200, 201):
        conv = r.json().get("conversation", {})
        conv_id = conv.get("public_id")
        msg = r.json().get("message", "")
        status = "exists" if "already exists" in msg else "new"
        return conv_id, status
    elif r.status_code == 403:
        return None, "no_follow"
    else:
        return None, f"error_{r.status_code}"


def _send_dm(conv_id: str, text: str) -> bool:
    payload = {
        "ciphertext": _encode(text),
        "iv":         STATIC_IV,
    }
    r = _session.post(
        f"{BASE_URL}/conversations/{conv_id}/messages",
        json=payload,
        timeout=20,
    )
    return r.status_code in (200, 201)


# ── Load & sort followers ──────────────────────────────────────────────────────
def _load_followers(bio_sort: bool = True) -> list[dict]:
    data = json.loads(FOLLOWERS_FILE.read_text())
    members = data.get("members", data) if isinstance(data, dict) else data

    if bio_sort:
        # Bio-Aware Priority Queue: high-intent bios first
        members = sorted(members, key=lambda m: _bio_score(m.get("bio", "")), reverse=True)
        high = sum(1 for m in members if _bio_score(m.get("bio", "")) > 0)
        _log(f"🧠 Bio-Aware Sort applied — {high} HIGH-intent / {len(members)-high} STANDARD")

    return members


# ── Main blast ─────────────────────────────────────────────────────────────────
def run_harvest(
    dry_run: bool = False,
    limit: int | None = None,
    resume: bool = False,
    start_index: int = 0,
    bio_sort: bool = True,
) -> None:
    _log("=" * 72)
    _log("🌾 OPERATION PROFILE HARVEST — INITIATED")
    _log(f"   Mode: {'DRY RUN' if dry_run else 'LIVE FIRE'} | Batch: {BATCH_SIZE} | Jitter: {JITTER_MIN}–{JITTER_MAX}s")
    _log(f"   Source: {FOLLOWERS_FILE.name} | Bio sort: {bio_sort}")
    _log("=" * 72)

    if not dry_run:
        _log("🔐 Authenticating to LekeeLekee...")
        _auth()
        _log("✅ Auth OK")
        _build_group_uid_map()
        if _group_uid_map:
            _log(f"📋 Pre-loaded {len(_group_uid_map)} UIDs from group_members_full.json")

    members = _load_followers(bio_sort=bio_sort)
    dm_dir  = _load_dm_directory()

    if limit:
        members = members[:limit]
        _log(f"⚠️  Limit set: blasting first {limit} followers only")

    if start_index:
        members = members[start_index:]
        _log(f"⏩ start-index: skipping first {start_index}, {len(members)} remain")

    if resume:
        blasted = set(dm_dir.keys())
        before  = len(members)
        members = [m for m in members if m.get("handle", "").lstrip("@").lower() not in blasted]
        _log(f"🔄 Resume: skipped {before - len(members)} already-harvested, {len(members)} remain")

    total   = len(members)
    batches = [members[i:i+BATCH_SIZE] for i in range(0, total, BATCH_SIZE)]
    _log(f"🎯 Target: {total} followers → {len(batches)} batches of {BATCH_SIZE}")

    sent_count  = 0
    skip_follow = 0
    skip_error  = 0
    skip_noid   = 0
    batch_num   = 0

    _send_tg(
        f"🌾 <b>PROFILE HARVEST INITIATED</b>\n"
        f"Target: {total} followers | {len(batches)} batches\n"
        f"Mode: {'DRY RUN' if dry_run else '🔥 LIVE FIRE'}\n"
        f"Bio-Aware Sort: {'ON' if bio_sort else 'OFF'}\n"
        f"Jitter: {JITTER_MIN}–{JITTER_MAX}s | CTA: Join African Tech Ecosystem"
    )

    for batch in batches:
        batch_num += 1
        _log(f"\n── Batch {batch_num}/{len(batches)} ──────────────────────────────")

        for member in batch:
            raw_handle = member.get("handle", "")
            username   = raw_handle.lstrip("@").strip()
            name       = member.get("name", "there")
            bio        = member.get("bio", "")
            score      = _bio_score(bio)
            caption    = build_caption(name)
            tier       = "🔥 HIGH" if score > 0 else "⚪ STD"

            _log(f"  ➤ @{username} ({name[:30]}) [{tier}]")

            if dry_run:
                _log(f"    [DRY RUN] Caption ({len(caption)} chars): {caption[:120].replace(chr(10),' ')}")
                sent_count += 1
                continue

            # Step 1: Resolve UID
            uid = _resolve_uid(username)
            if not uid:
                _log(f"    ⚠️  UID NOT FOUND — skipping @{username}")
                skip_noid += 1
                continue

            # Step 2: Open/get DM conv
            conv_id, status = _open_or_get_dm(uid)
            if status == "no_follow":
                _log(f"    ⚪ SKIP — mutual follow required (@{username})")
                skip_follow += 1
                continue
            elif status.startswith("error"):
                _log(f"    ❌ DM OPEN ERROR — {status} (@{username})")
                skip_error += 1
                continue

            # Step 3: Wire to DOME (dm_directory.json) BEFORE sending
            dm_dir[username.lower()] = conv_id
            _save_dm_directory(dm_dir)

            # Step 4: Send
            success = _send_dm(conv_id, caption)
            if success:
                _log(f"    ✅ SENT [{status}] conv={conv_id[:8]} @{username}")
                sent_count += 1
            else:
                _log(f"    ❌ SEND FAILED conv={conv_id[:8]} @{username}")
                skip_error += 1

        # ── Per-batch Telegram pulse ───────────────────────────────────────────
        pct = round((batch_num / len(batches)) * 100)
        _send_tg(
            f"🌾 <b>Harvest update</b> — Batch {batch_num}/{len(batches)} ({pct}%)\n"
            f"✅ Sent: {sent_count} | ⚪ No-follow: {skip_follow} | "
            f"❌ Errors: {skip_error} | 🔍 UID miss: {skip_noid}"
        )

        # ── Stealth jitter (skip after last batch) ─────────────────────────────
        if batch_num < len(batches):
            jitter = random.uniform(JITTER_MIN, JITTER_MAX)
            _log(f"\n⏳ Jitter: sleeping {jitter:.0f}s before next batch…")
            time.sleep(jitter)

    # ── Final summary ──────────────────────────────────────────────────────────
    _log("\n" + "=" * 72)
    _log("🏁 OPERATION PROFILE HARVEST — COMPLETE")
    _log(f"   ✅ Sent         : {sent_count}")
    _log(f"   ⚪ No-follow    : {skip_follow}")
    _log(f"   🔍 UID not found: {skip_noid}")
    _log(f"   ❌ Errors       : {skip_error}")
    _log(f"   📁 DM dir wired : {len(dm_dir)} entries → DOME tracking live")
    _log(f"   📋 Log          : {LOG_FILE}")
    _log("=" * 72)

    _send_tg(
        f"🏁 <b>PROFILE HARVEST COMPLETE</b>\n"
        f"✅ DMs sent: {sent_count}\n"
        f"⚪ No-follow (skipped): {skip_follow}\n"
        f"🔍 UID not found: {skip_noid}\n"
        f"❌ Errors: {skip_error}\n"
        f"📁 DOME wired: {len(dm_dir)} convs tracked\n"
        f"🛰️ Railway DOME will forward replies to CEO within 60s"
    )


# ── CLI ────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="OPERATION PROFILE HARVEST — 63-follower DM blast")
    ap.add_argument("--dry-run",     action="store_true", help="Preview only, no sends")
    ap.add_argument("--limit",       type=int,            help="Blast first N followers only")
    ap.add_argument("--resume",      action="store_true", help="Skip already-blasted handles")
    ap.add_argument("--start-index", type=int, default=0, help="Skip first N in sorted list")
    ap.add_argument("--no-sort",     action="store_true", help="Disable bio-aware priority sort")
    args = ap.parse_args()

    run_harvest(
        dry_run=args.dry_run,
        limit=args.limit,
        resume=args.resume,
        start_index=args.start_index,
        bio_sort=not args.no_sort,
    )
