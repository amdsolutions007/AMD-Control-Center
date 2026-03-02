"""Set TELEGRAM_BOT_TOKEN and CEO_TELEGRAM_ID on amd-sync-engine Railway service."""
import json, requests
from pathlib import Path

config_path = Path.home() / ".railway" / "config.json"
with open(config_path) as f:
    cfg = json.load(f)

TOKEN      = cfg["user"]["token"]
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"   # amd-sync-engine
HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

VARS_TO_SET = {
    "TELEGRAM_BOT_TOKEN": "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg",
    "CEO_TELEGRAM_ID":    "8013249849",
}

MUT = """
mutation setVars($serviceId: String!, $envId: String!, $input: [VariableCollectionUpsertInput!]!) {
  variableCollectionUpsert(serviceId: $serviceId, environmentId: $envId, variables: $input)
}
"""

ENV_ID = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"

variables_input = [{"name": k, "value": v} for k, v in VARS_TO_SET.items()]

r = requests.post(
    "https://backboard.railway.com/graphql/v2",
    headers=HDRS,
    json={"query": MUT, "variables": {
        "serviceId": SERVICE_ID,
        "envId":     ENV_ID,
        "input":     variables_input,
    }},
    timeout=15,
)
body = r.json()
if "errors" in body:
    print("❌ Mutation error:", body["errors"])
else:
    print("✅ Vars set:", body["data"])
    print("   TELEGRAM_BOT_TOKEN — set")
    print("   CEO_TELEGRAM_ID    — set")
