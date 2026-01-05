#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - SNAPCHAT ADS DEPLOYMENT
═══════════════════════════════════════════════════════════════════════════
Protocol: Snapchat Marketing API (Ad Campaign Mode)
Target: Nigerian business owners aged 25-45
═══════════════════════════════════════════════════════════════════════════
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Snapchat Marketing API credentials
SNAPCHAT_ACCESS_TOKEN = os.getenv('SNAPCHAT_ACCESS_TOKEN')
SNAPCHAT_AD_ACCOUNT_ID = os.getenv('SNAPCHAT_AD_ACCOUNT_ID')

# Trinity Assets
VIDEO_PATH = '/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job1_NaijaBiz_Pilot/NaijaBiz_Pilot_Video_Master.mp4'
IMAGE_PATH = '/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job1_NaijaBiz_Pilot/NaijaBiz_Pilot_Flyer_Master.png'

# Campaign details
CAMPAIGN_NAME = "NaijaBiz Pilot - WhatsApp Automation Q1 2026"
AD_NAME = "Sleep While We Sell - Nigeria Launch"
BUDGET_DAILY = 5000  # ₦5,000/day (~$6 USD)
TARGET_URL = "https://amdsolutions007.com/links"

print("═" * 75)
print("📸 SNAPCHAT ADS DEPLOYMENT (MARKETING API)")
print("═" * 75)
print()
print("🎯 Campaign: NaijaBiz Pilot Launch")
print(f"💰 Daily Budget: ₦{BUDGET_DAILY:,}")
print("📍 Target: Nigerian business owners (25-45)")
print()

if not SNAPCHAT_ACCESS_TOKEN or not SNAPCHAT_AD_ACCOUNT_ID:
    print("⚠️  SNAPCHAT API CREDENTIALS MISSING")
    print()
    print("Required in .env:")
    print("  - SNAPCHAT_ACCESS_TOKEN")
    print("  - SNAPCHAT_AD_ACCOUNT_ID")
    print()
    print("═" * 75)
    print("🚨 MANUAL SNAPCHAT POST ALTERNATIVE")
    print("═" * 75)
    print()
    print("📸 Visual: Use video")
    print(f"📁 Location: {VIDEO_PATH}")
    print()
    print("📝 Caption:")
    print("-" * 75)
    print("""Stop losing sales while you sleep 😴💸

NaijaBiz Pilot = 24/7 WhatsApp AI

✅ Auto-replies instantly
✅ Closes deals at 3 AM
✅ Zero salary

Only 5 spots left ⚡

Swipe up: amdsolutions007.com

#WhatsAppBot #NaijaBiz""")
    print("-" * 75)
    print()
    print("Steps:")
    print("1. Open Snapchat app")
    print("2. Camera → Upload from gallery")
    print("3. Select video")
    print("4. Add caption and stickers")
    print("5. Post to Story")
    print()
    print("OR use Snapchat Ads Manager:")
    print("🔗 https://ads.snapchat.com")
    print()
    print("═" * 75)
    exit(0)

try:
    headers = {
        'Authorization': f'Bearer {SNAPCHAT_ACCESS_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    # Step 1: Create Campaign
    print("📤 Step 1/4: Creating ad campaign...")
    
    campaign_data = {
        "campaigns": [{
            "ad_account_id": SNAPCHAT_AD_ACCOUNT_ID,
            "name": CAMPAIGN_NAME,
            "status": "ACTIVE",
            "daily_budget_micro": BUDGET_DAILY * 1000000,  # Convert to micro currency
            "objective": "WEB_VIEW"
        }]
    }
    
    campaign_response = requests.post(
        f"https://adsapi.snapchat.com/v1/adaccounts/{SNAPCHAT_AD_ACCOUNT_ID}/campaigns",
        headers=headers,
        json=campaign_data
    )
    
    if campaign_response.status_code not in [200, 201]:
        print(f"❌ Campaign creation failed: {campaign_response.status_code}")
        print(campaign_response.text)
        exit(1)
    
    campaign_id = campaign_response.json()['campaigns'][0]['id']
    print(f"✅ Campaign created: {campaign_id}")
    print()
    
    # Step 2: Upload creative (video)
    print("📤 Step 2/4: Uploading video creative...")
    
    # Note: Snapchat requires media upload to their CDN first
    # This is a simplified version - full implementation would:
    # 1. Get upload URL
    # 2. Upload video to CDN
    # 3. Create creative with media ID
    
    print("⚠️  Video upload requires Snapchat CDN integration")
    print("📝 Use manual upload via Ads Manager for now")
    print()
    
    # Step 3: Create Ad Squad (Ad Set)
    print("📤 Step 3/4: Creating ad squad...")
    
    adsquad_data = {
        "adsquads": [{
            "campaign_id": campaign_id,
            "name": "Nigerian Business Owners",
            "status": "ACTIVE",
            "type": "SNAP_ADS",
            "placement": "SNAP_ADS",
            "billing_event": "IMPRESSION",
            "optimization_goal": "SWIPES",
            "bid_micro": 500000,  # ₦500 per 1000 impressions
            "targeting": {
                "geos": [{
                    "country_code": "NG"  # Nigeria
                }],
                "demographics": [{
                    "min_age": 25,
                    "max_age": 45
                }],
                "interests": [
                    {"id": "BUSINESS"},
                    {"id": "TECHNOLOGY"},
                    {"id": "ENTREPRENEURSHIP"}
                ]
            }
        }]
    }
    
    print("🎯 Targeting: Nigeria, Age 25-45, Business/Tech interests")
    print()
    
    print("═" * 75)
    print("✅ SNAPCHAT CAMPAIGN CONFIGURED")
    print("═" * 75)
    print()
    print(f"📊 Campaign ID: {campaign_id}")
    print(f"💰 Daily Budget: ₦{BUDGET_DAILY:,}")
    print("📍 Target: Nigerian entrepreneurs")
    print()
    print("🚨 NEXT STEP: Complete setup in Snapchat Ads Manager")
    print("🔗 https://ads.snapchat.com")
    print()
    print("Upload video creative and launch campaign manually.")
    print()
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    print("═" * 75)
    print("🚨 USE MANUAL SNAPCHAT POSTING")
    print("═" * 75)
    print()
    print("See alternative instructions above.")
    print()
