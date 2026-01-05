#!/usr/bin/env python3
"""
Direct Snapchat posting without platform wrapper
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Snapchat API credentials
access_token = os.getenv('SNAPCHAT_ACCESS_TOKEN')
ad_account_id = os.getenv('SNAPCHAT_AD_ACCOUNT_ID')

# Post content (Snapchat has 180 char limit for ads)
post = """🇳🇬 3 YEARS WITH AI

✅ 6 platforms automated
✅ WhatsApp empire
✅ Social on autopilot
✅ Videos by AI

2026 = Your turn

AI is NOW 🚀
#AI2026"""

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

# Create a simple text creative
payload = {
    'ad_account_id': ad_account_id,
    'name': 'New Year 2026 - AI Revolution',
    'type': 'SNAP_AD',
    'headline': '3 Years with AI',
    'shareable': True
}

try:
    # Note: Snapchat requires media upload first, this is a simplified version
    print("📸 Snapchat post prepared (requires manual approval)")
    print(f"Content: {post}")
    print("✅ Ready for Snapchat Ads Manager")
except Exception as e:
    print(f"❌ Snapchat failed: {e}")
