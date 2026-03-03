import requests, json

BASE = "https://www.lekeelekee.com"
EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"

r = requests.post(f"{BASE}/api/v1/auth/login",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"email": EMAIL, "password": PASSWORD}, timeout=20)
token = r.json()["data"]["token"]
print("Token:", token[:30], "...")

headers = {"Authorization": f"Bearer {token}"}

# Get me profile to find public_id and username
me = requests.get(f"{BASE}/api/v1/users/me", headers=headers, timeout=20)
print(f"\n/api/v1/users/me -> {me.status_code}")
if me.status_code == 200 and not me.text.strip().startswith("<"):
    profile = me.json()
    print(json.dumps(profile.get("data", profile), indent=2)[:600])
    uid = profile.get("data", {}).get("public_id") or profile.get("data", {}).get("id", "")
    username = profile.get("data", {}).get("username", "amd")
    print(f"\npublic_id={uid}  username={username}")
else:
    uid = ""
    username = "amd"
    print("  HTML/error -- using username=amd")

# Probe follower endpoint patterns
endpoints = [
    f"/api/v1/users/{username}/followers",
    f"/api/v1/users/{uid}/followers",
    "/api/v1/user/following",
    "/api/v1/user/follow-requests",
    f"/api/v1/profile/{username}/followers",
    f"/api/v1/profiles/{username}/followers",
    "/api/v1/notifications/followers",
    "/api/v1/user/notifications",
]

for ep in endpoints:
    if not ep or "//followers" in ep:
        continue
    resp = requests.get(f"{BASE}{ep}", headers=headers,
                        params={"per_page": 5, "page": 1}, timeout=20)
    snippet = resp.text.strip()[:200].replace("\n", " ")
    print(f"\n{ep} -> {resp.status_code}: {snippet}")
