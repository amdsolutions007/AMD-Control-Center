#!/usr/bin/env python3
"""Job 13: Naija Rent Estimator (PropTech Negotiator)

Creates the Job 13 asset pack STRICTLY derived from the branded Source Truth image:
  - Source Truth (must exist): assets/Job13_Rent_Estimator/Job13_Twin_Master.png
  - Flyer:  assets/Job13_Rent_Estimator/Job13_Flyer_Master.png
  - Audio:  assets/Job13_Rent_Estimator/Job13_Audio_Master.mp3
  - Video:  assets/Job13_Rent_Estimator/Job13_Video_Master.mp4 (still + narration fallback)
  - Prompt: assets/Job13_Rent_Estimator/Job13_Veo3_Video_Master_Prompt.txt

Branding rules (per Job 13 Bible):
  - Flyer overlay text: STOP PAYING "AGENT FEE". / KNOW THE REAL PRICE.
  - Footer: AMD SOLUTIONS 007
  - Audio voice: OpenAI TTS, voice="onyx"

Usage:
  python3 generate_job13_pack.py
  python3 generate_job13_pack.py --force
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


def _get_font(size: int, bold: bool = False):
    from PIL import ImageFont

    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Bold.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttf",
    ]
    for font_path in candidates:
        try:
            return ImageFont.truetype(font_path, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def _extract_bible_fields(bible_path: Path) -> tuple[str, str]:
    """Return (audio_script, veo3_prompt) from the Job 13 bible."""
    content = bible_path.read_text(encoding="utf-8")

    script_match = re.search(
        r"\*\*C\. TO CREATE THE AUDIO.*?\*\*Script:\*\*\s+\"([^\"]+)\"",
        content,
        re.DOTALL,
    )
    if not script_match:
        raise RuntimeError(f"Could not extract audio script from {bible_path.name}")

    script = script_match.group(1).strip().replace("**", "")

    veo_match = re.search(
        r"\*\*B\. TO CREATE THE VIDEO.*?\*\*Prompt:\*\*\s+\"([^\"]+)\"",
        content,
        re.DOTALL,
    )
    veo_prompt = veo_match.group(1).strip() if veo_match else ""

    return script, veo_prompt


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
    white = (255, 255, 255, 255)
    shadow = (0, 0, 0, 210)

    headline = 'STOP PAYING "AGENT FEE".'
    subhead = "KNOW THE REAL PRICE."
    footer = "AMD SOLUTIONS 007"

    draw = ImageDraw.Draw(img)

    headline_font = _get_font(size=int(h * 0.055), bold=True)
    subhead_font = _get_font(size=int(h * 0.042), bold=True)
    footer_font = _get_font(size=int(h * 0.035), bold=True)

    def centered_text(y: int, text: str, font, fill, stroke_fill=None):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        if stroke_fill is not None:
            for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2), (-2, -2), (2, 2), (-2, 2), (2, -2)]:
                draw.text((x + dx, y + dy), text, font=font, fill=stroke_fill)
        draw.text((x, y), text, font=font, fill=fill)

    centered_text(int(h * 0.07), headline, headline_font, gold, stroke_fill=shadow)
    centered_text(int(h * 0.14), subhead, subhead_font, white, stroke_fill=shadow)
    centered_text(h - int(h * 0.085), footer, footer_font, gold, stroke_fill=shadow)

    out_png.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_png, format="PNG")
    print(f"✅ Saved flyer: {out_png.name} ({out_png.stat().st_size/1024:.0f} KB)")


def generate_audio(client: OpenAI, script: str, out_mp3: Path, force: bool) -> None:
    if out_mp3.exists() and not force:
        print(f"✅ Audio exists: {out_mp3.name}")
        return
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    print("🎙️  Generating Job 13 audio master (Onyx / tts-1-hd)…")
    with client.audio.speech.with_streaming_response.create(
        model="tts-1-hd",
        voice="onyx",
        input=script,
    ) as response:
        with open(out_mp3, "wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)
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

    print("🎬 Building Job 13 video (still flyer + narration fallback)…")
    subprocess.run(cmd, check=True)
    print(f"✅ Saved video: {out_mp4.name} ({out_mp4.stat().st_size/1024/1024:.2f} MB)")


def write_veo3_prompt(job_num: int, job_dir: Path, veo_prompt: str, audio_script: str, force: bool) -> None:
    out_file = job_dir / f"Job{job_num}_Veo3_Video_Master_Prompt.txt"
    if out_file.exists() and not force:
        print(f"✅ Veo3 prompt exists: {out_file.name}")
        return
    if not veo_prompt:
        raise RuntimeError("No Veo3 prompt found in Job 13 bible")

    prompt_content = f"""VEO3 VIDEO MASTER PROMPT - JOB {job_num}
============================================================

INSTRUCTIONS:
1. Upload the source image: Job{job_num}_Twin_Master.png
2. Paste the VISUAL PROMPT below into Veo3 (image-to-video)
3. Set duration: 8-10 seconds
4. Generate and download
5. Save as: Job{job_num}_Video_Master.mp4

============================================================
VISUAL PROMPT (Image-to-Video):
============================================================

{veo_prompt}

============================================================
AUDIO SCRIPT (Narration):
============================================================

{audio_script}
"""

    out_file.write_text(prompt_content, encoding="utf-8")
    print(f"✅ Saved Veo3 prompt: {out_file.name}")


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

    job_num = 13
    job_dir = base_dir / "assets" / "Job13_Rent_Estimator"
    master = job_dir / "Job13_Twin_Master.png"
    flyer = job_dir / "Job13_Flyer_Master.png"
    audio = job_dir / "Job13_Audio_Master.mp3"
    video = job_dir / "Job13_Video_Master.mp4"
    bible = base_dir / "jobs_data" / "Job13_Rent_Estimator.md"

    script, veo_prompt = _extract_bible_fields(bible)

    print("=" * 70)
    print("JOB 13 COMPLETE PACK (SOURCE TRUTH → FLYER → AUDIO → VIDEO)")
    print("=" * 70)

    build_flyer(master, flyer, force=args.force)
    generate_audio(client, script, audio, force=args.force)
    build_video(flyer, audio, video, force=args.force)
    write_veo3_prompt(job_num, job_dir, veo_prompt, script, force=args.force)

    print("=" * 70)
    print("✅ Job 13 pack complete")
    print("=" * 70)
    print(f"- Source truth: {master}")
    print(f"- Flyer:        {flyer}")
    print(f"- Audio:        {audio}")
    print(f"- Video:        {video}")
    print(f"- Veo3 prompt:  {job_dir / f'Job{job_num}_Veo3_Video_Master_Prompt.txt'}")


if __name__ == "__main__":
    main()
