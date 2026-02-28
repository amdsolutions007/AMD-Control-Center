"""
Telegram Approval Bot for Ghost Writer
Human-in-the-Loop: CEO reviews and approves posts before they go live
"""

import os
import json
import asyncio
import threading
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from content_generator import ContentGenerator
from graphic_generator import GraphicGenerator
from leke_leke_browser_automation import LekeLekeeAutomation

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
CEO_TELEGRAM_ID = os.getenv('CEO_TELEGRAM_ID')  # Your Telegram user ID

# Directories
PENDING_DIR = "pending_posts"
APPROVED_DIR = "approved_posts"
REJECTED_DIR = "rejected_posts"
PENDING_REGISTRY = "pending_posts.json"  # survives redeploys

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
        self._2fa_event: threading.Event = None
        self._2fa_code: str = None
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

    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle approval/rejection button clicks"""
        query = update.callback_query
        await query.answer()
        
        action, post_id = query.data.split('_', 1)
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
            await query.edit_message_text(
                f"🚀 *PUBLISHING TO LEKEELEKEE...*\n\n"
                f"Day {post['day']}/36: {post['state_name']}\n\n"
                f"📤 Step 1 — Group: African Tech Ecosystem (full caption)\n"
                f"⏳ Step 2 — 5-minute safety delay\n"
                f"📤 Step 3 — General Feed (slim caption <490 chars)\n\n"
                f"🕐 Total time: ~7 minutes — sit tight!",
                parse_mode='Markdown'
            )

            print(f"✅ Post {post_id} approved by CEO — starting inline publish")
            await self._publish_to_leke_leke(query, post_id, post, context)
                
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
        """Run Selenium posting in a thread executor so it doesn't block the bot."""
        email    = os.getenv("LEKE_LEKE_EMAIL", "")
        password = os.getenv("LEKE_LEKE_PASSWORD", "")

        if not email or not password:
            await query.edit_message_text(
                f"⚠️ *PUBLISH SKIPPED*\n\n"
                f"LEKE_LEKE_EMAIL or LEKE_LEKE_PASSWORD not set in environment.\n"
                f"Post saved to approved_posts/ — set credentials and redeploy.",
                parse_mode='Markdown'
            )
            return

        loop = asyncio.get_event_loop()
        bot_instance = context.bot  # ✅ correct in python-telegram-bot v20

        def _run_selenium(post_data: dict) -> tuple:
            """Synchronous Selenium block — runs inside ThreadPoolExecutor.
            Returns (ok: bool, err: str|None, screenshot_path: str|None)"""

            # ── 2FA plumbing: threading.Event bridges Selenium thread → asyncio ──
            ev = threading.Event()
            self._2fa_event = ev
            self._2fa_code = None

            def two_factor_callback(prompt_msg: str) -> str:
                """Called by Selenium when 2FA screen detected.
                Notifies CEO via Telegram, blocks until /otp code received (max 2 min)."""
                asyncio.run_coroutine_threadsafe(
                    bot_instance.send_message(
                        chat_id=int(CEO_TELEGRAM_ID),
                        text=prompt_msg,
                        parse_mode='Markdown',
                    ),
                    loop,
                )
                ev.wait(timeout=120)
                return self._2fa_code or ""

            screenshot_out = "failed_login.png"
            browser = LekeLekeeAutomation(
                email, password, headless=True,
                two_factor_callback=two_factor_callback,
            )
            try:
                if not browser.start_browser():
                    return False, "Browser failed to start", None

                if not browser.login(screenshot_path=screenshot_out):
                    ss = screenshot_out if os.path.exists(screenshot_out) else None
                    return False, "Leke Leke login failed", ss

                success = browser.post_dual_destination(post_data)
                if success:
                    browser.archive_posted(post_id, post_data)
                    self._remove_from_registry(post_id)
                return success, None, None
            except Exception as exc:
                return False, str(exc), None
            finally:
                browser.close()
                self._2fa_event = None
                self._2fa_code = None

        with ThreadPoolExecutor(max_workers=1) as pool:
            ok, err, screenshot = await loop.run_in_executor(pool, _run_selenium, post)

        if ok:
            await query.edit_message_text(
                f"✅ *SUCCESSFULLY PUBLISHED!*\n\n"
                f"Day {post['day']}/36: {post['state_name']}\n\n"
                f"🏘️ African Tech Ecosystem group — LIVE\n"
                f"📰 General Feed (slim caption) — LIVE\n\n"
                f"🟢 Both destinations confirmed.",
                parse_mode='Markdown'
            )
            print(f"🟢 Post {post_id} published to LekeeLekee")
        else:
            # No parse_mode — err and post_id may contain underscores that break Markdown
            safe_err = (err or 'Unknown').replace('<', '').replace('>', '')
            await query.edit_message_text(
                f"❌ PUBLISH FAILED\n\n"
                f"Day {post['day']}/36: {post['state_name']}\n\n"
                f"Error: {safe_err}\n\n"
                f"━━━━━━━━━━━━━━━━\n"
                f"� ROOT CAUSE: Railway datacenter IP is Cloudflare-blocked.\n"
                f"Cookies alone can't fix this — the IP is blocked at network level.\n\n"
                f"✅ PERMANENT FIX — Residential Proxy (5 min setup):\n"
                f"1. Sign up FREE at webshare.io → Proxies → Residential\n"
                f"2. Download proxy list → copy one line: host:port:user:pass\n"
                f"3. In Railway dashboard → telegram-approval-bot → Variables:\n"
                f"   LEKE_LEKE_PROXY = http://user:pass@host:port\n"
                f"4. Redeploy (auto-triggers on var save)\n\n"
                f"Then retry with: /publish_{post_id}"
            )
            # ── Send screenshot to CEO if login failed ────────────────────────
            if screenshot and os.path.exists(screenshot):
                try:
                    with open(screenshot, 'rb') as photo_f:
                        await bot_instance.send_photo(
                            chat_id=int(CEO_TELEGRAM_ID),
                            photo=photo_f,
                            caption="📸 Login failure screenshot — this is exactly what the browser saw on LekeeLekee",
                        )
                    print("📸 Failure screenshot sent to CEO")
                except Exception as ss_err:
                    print(f"ℹ️  Could not send screenshot: {ss_err!r}")
            print(f"❌ Publish failed for {post_id}: {err}")
            
    def run(self):
        """Start the Telegram bot"""
        if not TELEGRAM_BOT_TOKEN:
            print("❌ TELEGRAM_BOT_TOKEN not set in environment variables")
            return
            
        self.app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
        
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

        # Buttons
        self.app.add_handler(CallbackQueryHandler(self.button_callback))
        
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
