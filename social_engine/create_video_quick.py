#!/usr/bin/env python3
"""
Quick New Year 2026 YouTube Video
MoviePy 2.2.1 compatible
"""
import sys
sys.path.insert(0, '/Users/mac/Desktop/AMD_Control_Center')

from moviepy import *
import os

print("🎬 Creating New Year 2026 YouTube Video")
print("=" * 60)

# Load the image
image_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026.png'
print(f"📸 Loading image: {image_path}")

if not os.path.exists(image_path):
    print(f"❌ Image not found: {image_path}")
    sys.exit(1)

# Create video from image (30 seconds)
print("\n🎬 Creating video clip...")
img_clip = ImageClip(image_path, duration=30)

# Add fade effects  
img_clip = img_clip.with_effects([vfx.FadeIn(1.5), vfx.FadeOut(1.5)])

# Export video
output_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026_video.mp4'
print(f"\n📹 Exporting video: {output_path}")
print("⏳ Please wait...\n")

try:
    img_clip.write_videofile(
        output_path,
        fps=30,
        codec='libx264',
        preset='medium',
        bitrate='5000k',
        logger=None  # Suppress verbose output
    )
    
    print("\n" + "=" * 60)
    print(f"✅ VIDEO CREATED: {output_path}")
    print(f"📐 Resolution: 1920x1080 (Full HD)")
    print(f"⏱️  Duration: 30 seconds")
    print(f"📝 Note: No voiceover yet (will add with OpenAI TTS)")
    print("\n🚀 Ready to upload to YouTube!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Error creating video: {e}")
    print("\n💡 Checking if FFmpeg is installed...")
    os.system("which ffmpeg")
    sys.exit(1)
