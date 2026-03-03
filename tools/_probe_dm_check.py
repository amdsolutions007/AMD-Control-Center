#!/usr/bin/env python3
"""Probe: DM open response + conv listing."""
import json, requests

EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
BASE = "https://www.lekeelekee.com/api/v1"

s = requests.Session()
r = s.post(f"{BASE}/auth/login", data={"email": EMAIL, "password": PASSWORD})
token = r.json()["data"]["token"]
s.headers["Authorization"] = f"Bearer {token}"
print("Auth OK")

# Test DM open with @salaryalert (known DM partner)
salary_uid = "019ca7fc-77f2-7189-a90f-ae1cfb621db6"
r2 = s.post(f"{BASE}/conversations", json={"type": "direct", "member_ids": [salary_uid]})
print(f"\nOpen DM @salaryalert → {r2.status_code}")
print(r2.text[:500])

# List all convs (no type filter)
r3 = s.get(f"{BASE}/conversations?per_page=20")
print(f"\nAll convs → {r3.status_code}: {r3.text[:1000]}")
