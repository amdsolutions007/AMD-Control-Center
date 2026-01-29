#!/usr/bin/env python3
"""
AMD SOCIAL MANAGER - Autonomous Multi-Platform Content Engine
Handles LinkedIn, Twitter/X, Telegram, YouTube, Snapchat posting.
Runs 2x daily: Morning (9 AM) + Evening (6 PM) WAT.
"""

import os
import time
import random
from datetime import datetime, timedelta
import requests
from openai import OpenAI

# Import company intelligence
try:
    from amd_dna import COMPANY_INTEL, get_random_project, get_identity
except ImportError:
    print("⚠️ amd_dna.py not found. Using basic fallback.")
    COMPANY_INTEL = {"IDENTITY": {"name": "AMD Solutions 007"}}

# ==================== CONFIGURATION ====================

# OpenAI
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# LinkedIn
LINKEDIN_ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN', '')
LINKEDIN_PERSON_URN = os.getenv('LINKEDIN_PERSON_URN', '')  # urn:li:person:XXXXXXXXX

# Twitter/X
TWITTER_API_KEY = os.getenv('TWITTER_API_KEY', '')
TWITTER_API_SECRET = os.getenv('TWITTER_API_SECRET', '')
TWITTER_ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN', '')
TWITTER_ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET', '')

# Telegram
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHANNEL_ID = os.getenv('TELEGRAM_CHANNEL_ID', '@amd_solutions')  # @channel_name or -100123456789

# YouTube
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')
YOUTUBE_CHANNEL_ID = os.getenv('YOUTUBE_CHANNEL_ID', '')

# Snapchat (requires Business API access)
SNAPCHAT_ACCESS_TOKEN = os.getenv('SNAPCHAT_ACCESS_TOKEN', '')
SNAPCHAT_AD_ACCOUNT_ID = os.getenv('SNAPCHAT_AD_ACCOUNT_ID', '')

# Posting Schedule (WAT timezone - UTC+1)
MORNING_HOUR = 9   # 9 AM
EVENING_HOUR = 18  # 6 PM

# ==================== OPENAI CLIENT ====================

client = None
if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
else:
    print("⚠️ No OPENAI_API_KEY - using template content only")

# ==================== CONTENT GENERATION ====================

def generate_content(platform, tone, max_length):
    """Generate platform-specific content using OpenAI"""
    
    if not client:
        # Fallback templates
        templates = {
            "linkedin": "🚀 Building AI systems that generate real revenue. 24 projects deployed. ₦2.5B+ for clients. #NaijaTech #AI",
            "twitter": "💰 FinTech, PropTech, LegalTech - we build it all. 50K+ lines of production code. DM for discovery call.",
            "telegram": "📊 New case study: How we helped a Nigerian startup 5x their revenue with AI. Link in bio.",
            "youtube": "🎥 Behind the scenes: Building enterprise AI systems in Nigeria. Subscribe for more.",
            "snapchat": "👀 Sneak peek: Our latest AI project going live next week. Swipe up!"
        }
        return templates.get(platform, "AI solutions for Nigerian businesses.")
    
    # Get company context
    identity = COMPANY_INTEL.get("IDENTITY", {})
    stats = COMPANY_INTEL.get("STATS", {})
    
    prompt = f"""You are the social media manager for {identity.get('name', 'AMD Solutions 007')}, 
a Nigerian AI development agency. 

Company Stats:
- {stats.get('total_projects', 24)} projects deployed
- {stats.get('revenue_generated', '₦2.5B+')} generated for clients
- {stats.get('avg_accuracy', '94%')} AI accuracy
- {stats.get('avg_roi', '5x')} ROI for clients

Create a {tone} post for {platform} that:
1. Showcases one of our AI projects (FinTech, PropTech, LegalTech, Business Intelligence)
2. Includes concrete results (revenue, time saved, accuracy)
3. Has a clear call-to-action (DM, WhatsApp, website visit)
4. Uses Nigerian context and terminology
5. Maximum {max_length} characters

Post should be {tone} and platform-appropriate.
Include relevant emojis and hashtags."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert social media manager for a Nigerian tech company."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.8
        )
        content = response.choices[0].message.content.strip()
        return content[:max_length]  # Enforce length limit
    except Exception as e:
        print(f"❌ OpenAI error: {e}")
        return templates.get(platform, "AI solutions for Nigerian businesses.")

# ==================== PLATFORM POSTING FUNCTIONS ====================

def post_to_linkedin(content):
    """Post to LinkedIn using LinkedIn API v2"""
    
    if not LINKEDIN_ACCESS_TOKEN or not LINKEDIN_PERSON_URN:
        print("⏭️ LinkedIn: No credentials configured")
        return False
    
    url = "https://api.linkedin.com/v2/ugcPosts"
    headers = {
        "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    
    payload = {
        "author": LINKEDIN_PERSON_URN,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": content
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 201:
            print("✅ LinkedIn: Posted successfully")
            return True
        else:
            print(f"❌ LinkedIn: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ LinkedIn error: {e}")
        return False

def post_to_twitter(content):
    """Post to Twitter/X using API v2"""
    
    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        print("⏭️ Twitter: No credentials configured")
        return False
    
    # Twitter API v2 requires OAuth 1.0a (using requests-oauthlib)
    try:
        from requests_oauthlib import OAuth1Session
        
        twitter = OAuth1Session(
            TWITTER_API_KEY,
            client_secret=TWITTER_API_SECRET,
            resource_owner_key=TWITTER_ACCESS_TOKEN,
            resource_owner_secret=TWITTER_ACCESS_SECRET
        )
        
        url = "https://api.twitter.com/2/tweets"
        payload = {"text": content}
        
        response = twitter.post(url, json=payload, timeout=30)
        
        if response.status_code == 201:
            print("✅ Twitter: Posted successfully")
            return True
        else:
            print(f"❌ Twitter: {response.status_code} - {response.text}")
            return False
            
    except ImportError:
        print("⚠️ Twitter: Install requests-oauthlib (pip install requests-oauthlib)")
        return False
    except Exception as e:
        print(f"❌ Twitter error: {e}")
        return False

def post_to_telegram(content):
    """Post to Telegram channel using Bot API"""
    
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHANNEL_ID:
        print("⏭️ Telegram: No credentials configured")
        return False
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": TELEGRAM_CHANNEL_ID,
        "text": content,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            print("✅ Telegram: Posted successfully")
            return True
        else:
            print(f"❌ Telegram: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Telegram error: {e}")
        return False

def post_to_youtube(content):
    """Post community update to YouTube (requires OAuth 2.0 setup)"""
    
    if not YOUTUBE_API_KEY or not YOUTUBE_CHANNEL_ID:
        print("⏭️ YouTube: No credentials configured")
        return False
    
    # YouTube Community posts require OAuth 2.0, not just API key
    # This is a placeholder - full implementation needs google-auth library
    print("⚠️ YouTube: Community posts require OAuth 2.0 (not implemented yet)")
    print(f"   Content prepared: {content[:100]}...")
    return False

def post_to_snapchat(content):
    """Create Snapchat Story ad (requires Business API access)"""
    
    if not SNAPCHAT_ACCESS_TOKEN or not SNAPCHAT_AD_ACCOUNT_ID:
        print("⏭️ Snapchat: No credentials configured")
        return False
    
    # Snapchat Marketing API requires pre-uploaded media
    # This is a placeholder for text-only posts
    print("⚠️ Snapchat: Story creation requires media upload (not implemented yet)")
    print(f"   Content prepared: {content[:100]}...")
    return False

# ==================== POSTING SCHEDULER ====================

def morning_routine():
    """Morning posts: Industry insights & thought leadership"""
    
    print("\n" + "="*60)
    print("🌅 MORNING ROUTINE - 9:00 AM WAT")
    print("="*60)
    
    # LinkedIn: Professional industry insight
    linkedin_content = generate_content(
        platform="linkedin",
        tone="professional and insightful",
        max_length=3000
    )
    post_to_linkedin(linkedin_content)
    
    time.sleep(5)  # Rate limiting
    
    # Twitter: Quick tech update
    twitter_content = generate_content(
        platform="twitter",
        tone="concise and punchy",
        max_length=280
    )
    post_to_twitter(twitter_content)
    
    print(f"\n✅ Morning routine complete at {datetime.now().strftime('%H:%M:%S')}")

def evening_routine():
    """Evening posts: Case studies & behind-the-scenes"""
    
    print("\n" + "="*60)
    print("🌆 EVENING ROUTINE - 6:00 PM WAT")
    print("="*60)
    
    # Telegram: Detailed case study
    telegram_content = generate_content(
        platform="telegram",
        tone="informative and detailed",
        max_length=4096
    )
    post_to_telegram(telegram_content)
    
    time.sleep(5)  # Rate limiting
    
    # YouTube: Behind-the-scenes update
    youtube_content = generate_content(
        platform="youtube",
        tone="engaging and conversational",
        max_length=5000
    )
    post_to_youtube(youtube_content)
    
    # Snapchat: Sneak peek
    snapchat_content = generate_content(
        platform="snapchat",
        tone="casual and exciting",
        max_length=250
    )
    post_to_snapchat(snapchat_content)
    
    print(f"\n✅ Evening routine complete at {datetime.now().strftime('%H:%M:%S')}")

def wait_until_next_post():
    """Calculate wait time until next scheduled post"""
    
    now = datetime.now()
    current_hour = now.hour
    
    # Determine next post time
    if current_hour < MORNING_HOUR:
        next_post = now.replace(hour=MORNING_HOUR, minute=0, second=0, microsecond=0)
        post_type = "MORNING"
    elif current_hour < EVENING_HOUR:
        next_post = now.replace(hour=EVENING_HOUR, minute=0, second=0, microsecond=0)
        post_type = "EVENING"
    else:
        # Next morning
        next_post = (now + timedelta(days=1)).replace(hour=MORNING_HOUR, minute=0, second=0, microsecond=0)
        post_type = "MORNING"
    
    wait_seconds = (next_post - now).total_seconds()
    
    print(f"\n⏰ Next post: {post_type} at {next_post.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Waiting {int(wait_seconds/3600)}h {int((wait_seconds%3600)/60)}m...")
    
    return wait_seconds, post_type

# ==================== MAIN LOOP ====================

def validate_config():
    """Check which platforms are configured"""
    
    print("\n🔍 PLATFORM STATUS:")
    print(f"   LinkedIn: {'✅' if LINKEDIN_ACCESS_TOKEN else '❌'}")
    print(f"   Twitter:  {'✅' if TWITTER_API_KEY else '❌'}")
    print(f"   Telegram: {'✅' if TELEGRAM_BOT_TOKEN else '❌'}")
    print(f"   YouTube:  {'✅' if YOUTUBE_API_KEY else '❌'}")
    print(f"   Snapchat: {'✅' if SNAPCHAT_ACCESS_TOKEN else '❌'}")
    print(f"   OpenAI:   {'✅' if OPENAI_API_KEY else '❌'}")
    
    if not any([LINKEDIN_ACCESS_TOKEN, TWITTER_API_KEY, TELEGRAM_BOT_TOKEN]):
        print("\n⚠️ WARNING: No social platforms configured!")
        print("   Add credentials to Railway environment variables:")
        print("   - LINKEDIN_ACCESS_TOKEN")
        print("   - TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET")
        print("   - TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID")
        print("   - YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID")
        print("   - SNAPCHAT_ACCESS_TOKEN, SNAPCHAT_AD_ACCOUNT_ID")
        return False
    
    return True

def main():
    """Main execution loop"""
    
    print("\n" + "="*60)
    print("🤖 AMD SOCIAL MANAGER - AUTONOMOUS POSTING ENGINE")
    print("="*60)
    print(f"📅 Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S WAT')}")
    
    if not validate_config():
        print("\n❌ Configuration incomplete. Exiting...")
        return
    
    print("\n✅ Social Manager initialized")
    print("📌 Schedule: 9 AM (Morning) + 6 PM (Evening) WAT daily")
    
    # Main loop
    while True:
        try:
            now = datetime.now()
            current_hour = now.hour
            current_minute = now.minute
            
            # Morning window: 9:00-9:05 AM
            if current_hour == MORNING_HOUR and current_minute < 5:
                morning_routine()
                time.sleep(300)  # Sleep 5 minutes to avoid reposting
            
            # Evening window: 6:00-6:05 PM
            elif current_hour == EVENING_HOUR and current_minute < 5:
                evening_routine()
                time.sleep(300)  # Sleep 5 minutes to avoid reposting
            
            else:
                # Wait until next scheduled post
                wait_seconds, post_type = wait_until_next_post()
                time.sleep(min(wait_seconds, 3600))  # Sleep max 1 hour, then recheck
        
        except KeyboardInterrupt:
            print("\n\n⏹️ Social Manager stopped by user")
            break
        except Exception as e:
            print(f"\n❌ Error in main loop: {e}")
            print("   Retrying in 5 minutes...")
            time.sleep(300)

if __name__ == "__main__":
    main()
