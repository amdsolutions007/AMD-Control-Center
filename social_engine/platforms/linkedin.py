"""
LinkedIn Platform Module - Official API
Posts to LinkedIn Company Page or Personal Profile
"""

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load credentials
root_env = Path(__file__).parent.parent.parent / '.env'
load_dotenv(root_env)

LINKEDIN_ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN', '')
LINKEDIN_PERSON_URN = os.getenv('LINKEDIN_PERSON_URN', '')  # Person ID for personal posts
LINKEDIN_ORGANIZATION_URN = os.getenv('LINKEDIN_ORGANIZATION_URN', '')  # Company page ID

def post_to_linkedin(content: str, use_company=False) -> dict:
    """
    Create a post on LinkedIn
    
    Args:
        content: Post text content
        use_company: If True, post to company page; if False, post to personal profile
        
    Returns:
        dict with 'success' (bool) and 'message' or 'post_id'
    """
    if not LINKEDIN_ACCESS_TOKEN:
        return {
            'success': False,
            'message': 'Missing LINKEDIN_ACCESS_TOKEN - Visit: https://www.linkedin.com/developers/apps'
        }
    
    # Determine author URN
    if use_company:
        if not LINKEDIN_ORGANIZATION_URN:
            return {'success': False, 'message': 'Missing LINKEDIN_ORGANIZATION_URN'}
        author = f"urn:li:organization:{LINKEDIN_ORGANIZATION_URN}"
    else:
        if not LINKEDIN_PERSON_URN:
            return {'success': False, 'message': 'Missing LINKEDIN_PERSON_URN'}
        author = f"urn:li:person:{LINKEDIN_PERSON_URN}"
    
    # LinkedIn API v2
    url = "https://api.linkedin.com/v2/ugcPosts"
    
    headers = {
        'Authorization': f'Bearer {LINKEDIN_ACCESS_TOKEN}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    payload = {
        "author": author,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": content[:3000]  # Max 3000 chars
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        # LinkedIn returns post ID in headers
        post_id = response.headers.get('x-restli-id', 'unknown')
        
        return {
            'success': True,
            'post_id': post_id,
            'message': f'Posted to LinkedIn successfully: {post_id}'
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'message': f'LinkedIn API error: {str(e)}'
        }

if __name__ == '__main__':
    test_content = "🚀 AMD Solutions 007 - Transforming businesses through technology. #TechInnovation #Nigeria"
    result = post_to_linkedin(test_content, use_company=False)
    print(result)
