"""
Graphic Generator for 36 States of Tech Campaign
Story-first visuals aligned to caption narrative.
"""

import os
import asyncio
import textwrap
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import google.generativeai as genai

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Output directory
GRAPHICS_DIR = "generated_graphics"
os.makedirs(GRAPHICS_DIR, exist_ok=True)


class GraphicGenerator:
    """Generates story-synced graphics for state spotlights."""

    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def _load_font(self, size: int, bold: bool = False):
        """Load cross-platform fonts with graceful fallback."""
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

        for font_path in candidates:
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue

        return ImageFont.load_default()

    def _centered_text(
        self,
        draw: ImageDraw.ImageDraw,
        text: str,
        y: int,
        font,
        fill: str,
        width: int,
        stroke_width: int = 0,
        stroke_fill: str = "#000000",
    ):
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        draw.text(
            (x, y),
            text,
            fill=fill,
            font=font,
            stroke_width=stroke_width,
            stroke_fill=stroke_fill,
        )

    def _extract_story_line(self, caption: str, state_name: str) -> str:
        """Extract one short insight line from caption for visual sync."""
        if not caption:
            return f"{state_name} creators are building bold digital solutions."

        lines = [line.strip() for line in caption.splitlines() if line.strip()]
        filtered = []
        for line in lines:
            upper = line.upper()
            if upper.startswith("🎯 DAY") or upper.startswith("INTEL BRIEF"):
                continue
            if upper.startswith("📍") or upper.startswith("🌐") or upper.startswith("💼") or upper.startswith("🚀"):
                continue
            if "http" in line.lower() or "#" in line:
                continue
            filtered.append(line)

        sentence = filtered[0] if filtered else f"{state_name} builders are driving innovation across Nigeria."
        return sentence[:110].rstrip(" .") + "."

    def _headline_for_state(self, state_name: str) -> str:
        return f"{state_name.upper()} BUILDS NIGERIA'S NEXT TECH WAVE"

    def _hero_palette(self):
        return {
            "bg_top": (6, 10, 24),
            "bg_bottom": (16, 22, 38),
            "gold": (255, 215, 0),
            "gold_soft": (220, 180, 32),
            "white": (245, 247, 252),
            "muted": (182, 191, 207),
            "panel": (10, 14, 24),
            "teal": (74, 201, 196),
        }

    async def generate_state_graphic(
        self,
        state_name: str,
        day_number: int,
        caption: str = "",
        zone: str = "",
        capital: str = "",
    ) -> str:
        """Generate story-aligned social graphic."""
        print(f"🎨 Generating graphic for {state_name} (Day {day_number}/36)...")
        graphic_path = self._create_template_graphic(
            state_name=state_name,
            day_number=day_number,
            caption=caption,
            zone=zone,
            capital=capital,
        )
        print(f"✅ Graphic saved: {graphic_path}")
        return graphic_path

    def _create_template_graphic(
        self,
        state_name: str,
        day_number: int,
        caption: str = "",
        zone: str = "",
        capital: str = "",
    ) -> str:
        width, height = 1200, 675
        img = Image.new("RGB", (width, height), color="#000000")
        draw = ImageDraw.Draw(img)

        colors = self._hero_palette()

        # Cinematic gradient background
        for row in range(height):
            ratio = row / max(height - 1, 1)
            r = int(colors["bg_top"][0] * (1 - ratio) + colors["bg_bottom"][0] * ratio)
            g = int(colors["bg_top"][1] * (1 - ratio) + colors["bg_bottom"][1] * ratio)
            b = int(colors["bg_top"][2] * (1 - ratio) + colors["bg_bottom"][2] * ratio)
            draw.line([(0, row), (width, row)], fill=(r, g, b))

        # Subtle city-light glow
        draw.ellipse([(-180, 420), (420, 940)], fill=(34, 46, 78))
        draw.ellipse([(730, 340), (1320, 910)], fill=(22, 54, 66))

        brand = colors["gold"]

        # Brand bars
        draw.rectangle([(0, 0), (width, 10)], fill=brand)
        draw.rectangle([(0, height - 10), (width, height)], fill=brand)

        # Hero cards
        draw.rounded_rectangle([(42, 28), (286, 94)], radius=14, fill=colors["panel"], outline=brand, width=2)
        draw.rounded_rectangle([(48, 108), (812, 548)], radius=28, fill=(7, 11, 19), outline=(38, 44, 62), width=2)
        draw.rounded_rectangle([(838, 108), (1152, 548)], radius=22, fill=(8, 14, 24), outline=(34, 50, 76), width=2)
        draw.rounded_rectangle([(48, 566), (1152, 638)], radius=16, fill=(9, 13, 21), outline=(35, 45, 68), width=1)

        # Fonts
        day_font = self._load_font(30, bold=True)
        title_font = self._load_font(64, bold=True)
        subtitle_font = self._load_font(34, bold=True)
        story_font = self._load_font(26, bold=False)
        chip_font = self._load_font(22, bold=True)
        footer_font = self._load_font(24, bold=True)
        state_font = self._load_font(86, bold=True)

        # Core text
        state = " ".join(state_name.upper().split())
        headline = self._headline_for_state(state_name)
        insight = self._extract_story_line(caption, state_name)

        draw.text((60, 46), f"DAY {day_number}/36", fill=brand, font=day_font)

        # Builder silhouette + desk motif (story visual)
        # Head
        draw.ellipse([(170, 250), (245, 325)], fill=(55, 73, 109))
        # Body
        draw.rounded_rectangle([(140, 320), (282, 510)], radius=26, fill=(40, 56, 92))
        # Laptop
        draw.rounded_rectangle([(250, 395), (530, 500)], radius=10, fill=(18, 33, 62), outline=colors["teal"], width=2)
        draw.rectangle([(274, 420), (506, 478)], fill=(12, 22, 40))
        # Holographic lines
        for offset in range(0, 210, 24):
            draw.line([(286, 428 + offset // 4), (496, 428 + offset // 4)], fill=(45, 160, 170), width=1)

        # State hero word
        draw.text((540, 176), state, fill=colors["white"], font=state_font, stroke_width=2, stroke_fill="#000000")

        wrapped_headline = textwrap.wrap(headline, width=30)[:2]
        start_y = 286
        for idx, line in enumerate(wrapped_headline):
            draw.text((540, start_y + (idx * 66)), line, fill=colors["white"], font=title_font, stroke_width=1, stroke_fill="#000000")

        subtitle = f"{state} TECH ECOSYSTEM"
        draw.text((540, 430), subtitle, fill=brand, font=subtitle_font)

        wrapped_insight = textwrap.wrap(insight, width=58)[:2]
        for idx, line in enumerate(wrapped_insight):
            draw.text((540, 470 + (idx * 30)), line, fill=colors["muted"], font=story_font)

        # Right-side insight panel
        draw.text((866, 140), "LIVE SIGNAL", fill=brand, font=chip_font)
        draw.text((866, 182), "Builders", fill=colors["white"], font=chip_font)
        draw.text((866, 214), "Creators", fill=colors["white"], font=chip_font)
        draw.text((866, 246), "Innovation", fill=colors["white"], font=chip_font)

        # Metadata chips
        chip_y = 578
        chip_1 = f"CAPITAL: {capital.upper()}" if capital else "CAPITAL: N/A"
        chip_2 = f"ZONE: {zone.upper()}" if zone else "ZONE: N/A"
        draw.rounded_rectangle([(74, chip_y), (426, chip_y + 44)], radius=12, fill=(16, 20, 31), outline=brand, width=2)
        draw.rounded_rectangle([(774, chip_y), (1126, chip_y + 44)], radius=12, fill=(16, 20, 31), outline=brand, width=2)
        draw.text((95, chip_y + 10), chip_1, fill=colors["white"], font=chip_font)
        draw.text((800, chip_y + 10), chip_2, fill=colors["white"], font=chip_font)

        # Footer
        self._centered_text(draw, "AMD SOLUTIONS 007  |  BUILD IN NAIJA", 610, footer_font, "#FFFFFF", width)

        # Ecosystem signal motif
        nodes = [(878, 314), (942, 274), (1006, 334), (1070, 286)]
        for idx in range(len(nodes) - 1):
            draw.line([nodes[idx], nodes[idx + 1]], fill=(72, 150, 160), width=2)
        for x, y in nodes:
            draw.ellipse([(x - 5, y - 5), (x + 5, y + 5)], fill=brand)

        filename = f"state_{day_number:02d}_{state_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.png"
        filepath = os.path.join(GRAPHICS_DIR, filename)
        img.save(filepath, format="PNG", optimize=True)
        return filepath


async def demo():
    generator = GraphicGenerator()
    test_states = ["Lagos", "Abia", "Kano"]
    for index, state in enumerate(test_states, 1):
        path = await generator.generate_state_graphic(
            state_name=state,
            day_number=index,
            caption=f"{state} is part of Nigeria's growing digital ecosystem.",
            zone="South East" if state == "Abia" else "Nigeria",
            capital="Umuahia" if state == "Abia" else "N/A",
        )
        print(f"✅ Generated: {path}")


if __name__ == "__main__":
    asyncio.run(demo())
