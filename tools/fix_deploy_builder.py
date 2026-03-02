"""Use Railway GraphQL API to set amd-sync-engine service builder to DOCKERFILE."""
import json, requests
from pathlib import Path

config_path = Path.home() / ".railway" / "config.json"
with open(config_path) as f:
    cfg = json.load(f)

TOKEN      = cfg["user"]["token"]
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"

HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


def gql(query: str, variables: dict) -> dict:
    r = requests.post("https://backboard.railway.com/graphql/v2",
                      headers=HDRS,
                      json={"query": query, "variables": variables},
                      timeout=15)
    return r.json()


# ── 1. Update service source to use Dockerfile.sync ───────────────────────────
UPDATE_MUT = """
mutation($serviceId: String!, $input: ServiceUpdateInput!) {
  serviceUpdate(id: $serviceId, input: $input) {
    id
    name
  }
}
"""

input_payload = {
    "source": {
        "image": None,           # clear any image source
    },
    "buildConfig": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "Dockerfile.sync",
    },
}

body = gql(UPDATE_MUT, {"serviceId": SERVICE_ID, "input": input_payload})
if "errors" in body:
    print("❌ serviceUpdate errors:", body["errors"])
    # Try alternate input schema
    input_payload2 = {
        "dockerfilePath": "Dockerfile.sync",
    }
    body2 = gql(UPDATE_MUT, {"serviceId": SERVICE_ID, "input": input_payload2})
    print("Alt attempt:", body2)
else:
    svc = body["data"]["serviceUpdate"]
    print(f"✅ Service updated: {svc['name']} ({svc['id'][:8]})")

# ── 2. Trigger a new deployment (redeploy) ─────────────────────────────────────
REDEPLOY_MUT = """
mutation($serviceId: String!, $environmentId: String!) {
  serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
}
"""
ENV_ID = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"  # production environment

body = gql(REDEPLOY_MUT, {"serviceId": SERVICE_ID, "environmentId": ENV_ID})
if "errors" in body:
    print("❌ redeploy errors:", body["errors"])
else:
    print("🚀 Redeploy triggered:", body["data"])
