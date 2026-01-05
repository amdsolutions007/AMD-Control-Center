"""
Twitter Retry - Post AI-generated image with viral caption
"""

import logging
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from platforms.twitter import TwitterPlatform
from creative_engine import CreativeEngine

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def retry_twitter_post():
    """Retry posting to Twitter with AI-generated content"""
    
    logger.info("=" * 60)
    logger.info("🐦 TWITTER RETRY: AI-POWERED POST")
    logger.info("=" * 60)
    
    # Topic
    topic = "Job #21 Completed: Rise Up NG - Nigeria is Building the Digital Future"
    
    # Initialize
    logger.info("\n🎨 Step 1: Generating AI content...")
    creative = CreativeEngine()
    
    # Create post package
    package = creative.create_post_package(
        topic=topic,
        platform='twitter',
        use_brand_colors=True
    )
    
    if not package:
        logger.error("❌ Failed to generate creative package")
        return None
    
    logger.info(f"✅ Caption: {package['caption']}")
    logger.info(f"✅ Image: {package['image_path']}")
    
    # Post to Twitter
    logger.info("\n🐦 Step 2: Posting to Twitter...")
    twitter = TwitterPlatform()
    
    if not twitter.client or not twitter.api:
        logger.error("❌ Twitter not authenticated")
        return None
    
    try:
        # Upload image (API v1.1)
        logger.info("📤 Uploading image...")
        media = twitter.api.media_upload(filename=package['image_path'])
        logger.info(f"✅ Image uploaded: {media.media_id}")
        
        # Post tweet with image (API v2)
        logger.info("📝 Creating tweet...")
        response = twitter.client.create_tweet(
            text=package['caption'],
            media_ids=[media.media_id]
        )
        
        tweet_id = response.data['id']
        tweet_url = f"https://twitter.com/amdsolutions007/status/{tweet_id}"
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ SUCCESS! TWEET PUBLISHED")
        logger.info("=" * 60)
        logger.info(f"🐦 Tweet ID: {tweet_id}")
        logger.info(f"🔗 URL: {tweet_url}")
        logger.info(f"📝 Caption: {package['caption']}")
        logger.info("=" * 60)
        
        return {
            'success': True,
            'tweet_id': tweet_id,
            'url': tweet_url,
            'caption': package['caption']
        }
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Twitter post failed: {error_msg}")
        
        if '403' in error_msg or 'Forbidden' in error_msg:
            logger.info("\n" + "=" * 60)
            logger.info("⚠️ 403 FORBIDDEN ERROR DETECTED")
            logger.info("=" * 60)
            logger.info("\n🔧 SOLUTION:")
            logger.info("The Access Token was created BEFORE you changed to 'Read and Write' permissions.")
            logger.info("You need to regenerate it to sync with the new permissions.\n")
            logger.info("📋 STEPS:")
            logger.info("1. Go to: https://developer.twitter.com/en/portal/dashboard")
            logger.info("2. Select your app → Keys and tokens")
            logger.info("3. Under 'Access Token and Secret' → Click 'Regenerate'")
            logger.info("4. Copy the NEW Access Token and Access Token Secret")
            logger.info("5. Update /Users/mac/Desktop/AMD_Control_Center/.env:")
            logger.info("   TWITTER_ACCESS_TOKEN=<new_token>")
            logger.info("   TWITTER_ACCESS_SECRET=<new_secret>")
            logger.info("\n✅ Then run this script again!\n")
            logger.info("=" * 60)
        
        return None


if __name__ == '__main__':
    result = retry_twitter_post()
    
    if result:
        print(f"\n🎉 TWEET LIVE: {result['url']}")
    else:
        print("\n❌ Post failed - see instructions above")
