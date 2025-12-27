import argparse
import json
import os
import sys
from datetime import datetime, time, timedelta, timezone
from urllib.parse import urlparse

from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.adimage import AdImage
from facebook_business.adobjects.adcreative import AdCreative
from facebook_business.adobjects.ad import Ad
from facebook_business.adobjects.targetingsearch import TargetingSearch
from facebook_business.exceptions import FacebookRequestError
from dotenv import load_dotenv


BRAND_PROFILE_PATH = os.path.join(os.path.dirname(__file__), "config", "brand_profile.json")

def load_brand_profile() -> dict:
    try:
        with open(BRAND_PROFILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _s(val: object) -> str:
    return str(val).strip() if val is not None else ""


def _infer_email(website: str, email_user: str) -> str:
    website = _s(website)
    email_user = _s(email_user)
    if not website or not email_user:
        return ""
    try:
        parsed = urlparse(website)
        host = (parsed.netloc or parsed.path or "").strip()
        host = host.split("/")[0]
        if host.startswith("www."):
            host = host[4:]
        if not host or "." not in host:
            return ""
        return f"{email_user}@{host}"
    except Exception:
        return ""


def build_brand_copy(brand: dict, link_url: str, fallback_headline: str, fallback_message: str) -> tuple[str, str]:
    """Return (headline, message) derived from brand profile.

    Rules:
    - If slogan is present, use it in headline or primary text.
    - JSON overrides take precedence, but slogan will still be injected if missing.
    """

    slogan = _s(brand.get("slogan"))
    brand_name = _s(brand.get("brand_name"))
    ceo_name = _s(brand.get("ceo_name"))
    location = _s(brand.get("location"))
    phone = _s(brand.get("official_phone"))
    website = _s(brand.get("website"))
    email_user = _s(brand.get("email_user"))
    inferred_email = _infer_email(website, email_user)

    headline = _s(brand.get("ad_headline")) or (slogan or fallback_headline)
    message = _s(brand.get("ad_message"))
    if not message:
        lines: list[str] = []
        if brand_name and slogan:
            lines.append(f"{brand_name} — {slogan}")
        elif brand_name:
            lines.append(brand_name)
        elif slogan:
            lines.append(slogan)

        # Core CTA
        if link_url:
            lines.append("")
            lines.append(f"Watch now: {link_url}")

        # Trust/identity footer
        footer: list[str] = []
        if ceo_name:
            footer.append(f"CEO: {ceo_name}")
        if location:
            footer.append(location)
        contact_bits: list[str] = []
        if phone:
            contact_bits.append(phone)
        if inferred_email:
            contact_bits.append(inferred_email)
        if website:
            contact_bits.append(website)
        if contact_bits:
            footer.append("Contact: " + " | ".join(contact_bits))

        if footer:
            lines.append("")
            lines.extend(footer)

        message = "\n".join([ln for ln in lines if ln is not None])
        message = message.strip() or fallback_message

    # Enforce slogan presence in either headline or primary text
    if slogan:
        if slogan.lower() not in headline.lower() and slogan.lower() not in message.lower():
            message = (message.rstrip() + f"\n\n{slogan}").strip()

    return headline, message


def compute_adset_start_time() -> str:
    """Return an ISO-8601 UTC start_time that is never in the past.

    Rule:
    - Today at 12:00 PM local time OR 1 hour in the future, whichever is later.
    """

    now_local = datetime.now().astimezone()  # local tz-aware
    today_noon_local = datetime.combine(now_local.date(), time(12, 0), tzinfo=now_local.tzinfo)
    one_hour_future_local = now_local + timedelta(hours=1)
    chosen_local = max(today_noon_local, one_hour_future_local)

    chosen_utc = chosen_local.astimezone(timezone.utc)
    # Facebook APIs accept ISO-8601. Use a Z suffix.
    return chosen_utc.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _is_dev_mode_error(err: Exception) -> bool:
    """Detect Meta dev-mode creative block (error_subcode=1885183)."""
    if isinstance(err, FacebookRequestError):
        try:
            if getattr(err, "api_error_subcode", None) and err.api_error_subcode() == 1885183:
                return True
        except Exception:
            pass

    msg = str(err).lower()
    return ("1885183" in msg) or ("development mode" in msg) or ("in development mode" in msg)


def load_meta_env() -> tuple[str, str, str, str, str]:
    """Return (access_token, ad_account_id, app_id, app_secret, page_id)."""
    load_dotenv()
    access_token = os.getenv('META_ACCESS_TOKEN')
    raw_ad_account_id = (os.getenv('META_AD_ACCOUNT_ID') or '').strip()  # e.g., 'act_123' or '123'
    ad_account_id = raw_ad_account_id
    if ad_account_id and not ad_account_id.startswith('act_'):
        ad_account_id = f"act_{ad_account_id}"
    app_id = os.getenv('META_APP_ID')
    app_secret = os.getenv('META_APP_SECRET')
    page_id = (os.getenv('META_PAGE_ID') or '').strip()
    return (access_token or ''), (ad_account_id or ''), (app_id or ''), (app_secret or ''), (page_id or '')


def require_meta_env() -> tuple[str, str, str, str, str]:
    access_token, ad_account_id, app_id, app_secret, page_id = load_meta_env()
    missing = []
    for key, val in [
        ("META_ACCESS_TOKEN", access_token.strip()),
        ("META_AD_ACCOUNT_ID", ad_account_id.strip()),
        ("META_APP_ID", app_id.strip()),
        ("META_APP_SECRET", app_secret.strip()),
        ("META_PAGE_ID", page_id.strip()),
    ]:
        if not val:
            missing.append(key)
    if missing:
        raise RuntimeError(f"Missing required .env variables: {', '.join(missing)}")
    return access_token, ad_account_id, app_id, app_secret, page_id


def ensure_meta_page_id() -> str:
    """Hard-lock: require META_PAGE_ID from .env and do not auto-detect or overwrite."""
    global META_PAGE_ID
    if META_PAGE_ID:
        return META_PAGE_ID
    raise RuntimeError("META_PAGE_ID is required in .env (hard-locked mode).")


def init_meta_api(access_token: str, ad_account_id: str, app_id: str, app_secret: str, page_id: str) -> None:
    global ACCESS_TOKEN, AD_ACCOUNT_ID, APP_ID, APP_SECRET, META_PAGE_ID
    ACCESS_TOKEN = access_token
    AD_ACCOUNT_ID = ad_account_id
    APP_ID = app_id
    APP_SECRET = app_secret
    META_PAGE_ID = page_id
    FacebookAdsApi.init(APP_ID, APP_SECRET, ACCESS_TOKEN)


# 2. CAMPAIGN CONFIGURATION (defaults; can be overridden via brand profile)
CAMPAIGN_NAME = "ILE_OKO_Holiday_Blitz_Automated"
DAILY_BUDGET_PER_SET = 1000000  # 10,000 Naira (in kobo/cents)
LINK_URL = "https://youtu.be/5rTr3K4CJNI?si=P7pQTfUO2sup4YvP"  # fallback
HEADLINE = "Dirty Wife vs Slay Queen: Who is Wrong?"
MESSAGE = "The Full Truth is Out! Is a 'Dirty Home' a valid excuse for a man to cheat? Watch ILE OKO now."

# 3. TARGETING CONFIGURATION
GEO_NIGERIA = {'geo_locations': {'countries': ['NG']}}

def build_targeting_diaspora():
    """Build a Nigeria + Yoruba-interest targeting spec.

    Interest IDs can change/be invalid across accounts/regions; resolve dynamically.
    Falls back to age+geo only if interest lookup fails.
    """

    base = {
        'geo_locations': {'countries': ['NG']},
        'age_min': 25,
        'age_max': 55,
    }

    keywords = ["Nollywood", "Yoruba language", "Africa Magic", "Funke Akindele"]
    interests = []
    for kw in keywords:
        try:
            results = TargetingSearch.search(params={'q': kw, 'type': 'adinterest'}, fields=['id', 'name'])
            if results:
                top = results[0]
                iid = str(top.get('id', '')).strip()
                name = str(top.get('name', kw)).strip() or kw
                if iid:
                    interests.append({'id': iid, 'name': name})
        except Exception:
            continue

    if interests:
        base['flexible_spec'] = [{'interests': interests}]
        print("✅ Resolved interest targeting:", ", ".join([i.get('name', '') for i in interests]))
    else:
        print("⚠️ Could not resolve interest IDs; using broad diaspora targeting (geo+age only).")

    return base

TARGETING_BROAD = {
    'geo_locations': {'countries': ['NG']},
    'age_min': 20,
    'age_max': 60,
    # No interest filter - Let the "Angry Husband" image find the audience
}

def upload_image(image_path):
    """Uploads an image to the Ad Library and returns the Hash"""
    if not os.path.exists(image_path):
        print(f"⚠️ Image not found: {image_path}")
        return None
    image = AdImage(parent_id=AD_ACCOUNT_ID)
    image[AdImage.Field.filename] = image_path
    image.remote_create()
    return image[AdImage.Field.hash]

def create_campaign():
    """Step 1: Create the Container Campaign"""
    campaign = Campaign(parent_id=AD_ACCOUNT_ID)
    campaign.update({
        Campaign.Field.name: CAMPAIGN_NAME,
        Campaign.Field.objective: 'OUTCOME_TRAFFIC',
        Campaign.Field.status: 'PAUSED', # Safety: Create as PAUSED first
        Campaign.Field.special_ad_categories: [],
        # Required by newer API versions when not using campaign budget (CBO)
        'is_adset_budget_sharing_enabled': False,
    })
    campaign.remote_create()
    print(f"✅ Campaign Created: {campaign[Campaign.Field.name]} (ID: {campaign[Campaign.Field.id]})")
    return campaign

def create_ad_set(campaign_id, name, targeting, start_time: str):
    """Step 2: Create the Ad Set (Audience & Budget)"""
    if isinstance(targeting, dict) and "targeting_automation" not in targeting:
        # Required by newer API versions: explicitly enable(1)/disable(0) Advantage Audience.
        targeting = dict(targeting)
        targeting["targeting_automation"] = {"advantage_audience": 0}

    adset = AdSet(parent_id=AD_ACCOUNT_ID)
    adset.update({
        AdSet.Field.name: name,
        AdSet.Field.campaign_id: campaign_id,
        AdSet.Field.daily_budget: DAILY_BUDGET_PER_SET,
        AdSet.Field.billing_event: 'IMPRESSIONS',
        AdSet.Field.optimization_goal: 'LANDING_PAGE_VIEWS',
        AdSet.Field.bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        AdSet.Field.targeting: targeting,
        # Timing correction: never past; computed dynamically each run
        AdSet.Field.start_time: start_time,
        # Safety default: keep paused until manually reviewed/activated
        AdSet.Field.status: 'PAUSED',
    })
    adset.remote_create()
    print(f"  🔹 Ad Set Created: {name}")
    return adset

def create_ad(adset_id, image_hash, ad_name):
    """Step 3: Create the Ad (Creative + Link)"""
    if not image_hash:
        print(f"    ⚠️ Skipping ad '{ad_name}' (missing image hash).")
        return None

    # Create Creative Object
    creative = AdCreative(parent_id=AD_ACCOUNT_ID)
    creative.update({
        AdCreative.Field.name: f"Creative - {ad_name}",
        AdCreative.Field.object_story_spec: {
            'page_id': META_PAGE_ID,
            'link_data': {
                'image_hash': image_hash,
                'link': LINK_URL,
                'message': MESSAGE,
                'name': HEADLINE,
                'call_to_action': {'type': 'WATCH_MORE'}
            }
        }
    })
    try:
        creative.remote_create()
    except FacebookRequestError as e:
        if _is_dev_mode_error(e):
            print(f"    ❌ Creative Failed (Dev Mode): {ad_name}")
            return None
        raise
    
    # Connect Creative to Ad
    ad = Ad(parent_id=AD_ACCOUNT_ID)
    ad.update({
        Ad.Field.name: ad_name,
        Ad.Field.adset_id: adset_id,
        Ad.Field.creative: {'creative_id': creative[AdCreative.Field.id]},
        # Safety default: keep paused until manually reviewed/activated
        Ad.Field.status: 'PAUSED',
    })
    try:
        ad.remote_create()
        print(f"    ✅ Ad Created (PAUSED): {ad_name}")
        return ad
    except FacebookRequestError as e:
        if _is_dev_mode_error(e):
            print(f"    ❌ Ad Failed (Dev Mode): {ad_name}")
            return None
        raise

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="AMD Meta Campaign Launcher")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be created; do not call Meta APIs")
    args = parser.parse_args()

    brand = load_brand_profile()
    if brand:
        # Goal: changing JSON should change strategy without code edits.
        LINK_URL = _s(brand.get("primary_yt_url")) or LINK_URL

        brand_name = _s(brand.get("brand_name"))
        explicit_campaign = _s(brand.get("campaign_name"))
        if explicit_campaign:
            CAMPAIGN_NAME = explicit_campaign
        elif brand_name:
            CAMPAIGN_NAME = f"{brand_name}_Holiday_Blitz_Automated"

        try:
            budget_override = brand.get("daily_budget_per_set")
            if budget_override is not None:
                DAILY_BUDGET_PER_SET = int(budget_override)
        except Exception:
            pass

        HEADLINE, MESSAGE = build_brand_copy(
            brand=brand,
            link_url=LINK_URL,
            fallback_headline=HEADLINE,
            fallback_message=MESSAGE,
        )

    print("--- 🟢 INITIATING AMD META LAUNCH PROTOCOL ---")

    start_time = compute_adset_start_time()

    if args.dry_run:
        # No API calls; just show intent.
        _, ad_account_id, _, _, page_id = load_meta_env()
        print("--- DRY RUN (no API calls) ---")
        print("Ad Account:", ad_account_id or "(missing)")
        print("Page ID:", page_id or "(missing)")
        print("Campaign Name:", CAMPAIGN_NAME)
        print("Daily Budget per Ad Set:", DAILY_BUDGET_PER_SET)
        print("Ad Set start_time (UTC):", start_time)
        print("Link URL:", LINK_URL)
        print("Headline:", HEADLINE)
        print("Primary Text:", MESSAGE)
        print("Creative Files:")
        print(" - assets/poster.jpg")
        print(" - assets/angry_husband.jpg")
        print(" - assets/slay_queen.jpg")
        print("Ad Sets:")
        print(" - AdSet A - Diaspora (Yoruba Interest)")
        print(" - AdSet B - Broad Nigeria (Visual Hook)")
        print("Ads (all PAUSED by default):")
        print(" - Ad 1 - Poster")
        print(" - Ad 2 - Angry Husband")
        print(" - Ad 3 - Slay Queen")
        print(" - Ad 1 - Poster (Broad)")
        print(" - Ad 2 - Angry Husband (Broad)")
        print(" - Ad 3 - Slay Queen (Broad)")
        print("--- END DRY RUN ---")
        sys.exit(0)

    try:
        access_token, ad_account_id, app_id, app_secret, page_id = require_meta_env()
        init_meta_api(access_token, ad_account_id, app_id, app_secret, page_id)
        ensure_meta_page_id()
    except Exception as e:
        print(f"❌ Environment error: {e}")
        sys.exit(1)
    
    # 1. Create Campaign (PAUSED)
    campaign = create_campaign()

    # 2. Create Ad Sets (PAUSED) with safe start_time
    diaspora_targeting = build_targeting_diaspora()
    adset_a = create_ad_set(campaign['id'], "AdSet A - Diaspora (Yoruba Interest)", diaspora_targeting, start_time=start_time)
    adset_b = create_ad_set(campaign['id'], "AdSet B - Broad Nigeria (Visual Hook)", TARGETING_BROAD, start_time=start_time)

    # 3. Upload 3-prong assets (best-effort; do not abort if missing)
    image_paths = {
        "Poster": "assets/poster.jpg",
        "Angry Husband": "assets/angry_husband.jpg",
        "Slay Queen": "assets/slay_queen.jpg",
    }
    hashes: dict[str, str | None] = {}
    for key, path in image_paths.items():
        try:
            hashes[key] = upload_image(path)
        except FacebookRequestError as e:
            if _is_dev_mode_error(e):
                print(f"❌ Image upload failed (Dev Mode?): {path}")
                hashes[key] = None
            else:
                raise

    # 4. Attempt to create 3 ads per ad set (PAUSED). Dev-mode failures must NOT stop execution.
    # Ad Set A
    for label, key in [("Ad 1 - Poster", "Poster"), ("Ad 2 - Angry Husband", "Angry Husband"), ("Ad 3 - Slay Queen", "Slay Queen")]:
        try:
            create_ad(adset_a['id'], hashes.get(key), label)
        except FacebookRequestError as e:
            if _is_dev_mode_error(e):
                print(f"    ❌ Creative Failed (Dev Mode): {label}")
                continue
            raise

    # Ad Set B
    for label, key in [("Ad 1 - Poster (Broad)", "Poster"), ("Ad 2 - Angry Husband (Broad)", "Angry Husband"), ("Ad 3 - Slay Queen (Broad)", "Slay Queen")]:
        try:
            create_ad(adset_b['id'], hashes.get(key), label)
        except FacebookRequestError as e:
            if _is_dev_mode_error(e):
                print(f"    ❌ Creative Failed (Dev Mode): {label}")
                continue
            raise

    print("\n--- ✅ HYBRID DRAFT DEPLOYMENT COMPLETE (ALL PAUSED). ---")
    print("Campaign and Ad Sets should exist even if creatives failed.")