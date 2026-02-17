"""
Graphic Generator for 36 States of Tech Campaign
Hero Poster Mode: cinematic, caption-synced, thumbnail-legible.
"""

import os
import asyncio
import textwrap
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter

try:
    import google.generativeai as genai
except ImportError:
    genai = None

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if genai and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

GRAPHICS_DIR = "generated_graphics"
os.makedirs(GRAPHICS_DIR, exist_ok=True)


class GraphicGenerator:
    """Generates high-impact story posters for state spotlights."""

    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash") if genai else None

    def _load_font(self, size: int, bold: bool = False):
        if bold:
            candidates = [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
            ]
        else:
            candidates = [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
            ]

        for path in candidates:
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
        return ImageFont.load_default()

    def _extract_story_line(self, caption: str, state_name: str) -> str:
        if not caption:
            return f"{state_name} creators are building momentum across Nigeria."

        lines = [line.strip() for line in caption.splitlines() if line.strip()]
        filtered = []
        for line in lines:
            upper = line.upper()
            if upper.startswith("🎯 DAY") or upper.startswith("INTEL BRIEF"):
                continue
            if upper.startswith("📍") or upper.startswith("🌐") or upper.startswith("💼") or upper.startswith("🚀"):
                continue
            if line.startswith("http") or "#" in line:
                continue
            filtered.append(line)

        if not filtered:
            return f"{state_name} builders are driving innovation across fintech, edtech, and creator-tech."

        return filtered[0][:120].rstrip(" .") + "."

    def _headline_for_state(self, state_name: str) -> str:
        return f"{state_name.upper()} BUILDS NIGERIA'S NEXT TECH WAVE"

    def _theme_palette(self, caption: str):
        text = (caption or "").lower()
        if any(word in text for word in ["power", "electric", "grid", "energy"]):
            return {
                "bg_top": (7, 16, 30),
                "bg_bottom": (20, 38, 70),
                "accent": (44, 209, 255),
                "accent2": (255, 215, 0),
                "text": (245, 247, 252),
                "muted": (186, 202, 221),
            }
        if any(word in text for word in ["build", "creator", "startup", "innovation"]):
            return {
                "bg_top": (8, 11, 23),
                "bg_bottom": (22, 34, 57),
                "accent": (255, 215, 0),
                "accent2": (88, 214, 196),
                "text": (247, 249, 252),
                "muted": (192, 200, 215),
            }
        return {
            "bg_top": (10, 12, 20),
            "bg_bottom": (28, 35, 52),
            "accent": (255, 215, 0),
            "accent2": (124, 157, 255),
            "text": (247, 249, 252),
            "muted": (192, 200, 215),
        }

    def _draw_text_with_wrap(self, draw: ImageDraw.ImageDraw, text: str, x: int, y: int, max_width: int, font, fill, line_gap: int = 8):
        wrapped = textwrap.wrap(text, width=max_width)
        cy = y
        for line in wrapped:
            draw.text((x, cy), line, fill=fill, font=font)
            bbox = draw.textbbox((x, cy), line, font=font)
            cy += (bbox[3] - bbox[1]) + line_gap
        return cy

    async def generate_state_graphic(
        self,
        state_name: str,
        day_number: int,
        caption: str = "",
        zone: str = "",
        capital: str = "",
    ) -> str:
        print(f"🎨 Generating HERO poster for {state_name} (Day {day_number}/36)...")
        path = self._create_hero_poster(
            state_name=state_name,
            day_number=day_number,
            caption=caption,
            zone=zone,
            capital=capital,
        )
        print(f"✅ Graphic saved: {path}")
        return path

    def _create_hero_poster(self, state_name: str, day_number: int, caption: str = "", zone: str = "", capital: str = "") -> str:
        width, height = 1200, 675
        colors = self._theme_palette(caption)

        img = Image.new("RGB", (width, height), color=(0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Cinematic gradient background
        for y in range(height):
            ratio = y / max(height - 1, 1)
            r = int(colors["bg_top"][0] * (1 - ratio) + colors["bg_bottom"][0] * ratio)
            g = int(colors["bg_top"][1] * (1 - ratio) + colors["bg_bottom"][1] * ratio)
            b = int(colors["bg_top"][2] * (1 - ratio) + colors["bg_bottom"][2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Soft light beams
        draw.polygon([(0, height), (430, 210), (530, 260), (120, height)], fill=(24, 45, 76))
        draw.polygon([(width, height), (760, 220), (680, 290), (1040, height)], fill=(14, 60, 70))

        # Add subtle blur glow layer
        glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        glow_draw.ellipse((740, 120, 1210, 560), fill=(colors["accent2"][0], colors["accent2"][1], colors["accent2"][2], 58))
        glow_draw.ellipse((-120, 160, 480, 760), fill=(colors["accent"][0], colors["accent"][1], colors["accent"][2], 36))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=48))
        img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
        draw = ImageDraw.Draw(img)

        # Top and bottom brand bars
        draw.rectangle([(0, 0), (width, 10)], fill=colors["accent"])
        draw.rectangle([(0, height - 10), (width, height)], fill=colors["accent"])

        # DAY badge
        draw.rounded_rectangle([(42, 30), (300, 90)], radius=14, fill=(9, 12, 20), outline=colors["accent"], width=2)
        day_font = self._load_font(28, bold=True)
        draw.text((62, 46), f"DAY {day_number}/36", fill=colors["accent"], font=day_font)

        # Hero headline and subheadline
        state = " ".join(state_name.upper().split())
        headline = self._headline_for_state(state_name)
        insight = self._extract_story_line(caption, state_name)

        title_font = self._load_font(74, bold=True)
        sub_font = self._load_font(38, bold=True)
        insight_font = self._load_font(28, bold=False)

        # Left hero panel
        draw.rounded_rectangle([(48, 120), (880, 560)], radius=30, fill=(7, 11, 18), outline=(36, 45, 62), width=2)

        # Hero title block
        y_start = 170
        for line in textwrap.wrap(headline, width=23)[:2]:
            draw.text((92, y_start), line, fill=colors["text"], font=title_font, stroke_width=2, stroke_fill="#000000")
            y_start += 82

        draw.text((92, y_start + 8), f"{state} TECH ECOSYSTEM", fill=colors["accent"], font=sub_font)

        # Insight sentence (caption sync)
        self._draw_text_with_wrap(draw, insight, 92, y_start + 72, 56, insight_font, colors["muted"], line_gap=6)

        # Right signal panel
        draw.rounded_rectangle([(910, 120), (1150, 560)], radius=24, fill=(8, 14, 24), outline=(34, 58, 88), width=2)
        chip_font = self._load_font(22, bold=True)
        draw.text((940, 145), "LIVE SIGNAL", fill=colors["accent"], font=chip_font)
        draw.text((940, 198), "Builders", fill=colors["text"], font=chip_font)
        draw.text((940, 236), "Creators", fill=colors["text"], font=chip_font)
        draw.text((940, 274), "Innovation", fill=colors["text"], font=chip_font)

        # Simple chart motif
        pts = [(954, 350), (1018, 308), (1078, 372), (1132, 326)]
        for i in range(len(pts) - 1):
            draw.line([pts[i], pts[i + 1]], fill=colors["accent2"], width=3)
        for x, y in pts:
            draw.ellipse([(x - 7, y - 7), (x + 7, y + 7)], fill=colors["accent"])

        # Metadata chips
        chip_y = 578
        chip_fill = (14, 20, 31)
        draw.rounded_rectangle([(74, chip_y), (432, chip_y + 44)], radius=12, fill=chip_fill, outline=colors["accent"], width=2)
        draw.rounded_rectangle([(768, chip_y), (1126, chip_y + 44)], radius=12, fill=chip_fill, outline=colors["accent"], width=2)
        chip_text_font = self._load_font(21, bold=True)
        draw.text((95, chip_y + 10), f"CAPITAL: {(capital or 'N/A').upper()}", fill=colors["text"], font=chip_text_font)
        draw.text((794, chip_y + 10), f"ZONE: {(zone or 'N/A').upper()}", fill=colors["text"], font=chip_text_font)

        # Footer brand
        footer_font = self._load_font(23, bold=True)
        footer = "AMD SOLUTIONS 007  |  BUILD IN NAIJA"
        bbox = draw.textbbox((0, 0), footer, font=footer_font)
        fx = (width - (bbox[2] - bbox[0])) // 2
        draw.text((fx, 620), footer, fill=colors["text"], font=footer_font)

        filename = f"state_{day_number:02d}_{state_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.png"
        filepath = os.path.join(GRAPHICS_DIR, filename)
        img.save(filepath, format="PNG", optimize=True)
        return filepath


async def demo():
    generator = GraphicGenerator()
    for idx, state in enumerate(["Abia", "Lagos", "Kano"], 1):
        path = await generator.generate_state_graphic(
            state_name=state,
            day_number=idx,
            caption=f"{state} is part of Nigeria's growing digital economy, with builders and creators driving innovation.",
            zone="South East" if state == "Abia" else "Nigeria",
            capital="Umuahia" if state == "Abia" else "N/A",
        )
        print(f"✅ Generated: {path}")


if __name__ == "__main__":
    asyncio.run(demo())
