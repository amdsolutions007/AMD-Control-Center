#!/usr/bin/env python3
"""amd_viral_editor.py

Operation: VIRAL ASSEMBLY & LAUNCH (Edit Step)

- Joins Hook -> Demo -> CTA
- During Demo, overlays the app screen recording on the right side
- Exports: Ready_to_Upload/Japa_Viral_Final.mp4

If expected filenames are missing, falls back to existing vault clips.
"""

from __future__ import annotations

import os
from pathlib import Path

from moviepy import (
    VideoFileClip,
    CompositeVideoClip,
    concatenate_videoclips,
    ColorClip,
)

try:
    from moviepy import TextClip
except Exception:  # TextClip optional (depends on environment)
    TextClip = None


PROJECT_ROOT = Path(__file__).resolve().parent
RAW_VAULT = PROJECT_ROOT / "Raw_Footage_Vault"
ASSETS = PROJECT_ROOT / "assets"
OUT_DIR = PROJECT_ROOT / "Ready_to_Upload"
OUT_VIDEO = OUT_DIR / "Japa_Viral_Final.mp4"


def pick_first_existing(*candidates: Path) -> Path:
    for c in candidates:
        if c.exists() and c.is_file():
            return c
    return Path("")


def load_clip(path: Path) -> VideoFileClip:
    if not path:
        raise FileNotFoundError("Clip not found")
    return VideoFileClip(str(path))


def build_app_overlay(base_w: int, base_h: int, demo_duration: float) -> ColorClip | CompositeVideoClip | VideoFileClip:
    """Load app demo if present; otherwise create a placeholder overlay."""
    app_path = pick_first_existing(
        RAW_VAULT / "japa_app_demo.mp4",
        ASSETS / "japa_app_demo.mp4",
        PROJECT_ROOT / "japa_app_demo.mp4",
    )

    target_w = int(base_w * 0.40)
    target_h = int(base_h * 0.56)

    if app_path:
        app = VideoFileClip(str(app_path))
        app = app.resized(width=target_w)
        if app.h > target_h:
            app = app.resized(height=target_h)

        # Fit duration to demo
        if app.duration < demo_duration:
            app = app.loop(duration=demo_duration)
        else:
            app = app.subclipped(0, demo_duration)
        return app

    # Placeholder overlay
    overlay = ColorClip(size=(target_w, target_h), color=(0, 0, 0)).with_duration(demo_duration)

    if TextClip is None:
        return overlay

    try:
        label = TextClip(text="APP DEMO\nPLACEHOLDER", font_size=42, color="#D4AF37")
        label = label.with_duration(demo_duration).with_position("center")
        return CompositeVideoClip([overlay, label]).with_duration(demo_duration)
    except Exception:
        return overlay


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    hook_path = pick_first_existing(
        RAW_VAULT / "twin_hook_01.mp4",
        ASSETS / "twin_hook_01.mp4",
        RAW_VAULT / "clip1.mp4",
    )
    demo_path = pick_first_existing(
        RAW_VAULT / "twin_demo_02.mp4",
        ASSETS / "twin_demo_02.mp4",
        RAW_VAULT / "clip2.mp4",
    )
    cta_path = pick_first_existing(
        RAW_VAULT / "twin_cta_03.mp4",
        ASSETS / "twin_cta_03.mp4",
        RAW_VAULT / "clip3.mp4",
    )

    if not hook_path or not demo_path or not cta_path:
        raise FileNotFoundError(
            "Missing required clips. Expected in Raw_Footage_Vault: twin_hook_01.mp4, twin_demo_02.mp4, twin_cta_03.mp4 (or fallback clip1/2/3.mp4)."
        )

    print("🎬 VIRAL EDITOR ONLINE")
    print(f"Hook: {hook_path}")
    print(f"Demo: {demo_path}")
    print(f"CTA : {cta_path}")

    hook = load_clip(hook_path)
    base_w, base_h = hook.w, hook.h

    demo = load_clip(demo_path).resized((base_w, base_h))
    cta = load_clip(cta_path).resized((base_w, base_h))

    app_overlay = build_app_overlay(base_w, base_h, demo.duration)

    # Place overlay on right side (twin points to his left / your right)
    margin_x = int(base_w * 0.04)
    x = base_w - app_overlay.w - margin_x
    y = int((base_h - app_overlay.h) / 2)
    app_overlay = app_overlay.with_position((x, y))

    demo_composite = CompositeVideoClip([demo, app_overlay]).with_duration(demo.duration)
    if demo.audio is not None:
        demo_composite = demo_composite.with_audio(demo.audio)

    final = concatenate_videoclips([hook, demo_composite, cta], method="compose")

    print(f"🚀 Exporting to: {OUT_VIDEO}")
    final.write_videofile(
        str(OUT_VIDEO),
        fps=30,
        codec="libx264",
        audio_codec="aac",
        threads=max(1, os.cpu_count() or 1),
    )

    hook.close()
    demo.close()
    cta.close()
    try:
        app_overlay.close()  # type: ignore[attr-defined]
    except Exception:
        pass
    final.close()

    print("✅ DONE")


if __name__ == "__main__":
    main()
