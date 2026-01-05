#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════
NAIJABIZ PILOT - FLYER GENERATION (OPENAI DALL-E 3)
═══════════════════════════════════════════════════════════════════════════
Division of Labor: OpenAI (Paid) for Image Generation
═══════════════════════════════════════════════════════════════════════════
"""

import os
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Flyer prompt
PROMPT = """A sleek, dark-mode futuristic flyer for 'NaijaBiz Pilot'. 

Scene: A glowing smartphone floating in a luxurious dark room with a bright notification on screen showing 'Sales: +₦150k' in gold text. 

Color scheme: Gold and Black theme with subtle green accents (Nigerian colors). 

Style: High-end tech aesthetic, premium quality, professional business look. 

Text overlay at top: 'NAIJABIZ PILOT' in bold gold letters.
Text overlay at bottom: 'SLEEP. WE SELL FOR YOU.' in white elegant font.

Additional visual elements: AI circuit patterns in background, WhatsApp icon subtly integrated, money symbols floating around the phone."""

print("═" * 75)
print("🎨 GENERATING NAIJABIZ PILOT FLYER")
print("═" * 75)
print()
print("🤖 Using: OpenAI DALL-E 3 (Paid API)")
print("📝 Prompt:")
print("-" * 75)
print(PROMPT)
print("-" * 75)
print()
print("⏳ Generating... (15-30 seconds)")
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
    
    print(f"✅ Image generated!")
    print(f"🔗 URL: {image_url}")
    print()
    print("💾 Downloading image...")
    
    # Download image
    img_data = requests.get(image_url).content
    output_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/NaijaBiz_Flyer.png'
    
    with open(output_path, 'wb') as handler:
        handler.write(img_data)
    
    print(f"✅ FLYER SAVED!")
    print(f"📁 Location: {output_path}")
    print()
    print("═" * 75)
    print("🎯 NEXT: Post to platforms using Google API (Free)")
    print("═" * 75)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    if "billing" in str(e).lower():
        print("💳 OpenAI billing issue - check payment method")
    elif "quota" in str(e).lower():
        print("⏳ API quota exceeded - wait or upgrade plan")
    print("═" * 75)
