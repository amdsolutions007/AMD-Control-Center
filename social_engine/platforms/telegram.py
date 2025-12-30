"""
Telegram Platform Integration
Uses python-telegram-bot for channel posting
"""

import logging
import asyncio
from typing import Optional, Dict
import sys
from pathlib import Path

try:
    from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
    from telegram.error import TelegramError
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False
    logging.warning("⚠️ python-telegram-bot not installed. Run: pip install python-telegram-bot")

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config import (
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
    WHATSAPP_NUMBER
)

logger = logging.getLogger(__name__)


class TelegramPlatform:
    """Telegram automation using python-telegram-bot"""
    
    def __init__(self):
        self.bot = None
        self.loop = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Telegram Bot API"""
        if not TELEGRAM_AVAILABLE:
            logger.error("❌ python-telegram-bot not installed")
            return
        
        if not TELEGRAM_BOT_TOKEN:
            logger.warning("⚠️ Telegram bot token not found in environment")
            return
        
        try:
            self.bot = Bot(token=TELEGRAM_BOT_TOKEN)
            
            # Create persistent event loop for all async operations
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
            
            # Test authentication
            self.loop.run_until_complete(self._test_connection())
            logger.info("✅ Telegram bot authenticated")
        
        except Exception as e:
            logger.error(f"❌ Telegram authentication failed: {e}")
            self.bot = None
            if self.loop:
                self.loop.close()
                self.loop = None
    
    async def _test_connection(self):
        """Test bot connection"""
        if self.bot:
            me = await self.bot.get_me()
            logger.info(f"Bot username: @{me.username}")
    
    def post(self, content: Dict) -> Optional[Dict]:
        """
        Post content to Telegram channel/group
        
        Args:
            content: Dictionary with 'text' or 'template' key
        
        Returns:
            Response dict with message_id, or None if failed
        """
        if not self.bot:
            logger.error("❌ Telegram bot not authenticated")
            return None
        
        try:
            # Get text from content
            text = content.get('text', content.get('template', ''))
            
            if not text:
                logger.error("❌ No text content provided")
                return None
            
            # Add inline keyboard if requested
            reply_markup = None
            if content.get('inline_keyboard', False):
                keyboard = [
                    [
                        InlineKeyboardButton("📞 WhatsApp", url=self._get_whatsapp_link(content)),
                        InlineKeyboardButton("🌐 Website", url="https://www.amdsolutions007.com")
                    ],
                    [
                        InlineKeyboardButton("📂 Portfolio", url="https://amdsolutions007.github.io")
                    ]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
            
            # Post to channel using persistent event loop
            if not self.loop or self.loop.is_closed():
                self.loop = asyncio.new_event_loop()
                asyncio.set_event_loop(self.loop)
            
            result = self.loop.run_until_complete(self._send_message(text, reply_markup))
            
            if result:
                logger.info(f"✅ Telegram message posted: {result['message_id']}")
                return result
        
        except TelegramError as e:
            logger.error(f"❌ Telegram API error: {e}")
        except Exception as e:
            logger.error(f"❌ Unexpected error posting to Telegram: {e}")
        
        return None
    
    async def _send_message(self, text: str, reply_markup=None) -> Optional[Dict]:
        """Send message asynchronously"""
        try:
            message = await self.bot.send_message(
                chat_id=TELEGRAM_CHAT_ID,
                text=text,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
            return {
                'success': True,
                'message_id': message.message_id,
                'chat_id': message.chat_id,
                'platform': 'telegram'
            }
        
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return None
    
    def _get_whatsapp_link(self, content: Dict) -> str:
        """Generate WhatsApp link based on content type"""
        content_type = content.get('type', 'general')
        
        messages = {
            'service_ad': "Hello! I saw your Telegram post about CV Analysis. I need help with my CV.",
            'product_ad': "Hi! I saw your post about source code. I'm interested in purchasing.",
            'general': "Hello AMD Solutions! I'd like to discuss your services."
        }
        
        message = messages.get(content_type, messages['general'])
        return f"https://wa.me/{WHATSAPP_NUMBER.replace('+', '')}?text={message.replace(' ', '%20')}"
    
    def get_channel_info(self) -> Optional[Dict]:
        """Get channel information"""
        if not self.bot:
            return None
        
        try:
            return asyncio.run(self._fetch_channel_info())
        except Exception as e:
            logger.error(f"❌ Error getting channel info: {e}")
            return None
    
    async def _fetch_channel_info(self) -> Optional[Dict]:
        """Fetch channel info asynchronously"""
        try:
            chat = await self.bot.get_chat(chat_id=TELEGRAM_CHAT_ID)
            return {
                'title': chat.title,
                'username': chat.username,
                'type': chat.type,
                'members': getattr(chat, 'member_count', 'N/A')
            }
        except Exception as e:
            logger.error(f"Error fetching channel info: {e}")
            return None


if __name__ == '__main__':
    # Test Telegram platform
    logging.basicConfig(level=logging.INFO)
    
    print("📱 Telegram Platform - Test\n")
    print("=" * 60)
    
    telegram = TelegramPlatform()
    
    if telegram.bot:
        # Get channel info
        channel_info = telegram.get_channel_info()
        if channel_info:
            print(f"\n📊 Channel: @{channel_info.get('username', 'Unknown')}")
            print(f"Type: {channel_info.get('type', 'Unknown')}")
        
        # Test post
        test_content = {
            'text': '<b>🤖 AMD Social Engine Test</b>\n\nThis is an automated post from our new social automation system!\n\n✅ Telegram integration working\n\n#AMDSolutions007',
            'type': 'general',
            'inline_keyboard': True
        }
        
        result = telegram.post(test_content)
        if result:
            print(f"\n✅ Test post successful!")
            print(f"Message ID: {result['message_id']}")
        else:
            print("\n❌ Test post failed")
    else:
        print("\n⚠️ Telegram not configured. Add TELEGRAM_BOT_TOKEN to .env")
