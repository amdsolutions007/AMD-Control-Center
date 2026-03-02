"""
AMD Sync Engine — Phase 2: Cloud-Ready Architecture with Reply Brain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mission: Poll LekeeLekee every 5 minutes. Deposit notifications and
group messages into intelligence_vault/live/. Flag reply candidates
against the CEO's 573-sample historical communication pattern.
For HIGH-score messages: auto-draft a CEO reply using GPT-4 brain,
modelled on the WhatsApp NaijaBiz Pilot DNA (same identity, executive
thought-leadership voice adapted for LekeeLekee public ecosystem posts).

Architecture: Stateless, env-driven, Railway-deployable.
Deployment: Dockerfile.sync → Railway service `amd-sync-engine`
Author: GitHub Copilot | AMD Solutions 007
Date: 2026-03-01 (v1) → 2026-03-02 (v2 — Brain wired)
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

# OpenAI is optional — engine degrades gracefully if not installed or key absent
try:
    from openai import OpenAI as _OpenAI
    _OPENAI_AVAILABLE = True
except ImportError:
    _OPENAI_AVAILABLE = False

# Google Gemini is optional — hard fallback when OpenAI fails (401/429/balance)
# Uses google-genai SDK (current, replaces deprecated google-generativeai)
try:
    from google import genai as _genai
    from google.genai import types as _genai_types
    _GEMINI_AVAILABLE = True
except ImportError:
    _GEMINI_AVAILABLE = False

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
OPENAI_API_KEY     = os.environ.get("OPENAI_API_KEY", "")
BRAIN_MODEL        = os.environ.get("BRAIN_MODEL", "gpt-4-turbo-preview")
# Score threshold to trigger AI brain draft (0-100). Default: 50.
BRAIN_THRESHOLD    = int(os.environ.get("BRAIN_THRESHOLD", "50"))
# Gemini fallback — free tier, same key used by 36-State graphics engine
GEMINI_API_KEY     = os.environ.get("GEMINI_API_KEY", "")
GEMINI_BRAIN_MODEL = os.environ.get("GEMINI_BRAIN_MODEL", "gemini-2.0-flash")

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
# SECTION 2.5 — REPLY BRAIN ENGINE (GPT-4 — NaijaBiz Pilot DNA)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DNA Source: puppeteer_whatsapp_ai_bot.js + ai_knowledge_base_v2.js
# Same identity core, voice adapted:
#   WhatsApp DNA  → "NaijaBiz Pilot" (sales secretary, customer service)
#   LekeeLekee DNA → CEO Olawale Shoyemi (executive, ecosystem thought leader)

# The LekeeLekee system prompt — CEO's own voice:
_LEKEE_BRAIN_SYSTEM_PROMPT = """\
You are Olawale Shoyemi, CEO of AMD Solutions 007 — Nigeria's premier
AI automation and software development company. You speak in your own
executive voice, not as a bot.

IDENTITY
─────────────────────────────────────────────────
Full name:   Olawale Shoyemi
Handle:      @amd on LekeeLekee
Company:     AMD Solutions 007
Website:     https://amdsolutions007.com
Linktree:    https://linktr.ee/amdsolutions007
Mission:     "We build solutions for every Nigerian business — from
             market traders to multinational banks."
Philosophy:  "New technology is expensive. It is for those who can
             afford the best."
Mantra:      "Let's build 🌍" | "#007Systems" | "#AfricanTech"

VOICE RULES (Direct from 573 training samples)
─────────────────────────────────────────────────
1. Executive authority — never casual, never a pushover.
2. Thought leadership first — add insight, not praise.
3. Ecosystem builder — acknowledge contributors, celebrate builders.
4. Short paragraphs — max 2-3 sentences per paragraph.
5. End posts with 1-3 relevant hashtags when appropriate.
6. Use 🌍 💻 🚀 ⚡ occasionally — not on every sentence.
7. NEVER use American slang. Nigerian/African English is the voice.
8. NEVER write "As an AI..." or "I'm an AI..." — you ARE Olawale.
9. When replying to questions, give a real answer, not a redirect.
10. When welcoming a new member: warm, brief, challenge them to contribute.

VIP PROTOCOL
─────────────────────────────────────────────────
• @charlie_pyper  — CEO of LekeeLekee platform itself. HIGHEST priority.
  Treat as a peer founder. Acknowledge his platform. Propose partnership.
  Example: "Charlie — you've built remarkable infrastructure. Let's align
  on how AMD's Signal Beacon can serve your ecosystem at scale. 🌍"

• Any platform founder / CTO — peer-to-peer tone.
• New members asking questions — welcoming but substantive.
• Members posting about startups / funding — engage with genuine insight.

CONTEXT
─────────────────────────────────────────────────
You are being shown a message from the 'African Tech Ecosystem 🌍' group
on LekeeLekee. Your task is to draft a concise, on-brand reply that
Olawale would actually send.

REPLY FORMAT
─────────────────────────────────────────────────
- Max 120 words.
- Start with the person's @handle if replying to someone specific.
- Never explain yourself. Never hedge. Be decisive.
- Output the reply text ONLY — no preamble, no labels.
"""

# VIP handle → special tone note injected into the prompt
_VIP_TONE_NOTES = {
    "charlie_pyper": ("[VIP: Charlie Pyper is CEO of LekeeLekee. Respond as "
                      "a peer founder. Acknowledge his platform. Propose "
                      "collaboration. Highest priority."),
    "charlie":       "[VIP: Likely Charlie Pyper (LekeeLekee CEO). Peer-founder tone.]",
}


class ReplyBrainEngine:
    """
    Resilient AI reply drafter — OpenAI primary, Google Gemini hard fallback.

    Cascade:
      1. OpenAI GPT-4 (gpt-4-turbo-preview, env: BRAIN_MODEL)
         → Any 401 / 429 / billing error → immediate Gemini takeover
      2. Google Gemini 2.0 Flash (env: GEMINI_BRAIN_MODEL, free tier)
         → Same identity, same system prompt, same voice
      3. None — if both fail, replaces with None (no crash)

    DNA from WhatsApp NaijaBiz Pilot (ai_knowledge_base_v2.js).
    """

    # OpenAI error strings that trigger Gemini fallback
    _OPENAI_FATAL_PATTERNS = (
        "401", "429", "insufficient_quota",
        "billing", "credit", "balance", "exceeded",
    )

    def __init__(self):
        self._client        = None   # OpenAI client
        self._gemini_client = None   # Gemini client (google-genai)
        self._gemini_model  = None   # Gemini model name string
        self._enabled       = False

        # ── Primary: OpenAI ───────────────────────────────────────────────────
        if _OPENAI_AVAILABLE and OPENAI_API_KEY:
            self._client  = _OpenAI(api_key=OPENAI_API_KEY)
            self._enabled = True
            log.info(f"🧠 Brain PRIMARY ONLINE — OpenAI/{BRAIN_MODEL} | "
                     f"threshold: score≥{BRAIN_THRESHOLD}")
        else:
            if not _OPENAI_AVAILABLE:
                log.warning("Brain: openai package not installed — trying Gemini only.")
            elif not OPENAI_API_KEY:
                log.warning("Brain: OPENAI_API_KEY not set — trying Gemini only.")

        # ── Hard Fallback: Google Gemini ──────────────────────────────────────
        if _GEMINI_AVAILABLE and GEMINI_API_KEY:
            # google-genai SDK (current): Client-based, per-call model config
            self._gemini_client = _genai.Client(api_key=GEMINI_API_KEY)
            self._gemini_model  = GEMINI_BRAIN_MODEL   # just the model name string
            if not self._enabled:
                self._enabled = True
                log.info(f"🧠 Brain ONLINE (Gemini-only mode) — "
                         f"{GEMINI_BRAIN_MODEL} | threshold: score≥{BRAIN_THRESHOLD}")
            else:
                log.info(f"🛡️  Gemini fallback ARMED — {GEMINI_BRAIN_MODEL} "
                         f"(activates on OpenAI 401/429/billing)")
        else:
            if not _GEMINI_AVAILABLE:
                log.warning("Brain fallback: google-generativeai not installed. "
                            "Run: pip install google-generativeai")
            elif not GEMINI_API_KEY:
                log.warning("Brain fallback: GEMINI_API_KEY not set.")

        if not self._enabled:
            log.warning("⚠️  Brain OFFLINE — add OPENAI_API_KEY or GEMINI_API_KEY "
                        "to activate AI drafts.")

    @property
    def enabled(self) -> bool:
        return self._enabled

    def draft_reply(self, author: str, text: str, score_reasons: list[str]) -> Optional[str]:
        """
        Generate a CEO reply draft with automatic OpenAI→Gemini failover.
        Returns the draft string, or None if both providers fail.

        Args:
            author:        e.g. "@charlie_pyper"
            text:          The full incoming message body
            score_reasons: List of scoring signals that triggered the flag
        """
        if not self._enabled:
            return None

        clean_handle = author.lstrip("@").lower()
        vip_note     = _VIP_TONE_NOTES.get(clean_handle, "")
        reasons_str  = ", ".join(score_reasons) if score_reasons else "general engagement"
        user_prompt  = (
            f"Message from {author}:\n"
            f"\"{text.strip()[:600]}\"\n\n"
            f"Scoring signals: {reasons_str}\n"
            + (f"\n{vip_note}" if vip_note else "")
            + "\nDraft a reply Olawale would send."
        )

        # ── ATTEMPT 1: OpenAI (paid, highest quality) ─────────────────────────
        if self._client:
            try:
                completion = self._client.chat.completions.create(
                    model       = BRAIN_MODEL,
                    messages    = [
                        {"role": "system", "content": _LEKEE_BRAIN_SYSTEM_PROMPT},
                        {"role": "user",   "content": user_prompt},
                    ],
                    temperature = 0.7,
                    max_tokens  = 300,
                )
                draft = completion.choices[0].message.content.strip()
                log.info(f"  🧠 OpenAI drafted reply for {author} "
                         f"({BRAIN_MODEL}, {len(draft)} chars)")
                return draft
            except Exception as e:
                err_str = str(e).lower()
                is_fatal = any(p in err_str for p in self._OPENAI_FATAL_PATTERNS)
                if is_fatal:
                    log.warning(f"  ⚡ OpenAI FATAL ({str(e)[:80]}) "
                                f"→ switching to Gemini fallback")
                else:
                    log.warning(f"  OpenAI draft error for {author}: {str(e)[:120]}")
                # Fall through to Gemini for any OpenAI error

        # ── ATTEMPT 2: Google Gemini (free, hard fallback) ────────────────────
        if self._gemini_client and self._gemini_model:
            try:
                response = self._gemini_client.models.generate_content(
                    model    = self._gemini_model,
                    contents = user_prompt,
                    config   = _genai_types.GenerateContentConfig(
                        system_instruction = _LEKEE_BRAIN_SYSTEM_PROMPT,
                        temperature        = 0.7,
                        max_output_tokens  = 300,
                    ),
                )
                draft = response.text.strip()
                log.info(f"  🛡️  Gemini drafted reply for {author} "
                         f"({self._gemini_model}, {len(draft)} chars)")
                return draft
            except Exception as e:
                log.warning(f"  Gemini fallback failed for {author}: {e}")

        log.error(f"  ☠️  Both AI providers failed for {author} — no draft produced.")
        return None


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

    def deposit_messages(
        self,
        raw_list: list[dict],
        patterns: dict,
        brain: Optional["ReplyBrainEngine"] = None,
    ) -> tuple[int, list[dict]]:
        """
        Deposit new group messages + run pattern scoring.
        HIGH-score messages (≥ BRAIN_THRESHOLD) get an AI draft via the brain.
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

            # AI brain draft — only for HIGH-confidence flags to conserve API calls
            ai_draft = None
            if (brain and brain.enabled
                    and scoring["flag"]
                    and scoring["score"] >= BRAIN_THRESHOLD
                    and scoring.get("priority") != "SKIP"):
                ai_draft = brain.draft_reply(
                    author       = f"@{author}".replace("@@", "@"),
                    text         = text,
                    score_reasons = scoring.get("reasons", []),
                )

            item = {
                "fingerprint":  fp,
                "received_at":  datetime.now(timezone.utc).isoformat(),
                "author":       f"@{author}".replace("@@", "@"),
                "text_preview": text[:200],
                "char_length":  len(text),
                "reply_score":  scoring,
                "ai_draft":     ai_draft,   # None if brain offline or score < threshold
                "raw":          raw,
            }
            new_items.append(item)
            if scoring["flag"]:
                flagged.append(item)

        if not new_items:
            return 0, []

        written = self._append_items(self._today_path("messages"), new_items, "group_message")
        self._write_flagged(flagged)
        # Write AI drafts as a separate, clean file for CEO to action
        drafted = [i for i in flagged if i.get("ai_draft")]
        if drafted:
            self._write_ai_drafts(drafted)
        return written, flagged

    def _write_ai_drafts(self, drafted: list[dict]):
        """Write AI-drafted CEO replies to a clean, actionable file."""
        path = LIVE_DIR / "ai_reply_drafts.json"
        existing = []
        if path.exists():
            try:
                with open(path) as f:
                    existing = json.load(f).get("drafts", [])
            except Exception:
                pass

        new_entries = []
        for item in drafted:
            new_entries.append({
                "status":       "PENDING",   # CEO: change to SENT/SKIP after action
                "author":       item["author"],
                "their_message": item["text_preview"],
                "ai_draft":     item["ai_draft"],
                "score":        item["reply_score"]["score"],
                "reasons":      item["reply_score"]["reasons"],
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "fingerprint":  item["fingerprint"],
            })

        merged = existing + new_entries
        merged = merged[-100:]  # Rolling 100 drafts

        with open(path, "w") as f:
            json.dump({
                "description": (
                    "AI-drafted CEO replies — powered by GPT-4 NaijaBiz Pilot DNA. "
                    "Review, edit, and post manually. Change status to SENT/SKIP."
                ),
                "model":        BRAIN_MODEL,
                "total_drafts": len(merged),
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "drafts":       merged,
            }, f, indent=2, ensure_ascii=False)

        log.info(f"  📝 {len(new_entries)} AI draft(s) written → intelligence_vault/live/ai_reply_drafts.json")

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
                       notif_count: int, msg_count: int,
                       brain_enabled: bool = False):
    """Terminal Pulse Report — proves the bridge is live."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    _divider("🛰️  AMD SYNC ENGINE — PULSE REPORT")
    print(f"  Cycle:           #{cycle}")
    print(f"  Timestamp:       {ts}")
    print(f"  Group:           African Tech Ecosystem (ID: {GROUP_ID[:8]}...)")
    print(f"  New Notifs:      {notif_count} deposited")
    print(f"  New Messages:    {msg_count} deposited")
    print(f"  Flagged Replies: {len(flagged)} queued for CEO attention")
    drafted = [f for f in flagged if f.get("ai_draft")]
    brain_status = f"ONLINE (model={BRAIN_MODEL})" if brain_enabled else "OFFLINE (set OPENAI_API_KEY)"
    print(f"  AI Brain:        {brain_status}")
    print(f"  AI Drafts:       {len(drafted)} generated this cycle")
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

    # Flagged items + AI drafts
    if flagged:
        _divider("⚡ FLAGGED FOR CEO REPLY")
        for f in flagged[-3:]:
            print(f"  → {f['author']} (score: {f['reply_score']['score']}/100)")
            print(f"    \"{f['text_preview'][:100]}\"")
            print(f"    Triggers: {', '.join(f['reply_score']['reasons'])}")
            draft = f.get("ai_draft")
            if draft:
                print(f"    🧠 AI DRAFT:")
                # Indent draft lines
                for line in draft.split("\n"):
                    print(f"       {line}")
            print()

    _divider("VAULT LOCATION")
    print(f"  {LIVE_DIR}")
    if (LIVE_DIR / 'ai_reply_drafts.json').exists():
        print(f"  📝 AI drafts: {LIVE_DIR}/ai_reply_drafts.json")
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

    # Reply brain — GPT-4, ported from WhatsApp NaijaBiz Pilot DNA
    brain = ReplyBrainEngine()
    if not brain.enabled:
        log.info("⚠️  Brain offline — pattern scoring only (no AI drafts).")
        log.info("   Set OPENAI_API_KEY in .env to activate AI reply drafts.")

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
        msg_count, flagged = writer.deposit_messages(raw_msgs, patterns, brain=brain)
        drafted_count = sum(1 for f in flagged if f.get("ai_draft"))
        log.info(f"  Messages      → fetched:{len(raw_msgs)}  new:{msg_count}  "
                 f"flagged:{len(flagged)}  ai_drafted:{drafted_count}")

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

        print_pulse_report(enriched, flagged, cycle, notif_count, msg_count,
                           brain_enabled=brain.enabled)

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
