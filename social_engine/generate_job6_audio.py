"""
Generate Job 6 Audio Master using OpenAI TTS.
"""

import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load environment
load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Paths
OUTPUT_DIR = Path(__file__).parent / 'assets' / 'Job6_Bank_Statement_Parser'
OUTPUT_FILE = OUTPUT_DIR / 'Job6_Audio_Master.mp3'

# Job 6 Script (from Bible)
SCRIPT = """How long does it take you to read a 300-page bank statement? Three days? Our AI does it in one second. Stop making customers wait for loans. The AMD Bank Statement Parser turns messy PDFs into instant decisions. Approve faster. Grow faster. DM 'AUDIT' to install. Powered by AMD Solutions 007."""

def generate_audio():
    """Generate audio using OpenAI TTS."""
    print("=" * 60)
    print("JOB 6: BANK STATEMENT PARSER - AUDIO GENERATION")
    print("=" * 60)
    print()
    print(f"📝 Script: {SCRIPT[:100]}...")
    print(f"🎙️  Voice: Onyx (Professional Male)")
    print(f"🎵 Model: tts-1-hd")
    print()
    print("🔄 Generating audio...")
    
    # Save audio file (streamed) using standard binary write
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with client.audio.speech.with_streaming_response.create(
        model="tts-1-hd",
        voice="onyx",
        input=SCRIPT,
    ) as response:
        with open(OUTPUT_FILE, "wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)
    
    print(f"✅ Audio saved: {OUTPUT_FILE}")
    print(f"💾 File size: {OUTPUT_FILE.stat().st_size / 1024:.1f} KB")
    print()
    print("=" * 60)
    print("AUDIO MASTER COMPLETE!")
    print("=" * 60)

if __name__ == '__main__':
    generate_audio()
