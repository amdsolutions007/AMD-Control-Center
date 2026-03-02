"""Verify TELEGRAM vars are set on amd-sync-engine via Railway GraphQL."""
import json, requests
from pathlib import Path

TOKEN      = json.load(open(Path.home() / ".railway" / "config.json"))["user"]["token"]
SERVICE_ID = "ef34a395-1e97-4e08-b08b-ac8688c8621e"
ENV_ID     = "9a01130f-7a5e-464b-bd59-1502d23f5ec9"
HDRS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

body = requests.post("https://backboard.railway.com/graphql/v2", headers=HDRS,
    json={"query": """
query($serviceId: String!, $environmentId: String!) {
  variables(serviceId: $serviceId, environmentId: $environmentId)
}""", "variables": {"serviceId": SERVICE_ID, "environmentId": ENV_ID}}, timeout=15).json()

if "errors" in body:
    print("Error:", body["errors"])
else:
    vars_dict = body["data"]["variables"]
    for k, v in sorted(vars_dict.items()):
        val = str(v)
        # Redact sensitive values
        if any(s in k for s in ("KEY", "TOKEN", "PASSWORD")):
            val = val[:10] + "..." + val[-4:]
        print(f"  {k}: {val}")
