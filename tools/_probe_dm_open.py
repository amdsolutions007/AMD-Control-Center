#!/usr/bin/env python3
"""
tools/_probe_dm_open.py
=======================
Phase 1 probe: Find the correct endpoint to OPEN a new DM conversation
with a LekeeLekee group member by their public_id.

Tests 3 known members to confirm which endpoint and payload works.
"""
import os, sys, json, requests, base64
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
try:
    from dotenv import load_dotenv; load_dotenv()
except ImportError:
    pass

BASE     = os.getenv("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
EMAIL    = os.getenv("LEKE_LEKE_EMAIL",    "ceo@amdsolutions007.com")
PASSWORD = os.getenv("LEKE_LEKE_PASSWORD", "#@Amdmail@007")

# ── Auth ─────────────────────────────────────────────────────────────────────
r = requests.post(f"{BASE}/api/v1/auth/login",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"email": EMAIL, "password": PASSWORD}, timeout=20)
d = r.json()
token = d["data"]["token"]
my_id = d["data"].get("user", {}).get("public_id", "")
print(f"✅ Auth OK | my_id={my_id[:8]}")
H = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"

# ── Step 1: Fetch ALL group members with full public_ids ──────────────────────
print(f"\n=== FETCHING ALL GROUP MEMBERS ===")
all_members = []
page = 1
while True:
    resp = requests.get(f"{BASE}/api/v1/groups/{GROUP_ID}/members",
                        headers=H, params={"page": page, "per_page": 50}, timeout=20)
    raw = resp.json()
    members = raw.get("data", {}).get("members", [])
    if not members:
        break
    for m in members:
        u = m.get("user", {})
        uid  = u.get("public_id") or u.get("id","")
        name = u.get("name", u.get("display_name","?"))
        uname = u.get("username","?")
        if uid and uid != my_id:
            all_members.append({"public_id": uid, "name": name, "username": uname})
    print(f"  Page {page}: {len(members)} members (total so far: {len(all_members)})")
    if len(members) < 50:
        break
    page += 1

print(f"\nTotal non-self members: {len(all_members)}")
if all_members:
    print(f"Sample: {json.dumps(all_members[:3], indent=2)}")

# Save for use by blast tool
out_path = Path(__file__).parent.parent / "intelligence_vault" / "live" / "group_members_full.json"
with open(out_path, "w") as f:
    json.dump({
        "fetched_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "count": len(all_members),
        "members": all_members
    }, f, indent=2, ensure_ascii=False)
print(f"\n💾 Saved {len(all_members)} members → {out_path.name}")

# ── Step 2: Test DM-OPEN with 3 members ──────────────────────────────────────
print(f"\n=== PROBING DM-OPEN ENDPOINTS (3 test members) ===")
test_subjects = all_members[:3] if len(all_members) >= 3 else all_members

STATIC_IV = "MDAwMDAwMDAwMDAwMDAwMA=="
test_text = "Test connection probe — AMD Solutions 007"
test_cipher = base64.b64encode(test_text.encode()).decode()

WORKING_ENDPOINT = None
WORKING_PAYLOAD_KEY = None

for m in test_subjects:
    uid   = m["public_id"]
    uname = m["username"]
    name  = m["name"]
    print(f"\n  Testing with @{uname} ({uid[:8]}…)")

    candidate_payloads = [
        ("user_public_id",     {"user_public_id": uid}),
        ("user_id",            {"user_id": uid}),
        ("participant_id",     {"participant_id": uid}),
        ("recipient_id",       {"recipient_id": uid}),
        ("type+uid",           {"type": "direct", "user_public_id": uid}),
        ("type+user_id",       {"type": "direct", "user_id": uid}),
    ]

    for label, payload in candidate_payloads:
        try:
            r2 = requests.post(f"{BASE}/api/v1/conversations",
                               headers=H, json=payload, timeout=15)
            ct = r2.headers.get("content-type","")
            snippet = r2.text[:200].replace("\n"," ")
            is_html = snippet.strip().startswith("<!") or "<html" in snippet[:50]
            if "json" in ct and r2.status_code in (200, 201):
                data2 = r2.json()
                conv_id = (data2.get("data", {}).get("public_id")
                           or data2.get("conversation", {}).get("public_id")
                           or data2.get("public_id")
                           or data2.get("data", {}).get("conversation", {}).get("public_id"))
                if conv_id:
                    print(f"    ✅ [{label}] → HTTP {r2.status_code} | conv_id={conv_id}")
                    if not WORKING_ENDPOINT:
                        WORKING_ENDPOINT = label
                        WORKING_PAYLOAD_KEY = list(payload.keys())[0] if len(payload)==1 else payload
                else:
                    print(f"    🟡 [{label}] → HTTP {r2.status_code} JSON but no conv_id: {snippet[:150]}")
            else:
                print(f"    ⚪ [{label}] → HTTP {r2.status_code} {'HTML' if is_html else snippet[:120]}")
        except Exception as e:
            print(f"    ❌ [{label}] → {e}")
    break  # only test first member for endpoint discovery

print(f"\n=== RESULT ===")
if WORKING_ENDPOINT:
    print(f"  ✅ Working endpoint found: payload key = {WORKING_ENDPOINT}")
else:
    print(f"  ❌ No direct DM-open endpoint confirmed yet")
    print(f"  Try: check if conv already exists in conversations list first")

# ── Step 3: Check if already-existing convs cover any members ────────────────
print(f"\n=== CHECKING EXISTING DM CONVERSATIONS ===")
resp3 = requests.get(f"{BASE}/api/v1/conversations",
                     headers=H, params={"page":1,"per_page":100}, timeout=20)
raw3 = resp3.json()
convs3 = raw3.get("conversations", [])
direct_convs = [c for c in convs3 if c.get("type") == "direct"]
print(f"  Existing direct convs: {len(direct_convs)}")
for c in direct_convs:
    cid = c.get("public_id","?")
    parts = c.get("participants", [])
    names_str = ", ".join(
        f"{p.get('name','?')}(@{p.get('username','?')})[{(p.get('public_id') or '')[:8]}]"
        for p in parts if isinstance(p, dict)
    )
    print(f"  {cid} | {names_str}")
