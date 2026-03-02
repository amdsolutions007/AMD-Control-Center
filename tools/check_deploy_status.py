"""Check Railway deployment status for amd-sync-engine via GraphQL API."""
import json, requests
from pathlib import Path

# — Load token from Railway config ——————————————————————————————————————————
config_path = Path.home() / ".railway" / "config.json"
with open(config_path) as f:
    cfg = json.load(f)
TOKEN      = cfg["user"]["token"]
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"   # amd-sync-engine

QUERY = """
query($serviceId: String!) {
  service(id: $serviceId) {
    id
    name
    deployments(first: 5) {
      edges {
        node {
          id
          status
          createdAt
          url
        }
      }
    }
  }
}
"""

r = requests.post(
    "https://backboard.railway.com/graphql/v2",
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    json={"query": QUERY, "variables": {"serviceId": SERVICE_ID}},
    timeout=15,
)
body = r.json()
if "errors" in body:
    print("GraphQL errors:", body["errors"])
else:
    svc = body["data"]["service"]
    print(f"Service : {svc['name']}")
    print(f"ID      : {svc['id'][:8]}...")
    print()
    for edge in svc["deployments"]["edges"]:
        d = edge["node"]
        ts   = d["createdAt"][:19]
        url  = d.get("url") or "(no URL yet)"
        stat = d["status"]
        icon = {"SUCCESS": "✅", "BUILDING": "🔄", "DEPLOYING": "🚀",
                "FAILED": "❌", "CRASHED": "💥"}.get(stat, "⏳")
        print(f"  {icon} {d['id'][:8]}  status={stat:<12}  created={ts}")
        if d.get("url"):
            print(f"           url={url}")
    print()
    latest = svc["deployments"]["edges"][0]["node"] if svc["deployments"]["edges"] else None
    if latest:
        s = latest["status"]
        if s == "SUCCESS":
            print("✅ amd-sync-engine is LIVE — brain is polling LekeeLekee every 5 min")
        elif s in ("BUILDING", "DEPLOYING"):
            print(f"🔄 Still {s}... check again in 60s")
        elif s in ("FAILED", "CRASHED"):
            print(f"❌ Deployment FAILED — check build logs on Railway dashboard")
        else:
            print(f"Status: {s}")
