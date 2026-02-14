#!/usr/bin/env python3
import requests
import json
import os

# Railway GraphQL API
RAILWAY_API = "https://backboard.railway.app/graphql/v2"

# Get token from config
config_path = os.path.expanduser("~/.railway/config.json")
with open(config_path, 'r') as f:
    config = json.load(f)
    api_token = config['user']['token']

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

# Service ID for telegram-approval-bot
TELEGRAM_SERVICE_ID = "e8b78196-e8bc-4f85-969e-6e853090ba73"
ENV_ID = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"

# Query to get deployment logs
query = """
query GetDeploymentLogs($environmentId: String!, $serviceId: String!) {
  deployments(input: {
    environmentId: $environmentId
    serviceId: $serviceId
  }) {
    edges {
      node {
        id
        status
        createdAt
        meta
      }
    }
  }
}
"""

variables = {
    "environmentId": ENV_ID,
    "serviceId": TELEGRAM_SERVICE_ID
}

print("🔍 Fetching telegram-approval-bot deployment info...")
response = requests.post(RAILWAY_API, json={"query": query, "variables": variables}, headers=headers)

if response.status_code == 200:
    data = response.json()
    if 'data' in data and data['data']['deployments']:
        deployments = data['data']['deployments']['edges']
        if deployments:
            latest = deployments[0]['node']
            print(f"\n📊 Latest Deployment:")
            print(f"   Status: {latest['status']}")
            print(f"   Created: {latest['createdAt']}")
            print(f"   ID: {latest['id']}")
            
            if 'meta' in latest and latest['meta']:
                print(f"\n🔧 Deployment Info:")
                meta = latest['meta']
                for key, value in meta.items():
                    if key in ['commitHash', 'commitMessage', 'builder', 'dockerfilePath']:
                        print(f"   {key}: {value}")
        else:
            print("❌ No deployments found for this service")
    else:
        print("❌ No deployment data")
        print(json.dumps(data, indent=2))
else:
    print(f"❌ API Error: {response.status_code}")
    print(response.text)

# Now try to get logs URL
print(f"\n📝 View logs at:")
print(f"https://railway.com/project/04114a84-a0a4-463f-ae22-94c442e4c36b/service/{TELEGRAM_SERVICE_ID}")
