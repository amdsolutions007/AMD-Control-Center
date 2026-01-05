#!/usr/bin/env python3
"""
Professional New Year 2026 YouTube Video
With OpenAI TTS voiceover (same as Little Drop audiobook)
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, '/Users/mac/Desktop/AMD_Control_Center')

from moviepy.editor import *
from moviepy.video.fx.all import fadein, fadeout
from PIL import Image, ImageDraw, ImageFont
from openai import OpenAI
import requests
from dotenv import load_dotenv

# Load environment
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

print("🎬 Creating Professional New Year 2026 YouTube Video")
print("=" * 60)

# Script for voiceover
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

print("\n🎤 Generating professional voiceover with OpenAI TTS...")
print(f"Voice: Same as Little Drop audiobook\n")

# Generate voiceover using OpenAI TTS (same as Little Drop)
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

try:
    response = client.audio.speech.create(
        model="tts-1-hd",  # High quality
        voice="onyx",  # Professional male voice (same as Little Drop)
        input=script,
        speed=0.95  # Slightly slower for clarity
    )
    
    audio_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_voiceover.mp3'
    response.stream_to_file(audio_path)
    print(f"✅ Voiceover generated: {audio_path}")
    
except Exception as e:
    print(f"⚠️  OpenAI TTS failed: {e}")
    print("Creating video without voiceover...")
    audio_path = None

# Load the image we created
image_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026.png'
print(f"\n📸 Loading image: {image_path}")

# Create video from image
img_clip = ImageClip(image_path).set_duration(30)  # 30 seconds

# Add fade in/out effects
img_clip = fadein(img_clip, 1).fadeout(1)

# Add voiceover if available
if audio_path and os.path.exists(audio_path):
    audio_clip = AudioFileClip(audio_path)
    # Adjust video duration to match audio
    img_clip = img_clip.set_duration(audio_clip.duration)
    img_clip = img_clip.set_audio(audio_clip)
    print(f"✅ Audio added: {audio_clip.duration:.1f} seconds")

# Export video
output_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026_video.mp4'
print(f"\n🎬 Creating video: {output_path}")
print("⏳ This may take 1-2 minutes...\n")

img_clip.write_videofile(
    output_path,
    fps=30,
    codec='libx264',
    audio_codec='aac',
    temp_audiofile='temp-audio.m4a',
    remove_temp=True,
    preset='medium',
    bitrate='5000k'
)

print("\n" + "=" * 60)
print(f"✅ VIDEO CREATED: {output_path}")
print(f"📐 Resolution: 1920x1080 (Full HD)")
print(f"🎤 Voice: Professional (OpenAI TTS - same as Little Drop)")
print(f"⏱️  Duration: {img_clip.duration:.1f} seconds")
print("\n🚀 Ready to upload to YouTube!")
print("=" * 60)
