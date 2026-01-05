#!/usr/bin/env python3
"""Generate Job 5 'talking twin' video master using HeyGen API.

This script:
- Loads Job5_Twin_Master.png
- Reads the Job 5 audio script
- Calls HeyGen talking photo API to create a video where the twin speaks
- Saves the result as Job5_Video_Master.mp4

Requirements:
- HEYGEN_API_KEY must be in social_engine/.env
- Job5_Twin_Master.png must exist in assets/Job5_CBN_Compliance/
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv


def main() -> None:
    social_engine_dir = Path(__file__).resolve().parent
    load_dotenv(dotenv_path=social_engine_dir / ".env")

    api_key = os.getenv("HEYGEN_API_KEY")
    if not api_key:
        print("❌ HEYGEN_API_KEY not found in .env")
        sys.exit(1)

    # Job 5 paths
    job5_dir = social_engine_dir / "assets" / "Job5_CBN_Compliance"
    twin_image = job5_dir / "Job5_Twin_Master.png"
    output_video = job5_dir / "Job5_Video_Master.mp4"

    if not twin_image.exists():
        print(f"❌ Twin image not found: {twin_image}")
        sys.exit(1)

    # Job 5 script (from the Bible)
    script = (
        "One mistake. That is all it takes for the CBN to freeze your license. "
        "Stop managing compliance on spreadsheets. "
        "The CBN Compliance Copilot audits your bank 24/7. "
        "No fines. No panic. Just green lights. "
        "DM COMPLY to secure your license. "
        "Powered by AMD Solutions 007."
    )

    print("=" * 70)
    print("JOB 5: CBN COMPLIANCE - HEYGEN VIDEO GENERATION")
    print("=" * 70)
    print(f"📸 Twin Image: {twin_image.name}")
    print(f"🎬 Output: {output_video.name}")
    print(f"📝 Script: {len(script)} chars")
    print()

    # Step 1: Upload image to HeyGen (v1 API)
    print("📤 Step 1: Uploading twin image to HeyGen...")
    upload_url = "https://upload.heygen.com/v1/talking_photo"
    
    with twin_image.open("rb") as f:
        files = {"file": (twin_image.name, f, "image/png")}
        headers = {"X-Api-Key": api_key}
        
        resp = requests.post(upload_url, headers=headers, files=files, timeout=60)
        
    if resp.status_code != 200 and resp.status_code != 201:
        print(f"❌ Upload failed: {resp.status_code}")
        print(resp.text)
        sys.exit(2)

    upload_data = resp.json()
    
    # HeyGen v1 returns talking_photo_id
    talking_photo_id = upload_data.get("data", {}).get("talking_photo_id")
    
    if not talking_photo_id:
        print("❌ No talking_photo_id returned from upload")
        print(upload_data)
        sys.exit(2)

    print(f"✅ Uploaded talking photo: {talking_photo_id}")
    print()

    # Step 2: Generate talking photo video (v1 API)
    print("🎬 Step 2: Requesting video generation...")
    generate_url = "https://api.heygen.com/v1/video.generate"
    
    payload = {
        "video_inputs": [
            {
                "character": {
                    "type": "talking_photo",
                    "talking_photo_id": talking_photo_id,
                },
                "voice": {
                    "type": "text",
                    "input_text": script,
                    "voice_id": "1bd001e7e50f421d891986aad5158bc8",  # Professional male voice
                },
            }
        ],
        "dimension": {
            "width": 1080,
            "height": 1920,  # Vertical 9:16 for social
        },
        "aspect_ratio": "9:16",
    }

    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json",
    }

    resp = requests.post(generate_url, headers=headers, json=payload, timeout=60)

    if resp.status_code != 200 and resp.status_code != 201:
        print(f"❌ Generation request failed: {resp.status_code}")
        print(resp.text)
        sys.exit(3)

    gen_data = resp.json()
    
    video_id = gen_data.get("data", {}).get("video_id")
    if not video_id:
        print("❌ No video_id returned")
        print(gen_data)
        sys.exit(3)

    print(f"✅ Video generation started: {video_id}")
    print()

    # Step 3: Poll for completion
    print("⏳ Step 3: Waiting for video to render...")
    status_url = f"https://api.heygen.com/v1/video_status.get?video_id={video_id}"
    
    for attempt in range(60):  # Max 5 minutes
        time.sleep(5)
        
        resp = requests.get(status_url, headers={"X-Api-Key": api_key}, timeout=30)
        if resp.status_code != 200:
            print(f"⚠️  Status check failed: {resp.status_code}")
            continue

        status_data = resp.json()
        status = status_data.get("data", {}).get("status")
        
        if status == "completed":
            video_url = status_data.get("data", {}).get("video_url")
            print(f"✅ Video ready: {video_url}")
            
            # Download video
            print("📥 Downloading...")
            vid_resp = requests.get(video_url, timeout=120)
            output_video.write_bytes(vid_resp.content)
            
            size_mb = output_video.stat().st_size / (1024 * 1024)
            print()
            print("=" * 70)
            print("✅ JOB 5 VIDEO MASTER COMPLETE!")
            print("=" * 70)
            print(f"📹 File: {output_video}")
            print(f"📊 Size: {size_mb:.2f} MB")
            print("=" * 70)
            return
        
        elif status == "failed":
            print("❌ Video generation failed")
            print(status_data)
            sys.exit(4)
        
        else:
            print(f"   [{attempt+1}/60] Status: {status}...")

    print("❌ Timeout waiting for video")
    sys.exit(5)


if __name__ == "__main__":
    main()
