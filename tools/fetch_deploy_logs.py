"""Fetch build logs for the latest amd-sync-engine deployment via Railway GraphQL."""
import json, requests
from pathlib import Path

config_path = Path.home() / ".railway" / "config.json"
with open(config_path) as f:
    cfg = json.load(f)
TOKEN         = cfg["user"]["token"]
DEPLOY_ID     = "ea71b6b3-ecf1-463c-abd8-e0af82ea1eff"   # latest failed deploy

HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def gql(query, variables):
    r = requests.post("https://backboard.railway.com/graphql/v2",
                      headers=HDRS, json={"query": query, "variables": variables}, timeout=15)
    return r.json()

# Try build logs first
BUILD_QUERY = """
query($deploymentId: String!) {
  buildLogs(deploymentId: $deploymentId, filter: "", limit: 100) {
    timestamp
    severity
    message
  }
}
"""
body = gql(BUILD_QUERY, {"deploymentId": DEPLOY_ID})
logs = None
if "errors" not in body:
    logs = body["data"].get("buildLogs") or []
if not logs:
    # Fallback: deployment logs
    DL_QUERY = """
    query($deploymentId: String!) {
      deploymentLogs(deploymentId: $deploymentId, filter: "", limit: 100) {
        timestamp
        severity
        message
      }
    }
    """
    body = gql(DL_QUERY, {"deploymentId": DEPLOY_ID})
    if "errors" in body:
        print("Error:", body["errors"])
        exit(1)
    logs = body["data"].get("deploymentLogs") or []

if not logs:
    print("(no log entries found for this deployment)")
else:
    print(f"--- Last {min(80, len(logs))} log lines ---")
    for entry in logs[-80:]:
        ts  = (entry.get("timestamp") or "")[:19]
        sev = (entry.get("severity") or "INFO")[:5]
        msg = entry.get("message") or ""
        print(f"[{ts}] {sev:5s} {msg}")
