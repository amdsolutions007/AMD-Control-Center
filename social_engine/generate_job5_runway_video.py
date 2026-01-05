"""
Generate Job 5 Video Master using Runway Gen-3 API.
Uploads the twin image and generates a talking video.
"""

import os
import time
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv(dotenv_path=Path('.env'))
RUNWAY_API_KEY = os.getenv('RUNWAY_API_KEY')

if not RUNWAY_API_KEY:
    raise ValueError("RUNWAY_API_KEY not found in .env file")

# Paths
ASSETS_DIR = Path(__file__).parent / 'assets' / 'Job5_CBN_Compliance'
TWIN_IMAGE = ASSETS_DIR / 'Job5_Twin_Master.png'
OUTPUT_VIDEO = ASSETS_DIR / 'Job5_Video_Master.mp4'

# Job 5 script
SCRIPT = """Central Bank of Nigeria compliance is mandatory for all financial institutions operating in Nigeria. Our automated compliance bot monitors your transactions 24/7, instantly flags violations before they reach CBN's radar, and generates audit-ready reports in real time. From KYC verification to anti-money laundering checks, we handle every regulatory requirement automatically. No more manual reviews, no more compliance officers working overtime, no more penalties. Your institution stays compliant while your team focuses on growth. Powered by AMD Solutions 007."""

def encode_image_to_base64(image_path: Path) -> str:
    """Encode image to base64."""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def create_video_generation(prompt: str, image_base64: str) -> str:
    """Create a video generation request and return task ID."""
    url = 'https://api.dev.runwayml.com/v1/image_to_video'
    
    headers = {
        'Authorization': f'Bearer {RUNWAY_API_KEY}',
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
    }
    
    payload = {
        'model': 'gen3a_turbo',  # Fast Gen-3 model
        'promptImage': f'data:image/png;base64,{image_base64}',
        'promptText': prompt,
        'duration': 10,  # 10 seconds max for free tier
        'ratio': '1280:768',  # Landscape format (Runway only supports 768:1280 or 1280:768)
        'seed': 42,
    }
    
    print(f"📤 Submitting video generation request...")
    print(f"   Model: gen3a_turbo")
    print(f"   Duration: 10 seconds")
    print(f"   Ratio: 1280:768 (landscape)")
    print(f"   Prompt: {prompt[:80]}...")
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200 or response.status_code == 201:
        data = response.json()
        task_id = data.get('id')
        print(f"✅ Video generation started! Task ID: {task_id}")
        return task_id
    else:
        print(f"❌ Failed to create video generation.")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        raise Exception(f"Video generation failed: {response.text}")

def check_task_status(task_id: str) -> dict:
    """Check the status of a video generation task."""
    url = f'https://api.dev.runwayml.com/v1/tasks/{task_id}'
    
    headers = {
        'Authorization': f'Bearer {RUNWAY_API_KEY}',
        'X-Runway-Version': '2024-11-06',
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"⚠️  Failed to check task status.")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def download_video(video_url: str, output_path: Path):
    """Download the generated video."""
    print(f"📥 Downloading video...")
    response = requests.get(video_url, stream=True)
    
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✅ Video saved to: {output_path}")
    else:
        raise Exception(f"Failed to download video: {response.status_code}")

def main():
    """Main video generation workflow."""
    print("=" * 60)
    print("JOB 5: CBN COMPLIANCE BOT - VIDEO MASTER GENERATION")
    print("=" * 60)
    print()
    
    # Verify twin image exists
    if not TWIN_IMAGE.exists():
        raise FileNotFoundError(f"Twin image not found: {TWIN_IMAGE}")
    
    print(f"📸 Twin Image: {TWIN_IMAGE.name}")
    print()
    
    # Encode image
    print("🔄 Encoding image to base64...")
    image_base64 = encode_image_to_base64(TWIN_IMAGE)
    print(f"✅ Image encoded ({len(image_base64)} bytes)")
    print()
    
    # Create video generation
    task_id = create_video_generation(SCRIPT, image_base64)
    print()
    
    # Poll for completion
    print("⏳ Waiting for video generation to complete...")
    print("   (This typically takes 1-3 minutes)")
    print()
    
    max_attempts = 60  # 10 minutes max
    attempt = 0
    
    while attempt < max_attempts:
        attempt += 1
        time.sleep(10)  # Check every 10 seconds
        
        status_data = check_task_status(task_id)
        
        if not status_data:
            print(f"⚠️  Attempt {attempt}/{max_attempts}: Failed to get status, retrying...")
            continue
        
        status = status_data.get('status')
        progress = status_data.get('progress', 0)
        
        print(f"🔄 Attempt {attempt}/{max_attempts}: Status = {status}, Progress = {progress}%")
        
        if status == 'SUCCEEDED':
            video_url = status_data.get('output', [None])[0]
            if video_url:
                print()
                print("✅ Video generation completed!")
                print(f"   Video URL: {video_url}")
                print()
                download_video(video_url, OUTPUT_VIDEO)
                print()
                print("=" * 60)
                print("SUCCESS! Job 5 Video Master generated.")
                print("=" * 60)
                return
            else:
                raise Exception("Video generation succeeded but no output URL found")
        
        elif status in ['FAILED', 'CANCELLED']:
            error = status_data.get('failure')
            raise Exception(f"Video generation {status}: {error}")
    
    raise TimeoutError("Video generation timed out after 10 minutes")

if __name__ == '__main__':
    main()
