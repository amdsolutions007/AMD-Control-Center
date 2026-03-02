"""Pull runtime logs for the latest amd-sync-engine deployment."""
import json, requests
from pathlib import Path

config_path = Path.home() / ".railway" / "config.json"
with open(config_path) as f:
    cfg = json.load(f)
TOKEN      = cfg["user"]["token"]
DEPLOY_ID  = "8af05334"   # latest SUCCESS deploy (short prefix - need full ID)
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"
HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def gql(q, v=None):
    r = requests.post("https://backboard.railway.com/graphql/v2",
                      headers=HDRS, json={"query": q, "variables": v or {}}, timeout=15)
    return r.json()

# Get full deployment ID first
body = gql("""
query($serviceId: String!) {
  service(id: $serviceId) {
    deployments(first: 1) {
      edges { node { id status createdAt } }
    }
  }
}
""", {"serviceId": SERVICE_ID})

dep = body["data"]["service"]["deployments"]["edges"][0]["node"]
print(f"Latest deployment: {dep['id']} | {dep['status']} | {dep['createdAt'][:19]}")
full_deploy_id = dep["id"]

# Fetch runtime logs
body2 = gql("""
query($deploymentId: String!) {
  deploymentLogs(deploymentId: $deploymentId, filter: "", limit: 50) {
    timestamp
    severity
    message
  }
}
""", {"deploymentId": full_deploy_id})

logs = body2["data"].get("deploymentLogs") or []
if not logs:
    print("(no runtime logs yet — service may still be starting)")
else:
    print(f"\n--- Runtime logs ({len(logs)} lines) ---")
    for entry in logs:
        ts  = (entry.get("timestamp") or "")[:19]
        msg = entry.get("message") or ""
        print(f"[{ts}] {msg}")
