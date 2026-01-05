#!/usr/bin/env python3
"""
Crypto Airdrop Auto-Claimer - Voiceover (Onyx TTS)
Outputs MP3 to assets/Job2_CryptoAirdrop_AutoClaimer/Job2_Airdrop_VO.mp3
"""
import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SCRIPT = (
    "Never miss a legit airdrop again. This is the Crypto Airdrop Auto-Claimer. "
    "We auto-track approved airdrops, run a dry-run first, then only claim on your allowlist. "
    "Every step is logged. You keep custody. No blind signing. "
    "DM 'CLAIM' to activate and start collecting safely."
)

OUTPUT = Path("/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job2_CryptoAirdrop_AutoClaimer/Job2_Airdrop_VO.mp3")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

print("═" * 75)
print("🎙️  Generating Job 2 Voiceover (Onyx)")
print("═" * 75)
print(SCRIPT)
print()

try:
    response = client.audio.speech.create(
        model="tts-1-hd",
        voice="onyx",
        input=SCRIPT,
    )
    response.stream_to_file(str(OUTPUT))
    size_mb = OUTPUT.stat().st_size / (1024 * 1024)
    print(f"✅ Saved: {OUTPUT} ({size_mb:.2f} MB)")
except Exception as e:
    print(f"❌ Error: {e}")
    if "billing" in str(e).lower():
        print("💳 Check OpenAI billing")
    elif "quota" in str(e).lower():
        print("⏳ Quota exceeded")
print("═" * 75)
