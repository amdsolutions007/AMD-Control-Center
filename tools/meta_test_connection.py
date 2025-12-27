#!/usr/bin/env python3
"""Meta Ads connection test.

Tests connectivity to Meta Marketing API by:
- Fetching ACTIVE campaigns for an Ad Account
- Fetching spend (this month) at campaign level

Required env vars (in .env):
- META_ACCESS_TOKEN
- META_AD_ACCOUNT_ID  (either with or without leading 'act_')

Optional:
- META_GRAPH_VERSION (default v19.0)
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import requests


ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env"


def graph_version() -> str:
    return os.getenv("META_GRAPH_API_VERSION") or os.getenv("META_GRAPH_VERSION") or "v19.0"


def spend_date_preset() -> str:
    # Common presets: today, yesterday, this_month, last_7d, last_30d
    return os.getenv("META_SPEND_DATE_PRESET") or "today"


def load_env() -> None:
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


def normalize_act(ad_account_id: str) -> str:
    ad_account_id = ad_account_id.strip()
    if ad_account_id.startswith("act_"):
        return ad_account_id
    return f"act_{ad_account_id}"


def graph_get(path: str, access_token: str, params: Dict, timeout: int = 30) -> Dict:
    url = f"https://graph.facebook.com/{graph_version()}/{path.lstrip('/')}"
    full_params = {**params, "access_token": access_token}
    r = requests.get(url, params=full_params, timeout=timeout)
    try:
        payload = r.json()
    except Exception:
        payload = {"raw": r.text}

    if r.status_code != 200:
        raise SystemExit(
            f"Graph API error. HTTP {r.status_code}. URL: {url}\nResponse: {json.dumps(payload, indent=2)}"
        )
    return payload


def paginate(url: str, access_token: str) -> Iterable[Dict]:
    while url:
        r = requests.get(url, params={"access_token": access_token}, timeout=30)
        try:
            payload = r.json()
        except Exception:
            payload = {"raw": r.text}

        if r.status_code != 200:
            raise SystemExit(
                f"Graph paging error. HTTP {r.status_code}.\nResponse: {json.dumps(payload, indent=2)}"
            )

        for item in payload.get("data", []) or []:
            yield item

        url = (payload.get("paging") or {}).get("next")


def fetch_active_campaigns(access_token: str, act_id: str) -> List[Dict]:
    payload = graph_get(
        path=f"{act_id}/campaigns",
        access_token=access_token,
        params={
            "fields": "id,name,effective_status,status",
            "limit": 200,
        },
    )

    campaigns: List[Dict] = []
    campaigns.extend(payload.get("data", []) or [])

    next_url = (payload.get("paging") or {}).get("next")
    if next_url:
        campaigns.extend(list(paginate(next_url, access_token)))

    active = [c for c in campaigns if (c.get("effective_status") == "ACTIVE")]
    return active


def fetch_campaign_spend_this_month(access_token: str, act_id: str) -> List[Dict]:
    filtering = [
        {
            "field": "campaign.effective_status",
            "operator": "IN",
            "value": ["ACTIVE"],
        }
    ]

    payload = graph_get(
        path=f"{act_id}/insights",
        access_token=access_token,
        params={
            "level": "campaign",
            "date_preset": spend_date_preset(),
            "fields": "campaign_id,campaign_name,spend",
            "filtering": json.dumps(filtering),
            "limit": 200,
        },
        timeout=60,
    )

    rows: List[Dict] = []
    rows.extend(payload.get("data", []) or [])

    next_url = (payload.get("paging") or {}).get("next")
    if next_url:
        rows.extend(list(paginate(next_url, access_token)))

    return rows


def print_table(rows: List[Dict], *, header_label: str) -> None:
    if not rows:
        print("(no rows)")
        return

    name_w = min(60, max(len(str(r.get("campaign_name", ""))) for r in rows))
    print(f"{'CAMPAIGN':{name_w}}  SPEND ({header_label})")
    print("-" * (name_w + len(header_label) + 10))
    for r in rows:
        name = str(r.get("campaign_name", ""))[:name_w]
        spend = r.get("spend", "0")
        try:
            spend_f = float(spend)
        except Exception:
            spend_f = 0.0
        print(f"{name:{name_w}}  ${spend_f:,.2f}")


def main() -> None:
    load_env()

    token = require_env("META_ACCESS_TOKEN")
    act_id = normalize_act(require_env("META_AD_ACCOUNT_ID"))

    print(f"Testing Meta connection for {act_id} (Graph {graph_version()})...")

    print("\nFetching ACTIVE campaigns...")
    active = fetch_active_campaigns(token, act_id)
    print(f"Active campaigns: {len(active)}")

    print(f"\nFetching spend ({spend_date_preset()}) at campaign level...")
    spend_rows = fetch_campaign_spend_this_month(token, act_id)

    spend_by_id: Dict[str, str] = {}
    for row in spend_rows:
        cid = row.get("campaign_id")
        if cid:
            spend_by_id[str(cid)] = str(row.get("spend", "0"))

    merged_rows: List[Dict] = []
    for c in active:
        cid = str(c.get("id"))
        merged_rows.append(
            {
                "campaign_id": cid,
                "campaign_name": c.get("name", ""),
                "spend": spend_by_id.get(cid, "0"),
            }
        )

    print_table(merged_rows, header_label=spend_date_preset())


if __name__ == "__main__":
    main()
