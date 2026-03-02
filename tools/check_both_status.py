"""Check deployment status of both amd-sync-engine and telegram-approval-bot."""
import json, requests
from pathlib import Path

TOKEN = json.load(open(Path.home() / ".railway" / "config.json"))["user"]["token"]
HDRS  = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

SVC_IDS = {
    "amd-sync-engine":       "ef34a395-1e97-4e08-b08b-ac8688c8621e",
    "telegram-approval-bot": "e8b78196-e8bc-4f85-969e-6e853090ba73",
}

STATUS_Q = """
query($serviceId: String!) {
  service(id: $serviceId) {
    deployments(first: 1) {
      edges { node { id status createdAt } }
    }
  }
}
"""

for name, sid in SVC_IDS.items():
    r = requests.post(
        "https://backboard.railway.com/graphql/v2",
        headers=HDRS,
        json={"query": STATUS_Q, "variables": {"serviceId": sid}},
        timeout=15,
    )
    body = r.json()
    entries = (body.get("data") or {}).get("service", {}).get("deployments", {}).get("edges", [])
    if entries:
        d    = entries[0]["node"]
        icon = {"SUCCESS": "✅", "BUILDING": "🔄", "DEPLOYING": "🚀",
                "FAILED": "❌", "INITIALIZING": "⏳", "CRASHED": "💥"}.get(d["status"], "❓")
        print(f"{icon} {name}: {d['status']:14s} | {d['createdAt'][:19]}")
    else:
        print(f"❓ {name}: no deployments found")
