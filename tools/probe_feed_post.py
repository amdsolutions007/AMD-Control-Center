#!/usr/bin/env python3
"""Try all HTTP methods for user wall post."""
import os, requests, json

BASE = "https://www.lekeelekee.com"
email = os.environ["LEKE_LEKE_EMAIL"]
password = os.environ["LEKE_LEKE_PASSWORD"]

s = requests.Session()
s.headers.update({"User-Agent": "Mozilla/5.0", "Accept": "application/json", "Origin": BASE})
r = s.post(f"{BASE}/api/v1/auth/login", data={"email": email, "password": password},
           headers={"Content-Type": "application/x-www-form-urlencoded"})
d = r.json()
token = d["data"]["token"]
user_id = d["data"]["user"]["public_id"]
print(f"Token: {len(token)}ch | Cookies: {list(s.cookies)}")
s.headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json", "Accept": "application/json"})

for method, url, payload in [
    ("POST", f"{BASE}/api/v1/users/{user_id}/posts",    {"content": "test-ignore", "type": "post"}),
    ("POST", f"{BASE}/api/v1/users/{user_id}/posts",    {"content": "test-ignore", "type": "status"}),
    ("POST", f"{BASE}/api/v1/users/{user_id}/posts",    {"content": "test-ignore", "type": "text"}),
    ("PUT",  f"{BASE}/api/v1/users/{user_id}/posts",    {"content": "test-ignore", "type": "post"}),
    ("POST", f"{BASE}/api/v1/posts",                    {"content": "test-ignore", "type": "post", "user_id": user_id}),
    ("POST", f"{BASE}/api/v1/posts/store",              {"content": "test-ignore", "type": "post"}),
    ("POST", f"{BASE}/api/v1/wall",                     {"content": "test-ignore", "type": "post"}),
    ("POST", f"{BASE}/api/v1/wall/posts",               {"content": "test-ignore", "type": "post"}),
    # Try with form data (not json)
    ("FORM", f"{BASE}/api/v1/users/{user_id}/posts",    {"content": "test-ignore", "type": "post"}),
]:
    try:
        if method == "FORM":
            resp = s.post(url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=8)
            method = "POST(form)"
        else:
            resp = getattr(s, method.lower())(url, json=payload, timeout=8)
        line = resp.text[:130].replace("\n", " ")
        if "DOCTYPE" not in line:
            print(f"  {method} {url.replace(BASE, '')} -> {resp.status_code} | {line!r}")
        else:
            print(f"  {method} {url.replace(BASE, '')} -> {resp.status_code} HTML")
    except Exception as e:
        print(f"  ERR {method} {url}: {e!r}")
