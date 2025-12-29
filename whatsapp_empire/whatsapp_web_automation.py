#!/usr/bin/env python3
"""
AMD WhatsApp Web Auto-Responder
Uses your ALREADY LINKED WhatsApp Web session on Mac
No QR code needed - just runs in background!
"""

import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, TimeoutException
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('whatsapp_automation.log'),
        logging.StreamHandler()
    ]
)

print("=" * 70)
print("🤖 AMD SOLUTIONS - WHATSAPP WEB AUTO-RESPONDER")
print("=" * 70)
print()

# Response templates with official branding
RESPONSES = {
    'cv': """📄 CV ANALYSIS & ATS OPTIMIZATION

✅ Professional CV Review
✅ ATS Compatibility Check
✅ Format Optimization
✅ Content Enhancement

💰 Pricing:
- Basic Review: ₦5,000
- Standard Package: ₦10,000
- Premium Package: ₦15,000

⏰ Delivery: 24 hours

📞 WhatsApp: +234 818 002 1007
📧 Email: ceo@amdsolutions007.com
🌐 Website: https://amdsolutions007.com
🔗 All Services: https://linktr.ee/amdsolutions007

Reply "START CV" to proceed!""",

    'source_code': """💻 SOURCE CODE PROJECTS

We have 10+ ready-made projects:
✅ Facial Recognition System
✅ AI Voice Assistant
✅ Crypto Price Tracker
✅ Property Intelligence Platform
✅ E-commerce Solutions
✅ Hospital Management System
✅ School Portal
✅ Inventory System

💰 Price Range: ₦15,000 - ₦50,000

📦 Includes:
- Full source code
- Complete documentation
- Installation support
- Free updates for 30 days

📞 WhatsApp: +234 818 002 1007
📧 Email: ceo@amdsolutions007.com
🌐 Portfolio: https://amdsolutions007.com
🔗 Browse Catalog: https://linktr.ee/amdsolutions007

Reply "CATALOG" to see detailed project list!""",

    'custom': """🚀 CUSTOM SOFTWARE DEVELOPMENT

We build enterprise-grade solutions:
✅ Web Applications (Django, React, Next.js)
✅ Mobile Apps (React Native, Flutter)
✅ AI/ML Solutions (Python, TensorFlow)
✅ Automation Systems
✅ API Integrations
✅ Database Design

💼 Our Process:
1. Free consultation
2. Detailed proposal & quote
3. Agile development
4. Testing & deployment
5. Training & support

⏰ Typical Timeline: 2-8 weeks
💰 Starting from: ₦50,000

📞 WhatsApp: +234 818 002 1007
📧 Email: ceo@amdsolutions007.com
🌐 Website: https://amdsolutions007.com
🔗 Portfolio: https://linktr.ee/amdsolutions007

Describe your project and we'll send a free quote!""",

    'pricing': """💰 AMD SOLUTIONS - PRICING OVERVIEW

📄 **CV Services:**
- Basic Review: ₦5,000
- Standard (ATS optimized): ₦10,000
- Premium (Complete rewrite): ₦15,000

💻 **Source Code Projects:**
- Simple projects: ₦15,000 - ₦25,000
- Medium complexity: ₦30,000 - ₦40,000
- Advanced systems: ₦45,000 - ₦50,000

🚀 **Custom Development:**
- Basic website: ₦50,000 - ₦150,000
- Web application: ₦200,000 - ₦500,000
- Mobile app: ₦300,000 - ₦800,000
- Enterprise solution: Custom quote

📚 **Tech Consulting:** ₦10,000/hour

💳 Payment: 50% deposit, balance on delivery
✅ All major payment methods accepted

📞 WhatsApp: +234 818 002 1007
📧 Email: ceo@amdsolutions007.com
🌐 Website: https://amdsolutions007.com
🔗 Full Details: https://linktr.ee/amdsolutions007

Which service interests you?""",

    'greeting': """👋 Hello! Thanks for contacting AMD Solutions!

We're a professional tech services company specializing in:

📋 Our Services:
1️⃣ CV Analysis & ATS Optimization (₦5K-15K)
2️⃣ Source Code Projects - Final Year Projects (₦15K-50K)
3️⃣ Custom Software Development (₦50K+)
4️⃣ Tech Consulting & Training

💬 How can we help you today?

Reply with:
- "CV service" for CV review
- "Source code" for ready-made projects
- "Custom dev" for software development
- "Pricing" for full price list

📞 WhatsApp: +234 818 002 1007
📧 Email: ceo@amdsolutions007.com
🌐 Website: https://amdsolutions007.com
🔗 All Services: https://linktr.ee/amdsolutions007

We respond within 1-2 hours during business hours (9am-6pm WAT)!"""
}

def detect_intent(message):
    """Detect user intent from message text"""
    msg = message.lower()
    
    # CV Service keywords
    if any(word in msg for word in ['cv', 'resume', 'curriculum', 'job', 'ats', 'cover letter']):
        return 'cv'
    
    # Source code keywords
    if any(word in msg for word in ['source', 'code', 'project', 'final year', 'fyp', 'catalog', 
                                     'school project', 'thesis', 'capstone']):
        return 'source_code'
    
    # Custom development keywords
    if any(word in msg for word in ['develop', 'build', 'website', 'app', 'software', 'custom',
                                     'create', 'design', 'system', 'platform']):
        return 'custom'
    
    # Pricing keywords
    if any(word in msg for word in ['price', 'cost', 'how much', 'pricing', 'rate', 'fee', 'charge']):
        return 'pricing'
    
    # Greeting keywords
    if any(word in msg for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 
                                     'good evening', 'greetings']):
        return 'greeting'
    
    # Default to greeting for unclear messages
    return 'greeting'

def send_message(driver, message):
    """Send a message through WhatsApp Web"""
    try:
        # Find message input box
        input_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]')
        
        # Split message into lines and send
        lines = message.split('\n')
        for i, line in enumerate(lines):
            input_box.send_keys(line)
            if i < len(lines) - 1:
                # Use Shift+Enter for new line
                input_box.send_keys(Keys.SHIFT + Keys.ENTER)
        
        # Send message (Ctrl+Enter or click send button)
        input_box.send_keys(Keys.ENTER)
        
        return True
    except Exception as e:
        logging.error(f"Error sending message: {e}")
        return False

def get_unread_chats(driver):
    """Get list of chats with unread messages"""
    try:
        # Find chats with unread badge
        unread = driver.find_elements(By.XPATH, '//span[@data-icon="status-unread"]')
        return unread
    except Exception as e:
        logging.error(f"Error finding unread chats: {e}")
        return []

def get_chat_name(chat_element):
    """Extract contact name from chat element"""
    try:
        # Navigate up to parent container and find name
        parent = chat_element.find_element(By.XPATH, './ancestor::div[contains(@class, "chat")]')
        name = parent.find_element(By.XPATH, './/span[@title]').get_attribute('title')
        return name
    except Exception as e:
        return "Unknown"

def get_latest_message(driver):
    """Get the most recent incoming message text"""
    try:
        # Find all incoming messages (not from you)
        messages = driver.find_elements(By.XPATH, '//div[contains(@class, "message-in")]//span[@class="selectable-text copyable-text"]')
        
        if messages:
            # Get the last message
            latest = messages[-1].text
            return latest
        return None
    except Exception as e:
        logging.error(f"Error getting message: {e}")
        return None

def main():
    """Main automation loop"""
    
    print("📋 INITIALIZATION:")
    print("   - Using your existing WhatsApp Web session")
    print("   - No QR code needed!")
    print("   - Just make sure WhatsApp Web is already logged in")
    print()
    print("=" * 70)
    print()
    
    # Chrome options to use existing profile
    chrome_options = Options()
    chrome_options.add_argument("--user-data-dir=/Users/mac/Library/Application Support/Google/Chrome")
    chrome_options.add_argument("--profile-directory=Default")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    print("⏳ Starting Chrome browser...")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://web.whatsapp.com")
        
        print("✅ WhatsApp Web opened!")
        print()
        print("👀 Checking if already logged in...")
        
        # Wait for WhatsApp to load
        try:
            # Wait for main chat interface (means we're logged in)
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]'))
            )
            
            print("✅ Already logged in!")
            print()
            print("=" * 70)
            print()
            print("🤖 AUTO-RESPONDER IS NOW ACTIVE!")
            print()
            print("📱 Status: Monitoring all incoming messages")
            print("💬 Action: Auto-detecting intent and responding")
            print("⏰ Time: 24/7 automated responses")
            print()
            print("💡 How it works:")
            print("   1. Someone messages you")
            print("   2. System detects topic (CV, source code, etc.)")
            print("   3. Sends professional response automatically")
            print("   4. All messages include your contact info")
            print()
            print("🛑 Press Ctrl+C to stop")
            print()
            print("=" * 70)
            print()
            
        except TimeoutException:
            print("⚠️  Not logged in yet!")
            print()
            print("👉 ACTION REQUIRED:")
            print("   1. Scan QR code with your phone")
            print("   2. Open WhatsApp → Settings → Linked Devices")
            print("   3. Tap 'Link a Device'")
            print("   4. Scan the QR code on screen")
            print()
            print("⏳ Waiting for QR scan... (60 seconds)")
            
            # Wait for login
            WebDriverWait(driver, 60).until(
                EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]'))
            )
            
            print("✅ Successfully logged in!")
            print()
        
        # Track responded messages to avoid duplicates
        responded_messages = set()
        
        print("📊 MONITORING STARTED:")
        print()
        
        # Main monitoring loop
        check_count = 0
        while True:
            try:
                check_count += 1
                
                # Find unread chats
                unread_chats = get_unread_chats(driver)
                
                if unread_chats:
                    print(f"📨 Found {len(unread_chats)} unread message(s)")
                    
                    for unread in unread_chats:
                        try:
                            # Click on the chat
                            unread.click()
                            time.sleep(2)
                            
                            # Get contact name
                            contact = get_chat_name(unread)
                            
                            # Get latest message
                            message_text = get_latest_message(driver)
                            
                            if message_text and message_text not in responded_messages:
                                print(f"\n{'='*70}")
                                print(f"📱 From: {contact}")
                                print(f"💬 Message: {message_text[:100]}...")
                                
                                # Detect intent
                                intent = detect_intent(message_text)
                                response = RESPONSES[intent]
                                
                                print(f"🤖 Detected: {intent.upper()}")
                                print(f"📤 Sending: {len(response)} chars response...")
                                
                                # Send response
                                if send_message(driver, response):
                                    print(f"✅ Response sent successfully!")
                                    print(f"⏰ Time: {datetime.now().strftime('%I:%M:%S %p')}")
                                    
                                    # Mark as responded
                                    responded_messages.add(message_text)
                                    
                                    # Log to file
                                    logging.info(f"Responded to {contact}: {intent}")
                                else:
                                    print(f"❌ Failed to send response")
                                
                                print(f"{'='*70}\n")
                                
                                time.sleep(3)
                        
                        except Exception as e:
                            logging.error(f"Error processing chat: {e}")
                            continue
                
                # Show heartbeat every 10 checks
                if check_count % 10 == 0:
                    print(f"💓 Heartbeat: {check_count} checks, {len(responded_messages)} messages handled")
                
                # Wait before next check
                time.sleep(5)
            
            except KeyboardInterrupt:
                print("\n\n" + "="*70)
                print("🛑 STOPPING AUTO-RESPONDER...")
                print(f"📊 Total messages handled: {len(responded_messages)}")
                print("✅ Session saved - can resume anytime")
                print("👋 Goodbye!")
                print("="*70 + "\n")
                break
            
            except Exception as e:
                logging.error(f"Error in main loop: {e}")
                print(f"⚠️  Error: {e}")
                print("🔄 Continuing in 10 seconds...")
                time.sleep(10)
                continue
    
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        print("💡 TROUBLESHOOTING:")
        print("   1. Make sure Chrome browser is installed")
        print("   2. Make sure WhatsApp Web is accessible")
        print("   3. Try opening https://web.whatsapp.com manually first")
        print("   4. Install selenium: pip3 install selenium")
        print()
    
    finally:
        if 'driver' in locals():
            print("\n🔄 Closing browser...")
            driver.quit()
            print("✅ Closed successfully\n")

if __name__ == "__main__":
    print("\n🚀 Starting AMD WhatsApp Automation...\n")
    main()
