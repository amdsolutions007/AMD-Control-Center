#!/usr/bin/env python3
"""Verify vault integrity and hunt missing member(s) to reach 128."""
import json, os, sys
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

# ── Auth ──────────────────────────────────────────────────────────────────────
s = requests.Session()
s.headers["User-Agent"] = "AMD-VerifySync/1.0"
r = s.post(f"{BASE_URL}/api/v1/auth/login",
           data={"email": EMAIL, "password": PASSWORD},
           headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=20)
token = (r.json().get("data") or {}).get("token") or r.json().get("token")
s.headers["Authorization"] = f"Bearer {token}"
print("✅ Auth OK")

# ── Vault state ───────────────────────────────────────────────────────────────
mdata  = json.loads((VAULT / "members/group/members.json").read_text())
rdata  = json.loads((VAULT / "reports/empire_citizen_report.json").read_text())

print(f"\n=== VAULT INTEGRITY ===")
print(f"members.json total field:  {mdata['total']}")
print(f"Actual array length:       {len(mdata['members'])}")
print(f"Records with no handle:    {sum(1 for m in mdata['members'] if not m.get('handle'))}")
print(f"last_synced:               {mdata.get('last_synced')}")

ecr = rdata.get("empire_citizen_report", {})
gi  = rdata.get("growth_intelligence", {})
print(f"\n=== EMPIRE REPORT ===")
print(f"group_members:       {ecr.get('group_members')}")
print(f"profile_followers:   {ecr.get('profile_followers')}")
print(f"unique_total_reach:  {ecr.get('unique_total_reach')}")
print(f"net_new_citizens:    {gi.get('net_new_citizens')}")
print(f"live_api_count:      {gi.get('live_api_count')}")

# ── Live group info ───────────────────────────────────────────────────────────
print(f"\n=== LIVE GROUP INFO ===")
grp = s.get(f"{BASE_URL}/api/v1/groups/{GROUP_ID}", timeout=20)
if grp.status_code == 200:
    raw = grp.text.strip()
    if raw and not raw.startswith("<"):
        ginfo = grp.json()
        g = ginfo.get("data") or ginfo.get("group") or ginfo
        if isinstance(g, dict):
            for k in ["name","members_count","member_count","total_members","subscribers_count"]:
                if k in g:
                    print(f"  {k}: {g[k]}")
            print(f"  All fields: {list(g.keys())}")
else:
    print(f"  HTTP {grp.status_code}")

# ── already-seen handles in vault ─────────────────────────────────────────────
vault_handles = set(
    (m.get("handle") or "").lower().strip("@")
    for m in mdata["members"]
)

# ── Exhaust all pagination patterns ──────────────────────────────────────────
print(f"\n=== HUNTING MISSING MEMBER ===")
print(f"Vault has {len(vault_handles)} unique handles")

all_api_handles = {}

# Try large per_page values to see if API caps
for pp in [200, 150, 128, 100]:
    resp = s.get(f"{BASE_URL}/api/v1/groups/{GROUP_ID}/members",
                 params={"per_page": pp, "limit": pp, "page": 1}, timeout=25)
    if resp.status_code == 200:
        raw = resp.text.strip()
        if raw and not raw.startswith("<"):
            body = resp.json()
            data = body.get("data") or {}
            members = data.get("members") or body.get("members") or []
            print(f"  per_page={pp}: returned {len(members)}")
            if len(members) > len(all_api_handles):
                for m in members:
                    u = m.get("user") or m
                    h = (u.get("username") or "").lower().strip("@")
                    if h:
                        all_api_handles[h] = (u.get("name") or h)
            break

# page 2 with best page size
resp2 = s.get(f"{BASE_URL}/api/v1/groups/{GROUP_ID}/members",
              params={"per_page": 100, "limit": 100, "page": 2}, timeout=25)
if resp2.status_code == 200:
    raw2 = resp2.text.strip()
    if raw2 and not raw2.startswith("<"):
        body2 = resp2.json()
        data2 = body2.get("data") or {}
        batch2 = data2.get("members") or body2.get("members") or []
        meta2  = body2.get("meta") or body2.get("pagination") or data2.get("meta") or {}
        print(f"  page 2: returned {len(batch2)} | meta={meta2}")
        for m in batch2:
            u = m.get("user") or m
            h = (u.get("username") or "").lower().strip("@")
            if h:
                all_api_handles[h] = (u.get("name") or h)

# page 3
resp3 = s.get(f"{BASE_URL}/api/v1/groups/{GROUP_ID}/members",
              params={"per_page": 100, "limit": 100, "page": 3}, timeout=25)
if resp3.status_code == 200:
    raw3 = resp3.text.strip()
    if raw3 and not raw3.startswith("<"):
        body3 = resp3.json()
        data3 = body3.get("data") or {}
        batch3 = data3.get("members") or body3.get("members") or []
        print(f"  page 3: returned {len(batch3)}")
        for m in batch3:
            u = m.get("user") or m
            h = (u.get("username") or "").lower().strip("@")
            if h:
                all_api_handles[h] = (u.get("name") or h)

# offset strategy
for offset in [120, 125, 126, 127]:
    resp_off = s.get(f"{BASE_URL}/api/v1/groups/{GROUP_ID}/members",
                     params={"offset": offset, "limit": 10, "per_page": 10}, timeout=25)
    if resp_off.status_code == 200:
        raw_off = resp_off.text.strip()
        if raw_off and not raw_off.startswith("<"):
            body_off = resp_off.json()
            data_off = body_off.get("data") or {}
            batch_off = data_off.get("members") or body_off.get("members") or []
            newly = 0
            for m in batch_off:
                u = m.get("user") or m
                h = (u.get("username") or "").lower().strip("@")
                if h and h not in all_api_handles:
                    all_api_handles[h] = (u.get("name") or h)
                    newly += 1
            if newly:
                print(f"  offset={offset}: {newly} new handles found!")
                for m in batch_off:
                    u = m.get("user") or m
                    print(f"    - {u.get('username','?')} | {u.get('name','?')}")

print(f"\n  Total unique API handles seen: {len(all_api_handles)}")

# Find any in API not in vault
api_not_in_vault = {h: n for h, n in all_api_handles.items() if h not in vault_handles}
if api_not_in_vault:
    print(f"\n  ⚠️  {len(api_not_in_vault)} handles in API NOT in vault:")
    for h, n in api_not_in_vault.items():
        print(f"    @{h} | {n}")
else:
    print(f"\n  ✅ All API handles are in vault")

# Check if 1 handle in vault has no API counterpart (ghost record)
vault_not_in_api = vault_handles - set(all_api_handles.keys())
vault_not_in_api.discard("")
print(f"\n  Vault handles not seen in this probe: {len(vault_not_in_api)}")
if vault_not_in_api:
    for h in sorted(vault_not_in_api)[:20]:
        print(f"    @{h}")

print(f"\n=== FINAL COUNT ===")
print(f"  Live API unique:  {len(all_api_handles)}")
print(f"  Vault records:    {len(vault_handles)}")
print(f"  Discrepancy:      {abs(len(all_api_handles) - len(vault_handles))}")
