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

    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle approval/rejection button clicks"""
        query = update.callback_query
        await query.answer()
        
        action, post_id = query.data.split('_', 1)
        post_file = os.path.join(PENDING_DIR, f"{post_id}.json")
        
        if not os.path.exists(post_file):
            await query.edit_message_text("❌ Post not found. It may have been processed already.")
            return
            
        with open(post_file, 'r') as f:
            post = json.load(f)
            
        if action == "approve":
            # Move to approved archive immediately
            approved_file = os.path.join(APPROVED_DIR, f"{post_id}.json")
            os.rename(post_file, approved_file)

            # Acknowledge CEO instantly, then publish in-process
            await query.edit_message_text(
                f"🚀 *PUBLISHING TO LEKEELEKEE...*\n\n"
                f"Day {post['day']}/36: {post['state_name']}\n\n"
                f"⏳ Browser automation running — please wait (30-60s)...",
                parse_mode='Markdown'
            )

            print(f"✅ Post {post_id} approved by CEO — starting inline publish")
            await self._publish_to_leke_leke(query, post_id, post)
                
        elif action == "reject":
            # Move to rejected
            rejected_file = os.path.join(REJECTED_DIR, f"{post_id}.json")
            os.rename(post_file, rejected_file)
            
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
        bot_instance = query.message.bot

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

                success = browser.post_approved_content(post_data)
                if success:
                    browser.archive_posted(post_id, post_data)
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
                f"🟢 Live on LekeeLekee now.",
                parse_mode='Markdown'
            )
            print(f"🟢 Post {post_id} published to LekeeLekee")
        else:
            # No parse_mode — err and post_id may contain underscores that break Markdown
            safe_err = (err or 'Unknown').replace('<', '').replace('>', '')
            await query.edit_message_text(
                f"❌ PUBLISH FAILED\n\n"
                f"Day {post['day']}/36: {post['state_name']}\n\n"
                f"Error: {safe_err}\n"
                f"Post saved in approved_posts/ — retry with /publish_{post_id}"
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
