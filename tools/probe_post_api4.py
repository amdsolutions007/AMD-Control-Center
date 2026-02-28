#!/usr/bin/env python3
"""
Find correct type value for posting to group + find feed post endpoint.
"""
import os, sys, json, requests as r

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
BASE = "https://www.lekeelekee.com"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"

session = r.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Origin": BASE,
    "Referer": BASE + "/",
    "Accept": "application/json",
})

resp = session.post(f"{BASE}/api/v1/auth/login",
    data={"email": email, "password": password},
    headers={"Content-Type": "application/x-www-form-urlencoded"})
data = resp.json()
token = data['data']['token']
print(f"✅ Token: {len(token)} chars")

session.headers.update({
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Accept": "application/json",
})

CAPTION = "Test - checking API structure, please ignore 🙏"

print("\n📝 Trying group post with different type values...")
for t in [1, 2, 3, "post", "text", "status", None]:
    if t is None:
        payload = {"content": CAPTION}
    else:
        payload = {"content": CAPTION, "type": t}
    rp = session.post(f"{BASE}/api/v1/groups/{GROUP_ID}/posts", json=payload, timeout=10)
    text = rp.text[:200].replace('\n', ' ')
    print(f"  type={t!r} → HTTP {rp.status_code} | {text!r}")
    if rp.status_code in (200, 201):
        print("  🎉 SUCCESS!")
        print(f"  Full response: {rp.text}")
        break

print("\n📝 Trying feed post endpoints...")
feed_endpoints = [
    f"/api/v1/posts/create",
    f"/api/v1/post/create",
    f"/api/v1/create/post",
    f"/api/v1/news-feed/posts",
    f"/api/v1/newsfeed/posts",
    f"/api/v1/feed/posts",
    f"/api/v1/home/posts",
    f"/api/v1/timeline",
    f"/api/v1/create",
]
for path in feed_endpoints:
    try:
        rp = session.post(BASE + path, json={"content": CAPTION}, timeout=8)
        if rp.status_code != 404:
            print(f"  {rp.status_code} POST {path} | {rp.text[:150]!r}")
    except Exception as e:
        print(f"  ERR {path}: {e!r}")

# Check what the feed GET returns
print("\n📋 GET /api/v1/feed (paginated)...")
rp = session.get(f"{BASE}/api/v1/feed", params={"page": 1, "per_page": 3}, timeout=10)
try:
    d = rp.json()
    print(f"  HTTP {rp.status_code} | keys: {list(d.keys())}")
    posts = d.get('data', {})
    if isinstance(posts, dict):
        print(f"  data keys: {list(posts.keys())}")
except Exception:
    print(f"  HTTP {rp.status_code} | HTML response (not API)")
