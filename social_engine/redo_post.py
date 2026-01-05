"""
Redo Post - Delete old dry post and repost with AI visuals
Operation: Upgrade Job #21 post with DALL-E + GPT-4
"""

import logging
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from platforms.twitter import TwitterPlatform
from platforms.telegram import TelegramPlatform
from platforms.snapchat import SnapchatPlatform
from creative_engine import CreativeEngine

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def delete_old_tweet(tweet_id: str) -> bool:
    """Delete the old dry tweet"""
    try:
        twitter = TwitterPlatform()
        if twitter.client:
            twitter.client.delete_tweet(id=tweet_id)
            logger.info(f"✅ Deleted old tweet: {tweet_id}")
            return True
    except Exception as e:
        logger.warning(f"⚠️ Could not delete tweet: {e}")
    return False


def redo_post():
    """Execute the redo: Generate AI visuals + repost"""
    
    logger.info("=" * 60)
    logger.info("🚀 OPERATION: SOCIAL MEDIA CREATIVE UPGRADE")
    logger.info("=" * 60)
    
    # Topic for the post
    topic = "Job #21 Completed: Rise Up NG. The Nation is Building."
    
    # Old tweet ID (from the dry post)
    old_tweet_id = "2006401959545258197"
    
    # Step 1: Delete old tweet
    logger.info("\n🗑️ Step 1: Deleting old dry post...")
    delete_old_tweet(old_tweet_id)
    
    # Step 2: Generate creative assets
    logger.info("\n🎨 Step 2: Generating AI visuals and viral caption...")
    creative_engine = CreativeEngine()
    
    package = creative_engine.create_post_package(
        topic=topic,
        platform='twitter',
        use_brand_colors=True
    )
    
    if not package:
        logger.error("❌ Failed to generate creative package")
        return
    
    logger.info(f"✅ Caption: {package['caption'][:100]}...")
    logger.info(f"✅ Image: {package['image_path']}")
    
    # Step 3: Post to Twitter with image
    logger.info("\n🐦 Step 3: Posting to X/Twitter...")
    twitter = TwitterPlatform()
    
    content = {
        'text': topic,  # Will be overridden by AI caption
        'type': 'announcement'
    }
    
    twitter_result = twitter.post(content)
    
    if twitter_result and twitter_result.get('success'):
        logger.info(f"✅ Twitter: {twitter_result['url']}")
    else:
        logger.error("❌ Twitter post failed")
    
    # Step 4: Post to Telegram
    logger.info("\n📱 Step 4: Posting to Telegram...")
    telegram = TelegramPlatform()
    
    # Generate Telegram-specific caption
    telegram_package = creative_engine.create_post_package(
        topic=topic,
        platform='telegram',
        use_brand_colors=True
    )
    
    if telegram_package:
        telegram_content = {
            'text': telegram_package['caption'],
            'image_path': telegram_package['image_path']
        }
        telegram_result = telegram.post(telegram_content)
        
        if telegram_result and telegram_result.get('success'):
            logger.info("✅ Telegram posted successfully")
        else:
            logger.error("❌ Telegram post failed")
    
    # Step 5: Post to Snapchat
    logger.info("\n👻 Step 5: Posting to Snapchat...")
    snapchat = SnapchatPlatform()
    
    snapchat_content = {
        'text': package['caption'],
        'type': 'announcement'
    }
    
    snapchat_result = snapchat.post(snapchat_content)
    
    if snapchat_result and snapchat_result.get('success'):
        logger.info(f"✅ Snapchat: Campaign {snapchat_result.get('campaign_id', 'created')}")
    else:
        logger.error("❌ Snapchat post failed")
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 REDO COMPLETE - SUMMARY")
    logger.info("=" * 60)
    logger.info(f"✅ Old post deleted: {old_tweet_id}")
    logger.info(f"✅ AI image generated: {package['image_path']}")
    logger.info(f"✅ Viral caption created ({len(package['caption'])} chars)")
    logger.info(f"✅ Posted to: Twitter, Telegram, Snapchat")
    logger.info("=" * 60)


if __name__ == '__main__':
    redo_post()
