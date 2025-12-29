"""
Twitter/X Platform Integration
Uses tweepy with free tier API (1,500 posts/month)
"""

import tweepy
import logging
from typing import Optional, Dict
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config import (
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET,
    WHATSAPP_NUMBER
)

logger = logging.getLogger(__name__)


class TwitterPlatform:
    """Twitter automation using tweepy"""
    
    def __init__(self):
        self.client = None
        self.api = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Twitter API"""
        try:
            # Check if credentials are placeholder values
            if 'YOUR_' in TWITTER_CONSUMER_KEY:
                logger.warning("⚠️ Twitter credentials not configured. Please update config.py")
                return
            
            # OAuth 1.0a User Context
            auth = tweepy.OAuthHandler(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET)
            auth.set_access_token(TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET)
            
            # API v1.1 for media uploads
            self.api = tweepy.API(auth)
            
            # API v2 for posting
            self.client = tweepy.Client(
                consumer_key=TWITTER_CONSUMER_KEY,
                consumer_secret=TWITTER_CONSUMER_SECRET,
                access_token=TWITTER_ACCESS_TOKEN,
                access_token_secret=TWITTER_ACCESS_SECRET
            )
            
            # Test authentication
            user = self.client.get_me()
            if user and user.data:
                logger.info(f"✅ Twitter authenticated as: @{user.data.username}")
            
        except Exception as e:
            logger.error(f"❌ Twitter authentication failed: {e}")
            self.client = None
            self.api = None
    
    def post(self, content: Dict) -> Optional[Dict]:
        """
        Post content to Twitter
        
        Args:
            content: Dictionary with 'text' or 'template' key
        
        Returns:
            Response dict with tweet_id and url, or None if failed
        """
        if not self.client:
            logger.error("❌ Twitter client not authenticated")
            return None
        
        try:
            # Get text from content
            text = content.get('text', content.get('template', ''))
            
            if not text:
                logger.error("❌ No text content provided")
                return None
            
            # Add hashtags if present
            if 'hashtags' in content:
                hashtags = ' '.join(f"#{tag}" for tag in content['hashtags'])
                text = f"{text}\n\n{hashtags}"
            
            # Add WhatsApp CTA if it's a service/product ad
            if content.get('type') in ['service_ad', 'product_ad']:
                wa_link = f"\n\n📞 WhatsApp: https://wa.me/{WHATSAPP_NUMBER.replace('+', '')}"
                # Twitter limits to 280 chars
                if len(text + wa_link) <= 280:
                    text += wa_link
            
            # Ensure tweet is within limit
            if len(text) > 280:
                text = text[:277] + '...'
            
            # Post tweet
            response = self.client.create_tweet(text=text)
            
            if response and response.data:
                tweet_id = response.data['id']
                username = self.client.get_me().data.username
                tweet_url = f"https://twitter.com/{username}/status/{tweet_id}"
                
                logger.info(f"✅ Tweet posted: {tweet_url}")
                
                return {
                    'success': True,
                    'tweet_id': tweet_id,
                    'url': tweet_url,
                    'platform': 'twitter'
                }
            
        except tweepy.TweepyException as e:
            logger.error(f"❌ Twitter API error: {e}")
        except Exception as e:
            logger.error(f"❌ Unexpected error posting to Twitter: {e}")
        
        return None
    
    def post_thread(self, tweets: list) -> Optional[Dict]:
        """
        Post a thread of tweets
        
        Args:
            tweets: List of tweet texts
        
        Returns:
            Response dict with thread details
        """
        if not self.client:
            logger.error("❌ Twitter client not authenticated")
            return None
        
        try:
            thread_ids = []
            previous_tweet_id = None
            
            for i, tweet_text in enumerate(tweets, 1):
                # Ensure tweet is within limit
                if len(tweet_text) > 280:
                    tweet_text = tweet_text[:277] + '...'
                
                # Create tweet (reply to previous if threading)
                if previous_tweet_id:
                    response = self.client.create_tweet(
                        text=tweet_text,
                        in_reply_to_tweet_id=previous_tweet_id
                    )
                else:
                    response = self.client.create_tweet(text=tweet_text)
                
                if response and response.data:
                    tweet_id = response.data['id']
                    thread_ids.append(tweet_id)
                    previous_tweet_id = tweet_id
                    logger.info(f"✅ Tweet {i}/{len(tweets)} posted")
            
            username = self.client.get_me().data.username
            thread_url = f"https://twitter.com/{username}/status/{thread_ids[0]}"
            
            return {
                'success': True,
                'thread_ids': thread_ids,
                'url': thread_url,
                'total_tweets': len(thread_ids),
                'platform': 'twitter'
            }
            
        except Exception as e:
            logger.error(f"❌ Error posting thread: {e}")
            return None
    
    def get_metrics(self, tweet_id: str) -> Optional[Dict]:
        """Get engagement metrics for a tweet"""
        if not self.client:
            return None
        
        try:
            tweet = self.client.get_tweet(
                id=tweet_id,
                tweet_fields=['public_metrics']
            )
            
            if tweet and tweet.data:
                metrics = tweet.data.public_metrics
                return {
                    'likes': metrics.get('like_count', 0),
                    'retweets': metrics.get('retweet_count', 0),
                    'replies': metrics.get('reply_count', 0),
                    'impressions': metrics.get('impression_count', 0)
                }
        
        except Exception as e:
            logger.error(f"❌ Error getting metrics: {e}")
        
        return None


if __name__ == '__main__':
    # Test Twitter platform
    logging.basicConfig(level=logging.INFO)
    
    print("🐦 Twitter Platform - Test\n")
    print("=" * 60)
    
    twitter = TwitterPlatform()
    
    if twitter.client:
        # Test post
        test_content = {
            'text': '🤖 Testing AMD Social Engine automation! This is an automated post from our new system. #AMDSolutions007 #TestPost',
            'type': 'general'
        }
        
        result = twitter.post(test_content)
        if result:
            print(f"\n✅ Test post successful!")
            print(f"URL: {result['url']}")
        else:
            print("\n❌ Test post failed")
    else:
        print("\n⚠️ Twitter not configured. Add credentials to config.py")
