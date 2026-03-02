"""Redeploy both amd-sync-engine and telegram-approval-bot on Railway."""
import json, requests, time
from pathlib import Path

config_path = Path.home() / ".railway" / "config.json"
with open(config_path) as f:
    cfg = json.load(f)

TOKEN      = cfg["user"]["token"]
PROJECT_ID = "04114a84-a0a4-463f-ae22-94c442e4c36b"
ENV_ID     = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"
HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def gql(q, v=None):
    r = requests.post("https://backboard.railway.com/graphql/v2",
                      headers=HDRS, json={"query": q, "variables": v or {}}, timeout=15)
    return r.json()

# Get all services in project
body = gql("""
query($projectId: String!) {
  project(id: $projectId) {
    services {
      edges {
        node { id name }
      }
    }
  }
}
""", {"projectId": PROJECT_ID})

services = {
    e["node"]["name"]: e["node"]["id"]
    for e in body["data"]["project"]["services"]["edges"]
}
print("Services in project:")
for name, sid in services.items():
    print(f"  {name}: {sid[:8]}...")

# Trigger redeployment for both services
REDEPLOY_MUT = """
mutation($serviceId: String!, $environmentId: String!) {
  serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
}
"""

for service_name in ["amd-sync-engine", "telegram-approval-bot"]:
    sid = services.get(service_name)
    if not sid:
        print(f"  ⚠️ {service_name} not found in project services")
        continue
    body = gql(REDEPLOY_MUT, {"serviceId": sid, "environmentId": ENV_ID})
    if "errors" in body:
        print(f"  ❌ redeploy({service_name}): {body['errors']}")
    else:
        print(f"  🚀 Redeploy triggered: {service_name}")

print("\nBoth services queued for redeploy. Waiting 30s then checking status...")
time.sleep(30)

STATUS_Q = """
query($serviceId: String!) {
  service(id: $serviceId) {
    name
    deployments(first: 1) {
      edges {
        node { id status createdAt }
      }
    }
  }
}
"""
for service_name in ["amd-sync-engine", "telegram-approval-bot"]:
    sid = services.get(service_name)
    if not sid:
        continue
    body = gql(STATUS_Q, {"serviceId": sid})
    if "errors" in body:
        continue
    entries = body["data"]["service"]["deployments"]["edges"]
    if entries:
        d = entries[0]["node"]
        icon = {"SUCCESS": "✅", "BUILDING": "🔄", "DEPLOYING": "🚀", "FAILED": "❌"}.get(d["status"], "⏳")
        print(f"  {icon} {service_name}: {d['status']} | {d['createdAt'][:19]}")
