#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - SALES FLYER GENERATION
═══════════════════════════════════════════════════════════════════════════
Protocol: OpenAI DALL-E 3 (Paid API) for High-Res Image
═══════════════════════════════════════════════════════════════════════════
"""

import os
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Sales flyer prompt
PROMPT = """A sleek, dark-mode 3D digital advertisement for a WhatsApp Bot service named 'NaijaBiz Pilot'. 

Visuals: A floating smartphone in a dark void, screen glowing with bright green 'Payment Received ₦150,000' notifications popping up. 

Background: Subtle gold digital circuits and AI patterns in a cinematic dark space. 

Text overlay in bold gold font at the top: 'NAIJABIZ PILOT'
Text overlay at the bottom in white elegant font: 'SLEEP. WE SELL FOR YOU.'

Style: Cinematic lighting, professional 3D render, high-end tech aesthetic, 4k resolution quality, Nigerian business theme with green and gold colors."""

print("═" * 75)
print("🚀 LAUNCHING NAIJABIZ PILOT SALES CAMPAIGN")
print("═" * 75)
print()
print("🎨 GENERATING SALES FLYER")
print("🤖 Using: OpenAI DALL-E 3 (Paid API)")
print()
print("📝 Prompt:")
print("-" * 75)
print(PROMPT)
print("-" * 75)
print()
print("⏳ Generating high-resolution flyer... (15-30 seconds)")
print()

try:
    # Generate image with DALL-E 3
    response = client.images.generate(
        model="dall-e-3",
        prompt=PROMPT,
        size="1024x1024",
        quality="hd",
        n=1,
    )
    
    image_url = response.data[0].url
    
    print(f"✅ Sales flyer generated!")
    print(f"🔗 URL: {image_url}")
    print()
    print("💾 Downloading image...")
    
    # Download image
    img_data = requests.get(image_url).content
    output_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/NaijaBiz_Flyer.png'
    
    with open(output_path, 'wb') as handler:
        handler.write(img_data)
    
    # Get file size
    file_size = os.path.getsize(output_path) / (1024 * 1024)
    
    print(f"✅ SALES FLYER SAVED!")
    print(f"📁 Location: {output_path}")
    print(f"💾 Size: {file_size:.2f} MB")
    print()
    print("═" * 75)
    print("🎯 NEXT: Deploying to LinkedIn (Automated)")
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    if "billing" in str(e).lower():
        print("💳 OpenAI billing issue - check payment method")
    elif "quota" in str(e).lower():
        print("⏳ API quota exceeded - wait or upgrade plan")
    print("═" * 75)
