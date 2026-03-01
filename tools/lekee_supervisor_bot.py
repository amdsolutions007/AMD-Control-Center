#!/usr/bin/env python3
"""
AMD LekeeLekee Supervisor Bot
=====================================
Automated Pipeline:
  • Daily 9:00 AM UTC scheduler (PTB JobQueue)
  • Generates Day N graphic (Four-Pack Fallback) + caption
  • Sends Approve/Reject prompt to CEO Telegram
  • On Approve → Direct API Strike (/api/v1/groups/.../posts)
  • On Reject  → Logs and waits for next day
  • state_tracker.json tracks campaign progress

Four-Pack Graphic Fallback:
  1. OpenAI DALL-E 3
  2. Google Gemini Flash Image Generation
  3. Pillow-generated graphic
  4. Text-only post (no image)

Run via:
  python3 tools/lekee_supervisor_bot.py
  or:
  npx @railway/cli run --service telegram-approval-bot python3 tools/lekee_supervisor_bot.py
"""

import asyncio
import datetime
import io
import json
import logging
import os
import sys
import time

# ── Path setup ──────────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

# ── Deps ────────────────────────────────────────────────────────────────────────
try:
    import requests
except ImportError:
    os.system("pip install requests -q")
    import requests

try:
    from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup, Update
    from telegram.ext import Application, CallbackQueryHandler, ContextTypes
except ImportError:
    os.system("pip install python-telegram-bot>=20.0 -q")
    from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup, Update
    from telegram.ext import Application, CallbackQueryHandler, ContextTypes

from content_generator import ContentGenerator

# brand_compositor lives in the same tools/ directory
_TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
if _TOOLS_DIR not in sys.path:
    sys.path.insert(0, _TOOLS_DIR)
from brand_compositor import composite, load_cached, save_cached

# ── Logging ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("lekee_supervisor")

# ── Environment Variables ───────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
CEO_TELEGRAM_ID    = int(os.environ.get("CEO_TELEGRAM_ID", "0") or 0)
OPENAI_API_KEY     = os.environ.get("OPENAI_API_KEY", "").strip()
GEMINI_API_KEY     = os.environ.get("GEMINI_API_KEY", "").strip()
LEKE_EMAIL         = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
LEKE_PASSWORD      = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()

# ── Constants ───────────────────────────────────────────────────────────────────
BASE_URL   = "https://www.lekeelekee.com"
GROUP_ID   = "4d183887-2d5a-47b0-8226-dd6939d29694"   # African Tech Ecosystem 🌍
STATE_FILE = os.path.join(ROOT, "state_tracker.json")
TOTAL_DAYS = 36

# ── State Tracker ───────────────────────────────────────────────────────────────
def load_state() -> dict:
    """Load campaign state from file."""
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        log.warning("state_tracker.json not found — initialising fresh state")
        return {"current_day": 2, "history": []}


def save_state(state: dict):
    """Persist campaign state to file."""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)
    log.info(f"💾 State saved: current_day={state.get('current_day')}")


# ── LekeeLekee API ─────────────────────────────────────────────────────────────
def _make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Origin": BASE_URL,
        "Referer": BASE_URL + "/",
        "Accept": "application/json",
    })
    return s


def lekee_login() -> tuple:
    """Login to LekeeLekee, return (session, token, user_id). Retries on 429."""
    session = _make_session()
    resp = None
    for attempt in range(1, 4):
        resp = session.post(
            f"{BASE_URL}/api/v1/auth/login",
            data={"email": LEKE_EMAIL, "password": LEKE_PASSWORD},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        if resp.status_code == 429:
            wait = 60 * attempt
            log.warning(f"⏳ Rate limited — waiting {wait}s (attempt {attempt}/3)...")
            time.sleep(wait)
            continue
        break

    if resp is None or resp.status_code != 200:
        raise RuntimeError(
            f"Login failed: HTTP {resp.status_code if resp else '?'} — "
            f"{resp.text[:200] if resp else 'no response'}"
        )

    data = resp.json()
    if data.get("status") != "success":
        raise RuntimeError(f"Login error: {data.get('message', resp.text[:100])}")

    token   = data["data"]["token"]
    user_id = data["data"]["user"]["public_id"]
    log.info(f"🔑 Logged in: token={len(token)} chars | user={user_id}")

    session.headers.update({
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    return session, token, user_id


def lekee_post_group(session: requests.Session, caption: str) -> dict:
    """Direct API Strike: POST to African Tech Ecosystem group."""
    resp = session.post(
        f"{BASE_URL}/api/v1/groups/{GROUP_ID}/posts",
        json={"content": caption, "type": "post"},
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"Group post failed: HTTP {resp.status_code} — {resp.text[:300]}"
        )
    return resp.json()


# ── Four-Pack Graphic Fallback ──────────────────────────────────────────────────
def _build_prompt(state: dict, day: int) -> str:
    name    = state.get("name", "Nigeria")
    capital = state.get("capital", name)
    zone    = state.get("zone", "")
    hubs_raw = state.get("tech_hubs", [])
    hubs    = hubs_raw[:3] if hubs_raw else []
    hub_str = " and ".join(hubs) if hubs else f"{capital} Technology Village"

    return (
        f"Cinematic, ultra-high-definition technology ecosystem poster for {name}, Nigeria. "
        f"Day {day} of 36 in the '36 Nigerian States — Tech Ecosystem' series. "
        f"Scene: A breathtaking aerial dusk view of {capital}'s skyline blended with a "
        f"futuristic digital overlay — glowing circuit paths, data nodes, and holographic "
        f"panels representing {hub_str}. "
        f"Color palette: Deep navy blue (#0F1722) fading to charcoal, bold orange (#FF6B00) "
        f"neon accents, gold highlights, soft purple atmospheric haze. "
        f"Style: premium tech brand campaign, African futurism, Afropunk meets Silicon Valley, "
        f"photorealistic with subtle geometric tech overlays. "
        f"Mood: powerful, aspirational, innovative, African excellence. "
        f"No text, no watermarks, no logos. Pure imagery only."
    )


def _dalle3(prompt: str) -> bytes | None:
    """Pack 1: OpenAI DALL-E 3."""
    if not OPENAI_API_KEY:
        log.info("DALL-E 3: skipped (no API key)")
        return None
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        result = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        img_url = result.data[0].url
        img_bytes = requests.get(img_url, timeout=60).content
        log.info(f"✅ Pack 1 DALL-E 3: {len(img_bytes):,} bytes")
        return img_bytes
    except Exception as e:
        log.warning(f"Pack 1 DALL-E 3 failed: {e}")
        return None


def _imagen4(prompt: str, model: str = "imagen-4.0-fast-generate-001") -> bytes | None:
    """
    Pack 2 / 3: Google Imagen 4 via generate_images() API.
    Confirmed working: imagen-4.0-fast-generate-001 → ~900KB images.
    """
    if not GEMINI_API_KEY:
        log.info(f"Imagen 4 ({model}): skipped (no GEMINI_API_KEY)")
        return None
    try:
        from google import genai as _genai
        from google.genai import types as _gtypes
        _client = _genai.Client(api_key=GEMINI_API_KEY)
        result  = _client.models.generate_images(
            model=model,
            prompt=prompt,
            config=_gtypes.GenerateImagesConfig(number_of_images=1, aspect_ratio="1:1"),
        )
        raw = result.generated_images[0].image.image_bytes
        if isinstance(raw, str):
            import base64 as _b64
            raw = _b64.b64decode(raw)
        log.info(f"✅ Imagen 4 ({model}): {len(raw):,} bytes")
        return raw
    except Exception as e:
        log.warning(f"Imagen 4 ({model}) failed: {e}")
        return None


def _gemini_flash_image(prompt: str) -> bytes | None:
    """
    Pack 4: Gemini Flash experimental image generation (generate_content path).
    Fallback when Imagen 4 is unavailable.
    """
    if not GEMINI_API_KEY:
        return None
    try:
        from google import genai as _genai
        from google.genai import types as _gtypes
        _client = _genai.Client(api_key=GEMINI_API_KEY)

        for model_name in [
            "gemini-2.0-flash-exp-image-generation",
            "gemini-2.5-flash-image",
            "gemini-3.1-flash-image-preview",
        ]:
            try:
                resp = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=_gtypes.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"]
                    ),
                )
                for part in resp.candidates[0].content.parts:
                    if hasattr(part, "inline_data") and part.inline_data:
                        raw = part.inline_data.data
                        if isinstance(raw, str):
                            import base64 as _b64
                            raw = _b64.b64decode(raw)
                        log.info(f"✅ Gemini Flash ({model_name}): {len(raw):,} bytes")
                        return raw
            except Exception as m_err:
                msg = str(m_err)
                if "NOT_FOUND" in msg or "404" in msg or "not supported" in msg:
                    log.info(f"  {model_name} not available, trying next...")
                    continue
                raise
        return None
    except Exception as e:
        log.warning(f"Pack 4 Gemini Flash failed: {e}")
        return None


def generate_graphic(state: dict, day: int) -> bytes | None:
    """
    Full pipeline:
      1. Check disk cache (tools/graphic_cache/day_NN_state.png)
      2. Generate AI background:
         Pack 1 — OpenAI DALL-E 3
         Pack 2 — Google Imagen 4 Fast  (~900KB)
         Pack 3 — Google Imagen 4 Standard
         Pack 4 — Gemini Flash experimental
      3. Composite AMD brand overlay (logo, day badge, state name, footer)
      4. Save to cache
      5. Return branded PNG bytes  (None = text-only post)

    NO Pillow templates — AI background is mandatory.
    """
    state_name = state.get("name", "unknown")

    # ── 1. Cache hit ──────────────────────────────────────────────────────────
    cached = load_cached(day, state_name)
    if cached:
        log.info(f"📦 Cache hit: Day {day} {state_name} ({len(cached):,} bytes)")
        return cached

    prompt = _build_prompt(state, day)

    # ── 2. Get AI background ─────────────────────────────────────────────────
    ai_bg: bytes | None = None

    log.info("🎨 Pack 1: Trying DALL-E 3...")
    ai_bg = _dalle3(prompt)

    if not ai_bg:
        log.info("🎨 Pack 2: Trying Imagen 4 Fast...")
        ai_bg = _imagen4(prompt, model="imagen-4.0-fast-generate-001")

    if not ai_bg:
        log.info("🎨 Pack 3: Trying Imagen 4 Standard...")
        ai_bg = _imagen4(prompt, model="imagen-4.0-generate-001")

    if not ai_bg:
        log.info("🎨 Pack 4: Trying Gemini Flash experimental...")
        ai_bg = _gemini_flash_image(prompt)

    if not ai_bg:
        log.warning("🎨 All AI packs failed — no graphic (text-only post)")
        return None

    # ── 3. Composite AMD brand overlay ────────────────────────────────────────
    log.info(f"🖼  Compositing AMD branding onto {len(ai_bg):,}-byte AI background...")
    try:
        branded = composite(ai_bg, state, day)
        log.info(f"✅ Branded graphic: {len(branded):,} bytes")
    except Exception as e:
        log.error(f"Brand compositor failed: {e} — sending raw AI image")
        branded = ai_bg

    # ── 4. Save to cache ──────────────────────────────────────────────────────
    try:
        save_cached(day, state_name, branded)
        log.info(f"💾 Cached: tools/graphic_cache/day_{day:02d}_...")
    except Exception as e:
        log.warning(f"Cache save failed: {e}")

    return branded


# ── Approval Prompt ─────────────────────────────────────────────────────────────
async def send_approval_prompt(
    bot: Bot,
    day: int,
    state: dict,
    caption: str,
    image_bytes: bytes | None,
):
    """Send an Approve / Reject card to CEO Telegram."""

    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton(
                f"✅ APPROVE — POST DAY {day}",
                callback_data=f"approve_{day}",
            ),
            InlineKeyboardButton(
                "❌ REJECT",
                callback_data=f"reject_{day}",
            ),
        ]
    ])

    hubs_preview = ""
    hubs = state.get("tech_hubs", [])
    if hubs:
        hubs_preview = "\n🏢 Hubs: " + ", ".join(hubs[:2])

    header = (
        f"🔔 *SUPERVISOR APPROVAL REQUIRED*\n"
        f"{'━' * 26}\n"
        f"📅 *Day {day}/{TOTAL_DAYS}: {state['name']}*\n"
        f"📍 Capital: {state.get('capital', 'N/A')}\n"
        f"🌍 Zone: {state.get('zone', 'N/A')}"
        f"{hubs_preview}\n"
        f"{'━' * 26}\n\n"
        f"*Caption Preview (first 500 chars):*\n"
        f"```\n{caption[:500]}\n```\n\n"
        f"Tap ✅ *APPROVE* to fire the Direct API Strike.\n"
        f"Tap ❌ *REJECT* to skip this post."
    )

    try:
        if image_bytes:
            await bot.send_photo(
                chat_id=CEO_TELEGRAM_ID,
                photo=io.BytesIO(image_bytes),
                caption=header,
                parse_mode="Markdown",
                reply_markup=keyboard,
            )
            log.info(f"📲 Approval prompt (with graphic) sent → CEO for Day {day} — {state['name']}")
        else:
            await bot.send_message(
                chat_id=CEO_TELEGRAM_ID,
                text=header + "\n\n_( Graphic unavailable — post will be text-only )_",
                parse_mode="Markdown",
                reply_markup=keyboard,
            )
            log.info(f"📲 Approval prompt (text-only) sent → CEO for Day {day} — {state['name']}")
    except Exception as e:
        log.error(f"Failed to send approval prompt: {e}")
        raise


# ── Callback Handler: Approve / Reject ──────────────────────────────────────────
async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle Approve / Reject button presses from CEO."""
    query = update.callback_query
    await query.answer()

    data = query.data or ""

    if data.startswith("approve_"):
        day = int(data.split("_", 1)[1])
        log.info(f"✅ CEO APPROVED Day {day}")

        # Acknowledge immediately
        ack = f"⏳ *Day {day}* — Firing Direct API Strike to African Tech Ecosystem group..."
        await _edit_message(query, ack)

        # Execute the post
        await _fire_api_strike(query, context, day)

    elif data.startswith("reject_"):
        day = int(data.split("_", 1)[1])
        log.info(f"❌ CEO REJECTED Day {day}")
        msg = (
            f"❌ *Day {day} REJECTED*\n"
            f"Post skipped. The scheduler will generate Day {day + 1} tomorrow at 09:00 UTC.\n"
            f"_(Or send /trigger to preview Day {day + 1} now)_"
        )
        await _edit_message(query, msg)


async def _edit_message(query, text: str):
    """Edit the original message (works for both photo and text messages)."""
    try:
        if query.message and query.message.photo:
            await query.edit_message_caption(caption=text, parse_mode="Markdown")
        else:
            await query.edit_message_text(text=text, parse_mode="Markdown")
    except Exception as e:
        log.warning(f"Could not edit message: {e}")


async def _fire_api_strike(query, context, day: int):
    """Execute the Direct API Strike after CEO approval."""
    try:
        # Rebuild caption for this day
        gen = ContentGenerator()
        gen.current_day = day - 1
        state  = gen.get_next_state()
        caption = gen.generate_caption(state)

        log.info(f"🔐 Logging in to LekeeLekee for Day {day} strike...")
        session, _, _ = lekee_login()

        log.info(f"📤 Firing Direct API Strike — Day {day}: {state['name']}...")
        result  = lekee_post_group(session, caption)
        post_id = (
            result.get("data", {}).get("post", {}).get("public_id", "")
            or result.get("data", {}).get("public_id", "unknown")
        )

        # ── Update state ──────────────────────────────────────────────────────
        state_data = load_state()
        state_data["current_day"] = day + 1
        state_data.setdefault("history", []).append({
            "day": day,
            "state": state["name"],
            "capital": state.get("capital", ""),
            "post_id": post_id,
            "posted_at": datetime.datetime.utcnow().isoformat(),
            "platform": "lekeelekee_group",
        })
        save_state(state_data)

        posted_at = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        next_day  = day + 1

        success_msg = (
            f"🟢 *DAY {day}/{TOTAL_DAYS}: {state['name'].upper()} — LIVE!*\n"
            f"{'━' * 30}\n"
            f"✅ African Tech Ecosystem Group — POSTED\n"
            f"🆔 Post ID: `{post_id}`\n"
            f"🕐 Posted: {posted_at}\n"
            f"{'━' * 30}\n"
            f"▶️ *Next*: Day {next_day} scheduled for 09:00 UTC\n"
            f"   _(or use /trigger to preview early)_"
        )

        await _edit_message(query, success_msg)
        log.info(f"🟢 Day {day} LIVE — post_id: {post_id}")

    except Exception as e:
        log.error(f"API Strike failed for Day {day}: {e}", exc_info=True)
        err_msg = (
            f"❌ *Direct API Strike FAILED*\n"
            f"Day {day} post error:\n"
            f"`{str(e)[:300]}`\n\n"
            f"Retry by sending /trigger"
        )
        await _edit_message(query, err_msg)


# ── /trigger command ────────────────────────────────────────────────────────────
async def cmd_trigger(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Manual /trigger command — regenerates current day approval prompt."""
    if update.effective_user and update.effective_user.id != CEO_TELEGRAM_ID:
        await update.message.reply_text("⛔ Not authorised.")
        return

    state_data = load_state()
    day        = state_data.get("current_day", 2)
    await update.message.reply_text(f"🔃 Generating Day {day} approval prompt...")
    await _send_day_prompt(context.bot, day)


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Manual /status command — show campaign progress."""
    if update.effective_user and update.effective_user.id != CEO_TELEGRAM_ID:
        await update.message.reply_text("⛔ Not authorised.")
        return

    state_data = load_state()
    day        = state_data.get("current_day", 2)
    history    = state_data.get("history", [])
    done       = len(history)

    lines = [
        f"📊 *Campaign Status*",
        f"Progress: {done}/{TOTAL_DAYS} states completed",
        f"Next: Day {day}",
        f"",
        f"*Recent posts:*",
    ]
    for h in history[-5:]:
        lines.append(f"  ✅ Day {h['day']}: {h['state']} — `{h['post_id'][:8]}...`")

    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


# ── Core helper ─────────────────────────────────────────────────────────────────
async def _send_day_prompt(bot: Bot, day: int):
    """Generate and send approval prompt for a given day."""
    if day > TOTAL_DAYS:
        await bot.send_message(
            chat_id=CEO_TELEGRAM_ID,
            text=(
                f"🏆 *36-State Campaign COMPLETE!*\n"
                f"All {TOTAL_DAYS} Nigerian states have been covered.\n"
                f"Well done, AMD Solutions! 🚀"
            ),
            parse_mode="Markdown",
        )
        log.info("Campaign complete — all 36 states done.")
        return

    gen = ContentGenerator()
    gen.current_day = day - 1
    state   = gen.get_next_state()
    caption = gen.generate_caption(state)

    log.info(f"🎯 Generating approval prompt: Day {day} — {state['name']}")
    image_bytes = generate_graphic(state, day)
    await send_approval_prompt(bot, day, state, caption, image_bytes)


# ── Scheduled Job ───────────────────────────────────────────────────────────────
async def daily_post_job(context: ContextTypes.DEFAULT_TYPE):
    """PTB JobQueue callback — runs daily at 09:00 UTC."""
    state_data = load_state()
    day        = state_data.get("current_day", 2)
    log.info(f"⏰ Scheduled job firing: Day {day}")
    await _send_day_prompt(context.bot, day)


# ── Application bootstrap ───────────────────────────────────────────────────────
def build_app() -> Application:
    from telegram.ext import CommandHandler

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Handlers
    app.add_handler(CallbackQueryHandler(callback_handler))
    app.add_handler(CommandHandler("trigger", cmd_trigger))
    app.add_handler(CommandHandler("status",  cmd_status))

    # Daily 09:00 UTC scheduler
    app.job_queue.run_daily(
        daily_post_job,
        time=datetime.time(hour=9, minute=0, second=0, tzinfo=datetime.timezone.utc),
        name="daily_lekee_post",
    )
    log.info("📅 Registered: daily_lekee_post at 09:00 UTC")

    return app


# ── Entry Points ────────────────────────────────────────────────────────────────
async def _run_send_only():
    """Send the Abuja prompt immediately then exit (used for --send-now mode)."""
    state_data = load_state()
    day        = state_data.get("current_day", 2)
    print(f"\n{'=' * 56}")
    print(f"  ABUJA STRIKE PREP — Day {day}/36")
    print(f"{'=' * 56}")

    gen = ContentGenerator()
    gen.current_day = day - 1
    state   = gen.get_next_state()
    caption = gen.generate_caption(state)

    print(f"\n✅ State: {state['name']}  |  Capital: {state.get('capital')}")
    print(f"✅ Caption: {len(caption)} chars")
    print(f"\n🎨 Generating graphic (Four-Pack Fallback)...")
    image_bytes = generate_graphic(state, day)
    pack = "graphic" if image_bytes else "text-only"
    print(f"✅ Graphic: {pack} ({len(image_bytes):,} bytes)" if image_bytes else "⚠️  No graphic — text-only")

    print(f"\n📲 Sending approval prompt to CEO Telegram ({CEO_TELEGRAM_ID})...")
    bot = Bot(token=TELEGRAM_BOT_TOKEN)
    async with bot:
        await send_approval_prompt(bot, day, state, caption, image_bytes)

    print(f"\n{'=' * 56}")
    print(f"  ✅ ABUJA PROMPT SENT")
    print(f"     Day {day}: {state['name']}")
    print(f"     CEO Telegram: {CEO_TELEGRAM_ID}")
    print(f"{'=' * 56}\n")


def main():
    # ── Validate env ──────────────────────────────────────────────────────────
    missing = []
    if not TELEGRAM_BOT_TOKEN: missing.append("TELEGRAM_BOT_TOKEN")
    if not CEO_TELEGRAM_ID:    missing.append("CEO_TELEGRAM_ID")
    if not LEKE_EMAIL:         missing.append("LEKE_LEKE_EMAIL")
    if not LEKE_PASSWORD:      missing.append("LEKE_LEKE_PASSWORD")
    if missing:
        print(f"❌ Missing env vars: {', '.join(missing)}")
        sys.exit(1)

    mode = "bot"
    if len(sys.argv) > 1:
        mode = sys.argv[1]

    if mode == "--send-now":
        # One-shot: send Abuja prompt and exit (no long-running bot)
        asyncio.run(_run_send_only())
        return

    # ── Full Supervisor Bot mode ──────────────────────────────────────────────
    print(f"\n{'=' * 56}")
    print("  AMD LEKEELEKEE SUPERVISOR BOT  v1.0")
    print(f"{'=' * 56}")
    print(f"  Telegram: {CEO_TELEGRAM_ID}")
    print(f"  Scheduler: 09:00 UTC daily")
    print(f"{'=' * 56}\n")

    app = build_app()

    # Fire the immediate Day 2 (Abuja) prompt on first startup
    async def post_init(application: Application):
        state_data = load_state()
        day        = state_data.get("current_day", 2)
        log.info(f"🚀 Post-init: sending immediate approval prompt for Day {day}")
        await _send_day_prompt(application.bot, day)
        log.info("✅ Immediate prompt sent — switching to long-poll mode")

    app.post_init = post_init

    log.info("🤖 Starting supervisor bot (polling)...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
