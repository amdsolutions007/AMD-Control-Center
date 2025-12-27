#!/usr/bin/env python3
import os
from gtts import gTTS
from moviepy import TextClip, CompositeVideoClip, ColorClip, AudioFileClip

OUTPUT_DIR = "Ready_to_Upload"
AUDIO_FILE = "audio_007.mp3"
OUTPUT_FILE = "audio_test_007.mp4"

AUDIO_PATH = os.path.join(OUTPUT_DIR, AUDIO_FILE)
OUTPUT_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILE)

TTS_TEXT = (
    "Welcome to AMD Solutions 007. The old way is dead. We are now fully operational."
)
VIDEO_TEXT = "SYSTEM ONLINE: AUDIO ACTIVE"


def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 1. Generate TTS audio
    tts = gTTS(text=TTS_TEXT, lang="en")
    tts.save(AUDIO_PATH)
    print(f"Saved TTS audio to {AUDIO_PATH}")

    # 2. Load audio and build video matching its duration
    audio = AudioFileClip(AUDIO_PATH)
    duration = audio.duration

    width, height = 1280, 720

    # Black background clip
    bg = ColorClip(size=(width, height), color=(0, 0, 0)).with_duration(duration)

    # Centered gold text
    txt = TextClip(text=VIDEO_TEXT, font_size=80, color="#FFD700")
    txt = txt.with_duration(duration).with_position("center")

    final = CompositeVideoClip([bg, txt]).with_audio(audio)

    # 3. Write final video
    final.write_videofile(OUTPUT_PATH, fps=24, codec="libx264", audio_codec="aac")

    print(f"Video written to {OUTPUT_PATH}")

    # Optional: keep the audio file for debugging


if __name__ == "__main__":
    main()
