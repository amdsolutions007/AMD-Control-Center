#!/usr/bin/env python3
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print("🎧 JOB 3 AUDIO TRANSCRIPTION")
audio_path = "social_engine/assets/Job3_RealEstate_Mapper/Job3_Audio_Master.mp3"
audio_file = genai.upload_file(audio_path)
model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content([
    "Transcribe this audio exactly. Provide only the spoken words.",
    audio_file
])
print("\n" + "="*60)
print(response.text)
print("="*60)
