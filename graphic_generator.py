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
            return ["cinematic documentary photograph of modern African energy infrastructure, dramatic neon-green ambient lighting, deep black skies, crisp white highlights, vivid tech-green glows"]
        if any(word in text for word in ["build", "creator", "startup", "innovation"]):
            return ["cinematic close-up portrait of African tech builders in a premium high-tech lab, deep black tones, vivid green neon highlights, white fill lighting, editorial quality"]
        return ["premium cinematic campaign visual, futuristic African tech ecosystem, deep cinematic black background, vibrant neon green (#00C853) accent lighting, crisp white highlights, world-class editorial quality, zero gold or yellow"]

    # Hyper-local landmark cues per Nigerian state
    _STATE_LOCAL_CUES = {
        "Abia": "Umuahia city market architecture and Ariaria trade hub",
        "Adamawa": "Mandara Mountains dramatic ridgelines and Yola riverfront",
        "Akwa Ibom": "coastal mangrove waterways, Ibom plaza skyline, Uyo boulevards",
        "Anambra": "Onitsha Niger Bridge and bustling riverside commerce",
        "Bauchi": "Yankari savannah landscape and ancient Bauchi emirate walls",
        "Bayelsa": "Niger Delta creek channels, stilted riverside communities",
        "Benue": "Benue River valley farmlands, the Tiv homeland rolling hills",
        "Borno": "Lake Chad basin landscape, ancient Kanuri architecture",
        "Cross River": "Calabar waterfront, lush rainforest canopy, colonial-era buildings",
        "Delta": "Warri oil infrastructure, Asaba Niger bridge approach",
        "Ebonyi": "Abakaliki rice plains, salt lake landscape",
        "Edo": "ancient Benin Kingdom bronze-era walls and Oba palace silhouette",
        "Ekiti": "Ekiti plateau rocky outcrops and Ado-Ekiti hillside cityscape",
        "Enugu": "Enugu coal hill escarpment, Milliken Hill winding roads",
        "Gombe": "Gombe Abuja road savannah, Tangale rock formations",
        "Imo": "Owerri modern boulevard, Mbari art motifs",
        "Jigawa": "Hadejia wetlands bird sanctuary, ancient Kazaure walls",
        "Kaduna": "Lugard Hall colonial landmark, Kaduna River bridge",
        "Kano": "ancient Kano city walls, central mosque minaret skyline",
        "Katsina": "Katsina emirate palace walls, old trans-Saharan trade city architecture",
        "Kebbi": "Argungu fishing festival riverbanks, Birnin Kebbi ancient fort",
        "Kogi": "Niger-Benue river confluence, Lokoja hillside landscape",
        "Kwara": "Ilorin modern mosque skyline, Asa River valley",
        "Lagos": "Lagos Island highrise skyline, Third Mainland Bridge over lagoon",
        "Nasarawa": "Farin Ruwa waterfall landscape, Nasarawa plateau terrain",
        "Niger": "Zuma Rock monolith, Gurara Falls backdrop",
        "Ogun": "Olumo Rock Abeokuta granite outcrops, Gateway arch infrastructure",
        "Ondo": "Idanre Hills dramatic terraced slopes",
        "Osun": "Osun-Osogbo sacred grove, ancient Yoruba shrines",
        "Oyo": "Ibadan city of hills, University of Ibadan colonial tower",
        "Plateau": "Jos plateau cool misty highlands, tin mine remnant landscape",
        "Rivers": "Port Harcourt Garden City skyline, Bonny River oil platform silhouette",
        "Sokoto": "Sokoto Caliphate historic buildings, Sahel semi-arid landscape",
        "Taraba": "Mambilla Plateau dramatic highland cliffs, Taraba River valley",
        "Yobe": "Damaturu savannah flatlands, Lake Chad region dunes",
        "Zamfara": "ancient Birnin Zamfara ruins, Sahel scrubland panorama",
    }

    def _build_prompt(self, state_name: str, day_number: int, caption: str, style_track: str) -> str:
        insight = self._extract_story_line(caption, state_name)
        local_cue = self._STATE_LOCAL_CUES.get(
            state_name,
            f"recognizable {state_name} landscape, architecture, or cultural infrastructure"
        )
        return (
            "Create a world-class social media campaign background image for an African technology spotlight series. "
            f"Location: {state_name}, Nigeria. "
            f"Visual narrative: {insight} "
            f"Art direction: {style_track}. "
            f"HYPER-LOCAL REQUIREMENT: Subtly incorporate {local_cue} as recognisable background elements "
            f"or environmental silhouettes — this must look and feel specifically like {state_name}, Nigeria, "
            "NOT a generic futuristic city or Dubai skyline. The location identity must be unmistakable. "
            "COLOR PALETTE — MANDATORY: The dominant background must be deep black or very dark charcoal. "
            "The only accent colors allowed are crisp white highlights and vibrant tech green (#00C853 — a vivid neon green). "
            "Think green neon glow, green ambient rim lighting, green edge highlights against near-black backgrounds. "
            "ABSOLUTELY NO GOLD, NO YELLOW, NO WARM TONES. Black, white, and Nigerian Tech Green ONLY. "
            "The mood: elite African tech ecosystem, world-class editorial, cinematic, futuristic, high-contrast, aspirational. "
            "COMPOSITION — CRITICAL REQUIREMENT: The ENTIRE LEFT ONE-THIRD of the image (from x=0 to x=33%) "
            "MUST be clean, very dark, nearly empty negative space with minimal detail or subject matter. "
            "This left zone will have text overlaid on it and must remain uncluttered and dark. "
            "Place ALL visual subjects, architecture, people, cityscapes, and dramatic lighting in the RIGHT TWO-THIRDS only. "
            "Use depth-of-field and bokeh blur to naturally feather the left one-third into darkness. "
            "No embedded text, no logos, no watermarks, no UI elements, no charts, no infographics. "
            "Aspect ratio: 1:1 square format. "
            f"Day {day_number} of 36 — the visual must look and feel uniquely like {state_name}, Nigeria."
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
        GREEN = (0, 200, 83)       # #00C853 — Nigerian Tech Green
        WHITE = (255, 255, 255)
        BLACK = (0, 0, 0)
        LIGHT_GREY = (210, 210, 210)

        FOOTER_H = 48              # footer strip height in px
        ACCENT_X = 52              # left edge of the green accent stripe
        STRIPE_W = 6               # width of the green vertical stripe
        TEXT_X = ACCENT_X + STRIPE_W + 16  # text starts right of stripe
        TEXT_MAX_W = 440           # max pixel width before wrapping

        width, height = image.size

        # --- Build transparent overlay for structural elements ---
        canvas = image.convert("RGBA")
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        ov_draw = ImageDraw.Draw(overlay)

        # Full-width footer strip at bottom — 75% opacity black
        ov_draw.rectangle([(0, height - FOOTER_H), (width, height)], fill=(0, 0, 0, 191))

        # Thin green vertical left-border accent stripe
        ov_draw.rectangle(
            [(ACCENT_X, 90), (ACCENT_X + STRIPE_W, height - FOOTER_H - 12)],
            fill=(0, 200, 83, 255)
        )

        canvas = Image.alpha_composite(canvas, overlay)
        draw = ImageDraw.Draw(canvas)

        # ----- DAY pill badge -----
        pill_font = self._load_font(26, bold=True)
        day_text = f"DAY {day_number:02d}/36"
        day_bbox = draw.textbbox((0, 0), day_text, font=pill_font)
        pill_w = (day_bbox[2] - day_bbox[0]) + 28
        pill_h = (day_bbox[3] - day_bbox[1]) + 16
        pill_x, pill_y = TEXT_X, 90
        draw.rounded_rectangle(
            [(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
            radius=8,
            fill=(0, 200, 83, 255),
        )
        draw.text((pill_x + 14, pill_y + 8), day_text, fill=BLACK, font=pill_font)

        # ----- State name — 64px bold white + drop shadow -----
        state_font = self._load_font(64, bold=True)
        state_y = pill_y + pill_h + 18
        state_text = state_name.upper()
        draw.text((TEXT_X + 3, state_y + 3), state_text, fill=(0, 0, 0, 200), font=state_font)  # shadow
        draw.text((TEXT_X, state_y), state_text, fill=(255, 255, 255, 255), font=state_font)   # main

        # ----- "TECH ECOSYSTEM" subtitle — green, drop shadow -----
        sub_font = self._load_font(21, bold=False)
        sub_y = state_y + 72
        sub_text = "TECH ECOSYSTEM"
        draw.text((TEXT_X + 1, sub_y + 1), sub_text, fill=(0, 0, 0, 180), font=sub_font)  # shadow
        draw.text((TEXT_X, sub_y), sub_text, fill=(0, 200, 83, 255), font=sub_font)        # main

        # ----- Capital / Zone info lines — 18px white, drop shadow -----
        info_font = self._load_font(18, bold=False)
        info_y = sub_y + 34
        for label, value in [("Capital", capital), ("Zone", zone)]:
            if value:
                line_text = f"{label}: {value}"
                draw.text((TEXT_X + 1, info_y + 1), line_text, fill=(0, 0, 0, 180), font=info_font)
                draw.text((TEXT_X, info_y), line_text, fill=(255, 255, 255, 240), font=info_font)
                info_y += 26

        # ----- Story line — 17px light grey, wrapped, drop shadow -----
        story_font = self._load_font(17, bold=False)
        story = self._extract_story_line(caption, state_name)
        story_y = info_y + 14
        story_lines = self._wrap_by_pixel_width(draw, story, story_font, TEXT_MAX_W)
        for line in story_lines[:3]:
            draw.text((TEXT_X + 1, story_y + 1), line, fill=(0, 0, 0, 160), font=story_font)
            draw.text((TEXT_X, story_y), line, fill=(210, 210, 210, 240), font=story_font)
            story_y += 24

        # ----- Footer strip branding text -----
        footer_font = self._load_font(20, bold=True)
        footer_text = "AMD SOLUTIONS 007  |  BUILD IN NAIJA  |  www.amdsolutions007.com"
        f_bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
        # Centre the text in the footer strip, leaving right side clear for badge
        footer_text_x = TEXT_X
        footer_text_y = height - FOOTER_H + (FOOTER_H - (f_bbox[3] - f_bbox[1])) // 2
        draw.text((footer_text_x + 1, footer_text_y + 1), footer_text, fill=(0, 0, 0, 160), font=footer_font)
        draw.text((footer_text_x, footer_text_y), footer_text, fill=(255, 255, 255, 220), font=footer_font)

        return canvas.convert("RGB")

    def _apply_badge_watermark(self, image: Image.Image) -> Image.Image:
        """Stamp amd_badge.jpg onto the bottom-right corner.
        The badge has a solid black background — we mask those pixels out
        so only the logo art appears as a transparent overlay."""
        badge_path = os.path.join(os.path.dirname(__file__), "amd_badge.png")
        if not os.path.exists(badge_path):
            # Try current working directory (Railway mounts at /app)
            badge_path = "amd_badge.png"
        if not os.path.exists(badge_path):
            print("⚠️ amd_badge.jpg not found — skipping watermark")
            return image

        try:
            badge_src = Image.open(badge_path).convert("RGB")

            # --- Dynamic black-pixel mask ---
            badge_rgba = badge_src.convert("RGBA")
            pixels = badge_rgba.load()
            width_b, height_b = badge_rgba.size
            # Threshold: pixels darker than (35, 35, 35) are treated as background
            BLACK_THRESH = 35
            for y in range(height_b):
                for x in range(width_b):
                    r, g, b, a = pixels[x, y]
                    if r < BLACK_THRESH and g < BLACK_THRESH and b < BLACK_THRESH:
                        pixels[x, y] = (r, g, b, 0)   # fully transparent
                    else:
                        pixels[x, y] = (r, g, b, 230)  # slight alpha so it blends

            # Resize to 100x100 — compact watermark anchor
            badge_size = 100
            badge_rgba = badge_rgba.resize((badge_size, badge_size), Image.Resampling.LANCZOS)

            # Anchor inside footer strip — 20px from right/bottom edges
            margin = 20
            canvas = image.convert("RGBA")
            paste_x = canvas.width - badge_size - margin
            paste_y = canvas.height - badge_size - margin
            canvas.paste(badge_rgba, (paste_x, paste_y), badge_rgba)
            return canvas.convert("RGB")

        except Exception as e:
            print(f"⚠️ Watermark failed (non-fatal): {e}")
            return image

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

        # PART 3: Stamp AMD badge watermark
        final = self._apply_badge_watermark(final)

        filename = f"state_{day_number:02d}_{state_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.png"
        filepath = os.path.join(GRAPHICS_DIR, filename)
        final.save(filepath, format="PNG", optimize=True)
        print(f"✅ Graphic saved: {filepath}")
        return filepath



