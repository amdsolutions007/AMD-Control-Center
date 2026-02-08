#!/usr/bin/env python3
"""
OPERATION DEEP LISTEN - Audio Transcription
Extracting intelligence from Job2 Airdrop audio file
"""
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

print("🎧 OPERATION DEEP LISTEN - COMMENCING TRANSCRIPTION")
print("=" * 60)

audio_path = "social_engine/assets/Job2_Airdrop_AutoClaimer/Airdrop_Audio_Master.mp3"
print(f"📁 Target: {audio_path}")

audio_file = open(audio_path, "rb")
print("🔊 Audio file loaded")

print("\n🤖 Sending to Whisper-1 model...")
transcript = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file
)

print("\n" + "=" * 60)
print("--- AUDIO TRANSCRIPT START ---")
print("=" * 60)
print()
print(transcript.text)
print()
print("=" * 60)
print("--- AUDIO TRANSCRIPT END ---")
print("=" * 60)
print("\n✅ TRANSCRIPTION COMPLETE")
