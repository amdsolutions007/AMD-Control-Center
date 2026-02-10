#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
AMD NEXUS - AUTONOMOUS CONTENT & LEAD ENGINE
═══════════════════════════════════════════════════════════════════════════
Mission: Keep AMD Solutions alive and generating revenue on full autopilot
Status: ACTIVATED - Run daily at 10:00 AM WAT
Author: AMD Solutions 007
═══════════════════════════════════════════════════════════════════════════
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple
from openai import OpenAI
from telegram import Bot
import asyncio

# ==================== CONFIGURATION ====================

BASE_DIR = Path(__file__).parent
DATABASE_PATH = BASE_DIR / "lead_engine" / "data" / "leads.db"
MANUAL_POSTS_DIR = BASE_DIR / "nexus_output"
MANUAL_POSTS_DIR.mkdir(exist_ok=True)

# API Credentials
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()

# LinkedIn API (if configured)
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN", "").strip()
LINKEDIN_PERSON_URN = os.getenv("LINKEDIN_PERSON_URN", "").strip()

# Twitter/X API (if configured)
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY", "").strip()
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET", "").strip()
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN", "").strip()
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET", "").strip()

# ==================== COMPANY IDENTITY ====================

COMPANY_PROFILE = {
    "name": "AMD Solutions 007",
    "ceo": "Olawale Ahmed Shoyemi",
    "nickname": "Solutions",
    "mission": "Bringing Light to Every Dark Issue",
    "tagline": "Automating the Future while Honoring our Roots",
    "founded": "2011 (as AMD Media Office)",
    "evolution": "From digital media powerhouse to AI & Software Development Agency",
    "phone": "+234 818 002 1007",
    "email": "ceo@amdsolutions007.com",
    "website": "https://amdsolutions007.com",
    "portfolio": "https://amdsolutions007.github.io",
    "linktree": "https://linktr.ee/amdsolutions007",
    "location": "Lagos, Nigeria",
    
    "services": [
        "AI Automation (WhatsApp Chatbots - NaijaBiz Pilot)",
        "Custom Software Development",
        "High-Performance Websites & Apps",
        "Digital Marketing & Targeted Ads",
        "Business Intelligence & Data Analytics",
        "CV Writing & Career Services"
    ],
    
    "achievements": [
        "19+ completed projects across 6 sectors",
        "₦2.5B+ generated for clients",
        "3 Pharmacy Management Systems",
        "5 Restaurant POS Systems",
        "4 School Management Platforms",
        "8 E-commerce Websites"
    ],
    
    "philosophy": [
        "New technology is expensive. It is for those who can afford the best.",
        "We build solutions for EVERY Nigerian business - from market traders to banks.",
        "Excellence is not an act, but a habit.",
        "Licensed to solve impossible problems."
    ],
    
    "tone": "Professional, Visionary, Confident (007-style intelligence meets Nigerian excellence)"
}

# ==================== AI CONTENT GENERATOR ====================

def generate_daily_content() -> Dict[str, str]:
    """Generate fresh content for all platforms using OpenAI"""
    
    if not OPENAI_API_KEY:
        raise ValueError("❌ OPENAI_API_KEY not set - AI cannot operate")
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # Get today's date for uniqueness
    today = datetime.now().strftime("%B %d, %Y")
    
    system_prompt = f"""You are the AI voice of {COMPANY_PROFILE['name']}, speaking as {COMPANY_PROFILE['ceo']} (known as "{COMPANY_PROFILE['nickname']}").

COMPANY IDENTITY:
- Founded: {COMPANY_PROFILE['founded']}
- Mission: {COMPANY_PROFILE['mission']}
- Services: {', '.join(COMPANY_PROFILE['services'][:3])}
- Achievements: {', '.join(COMPANY_PROFILE['achievements'][:3])}
- Philosophy: {COMPANY_PROFILE['philosophy'][0]}

TONE & STYLE:
- Professional, Visionary, Confident (007-class intelligence)
- Focus on Nigerian businesses and African tech ecosystem
- Mix technical expertise with business results
- Use data/statistics when possible
- End with clear call-to-action

RULES:
1. Never say "As an AI" - you ARE Olawale Shoyemi (CEO)
2. Always include real value (tips, insights, data)
3. Make it relatable to Nigerian SMEs
4. Sign off as: "Olawale Shoyemi | AMD Solutions 007"
5. Keep LinkedIn formal, X punchy, Telegram direct

Today's date: {today}
Generate content that hasn't been posted before."""

    print(f"\n🤖 Generating AI Content (Date: {today})...")
    
    try:
        # Generate LinkedIn Post (Long-form, professional)
        linkedin_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"""Generate a HIGH-IMPACT LinkedIn post for Nigerian business owners.

REQUIREMENTS:
- Topic: Choose from (AI automation, digital transformation, Nigerian tech ecosystem, business growth strategies, cybersecurity)
- Length: 250-350 words
- Structure: Hook → Insight → Value/Data → Call-to-Action
- Include 1-2 relevant statistics or case studies
- End with: "Need help with [topic]? Let's talk: +234 818 002 1007"
- Add 3-5 relevant hashtags (#NigerianTech #AIforBusiness #DigitalTransformation #Lagos #SMEs)

🚨 CRITICAL: If topic involves African Tech Ecosystem or community building, MUST end with:
"👇 Join the Ecosystem HQ:
🔗 www.amdsolutions007.com/tech 🚀"

Make it VALUABLE (not salesy). Teach something useful."""}
            ],
            temperature=0.8
        )
        linkedin_content = linkedin_response.choices[0].message.content.strip()
        
        # Generate X/Twitter Thread (3 tweets, punchy)
        twitter_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"""Generate a 3-tweet thread for X (Twitter).

REQUIREMENTS:
- Each tweet: Max 280 characters
- Topic: Same as LinkedIn post (but condensed)
- Tweet 1: Hook (surprising stat or bold claim)
- Tweet 2: Insight/Value (quick tip or lesson)
- Tweet 3: CTA + Contact (WhatsApp: +234 818 002 1007)
- Use emojis strategically (max 2 per tweet)
- Include hashtags in final tweet only

🚨 CRITICAL: If topic involves African Tech Ecosystem, Tweet 3 MUST include:
"👇 Join: www.amdsolutions007.com/tech 🚀"

Format as:
[TWEET 1]
...

[TWEET 2]
...

[TWEET 3]
..."""}
            ],
            temperature=0.9
        )
        twitter_thread = twitter_response.choices[0].message.content.strip()
        
        # Generate Telegram Broadcast (Direct, personal)
        telegram_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"""Generate a Telegram broadcast message.

REQUIREMENTS:
- Length: 150-200 words
- Tone: Direct, personal, like a WhatsApp message from CEO to friends
- Topic: Same as LinkedIn post (but more conversational)
- Start with: "Good morning! Quick insight..."
- Include actionable tip
- End with: "Questions? Hit reply or call: +234 818 002 1007"
- NO hashtags (Telegram is personal)

🚨 CRITICAL: If topic involves African Tech Ecosystem, MUST include:
"👇 Join the Ecosystem HQ: www.amdsolutions007.com/tech 🚀"

Make it feel like a message from a trusted friend."""}
            ],
            temperature=0.8
        )
        telegram_content = telegram_response.choices[0].message.content.strip()
        
        # Generate Video Script (15-30 seconds, faceless)
        video_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"""Generate a 15-30 second video script for YouTube Shorts/Snapchat.

REQUIREMENTS:
- Format: TEXT-ON-SCREEN (no face, just text + background)
- Hook (0-3s): Attention-grabbing question or stat
- Value (3-20s): Quick tip or insight
- CTA (20-30s): "Follow @amdsolutions007" or "Visit amdsolutions007.com"
- Keep sentences SHORT (max 10 words per screen)
- Use emojis for visual interest

Format as:
[SCREEN 1] (0-3s)
...

[SCREEN 2] (3-10s)
...

[SCREEN 3] (10-20s)
...

[SCREEN 4] (20-30s)
..."""}
            ],
            temperature=0.9
        )
        video_script = video_response.choices[0].message.content.strip()
        
        # Generate Manual Post (Facebook/Instagram/TikTok)
        manual_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"""Generate a caption for Facebook/Instagram/TikTok.

REQUIREMENTS:
- Length: 150-200 words
- Tone: Engaging, visual-friendly
- Topic: Same as LinkedIn post
- Start with emoji hook
- Include line breaks for readability
🚨 CRITICAL: If topic involves African Tech Ecosystem, MUST include BEFORE hashtags:
"👇 Join the Ecosystem HQ:
🔗 www.amdsolutions007.com/tech 🚀"

- End with CTA: "📞 WhatsApp: +234 818 002 1007" + "🌐 amdsolutions007.com"
- Add 10-15 hashtags (mix popular + niche)

Make it thumb-stopping (people scrolling fast)."""}
            ],
            temperature=0.8
        )
        manual_content = manual_response.choices[0].message.content.strip()
        
        print("✅ AI Content Generated Successfully")
        
        return {
            "linkedin": linkedin_content,
            "twitter": twitter_thread,
            "telegram": telegram_content,
            "video_script": video_script,
            "manual_post": manual_content,
            "generated_at": datetime.now().isoformat(),
            "date": today
        }
        
    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        raise


# ==================== PLATFORM PUBLISHERS ====================

def post_to_linkedin(content: str) -> bool:
    """Post to LinkedIn using official API"""
    
    if not LINKEDIN_ACCESS_TOKEN or not LINKEDIN_PERSON_URN:
        print("⚠️ LinkedIn API not configured - Skipping")
        return False
    
    try:
        import requests
        
        url = "https://api.linkedin.com/v2/ugcPosts"
        
        headers = {
            "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        payload = {
            "author": f"urn:li:person:{LINKEDIN_PERSON_URN}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": content[:3000]},
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code in [200, 201]:
            print("✅ LinkedIn: Posted successfully")
            return True
        else:
            print(f"❌ LinkedIn: Failed ({response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ LinkedIn Error: {e}")
        return False


def post_to_twitter(thread: str) -> bool:
    """Post thread to X/Twitter using official API"""
    
    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        print("⚠️ Twitter API not configured - Skipping")
        return False
    
    try:
        import tweepy
        
        # Authenticate
        auth = tweepy.OAuthHandler(TWITTER_API_KEY, TWITTER_API_SECRET)
        auth.set_access_token(TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET)
        api = tweepy.API(auth)
        
        # Split thread into individual tweets
        tweets = [t.strip() for t in thread.split('[TWEET') if t.strip()]
        tweets = [t.split(']', 1)[1].strip() if ']' in t else t.strip() for t in tweets]
        
        # Post thread
        previous_tweet_id = None
        for i, tweet_text in enumerate(tweets[:3]):  # Max 3 tweets
            if previous_tweet_id:
                tweet = api.update_status(
                    status=tweet_text,
                    in_reply_to_status_id=previous_tweet_id,
                    auto_populate_reply_metadata=True
                )
            else:
                tweet = api.update_status(status=tweet_text)
            
            previous_tweet_id = tweet.id
            print(f"✅ Twitter: Tweet {i+1}/3 posted")
        
        return True
        
    except Exception as e:
        print(f"❌ Twitter Error: {e}")
        return False


def send_telegram_broadcast(content: str, bot: Bot) -> bool:
    """Send broadcast to Telegram channel"""
    
    if not TELEGRAM_CHAT_ID:
        print("⚠️ Telegram not configured - Skipping")
        return False
    
    try:
        bot.send_message(
            chat_id=TELEGRAM_CHAT_ID,
            text=content,
            parse_mode="Markdown"
        )
        print("✅ Telegram: Broadcast sent")
        return True
        
    except Exception as e:
        print(f"❌ Telegram Error: {e}")
        return False


def save_manual_posts(content: Dict[str, str]):
    """Save manual posts to file for user to copy-paste"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = MANUAL_POSTS_DIR / f"manual_posts_{timestamp}.txt"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("═══════════════════════════════════════════════════════════════\n")
        f.write("AMD NEXUS - MANUAL POSTS FOR COPY-PASTE\n")
        f.write(f"Generated: {content['date']}\n")
        f.write("═══════════════════════════════════════════════════════════════\n\n")
        
        f.write("📘 FACEBOOK POST:\n")
        f.write("-" * 70 + "\n")
        f.write(content['manual_post'] + "\n\n")
        
        f.write("📷 INSTAGRAM CAPTION:\n")
        f.write("-" * 70 + "\n")
        f.write(content['manual_post'] + "\n\n")
        
        f.write("🎵 TIKTOK CAPTION:\n")
        f.write("-" * 70 + "\n")
        f.write(content['manual_post'] + "\n\n")
        
        f.write("🎬 VIDEO SCRIPT (YouTube Shorts/Snapchat):\n")
        f.write("-" * 70 + "\n")
        f.write(content['video_script'] + "\n\n")
        
        f.write("═══════════════════════════════════════════════════════════════\n")
        f.write("INSTRUCTIONS:\n")
        f.write("1. Copy the Facebook post → Paste to Facebook Business Page\n")
        f.write("2. Copy Instagram caption → Paste to Instagram post\n")
        f.write("3. Copy TikTok caption → Paste to TikTok video\n")
        f.write("4. Use Video Script to create text-on-screen video (CapCut, Canva)\n")
        f.write("═══════════════════════════════════════════════════════════════\n")
    
    print(f"✅ Manual Posts Saved: {filename}")
    return str(filename)


# ==================== AUTO-RESPONDER SYSTEM ====================

def analyze_lead_with_ai(lead_data: Dict) -> Tuple[str, str, int]:
    """
    Analyze lead quality using OpenAI
    Returns: (quality, reasoning, priority_score)
    """
    
    if not OPENAI_API_KEY:
        return ("MEDIUM", "OpenAI not configured", 50)
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": f"""You are the AI gatekeeper for {COMPANY_PROFILE['name']}.

Analyze incoming leads and categorize them:

HIGH QUALITY (90-100 points):
- Clear budget mentioned (₦500K+, $1K+)
- Urgent timeline (needs it ASAP, deadline mentioned)
- Decision maker (CEO, CTO, Business Owner)
- Specific requirements (not vague "I need a website")
- Professional language
- Company/business name mentioned

MEDIUM QUALITY (50-89 points):
- Some budget hints (but not explicit)
- Reasonable timeline
- Job title mentioned (but not C-level)
- Decent project description
- Professional tone

LOW QUALITY (0-49 points):
- No budget mentioned
- "Just asking" / "Just curious"
- Student project
- Free/volunteer work
- Unprofessional language
- Too vague ("I need help")
- Competitor fishing for info

SPAM (0 points):
- Obvious scam
- "Make money fast"
- Lottery/inheritance
- Click suspicious links"""
            }, {
                "role": "user",
                "content": f"""Analyze this lead:

Job Title: {lead_data.get('job_title', 'N/A')}
Description: {lead_data.get('job_description', 'N/A')[:500]}
Company: {lead_data.get('company_name', 'Unknown')}
Source: {lead_data.get('source', 'Unknown')}

Output ONLY this JSON format:
{{
  "quality": "HIGH|MEDIUM|LOW|SPAM",
  "score": 0-100,
  "reasoning": "Brief 1-sentence explanation",
  "recommended_action": "AUTO_RESPOND|DRAFT_PROPOSAL|ALERT_CEO|IGNORE"
}}"""
            }],
            temperature=0.3
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Parse JSON response
        import re
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            return (
                result.get('quality', 'MEDIUM'),
                result.get('reasoning', 'AI analysis'),
                result.get('score', 50)
            )
        else:
            return ("MEDIUM", "Failed to parse AI response", 50)
            
    except Exception as e:
        print(f"⚠️ AI Analysis Error: {e}")
        return ("MEDIUM", f"Error: {str(e)}", 50)


def generate_auto_response(lead_data: Dict, quality: str) -> str:
    """Generate automatic response based on lead quality"""
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    if quality == "LOW" or quality == "SPAM":
        # Polite auto-reply
        return f"""Hi,

Thank you for reaching out to AMD Solutions 007.

For general inquiries, please visit our website: https://amdsolutions007.com

For project quotes and consultations, WhatsApp us directly: +234 818 002 1007

Best regards,
AMD Solutions Team"""
    
    elif quality == "MEDIUM":
        # Qualifying response
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": f"""You are {COMPANY_PROFILE['ceo']}, CEO of {COMPANY_PROFILE['name']}.

Write a professional qualifying response that:
1. Thanks them for interest
2. Asks 2-3 qualifying questions (budget range, timeline, specific requirements)
3. Mentions our expertise briefly
4. Provides contact info
5. Sign as: "Olawale Shoyemi | CEO, AMD Solutions 007"

Tone: Professional, friendly, not desperate."""
            }, {
                "role": "user",
                "content": f"""Lead details:
Job Title: {lead_data.get('job_title', 'N/A')}
Description: {lead_data.get('job_description', 'N/A')[:300]}

Generate a qualifying response (150-200 words)."""
            }],
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    elif quality == "HIGH":
        # Full proposal draft
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": f"""You are {COMPANY_PROFILE['ceo']}, CEO of {COMPANY_PROFILE['name']}.

Write a WINNING proposal that:
1. Shows you understand their needs (reference specific requirements)
2. Explains how we'll solve it (high-level approach)
3. Highlights relevant experience (similar projects)
4. Provides price estimate (₦500K-2M range or "custom quote after discovery call")
5. Proposes next step (15-min discovery call)
6. Creates urgency (limited slots, high demand)
7. Sign as: "Olawale Shoyemi | CEO, AMD Solutions 007 | +234 818 002 1007"

Tone: Confident, professional, results-focused (not salesy)."""
            }, {
                "role": "user",
                "content": f"""HIGH-VALUE LEAD:
Job Title: {lead_data.get('job_title', 'N/A')}
Description: {lead_data.get('job_description', 'N/A')[:600]}
Company: {lead_data.get('company_name', 'Unknown')}

Generate a compelling proposal (300-400 words)."""
            }],
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()


def process_pending_leads(bot: Bot):
    """Process all new leads in database"""
    
    if not DATABASE_PATH.exists():
        print("⚠️ No leads database found")
        return
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Get unprocessed leads from last 24 hours
    cursor.execute('''
        SELECT id, job_title, job_description, company_name, source, email, lead_score
        FROM leads
        WHERE status = 'new'
        AND scraped_at > datetime('now', '-24 hours')
        ORDER BY lead_score DESC
        LIMIT 20
    ''')
    
    leads = cursor.fetchall()
    
    if not leads:
        print("✅ No new leads to process")
        conn.close()
        return
    
    print(f"\n🎯 Processing {len(leads)} new leads...")
    
    for lead_id, job_title, job_desc, company, source, email, score in leads:
        
        lead_data = {
            'job_title': job_title,
            'job_description': job_desc,
            'company_name': company,
            'source': source,
            'email': email,
            'lead_score': score
        }
        
        # AI Analysis
        quality, reasoning, ai_score = analyze_lead_with_ai(lead_data)
        
        print(f"\n📊 Lead #{lead_id}: {job_title[:50]}")
        print(f"   Quality: {quality} ({ai_score}/100)")
        print(f"   Reason: {reasoning}")
        
        if quality == "SPAM" or ai_score < 30:
            # Mark as ignored
            cursor.execute('UPDATE leads SET status = ? WHERE id = ?', ('spam', lead_id))
            print("   ⏭️ IGNORED (Spam/Low Quality)")
            
        elif quality == "LOW" or ai_score < 50:
            # Auto-respond with polite template
            auto_reply = generate_auto_response(lead_data, "LOW")
            cursor.execute('''
                UPDATE leads 
                SET status = ?, ai_draft_proposal = ?, notes = ? 
                WHERE id = ?
            ''', ('auto_responded', auto_reply, f"Auto-reply sent (Score: {ai_score})", lead_id))
            print("   📧 AUTO-REPLY SENT")
            
        elif quality == "MEDIUM":
            # Generate qualifying response, save as draft
            qualifying_response = generate_auto_response(lead_data, "MEDIUM")
            cursor.execute('''
                UPDATE leads 
                SET status = ?, ai_draft_proposal = ?, notes = ? 
                WHERE id = ?
            ''', ('draft_ready', qualifying_response, f"Qualifying response ready (Score: {ai_score})", lead_id))
            print("   📝 DRAFT CREATED (Needs review)")
            
        elif quality == "HIGH" or ai_score >= 80:
            # Generate full proposal, alert CEO
            proposal = generate_auto_response(lead_data, "HIGH")
            cursor.execute('''
                UPDATE leads 
                SET status = ?, ai_draft_proposal = ?, notes = ? 
                WHERE id = ?
            ''', ('hot_lead', proposal, f"HIGH-VALUE LEAD! Score: {ai_score}", lead_id))
            
            # ALERT CEO via Telegram
            alert_message = f"""🚨 **HIGH-VALUE LEAD DETECTED!**

📊 Quality Score: {ai_score}/100
🏢 Company: {company or 'Unknown'}
📌 Project: {job_title[:100]}

💰 **ACTION REQUIRED:**
Proposal drafted and ready to send.

📄 View Lead: Railway Dashboard (Lead #{lead_id})
📞 Contact: {email or 'No email provided'}

⚡ **RESPOND WITHIN 2 HOURS FOR BEST CONVERSION**

---
AMD NEXUS Auto-Responder"""
            
            try:
                bot.send_message(
                    chat_id=TELEGRAM_CHAT_ID,
                    text=alert_message,
                    parse_mode="Markdown"
                )
                print("   🚨 CEO ALERTED (Telegram)")
            except Exception as e:
                print(f"   ⚠️ Failed to alert CEO: {e}")
    
    conn.commit()
    conn.close()
    print("\n✅ Lead processing complete")


# ==================== MAIN EXECUTION ====================

def run_daily_automation():
    """Execute full daily automation sequence"""
    
    print("═" * 70)
    print("🚀 AMD NEXUS - AUTONOMOUS ENGINE")
    print(f"⏰ Execution Time: {datetime.now().strftime('%B %d, %Y - %I:%M %p WAT')}")
    print("═" * 70)
    
    # Validate OpenAI (Critical)
    if not OPENAI_API_KEY:
        print("❌ FATAL: OPENAI_API_KEY not set")
        print("Export it: export OPENAI_API_KEY='sk-...'")
        sys.exit(1)
    
    # Initialize Telegram bot
    bot = None
    if TELEGRAM_BOT_TOKEN:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)
        print("✅ Telegram Bot: Connected")
    else:
        print("⚠️ Telegram not configured")
    
    # STEP 1: Generate AI Content
    print("\n" + "=" * 70)
    print("STEP 1: GENERATING AI CONTENT")
    print("=" * 70)
    
    try:
        content = generate_daily_content()
    except Exception as e:
        print(f"❌ Content Generation Failed: {e}")
        if bot:
            bot.send_message(
                chat_id=TELEGRAM_CHAT_ID,
                text=f"⚠️ AMD NEXUS: Content generation failed\nError: {str(e)}"
            )
        sys.exit(1)
    
    # STEP 2: Post to Automated Platforms
    print("\n" + "=" * 70)
    print("STEP 2: PUBLISHING TO PLATFORMS")
    print("=" * 70)
    
    linkedin_success = post_to_linkedin(content['linkedin'])
    twitter_success = post_to_twitter(content['twitter'])
    telegram_success = send_telegram_broadcast(content['telegram'], bot) if bot else False
    
    # STEP 3: Save Manual Posts
    print("\n" + "=" * 70)
    print("STEP 3: SAVING MANUAL POSTS")
    print("=" * 70)
    
    manual_file = save_manual_posts(content)
    
    # STEP 4: Process Leads (Auto-Responder)
    print("\n" + "=" * 70)
    print("STEP 4: PROCESSING LEADS (AUTO-RESPONDER)")
    print("=" * 70)
    
    if bot:
        process_pending_leads(bot)
    else:
        print("⚠️ Skipping lead processing (Telegram not configured)")
    
    # STEP 5: Send Daily Report to CEO
    print("\n" + "=" * 70)
    print("STEP 5: SENDING DAILY REPORT")
    print("=" * 70)
    
    if bot:
        report = f"""📊 **AMD NEXUS DAILY REPORT**
Date: {content['date']}

**CONTENT PUBLISHED:**
✅ LinkedIn: {'Posted' if linkedin_success else 'Skipped'}
✅ X/Twitter: {'Posted' if twitter_success else 'Skipped'}
✅ Telegram: {'Posted' if telegram_success else 'Skipped'}
📁 Manual Posts: Saved to nexus_output/

**LEADS PROCESSED:**
Check Railway dashboard for new proposals.

**ACTION REQUIRED:**
1. Copy-paste manual posts to Facebook/Instagram/TikTok
2. Review high-value lead proposals
3. Respond to hot leads within 2 hours

Manual Posts File: {manual_file}

---
AMD NEXUS running on autopilot 🤖"""
        
        try:
            bot.send_message(
                chat_id=TELEGRAM_CHAT_ID,
                text=report,
                parse_mode="Markdown"
            )
            print("✅ Daily report sent to CEO")
        except Exception as e:
            print(f"⚠️ Failed to send report: {e}")
    
    print("\n" + "═" * 70)
    print("✅ AMD NEXUS: MISSION COMPLETE")
    print("═" * 70)
    print("\nNext Execution: Tomorrow at 10:00 AM WAT")
    print("To run manually: python3 amd_nexus.py")
    print("\n💡 Company stays alive even when you're offline.")
    print("💡 High-value leads get proposals automatically.")
    print("💡 CEO only steps in when money is ready.")


if __name__ == "__main__":
    run_daily_automation()
