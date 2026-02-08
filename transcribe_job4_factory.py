#!/usr/bin/env python3
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print("🎧 JOB 4 AUDIO TRANSCRIPTION - FACTORY PROTOCOL")
print("="*60)

# Find audio file
import glob
audio_files = glob.glob("social_engine/assets/Job4*/Job4_Audio_Master.mp3") + \
              glob.glob("social_engine/assets/Job4*/*Audio*.mp3")

if not audio_files:
    print("❌ No audio file found")
    exit(1)

audio_path = audio_files[0]
print(f"📁 Target: {audio_path}")

audio_file = genai.upload_file(audio_path)
print("📤 Uploaded to Gemini")

model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content([
    "Transcribe this audio exactly. Provide only the spoken words with no commentary.",
    audio_file
])

print("\n" + "="*60)
print("TRANSCRIPT:")
print("="*60)
print(response.text)
print("="*60)

# Save to file for strategy generation
with open('/tmp/job4_transcript.txt', 'w') as f:
    f.write(response.text)
print("\n✅ Transcript saved to /tmp/job4_transcript.txt")
