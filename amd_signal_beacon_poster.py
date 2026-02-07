#!/usr/bin/env python3
"""
AMD SIGNAL BEACON POSTER - Featured Video Distribution Engine
Reads the featured video from Signal Beacon and posts to X (Twitter) and LinkedIn.

MISSION: Drive traffic to https://amd-signal-beacon.vercel.app
"""

import os
import json
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Import posting functions from social manager
try:
    from amd_social_manager import post_to_linkedin, post_to_twitter, validate_config
except ImportError:
    print("❌ ERROR: amd_social_manager.py not found")
    sys.exit(1)

# ==================== CONFIGURATION ====================

SIGNAL_BEACON_URL = "https://amd-signal-beacon.vercel.app"
VIDEOS_JSON_PATH = "apps/amd-signal-beacon/data/videos.json"

# ==================== CREDENTIALS (AUTO-LOADED FROM .env) ====================

# Twitter/X (TEST MODE - Text only, no media upload)
TWITTER_API_KEY = os.getenv('TWITTER_API_KEY', '')
TWITTER_API_SECRET = os.getenv('TWITTER_API_SECRET', '')
TWITTER_ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN', '')
TWITTER_ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET', '')

# LinkedIn
LINKEDIN_ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN', '')
LINKEDIN_PERSON_URN = os.getenv('LINKEDIN_PERSON_URN', '')

# Telegram
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '-1003663009693')

# Credential Status
TWITTER_READY = bool(TWITTER_API_KEY and TWITTER_ACCESS_TOKEN)
LINKEDIN_READY = bool(LINKEDIN_ACCESS_TOKEN)
TELEGRAM_READY = bool(TELEGRAM_BOT_TOKEN)

# ==================== VIDEO DATA LOADER ====================

def load_featured_video():
    """Load the featured video from Signal Beacon's videos.json"""
    
    # Try relative path first
    videos_path = Path(VIDEOS_JSON_PATH)
    
    # Try absolute path if relative fails
    if not videos_path.exists():
        videos_path = Path(__file__).parent / VIDEOS_JSON_PATH
    
    # Final fallback: search from current directory
    if not videos_path.exists():
        alt_path = Path.cwd() / VIDEOS_JSON_PATH
        if alt_path.exists():
            videos_path = alt_path
    
    if not videos_path.exists():
        print(f"❌ ERROR: Cannot find videos.json at {VIDEOS_JSON_PATH}")
        print(f"   Searched: {videos_path.absolute()}")
        return None
    
    try:
        with open(videos_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        featured = data.get('featured')
        if not featured:
            print("❌ ERROR: No 'featured' video found in videos.json")
            return None
        
        print(f"✅ Loaded featured video: {featured.get('title', 'Unknown')}")
        return featured
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        return None
    except Exception as e:
        print(f"❌ Error loading videos.json: {e}")
        return None

# ==================== POST FORMATTERS ====================

def format_twitter_post(video):
    """
    Format video for Twitter/X (280 character limit)
    
    Format:
    🎯 [Video Title]
    
    [Hook from '007 Take']
    
    📡 Watch the full Briefing: [URL]
    """
    
    title = video.get('title', 'AI Intelligence Briefing')
    take007 = video.get('take007', 'Essential AI insights for Nigerian founders.')
    
    # Twitter character budget: 280 total
    # URL takes ~23 chars (Twitter shortens)
    # Emojis + formatting: ~50 chars
    # Available for content: ~200 chars
    
    # Truncate take007 if needed
    max_take_length = 150
    if len(take007) > max_take_length:
        take007 = take007[:max_take_length-3] + "..."
    
    post = f"""🎯 {title}

{take007}

📡 Full Briefing: {SIGNAL_BEACON_URL}

#AI #NaijaTech #AMD007"""
    
    # Enforce Twitter limit
    if len(post) > 280:
        # Further truncate take007
        overflow = len(post) - 280
        take007 = take007[:-(overflow + 3)] + "..."
        post = f"""🎯 {title}

{take007}

📡 Full Briefing: {SIGNAL_BEACON_URL}

#AI #NaijaTech #AMD007"""
    
    return post

def format_linkedin_post(video):
    """
    Format video for LinkedIn (3000 character limit)
    
    Format:
    🎯 [Video Title]
    
    [The '007 Take' - Full commentary]
    
    💡 Why This Matters:
    [Why this is relevant]
    
    🎯 What You Can Do:
    [Actionable insight]
    
    📡 Watch the complete Intel Briefing: [URL]
    
    —
    Building AI systems for Nigerian businesses.
    24 projects deployed. ₦2.5B+ generated.
    
    #ArtificialIntelligence #Nigeria #TechInAfrica
    """
    
    title = video.get('title', 'AI Intelligence Briefing')
    creator = video.get('creator', 'Expert')
    take007 = video.get('take007', 'Essential AI insights.')
    why007 = video.get('why007', 'Understanding this gives you a competitive edge.')
    actionable = video.get('actionable', 'Apply these insights to your business.')
    
    post = f"""🎯 {title}

{take007}

💡 Why This Matters for Nigerian Founders:
{why007}

🚀 What You Can Do Right Now:
{actionable}

—

📡 Watch the complete Intel Briefing at AMD Signal Beacon:
{SIGNAL_BEACON_URL}

This is part of our Visual Intelligence initiative - curating world-class AI content and translating it into actionable insights for African tech builders.

—

🔧 AMD Solutions 007
Building AI systems that generate real revenue.
24 projects deployed. ₦2.5B+ for clients.

#ArtificialIntelligence #AI #Nigeria #TechInAfrica #Startup #Innovation #AMD007"""
    
    # LinkedIn allows 3000 chars, this should fit comfortably
    return post

# ==================== MAIN EXECUTION ====================

def post_featured_video():
    """Main function: Load video and post to platforms"""
    
    print("\n" + "="*60)
    print("📡 AMD SIGNAL BEACON POSTER - FEATURED VIDEO DISTRIBUTION")
    print("="*60)
    print(f"🎯 Target: {SIGNAL_BEACON_URL}\n")
    
    # Validate social manager configuration
    print("🔍 Checking platform credentials...")
    if not validate_config():
        print("\n⚠️ WARNING: No platforms configured, but continuing with post generation...")
        print("   Configure credentials in Railway to enable posting.\n")
    
    # Load featured video
    print("\n📥 Loading featured video from Signal Beacon...")
    video = load_featured_video()
    
    if not video:
        print("\n❌ MISSION FAILED: Cannot load featured video")
        return False
    
    # Generate posts
    print("\n✍️ Generating platform-specific posts...\n")
    
    twitter_post = format_twitter_post(video)
    linkedin_post = format_linkedin_post(video)
    
    print("="*60)
    print("📱 TWITTER/X POST:")
    print("="*60)
    print(twitter_post)
    print(f"\n📊 Length: {len(twitter_post)} characters")
    
    print("\n" + "="*60)
    print("💼 LINKEDIN POST:")
    print("="*60)
    print(linkedin_post)
    print(f"\n📊 Length: {len(linkedin_post)} characters")
    
    # Post to platforms
    print("\n" + "="*60)
    print("🚀 POSTING TO PLATFORMS...")
    print("="*60)
    
    twitter_success = post_to_twitter(twitter_post)
    linkedin_success = post_to_linkedin(linkedin_post)
    
    # Summary
    print("\n" + "="*60)
    print("📊 MISSION SUMMARY")
    print("="*60)
    print(f"   Twitter/X:  {'✅ POSTED' if twitter_success else '❌ FAILED (check credentials)'}")
    print(f"   LinkedIn:   {'✅ POSTED' if linkedin_success else '❌ FAILED (check credentials)'}")
    print(f"   Video:      {video.get('title', 'Unknown')}")
    print(f"   Creator:    {video.get('creator', 'Unknown')}")
    print(f"   Target URL: {SIGNAL_BEACON_URL}")
    print("="*60)
    
    if twitter_success or linkedin_success:
        print("\n✅ MISSION ACCOMPLISHED: Traffic incoming to Signal Beacon!")
        return True
    else:
        print("\n⚠️ Posts generated but not published (credentials needed)")
        print("   Next step: Configure API credentials in Railway environment")
        return False

# ==================== DRY RUN MODE ====================

def dry_run():
    """Generate posts without actually posting (for testing)"""
    
    print("\n" + "="*60)
    print("🧪 DRY RUN MODE - POST PREVIEW ONLY")
    print("="*60)
    
    video = load_featured_video()
    if not video:
        return
    
    twitter_post = format_twitter_post(video)
    linkedin_post = format_linkedin_post(video)
    
    print("\n📱 TWITTER/X POST PREVIEW:")
    print("="*60)
    print(twitter_post)
    print(f"\n✅ Length: {len(twitter_post)}/280 characters")
    
    print("\n💼 LINKEDIN POST PREVIEW:")
    print("="*60)
    print(linkedin_post)
    print(f"\n✅ Length: {len(linkedin_post)}/3000 characters")
    
    print("\n" + "="*60)
    print("✅ DRY RUN COMPLETE - Ready to post when credentials configured")
    print("="*60)

# ==================== CLI ====================

if __name__ == "__main__":
    import sys
    
    # Check for dry run flag
    if len(sys.argv) > 1 and sys.argv[1] == "--dry-run":
        dry_run()
    else:
        post_featured_video()
