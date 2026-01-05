"""
Generate Job 5 Video Master using D-ID API.
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
DID_API_KEY = os.getenv('DID_API_KEY')

if not DID_API_KEY:
    raise ValueError("DID_API_KEY not found in .env file")

# Paths
ASSETS_DIR = Path(__file__).parent / 'assets' / 'Job5_CBN_Compliance'
TWIN_IMAGE = ASSETS_DIR / 'Job5_Twin_Master.png'
OUTPUT_VIDEO = ASSETS_DIR / 'Job5_Video_Master.mp4'

# Job 5 script
SCRIPT = """Central Bank of Nigeria compliance is mandatory for all financial institutions operating in Nigeria. Our automated compliance bot monitors your transactions 24/7, instantly flags violations before they reach CBN's radar, and generates audit-ready reports in real time. From KYC verification to anti-money laundering checks, we handle every regulatory requirement automatically. No more manual reviews, no more compliance officers working overtime, no more penalties. Your institution stays compliant while your team focuses on growth. Powered by AMD Solutions 007."""

def upload_image(image_path: Path) -> str:
    """Upload image to D-ID and return the URL."""
    url = 'https://api.d-id.com/images'
    
    headers = {
        'Authorization': f'Basic {DID_API_KEY}',
        'accept': 'application/json',
    }
    
    # Upload as multipart form
    with open(image_path, 'rb') as f:
        files = {'image': (image_path.name, f, 'image/png')}
        
        print(f"📤 Uploading twin image to D-ID...")
        response = requests.post(url, headers=headers, files=files)
    
    if response.status_code in [200, 201]:
        data = response.json()
        image_url = data.get('url')
        print(f"✅ Image uploaded: {image_url}")
        return image_url
    else:
        print(f"❌ Failed to upload image.")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        raise Exception(f"Image upload failed: {response.text}")

def create_video_generation(script: str, image_url: str) -> str:
    """Create a talking video and return talk ID."""
    url = 'https://api.d-id.com/talks'
    
    headers = {
        'Authorization': f'Basic {DID_API_KEY}',
        'Content-Type': 'application/json',
        'accept': 'application/json',
    }
    
    payload = {
        'source_url': image_url,
        'script': {
            'type': 'text',
            'input': script,
            'provider': {
                'type': 'microsoft',
                'voice_id': 'en-US-GuyNeural',  # Professional male voice
            },
        },
        'config': {
            'fluent': True,
            'pad_audio': 0,
            'stitch': True,
        },
    }
    
    print(f"📤 Submitting video generation request...")
    print(f"   Voice: Microsoft en-US-GuyNeural")
    print(f"   Script length: {len(script)} characters")
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code in [200, 201]:
        data = response.json()
        talk_id = data.get('id')
        print(f"✅ Video generation started! Talk ID: {talk_id}")
        return talk_id
    else:
        print(f"❌ Failed to create video generation.")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        raise Exception(f"Video generation failed: {response.text}")

def check_talk_status(talk_id: str) -> dict:
    """Check the status of a talk/video generation."""
    url = f'https://api.d-id.com/talks/{talk_id}'
    
    headers = {
        'Authorization': f'Basic {DID_API_KEY}',
        'accept': 'application/json',
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"⚠️  Failed to check talk status.")
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
    
    # Upload image
    image_url = upload_image(TWIN_IMAGE)
    print()
    
    # Create video generation
    talk_id = create_video_generation(SCRIPT, image_url)
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
        
        status_data = check_talk_status(talk_id)
        
        if not status_data:
            print(f"⚠️  Attempt {attempt}/{max_attempts}: Failed to get status, retrying...")
            continue
        
        status = status_data.get('status')
        
        print(f"🔄 Attempt {attempt}/{max_attempts}: Status = {status}")
        
        if status == 'done':
            video_url = status_data.get('result_url')
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
                raise Exception("Video generation completed but no result URL found")
        
        elif status == 'error':
            error = status_data.get('error')
            raise Exception(f"Video generation failed: {error}")
        
        elif status in ['created', 'started']:
            # Still processing
            continue
        else:
            print(f"⚠️  Unknown status: {status}")
    
    raise TimeoutError("Video generation timed out after 10 minutes")

if __name__ == '__main__':
    main()
