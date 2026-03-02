"""Get runtime logs for the latest amd-sync-engine deployment."""
import json, requests
from pathlib import Path

TOKEN      = json.load(open(Path.home() / ".railway" / "config.json"))["user"]["token"]
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"
HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def gql(q, v=None):
    return requests.post("https://backboard.railway.com/graphql/v2",
            headers=HDRS, json={"query": q, "variables": v or {}}, timeout=10).json()

# Get latest 2 deployments to find the one with Telegram bridge
body = gql("""
query($serviceId: String!) {
  service(id: $serviceId) {
    deployments(first: 3) {
      edges { node { id status createdAt } }
    }
  }
}""", {"serviceId": SERVICE_ID})

print("Recent deployments:")
deploys = body["data"]["service"]["deployments"]["edges"]
for e in deploys:
    d = e["node"]
    icon = {"SUCCESS": "✅", "BUILDING": "🔄", "FAILED": "❌"}.get(d["status"], "⏳")
    print(f"  {icon} {d['id'][:8]}  {d['status']:14s}  {d['createdAt'][:19]}")

# Use the latest successful one
latest   = deploys[0]["node"]
dep_id   = latest["id"]
print(f"\nFetching logs for {dep_id[:8]} ({latest['status']})...\n")

logs_body = gql("""
query($deploymentId: String!) {
  deploymentLogs(deploymentId: $deploymentId, filter: "", limit: 100) {
    timestamp
    severity
    message
  }
}""", {"deploymentId": dep_id})

logs = logs_body["data"].get("deploymentLogs") or []
for e in logs:
    msg = (e.get("message") or "").strip()
    ts  = (e.get("timestamp") or "")[:19]
    if msg:
        # highlight important lines
        prefix = "  "
        if any(k in msg for k in ("📱", "TELEGRAM", "AI DRAFT", "Telegram", "ONLINE", "ERROR", "WARN", "✅", "❌")):
            prefix = ">>>"
        print(f"{prefix}[{ts}] {msg}")
