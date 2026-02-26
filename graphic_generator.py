"""
Graphic Generator for 36 States of Tech Campaign
Generation-first pipeline: OpenAI image variants + quality scoring + readable overlays.
"""

import asyncio
import base64
import io
import os
import random
import textwrap
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


GRAPHICS_DIR = "generated_graphics"
os.makedirs(GRAPHICS_DIR, exist_ok=True)


class GraphicGenerator:
    """Generates campaign-grade state posters for Telegram review."""

    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.openai_model = "dall-e-3"
        self.openai_size = "1024x1024"
        self.client = OpenAI(api_key=self.openai_api_key) if (OpenAI and self.openai_api_key) else None

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

        return filtered[0][:140].rstrip(" .") + "."

    def _headline_for_state(self, state_name: str) -> str:
        return f"{state_name.upper()} BUILDS NIGERIA'S NEXT TECH WAVE"

    def _style_tracks(self, caption: str) -> List[str]:
        text = (caption or "").lower()
        if any(word in text for word in ["power", "electric", "energy", "grid"]):
            return ["cinematic documentary photo, modern African energy infrastructure, dramatic sunlight, deep blacks and glowing gold light"]
        if any(word in text for word in ["build", "creator", "startup", "innovation"]):
            return ["cinematic portrait of builders in a premium African tech environment, high-tech atmosphere, deep black tones and vibrant gold accents"]
        return ["premium cinematic campaign visual, futuristic African tech ecosystem, deep cinematic blacks, vibrant glowing gold highlights, world-class editorial quality"]

    def _build_prompt(self, state_name: str, day_number: int, caption: str, style_track: str) -> str:
        insight = self._extract_story_line(caption, state_name)
        return (
            "Create a world-class social media campaign background image for an African technology spotlight series. "
            f"Location: {state_name}, Nigeria. "
            f"Visual narrative: {insight} "
            f"Art direction: {style_track}. "
            "AMD AESTHETIC — COLOR PALETTE: deep cinematic blacks as the dominant background tone, "
            "vibrant glowing gold accents as the primary highlight color, subtle dark navy and charcoal mid-tones. "
            "The mood must be high-tech, premium, futuristic, and aspirational — representing a world-class African tech ecosystem. "
            "COMPOSITION: leave clear open negative space in the lower-left and center-left zones for text overlays. "
            "Place cinematic subject matter in the right half or upper regions. Depth, bokeh, dramatic lighting preferred. "
            "No embedded text, no logos, no watermarks, no UI elements, no charts, no infographics. "
            "Aspect ratio: 1:1 square, suitable for Instagram and high-performing social media. "
            f"This is Day {day_number} of a 36-state series — the visual must feel unique and distinct from generic stock imagery."
        )

    def _score_image_quality(self, image: Image.Image) -> float:
        rgb = image.convert("RGB")
        lum = rgb.convert("L")
        lum_stats = ImageStat.Stat(lum)
        contrast = lum_stats.stddev[0]

        edges = lum.filter(ImageFilter.FIND_EDGES)
        edge_stats = ImageStat.Stat(edges)
        edge_energy = edge_stats.mean[0]

        hsv = rgb.convert("HSV")
        sat = hsv.split()[1]
        sat_stats = ImageStat.Stat(sat)
        saturation = sat_stats.mean[0]

        return (contrast * 0.5) + (edge_energy * 0.3) + (saturation * 0.2)

    def _decode_generated_image(self, b64_data: str) -> Optional[Image.Image]:
        try:
            raw = base64.b64decode(b64_data)
            return Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception:
            return None

    def _generate_background_candidates(
        self, state_name: str, day_number: int, caption: str
    ) -> List[Image.Image]:
        if not self.client:
            return []

        candidates: List[Image.Image] = []
        for style_track in self._style_tracks(caption):
            prompt = self._build_prompt(state_name, day_number, caption, style_track)
            try:
                response = self.client.images.generate(
                    model=self.openai_model,
                    prompt=prompt,
                    size=self.openai_size,
                    response_format="b64_json",
                )
            except Exception as exc:
                print(f"⚠️ OpenAI generation failed for one variant: {exc}")
                continue

            if not getattr(response, "data", None):
                continue

            first = response.data[0]
            b64_data = getattr(first, "b64_json", None)
            if not b64_data:
                continue

            image = self._decode_generated_image(b64_data)
            if image:
                candidates.append(image)

        return candidates

    def _select_best_candidate(self, candidates: List[Image.Image]) -> Optional[Image.Image]:
        if not candidates:
            return None
        scored = [(self._score_image_quality(img), img) for img in candidates]
        scored.sort(key=lambda pair: pair[0], reverse=True)
        return scored[0][1]

    def _create_pro_fallback_background(self, caption: str, width: int, height: int) -> Image.Image:
        print("⚠️ Using fallback background generator (OpenAI unavailable).")
        seed = abs(hash((caption or "", datetime.now().date().isoformat()))) % (10**6)
        rng = random.Random(seed)

        img = Image.new("RGB", (width, height), (8, 11, 22))
        draw = ImageDraw.Draw(img)

        top = (8, 14, 32)
        bottom = (24, 40, 70)
        for y in range(height):
            ratio = y / max(1, (height - 1))
            r = int(top[0] * (1 - ratio) + bottom[0] * ratio)
            g = int(top[1] * (1 - ratio) + bottom[1] * ratio)
            b = int(top[2] * (1 - ratio) + bottom[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        for _ in range(14):
            x1 = rng.randint(-200, width)
            y1 = rng.randint(-100, height)
            x2 = x1 + rng.randint(180, 480)
            y2 = y1 + rng.randint(90, 320)
            color = (rng.randint(30, 90), rng.randint(60, 140), rng.randint(100, 180), rng.randint(35, 85))
            layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            layer_draw = ImageDraw.Draw(layer)
            layer_draw.rounded_rectangle([(x1, y1), (x2, y2)], radius=rng.randint(16, 42), fill=color)
            layer = layer.filter(ImageFilter.GaussianBlur(radius=rng.randint(8, 20)))
            img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

        return img

    def _fit_to_canvas(self, image: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
        target_w, target_h = target_size
        src_w, src_h = image.size
        src_ratio = src_w / max(1, src_h)
        target_ratio = target_w / max(1, target_h)

        if src_ratio > target_ratio:
            new_h = target_h
            new_w = int(new_h * src_ratio)
        else:
            new_w = target_w
            new_h = int(new_w / src_ratio)

        resized = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
        left = (new_w - target_w) // 2
        top = (new_h - target_h) // 2
        return resized.crop((left, top, left + target_w, top + target_h))

    def _wrap_by_pixel_width(self, draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> List[str]:
        words = text.split()
        lines: List[str] = []
        current = ""
        for word in words:
            test = word if not current else f"{current} {word}"
            bbox = draw.textbbox((0, 0), test, font=font)
            if (bbox[2] - bbox[0]) <= max_width:
                current = test
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    def _choose_layout(self, state_name: str, day_number: int) -> str:
        layouts = ["left_stack", "center_band", "bottom_story"]
        return layouts[abs(hash(f"{state_name}_{day_number}")) % len(layouts)]

    def _apply_text_overlays(
        self,
        image: Image.Image,
        state_name: str,
        day_number: int,
        caption: str,
        zone: str,
        capital: str,
    ) -> Image.Image:
        width, height = image.size
        img = image.convert("RGB")
        layout = self._choose_layout(state_name, day_number)

        shade = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        shade_draw = ImageDraw.Draw(shade)
        if layout == "left_stack":
            shade_draw.rounded_rectangle([(42, 105), (760, 560)], radius=28, fill=(4, 8, 16, 172))
        elif layout == "center_band":
            shade_draw.rounded_rectangle([(90, 160), (1110, 520)], radius=28, fill=(4, 8, 16, 165))
        else:
            shade_draw.rounded_rectangle([(56, 300), (1140, 596)], radius=28, fill=(4, 8, 16, 175))
        img = Image.alpha_composite(img.convert("RGBA"), shade).convert("RGB")

        draw = ImageDraw.Draw(img)
        accent = (255, 215, 0)
        white = (246, 249, 255)
        muted = (197, 210, 232)

        draw.rectangle([(0, 0), (width, 9)], fill=accent)
        draw.rectangle([(0, height - 9), (width, height)], fill=accent)

        day_font = self._load_font(28, bold=True)
        draw.rounded_rectangle([(38, 24), (290, 86)], radius=14, fill=(7, 12, 24), outline=accent, width=2)
        draw.text((58, 42), f"DAY {day_number}/36", fill=accent, font=day_font)

        headline = self._headline_for_state(state_name)
        story = self._extract_story_line(caption, state_name)

        title_font = self._load_font(66, bold=True)
        subtitle_font = self._load_font(36, bold=True)
        story_font = self._load_font(29, bold=False)

        if layout == "left_stack":
            tx, ty, max_width = 86, 150, 620
        elif layout == "center_band":
            tx, ty, max_width = 120, 200, 960
        else:
            tx, ty, max_width = 92, 336, 1020

        title_lines = self._wrap_by_pixel_width(draw, headline, title_font, max_width)
        cy = ty
        for line in title_lines[:2]:
            draw.text((tx, cy), line, fill=white, font=title_font, stroke_width=2, stroke_fill="#000000")
            cy += 76

        sub = f"{state_name.upper()} TECH ECOSYSTEM"
        draw.text((tx, cy + 4), sub, fill=accent, font=subtitle_font)
        cy += 62

        story_lines = self._wrap_by_pixel_width(draw, story, story_font, max_width)
        for line in story_lines[:3]:
            draw.text((tx, cy), line, fill=muted, font=story_font)
            cy += 38

        chip_font = self._load_font(22, bold=True)
        chip_fill = (10, 16, 28)
        chip_y = 578
        draw.rounded_rectangle([(74, chip_y), (432, chip_y + 44)], radius=12, fill=chip_fill, outline=accent, width=2)
        draw.rounded_rectangle([(768, chip_y), (1126, chip_y + 44)], radius=12, fill=chip_fill, outline=accent, width=2)
        draw.text((95, chip_y + 10), f"CAPITAL: {(capital or 'N/A').upper()}", fill=white, font=chip_font)
        draw.text((794, chip_y + 10), f"ZONE: {(zone or 'N/A').upper()}", fill=white, font=chip_font)

        footer_font = self._load_font(23, bold=True)
        footer = "AMD SOLUTIONS 007  |  BUILD IN NAIJA"
        bbox = draw.textbbox((0, 0), footer, font=footer_font)
        fx = (width - (bbox[2] - bbox[0])) // 2
        draw.text((fx, 620), footer, fill=white, font=footer_font)

        return img

    async def generate_state_graphic(
        self,
        state_name: str,
        day_number: int,
        caption: str = "",
        zone: str = "",
        capital: str = "",
    ) -> str:
        print(f"🎨 Generating state poster for {state_name} (Day {day_number}/36)...")

        candidates = self._generate_background_candidates(state_name, day_number, caption)
        best = self._select_best_candidate(candidates)

        width, height = 1200, 675
        if best is None:
            best = self._create_pro_fallback_background(caption, width, height)
        else:
            best = self._fit_to_canvas(best, (width, height))

        final = self._apply_text_overlays(
            image=best,
            state_name=state_name,
            day_number=day_number,
            caption=caption,
            zone=zone,
            capital=capital,
        )

        filename = f"state_{day_number:02d}_{state_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.png"
        filepath = os.path.join(GRAPHICS_DIR, filename)
        final.save(filepath, format="PNG", optimize=True)
        print(f"✅ Graphic saved: {filepath}")
        return filepath



