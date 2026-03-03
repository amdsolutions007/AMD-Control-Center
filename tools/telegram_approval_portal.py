#!/usr/bin/env python3
"""
tools/telegram_approval_portal.py
===================================
LekeeBot v2 — Module 4: Telegram Approval Gate (PUSH TOOL)
AMD Control Center | 2026-03-03

PURPOSE — PUSH ONLY (no polling):
  Sends pending drafts from draft_queue.json to CEO's Telegram as
  formatted approval cards with ✅ SEND IT / ✏️ EDIT / ⏭️ SKIP buttons.

  Button presses (SEND/EDIT/SKIP) are handled by the always-on Railway bot
  (telegram_approval_bot.py) which runs the single authoritative polling loop.
  This avoids Telegram's "only one getUpdates" conflict.

Module 5 (Reply Dispatcher) is embedded in telegram_approval_bot.py.

Usage:
  python tools/telegram_approval_portal.py          # push ALL pending drafts
  python tools/telegram_approval_portal.py --test   # push 1 test card to CEO
"""

import os
import sys
import json
import base64
import logging
import asyncio
import requests
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application
from telegram.constants import ParseMode

# ── SUPPRESS NOISY LIBRARY LOGS ─────────────────────────────────────────────
logging.basicConfig(level=logging.WARNING,
                    format="[%(levelname)s] %(message)s")
logging.getLogger("httpx").setLevel(logging.WARNING)

# ── PATHS ────────────────────────────────────────────────────────────────────
ROOT  = Path(__file__).resolve().parent.parent
VAULT = ROOT / "intelligence_vault"
DRAFTS_FILE     = VAULT / "live" / "draft_queue.json"
GHOST_GUARD_FILE = VAULT / "live" / "ghost_guard.json"

# ── CREDENTIALS ──────────────────────────────────────────────────────────────
BOT_TOKEN       = os.getenv("TELEGRAM_BOT_TOKEN", "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg")
CEO_CHAT_ID     = int(os.getenv("CEO_TELEGRAM_ID", "8013249849"))

# ── LEKEELEKEE API ───────────────────────────────────────────────────────────
LEKE_BASE       = os.getenv("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
LEKE_EMAIL      = os.getenv("LEKE_LEKE_EMAIL",    "ceo@amdsolutions007.com")
LEKE_PASSWORD   = os.getenv("LEKE_LEKE_PASSWORD", "#@Amdmail@007")
GENERAL_CONV_ID = "019c12b7-0ef5-73c5-92ca-1e5609f5f5bf"
STATIC_IV       = "MDAwMDAwMDAwMDAwMDAwMA=="

# ── DM DIRECTORY ──────────────────────────────────────────────────────────────
DM_DIR_FILE     = ROOT / "intelligence_vault" / "live" / "dm_directory.json"

# ── CALLBACK PREFIXES ─────────────────────────────────────────────────────────
_CB_SEND = "SEND:"
_CB_EDIT = "EDIT:"
_CB_SKIP = "SKIP:"
_CB_DM   = "DM:"

# ── NOTE: Button press handling lives in telegram_approval_bot.py (Railway) ─
# This file only PUSHES cards. No polling loop needed here.


# ─────────────────────────────────────────────────────────────────────────────
# LEKEELEKEE DISPATCH (Module 5)
# ─────────────────────────────────────────────────────────────────────────────

_leke_token_cache: dict = {"token": None, "fetched": 0.0}

def _leke_auth() -> str:
    """Return valid LekeeLekee Bearer token (1hr TTL)."""
    import time
    cache = _leke_token_cache
    if cache["token"] and (time.time() - cache["fetched"]) < 3600:
        return cache["token"]
    resp = requests.post(
        f"{LEKE_BASE}/api/v1/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"email": LEKE_EMAIL, "password": LEKE_PASSWORD},
        timeout=20,
    )
    data = resp.json() if resp.headers.get("content-type","").startswith("application/json") else {}
    token = (data.get("data", {}).get("token")
             or data.get("token")
             or data.get("access_token"))
    if not token:
        raise RuntimeError(f"LekeeLekee auth failed — HTTP {resp.status_code}")
    cache["token"] = token
    cache["fetched"] = __import__("time").time()
    return token


def dispatch_to_leke_leke(draft_text: str, reply_to_id: str) -> dict:
    """
    POST the approved reply to the LekeeLekee #General group,
    threaded to reply_to_id.
    Returns the API response dict.
    """
    token    = _leke_auth()
    encoded  = base64.b64encode(draft_text.encode("utf-8")).decode("ascii")
    payload  = {
        "ciphertext": encoded,
        "iv":         STATIC_IV,
    }
    if reply_to_id:
        payload["reply_to"] = reply_to_id

    resp = requests.post(
        f"{LEKE_BASE}/api/v1/conversations/{GENERAL_CONV_ID}/messages",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
        },
        json=payload,
        timeout=20,
    )
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"LekeeLekee dispatch failed — HTTP {resp.status_code}: {resp.text[:200]}")
    return resp.json() if resp.headers.get("content-type","").startswith("application/json") else {}


# ─────────────────────────────────────────────────────────────────────────────
# DRAFT QUEUE HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _load_dm_directory() -> dict:
    """Load username → DM conversation ID map. Returns {} on missing file."""
    if not DM_DIR_FILE.exists():
        return {}
    with open(DM_DIR_FILE) as f:
        d = json.load(f)
    return {k: v for k, v in d.items() if not k.startswith("_")}


def _load_drafts() -> list:
    if not DRAFTS_FILE.exists():
        return []
    with open(DRAFTS_FILE) as f:
        return json.load(f)


def _save_drafts(drafts: list) -> None:
    DRAFTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DRAFTS_FILE, "w") as f:
        json.dump(drafts, f, indent=2, ensure_ascii=False)


def _update_draft_status(message_id: str, new_status: str, new_text: str = None) -> None:
    """Update a draft's status (and optionally text) in draft_queue.json."""
    drafts = _load_drafts()
    for d in drafts:
        if d.get("message_id") == message_id:
            d["status"] = new_status
            if new_text:
                d["draft_text"]  = new_text
                d["word_count"]  = len(new_text.split())
            d["actioned_at"] = datetime.now(timezone.utc).isoformat()
            break
    _save_drafts(drafts)


def _mark_ghost_guard_alerted(message_id: str) -> None:
    if not GHOST_GUARD_FILE.exists():
        return
    with open(GHOST_GUARD_FILE) as f:
        guards = json.load(f)
    if message_id in guards:
        guards[message_id]["alert_sent"] = True
        with open(GHOST_GUARD_FILE, "w") as f:
            json.dump(guards, f, indent=2, ensure_ascii=False)


# ─────────────────────────────────────────────────────────────────────────────
# FORMAT A DRAFT INTO A TELEGRAM MESSAGE CARD
# ─────────────────────────────────────────────────────────────────────────────

def _format_card(draft: dict, index: int = 1, total: int = 1) -> str:
    """
    Returns a world-class Telegram message card for a draft reply.
    Uses HTML formatting (bold, italic, code).
    """
    sender   = draft.get("sender_name", "") or draft.get("sender_handle", "")
    handle   = draft.get("sender_handle", "")
    lead_tag = draft.get("lead_tag", "📡 STANDARD")
    tone     = draft.get("tone_used", "")
    words    = draft.get("word_count", 0)
    model    = draft.get("model_used", "gemini-2.5-flash")
    text     = draft.get("draft_text", "")
    handle   = draft.get("sender_handle", "")

    # DM availability flag
    dm_dir  = _load_dm_directory()
    clean_h = handle.lstrip("@").strip()
    has_dm  = clean_h in dm_dir
    is_price_signal = "PRICE_SIGNAL" in lead_tag

    # Lead tag badge colour line
    tag_line = lead_tag
    if is_price_signal:
        tag_line = "🔥 <b>PRICE SIGNAL</b> — Commercial lead detected"
    elif "CRITICAL_ISSUE" in lead_tag:
        tag_line = "🆘 <b>CRITICAL ISSUE</b> — Member needs support"
    elif "SYNERGY_OPPORTUNITY" in lead_tag:
        tag_line = "🤝 <b>SYNERGY OPPORTUNITY</b> — Collaboration interest"
    else:
        tag_line = "📡 <b>STANDARD</b>"

    tone_badge = "⭐ Inner Circle" if tone == "INNER_CIRCLE" else ("⚙️ Peer Technical" if tone == "PEER_TECHNICAL" else "🏛️ Authoritative Architect")

    card = (
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"🛰️  <b>LEKEEBOT v2 — DRAFT #{index}/{total}</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"\n"
        f"👤 <b>Sender:</b>  {sender}  <code>{handle}</code>\n"
        f"🏷️  <b>Tag:</b>    {tag_line}\n"
        f"🎭 <b>Tone:</b>   {tone_badge}\n"
        f"📊 <b>Stats:</b>  {words} words  ·  {model}\n"
        f"📬 <b>DM:</b>     {'💬 Private channel OPEN' if has_dm else '🔇 No DM conversation yet'}\n"
    )

    # PRICE_SIGNAL: inject private DM recommendation banner
    if is_price_signal and has_dm:
        card += (
            f"\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🔐 <b>PRIVATE DM RECOMMENDED</b>\n"
            f"<i>Commercial lead — send privately to protect the deal.</i>\n"
        )
    elif is_price_signal and not has_dm:
        card += (
            f"\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"⚠️ <b>PRICE SIGNAL — DM not available yet</b>\n"
            f"<i>No private channel open with this member.</i>\n"
        )

    card += (
        f"\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"✍️  <b>DRAFT REPLY:</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"\n"
        f"{text}\n"
        f"\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━"
    )
    return card


def _build_keyboard(draft: dict) -> InlineKeyboardMarkup:
    """4-button inline keyboard for draft approval (row 1: SEND/EDIT/SKIP, row 2: DM)."""
    mid     = draft["message_id"]
    handle  = draft.get("sender_handle", "").lstrip("@").strip()
    dm_dir  = _load_dm_directory()
    has_dm  = handle in dm_dir
    is_price = "PRICE_SIGNAL" in draft.get("lead_tag", "")

    row1 = [
        InlineKeyboardButton("✅  SEND IT",  callback_data=f"SEND:{mid}"),
        InlineKeyboardButton("✏️  EDIT",    callback_data=f"EDIT:{mid}"),
        InlineKeyboardButton("⏭️  SKIP",    callback_data=f"SKIP:{mid}"),
    ]

    # DM row — always shown; greyed label if no conv
    if has_dm:
        dm_label = "💬  SEND AS DM" if not is_price else "🔐  SEND AS DM ⭐"
        row2 = [InlineKeyboardButton(dm_label, callback_data=f"DM:{mid}")]
    else:
        # No DM conv yet — show informational button (tapping it gives a helpful notice)
        row2 = [InlineKeyboardButton("🔇  NO DM — group only", callback_data=f"DM:{mid}")]

    if is_price and has_dm:
        # PRICE_SIGNAL: DM row goes FIRST as primary recommended action
        return InlineKeyboardMarkup([row2, row1])
    else:
        return InlineKeyboardMarkup([row1, row2])


# Callback handlers removed — they live in telegram_approval_bot.py (Railway bot)
# which runs the single authoritative polling loop for this bot token.


# ─────────────────────────────────────────────────────────────────────────────
# PUSH DRAFTS TO TELEGRAM
# ─────────────────────────────────────────────────────────────────────────────

async def _push_drafts_to_telegram(app, drafts: list) -> int:
    """Send all pending drafts as Telegram cards. Returns count sent."""
    pending = [d for d in drafts if d.get("status") == "pending_approval"
               and "[AI DRAFT FAILED" not in d.get("draft_text", "")]
    total = len(pending)

    if not pending:
        await app.bot.send_message(
            chat_id=CEO_CHAT_ID,
            text=(
                "🛰️ <b>LekeeBot v2 — Draft Queue</b>\n\n"
                "✅ No pending drafts in queue.\n"
                "<i>Run with --draft flag to generate new replies.</i>"
            ),
            parse_mode=ParseMode.HTML,
        )
        return 0

    # Header blast
    await app.bot.send_message(
        chat_id=CEO_CHAT_ID,
        text=(
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🛰️  <b>LEKEEBOT v2 — APPROVAL QUEUE</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"<b>{total} draft{'s' if total>1 else ''} awaiting your approval.</b>\n\n"
            f"Tap <b>✅ SEND IT</b> → group reply\n"
            f"Tap <b>💬 SEND AS DM</b> → private 1-on-1 message\n"
            f"Tap <b>✏️ EDIT</b> → revise before sending\n"
            f"Tap <b>⏭️ SKIP</b> → archive draft"
        ),
        parse_mode=ParseMode.HTML,
    )

    for i, draft in enumerate(pending, 1):
        card    = _format_card(draft, i, total)
        keyboard = _build_keyboard(draft)
        msg = await app.bot.send_message(
            chat_id=CEO_CHAT_ID,
            text=card,
            parse_mode=ParseMode.HTML,
            reply_markup=keyboard,
        )
        _ = msg  # send-only — no tracking needed
        print(f"[PORTAL] 📤 Sent card #{i}/{total} — {draft.get('sender_handle')} | {draft.get('lead_tag')}")

    return total


# ─────────────────────────────────────────────────────────────────────────────
# APPLICATION BUILDER (send-only — no handlers needed)
# ─────────────────────────────────────────────────────────────────────────────

def _build_app() -> Application:
    return Application.builder().token(BOT_TOKEN).build()


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

async def _run(test_mode: bool = False):
    """
    PUSH-ONLY runner.
    Sends approval cards to CEO Telegram, then exits cleanly.
    Button presses (SEND/EDIT/SKIP) are handled by the Railway bot.
    """
    app = _build_app()
    await app.initialize()
    await app.start()

    if test_mode:
        test_draft = {
            "draft_text": (
                "Augustus! Your arrival in the African Tech Ecosystem is noted — and respected. "
                "The community you've joined is moving fast, and the right 1-on-1 conversations "
                "here change trajectories. I'd like to connect with you directly. "
                "What's your biggest commercial challenge right now? Let's talk privately. 🔐 #AfricanTech"
            ),
            "lead_tag":      "🔥 PRICE_SIGNAL",
            "tone_used":     "INNER_CIRCLE",
            "word_count":    57,
            "model_used":    "gemini-2.5-flash",
            "packet_id":     "CTX_DM_TEST_001",
            "message_id":    "TEST_DM_001",
            "reply_to_id":   None,
            "sender_handle": "@emperoraustus",
            "sender_name":   "Augustus CJ",
            "dm_conv_id":    "019ca622-8a00-7014-a47b-876660178d73",
            "generated_at":  datetime.now(timezone.utc).isoformat(),
            "status":        "pending_approval",
        }
        drafts = [test_draft]
        print(f"\n[PORTAL] 🧪 TEST MODE — pushing @emperoraustus DM card to CEO (ID {CEO_CHAT_ID})")
    else:
        drafts = _load_drafts()
        print(f"\n[PORTAL] 📋 Loaded {len(drafts)} drafts from queue")

    sent = await _push_drafts_to_telegram(app, drafts)

    print(f"[PORTAL] ✅ {sent} card(s) pushed to CEO Telegram.")
    print(f"[PORTAL] Button presses handled by Railway bot (telegram_approval_bot.py).")

    await app.stop()
    await app.shutdown()


if __name__ == "__main__":
    args = sys.argv[1:]
    test_mode = "--test" in args

    print(f"\n{'=' * 64}")
    print(f"  🛰️  LEKEEBOT v2 — TELEGRAM APPROVAL PORTAL")
    print(f"  Module 4 (Approval Gate) + Module 5 (Reply Dispatcher)")
    print(f"  CEO Chat ID: {CEO_CHAT_ID}")
    if test_mode:
        print(f"  MODE: 🧪 TEST — sending 1 sample card")
    else:
        print(f"  MODE: 🔄 LIVE — pushing all pending drafts")
    print(f"{'=' * 64}\n")

    asyncio.run(_run(test_mode=test_mode))
