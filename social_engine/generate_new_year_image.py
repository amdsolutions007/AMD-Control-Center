#!/usr/bin/env python3
"""
Generate Professional New Year 2026 Image with DALL-E 3
"""
import os
from openai import OpenAI
from dotenv import load_dotenv
import requests
from datetime import datetime
import sys

# Load from parent directory
sys.path.insert(0, '/Users/mac/Desktop/AMD_Control_Center')
load_dotenv('/Users/mac/Desktop/AMD_Control_Center/.env')

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("❌ OPENAI_API_KEY not found in .env file")
    sys.exit(1)

client = OpenAI(api_key=api_key)

# Professional New Year 2026 Prompt
prompt = """
Create a vibrant, professional New Year 2026 celebration image for a Nigerian tech company.

Style: Modern, tech-forward, inspiring
Colors: Nigerian green-white-green flag colors, with gold accents and digital blue
Elements:
- Bold "HAPPY NEW YEAR 2026" text at top
- "NIGERIA'S AI REVOLUTION STARTS NOW" subtitle
- Futuristic Nigerian map made of connected dots/circuits
- AI/tech symbols (neural networks, code, automation icons)
- Celebration elements (fireworks, confetti) in green and white
- Professional gradient background (dark to light)
- "RiseTogether NG" branding at bottom
- WhatsApp, Twitter, Telegram, YouTube icons subtly integrated

Mood: Professional, inspiring, celebratory, tech-forward, Nigerian pride
Format: 16:9 landscape, high resolution, suitable for social media
"""

print("🎨 Generating New Year 2026 image with DALL-E 3...")

# Generate image
response = client.images.generate(
    model="dall-e-3",
    prompt=prompt,
    size="1792x1024",  # High resolution landscape
    quality="hd",
    n=1
)

image_url = response.data[0].url
print(f"✅ Image generated: {image_url}")

# Download image
print("📥 Downloading image...")
img_data = requests.get(image_url).content
image_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026.png'

with open(image_path, 'wb') as f:
    f.write(img_data)

print(f"✅ Image saved: {image_path}")
print(f"\n🎉 Ready to post to all platforms!")
print(f"📐 Size: 1792x1024 (16:9 HD)")
print(f"🎨 Style: Professional Nigerian tech celebration")
