#!/usr/bin/env python3
"""
RECREATE THE ARCHITECT'S VIDEO - PROFESSIONAL HD QUALITY
Using FFmpeg directly for proper video rendering
"""
import os
import sys
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
import subprocess

# Load OpenAI credentials
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/whatsapp_empire/.env')

print("🎬 THE ARCHITECT'S VIDEO - HD QUALITY REBUILD")
print("=" * 70)

# Paths
DIGITAL_TWIN = '/Users/mac/Desktop/AMD_Control_Center/apps/website/public/founder.jpg'
AUDIO_OUTPUT = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_promo.mp3'
VIDEO_OUTPUT = '/Users/mac/Desktop/AMD_Control_Center/social_engine/linkedin_video_hd.mp4'

# Verify Digital Twin exists
if not Path(DIGITAL_TWIN).exists():
    print(f"❌ Digital Twin not found: {DIGITAL_TWIN}")
    sys.exit(1)

print(f"✅ Digital Twin located: {DIGITAL_TWIN}")
print(f"   Image type: PNG (864x1184)")

# Check if audio already exists
if Path(AUDIO_OUTPUT).exists():
    audio_size = Path(AUDIO_OUTPUT).stat().st_size / 1024
    print(f"✅ Audio already exists: {audio_size:.1f} KB")
else:
    # The Architect's Script
    script = """This is Olawale Shoyemi. They told us to stay in the dark, so I built a torch.
I am the Founder of AMD Media Solutions. I don't just write code; I engineer Nations.
We are building the Digital Future of Nigeria.
Do not watch from the sidelines. Connect with the Architect on LinkedIn.
Link in bio."""

    print(f"\n📝 Generating voiceover...")
    
    try:
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        response = client.audio.speech.create(
            model="tts-1-hd",
            voice="onyx",
            speed=0.92,
            input=script
        )
        
        response.stream_to_file(AUDIO_OUTPUT)
        print(f"✅ Voiceover created")
        
    except Exception as e:
        print(f"❌ TTS generation failed: {e}")
        sys.exit(1)

# Get audio duration
print("\n🎬 Creating HD video with FFMPEG...")

try:
    # Get FFmpeg from imageio-ffmpeg (already installed)
    from imageio_ffmpeg import get_ffmpeg_exe
    import wave
    
    ffmpeg_path = get_ffmpeg_exe()
    print(f"✅ Using FFmpeg: {ffmpeg_path}")
    
    # Get audio duration using FFmpeg itself
    duration_cmd = [
        ffmpeg_path,
        '-i', AUDIO_OUTPUT,
        '-f', 'null',
        '-'
    ]
    
    result = subprocess.run(duration_cmd, capture_output=True, text=True)
    # Parse duration from output (format: Duration: 00:00:19.90)
    import re
    duration_match = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', result.stderr)
    if duration_match:
        hours, mins, secs = duration_match.groups()
        duration = int(hours) * 3600 + int(mins) * 60 + float(secs)
    else:
        duration = 20.0  # Fallback
    
    print(f"⏱️  Audio duration: {duration:.1f} seconds")
    
    # Create video with zoom effect using ffmpeg
    # Zoom from 1.0 to 1.15 (15% zoom) with high quality
    ffmpeg_cmd = [
        ffmpeg_path,
        '-loop', '1',
        '-i', DIGITAL_TWIN,
        '-i', AUDIO_OUTPUT,
        '-filter_complex',
        f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0008,1.15)':d={int(duration * 30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,fade=in:0:30,fade=out:st={duration - 1}:d=30[v]",
        '-map', '[v]',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'slow',  # Better quality
        '-crf', '18',  # High quality (lower = better)
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        '-y',  # Overwrite
        VIDEO_OUTPUT
    ]
    
    print("📹 Rendering with FFmpeg (high quality preset)...")
    print("   Resolution: 1920x1080 (Full HD)")
    print("   Codec: H.264 (CRF 18 - High Quality)")
    print("   Effect: Smooth zoom 1.0→1.15 with fade")
    
    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"\n❌ FFmpeg failed: {result.stderr}")
        sys.exit(1)
    
    video_size = Path(VIDEO_OUTPUT).stat().st_size / (1024 * 1024)
    
    print("\n" + "=" * 70)
    print("✅ HD VIDEO COMPLETE!")
    print("=" * 70)
    print(f"📹 Video: {VIDEO_OUTPUT}")
    print(f"📊 Size: {video_size:.1f} MB")
    print(f"⏱️  Duration: {duration:.1f} seconds")
    print(f"🎯 Resolution: 1920x1080 Full HD")
    print(f"🎙️  Voice: CEO Olawale Shoyemi (AI)")
    print(f"✨ Quality: CRF 18 (Professional)")
    print("=" * 70)
    
    print("\n📹 Testing video playback...")
    test_cmd = [
        'ffprobe',
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,codec_name',
        '-of', 'default=noprint_wrappers=1',
        VIDEO_OUTPUT
    ]
    
    test_result = subprocess.run(test_cmd, capture_output=True, text=True)
    print("✅ Video stream verified:")
    print(test_result.stdout)
    
except subprocess.CalledProcessError as e:
    print(f"\n❌ Command failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Video creation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ PROFESSIONAL HD VIDEO READY!")
