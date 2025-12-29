"""
Snapchat Platform Integration
Uses existing Snapchat Marketing API credentials from .env.local
"""

import logging
import requests
import sys
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from config import (
    SNAP_CLIENT_ID,
    SNAP_CLIENT_SECRET,
    SNAP_AD_ACCOUNT_ID,
    SNAP_MARKETING_REFRESH_TOKEN,
    SNAP_PIXEL_ID
)

logger = logging.getLogger(__name__)


class SnapchatPlatform:
    """Snapchat Marketing API automation"""
    
    def __init__(self):
        self.access_token = None
        self.ad_account_id = SNAP_AD_ACCOUNT_ID
        self.base_url = 'https://adsapi.snapchat.com/v1'
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate and get access token using refresh token"""
        if not SNAP_MARKETING_REFRESH_TOKEN:
            logger.warning("⚠️ Snapchat refresh token not found")
            return
        
        try:
            # Exchange refresh token for access token
            token_url = 'https://accounts.snapchat.com/login/oauth2/access_token'
            
            data = {
                'refresh_token': SNAP_MARKETING_REFRESH_TOKEN,
                'client_id': SNAP_CLIENT_ID,
                'client_secret': SNAP_CLIENT_SECRET,
                'grant_type': 'refresh_token'
            }
            
            response = requests.post(token_url, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data.get('access_token')
            
            logger.info("✅ Snapchat authenticated successfully")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Snapchat authentication failed: {e}")
            self.access_token = None
    
    def post(self, content: Dict) -> Optional[Dict]:
        """
        Create Snapchat ad or story post
        Note: Snapchat Marketing API is primarily for ads, not organic posts
        
        Args:
            content: Dictionary with 'text' or 'template' key
        
        Returns:
            Response dict with campaign details, or None if failed
        """
        if not self.access_token:
            logger.error("❌ Snapchat not authenticated")
            return None
        
        try:
            # Get text from content
            text = content.get('text', content.get('template', ''))
            
            if not text:
                logger.error("❌ No text content provided")
                return None
            
            # Snapchat Marketing API is for ads, not organic posts
            # We'll create a simple awareness campaign
            campaign_result = self._create_awareness_campaign(text, content)
            
            if campaign_result:
                logger.info(f"✅ Snapchat campaign created: {campaign_result['campaign_id']}")
                return campaign_result
        
        except Exception as e:
            logger.error(f"❌ Error posting to Snapchat: {e}")
        
        return None
    
    def _create_awareness_campaign(self, text: str, content: Dict) -> Optional[Dict]:
        """Create a brand awareness campaign"""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Create campaign
            campaign_url = f'{self.base_url}/adaccounts/{self.ad_account_id}/campaigns'
            
            # Extract title from text (first 50 chars)
            campaign_name = text[:50].replace('\n', ' ').strip()
            
            campaign_data = {
                'campaigns': [{
                    'name': f'AMD Social - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
                    'ad_account_id': self.ad_account_id,
                    'status': 'PAUSED',  # Create as paused for review
                    'objective': 'AWARENESS',
                    'start_time': datetime.utcnow().isoformat() + 'Z',
                    'end_time': (datetime.utcnow() + timedelta(days=7)).isoformat() + 'Z'
                }]
            }
            
            response = requests.post(campaign_url, json=campaign_data, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            if result.get('campaigns'):
                campaign_id = result['campaigns'][0]['campaign']['id']
                
                return {
                    'success': True,
                    'campaign_id': campaign_id,
                    'platform': 'snapchat',
                    'status': 'PAUSED',
                    'note': 'Campaign created as PAUSED. Review and activate in Snapchat Ads Manager.'
                }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Snapchat API error: {e}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response: {e.response.text}")
        
        return None
    
    def get_account_info(self) -> Optional[Dict]:
        """Get ad account information"""
        if not self.access_token:
            return None
        
        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }
        
        try:
            url = f'{self.base_url}/adaccounts/{self.ad_account_id}'
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('adaccount'):
                account = data['adaccount']
                return {
                    'name': account.get('name'),
                    'status': account.get('status'),
                    'currency': account.get('currency'),
                    'timezone': account.get('timezone')
                }
        
        except Exception as e:
            logger.error(f"❌ Error getting account info: {e}")
        
        return None
    
    def get_campaigns(self) -> Optional[list]:
        """Get list of campaigns"""
        if not self.access_token:
            return None
        
        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }
        
        try:
            url = f'{self.base_url}/adaccounts/{self.ad_account_id}/campaigns'
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('campaigns'):
                return [
                    {
                        'id': c['campaign']['id'],
                        'name': c['campaign']['name'],
                        'status': c['campaign']['status'],
                        'objective': c['campaign'].get('objective')
                    }
                    for c in data['campaigns']
                ]
        
        except Exception as e:
            logger.error(f"❌ Error getting campaigns: {e}")
        
        return None
    
    def track_pixel_event(self, event_name: str, event_data: Dict) -> bool:
        """Track Snapchat Pixel event"""
        if not SNAP_PIXEL_ID:
            logger.warning("⚠️ Snapchat Pixel ID not configured")
            return False
        
        try:
            pixel_url = 'https://tr.snapchat.com/v2/conversion'
            
            payload = {
                'pixel_id': SNAP_PIXEL_ID,
                'event_type': event_name,
                'event_conversion_type': 'WEB',
                'event_tag': 'AMD_Social_Engine',
                'timestamp': int(datetime.utcnow().timestamp() * 1000),
                **event_data
            }
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            response = requests.post(pixel_url, json=payload, headers=headers)
            response.raise_for_status()
            
            logger.info(f"✅ Pixel event tracked: {event_name}")
            return True
        
        except Exception as e:
            logger.error(f"❌ Error tracking pixel event: {e}")
            return False


if __name__ == '__main__':
    # Test Snapchat platform
    logging.basicConfig(level=logging.INFO)
    
    print("👻 Snapchat Platform - Test\n")
    print("=" * 60)
    
    snapchat = SnapchatPlatform()
    
    if snapchat.access_token:
        # Get account info
        account_info = snapchat.get_account_info()
        if account_info:
            print(f"\n📊 Account: {account_info['name']}")
            print(f"Status: {account_info['status']}")
            print(f"Currency: {account_info['currency']}")
        
        # Get campaigns
        campaigns = snapchat.get_campaigns()
        if campaigns:
            print(f"\n📢 Active Campaigns: {len(campaigns)}")
            for camp in campaigns[:3]:
                print(f"  - {camp['name']} ({camp['status']})")
        
        print("\n✅ Snapchat platform ready")
        print("💡 Marketing API integrated successfully")
    else:
        print("\n⚠️ Snapchat not authenticated")
        print("💡 Check SNAP_MARKETING_REFRESH_TOKEN in .env.local")
