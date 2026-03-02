"""Quick probe: discover the live group messages endpoint."""
import os, requests
from dotenv import load_dotenv
load_dotenv()

s = requests.Session()
s.headers.update({"User-Agent": "AMD/1.0", "Accept": "application/json"})
BASE = os.environ["LEKE_LEKE_BASE_URL"]
GID  = os.environ["LEKE_LEKE_GROUP_ID"]

r = s.post(
    f"{BASE}/api/v1/auth/login",
    data={"email": os.environ["LEKE_LEKE_EMAIL"], "password": os.environ["LEKE_LEKE_PASSWORD"]},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    timeout=20,
)
body = r.json()
token = (body.get("data") or {}).get("token") or body.get("token")
s.headers["Authorization"] = f"Bearer {token}"
print(f"Auth OK — token: {token[:40]}...")

GID = "4d183887-2d5a-47b0-8226-dd6939d29694"

paths = [
    f"/api/v1/groups/{GID}/messages",
    f"/api/v1/groups/{GID}/posts",
    f"/api/v1/groups/{GID}/feed",
    f"/api/v1/groups/{GID}/chats",
    f"/api/v1/groups/{GID}",
    f"/api/v1/groups/{GID}/discussion",
    f"/api/v1/chats?group_id={GID}",
    f"/api/v1/posts?group_id={GID}",
    f"/api/v1/timeline?group_id={GID}",
    f"/api/v1/groups/{GID}/members",
    f"/api/v1/groups/{GID}/wall",
    f"/api/v1/groups/{GID}/comments",
]
for p in paths:
    try:
        r2 = s.get(f"{BASE}{p}", timeout=10)
        preview = r2.text.strip()[:150].replace("\n", " ")
        print(f"  {r2.status_code} {p}")
        print(f"         → {preview}")
    except Exception as e:
        print(f"  ERR {p}: {e}")
