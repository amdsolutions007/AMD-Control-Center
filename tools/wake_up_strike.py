#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║           007 WAKE-UP STRIKE — LekeeBot v2 Module 7                        ║
║    128-member personalised DM blast with stealth jitter                     ║
║    Signature: — Olawale | AMD Solutions 007 🛰️🌍                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

Usage:
  python3 tools/wake_up_strike.py            # Full blast (all 127 members)
  python3 tools/wake_up_strike.py --dry-run  # Preview only, no sends
  python3 tools/wake_up_strike.py --limit 10 # Blast first 10 only (test)
  python3 tools/wake_up_strike.py --resume   # Skip already-blasted members

STEALTH JITTER: 450–750 seconds between batches of 5 (non-negotiable).
LINK PROTOCOL : Group members → @amd follow only. No website link.
"""

import argparse
import base64
import json
import os
import random
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

# ── Credentials ───────────────────────────────────────────────────────────────
EMAIL    = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
BASE_URL = "https://www.lekeelekee.com/api/v1"
STATIC_IV = "MDAwMDAwMDAwMDAwMDAwMA=="

# ── Telegram alert ─────────────────────────────────────────────────────────────
TG_TOKEN  = os.getenv("TELEGRAM_BOT_TOKEN", "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg")
CEO_TG_ID = os.getenv("CEO_TELEGRAM_ID",   "8013249849")

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT        = Path(__file__).resolve().parent.parent
VAULT_LIVE  = ROOT / "intelligence_vault" / "live"
MEMBERS_FILE = VAULT_LIVE / "group_members_full.json"
DM_DIR_FILE  = VAULT_LIVE / "dm_directory.json"
LOG_FILE     = ROOT / "logs" / f"wake_up_strike_{datetime.now().strftime('%Y%m%d_%H%M')}.log"

# ── Blast config ───────────────────────────────────────────────────────────────
BATCH_SIZE  = 5
JITTER_MIN  = 450   # seconds
JITTER_MAX  = 750   # seconds

# ── The Caption (LOCKED) ───────────────────────────────────────────────────────
def build_caption(first_name: str) -> str:
    name = (first_name.split()[0] if first_name else "there").strip()
    return (
        f"Hard question for you, {name}:\n\n"
        "If you stopped working tomorrow, would your startup still make money?\n\n"
        "If the answer is NO — you have a job, not a business. "
        "You have a salary, not a system.\n\n"
        "I reached out directly because you're in the African Tech Ecosystem — "
        "which means you already understand the opportunity. "
        "The question is whether you're building to own it.\n\n"
        "I drop daily blueprints in #General. Systems. Automation. Leverage.\n\n"
        "I'm the Architect. Let's talk about what you're building. "
        "Reply with one word: your biggest bottleneck.\n\n"
        "Follow @amd for the daily architect brief.\n\n"
        "— Olawale | AMD Solutions 007 🛰️🌍"
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


def _headers() -> dict:
    return {"Authorization": f"Bearer {_token}"}


def _encode(text: str) -> str:
    return base64.b64encode(text.encode()).decode()


def _send_tg(msg: str) -> None:
    try:
        requests.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={"chat_id": CEO_TG_ID, "text": msg},
            timeout=10,
        )
    except Exception:
        pass  # TG alert is best-effort


def _log(line: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
    entry = f"[{ts}] {line}"
    print(entry)
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")


def _load_dm_directory() -> dict:
    if DM_DIR_FILE.exists():
        return json.loads(DM_DIR_FILE.read_text())
    return {}


def _save_dm_directory(dm_dir: dict) -> None:
    DM_DIR_FILE.write_text(json.dumps(dm_dir, indent=2))


def _load_members() -> list[dict]:
    data = json.loads(MEMBERS_FILE.read_text())
    return data.get("members", data) if isinstance(data, dict) else data


def _open_or_get_dm(uid: str) -> tuple[str | None, str]:
    """
    Open/get a DM conversation with the given public_id.
    Returns (conv_public_id, status) where status is:
      'new'       — newly created
      'exists'    — conv already existed
      'no_follow' — 403 mutual-follow required
      'error'     — API error
    """
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
    """Send an encrypted message to a DM conversation."""
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


# ── Main blast ─────────────────────────────────────────────────────────────────
def run_blast(dry_run: bool = False, limit: int | None = None, resume: bool = False, start_index: int = 0) -> None:
    _log("=" * 72)
    _log("🛰️  007 WAKE-UP STRIKE — INITIATED")
    _log(f"   Mode: {'DRY RUN' if dry_run else 'LIVE FIRE'} | Batch: {BATCH_SIZE} | Jitter: {JITTER_MIN}–{JITTER_MAX}s")
    _log("=" * 72)

    if not dry_run:
        _log("🔐 Authenticating to LekeeLekee...")
        _auth()
        _log("✅ Auth OK")

    members  = _load_members()
    dm_dir   = _load_dm_directory()

    if limit:
        members = members[:limit]
        _log(f"⚠️  Limit set: blasting first {limit} members only")

    if start_index:
        members = members[start_index:]
        _log(f"⏩ start-index: skipping first {start_index} members, {len(members)} remain")

    if resume:
        blasted_usernames = set(dm_dir.keys())
        before = len(members)
        members = [m for m in members if m.get("username", "").lower() not in blasted_usernames]
        _log(f"🔄 Resume mode: skipped {before - len(members)} already-blasted, {len(members)} remain")

    total    = len(members)
    batches  = [members[i:i+BATCH_SIZE] for i in range(0, total, BATCH_SIZE)]
    _log(f"🎯 Target: {total} members → {len(batches)} batches of {BATCH_SIZE}")

    sent_count   = 0
    skip_follow  = 0
    skip_error   = 0
    batch_num    = 0

    _send_tg(
        f"🛰️ Wake-Up Strike INITIATED\n"
        f"Target: {total} members | {len(batches)} batches\n"
        f"Mode: {'DRY RUN' if dry_run else '🔥 LIVE FIRE'}\n"
        f"Jitter: {JITTER_MIN}–{JITTER_MAX}s between batches"
    )

    for batch in batches:
        batch_num += 1
        _log(f"\n── Batch {batch_num}/{len(batches)} ──────────────────────────────")

        for member in batch:
            uid      = member.get("public_id", "")
            name     = member.get("name", "there")
            username = member.get("username", "?")
            caption  = build_caption(name)

            _log(f"  ➤ @{username} ({name[:25]}) [{uid[:8]}]")

            if dry_run:
                _log(f"    [DRY RUN] Would send {len(caption)} chars")
                sent_count += 1
                continue

            conv_id, status = _open_or_get_dm(uid)

            if status == "no_follow":
                _log(f"    ⚪ SKIP — mutual follow required")
                skip_follow += 1
                continue
            elif status.startswith("error"):
                _log(f"    ❌ ERROR — {status}")
                skip_error += 1
                continue

            # Save conv_id to dm_directory
            dm_dir[username.lower()] = conv_id
            _save_dm_directory(dm_dir)

            success = _send_dm(conv_id, caption)
            if success:
                _log(f"    ✅ SENT [{status}] conv={conv_id[:8]}")
                sent_count += 1
            else:
                _log(f"    ❌ SEND FAILED conv={conv_id[:8]}")
                skip_error += 1

        # ── Per-batch Telegram alert ────────────────────────────────────────────
        pct = round((batch_num / len(batches)) * 100)
        _send_tg(
            f"📡 Strike update — Batch {batch_num}/{len(batches)} ({pct}%)\n"
            f"✅ Sent: {sent_count} | ⚪ No-follow: {skip_follow} | ❌ Errors: {skip_error}"
        )

        # ── Stealth jitter (skip after last batch) ─────────────────────────────
        if batch_num < len(batches):
            jitter = random.uniform(JITTER_MIN, JITTER_MAX)
            _log(f"\n⏳ Jitter: sleeping {jitter:.0f}s before next batch…")
            time.sleep(jitter)

    # ── Final summary ──────────────────────────────────────────────────────────
    _log("\n" + "=" * 72)
    _log("🏁 007 WAKE-UP STRIKE — COMPLETE")
    _log(f"   ✅ Sent       : {sent_count}")
    _log(f"   ⚪ No-follow  : {skip_follow}")
    _log(f"   ❌ Errors     : {skip_error}")
    _log(f"   📁 DM dir    : {len(dm_dir)} entries saved")
    _log(f"   📋 Log       : {LOG_FILE}")
    _log("=" * 72)

    _send_tg(
        f"🏁 007 WAKE-UP STRIKE COMPLETE\n"
        f"✅ DMs sent: {sent_count}\n"
        f"⚪ No-follow (skipped): {skip_follow}\n"
        f"❌ Errors: {skip_error}\n"
        f"📁 DM directory: {len(dm_dir)} convs wired\n"
        f"#General post is live. Architect Brief starts 07:00 WAT tomorrow."
    )


# ── CLI ────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="007 Wake-Up Strike — DM blast tool")
    ap.add_argument("--dry-run",    action="store_true", help="Preview only, no sends")
    ap.add_argument("--limit",      type=int,            help="Blast first N members only")
    ap.add_argument("--resume",     action="store_true", help="Skip already-blasted members (in dm_directory)")
    ap.add_argument("--start-index",type=int, default=0, help="Skip first N members (resume from position)")
    args = ap.parse_args()
    run_blast(dry_run=args.dry_run, limit=args.limit, resume=args.resume, start_index=args.start_index)
