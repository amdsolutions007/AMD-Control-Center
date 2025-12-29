"""
Scheduler - Posts content at optimal times
Nigerian timezone, peak engagement hours
"""

import schedule
import time
import logging
from datetime import datetime
import pytz
from typing import Callable, Dict
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from config import TIMEZONE, POSTING_TIMES, PLATFORMS_ENABLED
from content_manager import ContentManager
from platforms.twitter import TwitterPlatform
from platforms.telegram import TelegramPlatform
from platforms.youtube import YouTubePlatform
from platforms.snapchat import SnapchatPlatform

logger = logging.getLogger(__name__)


class SocialScheduler:
    """Schedule and execute social media posts"""
    
    def __init__(self):
        self.content_manager = ContentManager()
        self.timezone = pytz.timezone(TIMEZONE)
        
        # Initialize platforms
        self.platforms = {}
        if PLATFORMS_ENABLED.get('twitter'):
            self.platforms['twitter'] = TwitterPlatform()
        if PLATFORMS_ENABLED.get('telegram'):
            self.platforms['telegram'] = TelegramPlatform()
        if PLATFORMS_ENABLED.get('youtube'):
            self.platforms['youtube'] = YouTubePlatform()
        if PLATFORMS_ENABLED.get('snapchat'):
            self.platforms['snapchat'] = SnapchatPlatform()
        
        logger.info(f"✅ Scheduler initialized with {len(self.platforms)} platforms")
    
    def setup_schedules(self):
        """Setup all scheduled posts"""
        # Twitter posts
        for time_str in POSTING_TIMES.get('twitter', []):
            schedule.every().day.at(time_str).do(
                self.post_to_platform,
                platform='twitter'
            ).tag('twitter')
        
        # Telegram posts
        for time_str in POSTING_TIMES.get('telegram', []):
            schedule.every().day.at(time_str).do(
                self.post_to_platform,
                platform='telegram'
            ).tag('telegram')
        
        # YouTube posts
        for time_str in POSTING_TIMES.get('youtube', []):
            schedule.every().day.at(time_str).do(
                self.post_to_platform,
                platform='youtube'
            ).tag('youtube')
        
        # Snapchat posts
        for time_str in POSTING_TIMES.get('snapchat', []):
            schedule.every().day.at(time_str).do(
                self.post_to_platform,
                platform='snapchat'
            ).tag('snapchat')
        
        logger.info("✅ All schedules configured")
        self.print_schedule()
    
    def post_to_platform(self, platform: str) -> bool:
        """
        Post content to specified platform
        
        Args:
            platform: 'twitter', 'telegram', 'youtube', 'snapchat'
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if platform is available
            if platform not in self.platforms:
                logger.warning(f"⚠️ Platform {platform} not configured")
                return False
            
            # Get next content
            content = self.content_manager.get_next_content(platform)
            
            if not content:
                logger.warning(f"⚠️ No content available for {platform}")
                return False
            
            # Post to platform
            platform_handler = self.platforms[platform]
            result = platform_handler.post(content)
            
            if result and result.get('success'):
                # Mark as posted
                text = content.get('text', content.get('template', ''))
                content_type = content.get('type', 'general')
                
                post_id = self.content_manager.mark_as_posted(
                    platform=platform,
                    content=text,
                    content_type=content_type
                )
                
                logger.info(f"✅ Posted to {platform}: Post ID {post_id}")
                
                # Log result details
                if 'url' in result:
                    logger.info(f"   URL: {result['url']}")
                if 'campaign_id' in result:
                    logger.info(f"   Campaign: {result['campaign_id']}")
                
                return True
            else:
                logger.error(f"❌ Failed to post to {platform}")
                return False
        
        except Exception as e:
            logger.error(f"❌ Error posting to {platform}: {e}")
            return False
    
    def run_once(self, platform: str):
        """Manually trigger a post to platform (for testing)"""
        logger.info(f"🔄 Manual post to {platform}...")
        return self.post_to_platform(platform)
    
    def print_schedule(self):
        """Print current schedule"""
        logger.info("\n" + "=" * 60)
        logger.info("📅 POSTING SCHEDULE")
        logger.info("=" * 60)
        
        for platform, times in POSTING_TIMES.items():
            if PLATFORMS_ENABLED.get(platform):
                logger.info(f"\n{platform.upper()}: {len(times)} posts/day")
                for time_str in times:
                    logger.info(f"  ⏰ {time_str} WAT")
        
        logger.info("\n" + "=" * 60)
    
    def get_next_runs(self) -> Dict[str, str]:
        """Get next run time for each platform"""
        next_runs = {}
        
        for job in schedule.jobs:
            platform = list(job.tags)[0] if job.tags else 'unknown'
            next_run = job.next_run
            
            if platform not in next_runs or next_run < next_runs[platform]:
                next_runs[platform] = next_run
        
        return {
            platform: time.strftime('%Y-%m-%d %H:%M:%S')
            for platform, time in next_runs.items()
        }
    
    def run(self):
        """Run scheduler loop"""
        logger.info("🚀 AMD Social Engine starting...")
        logger.info(f"⏰ Timezone: {TIMEZONE}")
        
        self.setup_schedules()
        
        logger.info("\n✅ Scheduler running. Press Ctrl+C to stop.\n")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        
        except KeyboardInterrupt:
            logger.info("\n⏹️ Scheduler stopped by user")
        except Exception as e:
            logger.error(f"\n❌ Scheduler error: {e}")


if __name__ == '__main__':
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('social_engine.log'),
            logging.StreamHandler()
        ]
    )
    
    # Run scheduler
    scheduler = SocialScheduler()
    scheduler.run()
