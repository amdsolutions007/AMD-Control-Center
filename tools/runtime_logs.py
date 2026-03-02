"""Pull latest runtime logs for amd-sync-engine."""
import json, requests
from pathlib import Path

TOKEN      = json.load(open(Path.home() / ".railway" / "config.json"))["user"]["token"]
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"
HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# Get latest deploy ID
body = requests.post("https://backboard.railway.com/graphql/v2", headers=HDRS,
    json={"query": """
query($serviceId: String!) {
  service(id: $serviceId) {
    deployments(first: 1) {
      edges { node { id status createdAt } }
    }
  }
}""", "variables": {"serviceId": SERVICE_ID}}, timeout=10).json()

dep    = body["data"]["service"]["deployments"]["edges"][0]["node"]
dep_id = dep["id"]
print(f"Deployment: {dep_id[:8]}  |  {dep['status']}  |  {dep['createdAt'][:19]}\n")

# Get runtime logs
logs_body = requests.post("https://backboard.railway.com/graphql/v2", headers=HDRS,
    json={"query": """
query($deploymentId: String!) {
  deploymentLogs(deploymentId: $deploymentId, filter: "", limit: 80) {
    timestamp
    severity
    message
  }
}""", "variables": {"deploymentId": dep_id}}, timeout=10).json()

logs = logs_body["data"].get("deploymentLogs") or []
if not logs:
    print("(no runtime logs yet)")
else:
    for e in logs:
        ts  = (e.get("timestamp") or "")[:19]
        msg = (e.get("message") or "")
        if msg.strip():
            print(f"[{ts}] {msg}")
