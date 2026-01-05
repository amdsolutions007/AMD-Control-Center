#!/usr/bin/env python3
"""Job 9: NaijaLaw GPT

Creates a Job 9 asset pack STRICTLY derived from the branded Source Truth image:
  - Source Truth (must exist): assets/Job9_Naija_Law_GPT/Job9_Twin_Master.png
  - Flyer:  assets/Job9_Naija_Law_GPT/Job9_Flyer_Master.png
  - Audio:  assets/Job9_Naija_Law_GPT/Job9_Audio_Master.mp3 (optional)
  - Video:  assets/Job9_Naija_Law_GPT/Job9_Video_Master.mp4 (still + narration fallback, requires audio)

Branding rules: black + 24K gold (#D4AF37) and a gold border line.

Usage:
  python3 generate_job9_pack.py --flyer
  python3 generate_job9_pack.py --all --script "..."
  python3 generate_job9_pack.py --all --script-file jobs_data/Job9_Audio_Script.txt
  python3 generate_job9_pack.py --all --script "..." --force
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

    headline = "YOUR POCKET LAWYER."
    subhead = "INSTANT LEGAL HELP."
    footer = "AMD SOLUTIONS 007"

    # Readability strips
    strip_h_top = int(h * 0.22)
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
    print("🎙️  Generating Job 9 audio master (Onyx / tts-1-hd)…")
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

    print("🎬 Building Job 9 video (still flyer + narration fallback)…")
    subprocess.run(cmd, check=True)
    print(f"✅ Saved video: {out_mp4.name} ({out_mp4.stat().st_size/1024/1024:.2f} MB)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Overwrite existing outputs")
    parser.add_argument("--flyer", action="store_true", help="Generate only the flyer")
    parser.add_argument("--all", action="store_true", help="Generate flyer + audio + video")
    parser.add_argument("--script", type=str, default=None, help="Audio script text")
    parser.add_argument("--script-file", type=str, default=None, help="Path to a text file containing the audio script")
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    job_dir = base_dir / "assets" / "Job9_Naija_Law_GPT"
    master = job_dir / "Job9_Twin_Master.png"
    flyer = job_dir / "Job9_Flyer_Master.png"
    audio = job_dir / "Job9_Audio_Master.mp3"
    video = job_dir / "Job9_Video_Master.mp4"

    if not args.flyer and not args.all:
        # default to flyer-only (safe) if no flags provided
        args.flyer = True

    print("=" * 70)
    print("JOB 9 PACK")
    print("=" * 70)
    print(f"Source truth: {master}")

    build_flyer(master, flyer, force=args.force)

    if args.all:
        load_dotenv(dotenv_path=base_dir / ".env")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is missing in social_engine/.env")
        client = OpenAI(api_key=api_key)

        script_text = args.script
        if args.script_file:
            script_text = Path(args.script_file).read_text(encoding="utf-8").strip()

        if not script_text:
            raise RuntimeError("Missing audio script. Provide --script or --script-file when using --all")

        generate_audio(client, script_text, audio, force=args.force)
        build_video(flyer, audio, video, force=args.force)


if __name__ == "__main__":
    main()
