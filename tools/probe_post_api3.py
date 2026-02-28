#!/usr/bin/env python3
"""
Find the actual post creation API endpoint.
"""
import os, sys, json, requests as r

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
BASE = "https://www.lekeelekee.com"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"
GROUP_SLUG = "african-tech-ecosystem-0q6RKe"

session = r.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Origin": BASE,
    "Referer": BASE + "/",
    "Accept": "application/json",
})

# Login
resp = session.post(f"{BASE}/api/v1/auth/login",
    data={"email": email, "password": password},
    headers={"Content-Type": "application/x-www-form-urlencoded"})
data = resp.json()
token = data['data']['token']
print(f"✅ Logged in | token {len(token)} chars")

session.headers.update({
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
})

CAPTION = "Test post - please ignore - checking API"

# Try various post endpoint patterns
endpoints = [
    # Group-specific
    ("POST", f"/api/v1/groups/{GROUP_ID}/posts", {"content": CAPTION, "type": "text"}),
    ("POST", f"/api/v1/groups/{GROUP_SLUG}/posts", {"content": CAPTION, "type": "text"}),
    ("POST", f"/api/v1/groups/{GROUP_ID}/posts", {"body": CAPTION}),
    # Generic post
    ("POST", f"/api/v1/posts", {"content": CAPTION, "type": "text", "group_id": GROUP_ID}),
    ("POST", f"/api/v1/posts", {"content": CAPTION}),
    ("POST", f"/api/v1/post", {"content": CAPTION}),
    # Feed
    ("POST", f"/api/v1/posts", {"content": CAPTION, "visibility": "public"}),
    # Timeline
    ("POST", f"/api/v1/timeline/posts", {"content": CAPTION}),
    # Statuses GET check
    ("GET", f"/api/v1/statuses?page=1&per_page=3", None),
    # User posts  
    ("GET", f"/api/v1/users/me/posts?per_page=3", None),
    ("GET", f"/api/v1/users/019c10aa-3092-71c5-ae96-17eeef00fb30/posts?per_page=3", None),
    # Group get
    ("GET", f"/api/v1/groups/{GROUP_ID}", None),
    ("GET", f"/api/v1/groups/{GROUP_ID}/posts?per_page=3", None),
    ("GET", f"/api/v1/groups/{GROUP_SLUG}", None),
    ("GET", f"/api/v1/groups/{GROUP_SLUG}/posts?per_page=3", None),
]

for method, path, payload in endpoints:
    try:
        url = BASE + path
        if method == "GET":
            rp = session.get(url, timeout=10)
        else:
            rp = session.post(url, json=payload, timeout=10)
        status = rp.status_code
        text = rp.text[:200].replace('\n', ' ')
        if status not in (404, 405):
            print(f"  {'🟢' if status in (200,201) else '🟡'} {method} {path} → {status} | {text!r}")
        else:
            print(f"  ❌ {method} {path} → {status}")
    except Exception as e:
        print(f"  ⚠️ {method} {path} → {e!r}")
