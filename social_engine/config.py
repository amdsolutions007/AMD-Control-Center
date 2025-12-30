"""
Social Engine Config
Imports credentials from existing .env files + adds Twitter placeholders
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load credentials from root .env
root_env = Path(__file__).parent.parent / '.env'
load_dotenv(root_env)

# Load credentials from apps/website/.env.local
website_env = Path(__file__).parent.parent / 'apps' / 'website' / '.env.local'
load_dotenv(website_env)

# ==================== EXISTING CREDENTIALS (AUTO-IMPORTED) ====================

# Snapchat Marketing API (COMPLETE - From apps/website/.env.local)
SNAP_CLIENT_ID = os.getenv('SNAP_CLIENT_ID', '')
SNAP_CLIENT_SECRET = os.getenv('SNAP_CLIENT_SECRET', '')
SNAP_AD_ACCOUNT_ID = os.getenv('SNAP_AD_ACCOUNT_ID', '')
SNAP_MARKETING_REFRESH_TOKEN = os.getenv('SNAP_MARKETING_REFRESH_TOKEN', '')
SNAP_PIXEL_ID = os.getenv('SNAP_PIXEL_ID', '')

# Meta/Facebook Ads API (COMPLETE - From root .env)
META_APP_ID = os.getenv('META_APP_ID', '')
META_APP_SECRET = os.getenv('META_APP_SECRET', '')
META_ACCESS_TOKEN = os.getenv('META_ACCESS_TOKEN', '')
META_AD_ACCOUNT_ID = os.getenv('META_AD_ACCOUNT_ID', '')
META_PAGE_ID = os.getenv('META_PAGE_ID', '')

# Telegram Bot (CONFIGURED - From environment variable)
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')  # NEVER hardcode tokens!
TELEGRAM_CHAT_ID = int(os.getenv('TELEGRAM_CHAT_ID', '-1003663009693'))  # Channel ID (numeric)

# YouTube API (EXISTING - Uses OAuth from amd_bio_updater.py)
YOUTUBE_CLIENT_SECRETS_FILE = os.getenv('YOUTUBE_CLIENT_SECRETS', 'client_secrets.json')
YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
YOUTUBE_API_SERVICE_NAME = 'youtube'
YOUTUBE_API_VERSION = 'v3'

# ==================== NEW CREDENTIALS (USER TO PROVIDE) ====================

# Twitter/X API (CONFIGURED - User provided credentials)
# Note: Using OAuth 2.0 credentials - may need Consumer Keys for full v1.1 API access
TWITTER_API_KEY = os.getenv('TWITTER_API_KEY', 'bU9YOS1FVVdYWjlxLWttYXJLQXA6MTpjaQ')  # Client ID
TWITTER_API_SECRET = os.getenv('TWITTER_API_SECRET', 'dm_Wlskj9DEcJN-bLlj-mnshGpP7twgZu4SZb1420LsnH87WCR')  # Client Secret
TWITTER_ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN', '1564961774864064513-8arCbbxtoFDCdFiYI56l7IxEzuoJqN')
TWITTER_ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET', 'hB6FSIbfhq96ZQVcq8HpZeP7jxsBE2akwYRZnotIaCTPX')
TWITTER_BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN', 'AAAAAAAAAAAAAAAAAAAAALsw6gEAAAAAS3SgVVOcL82%2B3cT11MCZ2XyBU70%3DoqLiImu9ebxEjXF8dfHKxYdCo0DzPa5uTcUypvxtREi7rmQjkF')

# Legacy names for compatibility
TWITTER_CONSUMER_KEY = TWITTER_API_KEY
TWITTER_CONSUMER_SECRET = TWITTER_API_SECRET

# Pinterest API (CONFIGURED - JOB 12 - 29 Dec 2025)
PINTEREST_APP_ID = os.getenv('PINTEREST_APP_ID', '')
PINTEREST_ACCESS_TOKEN = os.getenv('PINTEREST_ACCESS_TOKEN', '')
PINTEREST_APP_SECRET = os.getenv('PINTEREST_APP_SECRET', '')
PINTEREST_BOARD_ID = os.getenv('PINTEREST_BOARD_ID', '')

# LinkedIn API (PENDING - Waiting for credentials)
LINKEDIN_ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN', '')
LINKEDIN_PERSON_URN = os.getenv('LINKEDIN_PERSON_URN', '')

# ==================== POSTING CONFIGURATION ====================

# Nigerian Time Zone
TIMEZONE = 'Africa/Lagos'

# Posting Schedule (24-hour format) - HUMAN BEHAVIOR TO AVOID BANS
POSTING_TIMES = {
    'twitter': ['09:00', '14:00', '20:00'],  # 3 posts/day (ANTI-SPAM)
    'telegram': ['09:00', '14:00', '20:00'],  # 3 posts/day (ANTI-SPAM)
    'youtube': ['09:00', '14:00', '20:00'],  # 3 posts/day (ANTI-SPAM)
    'snapchat': ['09:00', '14:00', '20:00'],  # 3 posts/day (ANTI-SPAM)
    'pinterest': ['09:00', '14:00', '20:00'],  # 3 posts/day (ANTI-SPAM)
    'linkedin': ['09:00', '20:00']  # 2 posts/day (professional hours)
}

# Content Source Paths
CONTENT_DIR = Path(__file__).parent.parent / 'REVENUE_PACKAGE'
SOCIAL_POSTS_FILE = CONTENT_DIR / 'SOCIAL_MEDIA_POSTS.md'
CV_SERVICE_FILE = CONTENT_DIR / 'CV_ANALYSIS_SERVICE.md'
SOURCE_CODE_FILE = CONTENT_DIR / 'SOURCE_CODE_SALES.md'

# Database
DATABASE_PATH = Path(__file__).parent / 'data' / 'posted_content.db'

# Analytics
ANALYTICS_FILE = Path(__file__).parent / 'data' / 'analytics.json'

# ==================== PLATFORM ENABLE/DISABLE ====================

PLATFORMS_ENABLED = {
    'twitter': True,     # Official API
    'telegram': True,    # Official Bot API
    'youtube': True,     # Official Google API
    'snapchat': True,    # Official Marketing API
    'pinterest': False,  # ⏸️ PAUSED - Needs production access (trial mode blocked)
    'linkedin': False,   # Waiting for API credentials
    'facebook': False    # Disabled - waiting for pages_manage_posts API permission
}

# ==================== VALIDATION ====================

def validate_credentials():
    """
    Validate that all required credentials are present
    """
    errors = []
    
    # Twitter
    if PLATFORMS_ENABLED['twitter']:
        if 'YOUR_' in TWITTER_CONSUMER_KEY or not TWITTER_ACCESS_TOKEN:
            errors.append("❌ Twitter credentials missing - add to .env")
        else:
            print("✅ Twitter configured")
    
    # Telegram
    if PLATFORMS_ENABLED['telegram']:
        if not TELEGRAM_BOT_TOKEN:
            errors.append("⚠️ Telegram token not found - searching...")
        else:
            print("✅ Telegram configured")
    
    # Snapchat
    if PLATFORMS_ENABLED['snapchat']:
        if not SNAP_MARKETING_REFRESH_TOKEN:
            errors.append("❌ Snapchat refresh token missing")
        else:
            print("✅ Snapchat configured")
    
    # Facebook
    if not META_ACCESS_TOKEN:
        errors.append("⚠️ Facebook token missing")
    else:
        print("✅ Facebook configured")
    
    return errors

# ==================== CONTENT ROTATION RULES ====================

CONTENT_ROTATION = {
    'cv_analysis_frequency': 0.3,  # 30% of posts about CV service
    'source_code_frequency': 0.4,  # 40% about source code sales
    'portfolio_frequency': 0.2,    # 20% project showcase
    'general_frequency': 0.1       # 10% general updates
}

# ==================== RATE LIMITS ====================

RATE_LIMITS = {
    'twitter': 1500,  # Free tier limit per month
    'telegram': 999999,  # Unlimited
    'youtube': 10000,  # 10K units/day (more than enough)
    'snapchat': 999999  # Based on ad spend (we have active campaigns)
}

# ==================== COMPANY BRANDING ====================

# Official Contact Information
COMPANY_NAME = 'AMD Solutions'
OFFICIAL_PHONE = '+234 818 002 1007'
OFFICIAL_EMAIL = 'ceo@amdsolutions007.com'
OFFICIAL_WEBSITE = 'https://amdsolutions007.com'
LINKTREE = 'https://linktr.ee/amdsolutions007'

# WhatsApp Integration (Legacy compatibility)
WHATSAPP_NUMBER = '+234 818 002 1007'
WHATSAPP_MESSAGE = 'Hello! I saw your post about CV Analysis. I need help with my CV.'

# ==================== LOGGING ====================

LOG_FILE = Path(__file__).parent / 'social_engine.log'
LOG_LEVEL = 'INFO'  # DEBUG, INFO, WARNING, ERROR

# ==================== HELPER FUNCTIONS ====================

def get_whatsapp_link(service='cv'):
    """Generate WhatsApp link for specific service"""
    messages = {
        'cv': f"Hello! I saw your post about CV Analysis. I need help with my CV.",
        'code': f"Hi! I'm interested in purchasing source code for my school project.",
        'general': f"Hello AMD Solutions! I'd like to discuss your services."
    }
    message = messages.get(service, messages['general'])
    return f"https://wa.me/{WHATSAPP_NUMBER.replace('+', '')}?text={message.replace(' ', '%20')}"

if __name__ == '__main__':
    print("🔍 AMD Social Engine - Credential Validation\n")
    print("=" * 60)
    
    errors = validate_credentials()
    
    if errors:
        print("\n".join(errors))
    else:
        print("✅ All credentials validated!")
        print(f"\n📊 Platforms enabled: {sum(PLATFORMS_ENABLED.values())}/4")
        print(f"📁 Content directory: {CONTENT_DIR}")
        print(f"🕐 Time zone: {TIMEZONE}")
