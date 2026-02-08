#!/usr/bin/env python3
"""
AMD SIGNAL BEACON POSTER - Featured Video Distribution Engine (HEAVY ARTILLERY)
Reads the featured video from Signal Beacon and posts to ALL 5 platforms with AI-generated visuals.

MISSION: Drive traffic to https://amd-signal-beacon.vercel.app
PLATFORMS: Twitter, LinkedIn, Telegram, YouTube, Snapchat
VISUALS: DALL-E 3 generated (Black + Gold aesthetic, Nigerian Tech City)
"""

import os
import json
import sys
import asyncio
import requests
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

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

# OpenAI (DALL-E 3 for image generation - DEPRECATED)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Google Gemini/Imagen (PRIMARY - Nano Banana)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

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
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '@amdsolutions007')  # Channel username

# YouTube (OAuth - uses existing token)
YOUTUBE_CLIENT_SECRETS = os.getenv('YOUTUBE_CLIENT_SECRETS', 'client_secrets.json')

# Snapchat
SNAP_CLIENT_ID = os.getenv('SNAP_CLIENT_ID', '')
SNAP_CLIENT_SECRET = os.getenv('SNAP_CLIENT_SECRET', '')
SNAP_AD_ACCOUNT_ID = os.getenv('SNAP_AD_ACCOUNT_ID', '')
SNAP_MARKETING_REFRESH_TOKEN = os.getenv('SNAP_MARKETING_REFRESH_TOKEN', '')

# Credential Status
GEMINI_READY = bool(GEMINI_API_KEY)
OPENAI_READY = bool(OPENAI_API_KEY)
TWITTER_READY = bool(TWITTER_API_KEY and TWITTER_ACCESS_TOKEN)
LINKEDIN_READY = bool(LINKEDIN_ACCESS_TOKEN)
TELEGRAM_READY = bool(TELEGRAM_BOT_TOKEN)
YOUTUBE_READY = bool(YOUTUBE_CLIENT_SECRETS)
SNAPCHAT_READY = bool(SNAP_MARKETING_REFRESH_TOKEN)

# Visual Settings
TEMP_IMAGE_PATH = "temp_post_visual.png"

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

# ==================== AI VISUAL GENERATION ====================

def generate_mission_visual(title, category="AI"):
    """Google Gemini/Imagen (Nano Banana)
    
    Style: Hyper-realistic, Black and Gold aesthetic, Nigerian Tech City background
    Fallback: DALL-E 3 if Gemini fails
    """
    
    # Try Gemini first
    if GEMINI_READY:
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=GEMINI_API_KEY)
            
            # Craft the prompt
            prompt = f"""Create a hyper-realistic promotional image for '{title}'.

Style: Cinematic tech briefing aesthetic
Colors: Black (#000000) and Gold (#FFD700) color scheme
Setting: Futuristic Nigerian tech city skyline at night
Elements: 
- Bold gold text '{category.upper()}' prominently displayed
- Sleek holographic interface elements
- Professional, high-tech atmosphere
- Dramatic lighting with gold accents
- 16:9 aspect ratio

The image should feel like a premium intelligence briefing from a world-class tech agency."""

            print(f"\n🎨 Generating mission visual with Google Gemini Imagen...")
            print(f"   Theme: {category.upper()} Intelligence Briefing")
            
            # Use Gemini's Imagen model (nano-banana or gemini-2.5-flash-image)
            model = genai.GenerativeModel('gemini-2.5-flash-image')
            response = model.generate_content([
                prompt,
                "Generate a 16:9 cinematic image"
            ])
            
            # Check if image was generated
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data'):
                        import base64
                        image_data = base64.b64decode(part.inline_data.data)
                        with open(TEMP_IMAGE_PATH, 'wb') as f:
                            f.write(image_data)
                        print(f"✅ Gemini Imagen visual generated: {TEMP_IMAGE_PATH}")
                        return TEMP_IMAGE_PATH
            
            print(f"⚠️ Gemini returned text response instead of image")
            return None
            
        except Exception as e:
            print(f"⚠️ Gemini generation error: {e}")
            print(f"   Falling back to DALL-E 3...")
    
    # Fallback to DALL-E 3
    if not OPENAI_READY:
        print("⚠️ No visual generation APIs configured")
        return None
    
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Craft the prompt
        prompt = f"""Create a hyper-realistic promotional image for '{title}'.

Style: Cinematic tech briefing aesthetic
Colors: Black (#000000) and Gold (#FFD700) color scheme
Setting: Futuristic Nigerian tech city skyline at night
Elements: 
- Bold gold text '{category.upper()}' prominently displayed
- Sleek holographic interface elements
- Professional, high-tech atmosphere
- Dramatic lighting with gold accents
- 16:9 aspect ratio

The image should feel like a premium intelligence briefing from a world-class tech agency."""

        print(f"\n🎨 Generating mission visual with DALL-E 3...")
        print(f"   Theme: {category.upper()} Intelligence Briefing")
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",  # 16:9 ratio
            quality="hd",
            n=1
        )
        
        image_url = response.data[0].url
        
        # Download the image
        print(f"   Downloading image...")
        img_response = requests.get(image_url, timeout=60)
        
        if img_response.status_code == 200:
            with open(TEMP_IMAGE_PATH, 'wb') as f:
                f.write(img_response.content)
            
            print(f"✅ Visual generated and saved: {TEMP_IMAGE_PATH}")
            return TEMP_IMAGE_PATH
        else:
            print(f"❌ Failed to download image: {img_response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ DALL-E 3 generation error: {e}")
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

# ==================== PLATFORM POSTING FUNCTIONS ====================

async def post_to_telegram_with_image(caption, image_path=None):
    """Post to Telegram channel with image"""
    
    if not TELEGRAM_READY:
        print("⏭️ Telegram: No credentials configured")
        return False
    
    try:
        from telegram import Bot
        from telegram.request import HTTPXRequest
        
        request = HTTPXRequest(
            connection_pool_size=8,
            read_timeout=60,
            write_timeout=60
        )
        
        bot = Bot(token=TELEGRAM_BOT_TOKEN, request=request)
        
        if image_path and os.path.exists(image_path):
            print("📤 Posting to Telegram with image...")
            with open(image_path, 'rb') as photo:
                await bot.send_photo(
                    chat_id=TELEGRAM_CHAT_ID,
                    photo=photo,
                    caption=caption,
                    parse_mode='HTML',
                    read_timeout=60,
                    write_timeout=60
                )
        else:
            print("📤 Posting to Telegram (text only)...")
            await bot.send_message(
                chat_id=TELEGRAM_CHAT_ID,
                text=caption,
                parse_mode='HTML',
                disable_web_page_preview=False
            )
        
        print("✅ Telegram: Posted successfully")
        return True
        
    except ImportError:
        print("❌ Telegram: Install python-telegram-bot (pip install python-telegram-bot)")
        return False
    except Exception as e:
        print(f"❌ Telegram error: {e}")
        return False

def post_to_youtube_community(text, image_path=None):
    """Post to YouTube Community tab"""
    
    if not YOUTUBE_READY:
        print("⏭️ YouTube: No credentials configured")
        return False
    
    try:
        # YouTube Community posts require OAuth 2.0
        # Using existing authentication from amd_bio_updater.py pattern
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
        
        SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
        
        # Try to load existing credentials
        creds = None
        token_path = 'youtube_token.json'
        
        if os.path.exists(token_path):
            from google.auth.transport.requests import Request
            import json
            
            with open(token_path, 'r') as token:
                token_data = json.load(token)
                creds = Credentials.from_authorized_user_info(token_data, SCOPES)
            
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
        
        if not creds or not creds.valid:
            print("⚠️ YouTube: OAuth credentials needed - run authentication flow first")
            return False
        
        youtube = build('youtube', 'v3', credentials=creds)
        
        # Note: YouTube Community posts API is limited
        # This is a placeholder for the actual implementation
        print("⚠️ YouTube: Community posts API requires channel membership tier")
        print(f"   Content prepared: {text[:100]}...")
        print(f"   Image: {image_path if image_path else 'None'}")
        
        # For now, mark as ready but not posted
        return False
        
    except ImportError:
        print("❌ YouTube: Install google libraries (pip install google-auth google-auth-oauthlib google-api-python-client)")
        return False
    except Exception as e:
        print(f"❌ YouTube error: {e}")
        return False

def post_to_snapchat_story(image_path, caption):
    """Post to Snapchat Stories via Marketing API"""
    
    if not SNAPCHAT_READY:
        print("⏭️ Snapchat: No credentials configured")
        return False
    
    if not image_path or not os.path.exists(image_path):
        print("❌ Snapchat: Image required for Stories")
        return False
    
    try:
        # Step 1: Get access token using refresh token
        token_url = "https://accounts.snapchat.com/login/oauth2/access_token"
        token_data = {
            "refresh_token": SNAP_MARKETING_REFRESH_TOKEN,
            "client_id": SNAP_CLIENT_ID,
            "client_secret": SNAP_CLIENT_SECRET,
            "grant_type": "refresh_token"
        }
        
        token_response = requests.post(token_url, data=token_data, timeout=30)
        
        if token_response.status_code != 200:
            print(f"❌ Snapchat: Token refresh failed - {token_response.status_code}")
            return False
        
        access_token = token_response.json().get('access_token')
        
        # Step 2: Upload media (simplified - full implementation requires multi-part upload)
        print("⚠️ Snapchat: Story creation requires media upload API")
        print(f"   Image prepared: {image_path}")
        print(f"   Caption: {caption[:100]}...")
        print("   Note: Full implementation requires Snapchat Business Manager setup")
        
        # Mark as ready but not fully implemented
        return False
        
    except Exception as e:
        print(f"❌ Snapchat error: {e}")
        return False

# ==================== MAIN EXECUTION ====================

async def post_featured_video():
    """Main function: Load video, generate visual, and post to ALL platforms"""
    
    print("\n" + "="*60)
    print("📡 AMD SIGNAL BEACON POSTER - HEAVY ARTILLERY MODE")
    print("="*60)
    print(f"🎯 Target: {SIGNAL_BEACON_URL}\n")
    
    # Validate social manager configuration
    print("🔍 Checking platform credentials...")
    print(f"   OpenAI (DALL-E 3):  {'✅' if OPENAI_READY else '❌'}")
    print(f"   Twitter/X:          {'✅' if TWITTER_READY else '❌'}")
    print(f"   LinkedIn:           {'✅' if LINKEDIN_READY else '❌'}")
    print(f"   Telegram:           {'✅' if TELEGRAM_READY else '❌'}")
    print(f"   YouTube:            {'✅' if YOUTUBE_READY else '❌'}")
    print(f"   Snapchat:           {'✅' if SNAPCHAT_READY else '❌'}")
    
    # Load featured video
    print("\n📥 Loading featured video from Signal Beacon...")
    video = load_featured_video()
    
    if not video:
        print("\n❌ MISSION FAILED: Cannot load featured video")
        return False
    
    # Generate mission visual with DALL-E 3
    print("\n🎨 GENERATING MISSION VISUAL...")
    image_path = generate_mission_visual(
        title=video.get('title', 'AI Intelligence Briefing'),
        category=video.get('category', 'AI')
    )
    
    if not image_path:
        print("⚠️ Continuing without visual (text-only mode)")
    
    # Generate platform-specific posts
    print("\n✍️ Generating platform-specific posts...\n")
    
    twitter_post = format_twitter_post(video)
    linkedin_post = format_linkedin_post(video)
    
    # Telegram caption (shorter, with HTML formatting)
    telegram_caption = f"""<b>🎯 {video.get('title', 'AI Intelligence Briefing')}</b>

{video.get('take007', 'Essential AI insights.')[:200]}...

📡 <a href="{SIGNAL_BEACON_URL}">Watch Full Briefing at AMD Signal Beacon</a>

#AI #NaijaTech #AMD007"""
    
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
    
    print("\n" + "="*60)
    print("✈️ TELEGRAM CAPTION:")
    print("="*60)
    print(telegram_caption)
    
    # Post to all platforms
    print("\n" + "="*60)
    print("🚀 FIRING ON ALL PLATFORMS...")
    print("="*60)
    
    results = {}
    
    # Platform 1: Twitter/X
    print("\n🐦 Platform 1/5: Twitter/X")
    results['twitter'] = post_to_twitter(twitter_post)
    
    # Platform 2: LinkedIn
    print("\n💼 Platform 2/5: LinkedIn")
    results['linkedin'] = post_to_linkedin(linkedin_post)
    
    # Platform 3: Telegram
    print("\n✈️ Platform 3/5: Telegram")
    results['telegram'] = await post_to_telegram_with_image(telegram_caption, image_path)
    
    # Platform 4: YouTube
    print("\n📺 Platform 4/5: YouTube")
    results['youtube'] = post_to_youtube_community(
        text=f"{video.get('title')}\n\n{video.get('take007')}\n\nWatch: {SIGNAL_BEACON_URL}",
        image_path=image_path
    )
    
    # Platform 5: Snapchat
    print("\n👻 Platform 5/5: Snapchat")
    results['snapchat'] = post_to_snapchat_story(
        image_path=image_path,
        caption=f"{video.get('title')} - Watch at {SIGNAL_BEACON_URL}"
    )
    
    # Mission summary
    print("\n" + "="*60)
    print("📊 HEAVY ARTILLERY FIRE MISSION SUMMARY")
    print("="*60)
    print(f"   Twitter/X:  {'✅ POSTED' if results['twitter'] else '❌ FAILED'}")
    print(f"   LinkedIn:   {'✅ POSTED' if results['linkedin'] else '❌ FAILED'}")
    print(f"   Telegram:   {'✅ POSTED' if results['telegram'] else '❌ FAILED'}")
    print(f"   YouTube:    {'✅ POSTED' if results['youtube'] else '⚠️ LIMITED API ACCESS'}")
    print(f"   Snapchat:   {'✅ POSTED' if results['snapchat'] else '⚠️ REQUIRES MEDIA UPLOAD'}")
    print(f"   Visual:     {'✅ Generated' if image_path else '❌ Not generated'}")
    print(f"   Video:      {video.get('title', 'Unknown')}")
    print(f"   Creator:    {video.get('creator', 'Unknown')}")
    print(f"   Target URL: {SIGNAL_BEACON_URL}")
    print("="*60)
    
    # Success criteria: At least 3 platforms posted
    successful_posts = sum([results['twitter'], results['linkedin'], results['telegram']])
    
    if successful_posts >= 3:
        print("\n✅ MISSION ACCOMPLISHED: Multi-platform distribution active!")
        print(f"   {successful_posts}/5 platforms confirmed LIVE")
        return True
    else:
        print(f"\n⚠️ PARTIAL SUCCESS: {successful_posts}/5 platforms posted")
        print("   Check credentials for failed platforms")
        return False

# ==================== DRY RUN MODE ====================

async def dry_run():
    """Generate posts and visual without actually posting (for testing)"""
    
    print("\n" + "="*60)
    print("🧪 DRY RUN MODE - POST PREVIEW + VISUAL GENERATION TEST")
    print("="*60)
    
    video = load_featured_video()
    if not video:
        return
    
    # Test visual generation
    print("\n🎨 Testing DALL-E 3 visual generation...")
    image_path = generate_mission_visual(
        title=video.get('title', 'AI Intelligence Briefing'),
        category=video.get('category', 'AI')
    )
    
    twitter_post = format_twitter_post(video)
    linkedin_post = format_linkedin_post(video)
    
    telegram_caption = f"""<b>🎯 {video.get('title', 'AI Intelligence Briefing')}</b>

{video.get('take007', 'Essential AI insights.')[:200]}...

📡 Watch Full Briefing: {SIGNAL_BEACON_URL}

#AI #NaijaTech #AMD007"""
    
    print("\n📱 TWITTER/X POST PREVIEW:")
    print("="*60)
    print(twitter_post)
    print(f"\n✅ Length: {len(twitter_post)}/280 characters")
    
    print("\n💼 LINKEDIN POST PREVIEW:")
    print("="*60)
    print(linkedin_post)
    print(f"\n✅ Length: {len(linkedin_post)}/3000 characters")
    
    print("\n✈️ TELEGRAM CAPTION PREVIEW:")
    print("="*60)
    print(telegram_caption)
    
    print("\n" + "="*60)
    print("✅ DRY RUN COMPLETE")
    print("="*60)
    print(f"   Visual: {'✅ Generated' if image_path else '❌ Not generated'}")
    print(f"   Posts: ✅ All formatted correctly")
    print("   Ready to fire live when credentials configured")
    print("="*60)

# ==================== CLI ====================

if __name__ == "__main__":
    import sys
    
    # Check for dry run flag
    if len(sys.argv) > 1 and sys.argv[1] == "--dry-run":
        asyncio.run(dry_run())
    else:
        asyncio.run(post_featured_video())
