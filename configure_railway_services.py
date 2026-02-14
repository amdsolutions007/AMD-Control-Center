import requests
import json
import os

# Railway GraphQL API endpoint
RAILWAY_API = "https://backboard.railway.app/graphql/v2"

# Get Railway API token
config_path = os.path.expanduser("~/.railway/config.json")
with open(config_path, 'r') as f:
    config = json.load(f)
    api_token = config['user']['token']

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

# Service IDs from creation
TELEGRAM_SERVICE_ID = "e8b78196-e8bc-4f85-969e-6e853090ba73"
GHOSTWRITER_SERVICE_ID = "d55b15f8-d1b0-47d5-828a-1ff55fc815ab"
ENV_ID = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"

# Connect service to GitHub repo and configure Docker build
service_connect_mutation = """
mutation ServiceConnect($id: String!, $repo: String!, $branch: String) {
  serviceConnect(id: $id, repo: $repo, branch: $branch) {
    id
    name
  }
}
"""

# Update service to use Dockerfile
service_update_mutation = """
mutation ServiceInstanceUpdate($input: ServiceInstanceUpdateInput!, $serviceId: String!) {
  serviceInstanceUpdate(input: $input, serviceId: $serviceId) {
    builder
    dockerfilePath
    buildCommand
  }
}
"""

print("🔗 Connecting Telegram Bot to GitHub...")
telegram_connect = {
    "id": TELEGRAM_SERVICE_ID,
    "repo": "amdsolutions007/AMD-Control-Center",
    "branch": "main"
}
response = requests.post(RAILWAY_API, json={"query": service_connect_mutation, "variables": telegram_connect}, headers=headers)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

print("\n🔗 Connecting Ghost Writer to GitHub...")
ghostwriter_connect = {
    "id": GHOSTWRITER_SERVICE_ID,
    "repo": "amdsolutions007/AMD-Control-Center",
    "branch": "main"
}
response = requests.post(RAILWAY_API, json={"query": service_connect_mutation, "variables": telegram_connect}, headers=headers)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

print("\n🐳 Configuring Telegram Bot Dockerfile...")
telegram_config = {
    "input": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile.telegram",
        "environmentId": ENV_ID
    },
    "serviceId": TELEGRAM_SERVICE_ID
}
response = requests.post(RAILWAY_API, json={"query": service_update_mutation, "variables": telegram_config}, headers=headers)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

print("\n🐳 Configuring Ghost Writer Dockerfile...")
ghostwriter_config = {
    "input": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile.ghostwriter",
        "environmentId": ENV_ID
    },
    "serviceId": GHOSTWRITER_SERVICE_ID
}
response = requests.post(RAILWAY_API, json={"query": service_update_mutation, "variables": ghostwriter_config}, headers=headers)
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

print("\n✅ Services configured! Railway will now deploy both services with their Dockerfiles.")
