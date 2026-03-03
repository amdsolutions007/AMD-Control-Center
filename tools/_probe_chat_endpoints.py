import requests, json

BASE = "https://www.lekeelekee.com"
EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"

r = requests.post(f"{BASE}/api/v1/auth/login",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"email": EMAIL, "password": PASSWORD}, timeout=20)
token = r.json()["data"]["token"]
headers = {"Authorization": f"Bearer {token}"}

# Probe group CHAT / MESSAGE endpoints (separate from group POSTS)
endpoints = [
    f"/api/v1/groups/{GROUP_ID}/messages",
    f"/api/v1/groups/{GROUP_ID}/chat",
    f"/api/v1/groups/{GROUP_ID}/channels",
    f"/api/v1/messages/groups/{GROUP_ID}",
    f"/api/v1/chat/groups/{GROUP_ID}",
    "/api/v1/messages",
    "/api/v1/conversations",
    "/api/v1/chat",
    # DM endpoints
    "/api/v1/direct-messages",
    "/api/v1/direct_messages",
    "/api/v1/dms",
    "/api/v1/user/messages",
    "/api/v1/messages/direct",
]

for ep in endpoints:
    resp = requests.get(f"{BASE}{ep}", headers=headers, params={"page": 1, "per_page": 5}, timeout=15)
    snippet = resp.text.strip()[:150].replace("\n", " ")
    is_html = snippet.startswith("<!DOCTYPE") or snippet.startswith("<html")
    status_label = f"HTTP {resp.status_code}"
    kind = "HTML" if is_html else "JSON"
    print(f"{ep:55s} -> {status_label} [{kind}]: {'' if is_html else snippet[:100]}")
