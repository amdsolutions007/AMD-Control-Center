from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont


GOLD = (212, 175, 55)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)


@dataclass(frozen=True)
class FlyerSpec:
    input_image: Path
    output_image: Path
    headline: str
    subtext: str
    cta: str


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    # Prefer macOS built-in fonts, fall back to PIL default.
    candidates: Iterable[str] = (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Bold.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttf",
    )
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except Exception:
            pass
    return ImageFont.load_default()


def _cover_resize(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    # Resize with cover behavior then center-crop.
    src_w, src_h = img.size
    scale = max(target_w / src_w, target_h / src_h)
    new_w, new_h = int(src_w * scale), int(src_h * scale)
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def _draw_centered_multiline(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.ImageFont,
    box: tuple[int, int, int, int],
    fill: tuple[int, int, int],
    line_spacing: int,
    stroke_fill: tuple[int, int, int] | None = None,
) -> None:
    x0, y0, x1, y1 = box
    lines = text.split("\n")
    line_heights = [draw.textbbox((0, 0), line, font=font)[3] for line in lines]
    total_h = sum(line_heights) + line_spacing * (len(lines) - 1)
    y = y0 + ((y1 - y0) - total_h) // 2
    for line, h in zip(lines, line_heights):
        w = draw.textbbox((0, 0), line, font=font)[2]
        x = x0 + ((x1 - x0) - w) // 2
        if stroke_fill is not None:
            for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2), (-2, -2), (2, 2), (-2, 2), (2, -2)]:
                draw.text((x + dx, y + dy), line, font=font, fill=stroke_fill)
        draw.text((x, y), line, font=font, fill=fill)
        y += h + line_spacing


def build_flyer(spec: FlyerSpec) -> None:
    img = Image.open(spec.input_image).convert("RGB")
    canvas = _cover_resize(img, 1080, 1920)

    draw = ImageDraw.Draw(canvas)

    # GLOBAL DESIGN OVERRIDE (Jobs 3–20):
    # - No borders/frames
    # - No heavy bars/strips that obstruct the image
    # - Text only (with subtle shadow) over the full-bleed image
    shadow = (0, 0, 0)

    headline_font = _load_font(86, bold=True)
    sub_font = _load_font(36)
    cta_font = _load_font(48, bold=True)
    brand_font = _load_font(56, bold=True)

    _draw_centered_multiline(
        draw,
        spec.headline,
        headline_font,
        (40, 20, 1040, 190),
        WHITE,
        line_spacing=10,
        stroke_fill=shadow,
    )

    _draw_centered_multiline(
        draw,
        spec.subtext,
        sub_font,
        (60, 195, 1020, 315),
        WHITE,
        line_spacing=6,
        stroke_fill=shadow,
    )

    # Footer text (no footer bar): brand + CTA over image
    _draw_centered_multiline(draw, "AMD MEDIA SOLUTIONS", brand_font, (0, 1680, 1080, 1820), GOLD, 6, stroke_fill=shadow)
    _draw_centered_multiline(draw, spec.cta, cta_font, (0, 1820, 1080, 1920), WHITE, 6, stroke_fill=shadow)

    spec.output_image.parent.mkdir(parents=True, exist_ok=True)
    # Avoid PNG optimize edge-cases on some Pillow builds.
    canvas.save(spec.output_image, format="PNG")


def main() -> None:
    # Job 3
    build_flyer(
        FlyerSpec(
            input_image=Path("assets/Job3_RealEstate_Mapper/Job3_Twin_Master.png"),
            output_image=Path("assets/Job3_RealEstate_Mapper/Job3_Flyer_Master.png"),
            headline="SEE THE LAND\nBEFORE YOU BUY",
            subtext="Naija Prop Intel — Satellite History + Coordinate Verification",
            cta='DM "MAP" TO SCAN YOUR LAND',
        )
    )

    # Job 4
    build_flyer(
        FlyerSpec(
            input_image=Path("assets/Job4_Forex_TradingBot/Job4_Twin_Master.png"),
            output_image=Path("assets/Job4_Forex_TradingBot/Job4_Flyer_Master.png"),
            headline="PROFIT\nWHILE YOU PANIC",
            subtext="Forex/Crypto Trading Bot — 100% Logic. 0% Emotion.",
            cta='DM "TRADE" TO INSTALL',
        )
    )


if __name__ == "__main__":
    main()
