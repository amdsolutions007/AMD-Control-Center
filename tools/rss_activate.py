"""
RSS Feed Activation + Verification — LekeeLekee Platform

Credentials are read from environment variables. Do not hard-code account
passwords or tokens in this repository.
"""
import os
import requests
import json
import time

BASE = "https://www.lekeelekee.com"
FEED_ID = os.environ.get("LEKEELEKEE_FEED_ID", "b86e2dcf-0674-4718-8168-9c9da2eb6d98")
EMAIL = os.environ.get("LEKEELEKEE_EMAIL", "")
PASSWORD = os.environ.get("LEKEELEKEE_PASSWORD", "")
VERCEL_FEED = os.environ.get("AMD_SIGNAL_FEED_URL", "https://amd-signal-beacon.vercel.app/api/feed")

if not EMAIL or not PASSWORD:
    raise SystemExit("Missing LEKEELEKEE_EMAIL or LEKEELEKEE_PASSWORD environment variable.")

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (compatible; AMDSignalBeacon/1.0; +https://amdsolutions007.com)",
    "Accept": "application/json",
    "Content-Type": "application/json",
})

def divider(label):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print('='*60)

divider("STEP 1: AUTHENTICATE")
auth_resp = session.post(
    f"{BASE}/api/v1/auth/login",
    data={"email": EMAIL, "password": PASSWORD},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    timeout=20,
)
try:
    body = auth_resp.json()
    token = (body.get("data", {}) or {}).get("token") or body.get("token")
except Exception:
    token = None

if not token:
    raise SystemExit(f"Authentication failed ({auth_resp.status_code}).")

session.headers["Authorization"] = f"Bearer {token}"
print("Authenticated.")

divider("STEP 2: VERIFY SIGNAL FEED")
vr = requests.get(VERCEL_FEED, timeout=30)
item_count = vr.text.count("<item>")
feed_law = vr.headers.get("X-Feed-Law", "")
print(f"HTTP: {vr.status_code}")
print(f"Items: {item_count}")
print(f"Feed law: {feed_law or 'not reported'}")

divider("STEP 3: READ FEED STATE")
feeds_resp = session.get(f"{BASE}/api/v1/feeds", timeout=20)
feeds_data = feeds_resp.json()
feeds = feeds_data.get("data", {}).get("feeds", [])
feed = next((f for f in feeds if f.get("public_id") == FEED_ID), None)
if not feed:
    raise SystemExit("Configured feed was not found.")
print(json.dumps({
    "name": feed.get("name"),
    "is_active": feed.get("is_active"),
    "auto_publish": feed.get("auto_publish"),
    "fetch_frequency": feed.get("fetch_frequency"),
    "last_fetched_at": feed.get("last_fetched_at"),
    "fetch_errors": feed.get("fetch_errors"),
}, indent=2))

if feed.get("is_active"):
    print("Feed already active.")
    raise SystemExit(0)

divider("STEP 4: REQUEST ACTIVATION")
attempts = [
    ("PATCH", f"{BASE}/api/v1/feeds/{FEED_ID}", {"is_active": True}),
    ("POST", f"{BASE}/api/v1/feeds/{FEED_ID}/activate", {}),
]
activated = False
for method, url, payload in attempts:
    response = session.request(method, url, json=payload, timeout=20)
    print(f"{method} {response.status_code}")
    if response.status_code in (200, 201, 204):
        activated = True
        break

if not activated:
    raise SystemExit("Remote activation was not confirmed. Use the provider dashboard.")

time.sleep(2)
verify = session.get(f"{BASE}/api/v1/feeds", timeout=20).json()
verified_feed = next((f for f in verify.get("data", {}).get("feeds", []) if f.get("public_id") == FEED_ID), None)
print("Active:", bool(verified_feed and verified_feed.get("is_active")))
