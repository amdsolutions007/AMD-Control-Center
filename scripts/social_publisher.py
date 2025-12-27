#!/usr/bin/env python3
"""
AMD Social Publisher - Multi-Platform API Integration
Connects AMD Control Center to Twitter (X) and LinkedIn for real-time posting.
"""

import os
import sys
import json
from typing import Dict, Any, Optional

try:
    import tweepy
except ImportError:
    print("⚠️  tweepy not installed. Run: pip install tweepy")
    tweepy = None

try:
    import requests
except ImportError:
    print("⚠️  requests not installed. Run: pip install requests")
    requests = None


class SocialPublisher:
    """Multi-platform social media publisher for AMD Solutions"""
    
    def __init__(self):
        """Initialize API clients with environment credentials"""
        self.twitter_client = None
        self.linkedin_token = None
        self.results = {
            "twitter": {"status": "not_configured", "message": None, "post_id": None},
            "linkedin": {"status": "not_configured", "message": None, "post_id": None}
        }
        
        # Initialize Twitter (X) API v2
        self._init_twitter()
        
        # Initialize LinkedIn API
        self._init_linkedin()
    
    def _init_twitter(self):
        """Initialize Twitter API v2 client"""
        if not tweepy:
            self.results["twitter"]["status"] = "error"
            self.results["twitter"]["message"] = "tweepy package not installed"
            return
        
        # Twitter API v2 credentials
        api_key = os.environ.get('TWITTER_API_KEY')
        api_secret = os.environ.get('TWITTER_API_SECRET')
        access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
        access_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')
        bearer_token = os.environ.get('TWITTER_BEARER_TOKEN')
        
        if not all([api_key, api_secret, access_token, access_secret]):
            self.results["twitter"]["status"] = "error"
            self.results["twitter"]["message"] = "Missing Twitter API credentials (check env vars)"
            return
        
        try:
            # Twitter API v2 Client (for posting tweets)
            self.twitter_client = tweepy.Client(
                bearer_token=bearer_token,
                consumer_key=api_key,
                consumer_secret=api_secret,
                access_token=access_token,
                access_token_secret=access_secret,
                wait_on_rate_limit=True
            )
            self.results["twitter"]["status"] = "ready"
            self.results["twitter"]["message"] = "Twitter API v2 authenticated"
            print("✅ Twitter API v2 initialized")
        except Exception as e:
            self.results["twitter"]["status"] = "error"
            self.results["twitter"]["message"] = f"Twitter auth failed: {str(e)}"
            print(f"❌ Twitter initialization failed: {e}")
    
    def _init_linkedin(self):
        """Initialize LinkedIn API client"""
        if not requests:
            self.results["linkedin"]["status"] = "error"
            self.results["linkedin"]["message"] = "requests package not installed"
            return
        
        access_token = os.environ.get('LINKEDIN_ACCESS_TOKEN')
        
        if not access_token:
            self.results["linkedin"]["status"] = "error"
            self.results["linkedin"]["message"] = "Missing LINKEDIN_ACCESS_TOKEN (check env vars)"
            return
        
        self.linkedin_token = access_token
        self.results["linkedin"]["status"] = "ready"
        self.results["linkedin"]["message"] = "LinkedIn API token configured"
        print("✅ LinkedIn API initialized")
    
    def post_to_twitter(self, content: str) -> Dict[str, Any]:
        """
        Post content to Twitter (X) using API v2
        
        Args:
            content: Tweet text (max 280 characters)
        
        Returns:
            Dict with status, message, and post_id
        """
        if self.results["twitter"]["status"] != "ready":
            return {
                "status": "error",
                "message": self.results["twitter"]["message"],
                "post_id": None
            }
        
        if not content or len(content.strip()) == 0:
            return {
                "status": "error",
                "message": "Content cannot be empty",
                "post_id": None
            }
        
        # Twitter character limit
        if len(content) > 280:
            print(f"⚠️  Tweet truncated from {len(content)} to 280 characters")
            content = content[:277] + "..."
        
        try:
            # Post tweet using API v2
            response = self.twitter_client.create_tweet(text=content)
            tweet_id = response.data['id']
            
            result = {
                "status": "success",
                "message": f"Tweet posted successfully (ID: {tweet_id})",
                "post_id": tweet_id,
                "url": f"https://twitter.com/i/web/status/{tweet_id}"
            }
            
            print(f"✅ Twitter: Posted successfully")
            print(f"   URL: {result['url']}")
            
            return result
            
        except tweepy.TweepyException as e:
            error_msg = f"Twitter API error: {str(e)}"
            print(f"❌ Twitter: {error_msg}")
            return {
                "status": "error",
                "message": error_msg,
                "post_id": None
            }
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            print(f"❌ Twitter: {error_msg}")
            return {
                "status": "error",
                "message": error_msg,
                "post_id": None
            }
    
    def post_to_linkedin(self, content: str) -> Dict[str, Any]:
        """
        Post content to LinkedIn using UGC Post API
        
        Args:
            content: Post text (max 3000 characters)
        
        Returns:
            Dict with status, message, and post_id
        """
        if self.results["linkedin"]["status"] != "ready":
            return {
                "status": "error",
                "message": self.results["linkedin"]["message"],
                "post_id": None
            }
        
        if not content or len(content.strip()) == 0:
            return {
                "status": "error",
                "message": "Content cannot be empty",
                "post_id": None
            }
        
        # LinkedIn character limit
        if len(content) > 3000:
            print(f"⚠️  LinkedIn post truncated from {len(content)} to 3000 characters")
            content = content[:2997] + "..."
        
        try:
            # Get LinkedIn user profile (Person URN)
            headers = {
                "Authorization": f"Bearer {self.linkedin_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }
            
            # Fetch user profile to get Person URN
            profile_response = requests.get(
                "https://api.linkedin.com/v2/me",
                headers=headers,
                timeout=10
            )
            
            if profile_response.status_code != 200:
                return {
                    "status": "error",
                    "message": f"LinkedIn auth failed: {profile_response.status_code}",
                    "post_id": None
                }
            
            person_id = profile_response.json().get('id')
            person_urn = f"urn:li:person:{person_id}"
            
            # Create UGC Post (User Generated Content)
            post_data = {
                "author": person_urn,
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
            
            post_response = requests.post(
                "https://api.linkedin.com/v2/ugcPosts",
                headers=headers,
                json=post_data,
                timeout=10
            )
            
            if post_response.status_code in [200, 201]:
                post_id = post_response.headers.get('X-RestLi-Id', 'unknown')
                
                result = {
                    "status": "success",
                    "message": f"LinkedIn post published successfully (ID: {post_id})",
                    "post_id": post_id,
                    "url": f"https://www.linkedin.com/feed/update/{post_id}/"
                }
                
                print(f"✅ LinkedIn: Posted successfully")
                print(f"   URL: {result['url']}")
                
                return result
            else:
                error_msg = f"LinkedIn API error: {post_response.status_code} - {post_response.text}"
                print(f"❌ LinkedIn: {error_msg}")
                return {
                    "status": "error",
                    "message": error_msg,
                    "post_id": None
                }
                
        except requests.exceptions.RequestException as e:
            error_msg = f"LinkedIn request error: {str(e)}"
            print(f"❌ LinkedIn: {error_msg}")
            return {
                "status": "error",
                "message": error_msg,
                "post_id": None
            }
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            print(f"❌ LinkedIn: {error_msg}")
            return {
                "status": "error",
                "message": error_msg,
                "post_id": None
            }
    
    def broadcast(self, content: str, platforms: list = None) -> Dict[str, Dict[str, Any]]:
        """
        Broadcast content to multiple social platforms
        
        Args:
            content: Content to post
            platforms: List of platforms ['twitter', 'linkedin'] (default: all)
        
        Returns:
            Dict with results for each platform
        """
        if platforms is None:
            platforms = ['twitter', 'linkedin']
        
        results = {}
        
        print(f"\n🚀 Broadcasting to {len(platforms)} platform(s)...")
        print(f"📝 Content preview: {content[:100]}{'...' if len(content) > 100 else ''}\n")
        
        if 'twitter' in platforms:
            results['twitter'] = self.post_to_twitter(content)
        
        if 'linkedin' in platforms:
            results['linkedin'] = self.post_to_linkedin(content)
        
        return results


def main():
    """CLI interface for social publisher"""
    if len(sys.argv) < 2:
        print("Usage: python social_publisher.py <content> [--twitter] [--linkedin]")
        print("\nExamples:")
        print("  python social_publisher.py 'Hello World!'")
        print("  python social_publisher.py 'Launch announcement' --twitter")
        print("  python social_publisher.py 'New release' --twitter --linkedin")
        sys.exit(1)
    
    content = sys.argv[1]
    
    # Parse platform flags
    platforms = []
    if '--twitter' in sys.argv or '-t' in sys.argv:
        platforms.append('twitter')
    if '--linkedin' in sys.argv or '-l' in sys.argv:
        platforms.append('linkedin')
    
    # Default: broadcast to all platforms
    if not platforms:
        platforms = ['twitter', 'linkedin']
    
    # Initialize publisher
    publisher = SocialPublisher()
    
    # Broadcast
    results = publisher.broadcast(content, platforms)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 BROADCAST SUMMARY")
    print("="*60)
    
    success_count = sum(1 for r in results.values() if r['status'] == 'success')
    error_count = sum(1 for r in results.values() if r['status'] == 'error')
    
    for platform, result in results.items():
        status_icon = "✅" if result['status'] == 'success' else "❌"
        print(f"\n{status_icon} {platform.upper()}")
        print(f"   Status: {result['status']}")
        print(f"   Message: {result['message']}")
        if result.get('url'):
            print(f"   URL: {result['url']}")
    
    print(f"\n📈 Results: {success_count} success, {error_count} failed")
    print("="*60 + "\n")
    
    # Exit with error code if any platform failed
    sys.exit(0 if error_count == 0 else 1)


if __name__ == "__main__":
    main()
