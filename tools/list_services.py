"""Get full service IDs for all services in the project."""
import json, requests
from pathlib import Path

TOKEN      = json.load(open(Path.home() / ".railway" / "config.json"))["user"]["token"]
PROJECT_ID = "04114a84-a0a4-463f-ae22-94c442e4c36b"
HDRS  = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

body = requests.post(
    "https://backboard.railway.com/graphql/v2",
    headers=HDRS,
    json={"query": """
query($projectId: String!) {
  project(id: $projectId) {
    services {
      edges {
        node { id name }
      }
    }
  }
}""", "variables": {"projectId": PROJECT_ID}},
    timeout=15,
).json()

for e in body["data"]["project"]["services"]["edges"]:
    n = e["node"]
    print(f"{n['name']}: {n['id']}")
