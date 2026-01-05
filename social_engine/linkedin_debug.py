#!/usr/bin/env python3
"""
LinkedIn Auth - Manual Token Test
Helps debug authentication issues
"""
import requests
import urllib.parse

print("🔍 LINKEDIN TOKEN EXCHANGE DEBUG")
print("=" * 70)

# Paste values manually for testing
CLIENT_ID = input("Enter Client ID: ").strip()
CLIENT_SECRET = input("Enter Client Secret (full): ").strip()
AUTH_CODE = input("Enter Authorization Code: ").strip()
REDIRECT_URI = "http://localhost:8000/callback"

print(f"\n📋 Testing with:")
print(f"   Client ID: {CLIENT_ID}")
print(f"   Secret length: {len(CLIENT_SECRET)} chars")
print(f"   Code length: {len(AUTH_CODE)} chars")
print(f"   Redirect URI: {REDIRECT_URI}")

token_url = 'https://www.linkedin.com/oauth/v2/accessToken'

# Method 1: Form data
print("\n🧪 Method 1: application/x-www-form-urlencoded")
payload = urllib.parse.urlencode({
    'grant_type': 'authorization_code',
    'code': AUTH_CODE,
    'redirect_uri': REDIRECT_URI,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
})

response = requests.post(
    token_url,
    data=payload,
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}\n")

if response.status_code == 200:
    token = response.json()['access_token']
    print(f"✅ SUCCESS! Token: {token[:30]}...")
    print("\nAdd this to .env:")
    print(f"LINKEDIN_ACCESS_TOKEN={token}")
else:
    print("❌ Failed. Check credentials in LinkedIn Developer Portal")
