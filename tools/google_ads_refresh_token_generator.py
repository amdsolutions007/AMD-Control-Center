#!/usr/bin/env python3
"""Generate a Google Ads OAuth refresh token and save it to .env.

This project expects Google Ads credentials via env vars:
- GOOGLE_ADS_CLIENT_ID
- GOOGLE_ADS_CLIENT_SECRET
- GOOGLE_ADS_REFRESH_TOKEN

This script performs an interactive OAuth flow using client_secret.json
and requests the Google Ads scope (https://www.googleapis.com/auth/adwords).

It then updates the local .env file with GOOGLE_ADS_REFRESH_TOKEN.

Notes:
- Requires: google-auth-oauthlib
- You'll be prompted to authenticate in a browser.
"""

from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env"
CLIENT_SECRET_PATH = ROOT / "client_secret.json"
SCOPES = ["https://www.googleapis.com/auth/adwords"]


def update_env_var(env_path: Path, key: str, value: str) -> None:
    lines: list[str] = []
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


def mask(token: str, show: int = 6) -> str:
    if len(token) <= show:
        return "*" * len(token)
    return "*" * (len(token) - show) + token[-show:]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Don't try to open a browser automatically (prints URL instead).",
    )
    args = parser.parse_args()

    if not CLIENT_SECRET_PATH.exists():
        raise SystemExit(f"Missing {CLIENT_SECRET_PATH}. Download OAuth client JSON and place it there.")

    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except Exception as e:
        raise SystemExit(
            "Missing dependency: google-auth-oauthlib. Install with: pip install google-auth-oauthlib\n"
            f"Original error: {e}"
        )

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET_PATH), scopes=SCOPES)

    # Local-server flow (recommended for desktop dev).
    # open_browser=False prints URL to terminal.
    creds = flow.run_local_server(open_browser=(not args.no_browser), port=0)

    if not getattr(creds, "refresh_token", None):
        raise SystemExit(
            "OAuth completed but no refresh_token was returned.\n"
            "This usually happens if the account already granted consent previously.\n\n"
            "Fix: revoke the app's access (Google Account -> Security -> Third-party access), then rerun."
        )

    update_env_var(ENV_PATH, "GOOGLE_ADS_REFRESH_TOKEN", creds.refresh_token)

    # Do not print secrets in full.
    print("Saved GOOGLE_ADS_REFRESH_TOKEN to .env.")
    print(f"Refresh token (masked): {mask(creds.refresh_token)}")


if __name__ == "__main__":
    main()
