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

        # High-contrast gradient background
        for row in range(height):
            shade = int(10 + (row / height) * 24)
            draw.line([(0, row), (width, row)], fill=(shade, shade + 2, shade + 7))

        brand = "#FFD700"

        # Brand bars
        draw.rectangle([(0, 0), (width, 14)], fill=brand)
        draw.rectangle([(0, height - 14), (width, height)], fill=brand)

        # Cards
        draw.rounded_rectangle([(40, 34), (340, 122)], radius=18, fill="#121212", outline=brand, width=4)
        draw.rounded_rectangle([(70, 155), (width - 70, 495)], radius=24, fill="#101010", outline="#2D2D2D", width=2)
        draw.rounded_rectangle([(70, 520), (width - 70, 620)], radius=18, fill="#111111", outline="#2D2D2D", width=2)

        # Fonts
        day_font = self._load_font(48, bold=True)
        title_font = self._load_font(74, bold=True)
        subtitle_font = self._load_font(40, bold=True)
        story_font = self._load_font(30, bold=False)
        chip_font = self._load_font(24, bold=True)
        footer_font = self._load_font(28, bold=True)

        # Core text
        state = " ".join(state_name.upper().split())
        headline = self._headline_for_state(state_name)
        insight = self._extract_story_line(caption, state_name)

        draw.text((62, 54), f"DAY {day_number}/36", fill=brand, font=day_font)

        wrapped_headline = textwrap.wrap(headline, width=30)[:2]
        start_y = 212
        for idx, line in enumerate(wrapped_headline):
            self._centered_text(draw, line, start_y + (idx * 78), title_font, "#FFFFFF", width, stroke_width=2)

        subtitle = f"{state} TECH ECOSYSTEM"
        self._centered_text(draw, subtitle, 365, subtitle_font, brand, width)

        wrapped_insight = textwrap.wrap(insight, width=58)[:2]
        for idx, line in enumerate(wrapped_insight):
            self._centered_text(draw, line, 420 + (idx * 34), story_font, "#D9D9D9", width)

        # Metadata chips
        chip_y = 534
        chip_1 = f"CAPITAL: {capital.upper()}" if capital else "CAPITAL: N/A"
        chip_2 = f"ZONE: {zone.upper()}" if zone else "ZONE: N/A"
        draw.rounded_rectangle([(95, chip_y), (440, chip_y + 52)], radius=14, fill="#1A1A1A", outline=brand, width=2)
        draw.rounded_rectangle([(760, chip_y), (1105, chip_y + 52)], radius=14, fill="#1A1A1A", outline=brand, width=2)
        draw.text((118, chip_y + 13), chip_1, fill="#FFFFFF", font=chip_font)
        draw.text((786, chip_y + 13), chip_2, fill="#FFFFFF", font=chip_font)

        # Footer
        self._centered_text(draw, "AMD SOLUTIONS 007  |  BUILD IN NAIJA", 612, footer_font, "#FFFFFF", width)

        # Ecosystem motif lines
        nodes = [(210, 300), (360, 260), (520, 320), (690, 260), (860, 320), (990, 280)]
        for idx in range(len(nodes) - 1):
            draw.line([nodes[idx], nodes[idx + 1]], fill="#3A3A3A", width=2)
        for x, y in nodes:
            draw.ellipse([(x - 6, y - 6), (x + 6, y + 6)], fill=brand)

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
