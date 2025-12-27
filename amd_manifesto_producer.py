#!/usr/bin/env python3
import os
from gtts import gTTS
from moviepy import VideoFileClip, CompositeVideoClip, AudioFileClip
from moviepy.video.fx import CrossFadeIn, CrossFadeOut
from moviepy.audio.fx import AudioFadeIn, AudioFadeOut
from moviepy.audio.AudioClip import CompositeAudioClip

RAW_DIR = "Raw_Footage_Vault"
OUTPUT_DIR = "Ready_to_Upload"
VOICE_FILE = "manifesto_voice.mp3"
OUTPUT_VIDEO = "AMD_Manifesto_Final.mp4"
OUTPUT_DESC = "AMD_Manifesto_Final.txt"

CLIP_NAMES = ["clip1.mp4", "clip2.mp4", "clip3.mp4"]
TRANSITION = 1.0  # seconds for cross-dissolve and audio fades
UNDERLYING_VOLUME = 0.35  # scale for original clip audio so voiceover is clear

VOICE_TEXT = (
    "Welcome to the new era of AMD Solutions 007. The Old Way is Dead. "
    "We don't just guess; we engineer digital dominance. This is the Intelligence Hub "
    "where Human Creativity meets Artificial Intelligence. Join the Resistance."
)

DESCRIPTION_TEXT = (
    "THE OLD WAY IS DEAD. Welcome to the new era of AMD Solutions 007. 🛑 "
    "We engineer digital dominance. 🏆 Mission: Illuminating the Digital Dark. "
    "The Pilot: Solutions 007 (Man Powered by AI). Join the Resistance. Subscribe. #AI #AMD #Solutions007"
)


def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Phase 1: generate voiceover
    voice_path = os.path.join(OUTPUT_DIR, VOICE_FILE)
    tts = gTTS(text=VOICE_TEXT, lang='en')
    tts.save(voice_path)
    print(f"Saved voiceover to {voice_path}")

    # Phase 2: load and prepare clips
    paths = [os.path.join(RAW_DIR, n) for n in CLIP_NAMES]
    missing = [p for p in paths if not os.path.exists(p)]
    if missing:
        print("Missing files, aborting:", missing)
        return

    clips = [VideoFileClip(p) for p in paths]
    durations = [c.duration for c in clips]

    prepared_clips = []
    prepared_audios = []

    for i, clip in enumerate(clips):
        # Reduce original audio volume so voiceover can be clear
        audio = clip.audio
        if audio is not None:
            audio = audio.with_volume_scaled(UNDERLYING_VOLUME)
            # Apply audio fades for crossfade
            effects = []
            if i > 0:
                effects.append(AudioFadeIn(TRANSITION))
            if i < len(clips) - 1:
                effects.append(AudioFadeOut(TRANSITION))
            if effects:
                audio = audio.with_effects(effects)
        # Attach adjusted audio back
        clip = clip.with_audio(audio) if audio is not None else clip

        # Apply visual crossfade effects
        vfxs = []
        if i > 0:
            vfxs.append(CrossFadeIn(TRANSITION))
        if i < len(clips) - 1:
            vfxs.append(CrossFadeOut(TRANSITION))
        if vfxs:
            clip = clip.with_effects(vfxs)

        # Compute start time with overlap
        start = sum(durations[:i]) - TRANSITION * i if i > 0 else 0
        clip = clip.with_start(start)
        prepared_clips.append(clip)

        # Prepare audio clip with same start
        if clip.audio is not None:
            audio_clip = clip.audio.with_start(start)
            prepared_audios.append(audio_clip)

    # Phase 3: mix audio
    # Load voiceover and set start at 0
    voice_audio = AudioFileClip(voice_path)
    voice_audio = voice_audio.with_start(0)

    all_audios = prepared_audios + [voice_audio]
    composite_audio = CompositeAudioClip(all_audios)

    # Composite video
    final = CompositeVideoClip(prepared_clips).with_audio(composite_audio)

    # Optionally set duration to cover everything
    total_duration = sum(durations) - TRANSITION * (len(clips) - 1)
    final = final.with_duration(total_duration)

    out_path = os.path.join(OUTPUT_DIR, OUTPUT_VIDEO)
    print(f"Rendering final video to {out_path} (duration {total_duration:.2f}s)")
    final.write_videofile(out_path, fps=24, codec='libx264', audio_codec='aac')

    # Phase 4: write description file
    desc_path = os.path.join(OUTPUT_DIR, OUTPUT_DESC)
    with open(desc_path, 'w') as f:
        f.write(DESCRIPTION_TEXT)
    print(f"Wrote description to {desc_path}")


if __name__ == '__main__':
    main()
