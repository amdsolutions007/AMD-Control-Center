"""
YouTube Platform Integration
Reuses OAuth logic from amd_bio_updater.py
Updates channel description and posts community updates
"""

import logging
import os
import sys
from pathlib import Path
from typing import Optional, Dict

try:
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    logging.warning("⚠️ Google API client not installed. Run: pip install google-auth-oauthlib google-api-python-client")

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config import (
    YOUTUBE_CLIENT_SECRETS_FILE,
    YOUTUBE_SCOPES,
    YOUTUBE_API_SERVICE_NAME,
    YOUTUBE_API_VERSION
)

logger = logging.getLogger(__name__)


class YouTubePlatform:
    """YouTube automation using Google API"""
    
    def __init__(self):
        self.youtube = None
        self.channel_id = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with YouTube API using OAuth 2.0"""
        if not GOOGLE_AVAILABLE:
            logger.error("❌ Google API client not installed")
            return
        
        try:
            creds = None
            token_file = Path(__file__).parent.parent / 'token.json'
            
            # Load existing credentials
            if token_file.exists():
                creds = Credentials.from_authorized_user_file(str(token_file), YOUTUBE_SCOPES)
            
            # If credentials invalid or don't exist, get new ones
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    secrets_path = Path(__file__).parent.parent / YOUTUBE_CLIENT_SECRETS_FILE
                    
                    if not secrets_path.exists():
                        logger.warning(f"⚠️ YouTube client secrets not found at: {secrets_path}")
                        logger.info("💡 Get credentials from: https://console.cloud.google.com/apis/credentials")
                        return
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        str(secrets_path),
                        YOUTUBE_SCOPES
                    )
                    creds = flow.run_local_server(port=0)
                
                # Save credentials
                with open(token_file, 'w') as token:
                    token.write(creds.to_json())
            
            # Build YouTube service
            self.youtube = build(
                YOUTUBE_API_SERVICE_NAME,
                YOUTUBE_API_VERSION,
                credentials=creds
            )
            
            # Get channel ID
            response = self.youtube.channels().list(
                part='id,snippet',
                mine=True
            ).execute()
            
            if response.get('items'):
                self.channel_id = response['items'][0]['id']
                channel_title = response['items'][0]['snippet']['title']
                logger.info(f"✅ YouTube authenticated: {channel_title}")
            
        except Exception as e:
            logger.error(f"❌ YouTube authentication failed: {e}")
            self.youtube = None
    
    def post(self, content: Dict) -> Optional[Dict]:
        """
        Update YouTube channel description (daily update)
        
        Args:
            content: Dictionary with 'text' or 'template' key
        
        Returns:
            Response dict, or None if failed
        """
        if not self.youtube:
            logger.error("❌ YouTube service not authenticated")
            return None
        
        try:
            # Get text from content
            text = content.get('text', content.get('template', ''))
            
            if not text:
                logger.error("❌ No text content provided")
                return None
            
            # Get current channel details
            channel_response = self.youtube.channels().list(
                part='snippet,brandingSettings',
                id=self.channel_id
            ).execute()
            
            if not channel_response.get('items'):
                logger.error("❌ Channel not found")
                return None
            
            channel = channel_response['items'][0]
            
            # Update channel description (append latest update)
            current_description = channel['snippet'].get('description', '')
            
            # Create new description with update
            new_description = f"{text}\n\n---\nUpdated: {self._get_timestamp()}\n\n{current_description}"
            
            # Limit description to 5000 characters
            if len(new_description) > 5000:
                new_description = new_description[:4997] + '...'
            
            # Update channel
            channel['snippet']['description'] = new_description
            
            update_response = self.youtube.channels().update(
                part='snippet',
                body=channel
            ).execute()
            
            logger.info("✅ YouTube channel description updated")
            
            return {
                'success': True,
                'channel_id': self.channel_id,
                'platform': 'youtube',
                'action': 'description_update'
            }
        
        except HttpError as e:
            logger.error(f"❌ YouTube API error: {e}")
        except Exception as e:
            logger.error(f"❌ Unexpected error updating YouTube: {e}")
        
        return None
    
    def post_community(self, content: Dict) -> Optional[Dict]:
        """
        Post to YouTube Community tab
        Note: Community posts require specific channel eligibility
        
        Args:
            content: Dictionary with 'text' key
        
        Returns:
            Response dict, or None if failed
        """
        if not self.youtube:
            logger.error("❌ YouTube service not authenticated")
            return None
        
        try:
            # Get text from content
            text = content.get('text', content.get('template', ''))
            
            if not text:
                logger.error("❌ No text content provided")
                return None
            
            # YouTube Community Post API
            # Note: This requires YouTube Data API v3 with special permissions
            post_body = {
                'snippet': {
                    'channelId': self.channel_id,
                    'description': text
                }
            }
            
            # This endpoint may not be available for all channels
            response = self.youtube.activities().insert(
                part='snippet',
                body=post_body
            ).execute()
            
            logger.info("✅ YouTube community post published")
            
            return {
                'success': True,
                'activity_id': response.get('id'),
                'platform': 'youtube',
                'action': 'community_post'
            }
        
        except HttpError as e:
            logger.warning(f"⚠️ YouTube community post not available: {e}")
            # Fallback to description update
            return self.post(content)
        except Exception as e:
            logger.error(f"❌ Error posting to YouTube community: {e}")
        
        return None
    
    def get_channel_stats(self) -> Optional[Dict]:
        """Get channel statistics"""
        if not self.youtube:
            return None
        
        try:
            response = self.youtube.channels().list(
                part='statistics,snippet',
                id=self.channel_id
            ).execute()
            
            if response.get('items'):
                item = response['items'][0]
                stats = item.get('statistics', {})
                
                return {
                    'subscribers': int(stats.get('subscriberCount', 0)),
                    'views': int(stats.get('viewCount', 0)),
                    'videos': int(stats.get('videoCount', 0)),
                    'title': item['snippet']['title']
                }
        
        except Exception as e:
            logger.error(f"❌ Error getting channel stats: {e}")
        
        return None
    
    def _get_timestamp(self) -> str:
        """Get formatted timestamp"""
        from datetime import datetime
        return datetime.now().strftime('%B %d, %Y at %I:%M %p WAT')


if __name__ == '__main__':
    # Test YouTube platform
    logging.basicConfig(level=logging.INFO)
    
    print("📺 YouTube Platform - Test\n")
    print("=" * 60)
    
    youtube = YouTubePlatform()
    
    if youtube.youtube:
        # Get channel stats
        stats = youtube.get_channel_stats()
        if stats:
            print(f"\n📊 Channel: {stats['title']}")
            print(f"Subscribers: {stats['subscribers']:,}")
            print(f"Views: {stats['views']:,}")
            print(f"Videos: {stats['videos']}")
        
        # Test update (commented out to prevent actual update)
        # test_content = {
        #     'text': '🤖 Latest Update: AMD Social Engine is now live! Automated posting across all platforms. #AMDSolutions007',
        #     'type': 'general'
        # }
        # result = youtube.post(test_content)
        
        print("\n✅ YouTube platform ready")
        print("💡 Uncomment test_content to try a real update")
    else:
        print("\n⚠️ YouTube not configured.")
        print("💡 Steps to configure:")
        print("1. Go to: https://console.cloud.google.com/apis/credentials")
        print("2. Create OAuth 2.0 Client ID")
        print("3. Download as client_secrets.json")
        print("4. Place in social_engine/ directory")
