"""
RSS Feed Activation + Verification — LekeeLekee Platform
Discovers, activates, and verifies the AMD Intelligence Brief feed via API.
"""
import requests
import json
import time

BASE = "https://www.lekeelekee.com"
FEED_ID = "b86e2dcf-0674-4718-8168-9c9da2eb6d98"
EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
VERCEL_FEED = "https://amd-signal-beacon.vercel.app/api/feed"

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/json",
    "Content-Type": "application/json",
})

def divider(label):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print('='*60)

# ── STEP 1: AUTHENTICATE ─────────────────────────────────────
divider("STEP 1: AUTHENTICATE")
auth_resp = session.post(
    f"{BASE}/api/v1/auth/login",
    data={"email": EMAIL, "password": PASSWORD},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    timeout=20
)
try:
    body = auth_resp.json()
    token = (body.get("data", {}) or {}).get("token") or body.get("token")
except Exception:
    token = None

if not token:
    print(f"❌ Auth failed ({auth_resp.status_code}). Aborting.")
    exit(1)

session.headers["Authorization"] = f"Bearer {token}"
print(f"✅ Authenticated as Olawale Shoyemi (@amd)")
print(f"   Token: {token[:50]}...")

# ── STEP 2: VERIFY VERCEL DEPLOY STATUS ──────────────────────
divider("STEP 2: VERIFY VERCEL DEPLOY (ONE-PER-HOUR LAW)")
print("Checking if new Vercel build (commit cc319cd) is live...")
vr = requests.get(VERCEL_FEED, timeout=30)
item_count   = vr.text.count("<item>")
cache_header = vr.headers.get("Cache-Control", "?")
feed_law     = vr.headers.get("X-Feed-Law", "NOT SET — OLD BUILD STILL LIVE")
hour_slot    = vr.headers.get("X-Hour-Slot", "?")
hour_start   = vr.headers.get("X-Hour-Start", "?")

print(f"  HTTP Status:   {vr.status_code}")
print(f"  Response time: {vr.elapsed.total_seconds():.2f}s")
print(f"  Cache-Control: {cache_header}")
print(f"  X-Feed-Law:    {feed_law}")
print(f"  X-Hour-Slot:   {hour_slot}")
print(f"  X-Hour-Start:  {hour_start}")
print(f"  <item> count:  {item_count}")

vercel_ready = (feed_law != "NOT SET — OLD BUILD STILL LIVE" and item_count == 1)
if vercel_ready:
    print(f"\n  ✅ Vercel deploy LIVE — ONE-PER-HOUR LAW confirmed (1 item)")
else:
    print(f"\n  ⚠️  Vercel deploy still propagating (X-Feed-Law not set, {item_count} items returned)")
    print(f"     The feed must serve 1 item before we activate LekeeLekee polling.")
    print(f"\n  Decision: BLOCKING activation until Vercel is ready.")
    print(f"  Polling Vercel every 30s (max 10 minutes)...")
    for attempt in range(20):
        time.sleep(30)
        vr2 = requests.get(VERCEL_FEED, timeout=30)
        n   = vr2.text.count("<item>")
        fl  = vr2.headers.get("X-Feed-Law", "")
        cc  = vr2.headers.get("Cache-Control", "")
        print(f"  [{attempt+1:02d}/20] items={n}  X-Feed-Law='{fl}'  Cache-Control='{cc}'")
        if fl and n == 1:
            vercel_ready = True
            print(f"  ✅ Vercel deploy confirmed at attempt {attempt+1}")
            break
    if not vercel_ready:
        print(f"\n  ❌ Vercel has not deployed after 10 minutes.")
        print(f"     Activate the feed manually from the LekeeLekee dashboard.")
        print(f"     Feed ID: {FEED_ID}")
        exit(1)

# ── STEP 3: READ CURRENT FEED STATE ──────────────────────────
divider("STEP 3: READ CURRENT FEED STATE FROM LEKEELEKEE DATABASE")
feeds_resp = session.get(f"{BASE}/api/v1/feeds", timeout=20)
print(f"GET /api/v1/feeds  →  {feeds_resp.status_code}")
try:
    feeds_data = feeds_resp.json()
    feeds = feeds_data.get("data", {}).get("feeds", [])
    feed = next((f for f in feeds if f["public_id"] == FEED_ID), None)
    if feed:
        print(f"\n  Feed Name:       {feed['name']}")
        print(f"  Feed ID:         {feed['public_id']}")
        print(f"  Feed URL:        {feed['feed_url']}")
        print(f"  is_active:       {feed['is_active']}")
        print(f"  auto_publish:    {feed['auto_publish']}")
        print(f"  fetch_frequency: {feed['fetch_frequency']} min")
        print(f"  items_imported:  {feed['items_imported']}")
        print(f"  last_fetched_at: {feed['last_fetched_at']}")
        print(f"  fetch_errors:    {feed['fetch_errors']}")
        print(f"  last_error:      {feed['last_error']}")
        if feed['is_active']:
            print(f"\n  ℹ️  Feed is already active — no PATCH needed.")
    else:
        print(f"  ⚠️  Feed ID {FEED_ID} not found in response. Full data:")
        print(json.dumps(feeds_data, indent=2)[:1000])
except Exception as e:
    print(f"  ⚠️  JSON parse error: {e} — raw: {feeds_resp.text[:300]}")
    feed = None

# ── STEP 4: ACTIVATE THE FEED ────────────────────────────────
divider("STEP 4: REMOTE ACTIVATION — PATCH is_active = true")

activate_payloads = [
    ("PATCH",  f"{BASE}/api/v1/feeds/{FEED_ID}",         {"is_active": True}),
    ("PUT",    f"{BASE}/api/v1/feeds/{FEED_ID}",         {"is_active": True}),
    ("PATCH",  f"{BASE}/api/v1/feeds/{FEED_ID}/activate", {}),
    ("POST",   f"{BASE}/api/v1/feeds/{FEED_ID}/activate", {}),
    ("POST",   f"{BASE}/api/v1/feeds/{FEED_ID}/resume",   {}),
    ("PUT",    f"{BASE}/api/v1/feeds/{FEED_ID}/status",   {"is_active": True}),
]

activated = False
for method, url, payload in activate_payloads:
    try:
        r = session.request(method, url, json=payload, timeout=20)
        short = r.text[:300].replace('\n', ' ')
        print(f"  {method} {url.replace(BASE,'')}  →  {r.status_code}  |  {short}")
        if r.status_code in (200, 201, 204):
            try:
                resp_body = r.json()
                if (resp_body.get("status") == "success" or
                    resp_body.get("data", {}).get("is_active") == True or
                    resp_body.get("is_active") == True or
                    r.status_code == 204):
                    print(f"\n  ✅ ACTIVATION SUCCESS — {method} {url.replace(BASE,'')}")
                    print(f"     Response: {json.dumps(resp_body, indent=2)[:800]}")
                    activated = True
                    break
            except Exception:
                if r.status_code == 204:
                    print(f"\n  ✅ ACTIVATION SUCCESS — 204 No Content (standard for PATCH activate)")
                    activated = True
                    break
    except Exception as e:
        print(f"  {method} {url.replace(BASE,'')}  →  ERROR: {e}")

if not activated:
    print(f"\n  ⚠️  No activation endpoint accepted changes — LekeeLekee may require UI-based resume.")
    print(f"  The feed can be re-enabled at: Settings → Integrations → AMD Intelligence Brief → Resume")
    print(f"  Feed ID for support reference: {FEED_ID}")

# ── STEP 5: POST-ACTIVATION VERIFICATION ─────────────────────
divider("STEP 5: POST-ACTIVATION — VERIFY NEW FEED STATE")
time.sleep(3)
verify_resp = session.get(f"{BASE}/api/v1/feeds", timeout=20)
try:
    verify_data = verify_resp.json()
    feeds_v = verify_data.get("data", {}).get("feeds", [])
    feed_v = next((f for f in feeds_v if f["public_id"] == FEED_ID), None)
    if feed_v:
        print(f"  is_active:       {feed_v['is_active']}")
        print(f"  last_fetched_at: {feed_v['last_fetched_at']}")
        print(f"  items_imported:  {feed_v['items_imported']}")
        if feed_v['is_active']:
            print(f"\n  ✅ FEED IS LIVE — is_active = true confirmed by database read-back")
        else:
            print(f"\n  ⚠️  Feed still shows is_active = false after activation attempt")
except Exception:
    print(f"  Could not verify final state — {verify_resp.text[:200]}")

print("\n\nADMIN OPERATION COMPLETE.")
