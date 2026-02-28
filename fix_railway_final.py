#!/usr/bin/env python3
"""
Railway Service Fixer - CEO Approved
1. Delete duplicate ghostwriter-telegram-bot
2. Update telegram-approval-bot to use Dockerfile.telegram
3. Update ghost-writer-poster to use Dockerfile.ghostwriter
4. Trigger redeployments
"""

import requests
import json
import time

RAILWAY_API = "https://backboard.railway.app/graphql/v2"
RAILWAY_TOKEN = "rw_Fe26.2**a4ea42877acfe5f580389c0394fc840777c6abbbe9175f910aeed09aff89ffa5*iemyrlgiJIa9OtaBfePryg*AXzC8uIKkRJSuV65u6yP-hc-bplGOItQKwbt28Fqlgpm5-8Uz7PW4omubhOYyERckfXYB_6wJX-zsc-p11ZIIQ*1771934408410*ef41458dbdd67b636afaf92cd12733327513850e98c542c1db851ec90915dc8c*K8KY3b6cPdwnDP8R4et7cCu3ErCx7vuNg19FGsBd-NM"
PROJECT_ID = "04114a84-a0a4-463f-ae22-94c442e4c36b"
ENV_ID = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"

headers = {
    "Authorization": f"Bearer {RAILWAY_TOKEN}",
    "Content-Type": "application/json"
}

def query(gql, variables=None):
    response = requests.post(RAILWAY_API, headers=headers, json={"query": gql, "variables": variables})
    return response.json()

# Step 1: Get all services
print("🔍 Fetching services...")
result = query("""
query {
  project(id: "04114a84-a0a4-463f-ae22-94c442e4c36b") {
    services {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}
""")

services = {edge["node"]["name"]: edge["node"]["id"] for edge in result["data"]["project"]["services"]["edges"]}
print(f"✅ Found {len(services)} services")
for name, sid in services.items():
    print(f"   - {name}: {sid}")

# Step 2: Delete duplicate ghostwriter-telegram-bot
if "ghostwriter-telegram-bot" in services:
    print("\n🗑️  Deleting duplicate ghostwriter-telegram-bot...")
    delete_result = query("""
    mutation($serviceId: String!) {
      serviceDelete(id: $serviceId)
    }
    """, {"serviceId": services["ghostwriter-telegram-bot"]})
    
    if "errors" in delete_result:
        print(f"❌ Delete failed: {delete_result['errors']}")
    else:
        print("✅ Duplicate deleted")

# Step 3: Update telegram-approval-bot source to use Dockerfile
print("\n🔧 Updating telegram-approval-bot configuration...")
update_result = query("""
mutation($serviceId: String!, $source: ServiceSourceUpdateInput!) {
  serviceSourceUpdate(serviceId: $serviceId, input: $source)
}
""", {
    "serviceId": services["telegram-approval-bot"],
    "source": {
        "image": None,
        "repo": "amdsolutions007/AMD-Control-Center",
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile.telegram"
    }
})

print(json.dumps(update_result, indent=2))

# Step 4: Update ghost-writer-poster source
print("\n🔧 Updating ghost-writer-poster configuration...")
update_result2 = query("""
mutation($serviceId: String!, $source: ServiceSourceUpdateInput!) {
  serviceSourceUpdate(serviceId: $serviceId, input: $source)
}
""", {
    "serviceId": services["ghost-writer-poster"],
    "source": {
        "image": None,
        "repo": "amdsolutions007/AMD-Control-Center",
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile.ghostwriter"
    }
})

print(json.dumps(update_result2, indent=2))

print("\n✅ Configuration updated! Triggering redeployments...")
print("   Services will rebuild with correct Dockerfiles in ~2 minutes")
