#!/usr/bin/env python3
"""Runway API key smoke test.

Verifies that RUNWAY_API_KEY loads correctly and Runway responds to authenticated requests.
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

    api_key = os.getenv("RUNWAY_API_KEY")
    if not api_key:
        print("❌ Missing RUNWAY_API_KEY in .env")
        sys.exit(1)

    # Test Runway API (list available models/tasks)
    url = "https://api.dev.runwayml.com/v1/tasks"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    print("🔐 Runway key loaded:", _mask(api_key))
    print("🌐 Calling:", url)

    try:
        resp = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        print("❌ Network/API error:", str(e))
        sys.exit(2)

    print("✅ HTTP:", resp.status_code)
    print("Response (first 500 chars):")
    print(resp.text[:500])

    if resp.status_code == 401 or resp.status_code == 403:
        print("\n❌ Auth failed. Check RUNWAY_API_KEY.")
        sys.exit(3)

    if resp.status_code >= 400:
        print("\n❌ Request failed.")
        sys.exit(4)

    print("\n🎉 Runway API key valid and reachable.")


if __name__ == "__main__":
    main()
