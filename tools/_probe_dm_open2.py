#!/usr/bin/env python3
"""Probe: test member_ids array payload for DM open."""
import json, requests

EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
BASE = "https://www.lekeelekee.com/api/v1"

s = requests.Session()
r = s.post(f"{BASE}/auth/login", data={"email": EMAIL, "password": PASSWORD})
token = r.json()["data"]["token"]
s.headers["Authorization"] = f"Bearer {token}"
print("Auth OK")

# @Witty_ from probe
test_id = "019c6af2-8375-71a7-98f0-b3b275e5e358"

# Try 1: member_ids as JSON array
payload = {"type": "direct", "member_ids": [test_id]}
r = s.post(f"{BASE}/conversations", json=payload)
print(f"member_ids array → HTTP {r.status_code}: {r.text[:300]}")

# Try 2: member_ids as plain string
payload2 = {"type": "direct", "member_ids": test_id}
r2 = s.post(f"{BASE}/conversations", json=payload2)
print(f"member_ids string → HTTP {r2.status_code}: {r2.text[:300]}")

# Try 3: form encode
r3 = s.post(f"{BASE}/conversations", data={"type": "direct", "member_ids[]": test_id})
print(f"form member_ids[] → HTTP {r3.status_code}: {r3.text[:300]}")

# Identify existing DMs and their participants
r4 = s.get(f"{BASE}/conversations?type=direct&per_page=20")
data = r4.json()
raw = data.get("data", {})
if isinstance(raw, dict):
    convs = raw.get("data", raw.get("conversations", []))
else:
    convs = raw
print(f"\nExisting DM convs: {len(convs)}")
for c in convs:
    cid = c.get("id") or c.get("public_id", "?")
    parts = c.get("participants", [])
    others = [f"{p.get('username','?')} ({p.get('public_id','?')[:8]})" for p in parts if p.get("username") != "amd"]
    print(f"  {cid[:8]} → {others}")
