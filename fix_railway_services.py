#!/usr/bin/env python3
"""
Railway Service Fixer - Update builder configuration via GraphQL API
Forces telegram-approval-bot and ghost-writer-poster to use correct Dockerfiles
"""

import requests
import json

# Railway API Configuration
RAILWAY_API = "https://backboard.railway.app/graphql/v2"
RAILWAY_TOKEN = "rw_Fe26.2**a4ea42877acfe5f580389c0394fc840777c6abbbe9175f910aeed09aff89ffa5*iemyrlgiJIa9OtaBfePryg*AXzC8uIKkRJSuV65u6yP-hc-bplGOItQKwbt28Fqlgpm5-8Uz7PW4omubhOYyERckfXYB_6wJX-zsc-p11ZIIQ*1771934408410*ef41458dbdd67b636afaf92cd12733327513850e98c542c1db851ec90915dc8c*K8KY3b6cPdwnDP8R4et7cCu3ErCx7vuNg19FGsBd-NM"
PROJECT_ID = "04114a84-a0a4-463f-ae22-94c442e4c36b"

headers = {
    "Authorization": f"Bearer {RAILWAY_TOKEN}",
    "Content-Type": "application/json"
}

def graphql_query(query, variables=None):
    """Execute GraphQL query"""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    
    response = requests.post(RAILWAY_API, headers=headers, json=payload)
    return response.json()

# Step 1: Get project with services
print("🔍 Fetching Railway services...")
services_query = """
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
"""

result = graphql_query(services_query)
print(json.dumps(result, indent=2))

if "data" in result and result["data"]["project"] and result["data"]["project"]["services"]:
    services = {edge["node"]["name"]: edge["node"]["id"] for edge in result["data"]["project"]["services"]["edges"]}
    print(f"\n✅ Found {len(services)} services:")
    for name, service_id in services.items():
        print(f"   - {name}: {service_id}")
    
    # Step 2: Update telegram-approval-bot builder
    if "telegram-approval-bot" in services:
        print("\n🔧 Updating telegram-approval-bot to use Dockerfile.telegram...")
        
        update_mutation = """
        mutation($serviceId: String!, $input: ServiceUpdateInput!) {
          serviceUpdate(id: $serviceId, input: $input) {
            id
            name
          }
        }
        """
        
        variables = {
            "serviceId": services["telegram-approval-bot"],
            "input": {
                "builder": "DOCKERFILE",
                "dockerfilePath": "Dockerfile.telegram"
            }
        }
        
        result = graphql_query(update_mutation, variables)
        print(json.dumps(result, indent=2))
    
    # Step 3: Update ghost-writer-poster builder
    if "ghost-writer-poster" in services:
        print("\n🔧 Updating ghost-writer-poster to use Dockerfile.ghostwriter...")
        
        variables = {
            "serviceId": services["ghost-writer-poster"],
            "input": {
                "builder": "DOCKERFILE",
                "dockerfilePath": "Dockerfile.ghostwriter"
            }
        }
        
        result = graphql_query(update_mutation, variables)
        print(json.dumps(result, indent=2))
    
    print("\n✅ Service configuration updated! Now trigger redeployments...")
    print("   Run: npx -y @railway/cli redeploy --service telegram-approval-bot")
    print("   Run: npx -y @railway/cli redeploy --service ghost-writer-poster")

else:
    print(f"\n❌ Error fetching services: {result}")
