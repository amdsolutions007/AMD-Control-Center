#!/usr/bin/env python3

import argparse
import json
import os
import re
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

import requests


WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOTENV_PATH = os.path.join(WORKSPACE_ROOT, ".env")
VENV_DIR = os.path.join(WORKSPACE_ROOT, ".venv")
BRAND_PROFILE_PATH = os.path.join(WORKSPACE_ROOT, "config", "brand_profile.json")


META_REQUIRED = [
    "META_ACCESS_TOKEN",
    "META_APP_ID",
    "META_APP_SECRET",
    "META_AD_ACCOUNT_ID",
]

GOOGLE_ADS_RECOMMENDED = [
    "GOOGLE_ADS_CLIENT_ID",
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_CUSTOMER_ID",
]


def _mask(value: str, keep_start: int = 6, keep_end: int = 4) -> str:
    v = (value or "").strip()
    if not v:
        return ""
    if len(v) <= keep_start + keep_end + 3:
        return v[:2] + "…" + v[-2:]
    return v[:keep_start] + "…" + v[-keep_end:]


def load_brand_profile(path: str = BRAND_PROFILE_PATH) -> Dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def parse_dotenv(path: str = DOTENV_PATH) -> Tuple[Dict[str, str], List[str]]:
    """Return (env_map, raw_lines)."""
    if not os.path.exists(path):
        return {}, []

    with open(path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()

    env: Dict[str, str] = {}
    for line in lines:
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if "=" not in s:
            continue
        key, val = s.split("=", 1)
        env[key.strip()] = val.strip()
    return env, lines


def write_dotenv_var(key: str, value: str, path: str = DOTENV_PATH) -> None:
    value = str(value).strip()
    if not value:
        return

    lines: List[str]
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            lines = f.read().splitlines()
    else:
        lines = []

    pattern = re.compile(rf"^\s*{re.escape(key)}\s*=")
    out: List[str] = []
    replaced = False
    for line in lines:
        if pattern.match(line):
            out.append(f"{key}={value}")
            replaced = True
        else:
            out.append(line)

    if not replaced:
        if out and out[-1].strip() != "":
            out.append("")
        out.append(f"{key}={value}")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out).rstrip() + "\n")


def check_venv() -> None:
    print("\n[1/5] Virtualenv")
    if os.path.isdir(VENV_DIR):
        print(f"✅ Found virtualenv: {VENV_DIR}")
        py = os.path.join(VENV_DIR, "bin", "python")
        if os.path.exists(py):
            print(f"   Python: {py}")
        return

    print("⚠️ .venv not found.")
    print("   Create it with:")
    print("   python3 -m venv .venv")
    print("   . .venv/bin/activate")
    print("   pip install -r requirements.txt")


def normalize_meta_ad_account_id(env: Dict[str, str], assume_yes: bool) -> Optional[str]:
    raw = (env.get("META_AD_ACCOUNT_ID") or "").strip()
    if not raw:
        return None
    if raw.startswith("act_"):
        return raw

    normalized = f"act_{raw}"
    if assume_yes:
        write_dotenv_var("META_AD_ACCOUNT_ID", normalized)
        os.environ["META_AD_ACCOUNT_ID"] = normalized
        print(f"✅ Normalized META_AD_ACCOUNT_ID → {normalized}")
        return normalized

    ans = input(f"Normalize META_AD_ACCOUNT_ID to '{normalized}' and save to .env? [Y/n]: ").strip().lower()
    if ans in ("", "y", "yes"):
        write_dotenv_var("META_AD_ACCOUNT_ID", normalized)
        os.environ["META_AD_ACCOUNT_ID"] = normalized
        print(f"✅ Normalized META_AD_ACCOUNT_ID → {normalized}")
        return normalized

    print("⚠️ Leaving META_AD_ACCOUNT_ID unchanged.")
    return raw


def validate_env(env: Dict[str, str]) -> Tuple[List[str], List[str]]:
    missing_required = [k for k in META_REQUIRED if not (env.get(k) or "").strip()]
    missing_recommended = [k for k in GOOGLE_ADS_RECOMMENDED if not (env.get(k) or "").strip()]
    return missing_required, missing_recommended


def graph_get(path: str, token: str, params: Optional[Dict[str, Any]] = None, timeout: int = 30) -> Dict[str, Any]:
    url = f"https://graph.facebook.com/v24.0/{path.lstrip('/')}"
    p = dict(params or {})
    p["access_token"] = token
    r = requests.get(url, params=p, timeout=timeout)
    try:
        data = r.json()
    except Exception:
        data = {"error": {"message": r.text}}
    if r.status_code >= 400 or data.get("error"):
        raise RuntimeError(json.dumps(data.get("error") or data, indent=2))
    return data


def graph_post(path: str, token: str, data: Dict[str, Any], timeout: int = 30) -> Dict[str, Any]:
    url = f"https://graph.facebook.com/v24.0/{path.lstrip('/')}"
    payload = dict(data)
    payload["access_token"] = token
    r = requests.post(url, data=payload, timeout=timeout)
    try:
        out = r.json()
    except Exception:
        out = {"error": {"message": r.text}}
    return out


def pick_page_interactive(pages: List[Dict[str, Any]], prefer_id: str, prefer_name: str) -> str:
    print("\nPages accessible by this token:")
    for i, p in enumerate(pages, 1):
        print(f"  [{i}] {p.get('name')} (ID: {p.get('id')})")

    recommended_idx = None
    for i, p in enumerate(pages, 1):
        if str(p.get("id")) == str(prefer_id):
            recommended_idx = i
            break
    if recommended_idx is None:
        for i, p in enumerate(pages, 1):
            name = str(p.get("name", "")).lower()
            if prefer_name.lower() in name:
                recommended_idx = i
                break

    prompt = f"Select page [default {recommended_idx or 1}]: "
    choice = input(prompt).strip()
    if not choice:
        choice = str(recommended_idx or 1)

    try:
        idx = int(choice)
        if 1 <= idx <= len(pages):
            return str(pages[idx - 1].get("id"))
    except Exception:
        pass

    print("⚠️ Invalid selection; defaulting to first page.")
    return str(pages[0].get("id"))


def ensure_meta_page_id(env: Dict[str, str], assume_yes: bool) -> str:
    existing = (env.get("META_PAGE_ID") or "").strip()
    if existing:
        return existing

    token = (env.get("META_ACCESS_TOKEN") or "").strip()
    if not token:
        raise RuntimeError("META_ACCESS_TOKEN is missing; cannot list pages.")

    pages_data = graph_get("me/accounts", token, params={"fields": "id,name", "limit": 100})
    pages = pages_data.get("data") or []
    pages = [p for p in pages if isinstance(p, dict) and p.get("id") and p.get("name")]
    if not pages:
        raise RuntimeError("No pages returned from /me/accounts.")

    prefer_id = "107369105309965"  # AMD Media Solutions
    prefer_name = "AMD Media Solutions"

    if assume_yes:
        selected = None
        for p in pages:
            if str(p.get("id")) == prefer_id:
                selected = prefer_id
                break
        if not selected:
            selected = str(pages[0].get("id"))
        write_dotenv_var("META_PAGE_ID", selected)
        os.environ["META_PAGE_ID"] = selected
        print(f"✅ Set META_PAGE_ID={selected} (saved to .env)")
        return selected

    selected = pick_page_interactive(pages, prefer_id=prefer_id, prefer_name=prefer_name)
    write_dotenv_var("META_PAGE_ID", selected)
    os.environ["META_PAGE_ID"] = selected
    print(f"✅ Set META_PAGE_ID={selected} (saved to .env)")
    return selected


def meta_preflight(env: Dict[str, str], brand: Dict[str, Any]) -> None:
    print("\n[4/5] Meta preflight")
    token = (env.get("META_ACCESS_TOKEN") or "").strip()
    act = (env.get("META_AD_ACCOUNT_ID") or "").strip()
    page_id = (env.get("META_PAGE_ID") or "").strip()

    try:
        me = graph_get("me", token, params={"fields": "id,name"})
        print(f"✅ Token OK for: {me.get('name')} (ID: {me.get('id')})")
    except Exception as e:
        print("❌ Token check failed:")
        print(str(e))
        return

    try:
        acct = graph_get(act, token, params={"fields": "account_id,name"})
        print(f"✅ Ad account reachable: {acct.get('name') or act}")
    except Exception as e:
        print("❌ Ad account check failed:")
        print(str(e))
        return

    # Dev-mode check (tries validate_only ad creative create). This should not spend money.
    # If validate_only is ignored and it succeeds, it may create a harmless creative.
    link = str(brand.get("primary_yt_url") or "").strip() or "https://example.com"
    brand_name = str(brand.get("brand_name") or "AMD")
    payload = {
        "name": f"__PRECHECK__{brand_name}__{int(time.time())}",
        "object_story_spec": json.dumps(
            {
                "page_id": page_id,
                "link_data": {
                    "link": link,
                    "message": "Preflight validation only.",
                    "name": "Preflight",
                    "call_to_action": {"type": "LEARN_MORE"},
                },
            }
        ),
        "validate_only": "true",
    }

    out = graph_post(f"{act}/adcreatives", token, payload)
    err = out.get("error")
    if err:
        subcode = err.get("error_subcode")
        code = err.get("code")
        if subcode == 1885183:
            print("!!! 🚨 META APP MODE BLOCKED 🚨 !!!")
            print("Error code:", code, "subcode:", subcode)
            print("Message:", err.get("message"))
            print("Action: Switch Meta App to LIVE mode (public), then mint a fresh token.")
            return

        print("⚠️ Preflight creative validation returned an error (not dev-mode):")
        print("   code:", code, "subcode:", subcode)
        print("   message:", err.get("message"))
        return

    # If no error, validation succeeded (or created harmless object)
    print("✅ Creative preflight passed (no dev-mode block detected).")


def main() -> int:
    parser = argparse.ArgumentParser(description="AMD Solutions 007 — Setup Wizard (Flight Check)")
    parser.add_argument("--assume-yes", action="store_true", help="Run non-interactively where possible")
    parser.add_argument("--meta-only", action="store_true", help="Run only Meta checks")
    args = parser.parse_args()

    brand = load_brand_profile()

    check_venv()

    print("\n[2/5] Brand profile")
    if os.path.exists(BRAND_PROFILE_PATH):
        print(f"✅ Found {BRAND_PROFILE_PATH}")
        if brand.get("brand_name"):
            print(f"   brand_name: {brand.get('brand_name')}")
        if brand.get("website"):
            print(f"   website: {brand.get('website')}")
    else:
        print(f"⚠️ Missing {BRAND_PROFILE_PATH}")

    print("\n[3/5] .env validation")
    env, _ = parse_dotenv()

    if not env:
        print(f"⚠️ No .env found at {DOTENV_PATH} or it is empty.")
        return 2

    missing_required, missing_recommended = validate_env(env)

    # Normalize ad account ID
    normalized = normalize_meta_ad_account_id(env, assume_yes=args.assume_yes)
    if normalized and normalized != env.get("META_AD_ACCOUNT_ID"):
        env["META_AD_ACCOUNT_ID"] = normalized

    # Ensure page id if missing
    try:
        page_id = ensure_meta_page_id(env, assume_yes=args.assume_yes)
        env["META_PAGE_ID"] = page_id
    except Exception as e:
        print("⚠️ META_PAGE_ID not set and could not be resolved:")
        print(str(e))

    if missing_required:
        print("❌ Missing required Meta keys:")
        for k in missing_required:
            print(f"   - {k}")
    else:
        print("✅ Meta required keys present:")
        for k in META_REQUIRED + ["META_PAGE_ID"]:
            val = (env.get(k) or "").strip()
            print(f"   - {k}={_mask(val) if 'SECRET' in k or 'TOKEN' in k else val}")

    if not args.meta_only:
        if missing_recommended:
            print("⚠️ Missing Google Ads keys (recommended for Google connector):")
            for k in missing_recommended:
                print(f"   - {k}")
        else:
            print("✅ Google Ads keys present.")

    # Meta preflight
    meta_preflight(env, brand)

    print("\n[5/5] Summary")
    print("✅ Setup wizard completed.")
    print("Next: run `python launch_meta_campaign.py --dry-run` to preview a launch safely.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
