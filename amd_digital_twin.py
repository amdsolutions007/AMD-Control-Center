#!/usr/bin/env python3
"""
AMD DIGITAL TWIN - Travel Mode Email Bot
========================================
Mimics human CEO behavior while traveling.
Sends emails slowly (30-60 min gaps) to avoid spam detection.

PROTOCOL 007 COMPLIANT:
- Official SMTP (Namecheap Private Email)
- Human-like timing patterns
- Daily rate limit (5 emails/day)
- SSL encryption

Created: January 27, 2026
"""

import smtplib
import ssl
import time
import random
import os
from datetime import datetime, date
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ========================= CONFIGURATION =========================

SMTP_SERVER = "mail.privateemail.com"
SMTP_PORT = 465  # SSL port
SMTP_USER = "ceo@amdsolutions007.com"
SMTP_PASS = os.getenv("SMTP_PASS")

# Email targets (Agency pitches)
EMAIL_TARGETS = [
    {
        "to": "jobs@example.com",
        "subject": "Agency Partnership - AMD Solutions 007",
        "name": "Hiring Manager"
    },
    {
        "to": "hr@techstartup.com",
        "subject": "Cost-Effective Development Alternative",
        "name": "HR Team"
    },
    {
        "to": "contact@businessowner.com",
        "subject": "Website & App Development Agency",
        "name": "Business Owner"
    },
    # Add more targets as needed
]

# Rate limits (PROTOCOL 007: Stay under radar)
MAX_EMAILS_PER_DAY = 5
MIN_SLEEP_SECONDS = 1800  # 30 minutes
MAX_SLEEP_SECONDS = 3600  # 60 minutes

# Tracking file
SENT_LOG_FILE = "data/digital_twin_sent.log"

# ========================= EMAIL TEMPLATES =========================

def get_agency_pitch(recipient_name: str) -> str:
    """Generate personalized agency pitch"""
    
    templates = [
        f"""Hello {recipient_name},

I noticed your team is hiring developers. Before committing to a full-time salary, have you considered an agency partnership?

AMD Solutions 007 provides:
✅ Full-stack development (React, Node.js, Python, Flutter)
✅ No recruitment overhead or payroll burden
✅ Flexible scaling - pay only for delivery
✅ 10+ years combined experience

We've helped 15+ businesses across Nigeria and UK launch their digital products without the risk of bad hires.

Would you be open to a 15-minute call this week?

Best regards,
**Ademola Otun**  
CEO, AMD Solutions 007  
📧 ceo@amdsolutions007.com  
🌐 amdsolutions007.com  
📱 WhatsApp: +234 816 658 7770
""",
        
        f"""Hi {recipient_name},

Quick question: What's the total cost of a bad developer hire?

(Recruitment fees + 3-6 months salary + project delays = ₦5M+)

AMD Solutions 007 offers a smarter alternative:
• No recruitment risk
• No payroll commitments
• Proven track record (15+ successful projects)
• Same expertise, flexible terms

We specialize in web apps, mobile apps, and automation systems.

Can I send you our portfolio and case studies?

Regards,
**Ademola Otun**  
Founder & CEO  
AMD Solutions 007  
ceo@amdsolutions007.com
""",
        
        f"""Dear {recipient_name},

I help businesses avoid the "hiring trap."

Instead of spending 3-6 months recruiting (and risking a bad fit), we deliver your project in weeks with an experienced agency team.

**What we do:**
- Full-stack web development
- Mobile apps (iOS/Android)
- API integrations & automation
- Cloud deployment (AWS, Railway, Vercel)

**Why agencies win:**
- Faster delivery (no onboarding lag)
- Lower risk (no long-term commitment)
- Higher quality (peer-reviewed code)

Would you like to see how we've helped companies like yours?

Best,
**Ademola Otun**  
AMD Solutions 007  
📧 ceo@amdsolutions007.com  
💼 LinkedIn: linkedin.com/in/ademolaotun
"""
    ]
    
    return random.choice(templates)

# ========================= CORE FUNCTIONS =========================

def human_sleep():
    """Mimic human behavior with random sleep (30-60 mins)"""
    duration = random.randint(MIN_SLEEP_SECONDS, MAX_SLEEP_SECONDS)
    minutes = duration / 60
    
    print(f"💤 [Human Mode] Resting for {minutes:.1f} mins...")
    print(f"   Next email at: {datetime.now().strftime('%I:%M %p')}")
    
    time.sleep(duration)

def get_sent_count_today() -> int:
    """Count emails sent today"""
    if not os.path.exists(SENT_LOG_FILE):
        return 0
    
    today = date.today().isoformat()
    count = 0
    
    with open(SENT_LOG_FILE, "r") as f:
        for line in f:
            if line.startswith(today):
                count += 1
    
    return count

def log_sent_email(recipient: str):
    """Log sent email with timestamp"""
    os.makedirs(os.path.dirname(SENT_LOG_FILE), exist_ok=True)
    
    timestamp = datetime.now().isoformat()
    with open(SENT_LOG_FILE, "a") as f:
        f.write(f"{timestamp} | {recipient}\n")

def send_email(target: dict) -> bool:
    """Send single email via Namecheap SMTP"""
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["From"] = f"Ademola Otun <{SMTP_USER}>"
        msg["To"] = target["to"]
        msg["Subject"] = target["subject"]
        
        # Generate personalized body
        body = get_agency_pitch(target["name"])
        msg.attach(MIMEText(body, "plain"))
        
        # Create SSL context
        context = ssl.create_default_context()
        
        # Connect and send
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        
        print(f"✅ Email sent to: {target['to']}")
        print(f"   Subject: {target['subject']}")
        
        log_sent_email(target["to"])
        return True
        
    except Exception as e:
        print(f"❌ Failed to send to {target['to']}: {e}")
        return False

def validate_config():
    """Validate SMTP configuration"""
    if not SMTP_PASS:
        print("❌ ERROR: SMTP_PASS not found in .env file")
        print("   Please create .env with:")
        print("   SMTP_PASS=your_password_here")
        return False
    
    if not EMAIL_TARGETS:
        print("❌ ERROR: No email targets configured")
        return False
    
    return True

# ========================= MAIN LOOP =========================

def main():
    """Main execution loop - runs indefinitely"""
    
    print("=" * 60)
    print("🤖 AMD DIGITAL TWIN - TRAVEL MODE ACTIVATED")
    print("=" * 60)
    print(f"📧 SMTP: {SMTP_USER}")
    print(f"⏱️  Human delay: {MIN_SLEEP_SECONDS//60}-{MAX_SLEEP_SECONDS//60} minutes")
    print(f"📊 Daily limit: {MAX_EMAILS_PER_DAY} emails")
    print("=" * 60)
    print()
    
    # Validate configuration
    if not validate_config():
        return
    
    print("✅ Configuration valid")
    print("🚀 Starting email sequence...\n")
    
    target_index = 0
    
    while True:
        try:
            # Check daily limit
            sent_today = get_sent_count_today()
            
            if sent_today >= MAX_EMAILS_PER_DAY:
                now = datetime.now()
                print(f"⏸️  Daily limit reached ({sent_today}/{MAX_EMAILS_PER_DAY})")
                print(f"   Sleeping until tomorrow...")
                
                # Sleep until midnight + random offset (1-3 hours)
                tomorrow = datetime.combine(date.today().replace(day=date.today().day + 1), datetime.min.time())
                offset = random.randint(3600, 10800)  # 1-3 hours
                sleep_duration = (tomorrow - now).total_seconds() + offset
                
                time.sleep(sleep_duration)
                continue
            
            # Get next target
            if target_index >= len(EMAIL_TARGETS):
                target_index = 0  # Loop back to start
            
            target = EMAIL_TARGETS[target_index]
            
            # Send email
            print(f"📤 [{sent_today + 1}/{MAX_EMAILS_PER_DAY}] Sending to: {target['to']}")
            success = send_email(target)
            
            if success:
                target_index += 1
                
                # Human-like sleep
                if sent_today + 1 < MAX_EMAILS_PER_DAY:
                    human_sleep()
            else:
                print("⚠️  Failed to send, skipping to next target")
                target_index += 1
                time.sleep(60)  # Short delay before retry
            
        except KeyboardInterrupt:
            print("\n\n⏹️  Digital Twin stopped by user")
            break
        
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            print("⏸️  Sleeping 5 minutes before retry...")
            time.sleep(300)

if __name__ == "__main__":
    main()
