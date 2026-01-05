"""
Test D-ID API authentication and capabilities.
"""

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv(dotenv_path=Path('.env'))
DID_API_KEY = os.getenv('DID_API_KEY')

if not DID_API_KEY:
    raise ValueError("DID_API_KEY not found in .env file")

# Mask the key for display
masked_key = f"{DID_API_KEY[:20]}...{DID_API_KEY[-10:]}"
print(f"✅ D-ID API Key loaded: {masked_key}")
print()

# Test 1: Check credits/account info
print("=" * 60)
print("TEST 1: Account Information")
print("=" * 60)

headers = {
    'Authorization': f'Basic {DID_API_KEY}',
    'Content-Type': 'application/json',
}

# Get account credits
response = requests.get('https://api.d-id.com/credits', headers=headers)
print(f"GET /credits: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"✅ Account Credits: {data}")
else:
    print(f"Response: {response.text[:300]}")
print()

# Test 2: List available actors/presenters
print("=" * 60)
print("TEST 2: Available Actors/Presenters")
print("=" * 60)

response = requests.get('https://api.d-id.com/actors', headers=headers)
print(f"GET /actors: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    actors = data.get('actors', [])
    print(f"✅ Found {len(actors)} actors")
    if actors:
        print("First 3 actors:")
        for actor in actors[:3]:
            print(f"  - {actor.get('id')}: {actor.get('gender')} ({actor.get('thumbnail_url', 'N/A')[:50]}...)")
else:
    print(f"Response: {response.text[:300]}")
print()

# Test 3: Check if we can upload custom images
print("=" * 60)
print("TEST 3: Image Upload Capability")
print("=" * 60)

response = requests.get('https://api.d-id.com/images', headers=headers)
print(f"GET /images: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"✅ Images endpoint accessible")
    print(f"Response: {data}")
else:
    print(f"Response: {response.text[:300]}")
print()

# Test 4: Check talks endpoint (video generation)
print("=" * 60)
print("TEST 4: Video Generation Endpoint")
print("=" * 60)

response = requests.get('https://api.d-id.com/talks', headers=headers)
print(f"GET /talks: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    talks = data.get('talks', [])
    print(f"✅ Talks endpoint accessible")
    print(f"   Previous talks: {len(talks)}")
else:
    print(f"Response: {response.text[:300]}")
print()

print("=" * 60)
print("SUMMARY")
print("=" * 60)
print("D-ID API authentication test complete.")
print("If all endpoints returned 200, you're ready to generate videos!")
