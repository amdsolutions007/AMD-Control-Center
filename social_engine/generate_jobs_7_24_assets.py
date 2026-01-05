"""
Batch generate audio and Veo3 prompts for Jobs 7-24.
"""

import os
import re
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load environment
load_dotenv(dotenv_path=Path(__file__).parent / '.env')
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

JOBS_DATA_DIR = Path(__file__).parent / 'jobs_data'
ASSETS_DIR = Path(__file__).parent / 'assets'

# Job definitions (7-24)
JOBS = [
    (7, 'Job7_Address_Intel', 'Job7_Address_Intel.md'),
    (8, 'Job8_Global_Intelligence', 'Job8_Global_Intelligence.md'),
    (9, 'Job9_Naija_Law', 'Job9_Naija_Law.md'),
    (10, 'Job10_Naija_Voice', 'Job10_Naija_Voice.md'),
    (11, 'Job11_Activity_Booster', 'Job11_Activity_Booster.md'),
    (12, 'Job12_NaijaStack', 'Job12_NaijaStack.md'),
    (13, 'Job13_Rent_Estimator', 'Job13_Rent_Estimator.md'),
    (14, 'Job14_TIL_Knowledge', 'Job14_TIL_Knowledge.md'),
    (15, 'Job15_Resume_Scanner', 'Job15_Resume_Scanner.md'),
    (16, 'Job16_Shine_Music', 'Job16_Shine_Music.md'),
    (17, 'Job17_SkyCap_Market', 'Job17_SkyCap_Market.md'),
    (18, 'Job18_Reborn_Thrift', 'Job18_Reborn_Thrift.md'),
    (19, 'Job19_Traffic_Logistics', 'Job19_Traffic_Logistics.md'),
    (20, 'Job20_Telemed_Health', 'Job20_Telemed_Health.md'),
    (21, 'Job21_AgriTech_Farm', 'Job21_AgriTech_Farm.md'),
    (22, 'Job22_Cyber_Shield', 'Job22_Cyber_Shield.md'),
    (23, 'Job23_EduTech_Class', 'Job23_EduTech_Class.md'),
    (24, 'Job24_Synergy_Hub', 'Job24_Synergy_Hub.md'),
]

def extract_audio_script(bible_path):
    """Extract audio script from Job Bible markdown."""
    content = bible_path.read_text(encoding='utf-8')
    
    # Look for audio script section
    audio_match = re.search(r'\*\*C\. TO CREATE THE AUDIO.*?\*\*Script:\*\*\s+"([^"]+)"', content, re.DOTALL)
    if audio_match:
        return audio_match.group(1).strip()
    
    # Alternative pattern
    audio_match = re.search(r'### \*\*C\. TO CREATE THE AUDIO.*?Script:\s+(.+?)(?=\n\n|---)', content, re.DOTALL)
    if audio_match:
        return audio_match.group(1).strip().strip('"')
    
    return None

def generate_audio(job_num, asset_folder, script):
    """Generate audio file."""
    output_file = ASSETS_DIR / asset_folder / f'Job{job_num}_Audio_Master.mp3'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"   🎙️  Generating audio...")
    
    response = client.audio.speech.create(
        model="tts-1-hd",
        voice="onyx",
        input=script
    )
    
    response.stream_to_file(output_file)
    
    size_kb = output_file.stat().st_size / 1024
    print(f"   ✅ Audio saved: {size_kb:.1f} KB")
    
    return output_file

def generate_veo3_prompt(job_num, asset_folder, bible_path):
    """Generate Veo3 prompt file."""
    content = bible_path.read_text(encoding='utf-8')
    
    # Extract Veo3 prompt
    veo3_match = re.search(r'\*\*B\. TO CREATE THE VIDEO.*?\*\*Prompt:\*\*\s+"([^"]+)"', content, re.DOTALL)
    if veo3_match:
        veo3_prompt = veo3_match.group(1).strip()
    else:
        veo3_prompt = "Animate this Digital Twin scene with professional lighting. 8k quality."
    
    # Extract audio script
    audio_script = extract_audio_script(bible_path)
    
    output_file = ASSETS_DIR / asset_folder / f'Job{job_num}_Veo3_Video_Master_Prompt.txt'
    
    prompt_content = f"""VEO3 VIDEO MASTER PROMPT - JOB {job_num}
============================================================

INSTRUCTIONS:
1. Go to: https://labs.google/flow or https://gemini.google.com/veo
2. Upload the source image: Job{job_num}_Twin_Master.png
3. Paste the VISUAL PROMPT below into Veo3
4. Set duration: 8-10 seconds
5. Generate video
6. Download and save as: Job{job_num}_Video_Master.mp4

============================================================
VISUAL PROMPT (Image-to-Video):
============================================================

{veo3_prompt}

============================================================
AUDIO SCRIPT (Narration - Already Generated):
============================================================

{audio_script}

============================================================
BRANDING:
- Outro: "Powered by AMD Solutions 007" (included in audio)
============================================================
"""
    
    output_file.write_text(prompt_content, encoding='utf-8')
    print(f"   ✅ Veo3 prompt saved")
    
    return output_file

def process_job(job_num, asset_folder, bible_file):
    """Process a single job."""
    bible_path = JOBS_DATA_DIR / bible_file
    
    if not bible_path.exists():
        print(f"❌ Job {job_num}: Bible not found - {bible_file}")
        return False
    
    print(f"\n{'='*60}")
    print(f"JOB {job_num}: {asset_folder.replace('_', ' ').upper()}")
    print(f"{'='*60}")
    
    # Extract script
    script = extract_audio_script(bible_path)
    if not script:
        print(f"   ⚠️  Could not extract audio script")
        return False
    
    # Generate audio
    generate_audio(job_num, asset_folder, script)
    
    # Generate Veo3 prompt
    generate_veo3_prompt(job_num, asset_folder, bible_path)
    
    print(f"   ✅ Job {job_num} complete!")
    
    return True

def main():
    """Batch process all jobs."""
    print("=" * 60)
    print("BATCH AUDIO + VEO3 GENERATION: JOBS 7-24")
    print("=" * 60)
    
    completed = 0
    failed = 0
    
    for job_num, asset_folder, bible_file in JOBS:
        try:
            if process_job(job_num, asset_folder, bible_file):
                completed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Job {job_num} failed: {e}")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"BATCH COMPLETE")
    print(f"{'='*60}")
    print(f"✅ Completed: {completed}")
    print(f"❌ Failed: {failed}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
