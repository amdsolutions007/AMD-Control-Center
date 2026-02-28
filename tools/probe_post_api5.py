#!/usr/bin/env python3
"""
Find feed post endpoint + delete test post.
"""
import os, sys, json, requests as r

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
BASE = "https://www.lekeelekee.com"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"
TEST_POST_ID = "277463b8-b88a-4d43-b883-fa1b658c5a59"

session = r.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Origin": BASE, "Referer": BASE + "/",
    "Accept": "application/json",
})
resp = session.post(f"{BASE}/api/v1/auth/login",
    data={"email": email, "password": password},
    headers={"Content-Type": "application/x-www-form-urlencoded"})
token = resp.json()['data']['token']
session.headers.update({
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Accept": "application/json",
})
print(f"✅ Logged in")

# Delete test post
print(f"\n🗑️  Deleting test post {TEST_POST_ID}...")
methods = [
    ("DELETE", f"/api/v1/groups/{GROUP_ID}/posts/{TEST_POST_ID}", None),
    ("DELETE", f"/api/v1/posts/{TEST_POST_ID}", None),
    ("POST", f"/api/v1/posts/{TEST_POST_ID}/delete", None),
    ("DELETE", f"/api/v1/groups/{GROUP_ID}/posts/{TEST_POST_ID}", None),
]
for method, path, payload in methods:
    try:
        if method == "DELETE":
            rp = session.delete(BASE + path, timeout=8)
        else:
            rp = session.post(BASE + path, json=payload or {}, timeout=8)
        if rp.status_code != 404:
            print(f"  {method} {path} → {rp.status_code} | {rp.text[:150]!r}")
    except Exception as e:
        print(f"  ERR: {e!r}")

# Try feed post with different approaches
print("\n📝 Feed post probing...")
CAPTION = "Test feed post - API probe - ignore 🙏"

# Try user profile posts
user_id = "019c10aa-3092-71c5-ae96-17eeef00fb30"
probes = [
    ("POST", f"/api/v1/users/{user_id}/posts", {"content": CAPTION, "type": "post"}),
    ("POST", f"/api/v1/profile/posts", {"content": CAPTION, "type": "post"}),
    ("POST", f"/api/v1/me/posts", {"content": CAPTION, "type": "post"}),
    ("POST", f"/api/v1/wall/posts", {"content": CAPTION, "type": "post"}),
    ("POST", f"/api/v1/timeline/create", {"content": CAPTION, "type": "post"}),
    # Home feed post (no group = general feed)
    ("POST", f"/api/v1/groups/{GROUP_ID}/posts", {"content": CAPTION, "type": "post", "visibility": "public"}),
    # Check user's own wall/profile
    ("GET", f"/api/v1/users/{user_id}/posts?per_page=2", None),
    ("GET", f"/api/v1/users/me", None),
]
for method, path, payload in probes:
    try:
        if method == "GET":
            rp = session.get(BASE + path, timeout=8)
        else:
            rp = session.post(BASE + path, json=payload, timeout=8)
        if rp.status_code != 404:
            body = rp.text[:300]
            if 'DOCTYPE' not in body:
                print(f"  🟢/{rp.status_code} {method} {path} | {body!r}")
            else:
                print(f"  HTML/{rp.status_code} {method} {path}")
    except Exception as e:
        print(f"  ERR {path}: {e!r}")

# Check GET /api/v1/users/me for profile post endpoint hints
print("\n👤 GET /api/v1/users/me ...")
rp = session.get(f"{BASE}/api/v1/users/me")
try:
    d = rp.json()
    print(f"  keys: {list(d.get('data', {}).keys())[:20]}")
    # Check if there's a wall_post or timeline endpoint listed
    print(f"  Full: {rp.text[:600]!r}")
except Exception:
    print(f"  HTML response")
