import base64
import json
import os
import time
from typing import Any, Dict, List, Optional

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    load_dotenv = None

# Optional connectors
try:
    from connectors.google_ads_connector import GoogleAdsConnector
except Exception:
    GoogleAdsConnector = None

try:
    from connectors.youtube_connector import YouTubeConnector
except Exception:
    YouTubeConnector = None

# Meta Marketing API (optional)
try:
    from facebook_business.api import FacebookAdsApi
    from facebook_business.adobjects.adaccount import AdAccount
    from facebook_business.exceptions import FacebookRequestError
except Exception:
    FacebookAdsApi = None
    AdAccount = None
    FacebookRequestError = Exception


PAGE_TITLE = "AMD Visual Command Center"
DASHBOARD_VERSION = "2.0"
ASSET_LOGO = os.path.join("assets", "amd_logo.png")
ASSET_BACKDROP = os.path.join("assets", "amd_backdrop.png")
ASSET_DASHBOARD_BG_ROOT = "dashboard_bg.jpg"
ASSET_DASHBOARD_BG = os.path.join("assets", "dashboard_bg.jpg")

IDENTITY_PATH = os.path.join(os.path.dirname(__file__), "amd_identity.json")
SOCIAL_LINKS_PATH = os.path.join(os.path.dirname(__file__), "config", "social_links.json")
BILLING_PROFILE_PATH = os.path.join(os.path.dirname(__file__), "config", "billing_profile.json")

BG = "#050505"
METALLIC_TOP = "#FFD700"
METALLIC_BOTTOM = "#B8860B"
DEEP_GOLD = "#FCF6BA"
GOLD_GRADIENT = "linear-gradient(45deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)"


def load_env() -> None:
    if load_dotenv is None:
        return
    try:
        load_dotenv()
    except Exception:
        pass


def get_base64_of_bin_file(bin_file: str) -> str:
    """Return a base64 string for a binary file, or empty string if missing."""
    if not os.path.exists(bin_file):
        return ""
    with open(bin_file, "rb") as f:
        return base64.b64encode(f.read()).decode()


def load_identity() -> Dict[str, Any]:
    try:
        if not os.path.exists(IDENTITY_PATH):
            return {}
        with open(IDENTITY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def load_social_links() -> Dict[str, Any]:
    try:
        if not os.path.exists(SOCIAL_LINKS_PATH):
            return {}
        with open(SOCIAL_LINKS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def load_billing_profile() -> Dict[str, Any]:
    try:
        if not os.path.exists(BILLING_PROFILE_PATH):
            return {}
        with open(BILLING_PROFILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _format_us_billing_address(billing_cfg: Dict[str, Any]) -> str:
    addr = billing_cfg.get("us_billing_address") if isinstance(billing_cfg, dict) else {}
    if not isinstance(addr, dict):
        return ""

    street_1 = addr.get("street_1")
    street_2 = addr.get("street_2")
    city = addr.get("city")
    state_code = addr.get("state_code")
    zip_code = addr.get("zip_code")
    country = addr.get("country")

    def _s(v: Any) -> str:
        return v.strip() if isinstance(v, str) else ""

    parts = [_s(street_1), _s(street_2)]
    line1 = ", ".join([p for p in parts if p])
    line2_bits = [p for p in [_s(city), _s(state_code), _s(zip_code)] if p]
    line2 = ", ".join(line2_bits[:-1]) + (f" {line2_bits[-1]}" if line2_bits else "")
    line3 = _s(country)

    full = "\n".join([p for p in [line1, line2.strip(), line3] if p]).strip()
    return full


def _social_email(cfg: Dict[str, Any]) -> str:
    contact = cfg.get("contact_channels") if isinstance(cfg, dict) else {}
    if not isinstance(contact, dict):
        return ""
    email = contact.get("official_email")
    return email.strip() if isinstance(email, str) else ""


def _social_setting(cfg: Dict[str, Any], key: str, default: bool = False) -> bool:
    settings = cfg.get("dashboard_settings") if isinstance(cfg, dict) else {}
    if not isinstance(settings, dict):
        return default
    val = settings.get(key)
    if isinstance(val, bool):
        return val
    return default


def _operational_tools(cfg: Dict[str, Any]) -> Dict[str, str]:
    tools = cfg.get("operational_tools") if isinstance(cfg, dict) else {}
    if not isinstance(tools, dict):
        return {}
    out: Dict[str, str] = {}
    for k, v in tools.items():
        if isinstance(k, str) and isinstance(v, str) and v.strip():
            out[k] = v.strip()
    return out


def _render_sidebar_tools(cfg: Dict[str, Any], billing_address: str) -> None:
    if not _social_setting(cfg, "display_tools_sidebar", default=False):
        return

    tools = _operational_tools(cfg)
    canva = tools.get("design_studio", "")
    taplink = tools.get("link_manager_admin", "")
    email_portal = tools.get("email_portal", "")

    if not (canva or taplink or email_portal):
        # Still show billing copy if present
        if not billing_address:
            return

    with st.sidebar.container():
        st.markdown(
            f"<div style='color:{DEEP_GOLD};font-weight:900;margin-bottom:6px'>⚡ COMMAND TOOLS</div>",
            unsafe_allow_html=True,
        )

        # Use link buttons when available; fall back to markdown links.
        if canva:
            try:
                st.link_button("Canva", canva)
            except Exception:
                st.markdown(f"[Canva]({canva})")
        if taplink:
            try:
                st.link_button("Taplink", taplink)
            except Exception:
                st.markdown(f"[Taplink]({taplink})")
        if email_portal:
            try:
                st.link_button("Email", email_portal)
            except Exception:
                st.markdown(f"[Email]({email_portal})")

                if billing_address:
                        st.markdown(
                                f"<div style='height:10px'></div><div style='color:{DEEP_GOLD};font-weight:900;margin-bottom:6px'>BILLING</div>",
                                unsafe_allow_html=True,
                        )

                        if st.button("Copy Billing Address", key="copy_billing_address"):
                                st.session_state["__copy_billing__"] = True

                        if st.session_state.get("__copy_billing__"):
                                components.html(
                                        """
                                        <script>
                                            (async function() {
                                                try {
                                                    await navigator.clipboard.writeText(%s);
                                                } catch (e) {
                                                    // Clipboard may be blocked by browser permissions.
                                                }
                                            })();
                                        </script>
                                        """ % json.dumps(billing_address),
                                        height=0,
                                )
                                st.success("Billing address copied (if permitted by browser).")
                                st.code(billing_address)
                                st.session_state["__copy_billing__"] = False


def _render_sidebar_contact(email: str) -> None:
    if not email:
        return

        sidebar = st.sidebar.container()
        with sidebar:
                st.markdown(
                        f"<div style='color:{DEEP_GOLD};font-weight:900;margin-bottom:6px'>CONTACT CEO</div>",
                        unsafe_allow_html=True,
                )

                # Streamlit has no built-in clipboard API; use a tiny HTML/JS shim.
                if st.button("Contact CEO", key="copy_ceo_email"):
                        st.session_state["__copy_email__"] = True

                if st.session_state.get("__copy_email__"):
                        # Attempt clipboard copy; also render the email for manual copy if blocked.
                        components.html(
                                """
                                <script>
                                    (async function() {
                                        try {
                                            await navigator.clipboard.writeText(%s);
                                        } catch (e) {
                                            // Clipboard may be blocked by browser permissions.
                                        }
                                    })();
                                </script>
                                """ % json.dumps(email),
                                height=0,
                        )
                        st.success("Email copied to clipboard (if permitted by browser).")
                        st.code(email)
                        st.session_state["__copy_email__"] = False


def _identity_links(identity: Dict[str, Any]) -> Dict[str, str]:
    links = identity.get("links") if isinstance(identity, dict) else {}
    if not isinstance(links, dict):
        return {}
    out: Dict[str, str] = {}
    for k, v in links.items():
        if isinstance(k, str) and isinstance(v, str) and v.strip():
            out[k] = v.strip()
    return out


def _feature_on(identity: Dict[str, Any], key: str, default: bool = False) -> bool:
    feats = identity.get("dashboard_features") if isinstance(identity, dict) else {}
    if not isinstance(feats, dict):
        return default
    val = feats.get(key)
    if isinstance(val, bool):
        return val
    return default


def inject_css():
    """Inject theme CSS safely (prevents raw CSS showing as text)."""
    # Prefer the master composed background if present.
    # User intent: wallpaper already contains logo/title/slogan in top ~35%.
    bg_path = ASSET_DASHBOARD_BG_ROOT if os.path.exists(ASSET_DASHBOARD_BG_ROOT) else ASSET_DASHBOARD_BG
    bg_b64 = get_base64_of_bin_file(bg_path)
    if not bg_b64:
        # Fallback to the older backdrop if the composed wallpaper isn't available.
        bg_b64 = get_base64_of_bin_file(ASSET_BACKDROP)
        bg_mime = "image/png"
    else:
        bg_mime = "image/jpeg" if bg_path.lower().endswith((".jpg", ".jpeg")) else "image/png"

    if bg_b64:
        bg_url = f"data:{bg_mime};base64,{bg_b64}"
        bg_image_css = f"background-image: url('{bg_url}');"
    else:
        bg_image_css = "background-image: none;"

    # IMPORTANT: Inject <link> separately from <style>.
    # Streamlit/Markdown can sometimes truncate mixed HTML blocks and render trailing CSS as text.
    st.markdown(
        "<link href='https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Montserrat:wght@600;700;800&display=swap' rel='stylesheet'>",
        unsafe_allow_html=True,
    )

    style = f"""
<style>
  /* Global theme */
  html, body {{
        background: {BG} !important;
        color: {DEEP_GOLD} !important;
  }}

  /* App backdrop (main view container) */
  [data-testid="stAppViewContainer"] {{
      {bg_image_css}
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-color: {BG} !important;
      color: {DEEP_GOLD} !important;
  }}

  /* Also apply to .stApp for maximum compatibility */
  .stApp {{
      {bg_image_css}
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-color: {BG} !important;
  }}

  /* HERO CLEAR SPACE: push content down so it starts below baked-in branding */
  [data-testid="stAppViewContainer"] .main .block-container {{
      padding-top: 38vh !important;
  }}

  /* Force UI down by 35% of viewport height (requested) */
  .main .block-container {{
      padding-top: 35vh !important;
  }}

  /* Header + sidebar areas */
  [data-testid="stHeader"], [data-testid="stSidebar"], [data-testid="stToolbar"] {{
      background: rgba(5,5,5,0.85) !important;
      color: {DEEP_GOLD} !important;
  }}

  /* Make common Streamlit text elements gold */
  [data-testid="stMarkdownContainer"], [data-testid="stText"], [data-testid="stCaptionContainer"],
  [data-testid="stMetric"], [data-testid="stAlert"] {{
      color: {DEEP_GOLD} !important;
  }}

  /* Sci-fi headers */
  h1, h2, h3, h4, h5, h6 {{
      font-family: 'Orbitron', 'Montserrat', 'Segoe UI', Roboto, sans-serif;
      letter-spacing: 0.02em;
  }}

  /* Metallic title gradient */
  .metal-title {{
      font-family: 'Orbitron', 'Segoe UI', Roboto, sans-serif;
      background: {GOLD_GRADIENT};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 900;
      text-align: center;
      font-size: 2.0rem;
      margin: 8px 0 18px 0;
      text-shadow:
          0 0 10px rgba(252, 246, 186, 0.08),
          0 0 22px rgba(191, 149, 63, 0.10);
  }}

  /* Deep gold metric cards */
  .metric-card {{
      /* Gradient border effect */
      border: 1px solid transparent !important;
      border-radius: 12px;
      background:
          linear-gradient(rgba(5,5,5,0.85), rgba(5,5,5,0.85)) padding-box,
          {GOLD_GRADIENT} border-box;
      padding: 14px 16px;
      text-align: center;
      color: {DEEP_GOLD} !important;
      box-shadow: 0 0 22px rgba(252, 246, 186, 0.10);
  }}
  .metric-number {{
      font-size: 28px;
      font-weight: 900;
      background: {GOLD_GRADIENT};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
  }}
    .metric-label {{
            font-size:12px;
            color: rgba(252, 246, 186, 0.92) !important;
            opacity:0.95;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
    }}

  /* Tabs (BaseWeb) */
  div[data-baseweb="tab-list"] {{
      background: rgba(5,5,5,0.55) !important;
      border-bottom: 0 !important;
      box-shadow: none !important;
      padding: 6px 6px 10px 6px;
      gap: 6px;
  }}
  button[data-baseweb="tab"] {{
      color: rgba(252, 246, 186, 0.85) !important;
      background: transparent !important;
      font-family: 'Orbitron', 'Montserrat', 'Segoe UI', Roboto, sans-serif;
      letter-spacing: 0.02em;
      border-radius: 12px !important;
      border: 1px solid transparent !important;
  }}
  button[data-baseweb="tab"][aria-selected="true"] {{
      color: rgba(252, 246, 186, 1.0) !important;
      background:
          linear-gradient(rgba(5,5,5,0.78), rgba(5,5,5,0.78)) padding-box,
          {GOLD_GRADIENT} border-box !important;
      box-shadow:
          0 0 0 1px rgba(252, 246, 186, 0.10),
          0 0 24px rgba(252, 246, 186, 0.10);
  }}
  /* Remove default highlight underline (prevents "orphan line" artifacts) */
  div[data-baseweb="tab-highlight"] {{ display: none !important; }}

  /* DataFrame (Glide Data Grid) theme variables */
  [data-testid="stDataFrame"] {{
      border: 1px solid transparent !important;
      border-radius: 12px !important;
      background:
          linear-gradient({BG}, {BG}) padding-box,
          {GOLD_GRADIENT} border-box;
  }}
  [data-testid="stDataFrame"] .stDataFrameGlideDataEditor {{
      --gdg-bg-cell: {BG};
      --gdg-bg-cell-medium: {BG};
      --gdg-bg-header: {BG};
      --gdg-bg-header-hovered: rgba(252, 246, 186, 0.10);
      --gdg-bg-header-has-focus: rgba(252, 246, 186, 0.12);
      --gdg-text-dark: rgba(252, 246, 186, 1.0);
      --gdg-text-medium: rgba(252, 246, 186, 0.90);
      --gdg-text-light: rgba(252, 246, 186, 0.65);
      --gdg-text-header: rgba(252, 246, 186, 0.95);
      --gdg-border-color: rgba(252, 246, 186, 0.22);
      --gdg-horizontal-border-color: rgba(252, 246, 186, 0.16);
      --gdg-drilldown-border: rgba(252, 246, 186, 0.22);
      --gdg-bg-group-header: {BG};
      --gdg-text-group-header: rgba(252, 246, 186, 0.95);
  }}

  /* Center the logo container */
  .logo-wrap {{ text-align:center; margin-bottom: 14px; }}
  .amd-logo {{
      width: 200px;
      max-width: 100%;
      filter:
          drop-shadow(0 0 10px rgba(252, 246, 186, 0.35))
          drop-shadow(0 0 22px rgba(191, 149, 63, 0.22));
  }}

  /* Buttons: metallic gradient border + glow */
  div.stButton > button {{
      border: 1px solid transparent !important;
      border-radius: 12px !important;
      color: rgba(252, 246, 186, 0.95) !important;
      background:
          linear-gradient(rgba(5,5,5,0.90), rgba(5,5,5,0.90)) padding-box,
          {GOLD_GRADIENT} border-box !important;
      box-shadow: 0 0 18px rgba(252, 246, 186, 0.10);
  }}
  div.stButton > button:hover {{
      box-shadow: 0 0 26px rgba(252, 246, 186, 0.18);
  }}
</style>
"""

    st.markdown(style, unsafe_allow_html=True)


def show_logo():
    if os.path.exists(ASSET_LOGO):
        try:
            logo_b64 = get_base64_of_bin_file(ASSET_LOGO)
            if logo_b64:
                st.markdown(
                    f"<div class='logo-wrap'><img class='amd-logo' src='data:image/png;base64,{logo_b64}' alt='AMD Logo' /></div>",
                    unsafe_allow_html=True,
                )
                return
        except Exception:
            pass

    st.markdown("<div class='logo-wrap'><h2 class='metal-title'>AMD — Blazing Cube</h2></div>", unsafe_allow_html=True)


class YouTubeFallback:
    def __init__(self):
        self.client = None
        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            scopes = ["https://www.googleapis.com/auth/youtube.readonly"]
            creds = None
            if os.path.exists("token.json"):
                creds = Credentials.from_authorized_user_file("token.json", scopes)
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    if os.path.exists("client_secret.json"):
                        flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", scopes)
                        creds = flow.run_local_server(port=0)
                if creds:
                    with open("token.json", "w") as f:
                        f.write(creds.to_json())
            if creds:
                self.client = build("youtube", "v3", credentials=creds)
        except Exception:
            self.client = None

    def get_video_stats(self, title_or_id: str):
        if not self.client:
            return None
        try:
            vid_id = title_or_id if len(title_or_id) == 11 else None
            if not vid_id:
                s = (
                    self.client.search()
                    .list(q=title_or_id, part="id", type="video", maxResults=1)
                    .execute()
                )
                items = s.get("items", [])
                if not items:
                    return None
                vid_id = items[0]["id"]["videoId"]
            r = self.client.videos().list(part="statistics", id=vid_id).execute()
            items = r.get("items", [])
            if not items:
                return None
            return items[0]["statistics"]
        except Exception:
            return None

    def get_subscriber_count(self):
        if not self.client:
            return None
        try:
            r = self.client.channels().list(part="statistics", mine=True).execute()
            items = r.get("items", [])
            if not items:
                return None
            return items[0]["statistics"].get("subscriberCount")
        except Exception:
            return None


def load_ads_data():
    if GoogleAdsConnector is None:
        return None
    try:
        g = GoogleAdsConnector()
        return g.get_campaign_performance()
    except Exception:
        return None


def format_currency(value):
    try:
        return f"${float(value):,.2f}"
    except Exception:
        return str(value)


def fetch_metrics(yt_client):
    video_stats = None
    try:
        video_stats = yt_client.get_video_stats("AMD_Manifesto_Final") if yt_client else None
    except Exception:
        video_stats = None
    views = video_stats.get("viewCount") if video_stats else "—"

    subs = None
    try:
        subs = yt_client.get_subscriber_count() if yt_client else None
    except Exception:
        subs = None
    subs = subs or "—"

    campaigns = None
    ad_spend = "$0.00"
    try:
        campaigns = load_ads_data()
        if campaigns and isinstance(campaigns, list):
            total = 0.0
            for c in campaigns:
                cost = c.get("cost") if isinstance(c, dict) else None
                try:
                    total += float(cost or 0)
                except Exception:
                    pass
            ad_spend = format_currency(total)
    except Exception:
        ad_spend = "$0.00"

    return views, subs, campaigns, ad_spend


_META_LAST_ERROR: Optional[str] = None


def get_meta_last_error() -> Optional[str]:
    return _META_LAST_ERROR


def _set_meta_error(msg: Optional[str]) -> None:
    global _META_LAST_ERROR
    _META_LAST_ERROR = msg


def _normalize_act(ad_account_id: str) -> str:
    ad_account_id = (ad_account_id or "").strip()
    if not ad_account_id:
        return ""
    return ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"


def get_meta_data() -> List[Dict[str, Any]]:
    """Fetch Meta ACTIVE campaigns with today's spend/impressions.

    Returns a list of dicts: {'name': campaign_name, 'spend': spend_amount, 'impressions': impressions}
    On error, returns an empty list and stores a message retrievable via get_meta_last_error().
    """

    load_env()
    _set_meta_error(None)

    if FacebookAdsApi is None or AdAccount is None:
        _set_meta_error(
            "Meta SDK not installed. Add 'facebook-business' to requirements and install dependencies."
        )
        return []

    app_id = os.getenv("META_APP_ID")
    app_secret = os.getenv("META_APP_SECRET")
    access_token = os.getenv("META_ACCESS_TOKEN")
    ad_account_id = _normalize_act(os.getenv("META_AD_ACCOUNT_ID", ""))

    missing = [
        k
        for k, v in {
            "META_APP_ID": app_id,
            "META_APP_SECRET": app_secret,
            "META_ACCESS_TOKEN": access_token,
            "META_AD_ACCOUNT_ID": ad_account_id,
        }.items()
        if not v
    ]
    if missing:
        _set_meta_error(f"Missing required .env values: {', '.join(missing)}")
        return []

    try:
        FacebookAdsApi.init(app_id=app_id, app_secret=app_secret, access_token=access_token)
        account = AdAccount(ad_account_id)

        campaigns = account.get_campaigns(
            fields=["id", "name", "effective_status"],
            params={"effective_status": ["ACTIVE"], "limit": 200},
        )
        active_campaigns = list(campaigns) if campaigns is not None else []

        insights = account.get_insights(
            fields=["campaign_id", "campaign_name", "spend", "impressions"],
            params={
                "level": "campaign",
                "date_preset": "today",
                "filtering": [
                    {
                        "field": "campaign.effective_status",
                        "operator": "IN",
                        "value": ["ACTIVE"],
                    }
                ],
                "limit": 200,
            },
        )

        spend_by_id: Dict[str, Dict[str, Any]] = {}
        for row in list(insights) if insights is not None else []:
            cid = str(row.get("campaign_id", ""))
            if not cid:
                continue
            spend_by_id[cid] = {
                "spend": row.get("spend", "0"),
                "impressions": row.get("impressions", "0"),
            }

        result: List[Dict[str, Any]] = []
        for c in active_campaigns:
            cid = str(c.get("id", ""))
            name = c.get("name", "")
            metrics = spend_by_id.get(cid, {"spend": "0", "impressions": "0"})
            try:
                spend_val = float(metrics.get("spend", "0") or 0)
            except Exception:
                spend_val = 0.0
            try:
                impressions_val = int(float(metrics.get("impressions", "0") or 0))
            except Exception:
                impressions_val = 0

            result.append({"name": name, "spend": spend_val, "impressions": impressions_val})

        return result

    except FacebookRequestError as e:
        # SDK error includes message/codes, safe to display.
        _set_meta_error(f"Meta API error: {e}")
        return []
    except Exception as e:
        # Likely offline / DNS / SSL / etc.
        _set_meta_error(f"Meta connection failed: {e}")
        return []


def _meta_total_spend_today(rows: List[Dict[str, Any]]) -> float:
    total = 0.0
    for r in rows or []:
        try:
            total += float(r.get("spend", 0) or 0)
        except Exception:
            pass
    return total


def main():
    st.set_page_config(page_title=PAGE_TITLE, layout="wide")
    inject_css()

    identity = load_identity()
    social_cfg = load_social_links()
    billing_cfg = load_billing_profile()
    billing_address = _format_us_billing_address(billing_cfg)
    links = _identity_links(identity)
    empire_name = (identity.get("empire_name") if isinstance(identity, dict) else "") or ""
    empire_name = empire_name.strip() if isinstance(empire_name, str) else ""

    # Branding is baked into dashboard_bg.jpg (wallpaper), so do not render logo/title here.

    # Sidebar command tools (driven by config/social_links.json)
    _render_sidebar_tools(social_cfg, billing_address=billing_address)

    # Sidebar contact button (always available when email is configured)
    _render_sidebar_contact(_social_email(social_cfg))

    # Connectors
    yt = None
    if YouTubeConnector is not None:
        try:
            yt = YouTubeConnector()
        except Exception:
            yt = None
    if yt is None:
        yt = YouTubeFallback()

    tabs = st.tabs(
        [
            "Google & YouTube",
            "Meta & Instagram",
            "TikTok Ads",
            "Snapchat Ads",
            "LinkedIn Ads",
            "X Ads",
        ]
    )

    # --- TAB 1: Google & YouTube ---
    with tabs[0]:
        views, subs, campaigns, ad_spend = fetch_metrics(yt)

        # Identity-driven quick links + embeds (JSON controlled)
        if empire_name:
            st.markdown(
                f"<div style='color:{DEEP_GOLD};font-weight:900;letter-spacing:0.06em;text-transform:uppercase'>{empire_name}</div>",
                unsafe_allow_html=True,
            )

        if links:
            link_order = [
                ("website", "Website"),
                ("youtube_channel", "YouTube"),
                ("tiktok", "TikTok"),
                ("instagram", "Instagram"),
                ("twitter", "X"),
                ("linkedin", "LinkedIn"),
                ("pinterest", "Pinterest"),
                ("facebook_page", "Facebook"),
                ("snapchat_profile", "Snapchat"),
            ]
            cols = st.columns(5)
            ci = 0
            for key, label in link_order:
                url = links.get(key)
                if not url:
                    continue
                with cols[ci % 5]:
                    try:
                        st.link_button(label, url)
                    except Exception:
                        st.markdown(f"[{label}]({url})")
                ci += 1

        # Prefer the new master social config for YouTube embeds when present.
        embed_from_social = _social_setting(social_cfg, "embed_youtube_player", default=False)
        if embed_from_social or _feature_on(identity, "embed_youtube_player", default=False):
            social_grid = social_cfg.get("social_grid") if isinstance(social_cfg, dict) else {}
            if not isinstance(social_grid, dict):
                social_grid = {}
            video_url = (
                (social_grid.get("youtube_video") if isinstance(social_grid.get("youtube_video"), str) else "")
                or (social_grid.get("youtube_channel") if isinstance(social_grid.get("youtube_channel"), str) else "")
                or links.get("youtube_video")
                or links.get("youtube_channel")
            )
            if video_url:
                st.markdown("---")
                st.markdown(
                    f"<div style='color:{DEEP_GOLD};font-weight:900'>YouTube Player</div>",
                    unsafe_allow_html=True,
                )
                try:
                    st.video(video_url)
                except Exception:
                    st.markdown(f"[Open video]({video_url})")

        if _feature_on(identity, "show_live_feed", default=False):
            channel_url = links.get("youtube_channel")
            if channel_url:
                with st.expander("Live Feed", expanded=False):
                    st.markdown(
                        f"<div style='color:{DEEP_GOLD};opacity:0.9'>Channel</div>",
                        unsafe_allow_html=True,
                    )
                    st.markdown(f"{channel_url}")

        bcol, c1, c2, c3 = st.columns([0.70, 1, 1, 1])
        with bcol:
            st.markdown("<div style='height:14px'></div>", unsafe_allow_html=True)
            refresh_google = st.button("Refresh Google & YouTube", key="refresh_google_yt")
        if refresh_google:
            views, subs, campaigns, ad_spend = fetch_metrics(yt)

        with c1:
            st.markdown(
                f"<div class='metric-card'><div class='metric-number'>{views}</div><div class='metric-label'>AMD_MANIFESTO_FINAL VIEWS</div></div>",
                unsafe_allow_html=True,
            )
        with c2:
            st.markdown(
                f"<div class='metric-card'><div class='metric-number'>{subs}</div><div class='metric-label'>SUBSCRIBERS</div></div>",
                unsafe_allow_html=True,
            )
        with c3:
            st.markdown(
                f"<div class='metric-card'><div class='metric-number'>{ad_spend}</div><div class='metric-label'>AD SPEND (LIVE/PLACEHOLDER)</div></div>",
                unsafe_allow_html=True,
            )

        st.markdown("---")
        if campaigns:
            try:
                df = pd.DataFrame(campaigns)
                st.dataframe(df)
            except Exception:
                st.write(campaigns)
        else:
            st.markdown(
                f"<p style='color:{DEEP_GOLD}'>No Google Ads data available — using placeholder values.</p>",
                unsafe_allow_html=True,
            )

        st.markdown(
            f"<div style='color:{DEEP_GOLD};opacity:0.85;font-size:12px;margin-top:12px'>Last refresh: {time.strftime('%Y-%m-%d %H:%M:%S')}</div>",
            unsafe_allow_html=True,
        )

    # --- TAB 2: Meta & Instagram ---
    with tabs[1]:
        if "meta_data" not in st.session_state:
            st.session_state["meta_data"] = get_meta_data()
            st.session_state["meta_last_refresh"] = time.time()
            st.session_state["meta_error"] = get_meta_last_error()

        meta_cols = st.columns([0.70, 1.30])
        with meta_cols[0]:
            st.markdown("<div style='height:14px'></div>", unsafe_allow_html=True)
            refresh_meta = st.button("Refresh Meta Data", key="refresh_meta")
        if refresh_meta:
            st.session_state["meta_data"] = get_meta_data()
            st.session_state["meta_last_refresh"] = time.time()
            st.session_state["meta_error"] = get_meta_last_error()

        meta_error = st.session_state.get("meta_error")
        if meta_error:
            st.error(meta_error)

        meta_rows = st.session_state.get("meta_data") or []
        total_spend = _meta_total_spend_today(meta_rows)

        with meta_cols[1]:
            st.markdown(
                f"<div class='metric-card'><div class='metric-number'>{format_currency(total_spend)}</div><div class='metric-label'>TOTAL SPEND TODAY</div></div>",
                unsafe_allow_html=True,
            )

        st.markdown("---")
        st.markdown(f"<div style='color:{DEEP_GOLD};font-weight:900'>Active Campaigns</div>", unsafe_allow_html=True)

        if meta_rows:
            try:
                dfm = pd.DataFrame(meta_rows)
                dfm = dfm[["name", "spend", "impressions"]] if set(["name", "spend", "impressions"]).issubset(dfm.columns) else dfm
                st.dataframe(dfm)
            except Exception:
                st.write(meta_rows)
        else:
            st.markdown(
                f"<p style='color:{DEEP_GOLD}'>No Meta campaign data available.</p>",
                unsafe_allow_html=True,
            )

        last_refresh = st.session_state.get("meta_last_refresh")
        if last_refresh:
            st.markdown(
                f"<div style='color:{DEEP_GOLD};opacity:0.85;font-size:12px;margin-top:12px'>Last refresh: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(last_refresh))}</div>",
                unsafe_allow_html=True,
            )

    # --- TAB 3: TikTok Ads (placeholder) ---
    with tabs[2]:
        st.markdown(
            "<div class='metric-card'><div class='metric-number'>Status</div><div class='metric-label'>🔒 API Key Required</div></div>",
            unsafe_allow_html=True,
        )
        st.markdown("---")
        st.markdown(
            f"<p style='color:{DEEP_GOLD};opacity:0.90'>TikTok Ads integration is not configured yet.</p>",
            unsafe_allow_html=True,
        )

    # --- TAB 4: Snapchat Ads (placeholder) ---
    with tabs[3]:
        st.markdown(
            "<div class='metric-card'><div class='metric-number'>Status</div><div class='metric-label'>🔒 API Key Required</div></div>",
            unsafe_allow_html=True,
        )
        st.markdown("---")
        st.markdown(
            f"<p style='color:{DEEP_GOLD};opacity:0.90'>Snapchat Ads integration is not configured yet.</p>",
            unsafe_allow_html=True,
        )

    # --- TAB 5: LinkedIn Ads (placeholder) ---
    with tabs[4]:
        st.markdown(
            "<div class='metric-card'><div class='metric-number'>Status</div><div class='metric-label'>🔒 API Key Required</div></div>",
            unsafe_allow_html=True,
        )
        st.markdown("---")
        st.markdown(
            f"<p style='color:{DEEP_GOLD};opacity:0.90'>LinkedIn Ads integration is not configured yet.</p>",
            unsafe_allow_html=True,
        )

    # --- TAB 6: X Ads (placeholder) ---
    with tabs[5]:
        st.markdown(
            "<div class='metric-card'><div class='metric-number'>Status</div><div class='metric-label'>🔒 API Key Required</div></div>",
            unsafe_allow_html=True,
        )
        st.markdown("---")
        st.markdown(
            f"<p style='color:{DEEP_GOLD};opacity:0.90'>X Ads integration is not configured yet.</p>",
            unsafe_allow_html=True,
        )


if __name__ == "__main__":
    main()

