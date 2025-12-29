#!/usr/bin/env python3
"""
AMD Solutions WhatsApp Auto-Responder
Uses WhatsApp Web API with better reliability
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import json

print("=" * 60)
print("🤖 AMD SOLUTIONS WHATSAPP AUTO-RESPONDER")
print("=" * 60)
print()

# Response templates
RESPONSES = {
    'greeting': """👋 Hello! Thanks for contacting AMD Solutions!

I'm your virtual assistant. How can we help you today?

📋 Our Services:
1️⃣ CV Analysis & ATS Optimization
2️⃣ Source Code Projects (Final Year Projects)
3️⃣ Software Development
4️⃣ Tech Consulting

💬 Reply with the number or tell me what you need!

📞 WhatsApp: +234 818 002 1007
📧 ceo@amdsolutions007.com
🌐 https://amdsolutions007.com
🔗 https://linktr.ee/amdsolutions007""",

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
📧 ceo@amdsolutions007.com
🔗 https://linktr.ee/amdsolutions007

Would you like to proceed? Reply "YES CV" to start!""",

    'source_code': """💻 SOURCE CODE PROJECTS

We have 10+ ready-made projects:
✅ Facial Recognition System
✅ AI Voice Assistant
✅ Crypto Price Tracker
✅ Property Intelligence Platform
✅ E-commerce Solutions
✅ And more...

💰 Price Range: ₦15,000 - ₦50,000

📦 Includes:
- Full source code
- Documentation
- Installation support

📞 WhatsApp: +234 818 002 1007
📧 ceo@amdsolutions007.com
🔗 https://linktr.ee/amdsolutions007

Reply "CATALOG" to see full list!""",

    'custom': """🚀 CUSTOM SOFTWARE DEVELOPMENT

We build:
✅ Web Applications
✅ Mobile Apps
✅ AI/ML Solutions
✅ Automation Systems
✅ API Integrations

💼 Enterprise-grade quality
⏰ Fast turnaround
💰 Competitive pricing

📞 WhatsApp: +234 818 002 1007
📧 ceo@amdsolutions007.com
🔗 https://linktr.ee/amdsolutions007

Let's discuss your project! What do you need?""",

    'pricing': """💰 PRICING OVERVIEW

📄 CV Services: ₦5K - ₦15K
💻 Source Code: ₦15K - ₦50K
🚀 Custom Development: Quote-based
📚 Tech Consulting: ₦10K/hour

📞 WhatsApp: +234 818 002 1007
📧 ceo@amdsolutions007.com
🌐 https://amdsolutions007.com
🔗 https://linktr.ee/amdsolutions007

What service are you interested in?"""
}

def detect_intent(message):
    """Detect user intent from message"""
    msg = message.lower()
    
    # CV Service
    if any(word in msg for word in ['cv', 'resume', 'job', 'ats', 'curriculum']):
        return 'cv'
    
    # Source code
    if any(word in msg for word in ['source', 'code', 'project', 'final year', 'fyp', 'catalog']):
        return 'source_code'
    
    # Custom development
    if any(word in msg for word in ['develop', 'build', 'website', 'app', 'software', 'custom']):
        return 'custom'
    
    # Pricing
    if any(word in msg for word in ['price', 'cost', 'how much', 'pricing']):
        return 'pricing'
    
    # Default greeting
    return 'greeting'

def main():
    """Main auto-responder loop"""
    
    print("📱 SETUP INSTRUCTIONS:")
    print()
    print("1. This will open WhatsApp Web in a browser")
    print("2. Scan the QR code with your phone:")
    print("   - Open WhatsApp on your phone")
    print("   - Tap Menu → Linked Devices → Link a Device")
    print("   - Scan the QR code")
    print()
    print("3. Once connected, the bot will:")
    print("   ✅ Monitor all incoming messages")
    print("   ✅ Detect intent (CV, source code, etc.)")
    print("   ✅ Send automatic responses")
    print("   ✅ Run 24/7 in background")
    print()
    print("=" * 60)
    print()
    
    # Configure Chrome driver
    chrome_options = Options()
    chrome_options.add_argument("--user-data-dir=./whatsapp_session")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    print("⏳ Starting browser...")
    
    try:
        # Initialize driver
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("https://web.whatsapp.com")
        
        print("✅ WhatsApp Web opened!")
        print()
        print("👀 Please scan QR code with your phone...")
        print("   (Waiting for connection...)")
        print()
        
        # Wait for WhatsApp to load (QR code scan)
        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-icon='chat']"))
        )
        
        print("✅ Connected to WhatsApp!")
        print()
        print("🤖 Auto-responder is now ACTIVE!")
        print("📱 Monitoring incoming messages...")
        print("💬 Press Ctrl+C to stop")
        print()
        print("=" * 60)
        print()
        
        # Track responded messages
        responded = set()
        
        # Main monitoring loop
        while True:
            try:
                # Find unread messages
                unread_messages = driver.find_elements(By.CSS_SELECTOR, "span[data-icon='new-chat-outline']")
                
                for _ in unread_messages:
                    # Click on chat
                    _.click()
                    time.sleep(1)
                    
                    # Get message text
                    messages = driver.find_elements(By.CSS_SELECTOR, "div.message-in span.selectable-text")
                    
                    if messages:
                        latest_message = messages[-1].text
                        message_id = hash(latest_message + str(time.time()))
                        
                        if message_id not in responded:
                            print(f"📨 New message: {latest_message[:50]}...")
                            
                            # Detect intent and get response
                            intent = detect_intent(latest_message)
                            response = RESPONSES[intent]
                            
                            print(f"🤖 Intent detected: {intent}")
                            print(f"📤 Sending response...")
                            
                            # Type response
                            input_box = driver.find_element(By.CSS_SELECTOR, "div[contenteditable='true']")
                            input_box.send_keys(response)
                            time.sleep(0.5)
                            
                            # Send message
                            send_button = driver.find_element(By.CSS_SELECTOR, "button[data-icon='send']")
                            send_button.click()
                            
                            print(f"✅ Response sent!")
                            print(f"⏰ {time.strftime('%Y-%m-%d %H:%M:%S')}")
                            print("-" * 60)
                            print()
                            
                            # Mark as responded
                            responded.add(message_id)
                            
                            time.sleep(2)
                
                # Wait before next check
                time.sleep(5)
                
            except Exception as e:
                print(f"⚠️  Error in message loop: {e}")
                time.sleep(10)
                continue
    
    except KeyboardInterrupt:
        print()
        print("=" * 60)
        print("🛑 Stopping auto-responder...")
        print("✅ Session saved!")
        print("👋 Goodbye!")
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("💡 Troubleshooting:")
        print("   - Make sure Chrome/Chromium is installed")
        print("   - Install selenium: pip3 install selenium")
        print("   - Install ChromeDriver: brew install chromedriver")
        print()
    
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    main()
