"""
RSS Feed Probe — LekeeLekee Platform
Authenticates, discovers, and reports on RSS feed management endpoints.
"""
import requests
import json
import time

BASE = "https://www.lekeelekee.com"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"
EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/json",
})

def step(label):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print('='*60)

# ── STEP 1: AUTHENTICATE ──────────────────────────────────────
step("STEP 1: AUTHENTICATE")
resp = session.post(
    f"{BASE}/api/v1/auth/login",
    data={"email": EMAIL, "password": PASSWORD},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    timeout=20
)
print(f"Status: {resp.status_code}")
try:
    body = resp.json()
    print(json.dumps(body, indent=2)[:1500])
except Exception:
    print(resp.text[:1500])

token = None
if resp.status_code == 200:
    body = resp.json()
    token = (
        body.get("token") or
        body.get("access_token") or
        body.get("data", {}).get("token") or
        body.get("data", {}).get("access_token")
    )
    if token:
        session.headers["Authorization"] = f"Bearer {token}"
        print(f"\n✅ Token acquired: {token[:40]}...")
    else:
        print(f"\n⚠️  200 OK but no token field found in: {list(body.keys())}")
else:
    print(f"\n❌ Auth failed — cannot proceed with authenticated requests")

# ── STEP 2: PROBE RSS FEED MANAGEMENT ENDPOINTS ──────────────
step("STEP 2: PROBE RSS FEED ENDPOINTS")

candidate_endpoints = [
    # Feed/RSS management patterns
    ("GET",   f"{BASE}/api/v1/groups/{GROUP_ID}/feeds"),
    ("GET",   f"{BASE}/api/v1/groups/{GROUP_ID}/rss"),
    ("GET",   f"{BASE}/api/v1/groups/{GROUP_ID}/integrations"),
    ("GET",   f"{BASE}/api/v1/feeds"),
    ("GET",   f"{BASE}/api/v1/rss"),
    ("GET",   f"{BASE}/api/v1/rss/feeds"),
    ("GET",   f"{BASE}/api/v1/group-feeds"),
    ("GET",   f"{BASE}/api/v1/syndication"),
    # Profile/account-level feed settings
    ("GET",   f"{BASE}/api/v1/profile/feeds"),
    ("GET",   f"{BASE}/api/v1/users/me/feeds"),
    ("GET",   f"{BASE}/api/v1/account/feeds"),
    # Group info (may include feed status)
    ("GET",   f"{BASE}/api/v1/groups/{GROUP_ID}"),
    ("GET",   f"{BASE}/api/v1/groups/{GROUP_ID}/settings"),
]

found = []
for method, url in candidate_endpoints:
    try:
        r = session.request(method, url, timeout=10)
        status = r.status_code
        snippet = r.text[:200].replace('\n', ' ')
        print(f"  {method} {url.replace(BASE,'')}  →  {status}  |  {snippet}")
        if status not in (404, 405, 403, 401, 500):
            found.append((method, url, status, r.text[:2000]))
    except Exception as e:
        print(f"  {method} {url.replace(BASE,'')}  →  ERROR: {e}")

# ── STEP 3: REPORT FINDINGS ───────────────────────────────────
step("STEP 3: DETAILED FINDINGS ON NON-404 ENDPOINTS")
if found:
    for method, url, status, body in found:
        print(f"\n>>> {method} {url}")
        print(f"    Status: {status}")
        try:
            print(json.dumps(json.loads(body), indent=2)[:1000])
        except Exception:
            print(body[:500])
else:
    print("No RSS management endpoints found in this probe set.")
    print("The RSS feed sync may be UI-only (no public API for pause/resume).")

# ── STEP 4: VERIFY VERCEL FEED IS LIVE ───────────────────────
step("STEP 4: VERIFY VERCEL DRIP FEED — ONE-PER-HOUR LAW")
vercel_url = "https://amd-signal-beacon.vercel.app/api/feed"
try:
    t0 = time.time()
    vr = requests.get(vercel_url, timeout=30)
    elapsed = time.time() - t0
    # Count items
    item_count = vr.text.count("<item>")
    print(f"Status:        {vr.status_code}")
    print(f"Response time: {elapsed:.2f}s")
    print(f"Content-Type:  {vr.headers.get('Content-Type','?')}")
    print(f"Cache-Control: {vr.headers.get('Cache-Control','?')}")
    print(f"X-Feed-Law:    {vr.headers.get('X-Feed-Law','?')}")
    print(f"X-Hour-Slot:   {vr.headers.get('X-Hour-Slot','?')}")
    print(f"X-Hour-Start:  {vr.headers.get('X-Hour-Start','?')}")
    print(f"<item> count:  {item_count}")
    print(f"\nArticle III Law check: {'✅ PASS — 1 item' if item_count == 1 else f'❌ FAIL — {item_count} items'}")
except Exception as e:
    print(f"Vercel probe error: {e}")

print("\n\nPROBE COMPLETE.")
