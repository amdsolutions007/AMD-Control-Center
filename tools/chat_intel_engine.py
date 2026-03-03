#!/usr/bin/env python3
"""
tools/chat_intel_engine.py
==========================
LekeeBot v2 — Module 1 & 2: Context-Aware Poller
AMD Control Center | 2026-03-03

MODULE 1 — THE POLLER:
  - Polls GET /api/v1/conversations/{CONV_ID}/messages every 60 seconds
  - Maintains intelligence_vault/live/replied_messages.json ledger
  - Zero double-replies guaranteed by message ID tracking

MODULE 2 — THE CONTEXT BUILDER:
  - Vault Lookup: bio, sector, engagement_score for every sender
  - Bio-Probe: live API fetch for senders not yet in vault
  - URGENT_PRIORITY flag: @charlie_pyper + 6 super-fans
  - Enriched Context Packet output for every new message

Usage:
  python tools/chat_intel_engine.py           # full live polling loop
  python tools/chat_intel_engine.py --once    # single poll, show 3 packets, exit
  python tools/chat_intel_engine.py --packets N  # show N context packets from last N msgs
"""

import os
import sys
import json
import base64
import time
import re
import requests
from datetime import datetime, timezone
from pathlib import Path

# ── PATHS ────────────────────────────────────────────────────────────────────
ROOT  = Path(__file__).resolve().parent.parent
VAULT = ROOT / "intelligence_vault"

GROUP_MEMBERS_FILE = VAULT / "members" / "group"   / "members.json"
FOLLOWERS_FILE     = VAULT / "members" / "profile" / "followers.json"
XREF_FILE          = VAULT / "engagement" / "cross_reference.json"
LEDGER_FILE        = VAULT / "live" / "replied_messages.json"
CONTEXT_LOG_FILE   = VAULT / "live" / "context_packets.json"

# ── CREDENTIALS & CONSTANTS ──────────────────────────────────────────────────
BASE_URL = os.getenv("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
EMAIL    = os.getenv("LEKE_LEKE_EMAIL",    "ceo@amdsolutions007.com")
PASSWORD = os.getenv("LEKE_LEKE_PASSWORD", "#@Amdmail@007")

# #General group channel — confirmed via probe
GENERAL_CONV_ID = "019c12b7-0ef5-73c5-92ca-1e5609f5f5bf"
CEO_PUBLIC_ID   = "019c10aa-3092-71c5-ae96-17eeef00fb30"
CEO_USERNAME    = "amd"

# Founding Member alert triggers
CHARLIE_PYPER     = "charlie_pyper"
SUPER_FAN_HANDLES = {"abu4639", "chigofficial", "derhbee", "rajiidris", "salaryalert", "skycruz"}
FOUNDING_HANDLES  = SUPER_FAN_HANDLES | {CHARLIE_PYPER}

POLL_INTERVAL_SEC = 60   # seconds between polls in live mode
MSG_FETCH_LIMIT   = 50   # messages per API call

# ─────────────────────────────────────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────────────────────────────────────

_cached_token: str | None = None
_token_fetched_at: float  = 0.0
TOKEN_TTL_SEC = 3600  # re-auth every hour


def _auth() -> str:
    """Return a valid Bearer token, re-authenticating if stale."""
    global _cached_token, _token_fetched_at
    if _cached_token and (time.time() - _token_fetched_at) < TOKEN_TTL_SEC:
        return _cached_token
    resp = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"email": EMAIL, "password": PASSWORD},
        timeout=20,
    )
    data = _safe_json(resp)
    if not data:
        raise RuntimeError(f"Auth failed — HTTP {resp.status_code}")
    tok = (data.get("data", {}).get("token")
           or data.get("token")
           or data.get("access_token"))
    if not tok:
        raise RuntimeError(f"No token in auth response: {json.dumps(data)[:200]}")
    _cached_token = tok
    _token_fetched_at = time.time()
    return tok


def _headers() -> dict:
    return {"Authorization": f"Bearer {_auth()}"}


def _safe_json(resp: requests.Response) -> dict | None:
    if resp.status_code not in (200, 201, 422):
        return None
    text = resp.text.strip()
    if not text or text.startswith("<"):
        return None
    try:
        return resp.json()
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# MODULE 1 — LEDGER (replied_messages.json)
# ─────────────────────────────────────────────────────────────────────────────

def _load_ledger() -> dict:
    """Load the replied-message ledger. Returns {message_id: {ts, handle, status}}."""
    LEDGER_FILE.parent.mkdir(parents=True, exist_ok=True)
    if LEDGER_FILE.exists():
        with open(LEDGER_FILE) as f:
            return json.load(f)
    return {"replied": {}, "skipped": {}, "pending": {}, "total_seen": 0}


def _save_ledger(ledger: dict) -> None:
    with open(LEDGER_FILE, "w") as f:
        json.dump(ledger, f, indent=2, ensure_ascii=False)


def _is_seen(ledger: dict, msg_id: str) -> bool:
    return (msg_id in ledger.get("replied", {})
            or msg_id in ledger.get("skipped", {})
            or msg_id in ledger.get("pending", {}))


def _mark_pending(ledger: dict, msg_id: str, handle: str) -> None:
    ledger.setdefault("pending", {})[msg_id] = {
        "handle": handle,
        "seen_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending_approval",
    }
    ledger["total_seen"] = ledger.get("total_seen", 0) + 1
    _save_ledger(ledger)


# ─────────────────────────────────────────────────────────────────────────────
# MODULE 1 — MESSAGE FETCHER
# ─────────────────────────────────────────────────────────────────────────────

def _decode_body(ciphertext: str) -> str:
    """Decode base64-encoded message body (the API's 'encryption' is plain base64)."""
    try:
        padded = ciphertext + "=" * (-len(ciphertext) % 4)
        return base64.b64decode(padded).decode("utf-8", errors="replace").strip()
    except Exception:
        return ciphertext  # fallback: return raw if decode fails


def fetch_new_messages(ledger: dict, limit: int = MSG_FETCH_LIMIT) -> list[dict]:
    """
    Fetch recent messages from #General and return only UNSEEN ones,
    excluding any from the CEO itself.
    Returns list of dicts with decoded body and sender info attached.
    """
    resp = requests.get(
        f"{BASE_URL}/api/v1/conversations/{GENERAL_CONV_ID}/messages",
        headers=_headers(),
        params={"page": 1, "per_page": limit},
        timeout=25,
    )
    data = _safe_json(resp)
    if not data:
        raise RuntimeError(f"Message fetch failed — HTTP {resp.status_code}")

    raw_messages = data.get("messages", [])
    new_msgs = []

    for m in raw_messages:
        msg_id     = m.get("id", "")
        sender_pid = m.get("sender_public_id", "")

        # Skip CEO's own messages
        if sender_pid == CEO_PUBLIC_ID:
            _mark_pending(ledger, msg_id, CEO_USERNAME)  # mark seen, not pending
            continue

        # Skip already-seen messages
        if _is_seen(ledger, msg_id):
            continue

        # Decode the body
        body = _decode_body(m.get("ciphertext", ""))
        if not body:
            continue

        # Hydrate the message with decoded fields
        m["_body"]      = body
        m["_sender_obj"] = m.get("sender") or {}
        m["_reply_ctx"] = m.get("reply_to")  # {id, text, sender_public_id} or None
        new_msgs.append(m)

    return new_msgs


# ─────────────────────────────────────────────────────────────────────────────
# MODULE 2 — VAULT LOOKUP
# ─────────────────────────────────────────────────────────────────────────────

def _load_vault_index() -> tuple[dict, dict, dict]:
    """
    Load all vault data into fast-lookup dicts keyed by lowercase handle (no @).
    Returns (group_index, follower_index, xref)
    """
    with open(GROUP_MEMBERS_FILE) as f:
        grp = json.load(f)
    with open(FOLLOWERS_FILE) as f:
        fol = json.load(f)
    with open(XREF_FILE) as f:
        xref = json.load(f)

    group_idx    = {m["handle"].lstrip("@").lower(): m for m in grp.get("members", [])}
    follower_idx = {m["handle"].lstrip("@").lower(): m for m in fol.get("members", [])}
    return group_idx, follower_idx, xref


def vault_lookup(username: str, group_idx: dict, follower_idx: dict) -> dict:
    """
    Look up a sender in the vault by username.
    Returns a vault record dict (may be partial if not found).
    """
    key = username.lstrip("@").lower()

    if key in group_idx:
        rec = dict(group_idx[key])
        # Enrich with follower bio if available
        if key in follower_idx:
            rec["bio"]           = follower_idx[key].get("bio", "")
            rec["vault_sources"] = ["group_member", "profile_follower"]
        else:
            rec["vault_sources"] = ["group_member"]
        return rec

    if key in follower_idx:
        rec = dict(follower_idx[key])
        rec["vault_sources"] = ["profile_follower"]
        rec["sector"]        = rec.get("sector", "Profile Follower (not in group)")
        rec["engagement_score"] = rec.get("engagement_score", 1)
        return rec

    # Not in vault
    return {
        "name":             username,
        "handle":           f"@{username}",
        "bio":              "",
        "sector":           "Unknown — Bio-Probe Required",
        "engagement_score": 0,
        "vault_sources":    [],
        "vault_status":     "NOT_IN_VAULT",
    }


# ─────────────────────────────────────────────────────────────────────────────
# MODULE 2 — BIO PROBE (live API fetch for unknown senders)
# ─────────────────────────────────────────────────────────────────────────────

def bio_probe(sender_public_id: str, username: str) -> dict:
    """
    Fetch live profile for a sender not in the vault.
    Returns dict with name, bio, is_verified, followers_count, etc.
    """
    result = {"bio": "", "name": username, "is_verified": False, "live_probed": True}

    # Try by public_id first (most reliable)
    if sender_public_id:
        resp = requests.get(
            f"{BASE_URL}/api/v1/users/{sender_public_id}/followers",
            headers=_headers(), params={"page": 1}, timeout=15,
        )
        # We actually want the profile, not followers — try profile endpoint
    resp = requests.get(
        f"{BASE_URL}/api/v1/users/{sender_public_id}",
        headers=_headers(), timeout=15,
    )
    data = _safe_json(resp)
    if data and not resp.text.strip().startswith("<"):
        user = data.get("data") or data.get("user") or {}
        if isinstance(user, dict) and user:
            result.update({
                "name":       user.get("name") or user.get("display_name") or username,
                "bio":        user.get("bio") or "",
                "is_verified": bool(user.get("is_verified")),
                "location":   user.get("location") or "",
                "website":    user.get("website") or "",
                "avatar_url": user.get("avatar_url") or user.get("avatar") or "",
            })
            return result

    # Fallback: use sender object data from the message itself
    return result


def _infer_sector_from_bio(bio: str) -> str:
    """Quick keyword infer from bio text."""
    if not bio:
        return "General"
    bio_lower = bio.lower()
    if any(k in bio_lower for k in ["doctor", "clinical", "health", "nurse", "medical", "physician"]):
        return "Healthcare"
    if any(k in bio_lower for k in ["real estate", "property", "land", "housing"]):
        return "Real Estate"
    if any(k in bio_lower for k in ["engineer", "developer", "code", "software", "tech", "python", "ai", "ml"]):
        return "Technology"
    if any(k in bio_lower for k in ["finance", "fintech", "bank", "investment", "capital", "fund"]):
        return "Finance"
    if any(k in bio_lower for k in ["writer", "author", "content", "journalist", "blogger", "poet"]):
        return "Media & Content"
    if any(k in bio_lower for k in ["law", "legal", "attorney", "barrister", "advocate"]):
        return "Legal"
    if any(k in bio_lower for k in ["pastor", "minister", "church", "faith"]):
        return "Faith & Community"
    if any(k in bio_lower for k in ["water", "sustainability", "environment", "clean", "energy"]):
        return "CleanTech / Sustainability"
    return "Ecosystem Citizen"


# ─────────────────────────────────────────────────────────────────────────────
# MODULE 2 — SENTIMENT ANALYSER
# ─────────────────────────────────────────────────────────────────────────────

def analyse_sentiment(body: str) -> dict:
    """
    Rule-based sentiment + intent classification — zero API cost.
    Returns {label, intent, tone, urgency_signals}
    """
    b = body.lower()

    # Intent detection
    is_question     = "?" in body
    is_introduction = any(k in b for k in ["just joined", "glad to be", "happy to be",
                                            "new here", "i am", "my name", "hello everyone",
                                            "good morning", "good evening", "hi everyone",
                                            "goodmorning", "goodnight"])
    is_technical    = any(k in b for k in ["code", "redis", "api", "server", "bug",
                                            "error", "deploy", "build", "optimize",
                                            "performance", "infrastructure", "token",
                                            "database", "cache", "latency"])
    is_business     = any(k in b for k in ["startup", "founder", "launch", "revenue",
                                            "market", "invest", "funding", "product",
                                            "customer", "client", "sales", "company"])
    is_praise       = any(k in b for k in ["thank", "appreciate", "great", "amazing",
                                            "awesome", "kudos", "excellent", "impressive",
                                            "well done", "love it", "respect"])
    is_challenge    = any(k in b for k in ["problem", "issue", "challenge", "struggle",
                                            "hard", "difficult", "fail", "lack", "need",
                                            "why", "what if", "how"])
    is_knowledge    = any(k in b for k in ["learn", "teach", "course", "resource",
                                            "book", "read", "study", "share", "tip",
                                            "advice", "recommend"])

    # Sentiment label
    positive_words  = ["great", "amazing", "love", "excellent", "thank", "kudos",
                       "proud", "respect", "impressive", "awesome", "beautiful",
                       "fantastic", "happy", "glad", "appreciate"]
    negative_words  = ["problem", "bug", "error", "fail", "broken", "issue",
                       "complaint", "slow", "bad", "worst", "terrible"]

    pos_score = sum(1 for w in positive_words if w in b)
    neg_score = sum(1 for w in negative_words if w in b)

    if pos_score > neg_score:
        sentiment = "POSITIVE"
    elif neg_score > pos_score:
        sentiment = "NEGATIVE"
    elif is_question:
        sentiment = "INQUIRY"
    else:
        sentiment = "NEUTRAL"

    # Intent stack (ordered by detection priority)
    intent = []
    if is_introduction:   intent.append("INTRODUCTION")
    if is_technical:      intent.append("TECHNICAL_DISCUSSION")
    if is_business:       intent.append("BUSINESS_DISCUSSION")
    if is_question:       intent.append("QUESTION")
    if is_praise:         intent.append("PRAISE")
    if is_challenge:      intent.append("CHALLENGE_RAISED")
    if is_knowledge:      intent.append("KNOWLEDGE_SHARING")
    if not intent:        intent.append("GENERAL_STATEMENT")

    # Urgency signals
    urgency_signals = []
    if any(k in b for k in ["urgent", "asap", "immediately", "help", "sos"]):
        urgency_signals.append("HELP_REQUESTED")
    if any(k in b for k in ["spam", "scam", "inappropriate", "ban", "report"]):
        urgency_signals.append("MODERATION_NEEDED")
    if len(body) > 300:
        urgency_signals.append("LONG_FORM_CONTENT")
    if body.count("@") > 0:
        urgency_signals.append("MENTION_DETECTED")

    # Tone
    if any(k in b for k in ["🚀", "🌍", "⚡", "🔥", "💡", "🎯"]):
        tone = "ENERGETIC"
    elif any(k in b for k in ["😅", "😂", "🤣", "lol", "haha"]):
        tone = "HUMOROUS"
    elif is_technical:
        tone = "ANALYTICAL"
    elif is_introduction:
        tone = "WARM"
    else:
        tone = "CONVERSATIONAL"

    return {
        "sentiment":       sentiment,
        "intent":          intent,
        "tone":            tone,
        "urgency_signals": urgency_signals,
        "is_question":     is_question,
        "is_introduction": is_introduction,
        "is_technical":    is_technical,
        "word_count":      len(body.split()),
    }


# ─────────────────────────────────────────────────────────────────────────────
# MODULE 2 — CONTEXT PACKET BUILDER
# ─────────────────────────────────────────────────────────────────────────────

def build_context_packet(
    msg: dict,
    group_idx: dict,
    follower_idx: dict,
) -> dict:
    """
    The centrepiece of Module 2. Assembles a full Enriched Context Packet
    for a single message — everything the AI brain needs to reply perfectly.
    """
    sender_obj   = msg.get("_sender_obj") or {}
    sender_pid   = msg.get("sender_public_id", "")
    username     = (sender_obj.get("username") or "").strip()
    sender_name  = (sender_obj.get("name") or sender_obj.get("display_name") or username).strip()
    body         = msg.get("_body", "")
    reply_ctx    = msg.get("_reply_ctx")  # {id, text, sender_public_id} or None
    created_at   = msg.get("created_at", "")
    msg_id       = msg.get("id", "")

    # ── PRIORITY CLASSIFICATION ──────────────────────────
    uname_lower = username.lower()
    is_founding = uname_lower in FOUNDING_HANDLES
    is_charlie  = uname_lower == CHARLIE_PYPER
    is_superfan = uname_lower in SUPER_FAN_HANDLES

    if is_charlie:
        priority = "🚨 URGENT — FOUNDING MEMBER (Platform Builder @charlie_pyper)"
        priority_code = "URGENT_CHARLIE"
    elif is_superfan:
        priority = f"🚨 URGENT — SUPER-FAN @{username} (inner circle, max loyalty)"
        priority_code = "URGENT_SUPERFAN"
    else:
        priority = "STANDARD"
        priority_code = "STANDARD"

    # ── VAULT LOOKUP ─────────────────────────────────────
    vault_rec = vault_lookup(username, group_idx, follower_idx)
    in_vault  = bool(vault_rec.get("vault_sources"))

    # ── BIO-PROBE (if bio is missing — from vault or API sender object) ──────
    live_probe_triggered = False
    if not vault_rec.get("bio"):
        # Step 1: Try bio from the sender object embedded in the message (free)
        bio_from_api = (
            sender_obj.get("bio")
            or sender_obj.get("about")
            or ""
        )
        if bio_from_api:
            vault_rec["bio"] = bio_from_api
        elif sender_pid:
            # Step 2: Live API profile probe (costs 1 HTTP call)
            live_probe_triggered = True
            probe_result = bio_probe(sender_pid, username)
            vault_rec.update({
                "name":        probe_result.get("name", sender_name) or sender_name,
                "bio":         probe_result.get("bio", ""),
                "is_verified": probe_result.get("is_verified", False),
                "sector":      _infer_sector_from_bio(probe_result.get("bio", "")),
            })

    # Infer sector from bio if sector missing
    if not vault_rec.get("sector") or vault_rec["sector"] in ("", "Unknown — Bio-Probe Required"):
        vault_rec["sector"] = _infer_sector_from_bio(vault_rec.get("bio", ""))

    # ── SENTIMENT ANALYSIS ────────────────────────────────
    sentiment = analyse_sentiment(body)

    # ── THREAD CONTEXT ────────────────────────────────────
    thread_ctx = None
    if reply_ctx and isinstance(reply_ctx, dict):
        parent_body = reply_ctx.get("text", "")
        parent_pid  = reply_ctx.get("sender_public_id", "")
        parent_id   = reply_ctx.get("id", "")
        # Is the sender replying to CEO?
        replying_to_ceo = parent_pid == CEO_PUBLIC_ID
        thread_ctx = {
            "parent_message_id":   parent_id,
            "parent_body_snippet": parent_body[:120],
            "replying_to_ceo":     replying_to_ceo,
            "thread_depth":        "REPLY",
        }

    # ── REPLY GUIDANCE (for the AI brain, Module 3) ───────
    reply_guidance = _derive_reply_guidance(
        sentiment, vault_rec, is_charlie, is_superfan, thread_ctx
    )

    # ── ASSEMBLE PACKET ───────────────────────────────────
    packet = {
        "packet_id":      f"CTX_{msg_id[:16]}",
        "generated_at":   datetime.now(timezone.utc).isoformat(),
        "priority":       priority,
        "priority_code":  priority_code,

        "message": {
            "id":         msg_id,
            "created_at": created_at,
            "body":       body,
            "word_count": sentiment["word_count"],
        },

        "sender": {
            "name":             vault_rec.get("name") or sender_name,
            "username":         username,
            "handle":           f"@{username}",
            "sender_public_id": sender_pid,
            "bio":              vault_rec.get("bio") or "(no bio available)",
            "sector":           vault_rec.get("sector", "Ecosystem Citizen"),
            "engagement_score": vault_rec.get("engagement_score", 0),
            "role":             vault_rec.get("role", "member"),
            "vault_sources":    vault_rec.get("vault_sources", []),
            "in_vault":         in_vault,
            "live_probe_triggered": live_probe_triggered,
            "is_super_fan":     is_superfan,
            "is_charlie":       is_charlie,
            "is_founding_member": is_founding,
        },

        "sentiment_analysis": sentiment,

        "thread_context": thread_ctx,

        "reply_guidance": reply_guidance,
    }

    return packet


def _derive_reply_guidance(
    sentiment: dict, vault_rec: dict, is_charlie: bool, is_superfan: bool, thread_ctx
) -> dict:
    """Derive structured guidance for the AI brain based on context."""
    guidance = {
        "address_by_first_name": True,
        "reference_their_bio":   bool(vault_rec.get("bio")),
        "reference_their_sector": vault_rec.get("sector", "General") not in ("General", "Ecosystem Citizen", ""),
        "max_words":             120,
        "tone_instruction":      "CEO executive authority. Thought leadership. Never casual.",
        "should_ask_followup":   False,
        "engagement_hook":       "",
        "ceo_voice_cues":        ["Let's build 🌍", "#007Systems", "The floor is yours", "Solutions 007"],
    }

    intents = sentiment.get("intent", [])

    if is_charlie:
        guidance["tone_instruction"] = "Peer-to-peer technical respect. Acknowledge expertise. Build rapport."
        guidance["max_words"] = 80
        guidance["engagement_hook"] = "Respond to his specific technical point, add CEO's own architecture insight"
    elif is_superfan:
        guidance["tone_instruction"] = "Warm recognition. Inner-circle energy. Feel the loyalty."
        guidance["engagement_hook"] = "Acknowledge their continued presence and value to the ecosystem"

    if "INTRODUCTION" in intents:
        guidance["engagement_hook"] = "Welcome them by name, reference their bio/sector, issue the 007 Challenge (what are you building?)"
        guidance["should_ask_followup"] = True

    if "TECHNICAL_DISCUSSION" in intents:
        guidance["should_ask_followup"] = True
        guidance["engagement_hook"] = "Add a CEO-level technical insight, ask a probing technical question"
        guidance["reference_their_sector"] = True

    if "QUESTION" in intents:
        guidance["engagement_hook"] = "Answer the question directly with a CEO insight, then pivot to a broader ecosystem lesson"

    if "PRAISE" in intents:
        guidance["max_words"] = 60
        guidance["engagement_hook"] = "Brief thank you, redirect to execution — speeches are easy, execution is hard"

    if "CHALLENGE_RAISED" in intents:
        guidance["should_ask_followup"] = True
        guidance["engagement_hook"] = "Validate the challenge, give the 007 perspective on solving it at ecosystem scale"

    if sentiment["sentiment"] == "NEGATIVE":
        guidance["tone_instruction"] += " Address concern directly. Do not dismiss. Position as growth."

    return guidance


# ─────────────────────────────────────────────────────────────────────────────
# PRETTY PRINTER — enriched context packet display
# ─────────────────────────────────────────────────────────────────────────────

DIVIDER = "=" * 72

def print_packet(packet: dict, index: int) -> None:
    """Print a human-readable enriched context packet to stdout."""
    p   = packet
    msg = p["message"]
    sndr = p["sender"]
    sent = p["sentiment_analysis"]
    thrd = p["thread_context"]
    guid = p["reply_guidance"]

    pcode = p["priority_code"]
    if "URGENT" in pcode:
        pcolor = "🚨"
    else:
        pcolor = "📡"

    print(f"\n{DIVIDER}")
    print(f"  {pcolor}  ENRICHED CONTEXT PACKET #{index}  |  {p['packet_id']}")
    print(DIVIDER)

    # PRIORITY BANNER
    if "URGENT" in pcode:
        print(f"  ⚠️  PRIORITY: {p['priority']}")
    # Format timestamp: API returns epoch int or ISO string
    raw_ts = msg['created_at']
    try:
        ts_display = datetime.fromtimestamp(int(raw_ts), tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    except (ValueError, TypeError):
        ts_display = str(raw_ts)
    print(f"  ⏱️  Message Time: {ts_display}")

    # MESSAGE
    print(f"\n  📨 MESSAGE ({msg['word_count']} words):")
    body_lines = msg["body"].replace("\r", "").split("\n")
    for line in body_lines:
        print(f"     {line}")

    # THREAD CONTEXT
    if thrd:
        reply_label = "↩️  CEO'S OWN POST" if thrd.get("replying_to_ceo") else "↩️  REPLY TO"
        print(f"\n  {reply_label}: \"{thrd['parent_body_snippet']}\"")

    # SENDER INTELLIGENCE
    print(f"\n  👤 SENDER INTELLIGENCE:")
    print(f"     Name:             {sndr['name']}")
    print(f"     Handle:           {sndr['handle']}")
    print(f"     Sector:           {sndr['sector']}")
    print(f"     Engagement Score: {sndr['engagement_score']}/10")
    print(f"     Role:             {sndr['role']}")
    print(f"     Vault Sources:    {', '.join(sndr['vault_sources']) or 'NOT IN VAULT'}")
    if sndr["live_probe_triggered"]:
        print(f"     🔍 Bio-Probe:     TRIGGERED (live API fetch)")
    if sndr["is_founding_member"]:
        stars = "⭐ SUPER-FAN" if sndr["is_super_fan"] else "⭐ PLATFORM BUILDER"
        print(f"     {stars}")
    bio = sndr["bio"]
    if bio and bio != "(no bio available)":
        # Wrap bio at 65 chars
        bio_wrapped = "\n               ".join(
            bio[i:i+65] for i in range(0, min(len(bio), 200), 65)
        )
        print(f"     Bio:              {bio_wrapped}{'...' if len(bio) > 200 else ''}")
    else:
        print(f"     Bio:              (no bio available)")

    # SENTIMENT
    print(f"\n  🧠 SENTIMENT ANALYSIS:")
    print(f"     Sentiment:        {sent['sentiment']}")
    print(f"     Intent Stack:     {' → '.join(sent['intent'])}")
    print(f"     Tone:             {sent['tone']}")
    if sent["urgency_signals"]:
        print(f"     Urgency Signals:  {', '.join(sent['urgency_signals'])}")

    # AI REPLY GUIDANCE
    print(f"\n  🤖 AI REPLY GUIDANCE:")
    print(f"     Tone Instruction: {guid['tone_instruction']}")
    print(f"     Max Words:        {guid['max_words']}")
    print(f"     Ask Follow-up:    {'YES' if guid['should_ask_followup'] else 'no'}")
    print(f"     Ref. Bio/Sector:  {'YES' if guid['reference_their_bio'] else 'no'} / {'YES' if guid['reference_their_sector'] else 'no'}")
    if guid["engagement_hook"]:
        hook = guid["engagement_hook"]
        hook_wrapped = "\n                      ".join(
            hook[i:i+60] for i in range(0, len(hook), 60)
        )
        print(f"     Engagement Hook:  {hook_wrapped}")

    print(DIVIDER)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN POLLING LOOP
# ─────────────────────────────────────────────────────────────────────────────

def run_once(show_packets: int = 3, force_all: bool = False) -> list[dict]:
    """
    Single poll: fetch messages, build context packets for new ones.
    Returns list of context packets.
    Returns up to `show_packets` most recent packets.
    """
    print(f"\n[POLLER] Authenticating...")
    _auth()
    print(f"[POLLER] ✅ Auth OK")

    ledger = _load_ledger()
    print(f"[POLLER] Ledger loaded — {ledger.get('total_seen', 0)} messages seen so far")

    print(f"[POLLER] Fetching latest {MSG_FETCH_LIMIT} messages from #General...")
    if force_all:
        # For demo: treat all messages as "new" (ignore ledger)
        resp = requests.get(
            f"{BASE_URL}/api/v1/conversations/{GENERAL_CONV_ID}/messages",
            headers=_headers(),
            params={"page": 1, "per_page": MSG_FETCH_LIMIT},
            timeout=25,
        )
        data = _safe_json(resp)
        raw_messages = data.get("messages", []) if data else []
        # Exclude CEO's own messages and decode
        new_msgs = []
        for m in raw_messages:
            if m.get("sender_public_id") == CEO_PUBLIC_ID:
                continue
            body = _decode_body(m.get("ciphertext", ""))
            if not body:
                continue
            m["_body"]       = body
            m["_sender_obj"] = m.get("sender") or {}
            m["_reply_ctx"]  = m.get("reply_to")
            new_msgs.append(m)
    else:
        new_msgs = fetch_new_messages(ledger)

    print(f"[POLLER] New messages found: {len(new_msgs)}")

    if not new_msgs:
        print("[POLLER] No new messages. Vault is current.")
        return []

    # Load vault indices
    print(f"[CONTEXT] Loading Intelligence Vault...")
    group_idx, follower_idx, _ = _load_vault_index()
    print(f"[CONTEXT] Vault loaded — {len(group_idx)} group members, {len(follower_idx)} followers")

    # Build context packets for all new messages
    packets = []
    probe_count = 0
    urgent_count = 0

    for m in new_msgs:
        try:
            pkt = build_context_packet(m, group_idx, follower_idx)
            packets.append(pkt)
            if pkt["sender"]["live_probe_triggered"]:
                probe_count += 1
            if "URGENT" in pkt["priority_code"]:
                urgent_count += 1
            if not force_all:
                _mark_pending(ledger, m["id"], m.get("_sender_obj", {}).get("username", "?"))
        except Exception as exc:
            print(f"[CONTEXT] ⚠️  Packet build failed for msg {m.get('id','?')}: {exc}")

    print(f"\n[CONTEXT] Packets built: {len(packets)} total | {urgent_count} URGENT | {probe_count} bio-probes fired")

    # Save all packets to the live log
    CONTEXT_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    existing = []
    if CONTEXT_LOG_FILE.exists():
        with open(CONTEXT_LOG_FILE) as f:
            existing = json.load(f)
    if not force_all:
        combined = existing + packets
    else:
        combined = packets  # fresh for demo
    with open(CONTEXT_LOG_FILE, "w") as f:
        json.dump(combined[-200:], f, indent=2, ensure_ascii=False)  # cap at 200

    # Print the N most recent
    display = packets[-show_packets:] if len(packets) >= show_packets else packets
    print(f"\n{'=' * 72}")
    print(f"  🛰️  CONTEXT PACKET REPORT — showing last {len(display)} packets")
    print(f"{'=' * 72}")
    for i, pkt in enumerate(display, 1):
        print_packet(pkt, i)

    # Summary footer
    print(f"\n{'=' * 72}")
    print(f"  POLLER SUMMARY")
    print(f"{'=' * 72}")
    print(f"  Total new messages processed:  {len(packets)}")
    print(f"  URGENT (Founding Members):     {urgent_count}")
    print(f"  Bio-Probes fired (live API):   {probe_count}")
    print(f"  Ledger file:                   {LEDGER_FILE}")
    print(f"  Context log file:              {CONTEXT_LOG_FILE}")
    print(f"  Module 3 (AI Brain) status:    PENDING — Approval gate not yet built")
    print(f"  Module 4 (Telegram Gate) status: PENDING — Next build phase")
    print(f"{'=' * 72}\n")

    return packets


def run_polling_loop():
    """Full live polling loop — runs indefinitely on Railway."""
    print(f"\n{'=' * 72}")
    print(f"  🛰️  LEKEEBOT v2 — CHAT INTEL ENGINE — LIVE MODE")
    print(f"  Poll interval: {POLL_INTERVAL_SEC}s | Group: #General")
    print(f"{'=' * 72}")

    cycle = 0
    while True:
        cycle += 1
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        print(f"\n[CYCLE {cycle}] {now}")
        try:
            packets = run_once(show_packets=5)
            if not packets:
                print(f"[CYCLE {cycle}] Nothing new. Next poll in {POLL_INTERVAL_SEC}s.")
        except Exception as exc:
            print(f"[CYCLE {cycle}] ❌ Error: {exc}")
        time.sleep(POLL_INTERVAL_SEC)


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    args = sys.argv[1:]

    if "--once" in args or "--demo" in args:
        # Single poll — show 3 enriched packets from LAST 3 non-CEO messages
        n = 3
        for a in args:
            if a.startswith("--packets="):
                n = int(a.split("=")[1])
            elif a.startswith("--packets"):
                idx = args.index(a)
                if idx + 1 < len(args):
                    n = int(args[idx + 1])
        run_once(show_packets=n, force_all=True)
    else:
        # Live polling loop
        run_polling_loop()
