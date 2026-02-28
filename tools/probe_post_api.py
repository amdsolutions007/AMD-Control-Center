#!/usr/bin/env python3
"""
Probe LekeeLekee API endpoints for posting after JWT login.
"""
import os, sys, json, requests as r
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
BASE = "https://www.lekeelekee.com"

session = r.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Origin": BASE,
    "Referer": BASE + "/login",
})

# Step 1: Login
print("🔐 Logging in...")
resp = session.post(f"{BASE}/api/v1/auth/login", data={"email": email, "password": password})
print(f"  HTTP {resp.status_code}")
try:
    data = resp.json()
    print(f"  status: {data.get('status')}, msg: {data.get('message')}")
    inner = data.get("data", {})
    token = inner.get("token") or inner.get("access_token") or data.get("token") or ""
    user  = inner.get("user", {})
    user_id = user.get("id") or user.get("public_id") or ""
    print(f"  token: {len(token)} chars | user_id: {user_id!r}")
    print(f"  data keys: {list(inner.keys())}")
    print(f"  user keys: {list(user.keys())}")
except Exception as e:
    print(f"  parse err: {e} | body: {resp.text[:200]}")
    sys.exit(1)

if not token:
    print("❌ No token — can't continue")
    sys.exit(1)

# Update session with auth token
session.headers.update({"Authorization": f"Bearer {token}"})

# Step 2: Get user profile / me
print("\n👤 GET /api/v1/auth/me ...")
resp2 = session.get(f"{BASE}/api/v1/auth/me")
print(f"  HTTP {resp2.status_code} | {resp2.text[:300]}")

# Step 3: List groups
print("\n📋 GET /api/v1/groups ...")
resp3 = session.get(f"{BASE}/api/v1/groups")
print(f"  HTTP {resp3.status_code} | {resp3.text[:400]}")

# Step 4: Probe post endpoints
print("\n📝 Probing post endpoints...")
test_caption = "Test post - ignore"
endpoints = [
    ("POST", f"{BASE}/api/v1/posts", {"content": test_caption, "type": "text"}),
    ("POST", f"{BASE}/api/v1/feed", {"content": test_caption}),
    ("POST", f"{BASE}/api/v1/post", {"content": test_caption, "type": "text"}),
    ("POST", f"{BASE}/api/v1/publications", {"body": test_caption}),
    ("GET",  f"{BASE}/api/v1/posts", None),
    ("GET",  f"{BASE}/api/v1/feed", None),
]
for method, url, payload in endpoints:
    try:
        if method == "GET":
            rp = session.get(url, timeout=10)
        else:
            rp = session.post(url, json=payload, timeout=10)
        print(f"  {method} {url.replace(BASE,'')} → HTTP {rp.status_code} | {rp.text[:120]!r}")
    except Exception as e:
        print(f"  {method} {url.replace(BASE,'')} → ERR: {e!r}")

# Step 5: Try to find the group ID
print("\n🔎 Group search...")
for url in [
    f"{BASE}/api/v1/groups?slug=african-tech-ecosystem",
    f"{BASE}/api/v1/groups/african-tech-ecosystem",
    f"{BASE}/api/v1/communities",
    f"{BASE}/api/v1/communities?slug=african-tech-ecosystem",
]:
    try:
        rp = session.get(url, timeout=10)
        print(f"  GET {url.replace(BASE,'')} → {rp.status_code} | {rp.text[:200]!r}")
    except Exception as e:
        print(f"  ERR: {e!r}")
