#!/usr/bin/env python3
"""
Job5 Audio Transcription - Factory Protocol
Transcribes Job5_Audio_Master.mp3 using Google Gemini
"""

import os
import glob
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def transcribe_job5():
    """Transcribe Job5 audio using Gemini"""
    
    # Find Job5 audio file
    audio_files = glob.glob("social_engine/assets/Job5*/Job5_Audio_Master.mp3")
    
    if not audio_files:
        print("❌ ERROR: Job5_Audio_Master.mp3 not found")
        return None
    
    audio_path = audio_files[0]
    print(f"📁 Found audio: {audio_path}")
    
    # Upload audio to Gemini
    print("⬆️  Uploading audio to Gemini...")
    audio_file = genai.upload_file(audio_path)
    print(f"✅ Audio uploaded: {audio_file.name}")
    
    # Transcribe with Gemini
    print("🎙️  Transcribing with Gemini 2.5 Flash...")
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    response = model.generate_content([
        "Transcribe this audio exactly. Provide only the spoken words, no additional commentary.",
        audio_file
    ])
    
    transcript = response.text.strip()
    
    # Save transcript
    transcript_path = "/tmp/job5_transcript.txt"
    with open(transcript_path, 'w') as f:
        f.write(transcript)
    
    print("\n" + "="*60)
    print("TRANSCRIPT:")
    print("="*60)
    print(transcript)
    print("="*60)
    print(f"✅ Transcript saved to {transcript_path}")
    
    return transcript

if __name__ == "__main__":
    transcribe_job5()
