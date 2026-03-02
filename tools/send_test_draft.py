"""Send a test draft approval prompt to CEO Telegram to prove the one-tap bridge works."""
import json, hashlib, requests, os
from datetime import datetime, timezone
from pathlib import Path

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg")
CEO_ID         = os.getenv("CEO_TELEGRAM_ID", "8013249849")
VAULT_LIVE     = Path(__file__).parent.parent / "intelligence_vault" / "live"
DRAFTS_FILE    = VAULT_LIVE / "ai_reply_drafts.json"

# ── Create a realistic test draft ────────────────────────────────────────────
test_fp    = hashlib.md5(b"test_draft_ceo_telegram_bridge_2026-03-02").hexdigest()
test_draft = {
    "status":        "PENDING",
    "author":        "@charlie_pyper",
    "their_message": "Excited to see AMD Solutions 007 growing in our ecosystem! "
                     "How are you using LekeeLekee for your clients?",
    "ai_draft":      "Charlie — you've built remarkable infrastructure here. "
                     "AMD is actively using LekeeLekee as the primary distribution layer "
                     "for our Signal Beacon feed. Let's align on deeper integration — "
                     "our audience and yours overlap precisely. 🌍 #AfricanTech",
    "score":         76,
    "reasons":       ["vip_sender", "topic_match:tech,ecosystem", "contains_question"],
    "generated_at":  datetime.now(timezone.utc).isoformat(),
    "fingerprint":   test_fp,
}

# Write to vault (as sync engine would)
VAULT_LIVE.mkdir(parents=True, exist_ok=True)
existing = []
if DRAFTS_FILE.exists():
    try:
        with open(DRAFTS_FILE) as f:
            existing = json.load(f).get("drafts", [])
    except Exception:
        pass

existing = [d for d in existing if d.get("fingerprint") != test_fp]
existing.append(test_draft)
with open(DRAFTS_FILE, "w") as f:
    json.dump({"drafts": existing, "last_updated": datetime.now(timezone.utc).isoformat()}, f, indent=2)
print(f"✅ Test draft written → fingerprint: {test_fp[:8]}...")

# ── Send Telegram approval prompt ─────────────────────────────────────────────
fp_short = test_fp[:32]
message = (
    "💬 SYNC ENGINE — DRAFT REPLY\n"
    "━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    "From: @charlie_pyper  |  Score: 76/100\n"
    "Signals: vip_sender, topic_match, question\n\n"
    "Their message:\n"
    "Excited to see AMD Solutions 007 growing in our ecosystem! "
    "How are you using LekeeLekee for your clients?\n\n"
    "AI Draft (CEO Voice):\n"
    "Charlie, you've built remarkable infrastructure here. "
    "AMD is actively using LekeeLekee as the primary distribution layer "
    "for our Signal Beacon feed. Let's align on deeper integration — "
    "our audiences overlap precisely. #AfricanTech\n\n"
    "Tap YES to post this reply live, or SKIP to discard.\n\n"
    "TEST SEND — One-Tap Bridge is live. Awaiting your tap."
)
payload = {
    "chat_id":    CEO_ID,
    "text":       message,
    "reply_markup": json.dumps({
        "inline_keyboard": [[
            {"text": "✅ POST IT",  "callback_data": f"dreply_approve_{fp_short}"},
            {"text": "❌ SKIP",     "callback_data": f"dreply_skip_{fp_short}"},
        ]]
    }),
}
r = requests.post(
    f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
    json=payload, timeout=15
)
body = r.json()
if body.get("ok"):
    msg_id = body["result"]["message_id"]
    print(f"📱 Message sent to CEO → message_id: {msg_id}")
    print("   ✅ POST IT  → dreply_approve_{fp[:8]}...")
    print("   ❌ SKIP      → dreply_skip_{fp[:8]}...")
    print()
    print("When telegram-approval-bot is running and CEO taps ✅:")
    print("  → button_callback Branch A fires")
    print("  → _publish_draft_reply() → lekee_post_group(session, ai_draft)")
    print("  → Post goes LIVE on LekeeLekee African Tech Ecosystem group")
else:
    print(f"❌ Telegram API error: {body.get('description', body)}")
