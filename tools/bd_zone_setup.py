#!/usr/bin/env python3
"""
BrightData Scraping Browser zone discovery + Railway env var injection.
Usage: python3 tools/bd_zone_setup.py
"""
import json
import os
import sys
import urllib.request
import urllib.error
import ssl

API_KEY = "a9cbd05e-bb6f-43b0-b5b6-258989919928"
ZONE_NAME = "amd_scraping_browser"
CTX = ssl.create_default_context()


def bd_request(path, method="GET", data=None):
    url = f"https://api.brightdata.com{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(
        url,
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        resp = urllib.request.urlopen(req, context=CTX, timeout=15)
        return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as ex:
        return 0, str(ex)


def main():
    print("=" * 60)
    print("BrightData Zone Setup")
    print("=" * 60)

    zone_password = None

    # ── Step 1: List existing zones ──────────────────────────────
    print("\n[1] Fetching existing zones...")
    status, resp = bd_request("/zone/get_active_zones")
    print(f"    GET /zone/get_active_zones → {status}: {str(resp)[:200]}")

    if status == 200 and isinstance(resp, list):
        zones = resp
    elif status == 200 and isinstance(resp, dict):
        zones = resp.get("zones", [])
    else:
        # Try get-all-zones fallback
        status2, resp2 = bd_request("/zone")
        print(f"    GET /zone (fallback) → {status2}: {str(resp2)[:200]}")
        if status2 == 200 and isinstance(resp2, list):
            zones = resp2
        elif status2 == 200 and isinstance(resp2, dict):
            zones = resp2.get("zones", [])
        else:
            zones = []

    print(f"    Found {len(zones)} zone(s)")

    # ── Step 2: Find or create Scraping Browser zone ─────────────
    sb_zone = None
    for z in zones:
        ztype = z.get("type", "") if isinstance(z, dict) else ""
        zname = z.get("name", "") if isinstance(z, dict) else ""
        if ztype in ("scraping_browser", "chrome", "browser_api") or "scraping" in zname.lower() or "browser" in zname.lower():
            sb_zone = z
            print(f"    ✅ Existing Scraping Browser zone: {zname}")
            break

    if not sb_zone:
        print(f"\n[2] No Scraping Browser zone found — creating '{ZONE_NAME}'...")
        create_payload = {
            "zone": {
                "name": ZONE_NAME,
            },
            "plan": {
                "type": "browser_api",
            },
        }
        s, r = bd_request("/zone", method="POST", data=create_payload)
        print(f"    POST /zone → {s}: {str(r)[:300]}")
        if s in (200, 201) and isinstance(r, dict):
            zone_data = r.get("zone", r)
            sb_zone = zone_data
            # Extract password directly from creation response
            pw_from_create = zone_data.get("password", [])
            if isinstance(pw_from_create, list) and pw_from_create:
                zone_password = pw_from_create[0]
            elif isinstance(pw_from_create, str):
                zone_password = pw_from_create
            print(f"    ✅ Zone created: {ZONE_NAME}  password={'set' if zone_password else 'MISSING'}")
        else:
            print(f"    ❌ Zone creation failed ({s}). Response: {r}")
            # Proceed with manual endpoint construction

    # ── Step 3: Get customer ID to build WebDriver endpoint ──────
    print("\n[3] Fetching account/customer details...")
    s_acct, r_acct = bd_request("/status")
    print(f"    GET /status → {s_acct}: {str(r_acct)[:200]}")

    customer_id = None
    if s_acct == 200 and isinstance(r_acct, dict):
        customer_id = r_acct.get("customer") or r_acct.get("cn") or r_acct.get("id")

    zone_name_final = ZONE_NAME
    if sb_zone and isinstance(sb_zone, dict):
        zone_name_final = sb_zone.get("name", ZONE_NAME)

    # ── Step 4: Get zone password ─────────────────────────────────
    print(f"\n[4] Fetching password for zone '{zone_name_final}'...")
    if zone_password:
        print(f"    ✅ Password already obtained from creation response — skipping API call")
    else:
        s_pw, r_pw = bd_request(f"/zone/passwords?zone={zone_name_final}")
        print(f"    GET /zone/passwords → {s_pw}: {str(r_pw)[:300]}")

        if s_pw == 200:
            if isinstance(r_pw, dict):
                pw_list = r_pw.get("passwords", [])
                zone_password = pw_list[0] if pw_list else r_pw.get("password")
            elif isinstance(r_pw, list) and r_pw:
                zone_password = r_pw[0]

    # ── Step 5: Build the WebDriver endpoint ─────────────────────
    print("\n[5] Building WebDriver endpoint...")
    if customer_id and zone_password:
        ws_endpoint = (
            f"https://brd-customer-{customer_id}-zone-{zone_name_final}"
            f":{zone_password}@brd.superproxy.io:9515"
        )
        print(f"    ✅ WS Endpoint: https://brd-customer-{customer_id}-zone-{zone_name_final}:***@brd.superproxy.io:9515")
    elif sb_zone and isinstance(sb_zone, dict) and sb_zone.get("endpoint"):
        ws_endpoint = sb_zone["endpoint"]
        print(f"    ✅ WS Endpoint from zone data: {ws_endpoint[:60]}...")
    else:
        ws_endpoint = None
        print("    ⚠️  Could not construct endpoint — missing customer_id or zone_password")
        print(f"       customer_id={customer_id}, zone_password={'set' if zone_password else 'MISSING'}")
        print(f"       Full account response: {str(r_acct)[:400]}")
        print(f"       Full zone response: {str(sb_zone)[:400]}")

    # ── Step 6: Set in Railway env ────────────────────────────────
    if ws_endpoint:
        print(f"\n[6] Setting BRIGHTDATA_WS_ENDPOINT in Railway...")
        railway_cmd = (
            f'npx -y @railway/cli variables set BRIGHTDATA_WS_ENDPOINT="{ws_endpoint}" '
            f'--service telegram-approval-bot 2>&1'
        )
        result = os.popen(railway_cmd).read().strip()
        print(f"    Railway: {result[:200]}")
        print(f"\n✅ BRIGHTDATA_WS_ENDPOINT set. Write this down:\n{ws_endpoint[:80]}...")
    else:
        print("\n[6] Cannot set Railway var — endpoint construction failed.")
        print("    Dumping all raw API responses for manual diagnosis:")

    # ── Summary ───────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"API Key valid: {status in (200,) or status2 if 'status2' in dir() else status}")
    print(f"Zones found: {len(zones)}")
    print(f"SB zone: {zone_name_final}")
    print(f"Customer ID: {customer_id}")
    print(f"Zone password: {'SET' if zone_password else 'MISSING'}")
    print(f"WS Endpoint: {'BUILT' if ws_endpoint else 'MISSING'}")


if __name__ == "__main__":
    main()
