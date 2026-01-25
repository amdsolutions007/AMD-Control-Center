#!/usr/bin/env python3
"""
New Year 2026 Video WITH VOICEOVER
Using OpenAI TTS - Same voice as Little Drop audiobook
"""
import sys
import os
sys.path.insert(0, '/Users/mac/Desktop/AMD_Control_Center')

from moviepy import *
from openai import OpenAI
from dotenv import load_dotenv

# Load correct .env with OpenAI key
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/whatsapp_empire/.env')

print("🎬 Creating New Year 2026 Video WITH PROFESSIONAL VOICEOVER")
print("=" * 60)

# Initialize OpenAI
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("❌ OpenAI key not found")
    sys.exit(1)

client = OpenAI(api_key=api_key)

# Script (same as Little Drop style)
script = """
Happy New Year 2026!

To every Nigerian builder - this is YOUR year. This is OUR year. This is NIGERIA's year.

Three years ago, I made a decision. I partnered with AI. Not just used it... I PARTNERED with it.

Today? Six platforms automated. WhatsApp empire built. Social media on autopilot. Videos created by AI. Everything running while I sleep.

And now, I'm showing YOU how to do the same.

RiseTogether NG is LIVE. Nine hundred and ninety-nine Nigerian creatives, backing one spotlight daily. AI tools for Nigerian businesses. Building the digital future together.

Want in? Reply 'RISE' to plus two three four, eight one eight, zero zero two, one zero zero seven.

Twenty twenty-six. The year Nigeria rises. Let's build!
"""

print("\n🎤 Generating voiceover with OpenAI TTS...")
print("Voice: Professional (same as Little Drop audiobook)")

# Generate voiceover (streamed) and save via standard binary write
audio_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_voiceover.mp3'
with client.audio.speech.with_streaming_response.create(
    model="tts-1-hd",
    voice="onyx",  # Same voice as Little Drop
    input=script,
    speed=0.95,
) as response:
    with open(audio_path, "wb") as f:
        for chunk in response.iter_bytes():
            f.write(chunk)
print(f"✅ Voiceover created: {audio_path}")

# Load audio to get duration
audio_clip = AudioFileClip(audio_path)
duration = audio_clip.duration
print(f"⏱️  Audio duration: {duration:.1f} seconds")

# Load image
image_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026.png'
print(f"\n📸 Loading image: {image_path}")

# Create video matching audio duration
img_clip = ImageClip(image_path, duration=duration)

# Add fade effects
img_clip = img_clip.with_effects([vfx.FadeIn(1.5), vfx.FadeOut(1.5)])

# Add audio to video
video_with_audio = img_clip.with_audio(audio_clip)

# Export
output_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026_final.mp4'
print(f"\n📹 Creating final video: {output_path}")
print("⏳ Please wait...\n")

video_with_audio.write_videofile(
    output_path,
    fps=30,
    codec='libx264',
    audio_codec='aac',
    preset='medium',
    bitrate='5000k'
)

print("\n" + "=" * 60)
print(f"✅ VIDEO WITH VOICEOVER CREATED!")
print("=" * 60)
print(f"📹 File: {output_path}")
print(f"📐 Resolution: 1920x1080 Full HD")
print(f"🎤 Voice: Professional OpenAI TTS (same as Little Drop)")
print(f"⏱️  Duration: {duration:.1f} seconds")
print("\n🚀 Ready for automated YouTube upload!")
print("=" * 60)
