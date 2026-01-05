#!/usr/bin/env python3
"""Job 11: AMD Activity Booster (Productivity & Focus)

Creates the Job 11 asset pack STRICTLY derived from the branded Source Truth image:
  - Source Truth (must exist): assets/Job11_Activity_Booster/Job11_Twin_Master.png
  - Flyer:  assets/Job11_Activity_Booster/Job11_Flyer_Master.png
  - Audio:  assets/Job11_Activity_Booster/Job11_Audio_Master.mp3
  - Video:  assets/Job11_Activity_Booster/Job11_Video_Master.mp4 (still + narration fallback)

Branding rules: black + 24K gold (#D4AF37) and a gold border line.

Usage:
  python3 generate_job11_pack.py
  python3 generate_job11_pack.py --force
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


def build_flyer(master_png: Path, out_png: Path, force: bool) -> None:
    from PIL import Image, ImageDraw

    if out_png.exists() and not force:
        print(f"✅ Flyer exists: {out_png.name}")
        return
    if not master_png.exists():
        raise FileNotFoundError(f"Missing Source Truth image: {master_png}")

    img = Image.open(master_png).convert("RGBA")
    w, h = img.size

    gold = (212, 175, 55, 255)  # #D4AF37

    headline = "STOP BEING BUSY."
    subhead = "START BEING PRODUCTIVE."
    kicker = "10X YOUR OUTPUT."
    footer = "AMD SOLUTIONS 007"

    # Readability strips
    strip_h_top = int(h * 0.26)
    strip_h_bottom = int(h * 0.12)

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rectangle([0, 0, w, strip_h_top], fill=(0, 0, 0, 170))
    odraw.rectangle([0, h - strip_h_bottom, w, h], fill=(0, 0, 0, 190))
    img = Image.alpha_composite(img, overlay)

    draw = ImageDraw.Draw(img)

    # Gold border
    border = max(4, int(min(w, h) * 0.008))
    for i in range(border):
        draw.rectangle([i, i, w - 1 - i, h - 1 - i], outline=gold)

    headline_font = _get_font(size=int(h * 0.05))
    subhead_font = _get_font(size=int(h * 0.045))
    kicker_font = _get_font(size=int(h * 0.042))
    footer_font = _get_font(size=int(h * 0.032))

    def centered_text(y: int, text: str, font, fill):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        draw.text((x, y), text, font=font, fill=fill)

    centered_text(int(h * 0.045), headline, headline_font, gold)
    centered_text(int(h * 0.095), subhead, subhead_font, gold)
    centered_text(int(h * 0.145), kicker, kicker_font, gold)
    centered_text(h - int(h * 0.085), footer, footer_font, gold)

    out_png.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_png, format="PNG")
    print(f"✅ Saved flyer: {out_png.name} ({out_png.stat().st_size/1024:.0f} KB)")


def generate_audio(client: OpenAI, script: str, out_mp3: Path, force: bool) -> None:
    if out_mp3.exists() and not force:
        print(f"✅ Audio exists: {out_mp3.name}")
        return
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    print("🎙️  Generating Job 11 audio master (Onyx / tts-1-hd)…")
    response = client.audio.speech.create(
        model="tts-1-hd",
        voice="onyx",
        input=script,
    )
    response.stream_to_file(out_mp3)
    print(f"✅ Saved audio: {out_mp3.name} ({out_mp3.stat().st_size/1024:.0f} KB)")


def build_video(flyer_png: Path, audio_mp3: Path, out_mp4: Path, force: bool) -> None:
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

    print("🎬 Building Job 11 video (still flyer + narration fallback)…")
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

    job_dir = base_dir / "assets" / "Job11_Activity_Booster"
    master = job_dir / "Job11_Twin_Master.png"
    flyer = job_dir / "Job11_Flyer_Master.png"
    audio = job_dir / "Job11_Audio_Master.mp3"
    video = job_dir / "Job11_Video_Master.mp4"

    # Script copied from the Job 11 Bible
    script = (
        "You have the same 24 hours as billionaires. The difference is Focus. "
        "Stop letting distractions steal your future. "
        "The AMD Activity Booster forces you into the zone. "
        "Block the noise. Ignite the rocket. Do a week's worth of work in one day. "
        "DM 'BOOST' to install. Powered by AMD Media Solutions."
    )

    print("=" * 70)
    print("JOB 11 COMPLETE PACK (SOURCE TRUTH → FLYER → AUDIO → VIDEO)")
    print("=" * 70)

    build_flyer(master, flyer, force=args.force)
    generate_audio(client, script, audio, force=args.force)
    build_video(flyer, audio, video, force=args.force)

    print("=" * 70)
    print("✅ Job 11 pack complete")
    print("=" * 70)
    print(f"- Source truth: {master}")
    print(f"- Flyer:        {flyer}")
    print(f"- Audio:        {audio}")
    print(f"- Video:        {video}")


if __name__ == "__main__":
    main()
