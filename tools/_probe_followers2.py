import requests, json

BASE = "https://www.lekeelekee.com"
EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
PUBLIC_ID = "019c10aa-3092-71c5-ae96-17eeef00fb30"

r = requests.post(f"{BASE}/api/v1/auth/login",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"email": EMAIL, "password": PASSWORD}, timeout=20)
token = r.json()["data"]["token"]
headers = {"Authorization": f"Bearer {token}"}

# Try page 1 with large per_page
for params in [{"per_page": 100, "page": 1}, {"limit": 100, "page": 1}, {"per_page": 100, "offset": 0}]:
    resp = requests.get(f"{BASE}/api/v1/users/{PUBLIC_ID}/followers",
                        headers=headers, params=params, timeout=20)
    data = resp.json()
    users = data.get("data", {}).get("users", [])
    meta = {k: v for k, v in data.get("data", {}).items() if k != "users"}
    print(f"\nparams={params} -> {resp.status_code}, users_count={len(users)}, meta={json.dumps(meta)[:300]}")
    if users:
        print("  First user:", json.dumps(users[0], indent=2)[:400])
        print("  Last user:", json.dumps(users[-1], indent=2)[:400])
        break
