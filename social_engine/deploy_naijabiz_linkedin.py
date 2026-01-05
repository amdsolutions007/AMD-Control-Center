#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - LINKEDIN DEPLOYMENT
═══════════════════════════════════════════════════════════════════════════
Protocol: LinkedIn API (Automated) with Image Upload
═══════════════════════════════════════════════════════════════════════════
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

# LinkedIn credentials
ACCESS_TOKEN = os.getenv('LINKEDIN_ACCESS_TOKEN')
USER_ID = os.getenv('LINKEDIN_USER_ID', 'urn:li:person:5SCsOhPJFZ')

# Sales caption
CAPTION = """Stop losing customers because you are asleep. 😴💸

It's 2026. If your business waits for you to wake up to reply, you are losing money.

Introducing the **NaijaBiz Pilot** by AMD Media Solutions. 🤖🚀

✅ Auto-Replies in 1 second.
✅ Sends Price Lists automatically.
✅ Closes sales while you sleep.

I am installing this for 5 Serious Businesses this week.

👇 **DM 'PILOT' to install.**

#WhatsAppAutomation #AI #NaijaBiz #SalesBot #AMDSolutions"""

# Flyer path
FLYER_PATH = '/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/NaijaBiz_Flyer.png'

print("═" * 75)
print("📱 DEPLOYING TO LINKEDIN")
print("═" * 75)
print()
print("🔑 Authenticating with LinkedIn API...")
print(f"👤 User: {USER_ID}")
print()
print("📝 Sales Caption:")
print("-" * 75)
print(CAPTION)
print("-" * 75)
print()
print("🖼️  Image: NaijaBiz_Flyer.png (1.82 MB)")
print()

try:
    # Step 1: Register upload
    print("📤 Step 1/3: Registering image upload...")
    
    register_url = "https://api.linkedin.com/v2/assets?action=registerUpload"
    register_payload = {
        "registerUploadRequest": {
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "owner": USER_ID,
            "serviceRelationships": [{
                "relationshipType": "OWNER",
                "identifier": "urn:li:userGeneratedContent"
            }]
        }
    }
    
    headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    register_response = requests.post(register_url, json=register_payload, headers=headers)
    
    if register_response.status_code != 200:
        print(f"❌ Registration failed: {register_response.status_code}")
        print(register_response.text)
        exit(1)
    
    register_data = register_response.json()
    upload_url = register_data['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl']
    asset = register_data['value']['asset']
    
    print(f"✅ Upload registered")
    print(f"📦 Asset: {asset}")
    print()
    
    # Step 2: Upload image
    print("📤 Step 2/3: Uploading image...")
    
    with open(FLYER_PATH, 'rb') as image_file:
        image_data = image_file.read()
    
    upload_headers = {
        'Authorization': f'Bearer {ACCESS_TOKEN}',
    }
    
    upload_response = requests.put(upload_url, data=image_data, headers=upload_headers)
    
    if upload_response.status_code not in [200, 201]:
        print(f"❌ Upload failed: {upload_response.status_code}")
        print(upload_response.text)
        exit(1)
    
    print("✅ Image uploaded")
    print()
    
    # Step 3: Create post
    print("📤 Step 3/3: Creating LinkedIn post...")
    
    post_url = "https://api.linkedin.com/v2/ugcPosts"
    post_payload = {
        "author": USER_ID,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": CAPTION
                },
                "shareMediaCategory": "IMAGE",
                "media": [{
                    "status": "READY",
                    "description": {
                        "text": "NaijaBiz Pilot - WhatsApp Automation Service"
                    },
                    "media": asset,
                    "title": {
                        "text": "NaijaBiz Pilot by AMD Media Solutions"
                    }
                }]
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    post_response = requests.post(post_url, json=post_payload, headers=headers)
    
    if post_response.status_code not in [200, 201]:
        print(f"❌ Post failed: {post_response.status_code}")
        print(post_response.text)
        exit(1)
    
    post_data = post_response.json()
    post_id = post_data['id']
    
    print("✅ POSTED TO LINKEDIN!")
    print(f"🔗 Post ID: {post_id}")
    print()
    print("═" * 75)
    print("🎯 NEXT: Post to WhatsApp Status (Manual)")
    print("═" * 75)
    print()
    print("📱 FLYER GENERATED. Please post `NaijaBiz_Flyer.png` to your WhatsApp Status now.")
    print(f"📁 Location: {FLYER_PATH}")
    print()
    print("═" * 75)
    print("✅ NAIJABIZ PILOT SALES CAMPAIGN LAUNCHED")
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    if "401" in str(e):
        print("🔑 LinkedIn token expired - regenerate access token")
    print("═" * 75)
