"""
AMD Social Engine - Main Bot
24/7 Automated Social Media Posting
"""

import logging
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from config import (
    PLATFORMS_ENABLED,
    TIMEZONE,
    LOG_FILE,
    LOG_LEVEL,
    validate_credentials
)
from scheduler import SocialScheduler
from content_manager import ContentManager


def setup_logging(verbose=False):
    """Setup logging configuration"""
    log_level = logging.DEBUG if verbose else getattr(logging, LOG_LEVEL)
    
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(LOG_FILE),
            logging.StreamHandler()
        ]
    )


def print_banner():
    """Print startup banner"""
    banner = """
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🤖 AMD SOCIAL ENGINE - OPERATION SOCIAL STORM      ║
║                                                           ║
║         Automated 24/7 Social Media Marketing            ║
║         Built by AMD Solutions 007                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"""
    print(banner)


def check_setup():
    """Check if system is properly configured"""
    print("\n🔍 Checking system configuration...\n")
    print("=" * 60)
    
    # Check credentials
    errors = validate_credentials()
    
    if errors:
        print("\n⚠️ CONFIGURATION ISSUES:\n")
        for error in errors:
            print(f"  {error}")
        print("\n💡 Fix these issues before running the bot.")
        return False
    
    # Check platforms
    enabled_platforms = [p for p, enabled in PLATFORMS_ENABLED.items() if enabled]
    print(f"\n✅ Platforms enabled: {', '.join(enabled_platforms)}")
    print(f"✅ Timezone: {TIMEZONE}")
    print(f"✅ Log file: {LOG_FILE}")
    
    # Check content
    content_manager = ContentManager()
    stats = content_manager.get_stats()
    print(f"✅ Total posts in database: {stats['total_posts']}")
    print(f"✅ Content sources loaded: {len(content_manager.content_cache)} types")
    
    print("\n" + "=" * 60)
    print("\n✅ All systems ready!\n")
    
    return True


def run_bot(test_mode=False):
    """Run the social engine bot"""
    print_banner()
    
    # Check configuration
    if not check_setup():
        print("\n❌ Configuration check failed. Exiting.")
        return
    
    if test_mode:
        print("🧪 TEST MODE: Will post once to each platform\n")
        scheduler = SocialScheduler()
        
        for platform in PLATFORMS_ENABLED:
            if PLATFORMS_ENABLED[platform]:
                print(f"\n📤 Testing {platform}...")
                result = scheduler.run_once(platform)
                if result:
                    print(f"✅ {platform} test successful")
                else:
                    print(f"❌ {platform} test failed")
        
        print("\n✅ Test complete!")
    
    else:
        print("🚀 PRODUCTION MODE: Starting 24/7 scheduler\n")
        scheduler = SocialScheduler()
        scheduler.run()


def show_status():
    """Show current status of the bot"""
    print_banner()
    print("\n📊 AMD Social Engine - Status Report\n")
    print("=" * 60)
    
    # Content stats
    content_manager = ContentManager()
    
    print("\n📈 POSTING STATISTICS:")
    overall_stats = content_manager.get_stats()
    print(f"  Total posts: {overall_stats['total_posts']}")
    print(f"  Avg engagement: {overall_stats['avg_engagement']}")
    print(f"  Total clicks: {overall_stats['total_clicks']}")
    
    # Per-platform stats
    print("\n📱 PLATFORM BREAKDOWN:")
    for platform in PLATFORMS_ENABLED:
        if PLATFORMS_ENABLED[platform]:
            stats = content_manager.get_stats(platform)
            print(f"\n  {platform.upper()}:")
            print(f"    Posts: {stats['total_posts']}")
            print(f"    Engagement: {stats['avg_engagement']}")
            print(f"    Clicks: {stats['total_clicks']}")
    
    # Next scheduled posts
    print("\n⏰ NEXT SCHEDULED POSTS:")
    scheduler = SocialScheduler()
    scheduler.setup_schedules()
    next_runs = scheduler.get_next_runs()
    
    for platform, next_time in next_runs.items():
        print(f"  {platform}: {next_time}")
    
    print("\n" + "=" * 60)


def manual_post(platform: str, message: str):
    """Manually post to a platform"""
    print(f"\n📤 Manual post to {platform}...\n")
    
    from platforms.twitter import TwitterPlatform
    from platforms.telegram import TelegramPlatform
    from platforms.youtube import YouTubePlatform
    from platforms.snapchat import SnapchatPlatform
    
    platforms = {
        'twitter': TwitterPlatform,
        'telegram': TelegramPlatform,
        'youtube': YouTubePlatform,
        'snapchat': SnapchatPlatform
    }
    
    if platform not in platforms:
        print(f"❌ Invalid platform: {platform}")
        print(f"Available: {', '.join(platforms.keys())}")
        return
    
    # Create platform instance
    platform_handler = platforms[platform]()
    
    # Post content
    content = {
        'text': message,
        'type': 'manual'
    }
    
    result = platform_handler.post(content)
    
    if result and result.get('success'):
        print(f"✅ Posted successfully!")
        if 'url' in result:
            print(f"URL: {result['url']}")
    else:
        print(f"❌ Post failed")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='AMD Social Engine - Automated Social Media Marketing'
    )
    
    parser.add_argument(
        '--test',
        action='store_true',
        help='Run in test mode (post once to each platform)'
    )
    
    parser.add_argument(
        '--status',
        action='store_true',
        help='Show current status and statistics'
    )
    
    parser.add_argument(
        '--post',
        type=str,
        help='Manually post a message'
    )
    
    parser.add_argument(
        '--platform',
        type=str,
        default='twitter',
        help='Platform for manual post (twitter, telegram, youtube, snapchat)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(verbose=args.verbose)
    
    # Handle commands
    if args.status:
        show_status()
    elif args.post:
        manual_post(args.platform, args.post)
    else:
        run_bot(test_mode=args.test)


if __name__ == '__main__':
    main()
