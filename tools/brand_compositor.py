#!/usr/bin/env python3
"""
AMD Brand Compositor
====================
Takes an AI-generated background image (bytes) and composites
the full AMD brand overlay on top:

  ┌─────────────────────────────────────┐
  │ [DAY 02/36]           [orange stripe]│  ← top bar
  │                                      │
  │     AI BACKGROUND IMAGE              │
  │                                      │
  │  ABUJA              ← state name     │
  │  TECH ECOSYSTEM     ← subtitle       │
  │  ─────────────────                   │
  │  📍 Capital: Abuja                   │
  │  🌍 Zone: North Central              │
  │  💡 DID YOU KNOW?                    │
  │  [fun fact line]                     │
  ├──────────────────────────────────────│
  │ [AMD LOGO] AMD SOLUTIONS 007 · BUILD │  ← footer bar
  │             IN NAIJA · amdsol..      │
  └─────────────────────────────────────┘

Reference: Lagos card at Day 1 confirmed brand standard.
"""

import io
import os
import textwrap
from pathlib import Path
from typing import Optional

ROOT       = Path(__file__).resolve().parent.parent
LOGO_PATH  = ROOT / "assets" / "amd_logo.png"
CACHE_DIR  = ROOT / "tools" / "graphic_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ── Colour Palette ────────────────────────────────────────────────────────────
NAVY    = (15, 23, 42)          # #0F1722
ORANGE  = (255, 107, 0)         # #FF6B00
WHITE   = (255, 255, 255)
GOLD    = (255, 185, 0)         # #FFB900
GREY    = (200, 210, 220)
BLACK   = (0, 0, 0)

# ── Font loader ───────────────────────────────────────────────────────────────
def _font(size: int, bold: bool = False):
    from PIL import ImageFont
    candidates = [
        "/System/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


# ── Cache helpers ─────────────────────────────────────────────────────────────
def cache_path(day: int, state_name: str) -> Path:
    slug = state_name.lower().replace(" ", "_").replace("/", "")
    return CACHE_DIR / f"day_{day:02d}_{slug}.png"


def load_cached(day: int, state_name: str) -> Optional[bytes]:
    p = cache_path(day, state_name)
    if p.exists():
        return p.read_bytes()
    return None


def save_cached(day: int, state_name: str, data: bytes):
    p = cache_path(day, state_name)
    p.write_bytes(data)


# ── Main compositor ───────────────────────────────────────────────────────────
def composite(
    ai_image_bytes: bytes,
    state: dict,
    day: int,
    total_days: int = 36,
) -> bytes:
    """
    Composite AMD brand overlay onto the AI-generated background.
    Returns PNG bytes of the branded card.
    """
    from PIL import Image, ImageDraw, ImageFilter

    W, H = 1024, 1024

    # ── Load & prepare background ─────────────────────────────────────────────
    try:
        bg = Image.open(io.BytesIO(ai_image_bytes)).convert("RGBA").resize((W, H))
    except Exception:
        bg = Image.new("RGBA", (W, H), (*NAVY, 255))

    canvas = bg.copy()
    draw   = ImageDraw.Draw(canvas, "RGBA")

    # ── Dark gradient scrim — top strip ───────────────────────────────────────
    scrim_h = 140
    for y in range(scrim_h):
        alpha = int(200 * (1 - y / scrim_h))
        draw.line([(0, y), (W, y)], fill=(*NAVY, alpha))

    # ── Dark gradient scrim — bottom strip ────────────────────────────────────
    footer_h = 220
    for y in range(footer_h):
        alpha = int(220 * (y / footer_h))
        draw.line([(0, H - footer_h + y), (W, H - footer_h + y)], fill=(*NAVY, alpha))

    # ── Orange top accent bar ─────────────────────────────────────────────────
    draw.rectangle([(0, 0), (W, 8)], fill=(*ORANGE, 255))

    # ── DAY badge (top-left) ──────────────────────────────────────────────────
    badge_x, badge_y = 28, 22
    badge_w, badge_h = 190, 68
    draw.rounded_rectangle(
        [(badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h)],
        radius=10,
        fill=(*ORANGE, 245),
    )
    f_badge_num  = _font(36, bold=True)
    f_badge_of   = _font(22, bold=False)
    draw.text((badge_x + 14, badge_y + 8),  f"DAY {day:02d}",  font=f_badge_num, fill=WHITE)
    draw.text((badge_x + 14, badge_y + 44), f"/ {total_days}", font=f_badge_of,  fill=WHITE)

    # ── "TECH ECOSYSTEM" top-right label ─────────────────────────────────────
    f_eco = _font(22, bold=False)
    draw.text((W - 24, badge_y + 24), "TECH ECOSYSTEM", font=f_eco, fill=(*GOLD, 230), anchor="rm")

    # ── State name (large, lower section) ────────────────────────────────────
    name = state.get("name", "").upper()
    f_name = _font(100, bold=True)
    # Auto-shrink if too long
    while True:
        try:
            bbox = draw.textbbox((0, 0), name, font=f_name)
            tw = bbox[2] - bbox[0]
        except Exception:
            tw = len(name) * 60
        if tw < W - 80 or f_name.size <= 44:
            break
        f_name = _font(f_name.size - 8, bold=True)

    text_y = H - footer_h - 20
    # Shadow
    draw.text((W // 2 + 3, text_y + 3), name, font=f_name, fill=(*BLACK, 120), anchor="mb")
    draw.text((W // 2, text_y), name, font=f_name, fill=WHITE, anchor="mb")

    # Orange underline
    try:
        bbox = draw.textbbox((W // 2, text_y), name, font=f_name, anchor="mb")
        ul_x1, ul_x2 = bbox[0] - 10, bbox[2] + 10
    except Exception:
        ul_x1, ul_x2 = W // 2 - 200, W // 2 + 200
    draw.rectangle([(ul_x1, text_y + 6), (ul_x2, text_y + 12)], fill=(*ORANGE, 230))

    # ── Info lines (capital / zone / hubs) ───────────────────────────────────
    f_info = _font(28, bold=False)
    f_info_b = _font(28, bold=True)
    lines = []
    capital = state.get("capital", "")
    zone    = state.get("zone", "")
    hubs    = state.get("tech_hubs", [])
    if capital:
        lines.append(f"📍  Capital: {capital}")
    if zone:
        lines.append(f"🌍  Zone: {zone}")
    if hubs:
        hub_str = ", ".join(hubs[:2])
        # Wrap long hub names
        wrapped = textwrap.fill(f"🏢  {hub_str}", width=38)
        lines.extend(wrapped.split("\n"))

    info_y = text_y + 24
    for line in lines[:4]:
        draw.text((60, info_y), line, font=f_info, fill=(*GREY, 220))
        info_y += 38

    # ── DID YOU KNOW section ─────────────────────────────────────────────────
    did_you_know = state.get("fun_fact", state.get("did_you_know", ""))
    if did_you_know:
        f_dyk_head = _font(22, bold=True)
        f_dyk_body = _font(21, bold=False)
        dyk_y = info_y + 8
        draw.text((60, dyk_y), "💡  DID YOU KNOW?", font=f_dyk_head, fill=(*GOLD, 230))
        dyk_y += 30
        wrapped_fact = textwrap.fill(did_you_know, width=48)
        for fl in wrapped_fact.split("\n")[:2]:
            draw.text((60, dyk_y), fl, font=f_dyk_body, fill=(*GREY, 200))
            dyk_y += 26

    # ── Footer bar ────────────────────────────────────────────────────────────
    footer_bar_y = H - 68
    draw.rectangle([(0, footer_bar_y), (W, H)], fill=(*NAVY, 245))
    draw.rectangle([(0, footer_bar_y), (W, footer_bar_y + 3)], fill=(*ORANGE, 200))

    # AMD Logo (left of footer)
    logo_size = 48
    logo_x, logo_y = 20, footer_bar_y + (68 - logo_size) // 2
    try:
        logo_raw = Image.open(LOGO_PATH).convert("RGBA").resize((logo_size, logo_size))
        canvas.paste(logo_raw, (logo_x, logo_y), logo_raw)
        text_logo_x = logo_x + logo_size + 14
    except Exception:
        # Draw AMD text as fallback
        draw.text((logo_x, footer_bar_y + 18), "AMD", font=_font(32, bold=True), fill=ORANGE)
        text_logo_x = logo_x + 60

    # Brand text
    f_footer = _font(24, bold=True)
    f_footer_sub = _font(20, bold=False)
    draw.text((text_logo_x, footer_bar_y + 10), "AMD SOLUTIONS 007", font=f_footer, fill=WHITE)
    draw.text((text_logo_x, footer_bar_y + 36), "BUILD IN NAIJA  ·  amdsolutions007.com", font=f_footer_sub, fill=(*GREY, 200))

    # ── Convert to PNG bytes ──────────────────────────────────────────────────
    out = canvas.convert("RGB")
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
