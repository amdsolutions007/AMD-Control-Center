#!/usr/bin/env python3
"""
THE ARCHITECT'S VIDEO - Digital Twin Integration
CEO: Olawale Shoyemi's LinkedIn Promo
"""
import os
import sys
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load OpenAI credentials
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/whatsapp_empire/.env')

print("🎬 THE ARCHITECT'S VIDEO - PRODUCTION START")
print("=" * 70)

# Paths
DIGITAL_TWIN = '/Users/mac/Desktop/AMD_Control_Center/apps/website/public/founder.jpg'
AUDIO_OUTPUT = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_promo.mp3'
VIDEO_OUTPUT = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_video.mp4'

# Verify Digital Twin exists
if not Path(DIGITAL_TWIN).exists():
    print(f"❌ Digital Twin not found: {DIGITAL_TWIN}")
    sys.exit(1)

print(f"✅ Digital Twin located: {DIGITAL_TWIN}")

# The Architect's Script
script = """This is Olawale Shoyemi. They told us to stay in the dark, so I built a torch.
I am the Founder of AMD Media Solutions. I don't just write code; I engineer Nations.
We are building the Digital Future of Nigeria.
Do not watch from the sidelines. Connect with the Architect on LinkedIn.
Link in bio."""

print(f"\n📝 Script length: {len(script)} chars")
print(f"🎙️  Voice: OpenAI 'onyx' (Deep CEO Tone)")

# Generate TTS Audio
try:
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    print("\n🎤 Generating CEO voiceover...")
    with client.audio.speech.with_streaming_response.create(
        model="tts-1-hd",
        voice="onyx",  # Deep, authoritative, CEO voice
        speed=0.92,  # Slightly slower for gravitas
        input=script,
    ) as response:
        with open(AUDIO_OUTPUT, "wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)
    
    audio_size = Path(AUDIO_OUTPUT).stat().st_size / 1024  # KB
    print(f"✅ Voiceover created: {AUDIO_OUTPUT}")
    print(f"📊 Audio size: {audio_size:.1f} KB")
    
except Exception as e:
    print(f"❌ TTS generation failed: {e}")
    sys.exit(1)

# Now create video with MoviePy (zoom effect)
print("\n🎬 Creating video with zoom effect...")

try:
    from moviepy import *
    from moviepy.video.fx.FadeIn import FadeIn
    from moviepy.video.fx.FadeOut import FadeOut
    import numpy as np
    
    # Load audio to get duration
    audio = AudioFileClip(AUDIO_OUTPUT)
    duration = audio.duration
    
    print(f"⏱️  Audio duration: {duration:.1f} seconds")
    
    # Load Digital Twin image
    img = ImageClip(DIGITAL_TWIN, duration=duration)
    
    # Get original dimensions
    w, h = img.size
    print(f"📐 Image size: {w}x{h}")
    
    # Apply zoom effect using resize with lambda
    # Zoom from 1.0 to 1.15 over duration (15% zoom)
    img_zoomed = img.resized(lambda t: 1.0 + (0.15 * t / duration))
    
    # Add audio
    final = img_zoomed.with_audio(audio)
    
    # Add fade effects
    final = final.with_effects([FadeIn(1.0), FadeOut(1.0)])
    
    # Export video
    print("\n🎬 Exporting video (this may take a minute)...")
    final.write_videofile(
        VIDEO_OUTPUT,
        fps=30,
        codec='libx264',
        audio_codec='aac',
        bitrate='5000k',
        preset='medium',
        threads=4
    )
    
    video_size = Path(VIDEO_OUTPUT).stat().st_size / (1024 * 1024)  # MB
    
    print("\n" + "=" * 70)
    print("✅ THE ARCHITECT'S VIDEO COMPLETE!")
    print("=" * 70)
    print(f"📹 Video: {VIDEO_OUTPUT}")
    print(f"📊 Size: {video_size:.1f} MB")
    print(f"⏱️  Duration: {duration:.1f} seconds")
    print(f"🎯 Resolution: {w}x{h} with zoom effect")
    print(f"🎙️  Voice: CEO Olawale Shoyemi (AI)")
    print("=" * 70)
    
except Exception as e:
    print(f"\n❌ Video creation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ PRODUCTION COMPLETE - Ready for broadcast!")
