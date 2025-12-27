#!/usr/bin/env python3
import os
from moviepy import TextClip, CompositeVideoClip, ColorClip

OUTPUT_DIR = "Ready_to_Upload"
OUTPUT_FILE = "manifesto_test.mp4"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILE)

def main():
    # Ensure output folder exists
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    duration = 5
    width, height = 1280, 720

    # Black background
    bg = ColorClip(size=(width, height), color=(0, 0, 0)).with_duration(duration)

    # Text clip (gold color). Font may vary by system; adjust `font` if needed.
    txt = TextClip(text="THE OLD WAY IS DEAD", font_size=80, color="#FFD700")
    txt = txt.with_duration(duration)

    # Create a mask for fade-in: ramp from 0->1 over 2 seconds
    mask = txt.to_mask().with_duration(duration)
    orig_mask = mask

    def mask_frame(t):
        alpha = min(1.0, t / 2.0)  # linear ramp over first 2 seconds
        return orig_mask.get_frame(t) * alpha

    mask = mask.with_updated_frame_function(mask_frame)
    txt = txt.with_mask(mask).with_position("center")

    final = CompositeVideoClip([bg, txt])

    # Render to file
    final.write_videofile(OUTPUT_PATH, fps=24, codec="libx264", audio=False)

if __name__ == "__main__":
    main()
