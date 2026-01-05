#!/usr/bin/env python3
"""Job 7: Address-Intel (Smart Logistics & GPS)

Creates the Job 7 asset pack STRICTLY derived from the branded Source Truth image:
  - Source Truth (must exist): assets/Job7_Address_Intel/Job7_Twin_Master.png
  - Flyer:  assets/Job7_Address_Intel/Job7_Flyer_Master.png
  - Audio:  assets/Job7_Address_Intel/Job7_Audio_Master.mp3
  - Video:  assets/Job7_Address_Intel/Job7_Video_Master.mp4 (still + narration fallback)

No DALL·E / no re-generation of the Twin. This is the "Source Truth" protocol.

Usage:
  python3 generate_job7_pack.py
  python3 generate_job7_pack.py --force
"""

import argparse
import os
import subprocess
from pathlib import Path

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


def build_flyer_from_master(master_png: Path, out_png: Path, force: bool) -> None:
    from PIL import Image, ImageDraw

    if out_png.exists() and not force:
        print(f"✅ Flyer exists: {out_png.name}")
        return

    if not master_png.exists():
        raise FileNotFoundError(f"Missing Source Truth image: {master_png}")

    img = Image.open(master_png).convert("RGBA")
    w, h = img.size

    headline = "STOP GETTING LOST IN LAGOS."
    subhead = "AI NAVIGATION UNLOCKED."
    footer = "AMD SOLUTIONS 007"

    # Brand colors (Gold + Black)
    # 24K Gold commonly represented as #D4AF37
    gold = (212, 175, 55, 255)
    black = (0, 0, 0, 255)

    # Readability strips (non-destructive overlay)
    strip_h_top = int(h * 0.22)
    strip_h_bottom = int(h * 0.12)

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rectangle([0, 0, w, strip_h_top], fill=(0, 0, 0, 160))
    # Bottom strip for footer readability (keep black, not gold bar)
    odraw.rectangle([0, h - strip_h_bottom, w, h], fill=(0, 0, 0, 190))

    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Gold border line (brand frame)
    border = max(4, int(min(w, h) * 0.008))
    for i in range(border):
        draw.rectangle([i, i, w - 1 - i, h - 1 - i], outline=gold)

    headline_font = _get_font(size=int(h * 0.055))
    subhead_font = _get_font(size=int(h * 0.042))
    footer_font = _get_font(size=int(h * 0.032))

    def centered_text(y: int, text: str, font, fill):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        draw.text((x, y), text, font=font, fill=fill)

    centered_text(int(h * 0.05), headline, headline_font, gold)
    centered_text(int(h * 0.115), subhead, subhead_font, gold)
    centered_text(h - int(h * 0.085), footer, footer_font, gold)

    out_png.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_png, format="PNG")
    print(f"✅ Saved flyer: {out_png.name} ({out_png.stat().st_size/1024:.0f} KB)")


def generate_audio(client: OpenAI, script: str, out_mp3: Path, force: bool) -> None:
    if out_mp3.exists() and not force:
        print(f"✅ Audio exists: {out_mp3.name}")
        return

    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    print("🎙️  Generating Job 7 audio master (Onyx / tts-1-hd)…")

    response = client.audio.speech.create(
        model="tts-1-hd",
        voice="onyx",
        input=script,
    )
    response.stream_to_file(out_mp3)
    print(f"✅ Saved audio: {out_mp3.name} ({out_mp3.stat().st_size/1024:.0f} KB)")


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

    print("🎬 Building Job 7 video (still flyer + narration fallback)…")
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

    job_dir = base_dir / "assets" / "Job7_Address_Intel"
    master = job_dir / "Job7_Twin_Master.png"
    flyer = job_dir / "Job7_Flyer_Master.png"
    audio = job_dir / "Job7_Audio_Master.mp3"
    video = job_dir / "Job7_Video_Master.mp4"

    script = (
        "Lagos traffic is not a curse. It is a puzzle. And we just solved it. "
        "Stop trusting generic maps that send you into gridlock. "
        "Address-Intel knows every shortcut, every pothole, and every back road. "
        "Arrive on time. Every time. DM 'LOCATE' to install. "
        "Powered by AMD Solutions 007."
    )

    print("=" * 70)
    print("JOB 7 COMPLETE PACK (SOURCE TRUTH → FLYER → AUDIO → VIDEO)")
    print("=" * 70)

    build_flyer_from_master(master, flyer, force=args.force)
    generate_audio(client, script, audio, force=args.force)
    build_video_from_flyer_and_audio(flyer, audio, video, force=args.force)

    print("=" * 70)
    print("✅ Job 7 pack complete")
    print("=" * 70)
    print(f"- Source truth: {master}")
    print(f"- Flyer:        {flyer}")
    print(f"- Audio:        {audio}")
    print(f"- Video:        {video}")


if __name__ == "__main__":
    main()
