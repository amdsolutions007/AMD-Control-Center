import requests, json

BASE = "https://www.lekeelekee.com"
EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
GROUP_ID = "4d183887-2d5a-47b0-8226-dd6939d29694"

r = requests.post(f"{BASE}/api/v1/auth/login",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"email": EMAIL, "password": PASSWORD}, timeout=20)
token = r.json()["data"]["token"]
H = {"Authorization": f"Bearer {token}"}

# ── 1. CHANNELS ──────────────────────────────────────────
print("=== CHANNELS ===")
resp = requests.get(f"{BASE}/api/v1/groups/{GROUP_ID}/channels", headers=H, timeout=15)
data = resp.json()
print(json.dumps(data, indent=2)[:800])
channels = data.get("data", {}).get("channels", [])

# ── 2. CHANNEL MESSAGES ──────────────────────────────────
for ch in channels:
    cid = ch.get("public_id")
    cname = ch.get("name")
    print(f"\n=== MESSAGES in channel '{cname}' ({cid}) ===")

    for ep in [
        f"/api/v1/channels/{cid}/messages",
        f"/api/v1/groups/{GROUP_ID}/channels/{cid}/messages",
        f"/api/v1/channel/{cid}/messages",
    ]:
        r2 = requests.get(f"{BASE}{ep}", headers=H, params={"page": 1, "per_page": 5}, timeout=15)
        snippet = r2.text.strip()[:200].replace("\n", " ")
        is_html = snippet.startswith("<!") or snippet.startswith("<h")
        print(f"  {ep} -> HTTP {r2.status_code} [{'HTML' if is_html else 'JSON'}]: {'' if is_html else snippet[:180]}")

# ── 3. CONVERSATIONS (DM) ────────────────────────────────
print("\n=== CONVERSATIONS (DM) ===")
resp2 = requests.get(f"{BASE}/api/v1/conversations", headers=H, timeout=15)
data2 = resp2.json()
print(json.dumps(data2, indent=2)[:1000])

# ── 4. SEND TEST (but don't actually send) ───────────────
# Probe what POST to channels looks like
print("\n=== PROBE: POST /api/v1/channels/{cid}/messages (OPTIONS) ===")
if channels:
    cid = channels[0]["public_id"]
    r3 = requests.options(f"{BASE}/api/v1/channels/{cid}/messages", headers=H, timeout=10)
    print(f"  OPTIONS -> HTTP {r3.status_code}, headers: {dict(r3.headers)}")

# ── 5. CONVERSATION MESSAGES ─────────────────────────────
convs = data2.get("conversations", [])
if convs:
    print(f"\n=== FIRST CONVERSATION MESSAGES ===")
    cv = convs[0]
    cid2 = cv.get("public_id")
    print(f"  Conversation: {json.dumps(cv, indent=2)[:300]}")
    for ep in [
        f"/api/v1/conversations/{cid2}/messages",
        f"/api/v1/conversations/{cid2}",
    ]:
        r4 = requests.get(f"{BASE}{ep}", headers=H, params={"page": 1, "per_page": 5}, timeout=15)
        snippet2 = r4.text.strip()[:300].replace("\n", " ")
        is_html2 = snippet2.startswith("<!") or snippet2.startswith("<h")
        print(f"  {ep} -> HTTP {r4.status_code} [{'HTML' if is_html2 else 'JSON'}]: {'' if is_html2 else snippet2[:250]}")
