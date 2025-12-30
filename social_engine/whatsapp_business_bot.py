#!/usr/bin/env python3
"""
AMD SOLUTIONS - WHATSAPP BUSINESS AUTO-RESPONDER
================================================
Automated customer service bot for WhatsApp Web
Monitors incoming messages and responds with branded templates

Official Contact: +234 818 002 1007
Email: ceo@amdsolutions007.com
Website: https://amdsolutions007.com
LinkTree: https://linktr.ee/amdsolutions007

OPERATION: TWIN-TURBO PHASE 1
Author: AMD Solutions 007
Date: 30 December 2025
"""

import time
import random
import logging
import re
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    StaleElementReferenceException
)

# ==================== CONFIGURATION ====================

# Official AMD Solutions Branding
OFFICIAL_PHONE = "+234 818 002 1007"
OFFICIAL_EMAIL = "ceo@amdsolutions007.com"
OFFICIAL_WEBSITE = "https://amdsolutions007.com"
OFFICIAL_LINKTREE = "https://linktr.ee/amdsolutions007"

# Chrome Profile Path (macOS)
CHROME_PROFILE_PATH = str(Path.home() / "Library/Application Support/Google/Chrome")
PROFILE_DIRECTORY = "Default"

# Bot Configuration
CHECK_INTERVAL = 10  # Check for new messages every 10 seconds
RESPONSE_DELAY_MIN = 5  # Minimum human-like delay
RESPONSE_DELAY_MAX = 15  # Maximum human-like delay
MAX_RETRIES = 3  # Retry failed operations

# Logging
LOG_FILE = Path(__file__).parent / "whatsapp_bot.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ==================== RESPONSE TEMPLATES ====================

RESPONSES = {
    'cv_service': """📄 *AMD RESUME AI - PROFESSIONAL CV ANALYSIS*

We transform ordinary CVs into job-winning resumes!

*Our Services:*
✅ Basic Review & Feedback: ₦5,000
✅ Premium Rewrite + ATS Optimization: ₦15,000

*FREE PREVIEW:* Send your CV now for a complimentary analysis!

📞 WhatsApp: {phone}
📧 Email: {email}
🌐 Website: {website}
🔗 LinkTree: {linktree}

_Reply "YES" to get started!_ 🚀""",

    'source_code': """💻 *AMD CODE VAULT - READY-MADE SOLUTIONS*

Why build from scratch? Get production-ready code NOW!

*Available Projects:*
🌐 Landing Pages: ₦15,000
💼 Business Websites: ₦30,000
🛒 E-commerce Sites: ₦50,000
📱 Mobile App Templates: ₦40,000

*BONUS:* Free 30-day support + deployment guide!

📞 WhatsApp: {phone}
🌐 Portfolio: {website}
🔗 Full Catalog: {linktree}

_Type the project you need!_ 💡""",

    'custom_dev': """🛠️ *AMD CUSTOM DEVELOPMENT - BUILD YOUR VISION*

Got a unique idea? We'll bring it to life!

*We Build:*
🎯 Custom Web Apps
📱 Mobile Applications
🤖 Automation Bots
🔌 API Integrations
☁️ Cloud Solutions

*Process:*
1️⃣ Free Consultation
2️⃣ Detailed Quote (within 24hrs)
3️⃣ Milestone-based Development
4️⃣ Full Ownership + Source Code

📞 WhatsApp: {phone}
📧 Email: {email}
🔗 Learn More: {linktree}

_Describe your project below!_ 🚀""",

    'pricing': """💰 *AMD SOLUTIONS - PRICING GUIDE*

*Professional Services:*
📄 CV Analysis (Basic): ₦5,000
📝 CV Rewrite (Premium): ₦15,000

*Ready-Made Projects:*
🌐 Landing Pages: ₦15,000
💼 Business Sites: ₦30,000
🛒 E-commerce: ₦50,000

*Custom Development:*
💡 Quote based on requirements
⚡ Flexible payment plans available

📞 WhatsApp: {phone}
📧 Email: {email}
🔗 Full Details: {linktree}

_What service interests you?_ 🎯""",

    'help': """🌟 *WELCOME TO AMD SOLUTIONS!*

*Quick Menu:*
📄 Type *"CV"* - Resume Services
💻 Type *"CODE"* - Source Code Projects  
🛠️ Type *"CUSTOM"* - Custom Development
💰 Type *"PRICE"* - View All Pricing
📞 Type *"CONTACT"* - Speak to a Human

*Why Choose Us?*
✅ 5+ Years Experience
✅ 100+ Satisfied Clients
✅ Same-Day Delivery (Most Projects)
✅ Money-Back Guarantee

📞 WhatsApp: {phone}
🌐 Website: {website}
🔗 Portfolio: {linktree}

_How can we help you today?_ 🚀""",

    'greeting': """👋 *Hello! Welcome to AMD SOLUTIONS!*

Your one-stop shop for:
📄 Professional CV Services
💻 Ready-Made Source Code
🛠️ Custom Development

*Quick Start:*
• Type *"CV"* for Resume help
• Type *"CODE"* for Software projects
• Type *"HELP"* for full menu

📞 Official: {phone}
🔗 Portfolio: {linktree}

_What brings you here today?_ 😊"""
}

# Format all responses with official branding
for key in RESPONSES:
    RESPONSES[key] = RESPONSES[key].format(
        phone=OFFICIAL_PHONE,
        email=OFFICIAL_EMAIL,
        website=OFFICIAL_WEBSITE,
        linktree=OFFICIAL_LINKTREE
    )

# ==================== ANTI-BAN UTILITIES ====================

class AntiDetection:
    """Anti-ban and human behavior simulation"""
    
    @staticmethod
    def human_delay(min_sec=RESPONSE_DELAY_MIN, max_sec=RESPONSE_DELAY_MAX):
        """Random delay to mimic human response time"""
        delay = random.uniform(min_sec, max_sec)
        logger.debug(f"Human delay: {delay:.2f} seconds")
        time.sleep(delay)
    
    @staticmethod
    def typing_simulation(text_length):
        """Simulate typing time based on text length"""
        # Average human types 40 WPM = ~200 chars/min = 3.33 chars/sec
        typing_time = text_length / 3.33
        jitter = random.uniform(0.8, 1.2)  # Add variation
        delay = typing_time * jitter
        logger.debug(f"Typing simulation: {delay:.2f} seconds")
        time.sleep(min(delay, 5))  # Cap at 5 seconds
    
    @staticmethod
    def add_human_touch(text):
        """Occasionally add human-like variations"""
        if random.random() < 0.1:  # 10% chance
            variations = ['', ' ', '😊', '👍']
            return text + random.choice(variations)
        return text

# ==================== WHATSAPP BOT CLASS ====================

class WhatsAppBusinessBot:
    """WhatsApp Web automation for customer service"""
    
    def __init__(self):
        self.driver = None
        self.wait = None
        self.processed_messages = set()  # Track processed messages
        self.message_count = 0
        self.start_time = datetime.now()
    
    def setup_driver(self):
        """Initialize Chrome WebDriver with persistent session"""
        logger.info("🚀 Initializing Chrome WebDriver...")
        
        options = webdriver.ChromeOptions()
        
        # Use persistent Chrome profile (no QR scan after first time)
        options.add_argument(f"user-data-dir={CHROME_PROFILE_PATH}")
        options.add_argument(f"profile-directory={PROFILE_DIRECTORY}")
        
        # Anti-detection measures
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Performance optimizations
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--no-sandbox")
        
        # User agent (look like real browser)
        options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        
        try:
            self.driver = webdriver.Chrome(options=options)
            self.wait = WebDriverWait(self.driver, 30)
            logger.info("✅ Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize WebDriver: {e}")
            return False
    
    def open_whatsapp(self):
        """Navigate to WhatsApp Web"""
        logger.info("🌐 Opening WhatsApp Web...")
        
        try:
            self.driver.get("https://web.whatsapp.com")
            logger.info("⏳ Waiting for WhatsApp to load...")
            
            # Wait for either QR code or chat list (if already logged in)
            try:
                # Check if already logged in (chat list appears)
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//div[@id="pane-side"]'))
                )
                logger.info("✅ WhatsApp Web loaded - Already logged in!")
                return True
            except TimeoutException:
                # QR code present - need to scan
                logger.warning("📱 QR CODE DETECTED - Please scan with your phone!")
                logger.info("⏳ Waiting for QR scan (120 seconds timeout)...")
                
                # Wait for successful login (chat list appears after scan)
                self.wait = WebDriverWait(self.driver, 120)
                self.wait.until(
                    EC.presence_of_element_located((By.XPATH, '//div[@id="pane-side"]'))
                )
                logger.info("✅ QR Code scanned successfully!")
                self.wait = WebDriverWait(self.driver, 30)  # Reset timeout
                return True
        
        except Exception as e:
            logger.error(f"❌ Failed to load WhatsApp Web: {e}")
            return False
    
    def detect_intent(self, message):
        """Detect user intent from message text"""
        message_lower = message.lower()
        
        # CV/Resume related
        if any(keyword in message_lower for keyword in ['cv', 'resume', 'curriculum']):
            return 'cv_service'
        
        # Source code related
        elif any(keyword in message_lower for keyword in ['source', 'code', 'project', 'website', 'template']):
            return 'source_code'
        
        # Custom development
        elif any(keyword in message_lower for keyword in ['custom', 'build', 'develop', 'create', 'app']):
            return 'custom_dev'
        
        # Pricing
        elif any(keyword in message_lower for keyword in ['price', 'cost', 'how much', 'pricing', 'payment']):
            return 'pricing'
        
        # Help menu
        elif any(keyword in message_lower for keyword in ['help', 'menu', 'options', 'service']):
            return 'help'
        
        # Default greeting
        else:
            return 'greeting'
    
    def get_unread_chats(self):
        """Find all chats with unread messages (green badges)"""
        try:
            # Look for unread message indicators (green notification badges)
            unread_selectors = [
                '//span[@data-icon="status-unread"]',
                '//div[contains(@class, "unread")]//span[@data-icon="status-unread"]',
                '//span[@aria-label and contains(@aria-label, "unread")]'
            ]
            
            unread_chats = []
            for selector in unread_selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    unread_chats.extend(elements)
                except:
                    continue
            
            if unread_chats:
                logger.info(f"📬 Found {len(unread_chats)} unread chat(s)")
            
            return unread_chats
        
        except Exception as e:
            logger.error(f"❌ Error finding unread chats: {e}")
            return []
    
    def open_chat(self, unread_element):
        """Click on chat to open conversation"""
        try:
            # Navigate up to the clickable chat element
            chat_element = unread_element.find_element(By.XPATH, './ancestor::div[@role="listitem"]')
            
            # Get chat name for logging
            try:
                chat_name = chat_element.find_element(By.XPATH, './/span[@title]').get_attribute('title')
            except:
                chat_name = "Unknown"
            
            logger.info(f"💬 Opening chat: {chat_name}")
            chat_element.click()
            time.sleep(2)  # Wait for chat to load
            
            return chat_name
        
        except Exception as e:
            logger.error(f"❌ Failed to open chat: {e}")
            return None
    
    def read_last_message(self):
        """Read the most recent message in current chat"""
        try:
            # Find all message bubbles
            messages = self.driver.find_elements(
                By.XPATH,
                '//div[@class="_akbu"]//span[@class="_ao3e selectable-text copyable-text"]'
            )
            
            if not messages:
                # Try alternative selector
                messages = self.driver.find_elements(
                    By.XPATH,
                    '//div[contains(@class, "message-in")]//span[contains(@class, "selectable-text")]'
                )
            
            if messages:
                last_message = messages[-1].text
                logger.info(f"📥 Last message: {last_message[:50]}...")
                return last_message
            else:
                logger.warning("⚠️ No messages found in chat")
                return ""
        
        except Exception as e:
            logger.error(f"❌ Error reading message: {e}")
            return ""
    
    def send_message(self, message_text):
        """Type and send message"""
        try:
            # Find message input box
            input_selectors = [
                '//div[@contenteditable="true"][@data-tab="10"]',
                '//div[@role="textbox"][@contenteditable="true"]',
                '//footer//div[@contenteditable="true"]'
            ]
            
            message_box = None
            for selector in input_selectors:
                try:
                    message_box = self.wait.until(
                        EC.presence_of_element_located((By.XPATH, selector))
                    )
                    break
                except:
                    continue
            
            if not message_box:
                logger.error("❌ Could not find message input box")
                return False
            
            # Clear any existing text
            message_box.click()
            message_box.clear()
            
            # Simulate human typing with delays
            AntiDetection.typing_simulation(len(message_text))
            
            # Add human touch
            message_text = AntiDetection.add_human_touch(message_text)
            
            # Type message (split by lines to preserve formatting)
            for line in message_text.split('\n'):
                message_box.send_keys(line)
                message_box.send_keys(Keys.SHIFT + Keys.ENTER)
            
            # Small delay before sending
            time.sleep(0.5)
            
            # Send message (Enter key)
            message_box.send_keys(Keys.ENTER)
            
            logger.info("✅ Message sent successfully!")
            self.message_count += 1
            
            return True
        
        except Exception as e:
            logger.error(f"❌ Failed to send message: {e}")
            return False
    
    def process_chat(self, unread_element):
        """Process a single unread chat"""
        try:
            # Open the chat
            chat_name = self.open_chat(unread_element)
            if not chat_name:
                return False
            
            # Read last message
            message = self.read_last_message()
            if not message:
                return False
            
            # Create unique ID for this message
            message_id = f"{chat_name}:{message[:30]}"
            
            # Skip if already processed
            if message_id in self.processed_messages:
                logger.debug(f"⏭️ Already processed: {message_id}")
                return False
            
            # Detect intent
            intent = self.detect_intent(message)
            logger.info(f"🎯 Intent detected: {intent}")
            
            # Get response template
            response = RESPONSES.get(intent, RESPONSES['greeting'])
            
            # Human-like delay before responding
            AntiDetection.human_delay()
            
            # Send response
            success = self.send_message(response)
            
            if success:
                # Mark as processed
                self.processed_messages.add(message_id)
                
                # Limit memory usage (keep last 1000 messages)
                if len(self.processed_messages) > 1000:
                    self.processed_messages = set(list(self.processed_messages)[-1000:])
                
                logger.info(f"✅ Processed chat: {chat_name}")
                return True
            
            return False
        
        except Exception as e:
            logger.error(f"❌ Error processing chat: {e}")
            return False
    
    def run(self):
        """Main bot loop - monitor and respond to messages"""
        logger.info("=" * 60)
        logger.info("🤖 AMD SOLUTIONS - WHATSAPP BUSINESS AUTO-RESPONDER")
        logger.info("=" * 60)
        logger.info(f"📞 Official Number: {OFFICIAL_PHONE}")
        logger.info(f"🌐 Website: {OFFICIAL_WEBSITE}")
        logger.info(f"🔗 LinkTree: {OFFICIAL_LINKTREE}")
        logger.info("=" * 60)
        
        # Setup WebDriver
        if not self.setup_driver():
            logger.error("❌ Failed to setup WebDriver. Exiting.")
            return
        
        # Open WhatsApp Web
        if not self.open_whatsapp():
            logger.error("❌ Failed to open WhatsApp Web. Exiting.")
            return
        
        logger.info("✅ Bot is now LIVE and monitoring messages!")
        logger.info(f"⏱️ Check interval: {CHECK_INTERVAL} seconds")
        logger.info(f"🛡️ Anti-ban delays: {RESPONSE_DELAY_MIN}-{RESPONSE_DELAY_MAX} seconds")
        logger.info("=" * 60)
        
        # Main loop
        try:
            while True:
                try:
                    # Check for unread messages
                    unread_chats = self.get_unread_chats()
                    
                    if unread_chats:
                        logger.info(f"🔔 Processing {len(unread_chats)} unread chat(s)...")
                        
                        for unread_element in unread_chats:
                            try:
                                self.process_chat(unread_element)
                                
                                # Delay between processing multiple chats
                                if len(unread_chats) > 1:
                                    time.sleep(random.uniform(3, 7))
                            
                            except StaleElementReferenceException:
                                logger.warning("⚠️ Element became stale, continuing...")
                                continue
                            except Exception as e:
                                logger.error(f"❌ Error processing chat: {e}")
                                continue
                    
                    else:
                        logger.debug("💤 No unread messages. Waiting...")
                    
                    # Wait before next check
                    time.sleep(CHECK_INTERVAL)
                    
                    # Periodic stats
                    uptime = (datetime.now() - self.start_time).total_seconds() / 3600
                    if int(uptime) > 0 and int(uptime) % 1 == 0:  # Every hour
                        logger.info(f"📊 Stats: {self.message_count} messages sent | Uptime: {uptime:.1f} hours")
                
                except KeyboardInterrupt:
                    logger.info("⏸️ Bot stopped by user")
                    break
                
                except Exception as e:
                    logger.error(f"❌ Error in main loop: {e}")
                    time.sleep(30)  # Wait before retry
                    continue
        
        finally:
            # Cleanup
            logger.info("🛑 Shutting down bot...")
            if self.driver:
                self.driver.quit()
            logger.info("👋 Bot stopped gracefully")

# ==================== MAIN ENTRY POINT ====================

def main():
    """Start the WhatsApp Business Bot"""
    bot = WhatsAppBusinessBot()
    bot.run()

if __name__ == "__main__":
    main()
