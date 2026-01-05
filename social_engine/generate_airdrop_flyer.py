#!/usr/bin/env python3
"""
Crypto Airdrop Auto-Claimer - Flyer Generation (DALL-E 3)
Creates a 1024x1024 PNG flyer in assets/Job2_CryptoAirdrop_AutoClaimer/Job2_Airdrop_Flyer.png
"""
import os
from pathlib import Path
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

OUTPUT = Path("/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job2_CryptoAirdrop_AutoClaimer/Job2_Airdrop_Flyer.png")
PROMPT = (
    "Futuristic, secure dashboard flyer for 'Crypto Airdrop Auto-Claimer'. "
    "Deep navy background with cyan accents and clean white typography. "
    "Visual motifs: shield with checkmark (safety), notification bell (alerts), "
    "sleek dashboard panels showing approved airdrops and logs. "
    "Avoid coins/riches clichés; focus on automation, safety filters, and logging. "
    "Headline text: 'Crypto Airdrop Auto-Claimer'. "
    "Tagline: 'Never miss free money.' "
    "Bullet overlay: 'Auto-track approved drops', 'Dry-run first, allowlist-only claims', 'Full logs, you keep custody'."
)

print("═" * 75)
print("🎨 Generating Job 2 Flyer (DALL-E 3)")
print("═" * 75)
print(PROMPT)
print()

try:
    response = client.images.generate(
        model="dall-e-3",
        prompt=PROMPT,
        size="1024x1024",
        quality="hd",
        n=1,
    )
    image_url = response.data[0].url
    print(f"✅ Image URL: {image_url}")

    img_data = requests.get(image_url, timeout=30).content
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "wb") as f:
        f.write(img_data)
    print(f"✅ Saved: {OUTPUT}")
except Exception as e:
    print(f"❌ Error: {e}")
    if "billing" in str(e).lower():
        print("💳 Check OpenAI billing")
    elif "quota" in str(e).lower():
        print("⏳ Quota exceeded")
print("═" * 75)
