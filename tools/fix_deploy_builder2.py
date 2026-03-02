"""Probe Railway GraphQL schema to find the correct mutation for builder config."""
import json, requests
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

# ── Try serviceInstanceUpdate with builder config ───────────────────────────
mutations_to_try = [
    # Pattern 1: serviceInstanceUpdate with serviceId + environmentId
    {
        "query": """
        mutation($serviceId: String!, $environmentId: String!) {
          serviceInstanceUpdate(
            serviceId: $serviceId,
            environmentId: $environmentId,
            input: {
              buildCommand: null,
              startCommand: "python amd_sync_engine.py",
            }
          )
        }
        """,
        "vars": {"serviceId": SERVICE_ID, "environmentId": ENV_ID},
        "label": "serviceInstanceUpdate startCommand",
    },
    # Pattern 2: Try serviceUpdateBuildConfig
    {
        "query": """
        mutation($serviceId: String!) {
          serviceUpdate(id: $serviceId, input: {
            dockerfilePath: "Dockerfile.sync"
          }) {
            id
            name
          }
        }
        """,
        "vars": {"serviceId": SERVICE_ID},
        "label": "serviceUpdate dockerfilePath direct",
    },
]

for m in mutations_to_try:
    body = gql(m["query"], m["vars"])
    if "errors" in body:
        err_msg = body["errors"][0]["message"] if body["errors"] else "unknown"
        print(f"❌ [{m['label']}] {err_msg}")
    else:
        print(f"✅ [{m['label']}] SUCCESS: {body['data']}")
