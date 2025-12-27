#!/usr/bin/env python3

import argparse
import json
import os
import sys
import time
from typing import Any, Dict, Iterable, Optional, Tuple

from dotenv import load_dotenv
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.ad import Ad
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.adcreative import AdCreative
from facebook_business.adobjects.adimage import AdImage
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.campaign import Campaign
from facebook_business.exceptions import FacebookRequestError


def _mask(value: str, keep_start: int = 6, keep_end: int = 4) -> str:
    v = (value or "").strip()
    if not v:
        return ""
    if len(v) <= keep_start + keep_end + 3:
        return v[:2] + "…" + v[-2:]
    return v[:keep_start] + "…" + v[-keep_end:]


def load_meta_env() -> Tuple[str, str, str, str, str]:
    """Return (access_token, ad_account_id, app_id, app_secret, page_id)."""
    load_dotenv()
    access_token = (os.getenv("META_ACCESS_TOKEN") or "").strip()
    raw_ad_account_id = (os.getenv("META_AD_ACCOUNT_ID") or "").strip()
    ad_account_id = raw_ad_account_id
    if ad_account_id and not ad_account_id.startswith("act_"):
        ad_account_id = f"act_{ad_account_id}"
    app_id = (os.getenv("META_APP_ID") or "").strip()
    app_secret = (os.getenv("META_APP_SECRET") or "").strip()
    page_id = (os.getenv("META_PAGE_ID") or "").strip()
    return access_token, ad_account_id, app_id, app_secret, page_id


def require_meta_env() -> Tuple[str, str, str, str, str]:
    access_token, ad_account_id, app_id, app_secret, page_id = load_meta_env()
    missing = []
    for k, v in [
        ("META_ACCESS_TOKEN", access_token),
        ("META_AD_ACCOUNT_ID", ad_account_id),
        ("META_APP_ID", app_id),
        ("META_APP_SECRET", app_secret),
        ("META_PAGE_ID", page_id),
    ]:
        if not v:
            missing.append(k)
    if missing:
        raise SystemExit(f"Missing required .env vars: {', '.join(missing)}")
    return access_token, ad_account_id, app_id, app_secret, page_id


def init_meta(app_id: str, app_secret: str, access_token: str) -> None:
    FacebookAdsApi.init(app_id, app_secret, access_token)


def _error_json(e: Exception) -> Dict[str, Any]:
    if isinstance(e, FacebookRequestError):
        try:
            # SDK keeps the raw response body; this is the closest to the exact JSON.
            body = e.body()
            if isinstance(body, dict):
                return body
            if isinstance(body, str):
                try:
                    return json.loads(body)
                except Exception:
                    return {"raw": body}
        except Exception:
            pass

        # Fallback structured fields
        out: Dict[str, Any] = {"message": str(e)}
        try:
            out["api_error_code"] = e.api_error_code()
            out["api_error_subcode"] = e.api_error_subcode()
            out["api_error_type"] = e.api_error_type()
            out["api_error_message"] = e.api_error_message()
            out["api_error_trace_id"] = e.api_error_trace_id()
        except Exception:
            pass
        return out

    return {"message": str(e)}


def _is_dev_mode_1885183(e: Exception) -> bool:
    if isinstance(e, FacebookRequestError):
        try:
            return e.api_error_subcode() == 1885183
        except Exception:
            pass
    msg = str(e).lower()
    return "1885183" in msg or "development mode" in msg or "in development mode" in msg


def find_campaign_by_name(ad_account_id: str, campaign_name: str) -> Campaign:
    acct = AdAccount(ad_account_id)

    candidates = []
    for c in acct.get_campaigns(
        fields=[Campaign.Field.id, Campaign.Field.name, Campaign.Field.status, "created_time"],
        params={"limit": 500},
    ):
        if str(c.get("name", "")) == campaign_name:
            candidates.append(c)

    if not candidates:
        raise RuntimeError(f"Campaign not found by name: {campaign_name}")

    # Choose most recent if multiple
    def _created_time_key(obj: Campaign) -> str:
        return str(obj.get("created_time") or "")

    candidates.sort(key=_created_time_key, reverse=True)
    return candidates[0]


def pick_adset(campaign_id: str, prefer_contains: Optional[str] = None) -> AdSet:
    camp = Campaign(campaign_id)
    adsets = list(
        camp.get_ad_sets(fields=[AdSet.Field.id, AdSet.Field.name, AdSet.Field.status], params={"limit": 200})
    )
    if not adsets:
        raise RuntimeError("No ad sets found under the campaign.")

    if prefer_contains:
        needle = prefer_contains.lower()
        for s in adsets:
            if needle in str(s.get("name", "")).lower():
                return s

    return adsets[0]


def upload_ad_image(ad_account_id: str, image_path: str) -> str:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Asset not found: {image_path}")

    img = AdImage(parent_id=ad_account_id)
    img[AdImage.Field.filename] = image_path
    img.remote_create()
    image_hash = str(img.get(AdImage.Field.hash) or "").strip()
    if not image_hash:
        raise RuntimeError("Upload succeeded but image hash was empty.")
    return image_hash


def create_draft_creative(ad_account_id: str, page_id: str, image_hash: str, link_url: str) -> AdCreative:
    creative = AdCreative(parent_id=ad_account_id)

    payload: Dict[str, Any] = {
        AdCreative.Field.name: f"DEBUG Creative (Draft) {int(time.time())}",
        AdCreative.Field.object_story_spec: {
            "page_id": page_id,
            "link_data": {
                "image_hash": image_hash,
                "link": link_url,
                "message": "DEBUG: Creative upload test (draft/paused).",
                "name": "DEBUG: Draft Creative",
                "call_to_action": {"type": "LEARN_MORE"},
            },
        },
    }

    # Attempt to set status=PAUSED if supported; ignore locally if not.
    try:
        status_field = getattr(AdCreative.Field, "status")
        payload[status_field] = "PAUSED"
    except Exception:
        # Graph may ignore/deny this field for creatives; we still proceed.
        payload["status"] = "PAUSED"

    creative.update(payload)
    creative.remote_create()
    return creative


def attach_creative_to_adset(ad_account_id: str, adset_id: str, creative_id: str) -> Ad:
    ad = Ad(parent_id=ad_account_id)
    ad.update(
        {
            Ad.Field.name: f"DEBUG Ad (PAUSED) {int(time.time())}",
            Ad.Field.adset_id: adset_id,
            Ad.Field.creative: {"creative_id": creative_id},
            Ad.Field.status: "PAUSED",
        }
    )
    ad.remote_create()
    return ad


def main() -> int:
    parser = argparse.ArgumentParser(description="Diagnostic: creative upload + exact error JSON")
    parser.add_argument(
        "--campaign-name",
        default="AMD Solutions 007_Holiday_Blitz_Automated",
        help="Exact campaign name to find",
    )
    parser.add_argument(
        "--asset",
        default=os.path.join("assets", "angry_husband.jpg"),
        help="Path to image asset to upload",
    )
    parser.add_argument(
        "--link",
        default="",
        help="Link URL to use in the creative (defaults to brand_profile or existing LINK_URL fallback)",
    )
    parser.add_argument(
        "--prefer-adset",
        default="Diaspora",
        help="Substring to pick the ad set under the campaign",
    )
    args = parser.parse_args()

    access_token, ad_account_id, app_id, app_secret, page_id = require_meta_env()
    init_meta(app_id, app_secret, access_token)

    print("--- DEBUG CREATIVE UPLOAD ---")
    print("Ad Account:", ad_account_id)
    print("Page ID:", page_id)
    print("Token:", _mask(access_token))

    # Find campaign + ad set
    print("\n[1/3] Find existing campaign")
    try:
        campaign = find_campaign_by_name(ad_account_id, args.campaign_name)
        campaign_id = str(campaign.get("id"))
        print("✅ Found Campaign:", campaign.get("name"), "(ID:", campaign_id + ")")
    except Exception as e:
        print("❌ Failed to find campaign")
        print(json.dumps(_error_json(e), indent=2))
        return 2

    print("\n[2/3] Pick an ad set")
    try:
        adset = pick_adset(campaign_id, prefer_contains=args.prefer_adset)
        adset_id = str(adset.get("id"))
        print("✅ Using Ad Set:", adset.get("name"), "(ID:", adset_id + ")")
    except Exception as e:
        print("❌ Failed to pick ad set")
        print(json.dumps(_error_json(e), indent=2))
        return 2

    # Step A: upload image
    print("\n[A] Upload image to AdImage library")
    try:
        image_hash = upload_ad_image(ad_account_id, args.asset)
        print("✅ Image uploaded")
        print("   asset:", args.asset)
        print("   image_hash:", image_hash)
    except Exception as e:
        print("❌ Image upload failed")
        print(json.dumps(_error_json(e), indent=2))
        return 2

    # Link: use explicit arg if provided; else default to brand_profile primary_yt_url; else keep an example
    link_url = (args.link or "").strip()
    if not link_url:
        try:
            brand_path = os.path.join(os.path.dirname(__file__), "config", "brand_profile.json")
            with open(brand_path, "r", encoding="utf-8") as f:
                brand = json.load(f) if os.path.exists(brand_path) else {}
            link_url = str((brand or {}).get("primary_yt_url") or "").strip()
        except Exception:
            link_url = ""
    if not link_url:
        link_url = "https://example.com"

    # Step B: create creative
    print("\n[B] Create Draft AdCreative using image_hash")
    try:
        creative = create_draft_creative(ad_account_id, page_id, image_hash, link_url)
        creative_id = str(creative.get("id"))
        print("✅ Creative created")
        print("   creative_id:", creative_id)
    except Exception as e:
        print("❌ Creative creation failed")
        print(json.dumps(_error_json(e), indent=2))
        if _is_dev_mode_1885183(e):
            print("NOTE: Detected dev-mode block (1885183).")
            print("      This confirms image upload may work even when creative creation is blocked.")
        return 2

    # Step C: attach by creating a PAUSED ad in the existing ad set
    print("\n[C] Attach creative to ad set (create PAUSED Ad)")
    try:
        ad = attach_creative_to_adset(ad_account_id, adset_id, creative_id)
        print("✅ Ad created (PAUSED)")
        print("   ad_id:", ad.get("id"))
    except Exception as e:
        print("❌ Ad creation failed")
        print(json.dumps(_error_json(e), indent=2))
        if _is_dev_mode_1885183(e):
            print("NOTE: Detected dev-mode block (1885183).")
        return 2

    print("\n--- DONE ---")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
