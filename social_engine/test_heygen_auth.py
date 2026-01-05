#!/usr/bin/env python3
"""HeyGen API key smoke test.

This verifies that `HEYGEN_API_KEY` is being loaded correctly from `.env` and that
HeyGen responds to an authenticated request.

Safety:
- Never prints the raw API key.
- Fails fast with actionable messages.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv


def _mask(value: str, keep: int = 4) -> str:
    if not value:
        return "<empty>"
    if len(value) <= keep:
        return "*" * len(value)
    return "*" * (len(value) - keep) + value[-keep:]


def main() -> None:
    social_engine_dir = Path(__file__).resolve().parent
    load_dotenv(dotenv_path=social_engine_dir / ".env")

    api_key = os.getenv("HEYGEN_API_KEY") or os.getenv("HEYGEN_KEY")
    if not api_key:
        print("❌ Missing HEYGEN_API_KEY.")
        print("   Add it to `social_engine/.env` (see `social_engine/.env.example`).")
        sys.exit(1)

    # NOTE: HeyGen's exact endpoints can vary by account/version.
    # We try a minimal authenticated request and report status.
    headers = {
        "X-Api-Key": api_key,
        "Accept": "application/json",
    }

    # Common base used by HeyGen docs historically.
    url = "https://api.heygen.com/v1/user"

    print("🔐 HeyGen key loaded:", _mask(api_key))
    print("🌐 Calling:", url)

    try:
        resp = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        print("❌ Network/API error:", str(e))
        sys.exit(2)

    print("✅ HTTP:", resp.status_code)
    # Print a small snippet to help debugging without dumping everything.
    body = resp.text
    print("Response (first 400 chars):")
    print(body[:400])

    if resp.status_code == 401 or resp.status_code == 403:
        print("\n❌ Auth failed. Double-check:")
        print("   - HEYGEN_API_KEY is correct")
        print("   - Your plan/trial has API access enabled")
        sys.exit(3)

    if resp.status_code >= 400:
        print("\n❌ Request failed. Check the response above for details.")
        sys.exit(4)

    print("\n🎉 HeyGen API key looks valid and reachable.")


if __name__ == "__main__":
    main()
