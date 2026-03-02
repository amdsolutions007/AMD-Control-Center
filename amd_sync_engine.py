"""
AMD Sync Engine — Phase 1: Local Foundation (Cloud-Ready Architecture)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mission: Poll LekeeLekee every 5 minutes. Deposit notifications and
group messages into intelligence_vault/live/. Flag reply candidates
against the CEO's 573-sample historical communication pattern.

Architecture: Stateless, env-driven, Railway-deployable (Phase 2).
Author: GitHub Copilot | AMD Solutions 007
Date: 2026-03-01
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import os
import re
import json
import time
import logging
import hashlib
from datetime import datetime, timezone, date
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv

# ── BOOT: Load environment ────────────────────────────────────────────────────
load_dotenv()

# ── CONFIG: All from .env, never hardcoded ────────────────────────────────────
BASE_URL       = os.environ.get("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
EMAIL          = os.environ["LEKE_LEKE_EMAIL"]
PASSWORD       = os.environ["LEKE_LEKE_PASSWORD"]
GROUP_ID       = os.environ["LEKE_LEKE_GROUP_ID"]
POLL_INTERVAL  = int(os.environ.get("POLL_INTERVAL_SECS", "300"))   # 5 min default
VAULT_DIR      = Path(__file__).parent / "intelligence_vault"
LIVE_DIR       = VAULT_DIR / "live"
TRAINING_FILE  = VAULT_DIR / "training_data" / "ceo_messages.json"
# Token cache — survives across --once runs and Railway restarts
# Stored as plain text (not .json) so .gitignore doesn't catch it
TOKEN_CACHE    = Path(__file__).parent / ".leke_session_token"

# ── LOGGING: stdout (Railway captures this) ───────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger("AMD.SyncEngine")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1 — PATTERN ENGINE (573 CEO Samples)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _load_ceo_patterns() -> dict:
    """Load CEO style profile and extract reply trigger patterns."""
    if not TRAINING_FILE.exists():
        log.warning("Training data not found — pattern engine running in degraded mode.")
        return {"triggers": [], "phrases": [], "topic_keywords": [], "avg_length": 521}

    with open(TRAINING_FILE) as f:
        data = json.load(f)

    style   = data.get("style_profile", {})
    msgs    = data.get("messages", [])

    # Extract CEO's recurring phrases as trigger seeds
    raw_phrases = style.get("recurring_phrases", [])
    phrase_words = [w.lower() for phrase in raw_phrases for w in phrase.split()
                    if len(w) > 3 and not w.startswith("#")]

    # CEO topic keywords — derived from training corpus + AGENTS.md brand vocabulary
    topic_keywords = [
        # Tech / business
        "startup", "funding", "investor", "build", "solution", "product",
        "tech", "technology", "software", "developer", "engineer", "code",
        # African ecosystem
        "africa", "naija", "nigeria", "nigerian", "lagos", "african",
        "ecosystem", "continent", "diaspora",
        # AMD brand triggers
        "amd", "solutions", "intelligence", "system", "automate", "automation",
        # Engagement triggers
        "advice", "opinion", "thoughts", "help", "question", "hire", "hiring",
        "opportunity", "collaborate", "partnership", "invest", "launch",
        # Conversation hooks
        "what", "how", "why", "when", "anyone", "recommend", "experience",
    ]

    # Phrases that directly address the group leader
    ceo_mentions = ["@amd", "olawale", "shoyemi", "solutions 007"]

    avg_length = style.get("avg_message_length_chars", 521)

    log.info(f"Pattern Engine loaded: {len(msgs)} training samples | "
             f"avg_len={avg_length} | {len(topic_keywords)} topic triggers")

    return {
        "triggers":       topic_keywords,
        "phrases":        phrase_words + ceo_mentions,
        "topic_keywords": topic_keywords,
        "avg_length":     avg_length,
        "sample_count":   len(msgs),
    }


def score_message_for_reply(text: str, author_handle: str, patterns: dict) -> dict:
    """
    Score an incoming message against CEO reply patterns (0–100).
    Returns dict with score + reason breakdown for transparency.
    Self-posts by @amd are always score 0 — CEO doesn't reply to himself.
    """
    # Filter: skip CEO's own posts entirely
    if author_handle.lower().strip("@") in ("amd", "olawale", "olawale shoyemi"):
        return {"score": 0, "flag": False, "priority": "SKIP", "reasons": ["self_post"]}
    text_lower    = text.lower()
    score         = 0
    reasons       = []

    # Signal 1: Direct question (highest priority)
    if "?" in text:
        score += 35
        reasons.append("contains_question")

    # Signal 2: Topic keyword match
    matched_topics = [kw for kw in patterns["topic_keywords"] if kw in text_lower]
    if matched_topics:
        score += min(len(matched_topics) * 8, 30)
        reasons.append(f"topic_match:{','.join(matched_topics[:3])}")

    # Signal 3: Direct CEO mention
    ceo_targets = ["@amd", "olawale", "solutions 007", "shoyemi"]
    if any(t in text_lower for t in ceo_targets):
        score += 25
        reasons.append("direct_ceo_mention")

    # Signal 4: Substantive message length (>50 chars = real content)
    if len(text) > 50:
        score += 5
        reasons.append("substantive_length")

    # Signal 5: Recurring CEO phrase echo (user picked up AMD vocabulary)
    phrase_matches = [p for p in patterns["phrases"] if p in text_lower and len(p) > 4]
    if phrase_matches:
        score += min(len(phrase_matches) * 5, 15)
        reasons.append(f"brand_phrase_echo:{','.join(phrase_matches[:2])}")

    # Signal 6: New joiner welcome trigger
    intro_signals = ["just joined", "new here", "introduce myself", "hello everyone",
                     "hi all", "good morning", "good afternoon", "great to be"]
    if any(s in text_lower for s in intro_signals):
        score += 20
        reasons.append("new_joiner_intro")

    # Signal 7: Direct reply bait (seeking expertise)
    expertise_bait = ["who can", "does anyone", "any recommendations", "can someone",
                      "looking for", "seeking", "need help", "anyone know"]
    if any(s in text_lower for s in expertise_bait):
        score += 20
        reasons.append("expertise_bait")

    # Signal 8: VIP sender — platform leadership or known ecosystem influencers
    # charlie_pyper = CEO of LekeeLekee itself; always worth the CEO's attention
    vip_handles = ["charlie_pyper", "charlie", "lekeelekee", "pyper"]
    if any(v in author_handle.lower() for v in vip_handles):
        score += 50
        reasons.append("vip_sender")

    score = min(score, 100)

    return {
        "score":       score,
        "flag":        score >= 25,   # Threshold: 25 captures substantive third-party posts
        "priority":    "HIGH" if score >= 70 else "MEDIUM" if score >= 40 else "LOW",
        "reasons":     reasons,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 2 — LEKEELEKEE API CLIENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LekeeLekeeClient:
    """
    Stateful API client with auto-reauth.
    Railway-safe: credentials loaded from env, token never persisted to disk.
    """

    def __init__(self):
        self._token:   Optional[str] = None
        self._session: requests.Session = requests.Session()
        self._session.headers.update({
            "User-Agent": "AMD-SyncEngine/1.0 (amdsolutions007.com)",
            "Accept":     "application/json",
        })
        # Probe results: populated on first connect to discover live endpoints
        self._endpoints: dict = {}
        # Load cached token if present (avoids 429 on rapid restarts)
        self._load_cached_token()

    def _load_cached_token(self):
        """Load a previously saved session token to avoid re-auth on restarts."""
        if not TOKEN_CACHE.exists():
            return
        try:
            token = TOKEN_CACHE.read_text().strip()
            if token:
                self._token = token
                self._session.headers["Authorization"] = f"Bearer {token}"
                log.info("Session token loaded from cache — skipping login")
        except Exception:
            pass

    def _save_cached_token(self, token: str):
        """Persist the session token for future restarts."""
        try:
            TOKEN_CACHE.write_text(token)
        except Exception as e:
            log.warning(f"Could not save token cache: {e}")

    # ── AUTH ─────────────────────────────────────────────────────────────────

    def authenticate(self) -> bool:
        """Authenticate and store Bearer token. Returns True on success."""
        log.info("Authenticating to LekeeLekee...")
        try:
            resp = self._session.post(
                f"{BASE_URL}/api/v1/auth/login",
                data={"email": EMAIL, "password": PASSWORD},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=20,
            )
            body = resp.json()
        except Exception as e:
            log.error(f"Auth request failed: {e}")
            return False

        token = (
            (body.get("data") or {}).get("token")
            or body.get("token")
            or body.get("access_token")
        )
        if not token:
            log.error(f"Auth failed — no token in response (HTTP {resp.status_code}): "
                      f"{str(body)[:200]}")
            return False

        self._token = token
        self._session.headers["Authorization"] = f"Bearer {token}"
        self._save_cached_token(token)
        log.info("✅ Authenticated as @amd (Olawale Shoyemi)")
        return True

    def _ensure_auth(self):
        """Re-authenticate if token is missing."""
        if not self._token:
            if not self.authenticate():
                raise RuntimeError("Cannot authenticate to LekeeLekee")

    # ── ENDPOINT DISCOVERY ───────────────────────────────────────────────────

    def probe_endpoints(self):
        """
        Try candidate endpoints to discover which are live.
        Populates self._endpoints with confirmed paths.
        """
        self._ensure_auth()
        log.info("Probing LekeeLekee API surface...")

        candidates = {
            # Ground-truth: posts = all group content (verified via probe 2026-03-01)
            "group_messages": [
                f"/api/v1/groups/{GROUP_ID}/posts",   # ← CONFIRMED: JSON, 49KB
                f"/api/v1/groups/{GROUP_ID}/messages",  # returns HTML — skip
                f"/api/v1/groups/{GROUP_ID}/feed",      # returns HTML — skip
            ],
            # Ground-truth: notifications at root level (verified via probe 2026-03-01)
            "notifications": [
                "/api/v1/notifications",               # ← CONFIRMED: JSON, 12KB
                "/api/v1/user/notifications",
                "/api/v1/alerts",
            ],
            "group_info": [
                f"/api/v1/groups/{GROUP_ID}",
            ],
            "group_members": [
                f"/api/v1/groups/{GROUP_ID}/members",  # ← CONFIRMED: JSON, 23KB
            ],
        }

        for category, paths in candidates.items():
            for path in paths:
                try:
                    r = self._session.get(f"{BASE_URL}{path}", timeout=15)
                    if r.status_code == 200:
                        self._endpoints[category] = path
                        log.info(f"  ✅ {category}: {path}")
                        break
                    elif r.status_code == 401:
                        # Token expired — re-auth and retry once
                        log.warning("Token expired during probe, re-authenticating...")
                        self.authenticate()
                        r2 = self._session.get(f"{BASE_URL}{path}", timeout=15)
                        if r2.status_code == 200:
                            self._endpoints[category] = path
                            log.info(f"  ✅ {category}: {path} (after reauth)")
                            break
                except requests.exceptions.RequestException as e:
                    log.debug(f"  ⚠️  {path} — {e}")

            if category not in self._endpoints:
                log.warning(f"  ⚪ {category}: no live endpoint found (will retry next cycle)")

        return self._endpoints

    # ── DATA FETCHERS ────────────────────────────────────────────────────────

    def _get(self, path: str, params: dict = None) -> Optional[list | dict]:
        """
        Safe GET wrapper. Handles 401 with auto-reauth (one retry).
        Returns parsed JSON body or None on failure.
        """
        self._ensure_auth()
        try:
            r = self._session.get(f"{BASE_URL}{path}", params=params, timeout=20)
            if r.status_code == 401:
                log.info("Token expired mid-session — clearing cache and re-authenticating...")
                TOKEN_CACHE.unlink(missing_ok=True)
                self._token = None
                if self.authenticate():
                    r = self._session.get(f"{BASE_URL}{path}", params=params, timeout=20)
            if r.status_code != 200:
                log.warning(f"GET {path} → HTTP {r.status_code}")
                return None
            return r.json()
        except Exception as e:
            log.error(f"GET {path} failed: {e}")
            return None

    def fetch_notifications(self) -> list[dict]:
        """Fetch latest notifications. Returns list of notification objects."""
        path = self._endpoints.get("notifications")
        if not path:
            return []

        body = self._get(path)
        if body is None:
            return []

        # LekeeLekee notifications: {"success":true,"notifications":[...]}
        if isinstance(body, list):
            return body
        if isinstance(body, dict):
            return (
                body.get("notifications")    # ← actual key (not data.notifications)
                or (body.get("data") or {}).get("notifications")
                or body.get("data") if isinstance(body.get("data"), list) else None
                or body.get("items")
                or []
            )
        return []

    def fetch_group_messages(self, limit: int = 50) -> list[dict]:
        """Fetch recent group messages. Returns list of message objects."""
        path = self._endpoints.get("group_messages")
        if not path:
            return []

        body = self._get(path, params={"limit": limit, "per_page": limit})
        if body is None:
            return []

        # LekeeLekee posts: {"success":true,"data":{"posts":[...]}}
        if isinstance(body, list):
            return body
        if isinstance(body, dict):
            nested = body.get("data") or {}
            return (
                nested.get("posts")           # ← actual key (data.posts)
                or nested.get("messages")
                or nested.get("items")
                or body.get("posts")
                or body.get("messages")
                or (body.get("data") if isinstance(body.get("data"), list) else None)
                or []
            )
        return []


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 3 — VAULT WRITER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _msg_fingerprint(msg: dict) -> str:
    """Stable dedup key for a message/notification object."""
    uid = (
        msg.get("id")
        or msg.get("public_id")
        or msg.get("uuid")
        or msg.get("body", "")[:120]
        or str(msg)[:120]
    )
    return hashlib.md5(str(uid).encode()).hexdigest()


class VaultWriter:
    """
    Deposits polled data into intelligence_vault/live/.
    Maintains a seen-set to avoid duplicate writes.
    All files are dated so Railway redeploys never lose history.
    """

    def __init__(self):
        LIVE_DIR.mkdir(parents=True, exist_ok=True)
        self._seen_notifications: set[str] = set()
        self._seen_messages:      set[str] = set()

        # Pre-load today's fingerprints so a restart doesn't re-flag old items
        self._load_seen("notifications")
        self._load_seen("messages")

    def _today_path(self, kind: str) -> Path:
        return LIVE_DIR / f"{kind}_{date.today().isoformat()}.json"

    def _load_seen(self, kind: str):
        """Seed the seen-set from today's existing file (idempotent restarts)."""
        path = self._today_path(kind)
        if not path.exists():
            return
        try:
            with open(path) as f:
                existing = json.load(f)
            for item in existing.get("items", []):
                fp = _msg_fingerprint(item.get("raw", item))
                if kind == "notifications":
                    self._seen_notifications.add(fp)
                else:
                    self._seen_messages.add(fp)
        except Exception:
            pass

    def _append_items(self, path: Path, new_items: list[dict], kind: str):
        """Read → merge → write atomically."""
        existing_items = []
        if path.exists():
            try:
                with open(path) as f:
                    existing_items = json.load(f).get("items", [])
            except Exception:
                pass

        merged = existing_items + new_items
        payload = {
            "vault_path":    str(path.relative_to(VAULT_DIR.parent)),
            "kind":          kind,
            "date":          date.today().isoformat(),
            "total_items":   len(merged),
            "last_updated":  datetime.now(timezone.utc).isoformat(),
            "items":         merged,
        }
        with open(path, "w") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        return len(new_items)

    def deposit_notifications(self, raw_list: list[dict]) -> int:
        """Deposit new notifications. Returns count of net-new items written."""
        new_items = []
        for raw in raw_list:
            fp = _msg_fingerprint(raw)
            if fp in self._seen_notifications:
                continue
            self._seen_notifications.add(fp)
            new_items.append({
                "fingerprint":  fp,
                "received_at":  datetime.now(timezone.utc).isoformat(),
                "raw":          raw,
            })
        if not new_items:
            return 0
        return self._append_items(self._today_path("notifications"), new_items, "notification")

    def deposit_messages(self, raw_list: list[dict], patterns: dict) -> tuple[int, list[dict]]:
        """
        Deposit new group messages + run pattern scoring.
        Returns (net_new_count, flagged_list).
        """
        new_items  = []
        flagged    = []
        for raw in raw_list:
            fp = _msg_fingerprint(raw)
            if fp in self._seen_messages:
                continue
            self._seen_messages.add(fp)

            # Extract text and author — LekeeLekee posts shape:
            # {"public_id":"...","text":"...","user":{"username":"...","name":"..."}}
            text   = (
                raw.get("text")               # ← primary field for group posts
                or raw.get("body")
                or raw.get("content")
                or raw.get("message")
                or ""
            )
            user_obj = raw.get("user") or {}
            author = (
                user_obj.get("username")      # ← "amd", "GreenTech", etc.
                or user_obj.get("name")
                or raw.get("username")
                or raw.get("handle")
                or "unknown"
            )

            scoring = score_message_for_reply(text, author, patterns)

            item = {
                "fingerprint":  fp,
                "received_at":  datetime.now(timezone.utc).isoformat(),
                "author":       f"@{author}".replace("@@", "@"),
                "text_preview": text[:200],
                "char_length":  len(text),
                "reply_score":  scoring,
                "raw":          raw,
            }
            new_items.append(item)
            if scoring["flag"]:
                flagged.append(item)

        if not new_items:
            return 0, []

        written = self._append_items(self._today_path("messages"), new_items, "group_message")
        self._write_flagged(flagged)
        return written, flagged

    def _write_flagged(self, new_flagged: list[dict]):
        """Append newly flagged replies to the persistent flag register."""
        path = LIVE_DIR / "flagged_replies.json"
        existing = []
        if path.exists():
            try:
                with open(path) as f:
                    existing = json.load(f).get("flags", [])
            except Exception:
                pass

        merged = existing + new_flagged
        # Keep latest 200 flags (rolling window)
        merged = merged[-200:]

        with open(path, "w") as f:
            json.dump({
                "description":   "Messages flagged for CEO reply — pattern-scored against 573 training samples",
                "total_flags":   len(merged),
                "last_updated":  datetime.now(timezone.utc).isoformat(),
                "flags":         merged,
            }, f, indent=2, ensure_ascii=False)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 4 — PULSE REPORT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _divider(title: str = "", width: int = 64):
    if title:
        pad = (width - len(title) - 2) // 2
        print(f"\n{'═' * pad} {title} {'═' * pad}")
    else:
        print("─" * width)


def print_pulse_report(messages: list[dict], flagged: list[dict], cycle: int,
                       notif_count: int, msg_count: int):
    """Terminal Pulse Report — proves the bridge is live."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    _divider("🛰️  AMD SYNC ENGINE — PULSE REPORT")
    print(f"  Cycle:           #{cycle}")
    print(f"  Timestamp:       {ts}")
    print(f"  Group:           African Tech Ecosystem (ID: {GROUP_ID[:8]}...)")
    print(f"  New Notifs:      {notif_count} deposited")
    print(f"  New Messages:    {msg_count} deposited")
    print(f"  Flagged Replies: {len(flagged)} queued for CEO attention")
    _divider()

    # Show last 5 messages from the vault (proof of live data)
    _divider("📡 LAST 5 GROUP MESSAGES  (Bridge Proof)")
    if not messages:
        print("  [No messages received this cycle — check endpoint probe results]")
    else:
        for i, msg in enumerate(messages[-5:], 1):
            author  = msg.get("author", "@unknown")
            preview = msg.get("text_preview", "")[:120]
            score   = msg.get("reply_score", {})
            flag    = "🔴 REPLY FLAG" if score.get("flag") else "   "
            prio    = score.get("priority", "")
            reasons = ", ".join(score.get("reasons", []))[:50]
            print(f"  [{i}] {flag} {author}")
            print(f"       \"{preview}\"")
            print(f"       Score: {score.get('score', 0)}/100 | {prio} | {reasons}")
            _divider()

    # Flagged items deserving immediate attention
    if flagged:
        _divider("⚡ FLAGGED FOR CEO REPLY")
        for f in flagged[-3:]:
            print(f"  → {f['author']} (score: {f['reply_score']['score']}/100)")
            print(f"    \"{f['text_preview'][:100]}\"")
            print(f"    Triggers: {', '.join(f['reply_score']['reasons'])}")
            print()

    _divider("VAULT LOCATION")
    print(f"  {LIVE_DIR}")
    _divider()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 5 — MAIN POLL LOOP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def main(run_once: bool = False):
    _divider("AMD SYNC ENGINE  v1.0 — BOOTING")
    print(f"  Base URL:  {BASE_URL}")
    print(f"  Group ID:  {GROUP_ID}")
    print(f"  Interval:  {POLL_INTERVAL}s ({POLL_INTERVAL // 60}m {POLL_INTERVAL % 60}s)")
    print(f"  Vault:     {VAULT_DIR}")

    # Load CEO pattern engine
    patterns = _load_ceo_patterns()

    # Initialise API client
    client = LekeeLekeeClient()
    if not client.authenticate():
        log.critical("Boot failed: cannot authenticate. Check LEKE_LEKE_EMAIL / LEKE_LEKE_PASSWORD in .env")
        return

    # Discover live endpoints
    client.probe_endpoints()

    # Vault writer
    writer = VaultWriter()

    cycle = 0
    log.info(f"🚀 Sync engine live — polling every {POLL_INTERVAL}s")

    while True:
        cycle += 1
        log.info(f"── Cycle #{cycle} starting ──")

        # ── Poll notifications ────────────────────────────────────────
        raw_notifs = client.fetch_notifications()
        notif_count = writer.deposit_notifications(raw_notifs)
        log.info(f"  Notifications → fetched:{len(raw_notifs)}  new:{notif_count}")

        # ── Poll group messages ───────────────────────────────────────
        raw_msgs     = client.fetch_group_messages(limit=50)
        msg_count, flagged = writer.deposit_messages(raw_msgs, patterns)
        log.info(f"  Messages      → fetched:{len(raw_msgs)}  new:{msg_count}  flagged:{len(flagged)}")

        # ── Pulse Report (every cycle — trimmed after first boot) ─────
        # Build enriched list from raw for display
        enriched = []
        for raw in raw_msgs[-5:]:
            text   = (raw.get("text") or raw.get("body") or raw.get("content")
                      or raw.get("message") or "")
            user_obj = raw.get("user") or {}
            author = (user_obj.get("username") or user_obj.get("name")
                      or raw.get("username") or "unknown")
            scoring = score_message_for_reply(text, author, patterns)
            enriched.append({
                "author":       f"@{author}".replace("@@", "@"),
                "text_preview": text[:200],
                "reply_score":  scoring,
            })

        print_pulse_report(enriched, flagged, cycle, notif_count, msg_count)

        # ── Sleep until next cycle ────────────────────────────────────
        if run_once:
            log.info("  --once: single cycle complete. Exiting.")
            break
        log.info(f"  Next poll in {POLL_INTERVAL}s — sleeping...")
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    import sys
    # --once flag: run exactly one cycle then exit (useful for Pulse proof / CI)
    RUN_ONCE = "--once" in sys.argv
    if RUN_ONCE:
        log.info("--once flag detected: single-cycle mode")
    main(run_once=RUN_ONCE)
