#!/usr/bin/env python3
"""
Drop the "Hard Truth" caption to #General RIGHT NOW.

Usage:
  python3 tools/hard_truth_general_post.py            # Send to #General
  python3 tools/hard_truth_general_post.py --preview  # Preview only
"""
import argparse
import base64
import os
import requests

EMAIL    = "ceo@amdsolutions007.com"
PASSWORD = "#@Amdmail@007"
BASE_URL = "https://www.lekeelekee.com/api/v1"
STATIC_IV = "MDAwMDAwMDAwMDAwMDAwMA=="

GENERAL_CONV_ID = "019c12b7-0ef5-73c5-92ca-1e5609f5f5bf"

TG_TOKEN  = os.getenv("TELEGRAM_BOT_TOKEN", "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg")
CEO_TG_ID = os.getenv("CEO_TELEGRAM_ID",   "8013249849")

# ── The Caption ────────────────────────────────────────────────────────────────
CAPTION = """\
Hard question for a Tuesday:

If you stopped working tomorrow, would your startup still make money?

If the answer is NO — you have a job, not a business. You have a salary, not a system.

The people who own the African tech wave aren't working harder. They're building systems that work while they sleep.

I drop daily blueprints right here in #General. Systems. Automation. Leverage.

Reply with one word 👇 — your biggest bottleneck right now.

Follow @amd for the daily Architect Brief.

— Olawale | AMD Solutions 007 🛰️🌍"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    args = ap.parse_args()

    print("─" * 60)
    print("📢 HARD TRUTH — #General Post")
    print("─" * 60)
    print(CAPTION)
    print("─" * 60)

    if args.preview:
        print("✅ Preview only. Add --confirm to send.")
        return

    # Auth
    s = requests.Session()
    r = s.post(f"{BASE_URL}/auth/login", data={"email": EMAIL, "password": PASSWORD}, timeout=20)
    r.raise_for_status()
    token = r.json()["data"]["token"]
    s.headers["Authorization"] = f"Bearer {token}"
    print("✅ Auth OK")

    # Send to #General
    payload = {
        "ciphertext": base64.b64encode(CAPTION.encode()).decode(),
        "iv":         STATIC_IV,
    }
    r2 = s.post(f"{BASE_URL}/conversations/{GENERAL_CONV_ID}/messages", json=payload, timeout=20)
    if r2.status_code in (200, 201):
        print("✅ Posted to #General!")
        # Notify CEO
        try:
            requests.post(
                f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
                json={
                    "chat_id": CEO_TG_ID,
                    "text": "📢 Hard Truth posted to #General on LekeeLekee ✅\n\nStarting the Watch-Up Strike DM blast next.",
                },
                timeout=10,
            )
        except Exception:
            pass
    else:
        print(f"❌ Failed: {r2.status_code} — {r2.text[:200]}")


if __name__ == "__main__":
    main()
