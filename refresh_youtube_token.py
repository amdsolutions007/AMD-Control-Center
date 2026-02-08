#!/usr/bin/env python3
import pickle
from google.auth.transport.requests import Request

with open('youtube_token.pickle', 'rb') as f:
    creds = pickle.load(f)

print("📊 Token Status:")
print(f"   Valid: {creds.valid}")
print(f"   Expired: {creds.expired}")
print(f"   Has refresh token: {bool(creds.refresh_token)}")

if creds.expired and creds.refresh_token:
    print("\n🔄 Refreshing token...")
    creds.refresh(Request())
    print("✅ Token refreshed!")
    print(f"   New validity: {creds.valid}")
    
    with open('youtube_token.pickle', 'wb') as f:
        pickle.dump(creds, f)
    print("✅ Saved refreshed token")
else:
    print("\n⚠️ Cannot refresh")
