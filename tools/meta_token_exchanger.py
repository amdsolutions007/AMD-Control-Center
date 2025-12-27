#!/usr/bin/env python3
"""Meta token exchanger.

Exchanges a short-lived user access token for a long-lived user access token.

Required env vars (in .env):
- META_APP_ID
- META_APP_SECRET
- META_ACCESS_TOKEN

Bonus:
- If the exchange succeeds, updates META_ACCESS_TOKEN in the local .env file.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Dict, Tuple

import requests


ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env"


def graph_version() -> str:
    return os.getenv("META_GRAPH_API_VERSION") or os.getenv("META_GRAPH_VERSION") or "v19.0"


def load_env() -> None:
    """Load .env if python-dotenv is available; otherwise rely on OS env."""
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv(ENV_PATH)
    except Exception:
        pass


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise SystemExit(f"Missing required env var: {name}")
    return value


def exchange_token(app_id: str, app_secret: str, short_token: str) -> Tuple[str, int | None, Dict]:
    # Use unversioned endpoint for token exchange (more stable in practice).
    url = "https://graph.facebook.com/oauth/access_token"
    params = {
        "grant_type": "fb_exchange_token",
        "client_id": app_id,
        "client_secret": app_secret,
        "fb_exchange_token": short_token,
    }

    last_payload: Dict | None = None
    last_status: int | None = None

    # Meta can intermittently return transient OAuthException/HTTP 5xx.
    # Retry with exponential backoff to make the tool usable in one command.
    for attempt in range(1, 6):
        # Use POST to avoid extremely long URLs when tokens are large.
        r = requests.post(url, data=params, timeout=30)
        last_status = r.status_code
        try:
            payload = r.json()
        except Exception:
            payload = {"raw": r.text}
        last_payload = payload

        if r.status_code == 200:
            break

        err = (payload or {}).get("error") or {}
        is_transient = bool(err.get("is_transient"))
        code = err.get("code")
        should_retry = is_transient or r.status_code >= 500 or code in {1, 2, 4, 17, 32, 341}

        if attempt < 5 and should_retry:
            sleep_s = min(20, 2 ** (attempt - 1))
            fbtrace = err.get("fbtrace_id")
            print(
                f"Transient error from Meta (HTTP {r.status_code}, code={code}). "
                f"Retrying in {sleep_s}s..." + (f" fbtrace_id={fbtrace}" if fbtrace else "")
            )
            time.sleep(sleep_s)
            continue

        err = (payload or {}).get("error") or {}
        if r.status_code == 400 and err.get("code") == 190:
            sub = err.get("error_subcode")
            if sub in {463, 464, 467}:
                raise SystemExit(
                    "Short-lived user token is expired or no longer valid. "
                    "Generate a fresh 1-hour User Access Token (same app + required permissions), "
                    "update META_ACCESS_TOKEN in .env, then rerun this script immediately.\n\n"
                    f"Raw error: {json.dumps(payload, indent=2)}"
                )

        raise SystemExit(
            "Token exchange failed. "
            f"HTTP {r.status_code}. Response: {json.dumps(payload, indent=2)}"
        )

    if not last_payload or last_status != 200:
        raise SystemExit(
            "Token exchange failed after retries. "
            f"HTTP {last_status}. Response: {json.dumps(last_payload or {}, indent=2)}"
        )

    long_token = last_payload.get("access_token")
    expires_in = last_payload.get("expires_in")
    if not long_token:
        raise SystemExit(
            f"Unexpected response (missing access_token): {json.dumps(last_payload, indent=2)}"
        )

    return str(long_token), int(expires_in) if expires_in is not None else None, last_payload


def update_env_var(env_path: Path, key: str, value: str) -> None:
    """Replace or append KEY=VALUE in a .env file, preserving other lines."""
    lines = []
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8", errors="replace").splitlines(True)

    new_line = f"{key}={value}\n"
    replaced = False

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith(key + "="):
            lines[i] = new_line
            replaced = True
            break

    if not replaced:
        if lines and not lines[-1].endswith("\n"):
            lines[-1] = lines[-1] + "\n"
        lines.append(new_line)

    env_path.write_text("".join(lines), encoding="utf-8")


def main() -> None:
    load_env()

    app_id = require_env("META_APP_ID")
    app_secret = require_env("META_APP_SECRET")
    short_token = require_env("META_ACCESS_TOKEN")

    print("Exchanging short-lived token for long-lived token...")
    long_token, expires_in, _payload = exchange_token(app_id, app_secret, short_token)

    print("\n================== LONG-LIVED TOKEN ==================")
    print(long_token)
    print("=====================================================\n")

    if expires_in is not None:
        print(f"Expires in (seconds): {expires_in}")

    # BONUS: update .env automatically
    try:
        update_env_var(ENV_PATH, "META_ACCESS_TOKEN", long_token)
        print(f"Updated {ENV_PATH} with new META_ACCESS_TOKEN")
    except Exception as e:
        print(f"⚠️  Could not update {ENV_PATH}: {e}")


if __name__ == "__main__":
    main()
