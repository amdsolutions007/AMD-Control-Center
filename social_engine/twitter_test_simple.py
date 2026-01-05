"""
Twitter Test - Simple text post to verify API access
"""

import logging
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from platforms.twitter import TwitterPlatform

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_simple_post():
    """Test with simple text post - no image"""
    
    logger.info("=" * 60)
    logger.info("🐦 TWITTER TEST: SIMPLE TEXT POST")
    logger.info("=" * 60)
    
    twitter = TwitterPlatform()
    
    if not twitter.client:
        logger.error("❌ Twitter not authenticated")
        return None
    
    # Simple test tweet
    test_text = "🚀 Test post from AMD Solutions 007. Job #21 Complete: Rise Up NG is LIVE! 🇳🇬 #RiseUpNG #NaijaTech"
    
    try:
        logger.info(f"📝 Posting: {test_text}")
        
        response = twitter.client.create_tweet(text=test_text)
        
        tweet_id = response.data['id']
        tweet_url = f"https://twitter.com/amdsolutions007/status/{tweet_id}"
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ SUCCESS! TEXT POST WORKED")
        logger.info("=" * 60)
        logger.info(f"🐦 Tweet ID: {tweet_id}")
        logger.info(f"🔗 URL: {tweet_url}")
        logger.info("=" * 60)
        logger.info("\n💡 CONCLUSION: API access is working!")
        logger.info("The issue is specifically with MEDIA posts.")
        logger.info("This suggests elevated access or media-specific permissions needed.")
        
        return {'success': True, 'tweet_id': tweet_id, 'url': tweet_url}
    
    except Exception as e:
        logger.error(f"❌ Even text post failed: {e}")
        logger.info("\nIf this fails too, then yes - we need to regenerate tokens.")
        return None


if __name__ == '__main__':
    result = test_simple_post()
    
    if result:
        print(f"\n✅ POSTED: {result['url']}")
    else:
        print("\n❌ Failed")
