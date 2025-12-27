#!/usr/bin/env python3
import os
from moviepy import VideoFileClip, CompositeVideoClip
from moviepy.video.fx import CrossFadeIn, CrossFadeOut

RAW_DIR = "Raw_Footage_Vault"
OUTPUT_DIR = "Ready_to_Upload"
OUTPUT_FILE = "AMD_Manifesto_Full.mp4"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILE)

CLIP_NAMES = ["clip1.mp4", "clip2.mp4", "clip3.mp4"]
TRANSITION = 1.0  # seconds for cross-dissolve


def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 1. Verify clips exist
    paths = [os.path.join(RAW_DIR, n) for n in CLIP_NAMES]
    missing = [p for p in paths if not os.path.exists(p)]
    if missing:
        print("Missing files:", missing)
        return

    # 2. Load clips
    clips = [VideoFileClip(p) for p in paths]

    # 3. Apply crossfade effects and compute start times
    prepared = []
    durations = [c.duration for c in clips]

    for i, clip in enumerate(clips):
        # Apply visual crossfade-in for all except first
        effects = []
        if i > 0:
            effects.append(CrossFadeIn(TRANSITION))
        # Apply visual crossfade-out for all except last
        if i < len(clips) - 1:
            effects.append(CrossFadeOut(TRANSITION))

        if effects:
            clip = clip.with_effects(effects)

        # start time = sum of previous durations - TRANSITION * i
        start = sum(durations[:i]) - TRANSITION * i if i > 0 else 0
        clip = clip.with_start(start)
        prepared.append(clip)

    # 4. Create composite and write file
    final = CompositeVideoClip(prepared)

    # Optionally set final duration explicitly
    total_duration = sum(durations) - TRANSITION * (len(clips) - 1)
    final = final.with_duration(total_duration)

    print(f"Rendering final video to {OUTPUT_PATH} (duration {total_duration:.2f}s)")
    final.write_videofile(OUTPUT_PATH, fps=24, codec="libx264", audio_codec="aac")


if __name__ == "__main__":
    main()
