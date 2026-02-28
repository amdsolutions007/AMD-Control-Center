#!/usr/bin/env python3
"""
Deep API probe: login via requests, check cookies set, then find post/group API.
"""
import os, sys, json, requests as r

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
BASE = "https://www.lekeelekee.com"

session = r.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Origin": BASE,
    "Referer": BASE + "/",
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
})

# Login
print("🔐 Logging in via requests session...")
resp = session.post(f"{BASE}/api/v1/auth/login", data={"email": email, "password": password})
data = resp.json()
token = data['data']['token']
user_id = data['data']['user']['public_id']
print(f"  ✅ Token: {len(token)} chars")
print(f"  ✅ User ID: {user_id}")
print(f"\n🍪 Cookies set by server:")
for c in session.cookies:
    print(f"  name={c.name!r} value={c.value[:30]!r}... domain={c.domain!r} path={c.path!r} secure={c.secure}")

# Update auth header
session.headers.update({
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Accept": "application/json",
})

# Try /api/v1/users/me
print("\n👤 GET /api/v1/users/me ...")
r2 = session.get(f"{BASE}/api/v1/users/me")
print(f"  HTTP {r2.status_code} | {r2.text[:200]!r}")

# Try /api/v1/user
print("\n👤 GET /api/v1/user ...")
r3 = session.get(f"{BASE}/api/v1/user")
print(f"  HTTP {r3.status_code} | {r3.text[:200]!r}")

# List groups more
print("\n📋 GET /api/v1/groups (all pages)...")
r4 = session.get(f"{BASE}/api/v1/groups", params={"per_page": 50})
try:
    d4 = r4.json()
    groups = d4.get('data', {}).get('groups', [])
    print(f"  Found {len(groups)} groups:")
    for g in groups:
        print(f"    id={g.get('public_id')!r} name={g.get('name')!r} slug={g.get('slug')!r}")
except Exception as e:
    print(f"  {r4.status_code}: {r4.text[:300]!r}")

# Check joined groups
print("\n👥 GET /api/v1/groups/joined ...")
r5 = session.get(f"{BASE}/api/v1/groups/joined")
print(f"  HTTP {r5.status_code} | {r5.text[:400]!r}")

# Try posting to feed
print("\n📝 POST /api/v1/statuses (Mastodon-style) ...")
payload = {"status": "Test - ignore", "visibility": "public"}
r6 = session.post(f"{BASE}/api/v1/statuses", json=payload)
print(f"  HTTP {r6.status_code} | {r6.text[:200]!r}")

# Try GraphQL
print("\n📝 POST /graphql ...")
gql = {"query": "{ me { id username } }", "variables": {}}
r7 = session.post(f"{BASE}/graphql", json=gql)
print(f"  HTTP {r7.status_code} | {r7.text[:200]!r}")

# Try v2 posts
print("\n📝 POST /api/v2/posts ...")
r8 = session.post(f"{BASE}/api/v2/posts", json={"content": "Test - ignore", "type": "text"})
print(f"  HTTP {r8.status_code} | {r8.text[:200]!r}")

# Search for groups containing "african"
print("\n🔍 GET /api/v1/groups/search?q=african ...")
r9 = session.get(f"{BASE}/api/v1/groups/search", params={"q": "african"})
print(f"  HTTP {r9.status_code} | {r9.text[:400]!r}")

print("\n🔍 GET /api/v1/search?q=african+tech ...")
r10 = session.get(f"{BASE}/api/v1/search", params={"q": "african tech", "type": "group"})
print(f"  HTTP {r10.status_code} | {r10.text[:400]!r}")
