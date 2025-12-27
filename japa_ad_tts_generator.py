#!/usr/bin/env python3
"""japa_ad_tts_generator.py

Generates 3 short MP3 voice tracks for the Japa ad clips (for lip-sync).
Outputs into Ready_to_Upload/.

This keeps the audio clean and deterministic; you can pair it with your
video-generation workflow (Runway/HeyGen/etc) using the prompts in
Ready_to_Upload/japa_ad_blueprint.txt.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

from gtts import gTTS


OUTPUT_DIR = "Ready_to_Upload"
LANG = "en"


@dataclass(frozen=True)
class Clip:
    id: str
    filename_mp3: str
    script: str


CLIPS: list[Clip] = [
    Clip(
        id="CLIP_1_HOOK",
        filename_mp3="japa_ad_clip_1_hook.mp3",
        script=(
            "Stop guessing if you can Japa. "
            "I built an AI that tells you the brutal truth in exactly 5 seconds."
        ),
    ),
    Clip(
        id="CLIP_2_DEMO",
        filename_mp3="japa_ad_clip_2_demo.mp3",
        script=(
            "You just type your savings here. "
            "Green means pack your bags. "
            "Red means sit down and build your empire at home."
        ),
    ),
    Clip(
        id="CLIP_3_CTA",
        filename_mp3="japa_ad_clip_3_cta.mp3",
        script=(
            "Don't get stranded abroad. "
            "Check your Japa Score right now completely free. "
            "The link is in the description."
        ),
    ),
]


def ensure_output_dir() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def render_clip_mp3(clip: Clip) -> str:
    out_path = os.path.join(OUTPUT_DIR, clip.filename_mp3)
    tts = gTTS(text=clip.script, lang=LANG)
    tts.save(out_path)
    return out_path


def main() -> None:
    ensure_output_dir()
    print(f"Output dir: {OUTPUT_DIR}")

    for clip in CLIPS:
        print(f"Generating {clip.id} -> {clip.filename_mp3}")
        out_path = render_clip_mp3(clip)
        print(f"Saved: {out_path}")

    print("Done.")


if __name__ == "__main__":
    main()
