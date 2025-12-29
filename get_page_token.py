import os
import requests
from dotenv import load_dotenv

load_dotenv()

USER_TOKEN = os.getenv('META_ACCESS_TOKEN')
APP_ID = os.getenv('META_APP_ID')

# Get list of pages managed by user
url = f"https://graph.facebook.com/v19.0/me/accounts"
params = {'access_token': USER_TOKEN}

response = requests.get(url, params=params)
data = response.json()

print("=" * 60)
print("YOUR FACEBOOK PAGES:")
print("=" * 60)

if 'data' in data:
    for page in data['data']:
        print(f"\nPage Name: {page['name']}")
        print(f"Page ID: {page['id']}")
        print(f"Page Access Token: {page['access_token']}")
        print("-" * 60)
else:
    print("Error:", data)
