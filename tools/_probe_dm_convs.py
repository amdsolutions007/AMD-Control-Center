"""Probe DM conversations on LekeeLekee — discover per-member conv IDs."""
import requests, json, os, sys, base64
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
try:
    from dotenv import load_dotenv; load_dotenv()
except ImportError:
    pass

BASE  = "https://www.lekeelekee.com"
EMAIL = os.getenv("LEKE_LEKE_EMAIL", "ceo@amdsolutions007.com")
PASS  = os.getenv("LEKE_LEKE_PASSWORD", "#@Amdmail@007")

# Auth
r = requests.post(f"{BASE}/api/v1/auth/login",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"email": EMAIL, "password": PASS}, timeout=20)
data = r.json()
token = data["data"]["token"]
my_id = data["data"].get("user", {}).get("public_id") or data["data"].get("public_id")
print(f"✅ Auth OK | My ID: {my_id}")
H = {"Authorization": f"Bearer {token}"}

# ── 1. List all conversations ────────────────────────────
print("\n=== ALL CONVERSATIONS ===")
resp = requests.get(f"{BASE}/api/v1/conversations", headers=H,
                    params={"page": 1, "per_page": 100}, timeout=20)
print(f"  HTTP {resp.status_code}")
raw = resp.json()
# Try different shapes
convs = (raw.get("data", {}).get("conversations")
         or raw.get("conversations")
         or raw.get("data")
         or [])
print(f"  Found {len(convs)} conversations")
print(f"  Response keys: {list(raw.keys())}")
if not isinstance(convs, list):
    print(f"  RAW (first 600): {json.dumps(raw, indent=2)[:600]}")
    convs = []

dm_directory = {}
for c in convs:
    cid   = c.get("public_id") or c.get("id", "?")
    ctype = c.get("type", "?")
    # Get participant list — try multiple field names
    parts  = (c.get("participants") or c.get("members") or
               c.get("other_participant") or [])
    if isinstance(parts, dict):
        parts = [parts]
    names = []
    for p in parts:
        if isinstance(p, dict):
            u = p.get("username") or p.get("handle") or p.get("name", "?")
            n = p.get("name") or p.get("display_name", "")
            pid = p.get("public_id") or p.get("id","")
            names.append(f"{n}(@{u})[{pid[:8]}]")
            if u and u != my_id:
                dm_directory[u.lstrip("@")] = cid
    print(f"  conv_id={cid} type={ctype} | {names}")

print(f"\n=== DM DIRECTORY ({len(dm_directory)} entries) ===")
print(json.dumps(dm_directory, indent=2))

# ── 2. Search for @emperoraustus ────────────────────────
print("\n=== SEARCHING FOR @emperoraustus ===")
# Try direct user lookup
for ep in [
    "/api/v1/users?username=emperoraustus",
    "/api/v1/users/emperoraustus",
    "/api/v1/users/search?q=emperoraustus",
    "/api/v1/members?username=emperoraustus",
]:
    r2 = requests.get(f"{BASE}{ep}", headers=H, timeout=10)
    snippet = r2.text[:200].replace("\n"," ")
    is_html = snippet.startswith("<!") or snippet.startswith("<h")
    print(f"  {ep} → {r2.status_code} {'HTML' if is_html else snippet[:160]}")

# ── 3. Check the group members API for emperor ────────────
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"
print("\n=== GROUP MEMBERS SEARCH ===")
for ep in [
    f"/api/v1/groups/{GROUP_ID}/members?username=emperoraustus",
    f"/api/v1/groups/{GROUP_ID}/members?search=emperor",
    f"/api/v1/groups/{GROUP_ID}/members?page=1&per_page=10",
]:
    r3 = requests.get(f"{BASE}{ep}", headers=H, timeout=10)
    snippet = r3.text[:300].replace("\n"," ")
    is_html = snippet.startswith("<!") or snippet.startswith("<h")
    print(f"  {ep} → {r3.status_code} {'HTML' if is_html else snippet[:250]}")
