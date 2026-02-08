#!/usr/bin/env python3
"""
OPERATION DEEP LISTEN - Alternative: Google Gemini Audio Transcription
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print("🎧 OPERATION DEEP LISTEN - GEMINI TRANSCRIPTION")
print("=" * 60)

audio_path = "social_engine/assets/Job2_Airdrop_AutoClaimer/Airdrop_Audio_Master.mp3"
print(f"📁 Target: {audio_path}")

# Upload audio file
print("📤 Uploading audio to Gemini...")
audio_file = genai.upload_file(audio_path)
print(f"✅ Uploaded: {audio_file.name}")

# Use Gemini to transcribe
print("\n🤖 Requesting transcription from Gemini...")
model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content([
    "Transcribe this audio file exactly. Provide only the spoken words with no additional commentary.",
    audio_file
])

print("\n" + "=" * 60)
print("--- AUDIO TRANSCRIPT START ---")
print("=" * 60)
print()
print(response.text)
print()
print("=" * 60)
print("--- AUDIO TRANSCRIPT END ---")
print("=" * 60)
print("\n✅ TRANSCRIPTION COMPLETE")
