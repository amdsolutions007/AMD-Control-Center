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

# ========================= DIGITAL DNA (AI CONTEXT) =========================

USER_CONTEXT = """
═══════════════════════════════════════════════════════════════════════
                    AMD SOLUTIONS 007 - DIGITAL DNA
                      "Illuminating the Digital Dark"
═══════════════════════════════════════════════════════════════════════

CORE IDENTITY:
Name: Olawale Shoyemi (Solutions 007)
Role: Founder & Lead Architect
Tagline: "Illuminating the Digital Dark."
Philosophy: "We believe business problems are just lack of data. We use AI and 
custom software engineering to solve them with military-grade intelligence."

═══════════════════════════════════════════════════════════════════════
THE MANIFESTO
═══════════════════════════════════════════════════════════════════════

🌑 THE DIGITAL DARK:
In today's business landscape, companies drown in data but starve for insights. 
They operate in darkness, making decisions without the intelligence needed to 
navigate competitive markets. Traditional agencies offer cookie-cutter solutions 
that don't address the core problem: the absence of customized, intelligent systems.

💡 OUR ILLUMINATION:
We are developers first, not just marketers. We build proprietary AI tools that 
turn your data into actionable intelligence. Our hybrid approach combines Custom 
Software Engineering (Python/AI) with Creative Media (Video/Ads) to create growth 
systems that actually work.

🎯 THE SOLUTIONS 007 PHILOSOPHY:
"Working Smartly. Solutions to Every Dark Cloud."
We don't believe in working harder—we believe in working smarter. Every challenge 
is an opportunity for innovation. Every "dark cloud" in your business has a solution 
waiting to be engineered. Our mission is to illuminate your path with elite precision 
and military-grade intelligence.

═══════════════════════════════════════════════════════════════════════
TECHNOLOGY ARSENAL (Proprietary AI Tools)
═══════════════════════════════════════════════════════════════════════

📊 SkyCap AI - Financial Market Intelligence
Advanced AI system for analyzing financial markets, tracking trends, and generating 
actionable investment intelligence. Built for traders and investment firms who need 
real-time data interpretation.
→ Use Case: Finance sector, trading firms, investment companies

🎵 Shine AI - Music & Entertainment Analytics
Specialized platform for artists, labels, and entertainment brands. Analyzes streaming 
data, audience behavior, and campaign performance to maximize reach and revenue in the 
music industry.
→ Use Case: Musicians, record labels, entertainment marketing

🚀 NaijaBiz Assist - Local Business Scaling Engine
AI-powered growth assistant designed for Nigerian SMEs. Provides market insights, 
competitor analysis, and automated marketing strategies tailored to the African 
business landscape.
→ Use Case: Nigerian startups, SMEs, local businesses scaling up

✈️ Japa Readiness Calculator - Migration Analytics Platform
Comprehensive assessment tool for professionals planning international relocation. 
Analyzes financial readiness, skill marketability, and visa eligibility using 
AI-driven data models.
→ Use Case: HR firms, migration consultants, professionals relocating

═══════════════════════════════════════════════════════════════════════
PORTFOLIO STATS & PROOF
═══════════════════════════════════════════════════════════════════════

📈 24 Active Projects (Real-time production systems)
💻 50K+ Lines of Code (Battle-tested, deployed)
🌐 12 Social Platforms (Omnichannel presence)
🛠️ Tech Stack: Python, Next.js, AI/ML, React, Node.js
🎨 Services: Custom AI Systems + Creative Media Production

═══════════════════════════════════════════════════════════════════════
CONTACT INTELLIGENCE
═══════════════════════════════════════════════════════════════════════

📞 Official Line: +234 818 002 1007
📱 WhatsApp Hotline: +234 811 377 5880 (Priority Channel)
✉️ CEO Direct: ceo@amdsolutions007.com
🌐 Web: amdsolutions007.com
💼 LinkedIn: Professional Network Available

═══════════════════════════════════════════════════════════════════════
VALUE PROPOSITION (Why Agency > Hiring)
═══════════════════════════════════════════════════════════════════════

✅ No Recruitment Risk (Proven team, no trial-and-error)
✅ No Payroll Burden (Pay for delivery, not salaries)
✅ Military-Grade Intelligence (Custom AI, not generic tools)
✅ Developer-First Approach (We build solutions, not presentations)
✅ Proven Track Record (24 live projects, real results)

═══════════════════════════════════════════════════════════════════════
TONE & VOICE GUIDELINES FOR AI
═══════════════════════════════════════════════════════════════════════

🎯 Use These Phrases:
- "Military-grade intelligence"
- "Illuminating the digital dark"
- "We are developers first"
- "Turn data into actionable intelligence"
- "Elite precision and innovation"

🚫 Avoid These:
- Generic freelancer language
- "We offer services" (too vague)
- Over-promising without proof
- Salesy/desperate tone

✅ Ideal Tone: Confident, technical, precise, elite-level professional
"""

# ========================= CONFIGURATION =========================

SMTP_SERVER = "mail.privateemail.com"
SMTP_PORT = 587  # STARTTLS port (465 blocked on some networks)
SMTP_USER = "ceo@amdsolutions007.com"
SMTP_PASS = os.getenv("SMTP_PASS")

# Email targets (Agency pitches)
EMAIL_TARGETS = [
    {
        "to": "amdmediaoffice@gmail.com",
        "subject": "🧪 Digital Twin Test - AMD Solutions 007",
        "name": "Ademola"
    },
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

I noticed your team is hiring developers. Here's a question: are you recruiting because you need tasks done, or because you need intelligence-driven solutions?

Most companies operate in what we call the "Digital Dark"—drowning in data but starving for actionable insights.

AMD Solutions 007 takes a different approach:
✅ Military-grade intelligence: We build proprietary AI systems, not cookie-cutter websites
✅ Developers first: 24 active projects, 50K+ lines of production code
✅ Zero recruitment risk: No payroll burden, no bad hire costs
✅ Tech Stack: Python, Next.js, AI/ML, React (battle-tested)

We don't believe in working harder—we believe in working smarter. Every challenge is an opportunity for innovation.

Would you be open to a 15-minute strategy session this week?

--------------------------------------------------
Best regards,

Olawale Shoyemi
CEO, AMD Solutions 007
✉️ ceo@amdsolutions007.com
🌐 amdsolutions007.com
📞 Official: +234 818 002 1007
📱 WhatsApp: +234 811 377 5880
--------------------------------------------------
""",
        
        f"""Hi {recipient_name},

Quick calculation: What's the true cost of a bad developer hire?

(Recruitment fees + 3-6 months salary + project delays = ₦5M+ wasted)

AMD Solutions 007 illuminates a smarter path:

🎯 We are developers first, not just marketers
📊 24 active projects, 50K+ lines of deployed code
🤖 Proprietary AI tools (SkyCap AI, Shine AI, NaijaBiz Assist)
💡 Custom software engineering meets creative media
⚡ No payroll burden, no recruitment gamble

Our philosophy: "Business problems are just lack of data. We solve them with military-grade intelligence."

Can I send you our technology arsenal and case studies?

--------------------------------------------------
Best regards,

Olawale Shoyemi
CEO, AMD Solutions 007
✉️ ceo@amdsolutions007.com
🌐 amdsolutions007.com
📞 Official: +234 818 002 1007
📱 WhatsApp: +234 811 377 5880
--------------------------------------------------
""",
        
        f"""Dear {recipient_name},

Most businesses operate in the "Digital Dark"—they have data, but no intelligence.

Traditional agencies offer cookie-cutter solutions. Traditional hiring is a 3-6 month gamble.

We offer something different: **Elite precision and innovation.**

🛠️ What We Build:
• Custom AI systems (not generic templates)
• Full-stack applications (Next.js, React, Python)
• Automated growth engines (data → intelligence → results)
• Creative media production (video, ads, content)

💼 Why Agencies Beat Hiring:
• Faster delivery (no onboarding lag)
• Zero recruitment risk (proven team)
• Military-grade intelligence (custom AI tools)
• Proven track: 24 live projects, 50K+ lines shipped

"Working Smartly. Solutions to Every Dark Cloud."

Ready to illuminate your business trajectory?

--------------------------------------------------
Best regards,

Olawale Shoyemi
CEO, AMD Solutions 007
✉️ ceo@amdsolutions007.com
🌐 amdsolutions007.com
📞 Official: +234 818 002 1007
📱 WhatsApp: +234 811 377 5880
--------------------------------------------------
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
        msg["From"] = f"Olawale Shoyemi <{SMTP_USER}>"
        msg["To"] = target["to"]
        msg["Subject"] = target["subject"]
        
        # Generate personalized body
        body = get_agency_pitch(target["name"])
        msg.attach(MIMEText(body, "plain"))
        
        # Create SSL context
        context = ssl.create_default_context()
        # Namecheap Private Email compatibility
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        # Connect and send (using STARTTLS for port 587)
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls(context=context)
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
