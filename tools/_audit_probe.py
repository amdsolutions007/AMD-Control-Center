#!/usr/bin/env python3
"""Quick probe: find manifesto post + vault check."""
import os, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")
import requests

BASE_URL = os.environ.get("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
GROUP_ID = os.environ["LEKE_LEKE_GROUP_ID"]
EMAIL    = os.environ["LEKE_LEKE_EMAIL"]
PASSWORD = os.environ["LEKE_LEKE_PASSWORD"]
VAULT    = Path(__file__).parent.parent / "intelligence_vault"

# auth
s = requests.Session()
s.headers["User-Agent"] = "AMD-Probe/1.0"
r = s.post(f"{BASE_URL}/api/v1/auth/login",
           data={"email": EMAIL, "password": PASSWORD},
           headers={"Content-Type": "application/x-www-form-urlencoded"},
           timeout=20)
token = (r.json().get("data") or {}).get("token") or r.json().get("token")
s.headers["Authorization"] = f"Bearer {token}"
print("✅ Auth OK")

# vault
citizens = []
print(f"\nVault files: {list(VAULT.glob('*.json'))}")
for f in list(VAULT.glob("citizens*.json")) + list(VAULT.glob("profiles*.json")):
    try:
        data = json.loads(f.read_text())
        if isinstance(data, list):
            citizens.extend(data)
        elif isinstance(data, dict):
            citizens.extend(data.get("citizens", data.get("profiles", [])))
    except Exception as e:
        print(f"  skip {f.name}: {e}")
print(f"Citizens loaded: {len(citizens)}")
if citizens:
    sample = citizens[0]
    print(f"Sample keys: {list(sample.keys())}")

# scan posts for manifesto
print("\nScanning posts for manifesto...")
manifesto_keywords = ["manifesto", "protocol 007", "007 law", "vision statement",
                      "amd manifesto", "system protocol"]
all_posts = []
for pg in range(1, 8):
    resp = s.get(f"{BASE_URL}/api/v1/groups/{GROUP_ID}/posts",
                 params={"page": pg, "per_page": 50}, timeout=20)
    if resp.status_code != 200:
        break
    raw = resp.text.strip()
    if not raw or raw.startswith("<"):
        break
    body = resp.json()
    posts = (body.get("data") or {}).get("posts") or []
    if not posts:
        break
    all_posts.extend(posts)

print(f"Total posts fetched across pages: {len(all_posts)}")

print("\n=== MANIFESTO KEYWORD HITS ===")
found = []
for p in all_posts:
    t = (p.get("text") or p.get("content") or "")
    tl = t.lower()
    if any(kw in tl for kw in manifesto_keywords):
        found.append(p)
        pid = p.get("public_id", "?")
        lk = p.get("likes_count", 0)
        cm = p.get("comments_count", 0)
        rp = p.get("reposts_count", 0)
        print(f"  ID: {pid}")
        print(f"  Engagement: ❤️{lk}  💬{cm}  🔁{rp}")
        print(f"  Text: {t[:250]}")
        print()

if not found:
    print("  No post found with manifesto keywords in fetched pages.")

print("\n=== TOP ENGAGEMENT POSTS ===")
by_eng = sorted(all_posts,
                key=lambda p: (int(p.get("likes_count",0) or 0)
                               + int(p.get("comments_count",0) or 0)
                               + int(p.get("reposts_count",0) or 0)),
                reverse=True)
for p in by_eng[:10]:
    t = (p.get("text") or "")[:100].replace("\n", " ")
    pid = p.get("public_id", "?")[:14]
    lk = p.get("likes_count", 0)
    cm = p.get("comments_count", 0)
    rp = p.get("reposts_count", 0)
    print(f"  [{pid}] ❤️{lk} 💬{cm} 🔁{rp}  {t}")

print("\n=== AMD PROFILE / FOLLOWER COUNT ===")
for path in ["/api/v1/user", "/api/v1/users/me", "/api/v1/me", "/api/v1/auth/me"]:
    resp = s.get(f"{BASE_URL}{path}", timeout=15)
    raw = resp.text.strip()
    if resp.status_code == 200 and raw and not raw.startswith("<"):
        data = resp.json()
        pdata = data.get("data") or data.get("user") or data
        if isinstance(pdata, dict):
            followers = pdata.get("followers_count") or pdata.get("followers")
            username  = pdata.get("username")
            print(f"  {path} → username={username}  followers={followers}")
            print(f"  Full keys: {list(pdata.keys())[:15]}")
            break
    else:
        print(f"  {path} → HTTP {resp.status_code} (skip)")
