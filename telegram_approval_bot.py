"""
Telegram Approval Bot for Ghost Writer
Human-in-the-Loop: CEO reviews and approves posts before they go live
"""

import os
import json
import asyncio
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from content_generator import ContentGenerator
from graphic_generator import GraphicGenerator

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
                day_number=post['day']
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
            # Move to approved queue
            approved_file = os.path.join(APPROVED_DIR, f"{post_id}.json")
            os.rename(post_file, approved_file)
            
            await query.edit_message_text(
                f"✅ *APPROVED*\n\n"
                f"Day {post['day']}/36: {post['state_name']}\n\n"
                f"Ghost Writer will post this to Leke Leke shortly.\n"
                f"You'll receive a confirmation when it's live.",
                parse_mode='Markdown'
            )
            
            print(f"✅ Post {post_id} approved by CEO")
            
            # Trigger Ghost Writer to post (via file flag)
            trigger_file = "trigger_post.flag"
            with open(trigger_file, 'w') as f:
                f.write(post_id)
                
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
        
        # Buttons
        self.app.add_handler(CallbackQueryHandler(self.button_callback))
        
        print("🤖 Telegram Approval Bot starting...")
        print(f"📱 CEO Telegram ID: {CEO_TELEGRAM_ID}")
        print("✅ Ready to receive commands")
        
        self.app.run_polling()


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
