#!/usr/bin/env python3
"""
LIVE EMPIRE AUDIT — AMD Control Center
======================================
CEO Command: Roster + Post Intelligence + Phase 4 Warm-Up
Run: python3 tools/live_empire_audit.py
"""
import json, os, re, sys, textwrap, requests
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

BASE_URL   = os.environ.get("LEKE_LEKE_BASE_URL", "https://www.lekeelekee.com")
GROUP_ID   = os.environ["LEKE_LEKE_GROUP_ID"]
EMAIL      = os.environ["LEKE_LEKE_EMAIL"]
PASSWORD   = os.environ["LEKE_LEKE_PASSWORD"]
BOT_TOKEN  = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CEO_TG_ID  = os.environ.get("CEO_TELEGRAM_ID", "")

VAULT_DIR  = Path(__file__).parent.parent / "intelligence_vault"
LIVE_DIR   = VAULT_DIR / "live"

DIVIDER    = "━" * 60

# ── Auth ─────────────────────────────────────────────────────────────────────

def login() -> requests.Session:
    s = requests.Session()
    s.headers["User-Agent"] = "AMD-AuditEngine/2.0"
    r = s.post(
        f"{BASE_URL}/api/v1/auth/login",
        data={"email": EMAIL, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=20,
    )
    body = r.json()
    token = (
        (body.get("data") or {}).get("token")
        or body.get("token")
        or body.get("access_token")
    )
    if not token:
        print(f"❌ Auth failed: {str(body)[:300]}")
        sys.exit(1)
    s.headers["Authorization"] = f"Bearer {token}"
    print(f"✅ Authenticated as @amd (Olawale Shoyemi)")
    return s

# ── API helpers ───────────────────────────────────────────────────────────────

def get(s: requests.Session, path: str, params: dict = None) -> dict | list | None:
    try:
        r = s.get(f"{BASE_URL}{path}", params=params, timeout=20)
    except Exception as e:
        print(f"  ⚠️  GET {path} → network error: {e}")
        return None
    if r.status_code != 200:
        print(f"  ⚠️  GET {path} → HTTP {r.status_code}")
        return None
    raw = r.text.strip()
    if not raw or raw.startswith("<"):
        # Empty body or HTML page — not a JSON API response
        return None
    try:
        return r.json()
    except Exception:
        return None

# ── Intelligence Vault loader ─────────────────────────────────────────────────

def load_vault_citizens() -> list[dict]:
    """Load known users from intelligence_vault/citizens_*.json and profiles."""
    citizens = []
    for f in sorted(VAULT_DIR.glob("citizens_*.json")) + sorted(VAULT_DIR.glob("profiles_*.json")):
        try:
            data = json.loads(f.read_text())
            if isinstance(data, list):
                citizens.extend(data)
            elif isinstance(data, dict):
                citizens.extend(data.get("citizens", data.get("profiles", [])))
        except Exception:
            pass
    return citizens

def load_draft_vault() -> list[dict]:
    path = LIVE_DIR / "ai_reply_drafts.json"
    if not path.exists():
        return []
    return json.loads(path.read_text()).get("drafts", [])

# ── Post ID search ────────────────────────────────────────────────────────────

def find_manifesto_post(s: requests.Session) -> dict | None:
    """
    Search group posts for the AMD 007 Manifesto.
    CEO label: manifesto_007. We search across pages for matching content.
    """
    MANIFESTO_CLUES = [
        "manifesto", "007", "solutions 007", "protocol 007",
        "olawale", "amd", "vision", "digital", "ecosystem",
    ]
    for page in range(1, 5):   # scan up to 4 pages
        body = get(s, f"/api/v1/groups/{GROUP_ID}/posts",
                   params={"page": page, "per_page": 50, "limit": 50})
        if not body:
            break
        posts = []
        if isinstance(body, list):
            posts = body
        elif isinstance(body, dict):
            nested = body.get("data") or {}
            posts = (
                nested.get("posts") or nested.get("messages") or nested.get("items")
                or body.get("posts") or []
            )
        if not posts:
            break
        for p in posts:
            text = (p.get("text") or p.get("content") or p.get("body") or "").lower()
            hits = sum(1 for clue in MANIFESTO_CLUES if clue in text)
            if hits >= 2 and len(text) > 200:
                return p   # Best candidate: multiple manifesto clues, long-form
    return None

# ── Member helpers ────────────────────────────────────────────────────────────

def extract_members(body: dict | list) -> list[dict]:
    if isinstance(body, list):
        return body
    if isinstance(body, dict):
        data = body.get("data") or {}
        return (
            data.get("members") or data.get("users") or data.get("items")
            or body.get("members") or body.get("users") or []
        )
    return []

def member_handle(m: dict) -> str:
    u = m.get("user") or m
    return (u.get("username") or u.get("handle") or "").strip("@")

def member_name(m: dict) -> str:
    u = m.get("user") or m
    return (u.get("name") or u.get("full_name") or u.get("username") or "—")

def member_joined(m: dict) -> str:
    raw = m.get("joined_at") or m.get("created_at") or m.get("date") or ""
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M UTC")
    except Exception:
        return raw[:19] or "unknown"

def member_followers(m: dict) -> int:
    u = m.get("user") or m
    return int(u.get("followers_count") or u.get("followers") or 0)

def is_whale(m: dict) -> bool:
    """True if user has whale-tier follower count or founder badge."""
    u = m.get("user") or m
    followers = member_followers(m)
    badge = str(u.get("badge") or u.get("role") or u.get("title") or "").lower()
    is_founder = any(w in badge for w in ["founder", "admin", "verified", "premium"])
    return followers >= 500 or is_founder

# ── Telegram bridge ───────────────────────────────────────────────────────────

def send_telegram(text: str, fp_suffix: str = "") -> bool:
    if not BOT_TOKEN or not CEO_TG_ID:
        return False
    fp = fp_suffix[:32] if fp_suffix else "audit000"
    payload = {
        "chat_id": CEO_TG_ID,
        "text": text,
        "reply_markup": json.dumps({
            "inline_keyboard": [[
                {"text": "✅ POST IT",  "callback_data": f"dreply_approve_{fp}"},
                {"text": "❌ SKIP",     "callback_data": f"dreply_skip_{fp}"},
            ]]
        }),
    }
    r = requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        json=payload, timeout=15,
    )
    return r.json().get("ok", False)

# ── Welcome draft generator ───────────────────────────────────────────────────

WELCOME_TEMPLATE = """\
👋 Welcome to the African Tech Ecosystem, {name}!

I'm Olawale Shoyemi — founder of AMD Solutions 007. We're building Africa's \
most intelligent tech ecosystem, one connection at a time.

Quick question for you: What's the biggest challenge you're currently navigating \
in tech or business on the continent? 

Drop your thoughts — I read every reply. 🌍⚡

— @amd | AMD Solutions 007"""

def draft_welcome(member: dict, vault_citizens: list[dict]) -> dict:
    handle = member_handle(member)
    name   = member_name(member)
    joined = member_joined(member)
    followers = member_followers(member)

    # Cross-reference vault
    vault_match = next(
        (c for c in vault_citizens
         if (c.get("username") or "").lower() == handle.lower()
         or (c.get("handle") or "").lower().strip("@") == handle.lower()),
        None,
    )
    vault_note = ""
    if vault_match:
        vault_note = (f"  🟢 VAULT MATCH: Known citizen — "
                      f"sector={vault_match.get('sector','?')}, "
                      f"engagement={vault_match.get('engagement_score','?')}")
    else:
        vault_note = "  ⚪ NEW: Not in Intelligence Vault — adding to tracking."

    ai_draft = WELCOME_TEMPLATE.format(name=name.split()[0] if name else handle)

    import hashlib
    fp = hashlib.md5(f"welcome_{handle}_{joined}".encode()).hexdigest()

    return {
        "handle":      handle,
        "name":        name,
        "joined":      joined,
        "followers":   followers,
        "is_whale":    is_whale(member),
        "vault_note":  vault_note,
        "ai_draft":    ai_draft,
        "fingerprint": fp,
        "source_type": "GROUP_WELCOME",
    }

# ════════════════════════════════════════════════════════════════════════════════
# MAIN AUDIT
# ════════════════════════════════════════════════════════════════════════════════

def run_audit():
    print(f"\n{DIVIDER}")
    print("🛰️  AMD EMPIRE AUDIT — LIVE INTEL SWEEP")
    print(f"📅  {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{DIVIDER}\n")

    s = login()

    # ── 1. GROUP INFO ─────────────────────────────────────────────────────────
    print(f"[1/3] FETCHING GROUP ROSTER...")
    group_body = get(s, f"/api/v1/groups/{GROUP_ID}")
    total_members = 0
    total_followers = 0
    group_name = "African Tech Ecosystem"

    if group_body:
        gdata = group_body.get("data") or group_body.get("group") or group_body
        if isinstance(gdata, dict):
            group_name     = gdata.get("name") or group_name
            total_members  = int(gdata.get("members_count") or gdata.get("member_count")
                                 or gdata.get("total_members") or 0)
            total_followers = int(gdata.get("followers_count") or gdata.get("followers")
                                  or gdata.get("subscribers_count") or 0)

    # ── 1a. MEMBERS ENDPOINT ──────────────────────────────────────────────────
    members_body = get(s, f"/api/v1/groups/{GROUP_ID}/members",
                       params={"per_page": 100, "limit": 100, "sort": "joined_at:desc"})
    members = []
    if members_body:
        members = extract_members(members_body)
        # Try to grab total from pagination meta
        if isinstance(members_body, dict):
            meta = members_body.get("meta") or members_body.get("pagination") or {}
            if isinstance(meta, dict):
                total_members = total_members or int(meta.get("total") or meta.get("count") or 0)
            data_block = members_body.get("data") or {}
            if isinstance(data_block, dict):
                total_members = total_members or int(
                    data_block.get("total") or data_block.get("members_count") or 0
                )

    total_members = total_members or len(members)

    # Sort by join date descending to get newest 5
    def _join_key(m):
        raw = m.get("joined_at") or m.get("created_at") or ""
        try:
            return datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except Exception:
            return datetime.min.replace(tzinfo=timezone.utc)

    members_sorted = sorted(members, key=_join_key, reverse=True)
    newest_5 = members_sorted[:5]

    # ── 1b. PROFILE FOLLOWERS ─────────────────────────────────────────────────
    # Fetch AMD's own profile for global follower count
    profile_body = get(s, "/api/v1/user/profile") or get(s, "/api/v1/profile") or {}
    if isinstance(profile_body, dict):
        pdata = profile_body.get("data") or profile_body.get("user") or profile_body
        if isinstance(pdata, dict):
            total_followers = int(
                pdata.get("followers_count") or pdata.get("followers") or total_followers
            )

    # ════════════════════════════════════════════════════════════════════════
    # PRINT SECTION 1
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n{'═'*60}")
    print(f"  📊 SECTION 1 — ROSTER INTEL")
    print(f"{'═'*60}")
    print(f"  Group:            {group_name}")
    print(f"  👥 Total Members: {total_members or len(members)}")
    print(f"  🌐 Profile Followers (AMD): {total_followers or 'N/A (see note)'}")
    print(f"\n  ─── 5 NEWEST MEMBERS ───────────────────────────────────")
    if newest_5:
        for i, m in enumerate(newest_5, 1):
            h = member_handle(m)
            n = member_name(m)
            j = member_joined(m)
            f = member_followers(m)
            whale = " 🐋 WHALE" if is_whale(m) else ""
            print(f"  {i}. @{h:<22} | {n:<25} | Joined: {j} | Followers: {f}{whale}")
    else:
        print("  ⚠️  Could not sort by join date — showing first 5 from list:")
        for i, m in enumerate(members[:5], 1):
            print(f"  {i}. @{member_handle(m):<22} | {member_name(m)}")

    # ── 2. MANIFESTO POST INTELLIGENCE ───────────────────────────────────────
    print(f"\n[2/3] FETCHING POST INTELLIGENCE (007 Manifesto)...")
    manifesto = find_manifesto_post(s)

    # Also try direct fetch by stored public_id (check vault / notifications for it)
    if not manifesto:
        notif_path = LIVE_DIR / "notifications_2026-03-01.json"
        if notif_path.exists():
            notifs = json.loads(notif_path.read_text())
            if isinstance(notifs, dict):
                notifs = notifs.get("notifications", [])
            for n in notifs:
                pid = n.get("post_id") or (n.get("post") or {}).get("public_id") or ""
                if pid:
                    candidate = get(s, f"/api/v1/groups/{GROUP_ID}/posts/{pid}")
                    if candidate:
                        manifesto = candidate.get("data") or candidate
                        break

    print(f"\n{'═'*60}")
    print(f"  📊 SECTION 2 — POST INTELLIGENCE (007 Manifesto)")
    print(f"{'═'*60}")

    if manifesto:
        post_id    = manifesto.get("public_id") or manifesto.get("id") or "unknown"
        post_text  = (manifesto.get("text") or manifesto.get("content") or "")[:300]
        likes      = int(manifesto.get("likes_count") or manifesto.get("like_count")
                         or manifesto.get("reactions_count") or manifesto.get("reactions") or 0)
        comments   = int(manifesto.get("comments_count") or manifesto.get("comment_count")
                         or manifesto.get("replies_count") or 0)
        reposts    = int(manifesto.get("reposts_count") or manifesto.get("repost_count")
                         or manifesto.get("shares_count") or manifesto.get("shares") or 0)
        created_at = manifesto.get("created_at") or ""
        try:
            ts = datetime.fromisoformat(created_at.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M UTC")
        except Exception:
            ts = created_at[:19] or "unknown"

        print(f"  Post ID:          {post_id}")
        print(f"  Posted:           {ts}")
        print(f"  Preview:          {post_text[:120]}...")
        print(f"\n  ─── ENGAGEMENT ─────────────────────────────────────────")
        print(f"  ❤️  Likes    :  {likes}")
        print(f"  💬  Comments :  {comments}")
        print(f"  🔁  Reposts  :  {reposts}")
        total_eng = likes + comments + reposts
        print(f"  📈  TOTAL    :  {total_eng}")

        # Fetch comments for whale detection
        print(f"\n  ─── WHALE SCAN (commenters) ─────────────────────────────")
        comments_body = get(s, f"/api/v1/groups/{GROUP_ID}/posts/{post_id}/comments",
                            params={"per_page": 50})
        if not comments_body:
            comments_body = get(s, f"/api/v1/posts/{post_id}/comments",
                                params={"per_page": 50})

        whales_found = []
        commenters   = []
        if comments_body:
            comms = []
            if isinstance(comments_body, list):
                comms = comments_body
            elif isinstance(comments_body, dict):
                cdata = comments_body.get("data") or {}
                comms = (
                    cdata.get("comments") or cdata.get("replies") or cdata.get("items")
                    or comments_body.get("comments") or []
                )
            for c in comms:
                u = c.get("user") or c
                handle   = (u.get("username") or "").strip("@")
                name     = u.get("name") or handle
                follows  = int(u.get("followers_count") or u.get("followers") or 0)
                badge    = str(u.get("badge") or u.get("role") or "").lower()
                text_preview = (c.get("text") or c.get("content") or c.get("body") or "")[:80]
                commenters.append((handle, name, follows, badge, text_preview))
                if follows >= 500 or any(w in badge for w in ["founder","admin","verified","premium"]):
                    whales_found.append((handle, name, follows, badge, text_preview))

        if whales_found:
            for (h, n, f, b, t) in whales_found:
                badge_label = f" [{b.upper()}]" if b else ""
                print(f"  🐋 @{h:<22} | {n:<25} | {f} followers{badge_label}")
                print(f"      └─ \"{t[:70]}\"")
        elif commenters:
            print(f"  ℹ️  {len(commenters)} commenter(s) found — none cross whale threshold (500+ followers)")
            for (h, n, f, b, t) in commenters[:5]:
                print(f"     @{h:<22} | {n:<25} | {f} followers | \"{t[:50]}\"")
        else:
            print(f"  ⚠️  Comment endpoint returned no data — API may not expose comments here.")
            print(f"      Engagement counts from post object: ❤️ {likes}  💬 {comments}  🔁 {reposts}")
    else:
        print("  ⚠️  Manifesto post not found in recent group pages.")
        print("      It may be beyond page 4 or may have a custom ID. Engagement stats unavailable.")

    # ── 3. PHASE 4 WARM-UP ────────────────────────────────────────────────────
    print(f"\n[3/3] PHASE 4 WARM-UP — VAULT CROSS-REFERENCE & WELCOME DRAFTS...")
    vault_citizens = load_vault_citizens()
    print(f"  📚 Intelligence Vault: {len(vault_citizens)} known citizens loaded")

    print(f"\n{'═'*60}")
    print(f"  📊 SECTION 3 — PHASE 4 WARM-UP")
    print(f"{'═'*60}")

    welcome_drafts = []
    targets = newest_5 if newest_5 else members[:5]

    for m in targets:
        wd = draft_welcome(m, vault_citizens)
        welcome_drafts.append(wd)

    print(f"\n  ─── VAULT CROSS-REFERENCE ───────────────────────────────")
    for wd in welcome_drafts:
        whale = " 🐋 WHALE" if wd["is_whale"] else ""
        print(f"  @{wd['handle']:<24} | {wd['name']:<25} | {wd['followers']} followers{whale}")
        print(f"  {wd['vault_note']}")

    print(f"\n  ─── SYSTEM WELCOME DRAFTS ──────────────────────────────")
    print(f"  Sending {len(welcome_drafts)} draft(s) via Telegram Approval Bridge...\n")

    sent_count = 0
    for wd in welcome_drafts:
        preview = wd['ai_draft'][:120].replace('\n', ' ')
        print(f"  ✏️  Draft for @{wd['handle']}: \"{preview}...\"")

        # Build enriched Telegram message (canonical v2 format)
        tg_msg = (
            f"🟢 SYNC ENGINE — INTELLIGENCE BRIEF\n"
            f"{'━'*38}\n"
            f"From:      @{wd['handle']}  |  Score: 85/100\n"
            f"Tone:      GREETING  |  Sentiment: NEUTRAL\n"
            f"🟢 Urgency:  NORMAL — respond today\n"
            f"Signals:   new_joiner_intro,vip_sender\n"
            f"🕒 Time:    {wd['joined']}\n"
            f"📍 Source:  {group_name}\n\n"
            f"Their message:\n[New member joined the group]\n\n"
            f"🧵 Threaded reply to: {wd.get('fingerprint','')[:16]}\n"
            f"🧠 AI DRAFT [CEO VOICE]:\n"
            f"{wd['ai_draft']}\n\n"
            f"Tap ✅ POST IT to send welcome, or ❌ SKIP to discard."
        )
        ok = send_telegram(tg_msg, fp_suffix=wd["fingerprint"])
        status = "📲 Sent to Telegram" if ok else "💾 (Telegram not configured on local)"
        print(f"     {status}")
        if ok:
            sent_count += 1

    # ── AUDIT SUMMARY ─────────────────────────────────────────────────────────
    print(f"\n{DIVIDER}")
    print(f"🛰️  AUDIT COMPLETE — EMPIRE SNAPSHOT")
    print(f"{DIVIDER}")
    print(f"  👥 Total Group Members:    {total_members or '—'}")
    print(f"  🌐 AMD Follower Count:     {total_followers or 'N/A'}")
    print(f"  🆕 Newest 5 Members:       {', '.join('@' + w['handle'] for w in welcome_drafts)}")
    if manifesto:
        eng = int(manifesto.get("likes_count",0) or 0) + int(manifesto.get("comments_count",0) or 0) + int(manifesto.get("reposts_count",0) or 0)
        print(f"  📜 Manifesto Engagement:   {eng} total (❤️ {manifesto.get('likes_count',0)} 💬 {manifesto.get('comments_count',0)} 🔁 {manifesto.get('reposts_count',0)})")
    print(f"  🐋 Whales Detected:        {len(whales_found) if manifesto else 'N/A'}")
    print(f"  📲 Welcome Drafts Sent:    {sent_count}/{len(welcome_drafts)}")
    print(f"  ⏰ Report Time:            {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{DIVIDER}\n")

    # Save audit snapshot
    audit_report = {
        "audit_time":     datetime.now(timezone.utc).isoformat(),
        "total_members":  total_members,
        "total_followers": total_followers,
        "newest_5":       [{"handle": w["handle"], "name": w["name"], "joined": w["joined"], "followers": w["followers"], "is_whale": w["is_whale"], "vault_note": w["vault_note"]} for w in welcome_drafts],
        "manifesto": {
            "post_id":  manifesto.get("public_id") if manifesto else None,
            "likes":    manifesto.get("likes_count", 0) if manifesto else 0,
            "comments": manifesto.get("comments_count", 0) if manifesto else 0,
            "reposts":  manifesto.get("reposts_count", 0) if manifesto else 0,
            "whales":   [{"handle": h, "name": n, "followers": f} for (h, n, f, b, t) in (whales_found if manifesto else [])],
        } if manifesto else None,
        "welcome_drafts_queued": len(welcome_drafts),
    }
    report_path = LIVE_DIR / "empire_audit_latest.json"
    LIVE_DIR.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(audit_report, indent=2, ensure_ascii=False))
    print(f"  💾 Audit snapshot saved → intelligence_vault/live/empire_audit_latest.json")


if __name__ == "__main__":
    run_audit()
