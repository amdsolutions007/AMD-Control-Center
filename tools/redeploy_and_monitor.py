"""Trigger redeploy of amd-sync-engine and monitor until SUCCESS or FAILED."""
import json, requests, time
from pathlib import Path

config_path = Path.home() / ".railway" / "config.json"
with open(config_path) as f:
    cfg = json.load(f)

TOKEN      = cfg["user"]["token"]
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"
ENV_ID     = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"
HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def gql(q, v=None):
    r = requests.post("https://backboard.railway.com/graphql/v2",
                      headers=HDRS, json={"query": q, "variables": v or {}}, timeout=15)
    return r.json()

# ── Trigger redeploy ──────────────────────────────────────────────────────────
body = gql("""
mutation($serviceId: String!, $environmentId: String!) {
  serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
}
""", {"serviceId": SERVICE_ID, "environmentId": ENV_ID})

if "errors" in body:
    print("❌ Redeploy failed:", body["errors"])
    exit(1)
print("🚀 Redeploy triggered — monitoring deployment status...")

# ── Poll deployment status every 15s ─────────────────────────────────────────
DEPLOY_QUERY = """
query($serviceId: String!) {
  service(id: $serviceId) {
    name
    deployments(first: 1) {
      edges {
        node {
          id
          status
          createdAt
        }
      }
    }
  }
}
"""

for attempt in range(24):   # max ~6 minutes
    time.sleep(15)
    body = gql(DEPLOY_QUERY, {"serviceId": SERVICE_ID})
    if "errors" in body:
        print(f"Poll error: {body['errors']}")
        continue

    entries = body["data"]["service"]["deployments"]["edges"]
    if not entries:
        print("  (no deployments yet)")
        continue

    d = entries[0]["node"]
    status = d["status"]
    ts     = d["createdAt"][:19]
    icon = {"SUCCESS": "✅", "BUILDING": "🔄", "DEPLOYING": "🚀",
            "FAILED": "❌", "CRASHED": "💥"}.get(status, "⏳")
    print(f"  {icon} {d['id'][:8]}  status={status:<12}  {ts}")

    if status == "SUCCESS":
        print("\n✅ amd-sync-engine is LIVE! Brain is polling LekeeLekee.")
        break
    elif status in ("FAILED", "CRASHED"):
        print(f"\n❌ Deployment {status}. Check Railway dashboard for build logs.")
        break
else:
    print("⚠️  Timed out — check Railway dashboard manually.")
