#!/usr/bin/env python3
"""Check DM open response structure with known-follow member & conv listing."""
import json, requests

EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
BASE = "https://www.lekeelekee.com/api/v1"

s = requests.Session()
r = s.post(f"{BASE}/auth/login", data={"email": EMAIL, "password": PASSWORD})
token = r.json()["data"]["token"]
s.headers["Authorization"] = f"Bearer {token}"
print("Auth OK")

# salaryalert public_id from dm_directory we know the conv id; get their public_id
# First get follower list to find mutual-follow members
r2 = s.get(f"{BASE}/profile/019c10aa-3092-71c5-ae96-17eeef00fb30/followers?per_page=20")
print(f"\nFollowers API → {r2.status_code}")
if r2.status_code == 200:
    followers = r2.json().get("data", {})
    if isinstance(followers, dict):
        flist = followers.get("data", followers.get("followers", []))
    else:
        flist = followers
    print(f"Followers sample (first 3):")
    for f in flist[:3]:
        print(f"  {f.get('username')} → {f.get('public_id','?')[:8]}")

# Now try opening DM with salaryalert (we know they have a conv already)
# Find their public_id from members file
with open("intelligence_vault/live/group_members_full.json") as fp:
    members = json.load(fp)

salary_alert = next((m for m in members if "salary" in m.get("username","").lower()), None)
print(f"\n@salaryalert member: {salary_alert}")

if salary_alert:
    uid = salary_alert["public_id"]
    r3 = s.post(f"{BASE}/conversations", json={"type": "direct", "member_ids": [uid]})
    print(f"\nOpen DM → {r3.status_code}: {r3.text[:400]}")

# Check conversations without type filter
r4 = s.get(f"{BASE}/conversations?per_page=20")
data4 = r4.json()
print(f"\nAll convs → {r4.status_code}")
raw = data4.get("data", {})
if isinstance(raw, dict):
    convs = raw.get("data", raw.get("conversations", []))
else:
    convs = raw
print(f"Total: {len(convs)}")
for c in convs[:5]:
    cid = c.get("id") or c.get("public_id","?")
    ctype = c.get("type","?")
    parts = c.get("participants", [])
    others = [p.get("username","?") for p in parts if p.get("username") != "amd"]
    print(f"  [{ctype}] {cid[:8]} → {others}")
