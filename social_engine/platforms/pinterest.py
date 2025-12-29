"""
Pinterest Platform Module - Official API
Posts pins to Pinterest boards
"""

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load credentials
root_env = Path(__file__).parent.parent.parent / '.env'
load_dotenv(root_env)

PINTEREST_ACCESS_TOKEN = os.getenv('PINTEREST_ACCESS_TOKEN', '')
PINTEREST_BOARD_ID = os.getenv('PINTEREST_BOARD_ID', '')

def post_to_pinterest(content: str, image_url: str = None, link: str = None) -> dict:
    """
    Create a pin on Pinterest
    
    Args:
        content: Pin description
        image_url: URL of image to pin
        link: Website link
        
    Returns:
        dict with 'success' (bool) and 'message' or 'pin_id'
    """
    if not PINTEREST_ACCESS_TOKEN or not PINTEREST_BOARD_ID:
        return {
            'success': False,
            'message': 'Missing PINTEREST_ACCESS_TOKEN or PINTEREST_BOARD_ID - Visit: https://developers.pinterest.com/apps/'
        }
    
    # Pinterest API v5
    url = "https://api.pinterest.com/v5/pins"
    
    headers = {
        'Authorization': f'Bearer {PINTEREST_ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'board_id': PINTEREST_BOARD_ID,
        'description': content[:500],  # Max 500 chars
    }
    
    # Add media
    if image_url:
        payload['media_source'] = {
            'source_type': 'image_url',
            'url': image_url
        }
    
    # Add link
    if link:
        payload['link'] = link
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        pin_id = data.get('id', '')
        
        return {
            'success': True,
            'pin_id': pin_id,
            'message': f'Pinned successfully: {pin_id}'
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'message': f'Pinterest API error: {str(e)}'
        }

if __name__ == '__main__':
    test_content = "🚀 AMD Solutions - Professional Tech Services in Nigeria #Technology #Nigeria"
    result = post_to_pinterest(test_content, link="https://amdsolutions007.com")
    print(result)
