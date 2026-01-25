#!/usr/bin/env python3
"""Job 6: Bank Statement Parser

Creates the missing Job 6 visual assets using the same OpenAI tooling already in this repo:
- Generates SOURCE TRUTH image (OpenAI DALL·E 3): Job6_BankStatement_Twin.png
- Derives a Flyer by overlaying exact text on the source image: Job6_Flyer_Master.png
- Derives a Video fallback from the flyer + existing audio: Job6_Video_Fallback.mp4

Outputs to: social_engine/assets/Job6_Bank_Statement_Parser/

Usage:
  python3 generate_job6_flyer_and_video.py
  python3 generate_job6_flyer_and_video.py --force
"""

import argparse
import os
import subprocess
from pathlib import Path

import requests
from dotenv import load_dotenv
from openai import OpenAI


def _get_font(size: int):
    from PIL import ImageFont

    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Neue Bold.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Neue.ttf",
    ]
    for font_path in candidates:
        try:
            return ImageFont.truetype(font_path, size=size)
        except Exception:
            continue

    return ImageFont.load_default()


def generate_source_truth(client: OpenAI, out_png: Path, force: bool) -> None:
    if out_png.exists() and not force:
        print(f"✅ Source truth exists: {out_png.name}")
        return

    prompt = (
        "Photorealistic marketing hero image, square 1024x1024. "
        "A professional Nigerian fintech analyst (Digital Twin) in a modern office, holding a tablet. "
        "On the tablet: a financial chart and transaction table that is turning into a large green 'APPROVED' checkmark. "
        "The green 'APPROVED' checkmark must be clearly visible on-screen. "
        "Lighting: clean, high-tech, premium. Color palette: blue/gray with green accent. "
        "No logos, no watermarks, no extra text on the image besides the tablet 'APPROVED'."
    )

    print("🎨 Generating Job 6 SOURCE TRUTH image (OpenAI DALL·E 3)…")
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="hd",
        n=1,
    )

    image_url = response.data[0].url
    img_data = requests.get(image_url, timeout=60).content

    out_png.parent.mkdir(parents=True, exist_ok=True)
    out_png.write_bytes(img_data)
    print(f"✅ Saved source truth: {out_png.name} ({out_png.stat().st_size/1024:.0f} KB)")


def build_flyer_from_source(source_png: Path, out_png: Path, force: bool) -> None:
    from PIL import Image, ImageDraw

    if out_png.exists() and not force:
        print(f"✅ Flyer exists: {out_png.name}")
        return

    if not source_png.exists():
        raise FileNotFoundError(f"Missing source image: {source_png}")

    img = Image.open(source_png).convert("RGBA")
    draw = ImageDraw.Draw(img)

    shadow = (0, 0, 0, 210)

    headline = "1,000 PAGES IN 1 SECOND."
    subhead = "INSTANT LOAN DECISIONS."
    footer = "AMD SOLUTIONS 007"

    # GLOBAL DESIGN OVERRIDE (Jobs 3–20):
    # - No borders/frames
    # - No heavy bars/strips that obstruct the image
    # - Text only (with subtle shadow) over the full-bleed image

    w, h = img.size

    headline_font = _get_font(size=int(h * 0.06))
    subhead_font = _get_font(size=int(h * 0.05))
    footer_font = _get_font(size=int(h * 0.035))

    # Centered text
    def centered_text(y: int, text: str, font, fill, stroke_fill=None):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        if stroke_fill is not None:
            for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2), (-2, -2), (2, 2), (-2, 2), (2, -2)]:
                draw.text((x + dx, y + dy), text, font=font, fill=stroke_fill)
        draw.text((x, y), text, font=font, fill=fill)

    centered_text(int(h * 0.05), headline, headline_font, (255, 255, 255, 255), stroke_fill=shadow)
    centered_text(int(h * 0.12), subhead, subhead_font, (0, 255, 140, 255), stroke_fill=shadow)
    centered_text(h - int(h * 0.085), footer, footer_font, (255, 255, 255, 255), stroke_fill=shadow)

    out_png.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_png, format="PNG")
    print(f"✅ Saved flyer: {out_png.name} ({out_png.stat().st_size/1024:.0f} KB)")


def build_video_from_flyer_and_audio(flyer_png: Path, audio_mp3: Path, out_mp4: Path, force: bool) -> None:
    from imageio_ffmpeg import get_ffmpeg_exe

    if out_mp4.exists() and not force:
        print(f"✅ Video exists: {out_mp4.name}")
        return

    if not flyer_png.exists():
        raise FileNotFoundError(f"Missing flyer image: {flyer_png}")
    if not audio_mp3.exists():
        raise FileNotFoundError(f"Missing audio master: {audio_mp3}")

    ffmpeg = get_ffmpeg_exe()

    # Make a simple "still image + narration" video.
    cmd = [
        ffmpeg,
        "-y",
        "-loop",
        "1",
        "-i",
        str(flyer_png),
        "-i",
        str(audio_mp3),
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        str(out_mp4),
    ]

    print("🎬 Building Job 6 video fallback (flyer + audio)…")
    subprocess.run(cmd, check=True)
    print(f"✅ Saved video: {out_mp4.name} ({out_mp4.stat().st_size/1024/1024:.2f} MB)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Overwrite existing outputs")
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    load_dotenv(dotenv_path=base_dir / ".env")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing in social_engine/.env")

    client = OpenAI(api_key=api_key)

    job_dir = base_dir / "assets" / "Job6_Bank_Statement_Parser"
    source_truth = job_dir / "Job6_BankStatement_Twin.png"
    twin_alias = job_dir / "Job6_Twin_Master.png"
    flyer = job_dir / "Job6_Flyer_Master.png"
    audio = job_dir / "Job6_Audio_Master.mp3"
    video = job_dir / "Job6_Video_Fallback.mp4"

    print("=" * 70)
    print("JOB 6 COMPLETE PACK (SOURCE TRUTH → FLYER → VIDEO)")
    print("=" * 70)

    generate_source_truth(client, source_truth, force=args.force)

    # Keep naming consistent with the rest of the repo.
    if source_truth.exists() and (args.force or not twin_alias.exists()):
        twin_alias.write_bytes(source_truth.read_bytes())
        print(f"✅ Saved alias: {twin_alias.name}")

    build_flyer_from_source(source_truth, flyer, force=args.force)
    build_video_from_flyer_and_audio(flyer, audio, video, force=args.force)

    print("=" * 70)
    print("✅ Job 6 pack complete")
    print("=" * 70)
    print(f"- Source truth: {source_truth}")
    print(f"- Flyer:        {flyer}")
    print(f"- Audio:        {audio}")
    print(f"- Video:        {video}")


if __name__ == "__main__":
    main()
