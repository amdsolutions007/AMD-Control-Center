#!/usr/bin/env python3
"""
amd_budget_check.py — AMD AI Budget Guardian
═════════════════════════════════════════════════════════════════════
Monitors OpenAI and Gemini balances. Sends a Telegram "Low Funds"
alert to CEO if either falls below the ALERT_THRESHOLD ($1.00).

Run manually:   python3 amd_budget_check.py
Run on schedule: Add to Railway as a cron job or call from amd_sync_engine.py

Budget Law (AGENTS.md Article IV.6):
  Gemini (FREE)  — use for all text/analysis
  OpenAI (PAID)  — Onyx TTS + DALL-E 3 only
  Never call OpenAI in loops or feed generation.
"""

import os
import sys
import logging
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# ── CONFIG ────────────────────────────────────────────────────────────────────
OPENAI_API_KEY   = os.environ.get("OPENAI_API_KEY", "")
GEMINI_API_KEY   = os.environ.get("GEMINI_API_KEY", "")
TELEGRAM_TOKEN   = os.environ.get("TELEGRAM_BOT_TOKEN",
                                  "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg")
CEO_TELEGRAM_ID  = os.environ.get("CEO_TELEGRAM_ID", "8013249849")
ALERT_THRESHOLD  = float(os.environ.get("BUDGET_ALERT_THRESHOLD", "1.00"))   # USD

# ── LOGGING ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("AMD.BudgetCheck")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OPENAI BALANCE CHECK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def check_openai_balance() -> dict:
    """
    Probe OpenAI credit balance via the organization billing endpoint.

    Returns:
        {
          "provider":   "openai",
          "status":     "ok" | "low" | "zero" | "error" | "no_key",
          "balance_usd": float | None,
          "message":    str,
        }
    """
    if not OPENAI_API_KEY:
        return {
            "provider":    "openai",
            "status":      "no_key",
            "balance_usd": None,
            "message":     "OPENAI_API_KEY not configured.",
        }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type":  "application/json",
    }

    # ── Method 1: Organisation balance endpoint (post-2024) ──────────────────
    try:
        r = requests.get(
            "https://api.openai.com/v1/organization/balance",
            headers=headers,
            timeout=15,
        )
        if r.status_code == 200:
            body = r.json()
            # Response: {"object":"balance","available":[{"currency":"usd","amount":X}]}
            available = body.get("available", [])
            for item in available:
                if item.get("currency", "").lower() == "usd":
                    bal = item.get("amount", 0)
                    status = "ok" if bal >= ALERT_THRESHOLD else ("low" if bal > 0 else "zero")
                    msg = (f"${bal:.4f} USD available"
                           + (" ⚠️ LOW FUNDS — please top up." if status in ("low","zero") else " ✅"))
                    return {"provider": "openai", "status": status,
                            "balance_usd": bal, "message": msg}
    except Exception as e:
        log.debug(f"OpenAI balance endpoint failed: {e}")

    # ── Method 2: Credit grants endpoint (legacy fallback) ───────────────────
    try:
        r = requests.get(
            "https://api.openai.com/dashboard/billing/credit_grants",
            headers=headers,
            timeout=15,
        )
        if r.status_code == 200:
            body         = r.json()
            total_granted  = body.get("total_granted",  0.0)
            total_used     = body.get("total_used",     0.0)
            total_available = body.get("total_available", total_granted - total_used)
            bal    = round(float(total_available), 4)
            status = "ok" if bal >= ALERT_THRESHOLD else ("low" if bal > 0 else "zero")
            msg    = (f"${bal:.4f} USD credit balance"
                      + (" ⚠️ LOW FUNDS" if status in ("low","zero") else " ✅"))
            return {"provider": "openai", "status": status,
                    "balance_usd": bal, "message": msg}
        elif r.status_code == 401:
            return {"provider": "openai", "status": "error",
                    "balance_usd": None,
                    "message": "401 — OPENAI_API_KEY is invalid or expired."}
        elif r.status_code == 429:
            return {"provider": "openai", "status": "low",
                    "balance_usd": 0.0,
                    "message": "429 — Rate limited / quota exceeded. Balance likely zero."}
    except Exception as e:
        log.debug(f"OpenAI credit_grants endpoint failed: {e}")

    # ── Method 3: Probe via cheap list call — check for billing error ────────
    try:
        r = requests.get(
            "https://api.openai.com/v1/models",
            headers=headers,
            timeout=10,
        )
        if r.status_code == 200:
            return {"provider": "openai", "status": "ok",
                    "balance_usd": None,
                    "message": "API key valid (balance endpoint unavailable for this tier)."}
        elif r.status_code == 401:
            return {"provider": "openai", "status": "error",
                    "balance_usd": None,
                    "message": "401 — API key rejected."}
        elif r.status_code == 429:
            return {"provider": "openai", "status": "low",
                    "balance_usd": 0.0,
                    "message": "429 Quota exceeded — treat as zero balance."}
    except Exception as e:
        pass

    return {"provider": "openai", "status": "error",
            "balance_usd": None,
            "message": "Could not reach OpenAI API. Check network / key."}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GEMINI BALANCE / STATUS CHECK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def check_gemini_status() -> dict:
    """
    Probe Gemini API key validity and quota health using the google-genai SDK.

    Gemini free tier has no USD balance — quota is request-based.
    We probe by listing models via the SDK to detect key validity.

    Returns same dict shape as check_openai_balance() for uniform handling.
    """
    if not GEMINI_API_KEY:
        return {
            "provider":    "gemini",
            "status":      "no_key",
            "balance_usd": None,
            "message":     "GEMINI_API_KEY not configured.",
        }

    try:
        from google import genai as _g
        from google.genai import types as _gt
        client = _g.Client(api_key=GEMINI_API_KEY)
        # Minimal probe — use thinking_budget=0 so we get direct text (not just thinking tokens)
        result = client.models.generate_content(
            model    = "gemini-2.5-flash",
            contents = "Reply with the single word: OK",
            config   = _gt.GenerateContentConfig(
                max_output_tokens = 20,
                thinking_config   = _gt.ThinkingConfig(thinking_budget=0),
            ),
        )
        reply = (result.text or "").strip()
        if not reply and result.candidates:
            parts = (result.candidates[0].content or {}).parts or []
            reply = "".join(p.text or "" for p in parts).strip()
        return {
            "provider":    "gemini",
            "status":      "ok",
            "balance_usd": None,
            "message":     (f"API key valid ✅ | gemini-2.5-flash live | "
                            f"probe reply: '{reply[:20]}'. "
                            f"Free tier — quota-based (not USD)."),
        }
    except ImportError:
        return {
            "provider":    "gemini",
            "status":      "error",
            "balance_usd": None,
            "message":     "google-genai package not installed. Run: pip install google-genai",
        }
    except Exception as e:
        err = str(e).lower()
        if "429" in err or "quota" in err or "resource_exhausted" in err:
            return {
                "provider":    "gemini",
                "status":      "low",
                "balance_usd": 0.0,
                "message":     f"429 / Quota exhausted — free tier limit hit: {str(e)[:80]}",
            }
        elif "401" in err or "403" in err or "invalid" in err or "api_key" in err:
            return {
                "provider":    "gemini",
                "status":      "error",
                "balance_usd": None,
                "message":     f"Auth failure — GEMINI_API_KEY may be invalid: {str(e)[:80]}",
            }
        else:
            return {
                "provider":    "gemini",
                "status":      "error",
                "balance_usd": None,
                "message":     f"Gemini probe failed: {str(e)[:100]}",
            }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TELEGRAM ALERT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def send_telegram_alert(message: str) -> bool:
    """Send a plain-text alert to CEO via Telegram Bot API."""
    if not TELEGRAM_TOKEN or not CEO_TELEGRAM_ID:
        log.warning("Telegram alert skipped — token or CEO ID not configured.")
        return False
    try:
        r = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            json={"chat_id": CEO_TELEGRAM_ID, "text": message, "parse_mode": "HTML"},
            timeout=15,
        )
        if r.status_code == 200:
            log.info("📱 Telegram alert sent to CEO.")
            return True
        else:
            log.warning(f"Telegram alert failed: HTTP {r.status_code} — {r.text[:100]}")
            return False
    except Exception as e:
        log.warning(f"Telegram alert error: {e}")
        return False


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN — RUN CHECKS AND REPORT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def run_budget_check(silent: bool = False) -> dict:
    """
    Run both checks, print report, and send Telegram alert if any provider
    is LOW / ZERO / ERROR.

    Args:
        silent: If True, skip Telegram alert (useful for test runs).

    Returns:
        {"openai": {...}, "gemini": {...}, "alert_sent": bool}
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    log.info("═" * 56)
    log.info("  AMD AI Budget Check")
    log.info(f"  {now}")
    log.info("═" * 56)

    openai_result = check_openai_balance()
    gemini_result = check_gemini_status()

    # Print report
    for result in (openai_result, gemini_result):
        icon  = "✅" if result["status"] == "ok" else (
                "⚠️" if result["status"] in ("low", "no_key") else
                "🚨" if result["status"] in ("zero", "error") else "❓")
        bal   = (f"${result['balance_usd']:.4f}" if result["balance_usd"] is not None
                 else "N/A (quota-based)")
        log.info(f"  {icon}  {result['provider'].upper():8s} | "
                 f"balance: {bal:18s} | {result['message']}")

    log.info("─" * 56)

    # Determine if alert needed
    alert_statuses = {"low", "zero", "error"}
    needs_alert    = (openai_result["status"] in alert_statuses
                      or gemini_result["status"] in alert_statuses)

    alert_sent = False
    if needs_alert and not silent:
        openai_bal = (f"${openai_result['balance_usd']:.4f}"
                      if openai_result["balance_usd"] is not None
                      else "N/A")
        lines = [
            "🚨 <b>AMD AI Budget Alert</b>",
            f"📅 {now}",
            "",
            f"🤖 <b>OpenAI:</b>  {openai_result['status'].upper()} — {openai_result['message']}",
            f"🌐 <b>Gemini:</b>   {gemini_result['status'].upper()} — {gemini_result['message']}",
            "",
            "⚡ Brain is in Gemini-only fallback mode if OpenAI is low/zero.",
            "💳 Top up OpenAI at: https://platform.openai.com/settings/organization/billing",
        ]
        alert_sent = send_telegram_alert("\n".join(lines))

    if not needs_alert:
        log.info("  ✅ Both providers healthy — no alert needed.")

    log.info("═" * 56)

    return {
        "openai":      openai_result,
        "gemini":      gemini_result,
        "alert_sent":  alert_sent,
        "timestamp":   now,
    }


if __name__ == "__main__":
    silent = "--silent" in sys.argv or "--test" in sys.argv
    results = run_budget_check(silent=silent)

    # Exit code: 0 = healthy, 1 = at least one provider needs attention
    any_issue = results["openai"]["status"] not in ("ok", "no_key") or \
                results["gemini"]["status"] not in ("ok", "no_key")
    sys.exit(1 if any_issue else 0)
