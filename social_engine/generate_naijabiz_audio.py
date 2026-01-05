#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - AUDIO GENERATION (TRINITY PROTOCOL - FINAL STEP)
═══════════════════════════════════════════════════════════════════════════
Protocol: OpenAI TTS with Onyx Voice (Mandatory)
═══════════════════════════════════════════════════════════════════════════
"""

import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Audio script
SCRIPT = """It is 2026. If you are still waking up to reply to 'How much?' messages, you are working too hard. Stop losing customers to competitors who reply faster. Introducing the NaijaBiz Pilot. The AI Sales Manager that lives on your WhatsApp. It replies instantly. It sends your catalog. It closes the sale. Even while you sleep. Sleep. We sell for you. DM 'PILOT' to install now."""

# Output path
OUTPUT_DIR = Path('/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job1_NaijaBiz_Pilot')
OUTPUT_FILE = OUTPUT_DIR / 'NaijaBiz_Audio_Master.mp3'

print("═" * 75)
print("🎙️  GENERATING NAIJABIZ PILOT AUDIO (TRINITY PROTOCOL - FINAL STEP)")
print("═" * 75)
print()
print("🤖 Using: OpenAI TTS (Paid API)")
print("🗣️  Voice: ONYX (Mandatory per AUTOMATION_README.md)")
print()
print("📝 Script:")
print("-" * 75)
print(SCRIPT)
print("-" * 75)
print()
print(f"📁 Output: {OUTPUT_FILE}")
print()
print("⏳ Generating professional voiceover... (10-20 seconds)")
print()

try:
    # Generate audio with TTS
    response = client.audio.speech.create(
        model="tts-1-hd",  # High-definition quality
        voice="onyx",       # Mandatory voice per AUTOMATION_README.md
        input=SCRIPT
    )
    
    # Save audio file
    response.stream_to_file(str(OUTPUT_FILE))
    
    # Get file size
    file_size = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    
    print("✅ AUDIO GENERATED!")
    print(f"📁 Location: {OUTPUT_FILE}")
    print(f"💾 Size: {file_size:.2f} MB")
    print()
    print("═" * 75)
    print("🎯 TRINITY ASSETS STATUS - JOB 1 (NAIJABIZ PILOT)")
    print("═" * 75)
    print()
    
    # Check all trinity assets
    image_path = OUTPUT_DIR / 'NaijaBiz_Pilot_Flyer_Master.png'
    video_path = OUTPUT_DIR / 'NaijaBiz_Pilot_Video_Master.mp4'
    audio_path = OUTPUT_FILE
    
    if image_path.exists():
        img_size = image_path.stat().st_size / (1024 * 1024)
        print(f"✅ IMAGE: {image_path.name} ({img_size:.2f} MB)")
    else:
        print("❌ IMAGE: Missing")
    
    if video_path.exists():
        vid_size = video_path.stat().st_size / (1024 * 1024)
        print(f"✅ VIDEO: {video_path.name} ({vid_size:.2f} MB)")
    else:
        print("❌ VIDEO: Missing")
    
    if audio_path.exists():
        print(f"✅ AUDIO: {audio_path.name} ({file_size:.2f} MB)")
    else:
        print("❌ AUDIO: Generation failed")
    
    print()
    
    # Check if trinity is complete
    if image_path.exists() and video_path.exists() and audio_path.exists():
        print("🎉 TRINITY COMPLETE! All 3 assets ready for deployment.")
        print()
        print("📦 Campaign Assets:")
        print(f"   📁 {OUTPUT_DIR}")
        print(f"   ├── 🖼️  {image_path.name}")
        print(f"   ├── 🎥 {video_path.name}")
        print(f"   └── 🎙️  {audio_path.name}")
    else:
        missing_count = sum([not image_path.exists(), not video_path.exists(), not audio_path.exists()])
        print(f"⚠️  Trinity Incomplete: {missing_count} asset(s) missing")
    
    print()
    print("═" * 75)
    print("🚀 NEXT: Deploy to all platforms using Trinity assets")
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    if "billing" in str(e).lower():
        print("💳 OpenAI billing issue - check payment method")
    elif "quota" in str(e).lower():
        print("⏳ API quota exceeded - wait or upgrade plan")
    print("═" * 75)
