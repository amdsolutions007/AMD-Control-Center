"""
Telegram Approval Bot for Ghost Writer
Human-in-the-Loop: CEO reviews and approves posts before they go live
"""

import os
import re
import json
import base64
import asyncio
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, time as dt_time, timezone
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from content_generator import ContentGenerator
from graphic_generator import GraphicGenerator

# ── Direct API helpers (no browser / Selenium) ──────────────────────────────────
try:
    import requests as _req
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests as _req

_BASE_URL = "https://www.lekeelekee.com"
_GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"   # African Tech Ecosystem 🌍

# ── LekeeBot Module 4+5 — Chat Approval Gate + Reply Dispatcher ──────────────────
_LEKE_CONV_ID   = "019c12b7-0ef5-73c5-92ca-1e5609f5f5bf"  # #General channel
_STATIC_IV      = "MDAwMDAwMDAwMDAwMDAwMA=="
_LEKEEBOT_SEND  = "SEND:"  # callback_data prefix for Module 4 SEND IT
_LEKEEBOT_SKIP  = "SKIP:"  # callback_data prefix for Module 4 SKIP
_LEKEEBOT_EDIT  = "EDIT:"  # callback_data prefix for Module 4 EDIT
_LEKEEBOT_DM    = "DM:"   # callback_data prefix for Module 6 SEND AS DM
# draft_queue.json path (matches chat_intel_engine.py constant)
_LEKEEBOT_QUEUE = None  # lazy-loaded


def _lekee_login(email: str, password: str):
    """Login to LekeeLekee. Returns (session, token, user_id). Retries on 429."""
    session = _req.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Origin": _BASE_URL,
        "Referer": _BASE_URL + "/",
        "Accept": "application/json",
    })
    resp = None
    for attempt in range(1, 4):
        resp = session.post(
            f"{_BASE_URL}/api/v1/auth/login",
            data={"email": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        if resp.status_code == 429:
            wait = 60 * attempt
            print(f"⏳ Rate limited — waiting {wait}s (attempt {attempt}/3)...")
            time.sleep(wait)
            continue
        break
    if resp is None or resp.status_code != 200:
        raise RuntimeError(f"Login failed: HTTP {resp.status_code if resp else '?'} — {resp.text[:200] if resp else 'no response'}")
    data = resp.json()
    if data.get("status") != "success":
        raise RuntimeError(f"Login error: {data.get('message', resp.text[:100])}")
    token   = data["data"]["token"]
    user_id = data["data"]["user"]["public_id"]
    session.headers.update({
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    print(f"🔑 Logged in: token={len(token)} chars | user={user_id}")
    return session, token, user_id


def _lekee_post_group(session, caption: str, parent_id: str = None) -> dict:
    """
    Direct API Strike: POST to African Tech Ecosystem group.
    If parent_id is provided, the post becomes a threaded reply to that post.
    parent_id = LekeeLekee public_id of the original message being replied to.
    """
    payload = {"content": caption, "type": "post"}
    if parent_id:
        payload["parent_id"] = parent_id   # Threaded reply — Article II.2 law
    resp = session.post(
        f"{_BASE_URL}/api/v1/groups/{_GROUP_ID}/posts",
        json=payload,
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Group post failed: HTTP {resp.status_code} — {resp.text[:300]}")
    return resp.json()


def _update_state_tracker(day: int, state_name: str, capital: str, post_id: str):
    """Update state_tracker.json AND campaign_progress.json after a successful post."""
    # ── state_tracker.json ────────────────────────────────────────────────────
    tracker_path = "state_tracker.json"
    try:
        with open(tracker_path) as f:
            data = json.load(f)
    except Exception:
        data = {"current_day": day + 1, "campaign": "36_Nigerian_States",
                "group_id": _GROUP_ID, "history": []}
    data["current_day"] = day + 1   # next day (1-indexed display)
    data.setdefault("history", []).append({
        "day": day,
        "state": state_name,
        "capital": capital,
        "post_id": post_id,
        "posted_at": datetime.now(timezone.utc).isoformat(),
        "platform": "lekeelekee_group",
    })
    with open(tracker_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"💾 state_tracker.json updated: next=Day {day + 1}")

    # ── campaign_progress.json (ContentGenerator state, 0-indexed) ────────────
    cp_path = "campaign_progress.json"
    try:
        with open(cp_path) as f:
            cp = json.load(f)
    except Exception:
        cp = {}
    cp["current_day"]  = day      # day is 1-indexed display; index = day - 1 + 1 = day
    cp["last_updated"] = datetime.now(timezone.utc).isoformat()
    with open(cp_path, "w") as f:
        json.dump(cp, f, indent=2)
    print(f"💾 campaign_progress.json updated: current_day={day} (Day {day + 1} next)")

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
CEO_TELEGRAM_ID = os.getenv('CEO_TELEGRAM_ID')  # Your Telegram user ID

# Directories
PENDING_DIR = "pending_posts"
APPROVED_DIR = "approved_posts"
REJECTED_DIR = "rejected_posts"
PENDING_REGISTRY = "pending_posts.json"  # survives redeploys

# ── Sync Engine AI Draft Bridge ──────────────────────────────────────────────
# Path written by amd_sync_engine.py every 5 minutes when high-score messages
# are detected in the LekeeLekee group.
from pathlib import Path as _Path
VAULT_LIVE_DIR  = _Path(__file__).parent / "intelligence_vault" / "live"
DRAFTS_FILE     = VAULT_LIVE_DIR / "ai_reply_drafts.json"
# Module 6 — DM directory
_DM_DIR_FILE    = VAULT_LIVE_DIR / "dm_directory.json"
# Telegram callback prefix keeps new flow separate from 36-states approve/reject
_DREPLY_PREFIX  = "dreply_"

# Ensure directories exist
os.makedirs(PENDING_DIR, exist_ok=True)
os.makedirs(APPROVED_DIR, exist_ok=True)
os.makedirs(REJECTED_DIR, exist_ok=True)


class TelegramApprovalBot:
    """Telegram bot for CEO to approve/reject posts"""
    
    def __init__(self):
        self.content_gen = ContentGenerator()
        self.graphic_gen = GraphicGenerator()
        self.app = None
        self._pending_registry: dict = self._load_registry()

    def _load_registry(self) -> dict:
        """Load persistent pending_posts.json from disk (survives redeploys)."""
        if os.path.exists(PENDING_REGISTRY):
            try:
                with open(PENDING_REGISTRY, 'r') as f:
                    data = json.load(f)
                print(f"📂 Loaded {len(data)} pending posts from registry")
                return data
            except Exception as e:
                print(f"⚠️ Could not load registry: {e} — starting fresh")
        return {}

    def _save_registry(self):
        """Persist current pending registry to disk."""
        try:
            with open(PENDING_REGISTRY, 'w') as f:
                json.dump(self._pending_registry, f, indent=2)
        except Exception as e:
            print(f"⚠️ Could not save registry: {e}")

    def _remove_from_registry(self, post_id: str):
        """Remove a post from the registry and save."""
        self._pending_registry.pop(post_id, None)
        self._save_registry()
        
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        await update.message.reply_text(
            "🎯 *GHOST WRITER APPROVAL BOT*\n\n"
            "Commands:\n"
            "/generate - Generate new post for review\n"
            "/status - Campaign status\n"
            "/queue - View pending posts\n\n"
            "When a post is ready, you'll receive:\n"
            "✅ APPROVE - Post goes live on Leke Leke\n"
            "❌ REJECT - Discard and generate new one",
            parse_mode='Markdown'
        )
        
    async def status_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /status command"""
        status = self.content_gen.get_campaign_status()
        
        pending_count = len([f for f in os.listdir(PENDING_DIR) if f.endswith('.json')])
        approved_count = len([f for f in os.listdir(APPROVED_DIR) if f.endswith('.json')])
        
        message = f"""📊 *CAMPAIGN STATUS*

🗺️ 36 States of Tech
└─ Day {status['current_day']}/36
└─ Progress: {status['progress_percent']}%
└─ Completed: {status['completed']}
└─ Remaining: {status['remaining']}

📥 *QUEUE STATUS*
└─ Pending Review: {pending_count}
└─ Approved (Ready): {approved_count}

Use /generate to create next post"""

        await update.message.reply_text(message, parse_mode='Markdown')
        
    async def queue_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /queue command"""
        pending_files = [f for f in os.listdir(PENDING_DIR) if f.endswith('.json')]
        
        if not pending_files:
            await update.message.reply_text("📭 No posts pending review. Use /generate to create one.")
            return
            
        message = f"📥 *PENDING REVIEW* ({len(pending_files)} posts)\n\n"
        
        for i, file in enumerate(pending_files[:5], 1):
            with open(os.path.join(PENDING_DIR, file), 'r') as f:
                post = json.load(f)
            message += f"{i}. Day {post['day']} - {post['state_name']}\n"
            
        if len(pending_files) > 5:
            message += f"\n... and {len(pending_files) - 5} more"
            
        await update.message.reply_text(message, parse_mode='Markdown')
        
    async def generate_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /generate command - create new post for review"""
        
        await update.message.reply_text("🎨 Generating post... (AI graphic generation takes 10-15 seconds)")
        
        try:
            # Generate content
            post = self.content_gen.generate_next_post()
            
            # Generate graphic
            graphic_path = await self.graphic_gen.generate_state_graphic(
                state_name=post['state_name'],
                day_number=post['day'],
                caption=post['caption'],
                zone=post.get('zone', ''),
                capital=post.get('capital', '')
            )
            
            post['graphic_path'] = graphic_path
            
            # Save to pending
            post_id = f"post_{post['day']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            post_file = os.path.join(PENDING_DIR, f"{post_id}.json")
            
            with open(post_file, 'w') as f:
                json.dump(post, f, indent=2)

            # Also persist to registry (survives redeploys)
            self._pending_registry[post_id] = post
            self._save_registry()
                
            # Send to CEO for review
            keyboard = [
                [
                    InlineKeyboardButton("✅ APPROVE", callback_data=f"approve_{post_id}"),
                    InlineKeyboardButton("❌ REJECT", callback_data=f"reject_{post_id}")
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            # Send graphic
            with open(graphic_path, 'rb') as photo:
                await update.message.reply_photo(
                    photo=photo,
                    caption=f"*📸 Day {post['day']}/36: {post['state_name']}*",
                    parse_mode='Markdown'
                )
                
            # Send caption
            await update.message.reply_text(
                f"*CAPTION PREVIEW:*\n\n{post['caption']}\n\n"
                f"━━━━━━━━━━━━━━━━\n"
                f"🎯 Ready to post to Leke Leke?",
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
            
            print(f"✅ Post {post_id} sent to CEO for review")
            
        except Exception as e:
            await update.message.reply_text(f"❌ Error generating post: {str(e)}")
            print(f"❌ Generation error: {str(e)}")

    async def otp_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /otp XXXXXX — CEO provides 2FA code during LekeeLekee login"""
        if str(update.effective_user.id) != str(CEO_TELEGRAM_ID):
            return
        args = context.args
        if not args:
            await update.message.reply_text("Usage: /otp 123456")
            return
        code = args[0].strip()
        if self._2fa_event and not self._2fa_event.is_set():
            self._2fa_code = code
            self._2fa_event.set()
            await update.message.reply_text(f"✅ OTP received — submitting to LekeeLekee...")
        else:
            await update.message.reply_text("ℹ️ No active 2FA session. Code not needed right now.")

    async def cookies_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /cookies <json> — CEO pastes exported browser cookies to bypass Turnstile.

        How to extract cookies:
        1. Log in to lekeelekee.com on Chrome/Firefox normally
        2. Install 'Cookie Editor' extension → Export → Copy All (JSON format)
        3. Send: /cookies [paste JSON here]

        The bot saves them to lekee_cookies.json and uses them on every publish —
        no Turnstile ever again until the session expires (~30 days).
        """
        if str(update.effective_user.id) != str(CEO_TELEGRAM_ID):
            return

        # Cookies JSON is everything after "/cookies "
        full_text = update.message.text.strip()
        prefix = "/cookies "
        if not full_text.startswith(prefix) or len(full_text) <= len(prefix):
            await update.message.reply_text(
                "📋 *How to set cookies (one-time setup):*\n\n"
                "1. Open Chrome on your phone/computer\n"
                "2. Go to lekeelekee.com → *Log in* manually (solve Turnstile yourself)\n"
                "3. ✅ Confirm you're on your *home feed* (not the login page!)\n"
                "4. Install *Cookie-Editor* extension (Chrome Web Store)\n"
                "5. Click the extension → *Export* → *Export as JSON* → Copy all\n"
                "6. Send: `/cookies [paste JSON here]`\n\n"
                "⚠️ *You MUST be logged in before exporting.* A valid export has 15-50+ cookies.\n"
                "After this, the bot bypasses Turnstile permanently until the session expires (~30 days).",
                parse_mode='Markdown'
            )
            return

        cookies_json = full_text[len(prefix):]
        # Save via automation class helper
        from leke_leke_browser_automation import LekeLekeeAutomation
        import json as _json
        dummy = LekeLekeeAutomation.__new__(LekeLekeeAutomation)
        dummy.COOKIE_FILE = LekeLekeeAutomation.COOKIE_FILE
        ok = dummy.save_cookies(cookies_json)

        if ok:
            count = len(_json.loads(cookies_json))
            # Check whether any auth-looking cookies are present
            names = [c.get("name", "").lower() for c in _json.loads(cookies_json)]
            AUTH_SIGNALS = ("session", "auth", "token", "connect.sid", "access",
                            "refresh", "user", "account", "logged", "remember",
                            "jwt", "sid", "lekee", "uid")
            has_auth = any(sig in n for n in names for sig in AUTH_SIGNALS)

            if count < 5 or not has_auth:
                await update.message.reply_text(
                    f"⚠️ *Only {count} cookies saved — these look like consent/CF cookies, NOT a logged-in session.*\n\n"
                    "🚨 *You must be ALREADY LOGGED IN to lekeelekee.com before exporting!*\n\n"
                    "Correct steps:\n"
                    "1. Open Chrome → go to lekeelekee.com\n"
                    "2. *Log in* with your email & password (solve Turnstile manually)\n"
                    "3. Confirm you see your *home feed* (not the login page!)\n"
                    "4. Open Cookie-Editor extension → *Export* → *Export as JSON* → Copy\n"
                    "5. Send `/cookies [paste JSON here]`\n\n"
                    f"A valid export should have *15-50+ cookies* including session/auth cookies.\n"
                    f"Names found: `{', '.join(names[:10])}`",
                    parse_mode='Markdown'
                )
                print(f"⚠️  CEO sent {count} weak cookies (no auth signal) — prompted to re-export")
            else:
                await update.message.reply_text(
                    f"✅ *{count} cookies saved successfully!*\n\n"
                    f"Auth cookies detected: `{', '.join(n for n in names if any(s in n for s in AUTH_SIGNALS))}`\n\n"
                    f"Next /generate → APPROVE will use cookie login — no Turnstile.\n"
                    f"Session typically lasts 30 days.",
                    parse_mode='Markdown'
                )
                print(f"✅ CEO saved {count} cookies via /cookies command (auth signal confirmed)")
        else:
            await update.message.reply_text(
                "❌ Invalid cookie JSON. Make sure you copied the full JSON array from Cookie-Editor.",
            )

    async def publish_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /publish_<post_id> — retry a failed publish without regenerating.

        Usage: /publish_post_1_20260227_204917
        The post must exist in approved_posts/ or pending_posts/.
        """
        if str(update.effective_user.id) != str(CEO_TELEGRAM_ID):
            return

        # Extract post_id from command text: /publish_post_1_20260227_204917
        full_text = update.message.text.strip()  # e.g. "/publish_post_1_20260227_204917"
        # Strip leading slash then 'publish_'
        remainder = full_text.lstrip("/")          # publish_post_1_20260227_204917
        if not remainder.startswith("publish_"):
            await update.message.reply_text("❌ Usage: /publish_<post_id>")
            return
        post_id = remainder[len("publish_"):]      # post_1_20260227_204917

        # Search approved_posts/ first, then pending_posts/, then registry
        approved_file = os.path.join(APPROVED_DIR, f"{post_id}.json")
        pending_file  = os.path.join(PENDING_DIR,  f"{post_id}.json")

        post = None
        if os.path.exists(approved_file):
            with open(approved_file, 'r') as f:
                post = json.load(f)
            print(f"📂 Retry: loaded {post_id} from approved_posts/")
        elif os.path.exists(pending_file):
            with open(pending_file, 'r') as f:
                post = json.load(f)
            # Move to approved so post_dual_destination archives it correctly
            os.rename(pending_file, approved_file)
            print(f"📂 Retry: loaded {post_id} from pending_posts/ → moved to approved_posts/")
        elif post_id in self._pending_registry:
            post = self._pending_registry[post_id]
            with open(approved_file, 'w') as f:
                json.dump(post, f, indent=2)
            print(f"📂 Retry: loaded {post_id} from registry → written to approved_posts/")
        else:
            await update.message.reply_text(
                f"❌ Post not found: {post_id}\n\n"
                f"It may have already been published or was never saved.\n"
                f"Use /generate to create a new post."
            )
            return

        # Confirm to CEO and kick off publish
        msg = await update.message.reply_text(
            f"🔄 *RETRYING PUBLISH...*\n\n"
            f"Day {post['day']}/36: {post['state_name']}\n\n"
            f"📤 Group → General Feed (with 5-min delay)\n"
            f"🕐 ~7 minutes total — please wait...",
            parse_mode='Markdown'
        )

        # Reuse the inline publish path via a mock query-like object
        class _FakeQuery:
            """Minimal duck-type of CallbackQuery for reuse of _publish_to_leke_leke."""
            def __init__(self, message):
                self._message = message
            async def edit_message_text(self, text, parse_mode=None):
                try:
                    await self._message.edit_text(text, parse_mode=parse_mode)
                except Exception:
                    await self._message.reply_text(text, parse_mode=parse_mode)

        fake_query = _FakeQuery(msg)
        print(f"🔄 Retry publish requested by CEO for {post_id}")
        await self._publish_to_leke_leke(fake_query, post_id, post, context)

    # ─────────────────────────────────────────────────────────────────────────
    # MODULE 4+5 — LEKEEBOT CHAT APPROVAL GATE + REPLY DISPATCHER
    # ─────────────────────────────────────────────────────────────────────────

    def _get_lekeebot_queue_path(self):
        """Lazy-load path to draft_queue.json."""
        from pathlib import Path
        return Path(__file__).parent / "intelligence_vault" / "live" / "draft_queue.json"

    def _lekeebot_load_drafts(self) -> list:
        path = self._get_lekeebot_queue_path()
        if not path.exists():
            return []
        with open(path) as f:
            return json.load(f)

    def _lekeebot_update_status(self, message_id: str, status: str, new_text: str = None):
        path = self._get_lekeebot_queue_path()
        drafts = self._lekeebot_load_drafts()
        for d in drafts:
            if d.get("message_id") == message_id:
                d["status"] = status
                if new_text:
                    d["draft_text"] = new_text
                    d["word_count"] = len(new_text.split())
                d["actioned_at"] = datetime.now(timezone.utc).isoformat()
                break
        with open(path, "w") as f:
            json.dump(drafts, f, indent=2, ensure_ascii=False)

    def _lekee_send_chat_reply(self, text: str, reply_to_id: str | None,
                               override_conv_id: str | None = None) -> dict:
        """
        Module 5/6 — Dispatch approved reply via direct API.
        Defaults to #General channel; pass override_conv_id for DMs.
        Encodes text as base64 ciphertext, optionally threads to reply_to_id.
        """
        conv_id = override_conv_id or _LEKE_CONV_ID
        # Auth
        resp = _req.post(
            f"{_BASE_URL}/api/v1/auth/login",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={"email": os.getenv("LEKE_LEKE_EMAIL", "ceo@amdsolutions007.com"),
                  "password": os.getenv("LEKE_LEKE_PASSWORD", "#@Amdmail@007")},
            timeout=20,
        )
        data = resp.json() if "application/json" in resp.headers.get("content-type","") else {}
        token = (data.get("data", {}).get("token") or data.get("token") or data.get("access_token"))
        if not token:
            raise RuntimeError(f"LekeeLekee auth failed — HTTP {resp.status_code}")

        # Send
        ciphertext = base64.b64encode(text.encode("utf-8")).decode("ascii")
        payload = {"ciphertext": ciphertext, "iv": _STATIC_IV}
        if reply_to_id and reply_to_id not in ("TEST_MSG_001", "TEST_DM_001", None):
            payload["reply_to"] = reply_to_id

        send_resp = _req.post(
            f"{_BASE_URL}/api/v1/conversations/{conv_id}/messages",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=payload,
            timeout=20,
        )
        if send_resp.status_code not in (200, 201):
            raise RuntimeError(f"Send failed — HTTP {send_resp.status_code}: {send_resp.text[:200]}")
        return send_resp.json() if "application/json" in send_resp.headers.get("content-type","") else {}

    # ── MODULE 6: Private DM Engine ───────────────────────────────────────────

    def _lekeebot_load_dm_directory(self) -> dict:
        """Load username → DM conversation ID map."""
        if not _DM_DIR_FILE.exists():
            return {}
        with open(_DM_DIR_FILE) as f:
            d = json.load(f)
        return {k: v for k, v in d.items() if not k.startswith("_")}

    def _lekeebot_resolve_dm_conv(self, username: str) -> str | None:
        """Return DM conversation ID for a username, or None."""
        clean = username.lstrip("@").strip()
        return self._lekeebot_load_dm_directory().get(clean)

    async def _handle_lekeebot_dm(self, query, data: str, context) -> None:
        """
        Module 6 — Private DM Engine.
        Routes CEO tap on [💬 SEND AS DM] to the member's private conversation.
        """
        from telegram.constants import ParseMode
        message_id = data[len(_LEKEEBOT_DM):]
        draft = next((d for d in self._lekeebot_load_drafts()
                      if d.get("message_id") == message_id), None)

        if not draft:
            await query.edit_message_text("⚠️ Draft not found — may have been actioned already.")
            return

        handle  = draft.get("sender_handle", "").lstrip("@").strip()
        name    = draft.get("sender_name", handle)
        conv_id = (draft.get("dm_conv_id")
                   or self._lekeebot_resolve_dm_conv(handle))

        if not conv_id:
            await query.edit_message_text(
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"🔇 <b>NO PRIVATE CHANNEL YET</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                f"👤 <b>{name}</b>  <code>@{handle}</code>\n\n"
                f"<i>No DM conversation exists with this member yet.\n"
                f"Use ✅ SEND IT to reply in the group, or open a DM on LekeeLekee first.</i>",
                parse_mode=ParseMode.HTML,
            )
            return

        # Instant CEO feedback — Async Callback Law
        await query.edit_message_text(
            f"⏳ <b>Sending private DM to {name}...</b>\n\n"
            f"<code>@{handle}</code>  ·  conv <code>{conv_id[:8]}…</code>",
            parse_mode=ParseMode.HTML,
        )
        asyncio.create_task(self._lekeebot_dm_dispatch_task(query, draft, conv_id))

    async def _lekeebot_dm_dispatch_task(self, query, draft: dict, conv_id: str) -> None:
        """Background task: dispatch reply to DM conversation (Async Callback Law compliant)."""
        from telegram.constants import ParseMode
        name   = draft.get("sender_name", "")
        handle = draft.get("sender_handle", "")
        try:
            result  = self._lekee_send_chat_reply(
                draft["draft_text"],
                reply_to_id=None,        # DMs don't thread
                override_conv_id=conv_id,
            )
            post_id = result.get("id", result.get("data", {}).get("id", "sent"))
            self._lekeebot_update_status(draft["message_id"], "sent_dm")
            await query.edit_message_text(
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"💬 <b>PRIVATE DM DELIVERED</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                f"👤 <b>{name}</b>  <code>{handle}</code>\n"
                f"🏷️  {draft.get('lead_tag','')}\n"
                f"🔐 Sent via private 1-on-1 channel\n"
                f"🆔 Post ID: <code>{str(post_id)[:40]}</code>\n\n"
                f"<i>Message delivered privately · {datetime.now(timezone.utc).strftime('%H:%M UTC')}</i>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━",
                parse_mode=ParseMode.HTML,
            )
            print(f"[MODULE6] 💬 DM sent → @{handle} | conv={conv_id[:8]} | post_id={post_id}")
        except Exception as exc:
            await query.edit_message_text(
                f"❌ <b>DM DISPATCH FAILED</b>\n\n"
                f"<code>{str(exc)[:300]}</code>\n\n"
                f"<i>Tap ✅ SEND IT to post in group instead.</i>",
                parse_mode=ParseMode.HTML,
            )
            print(f"[MODULE6] ❌ DM dispatch failed for @{handle}: {exc}")

    async def _handle_lekeebot_callback(self, query, data: str, context):
        """Handle SEND: / SKIP: / EDIT: callbacks from Module 4 draft cards."""
        from telegram.constants import ParseMode

        if data.startswith(_LEKEEBOT_SEND):
            message_id = data[len(_LEKEEBOT_SEND):]
            draft = next((d for d in self._lekeebot_load_drafts()
                          if d.get("message_id") == message_id), None)
            if not draft:
                await query.edit_message_text("⚠️ Draft not found — may have been actioned already.")
                return

            # Instant CEO feedback — Async Callback Law
            await query.edit_message_text(
                f"⏳ <b>Dispatching to LekeeLekee...</b>\n\n"
                f"👤 {draft.get('sender_name','')}  <code>{draft.get('sender_handle','')}</code>\n"
                f"🏷️ {draft.get('lead_tag','')}",
                parse_mode=ParseMode.HTML,
            )
            asyncio.create_task(self._lekeebot_dispatch_task(query, draft))

        elif data.startswith(_LEKEEBOT_SKIP):
            message_id = data[len(_LEKEEBOT_SKIP):]
            draft = next((d for d in self._lekeebot_load_drafts()
                          if d.get("message_id") == message_id), None)
            sender = draft.get("sender_handle", "?") if draft else "?"
            self._lekeebot_update_status(message_id, "skipped")
            await query.edit_message_text(
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"⏭️ <b>SKIPPED</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                f"👤 <code>{sender}</code>\n"
                f"<i>Draft archived. No reply sent.</i>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━",
                parse_mode=ParseMode.HTML,
            )
            print(f"[LEKEEBOT] ⏭️  Skipped draft for {sender}")

        elif data.startswith(_LEKEEBOT_EDIT):
            message_id = data[len(_LEKEEBOT_EDIT):]
            draft = next((d for d in self._lekeebot_load_drafts()
                          if d.get("message_id") == message_id), None)
            if not draft:
                await query.edit_message_text("⚠️ Draft not found.")
                return
            # Store in user_data so text handler picks it up
            context.user_data["lekeebot_edit"] = {
                "message_id": message_id,
                "draft":      draft,
            }
            await query.edit_message_text(
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"✏️ <b>EDIT MODE — {draft.get('sender_handle','')}</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                f"<b>Current draft:</b>\n"
                f"<i>{draft.get('draft_text','')[:600]}</i>\n\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"📝 <b>Type your corrected reply now.\nSend /cancel to abort.</b>",
                parse_mode=ParseMode.HTML,
            )

    async def _lekeebot_dispatch_task(self, query, draft: dict):
        """Background task: dispatch reply, update card. Async Callback Law compliant."""
        from telegram import InlineKeyboardMarkup, InlineKeyboardButton
        from telegram.constants import ParseMode
        try:
            result  = self._lekee_send_chat_reply(draft["draft_text"], draft.get("reply_to_id",""))
            post_id = result.get("id", result.get("data", {}).get("id", "sent"))

            await query.edit_message_text(
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"✅ <b>DISPATCHED TO #GENERAL</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                f"👤 <b>{draft.get('sender_name','')}</b>  <code>{draft.get('sender_handle','')}</code>\n"
                f"🏷️  {draft.get('lead_tag','')}\n"
                f"🆔 Post ID: <code>{str(post_id)[:40]}</code>\n\n"
                f"<i>Threaded reply posted · {datetime.now(timezone.utc).strftime('%H:%M UTC')}</i>\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━",
                parse_mode=ParseMode.HTML,
            )
            self._lekeebot_update_status(draft["message_id"], "sent")
            print(f"[LEKEEBOT] ✅ Sent reply {draft.get('sender_handle')} → post_id={post_id}")

        except Exception as exc:
            from telegram import InlineKeyboardMarkup, InlineKeyboardButton
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("✅  SEND IT",  callback_data=f"SEND:{draft['message_id']}"),
                InlineKeyboardButton("⏭️  SKIP",    callback_data=f"SKIP:{draft['message_id']}"),
            ]])
            await query.edit_message_text(
                f"❌ <b>DISPATCH FAILED</b>\n\n"
                f"<code>{str(exc)[:300]}</code>\n\n"
                f"<i>Tap SEND IT to retry or SKIP to discard.</i>",
                parse_mode=ParseMode.HTML,
                reply_markup=keyboard,
            )
            print(f"[LEKEEBOT] ❌ Dispatch failed for {draft.get('sender_handle')}: {exc}")

    async def _handle_lekeebot_edit_input(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Intercepts CEO's plain-text reply when EDIT mode is active."""
        if str(update.effective_user.id) != str(CEO_TELEGRAM_ID):
            return

        edit_ctx = context.user_data.pop("lekeebot_edit", None)
        if not edit_ctx:
            return  # not in edit mode — fall through to other handlers

        new_text   = update.message.text.strip()
        draft      = edit_ctx["draft"]
        message_id = edit_ctx["message_id"]

        # Save updated draft
        self._lekeebot_update_status(message_id, "pending_approval", new_text)
        draft["draft_text"] = new_text

        # Re-send the revised card with action buttons
        from telegram.constants import ParseMode
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("✅  SEND IT",  callback_data=f"SEND:{message_id}"),
            InlineKeyboardButton("✏️  EDIT",   callback_data=f"EDIT:{message_id}"),
            InlineKeyboardButton("⏭️  SKIP",    callback_data=f"SKIP:{message_id}"),
        ]])
        await update.message.reply_text(
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"✏️ <b>REVISED DRAFT</b>  <code>{draft.get('sender_handle','')}</code>\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"{new_text}\n\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"<i>{len(new_text.split())} words · ready to send</i>",
            parse_mode=ParseMode.HTML,
            reply_markup=keyboard,
        )
        print(f"[LEKEEBOT] ✏️  Edit received for {draft.get('sender_handle')} — card re-queued")

    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle approval/rejection button clicks (36-states posts + AI draft replies + LekeeBot)"""
        query = update.callback_query
        await query.answer()

        data = query.data or ""

        # ── BRANCH C: LekeeBot Module 4+6 — Chat Draft Approval + Private DM Engine ─
        if (data.startswith(_LEKEEBOT_SEND) or data.startswith(_LEKEEBOT_SKIP)
                or data.startswith(_LEKEEBOT_EDIT)):
            await self._handle_lekeebot_callback(query, data, context)
            return
        if data.startswith(_LEKEEBOT_DM):
            await self._handle_lekeebot_dm(query, data, context)
            return

        # ── BRANCH A: Sync Engine Draft Reply (dreply_approve_ / dreply_skip_) ──
        if data.startswith(_DREPLY_PREFIX):
            # callback_data format: dreply_approve_<fingerprint>  OR  dreply_skip_<fingerprint>
            remainder  = data[len(_DREPLY_PREFIX):]          # e.g. "approve_abc123..."
            sub_action, fingerprint = remainder.split("_", 1)  # "approve" / "skip", "abc123..."

            draft = self._get_draft_by_fingerprint(fingerprint)

            # ── Cross-container fallback: parse draft from message text ────────
            # amd-sync-engine and telegram-approval-bot run in separate Railway
            # containers with separate filesystems. When amd-sync-engine sends
            # the Telegram prompt directly, no shared JSON file exists here.
            # Parse canonical sections from the v2 message format.
            if not draft and query.message and query.message.text:
                msg_text = query.message.text
                # Extract author
                author = "unknown"
                m_author = re.search(r"From:\s+(\S+)\s+\|", msg_text)
                if m_author:
                    author = m_author.group(1)
                # Extract AI draft between canonical v2 headers
                m_draft = re.search(
                    r"🧠 AI DRAFT \[CEO VOICE\]:\n(.*?)\n\nTap ✅",
                    msg_text, re.DOTALL
                )
                # Extract message_id for threaded reply from v2 header
                message_id = ""
                m_tid = re.search(r"🧵 Threaded reply to:\s*(\S+)", msg_text)
                if m_tid:
                    message_id = m_tid.group(1).strip()
                # Extract post_url
                post_url = ""
                m_url = re.search(r"🔗 Link:\s*(https?://\S+)", msg_text)
                if m_url:
                    post_url = m_url.group(1).strip()

                if m_draft:
                    ai_text = m_draft.group(1).strip()
                    draft = {
                        "fingerprint":   fingerprint,
                        "author":        author,
                        "ai_draft":      ai_text,
                        "their_message": "",
                        "score":         0,
                        "message_id":    message_id,   # v2 — threaded reply
                        "post_url":      post_url,     # v2 — source link
                    }
                    print(f"📩 Draft parsed from message text (cross-container) — {author} "
                          f"fp={fingerprint[:8]} msg_id={message_id[:12] or 'none'}")

            if not draft:
                await query.edit_message_text(
                    "❌ Draft not found — it may have already been actioned."
                )
                return

            if sub_action == "approve":
                await query.edit_message_text(
                    f"🔄 *POSTING REPLY...*\n\n"
                    f"👤 To: {draft.get('author', 'unknown')}\n"
                    f"⏳ Contacting LekeeLekee API...",
                    parse_mode="Markdown",
                )
                # Async Callback Law: fire-and-forget, already returned
                asyncio.create_task(
                    self._publish_draft_reply(query, fingerprint, draft)
                )

            elif sub_action == "skip":
                self._update_draft_status(fingerprint, "SKIP")
                await query.edit_message_text(
                    f"❌ *SKIPPED*\n\nDraft for {draft.get('author', 'unknown')} discarded.",
                    parse_mode="Markdown",
                )
                print(f"❌ Draft skipped — {draft.get('author')} (fp={fingerprint[:8]})")
            return

        # ── BRANCH B: 36-States post approval (existing flow) ─────────────────
        action, post_id = data.split('_', 1)
        post_file = os.path.join(PENDING_DIR, f"{post_id}.json")

        # Load from disk file, or fall back to registry (survives redeploys)
        if os.path.exists(post_file):
            with open(post_file, 'r') as f:
                post = json.load(f)
        elif post_id in self._pending_registry:
            post = self._pending_registry[post_id]
            print(f"📂 Loaded post {post_id} from registry (file was missing)")
        else:
            await query.edit_message_text("❌ Post not found (already processed or bot was redeployed before it was saved).")
            return
            
        if action == "approve":
            # Move to approved archive immediately (guard: file may only be in registry)
            approved_file = os.path.join(APPROVED_DIR, f"{post_id}.json")
            if os.path.exists(post_file):
                os.rename(post_file, approved_file)
            else:
                with open(approved_file, 'w') as f:
                    json.dump(post, f, indent=2)
            self._remove_from_registry(post_id)

            # ── Instant UI feedback — callback must return in <3s or Telegram retries ──
            await query.edit_message_text(
                f"🔄 *PROCESSING STRIKE...*\n\n"
                f"Day {post['day']}/36: *{post['state_name']}*\n\n"
                f"📤 Sending to African Tech Ecosystem group...\n"
                f"⏳ Please wait — this takes up to 30 seconds.",
                parse_mode='Markdown'
            )

            print(f"✅ Post {post_id} approved by CEO — firing async publish task")

            # ── Fire-and-forget: publish runs in background, UI already updated ──
            asyncio.create_task(
                self._publish_to_leke_leke(query, post_id, post, context)
            )
                
        elif action == "reject":
            # Move to rejected
            rejected_file = os.path.join(REJECTED_DIR, f"{post_id}.json")
            os.rename(post_file, rejected_file) if os.path.exists(post_file) else None
            self._remove_from_registry(post_id)
            
            await query.edit_message_text(
                f"❌ *REJECTED*\n\n"
                f"Day {post['day']}/36: {post['state_name']}\n\n"
                f"Post discarded. Use /generate to create a new one.",
                parse_mode='Markdown'
            )

            print(f"❌ Post {post_id} rejected by CEO")

    async def _publish_to_leke_leke(
        self,
        query,
        post_id: str,
        post: dict,
        context,
    ):
        """Direct API Strike — pure requests, no browser / Selenium."""
        email    = os.getenv("LEKE_LEKE_EMAIL", "")
        password = os.getenv("LEKE_LEKE_PASSWORD", "")

        if not email or not password:
            await query.edit_message_text(
                f"⚠️ *PUBLISH SKIPPED*\n\n"
                f"LEKE_LEKE_EMAIL or LEKE_LEKE_PASSWORD not set.\n"
                f"Set credentials in Railway → Variables and redeploy.",
                parse_mode='Markdown'
            )
            return

        loop     = asyncio.get_event_loop()
        caption  = post.get("caption", "")
        day      = post.get("day", 0)
        state_nm = post.get("state_name", "")
        capital  = post.get("capital", "")

        def _run_api() -> tuple:
            """Blocking requests calls — runs in executor thread."""
            try:
                session, _token, _uid = _lekee_login(email, password)
                result  = _lekee_post_group(session, caption)
                lk_id   = (
                    result.get("data", {}).get("post", {}).get("public_id", "")
                    or result.get("data", {}).get("public_id", "unknown")
                )
                return True, lk_id, None
            except Exception as exc:
                return False, None, str(exc)

        with ThreadPoolExecutor(max_workers=1) as pool:
            ok, lk_post_id, err = await loop.run_in_executor(pool, _run_api)

        if ok:
            _update_state_tracker(day, state_nm, capital, lk_post_id)
            await query.edit_message_text(
                f"✅ *PUBLISHED!*\n\n"
                f"Day {day}/36: {state_nm}\n\n"
                f"🏘️ African Tech Ecosystem — LIVE\n"
                f"🆔 Post ID: `{lk_post_id}`\n\n"
                f"🟢 {state_nm.upper()} IS LIVE",
                parse_mode='Markdown'
            )
            print(f"🟢 {state_nm} published — lekee post_id: {lk_post_id}")
        else:
            safe_err = (err or "Unknown error").replace('<', '').replace('>', '')
            await query.edit_message_text(
                f"❌ PUBLISH FAILED\n\n"
                f"Day {day}/36: {state_nm}\n\n"
                f"Error: {safe_err}\n\n"
                f"Retry with: /publish_{post_id}"
            )
            print(f"❌ Publish failed for {post_id}: {err}")
            
    async def _daily_generate_job(self, context: ContextTypes.DEFAULT_TYPE):
        """
        Daily 09:00 UTC job — auto-generates next state post & sends approval
        prompt to CEO without waiting for a /generate command.
        """
        print("⏰ Daily scheduler triggered — generating next post for CEO review")
        ceo_id = int(CEO_TELEGRAM_ID) if CEO_TELEGRAM_ID else None
        if not ceo_id:
            print("⚠️  CEO_TELEGRAM_ID not set — skipping daily job")
            return

        try:
            # ── Generate content ───────────────────────────────────────────────
            post = self.content_gen.generate_next_post()
            status = self.content_gen.get_campaign_status()

            # ── Generate graphic ───────────────────────────────────────────────
            graphic_path = await self.graphic_gen.generate_state_graphic(
                state_name=post['state_name'],
                day_number=post['day'],
                caption=post['caption'],
                zone=post.get('zone', ''),
                capital=post.get('capital', '')
            )
            post['graphic_path'] = graphic_path

            # ── Save to pending ────────────────────────────────────────────────
            post_id   = f"post_{post['day']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            post_file = os.path.join(PENDING_DIR, f"{post_id}.json")
            with open(post_file, 'w') as f:
                json.dump(post, f, indent=2)
            self._pending_registry[post_id] = post
            self._save_registry()

            # ── Progress bar ───────────────────────────────────────────────────
            done       = status['completed']
            total      = 36
            pct        = round(done / total * 100, 1)
            filled     = int(done / total * 20)
            bar        = "█" * filled + "░" * (20 - filled)

            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton(f"✅ APPROVE — POST DAY {post['day']}", callback_data=f"approve_{post_id}"),
                InlineKeyboardButton("❌ REJECT", callback_data=f"reject_{post_id}"),
            ]])

            header = (
                f"🔔 *DAILY POST READY FOR APPROVAL*\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                f"📅 Day {post['day']}/{total}: *{post['state_name']}*\n"
                f"📍 Capital: {post.get('capital', 'N/A')}\n"
                f"🌍 Zone: {post.get('zone', 'N/A')}\n\n"
                f"📊 Progress: `[{bar}]` {pct}%  ({done}/{total} states)\n"
                f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                f"*Caption Preview:*\n```\n{post['caption'][:500]}\n```"
            )

            with open(graphic_path, 'rb') as photo:
                await context.bot.send_photo(
                    chat_id=ceo_id,
                    photo=photo,
                    caption=header,
                    parse_mode='Markdown',
                    reply_markup=keyboard,
                )

            print(f"✅ Daily prompt sent to CEO — Day {post['day']}: {post['state_name']}")

            # Record today's fire date so startup catch-up skips re-firing
            try:
                flag = os.path.join(os.path.dirname(__file__), ".last_daily_fire")
                with open(flag, "w") as fh:
                    fh.write(datetime.now(timezone.utc).strftime("%Y-%m-%d"))
            except Exception:
                pass

        except Exception as e:
            print(f"❌ Daily job failed: {e}")
            try:
                await context.bot.send_message(
                    chat_id=ceo_id,
                    text=f"⚠️ Daily auto-generation failed:\n`{str(e)[:300]}`\n\nSend /generate to retry manually.",
                    parse_mode='Markdown',
                )
            except Exception:
                pass

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # SYNC ENGINE DRAFT APPROVAL BRIDGE (added 2026-03-02)
    # Polls intelligence_vault/live/ai_reply_drafts.json every 5 min.
    # For each PENDING draft the AI engine wrote, fires a Telegram prompt
    # to the CEO. One tap ✅ → posts to LekeeLekee. ❌ SKIP → discards.
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def _read_drafts_file(self) -> list[dict]:
        """Read ai_reply_drafts.json. Returns list of draft dicts."""
        if not DRAFTS_FILE.exists():
            return []
        try:
            with open(DRAFTS_FILE) as f:
                return json.load(f).get("drafts", [])
        except Exception as e:
            print(f"⚠️  Could not read drafts file: {e}")
            return []

    def _write_drafts_file(self, drafts: list[dict]):
        """Write the full drafts list back to disk atomically."""
        try:
            VAULT_LIVE_DIR.mkdir(parents=True, exist_ok=True)
            data = {}
            if DRAFTS_FILE.exists():
                try:
                    with open(DRAFTS_FILE) as f:
                        data = json.load(f)
                except Exception:
                    pass
            data["drafts"]      = drafts
            data["last_updated"] = datetime.now(timezone.utc).isoformat()
            with open(DRAFTS_FILE, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠️  Could not write drafts file: {e}")

    def _update_draft_status(self, fingerprint: str, status: str):
        """Set status field on a specific draft by fingerprint."""
        drafts = self._read_drafts_file()
        for d in drafts:
            if d.get("fingerprint") == fingerprint:
                d["status"] = status
                break
        self._write_drafts_file(drafts)

    def _get_draft_by_fingerprint(self, fingerprint: str) -> dict | None:
        """Return a single draft dict by its fingerprint, or None."""
        for d in self._read_drafts_file():
            if d.get("fingerprint") == fingerprint:
                return d
        return None

    async def _send_draft_approval_prompt(self, draft: dict, ceo_id: int, context):
        """
        Send a draft reply to CEO as a Telegram approval prompt.
        Buttons: ✅ POST IT  |  ❌ SKIP
        """
        fp      = draft.get("fingerprint", "")[:32]   # keep callback_data ≤ 64 bytes
        author  = draft.get("author",        "unknown")
        score   = draft.get("score",         0)
        reasons = ", ".join(draft.get("reasons", []))[:100]
        their   = (draft.get("their_message") or "").strip()[:300]
        ai_text = (draft.get("ai_draft")      or "").strip()

        message = (
            f"💬 *SYNC ENGINE — DRAFT REPLY*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"👤 *From:* {author}  |  🎯 Score: {score}/100\n"
            f"🔍 Signals: `{reasons}`\n\n"
            f"📨 *Their message:*\n"
            f"```\n{their}\n```\n\n"
            f"🧠 *AI Draft (CEO Voice):*\n"
            f"```\n{ai_text[:600]}\n```\n\n"
            f"_Tap ✅ to post this reply to LekeeLekee, or ❌ to skip._"
        )
        keyboard = InlineKeyboardMarkup([[
            InlineKeyboardButton("✅ POST IT",  callback_data=f"dreply_approve_{fp}"),
            InlineKeyboardButton("❌ SKIP",     callback_data=f"dreply_skip_{fp}"),
        ]])
        try:
            await context.bot.send_message(
                chat_id    = ceo_id,
                text       = message,
                parse_mode = "Markdown",
                reply_markup = keyboard,
            )
            print(f"📱 Draft prompt sent to CEO — {author} (score={score}, fp={fp})")
        except Exception as e:
            print(f"⚠️  Could not send draft prompt: {e}")

    async def _draft_watchdog_job(self, context):
        """
        Periodic job (every 5 min) — checks ai_reply_drafts.json for PENDING
        drafts written by amd_sync_engine and fires CEO approval prompts.
        """
        ceo_id = int(CEO_TELEGRAM_ID) if CEO_TELEGRAM_ID else None
        if not ceo_id:
            return
        if not DRAFTS_FILE.exists():
            return

        drafts  = self._read_drafts_file()
        pending = [d for d in drafts if d.get("status") == "PENDING"
                   and d.get("fingerprint")]
        if not pending:
            return

        print(f"🔔 Draft watchdog: {len(pending)} new PENDING draft(s) found")
        updated = False
        for draft in pending:
            await self._send_draft_approval_prompt(draft, ceo_id, context)
            # Mark as SENT_FOR_REVIEW so watchdog doesn't re-send on next cycle
            draft["status"] = "SENT_FOR_REVIEW"
            updated = True

        if updated:
            self._write_drafts_file(drafts)

    async def _publish_draft_reply(self, query, fingerprint: str, draft: dict):
        """
        Direct API Strike: post the AI draft reply to LekeeLekee group.
        Called when CEO taps ✅ on a draft approval prompt.
        """
        email    = os.getenv("LEKE_LEKE_EMAIL", "")
        password = os.getenv("LEKE_LEKE_PASSWORD", "")

        if not email or not password:
            await query.edit_message_text(
                "⚠️ LEKE_LEKE_EMAIL or LEKE_LEKE_PASSWORD not set in Railway — "
                "cannot post reply."
            )
            return

        author   = draft.get("author", "unknown")
        ai_text  = draft.get("ai_draft", "").strip()
        # v2: threaded reply — use the original message's public_id as parent_id
        parent_id = (draft.get("message_id") or "").strip() or None

        if not ai_text:
            await query.edit_message_text(f"❌ Draft is empty for {author} — nothing to post.")
            return

        loop = asyncio.get_event_loop()

        def _do_post():
            session, _tok, _uid = _lekee_login(email, password)
            return _lekee_post_group(session, ai_text, parent_id=parent_id)

        try:
            result = await loop.run_in_executor(None, _do_post)
            lk_id  = (
                result.get("data", {}).get("post", {}).get("public_id", "")
                or result.get("data", {}).get("public_id", "unknown")
            )
            # Mark as SENT
            self._update_draft_status(fingerprint, "SENT")

            thread_note = f"🧵 Threaded reply to: `{parent_id}`\n" if parent_id else "📢 Standalone post\n"
            await query.edit_message_text(
                f"✅ *REPLY POSTED!*\n\n"
                f"👤 To: {author}\n"
                f"{thread_note}"
                f"🆔 LekeeLekee Post ID: `{lk_id}`\n\n"
                f"_{ai_text[:200]}_",
                parse_mode="Markdown",
            )
            print(f"✅ Draft reply posted — author={author}, post_id={lk_id}, "
                  f"parent_id={parent_id or 'none'}")

        except Exception as e:
            self._update_draft_status(fingerprint, "PENDING")   # Re-queue on error
            safe_err = str(e).replace('<', '').replace('>', '')[:200]
            await query.edit_message_text(
                f"❌ *PUBLISH FAILED*\n\nError: {safe_err}\n\nStatus reset to PENDING.",
                parse_mode="Markdown",
            )
            print(f"❌ Draft reply publish failed: {e}")

    def run(self):
        """Start the Telegram bot"""
        if not TELEGRAM_BOT_TOKEN:
            print("❌ TELEGRAM_BOT_TOKEN not set in environment variables")
            return
            
        self.app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

        # ── Daily 08:00 UTC = 09:00 WAT scheduler ────────────────────────────
        # WAT = UTC+1 → fire at 08:00 UTC so CEO sees it at 09:00 AM Lagos time
        if self.app.job_queue:
            self.app.job_queue.run_daily(
                self._daily_generate_job,
                time=dt_time(hour=8, minute=0, second=0, tzinfo=timezone.utc),
                name="daily_36_states_post",
            )
            print("📅 Daily scheduler registered: 08:00 UTC (09:00 WAT)")

            # ── Startup catch-up: fire immediately if we're past 08:00 UTC today
            # and today's prompt hasn't been sent yet (handles Railway restarts)
            now_utc = datetime.now(timezone.utc)
            fired_today_flag = os.path.join(
                os.path.dirname(__file__), ".last_daily_fire"
            )
            last_fire_date = ""
            if os.path.exists(fired_today_flag):
                try:
                    last_fire_date = open(fired_today_flag).read().strip()
                except Exception:
                    pass
            today_str = now_utc.strftime("%Y-%m-%d")
            if now_utc.hour >= 8 and last_fire_date != today_str:
                print(f"⚡ Startup catch-up: past 08:00 UTC, last fire={last_fire_date!r} → scheduling immediate job")
                self.app.job_queue.run_once(
                    self._daily_generate_job, when=10,
                    name="startup_catchup"
                )
            else:
                print(f"✅ Catch-up not needed (now={now_utc.strftime('%H:%M UTC')}, last_fire={last_fire_date!r})")
        else:
            print("⚠️  JobQueue unavailable — install python-telegram-bot[job-queue]")
        # ─────────────────────────────────────────────────────────────────────
        
        # Commands
        self.app.add_handler(CommandHandler("start", self.start_command))
        self.app.add_handler(CommandHandler("status", self.status_command))
        self.app.add_handler(CommandHandler("queue", self.queue_command))
        self.app.add_handler(CommandHandler("generate", self.generate_command))
        self.app.add_handler(CommandHandler("otp", self.otp_command))
        self.app.add_handler(CommandHandler("cookies", self.cookies_command))

        # Retry handler: /publish_<post_id>  (dynamic command — uses regex message handler)
        from telegram.ext import MessageHandler, filters as tg_filters
        self.app.add_handler(
            MessageHandler(
                tg_filters.TEXT & tg_filters.Regex(r"^/publish_"),
                self.publish_command,
            )
        )

        # LekeeBot EDIT text handler — fires when CEO is in edit mode (group=1, lower priority)
        self.app.add_handler(
            MessageHandler(
                tg_filters.TEXT & ~tg_filters.COMMAND & tg_filters.User(int(CEO_TELEGRAM_ID) if CEO_TELEGRAM_ID else 0),
                self._handle_lekeebot_edit_input,
            ),
            group=1,
        )

        # Buttons
        self.app.add_handler(CallbackQueryHandler(self.button_callback))

        # ── Draft Reply Watchdog — polls AI draft vault every 5 minutes ──────
        if self.app.job_queue:
            self.app.job_queue.run_repeating(
                self._draft_watchdog_job,
                interval=300,    # 5 minutes — same cadence as sync engine poll
                first=30,        # First check 30s after boot (sync engine may need time)
                name="draft_reply_watchdog",
            )
            print("🔔 Draft reply watchdog armed — checks every 5 min")
        # ─────────────────────────────────────────────────────────────────────

        print("🤖 Telegram Approval Bot starting...")
        print(f"📱 CEO Telegram ID: {CEO_TELEGRAM_ID}")
        print("✅ Ready to receive commands")

        # ── NUCLEAR 409 FIX + QUEUE DRAIN ──────────────────────────────────
        # STEP A: deleteWebhook (clears any webhook queue, kills stale connections)
        # STEP B: getUpdates offset=-1 (fast-forwards the getUpdates queue pointer
        #          so ALL historical pending /generate commands are silently discarded)
        # STEP C: sleep 8s so Railway can fully kill the old container
        # STEP D: run_polling(drop_pending_updates=True) as a final safety net
        token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        if token:
            base = f"https://api.telegram.org/bot{token}"

            # STEP A — deleteWebhook
            try:
                payload = urllib.parse.urlencode({"drop_pending_updates": "true"}).encode()
                req = urllib.request.Request(f"{base}/deleteWebhook", data=payload)
                with urllib.request.urlopen(req, timeout=10) as r:
                    result = json.loads(r.read())
                print(f"🔌 deleteWebhook: {result}")
            except Exception as e:
                print(f"⚠️  deleteWebhook failed (non-fatal): {e}")

            # STEP B — getUpdates offset=-1 to hard-drain the long-poll queue
            try:
                flush_url = f"{base}/getUpdates?offset=-1&limit=1&timeout=0"
                req2 = urllib.request.Request(flush_url)
                with urllib.request.urlopen(req2, timeout=10) as r2:
                    flush_resp = json.loads(r2.read())
                queued = flush_resp.get("result", [])
                if queued:
                    last_id = queued[-1]["update_id"]
                    # Acknowledge past that ID so Telegram drops everything before it
                    ack_url = f"{base}/getUpdates?offset={last_id + 1}&limit=1&timeout=0"
                    urllib.request.urlopen(ack_url, timeout=10).close()
                    print(f"🗑️  Queue flushed: discarded all updates up to ID {last_id}")
                else:
                    print("🗑️  Queue already empty — nothing to drain")
            except Exception as e:
                print(f"⚠️  Queue drain failed (non-fatal): {e}")

            print("⏳ Sleeping 8s to let old getUpdates connections die...")
            time.sleep(8)
        # ─────────────────────────────────────────────────────────────────────

        self.app.run_polling(drop_pending_updates=True)


def main():
    """Main entry point"""
    print("=" * 80)
    print("TELEGRAM APPROVAL BOT")
    print("=" * 80)
    print()
    
    bot = TelegramApprovalBot()
    bot.run()


if __name__ == "__main__":
    main()
