import requests, json, base64

BASE = "https://www.lekeelekee.com"
EMAIL = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
CONV_ID = "019c12b7-0ef5-73c5-92ca-1e5609f5f5bf"   # #General group channel

r = requests.post(f"{BASE}/api/v1/auth/login",
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={"email": EMAIL, "password": PASSWORD}, timeout=20)
token = r.json()["data"]["token"]
H = {"Authorization": f"Bearer {token}"}

# ── 1. FULL MESSAGE LIST (last 20 with pagination info) ──
print("=== MESSAGES in #General (last 10) ===")
resp = requests.get(f"{BASE}/api/v1/conversations/{CONV_ID}/messages",
                    headers=H, params={"page": 1, "per_page": 10}, timeout=20)
data = resp.json()
msgs = data.get("messages", [])
print(f"Total fields at root: {list(data.keys())}")
print(f"Messages returned: {len(msgs)}")

for m in msgs[:5]:
    cipher = m.get("ciphertext", "")
    try:
        body = base64.b64decode(cipher + "==").decode("utf-8", errors="replace")
    except Exception:
        body = cipher[:80]
    parent = m.get("parent_id") or m.get("reply_to") or m.get("parent_message_id")
    sender = m.get("sender_public_id") or m.get("sender_id")
    msg_id = m.get("id") or m.get("public_id")
    print(f"\n  id={msg_id} | sender={sender} | parent={parent}")
    print(f"  body: {body[:120]}")
    print(f"  all keys: {list(m.keys())}")

# ── 2. PROBE SEND MESSAGE ENDPOINT ──────────────────────
print("\n\n=== PROBE: SEND MESSAGE ENDPOINTS ===")

# Try POST to conversations/{id}/messages
for body_content in [None]:  # None = just probe, don't actually send
    probes = [
        ("POST",   f"/api/v1/conversations/{CONV_ID}/messages"),
        ("POST",   f"/api/v1/conversations/{CONV_ID}/send"),
        ("POST",   f"/api/v1/messages"),
        ("POST",   f"/api/v1/messages/send"),
        ("POST",   f"/api/v1/chat/send"),
    ]
    for method, ep in probes:
        # Send with empty/minimal payload to see if endpoint accepts POST
        rp = requests.post(f"{BASE}{ep}", headers={**H, "Content-Type": "application/json"},
                           json={"message": "", "ciphertext": ""}, timeout=10)
        snippet = rp.text.strip()[:200].replace("\n", " ")
        is_html = snippet.startswith("<!") or snippet.startswith("<h")
        print(f"  {method} {ep} -> HTTP {rp.status_code} [{'HTML' if is_html else 'JSON'}]: {'' if is_html else snippet[:150]}")

# ── 3. PROBE: DM / INDIVIDUAL CONVERSATION ───────────────
print("\n\n=== ALL CONVERSATIONS ===")
resp2 = requests.get(f"{BASE}/api/v1/conversations", headers=H, timeout=15)
convs = resp2.json().get("conversations", [])
for c in convs[:10]:
    print(f"  id={c.get('public_id')} type={c.get('type')} title={c.get('title')}")

# Look for DM/private conv endpoints
print("\n=== PROBE: CREATE DM CONVERSATION ===")
for ep in ["/api/v1/conversations/create", "/api/v1/conversations/direct",
           "/api/v1/direct-message", "/api/v1/conversations/new"]:
    rp = requests.post(f"{BASE}{ep}", headers={**H, "Content-Type": "application/json"},
                       json={}, timeout=10)
    snippet = rp.text.strip()[:150].replace("\n", " ")
    is_html = snippet.startswith("<!") or snippet.startswith("<h")
    print(f"  POST {ep} -> HTTP {rp.status_code} [{'HTML' if is_html else 'JSON'}]: {'' if is_html else snippet[:120]}")
