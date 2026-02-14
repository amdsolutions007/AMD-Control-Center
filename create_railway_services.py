import requests
import json
import os

# Railway GraphQL API endpoint
RAILWAY_API = "https://backboard.railway.app/graphql/v2"

# Get Railway API token from config file
config_path = os.path.expanduser("~/.railway/config.json")
with open(config_path, 'r') as f:
    config = json.load(f)
    api_token = config['user']['token']

if not api_token:
    print("ERROR: No Railway API token found")
    exit(1)

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

# Project and environment IDs
PROJECT_ID = "04114a84-a0a4-463f-ae22-94c442e4c36b"
ENV_ID = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"

# GraphQL mutation to create service
create_service_mutation = """
mutation ServiceCreate($environmentId: String!, $name: String!, $projectId: String!, $source: ServiceSourceInput) {
  serviceCreate(input: {
    environmentId: $environmentId
    name: $name
    projectId: $projectId
    source: $source
  }) {
    id
    name
  }
}
"""

# Create Telegram Bot service
telegram_variables = {
    "environmentId": ENV_ID,
    "name": "telegram-approval-bot",
    "projectId": PROJECT_ID,
    "source": {
        "repo": "amdsolutions007/AMD-Control-Center",
        "image": None
    }
}

print("🤖 Creating Telegram Approval Bot service...")
response = requests.post(RAILWAY_API, json={"query": create_service_mutation, "variables": telegram_variables}, headers=headers)
print(f"Status: {response.status_code}")
result = response.json()
print(json.dumps(result, indent=2))

if 'errors' in result:
    print("\n⚠️  Service creation failed. This may mean the service already exists or API format changed.")
    print("Let me check existing services...")
    exit(1)

telegram_service_id = result['data']['serviceCreate']['id']
print(f"✅ Telegram Bot Service ID: {telegram_service_id}")

# Create Ghost Writer service
ghostwriter_variables = {
    "environmentId": ENV_ID,
    "name": "ghost-writer-poster",
    "projectId": PROJECT_ID,
    "source": {
        "repo": "amdsolutions007/AMD-Control-Center",
        "image": None
    }
}

print("\n👻 Creating Ghost Writer Poster service...")
response = requests.post(RAILWAY_API, json={"query": create_service_mutation, "variables": ghostwriter_variables}, headers=headers)
print(f"Status: {response.status_code}")
result = response.json()
print(json.dumps(result, indent=2))

if 'errors' in result:
    print("\n⚠️  Service creation failed. Checking existing services...")
    exit(1)

ghostwriter_service_id = result['data']['serviceCreate']['id']
print(f"✅ Ghost Writer Service ID: {ghostwriter_service_id}")

print("\n🚀 Both services created successfully! Railway will auto-deploy with all project variables.")
