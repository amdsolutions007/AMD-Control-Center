"""
Deep probe: authenticate, hit /messages, print full raw response.
Helps identify correct payload shape.
"""
import os, requests
from dotenv import load_dotenv
load_dotenv()

BASE = os.environ["LEKE_LEKE_BASE_URL"]
GID  = os.environ["LEKE_LEKE_GROUP_ID"]

s = requests.Session()
s.headers.update({"User-Agent": "AMD/1.0", "Accept": "application/json"})

# Auth
r = s.post(
    f"{BASE}/api/v1/auth/login",
    data={"email": os.environ["LEKE_LEKE_EMAIL"], "password": os.environ["LEKE_LEKE_PASSWORD"]},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    timeout=20,
)
body = r.json()
token = (body.get("data") or {}).get("token") or body.get("token")
s.headers["Authorization"] = f"Bearer {token}"
print(f"✅ Auth OK")

# Probe each endpoint fully
all_paths = [
    f"/api/v1/groups/{GID}/messages",
    f"/api/v1/groups/{GID}/posts",
    f"/api/v1/groups/{GID}",
    f"/api/v1/groups/{GID}/feed",
    f"/api/v1/notifications",
    f"/api/v1/groups/{GID}/members",
    f"/api/v1/timeline",
]

for p in all_paths:
    try:
        resp = s.get(f"{BASE}{p}", timeout=12)
        raw = resp.text
        print(f"\n{'='*60}")
        print(f"  ENDPOINT: {p}")
        print(f"  STATUS:   {resp.status_code}")
        print(f"  CONTENT-TYPE: {resp.headers.get('Content-Type','?')}")
        print(f"  LENGTH:   {len(raw)} chars")
        print(f"  RAW (first 400 chars):")
        print(f"  {raw[:400]}")
    except Exception as e:
        print(f"  ERR {p}: {e}")
