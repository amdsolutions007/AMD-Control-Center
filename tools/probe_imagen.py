#!/usr/bin/env python3
"""Probe Imagen 4 + Gemini image models to find the working pack."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

PROMPT = (
    "Professional technology infographic for Abuja FCT Nigeria. "
    "Ventures Platform Hub and Abuja Technology Village. Dark navy blue background #0F1722, "
    "bright orange accent #FF6B00. Modern African tech ecosystem. No text overlay."
)

# ── Test 1: Imagen 4 Fast ─────────────────────────────────────────────────────
print("Testing imagen-4.0-fast-generate-001...")
try:
    resp = client.models.generate_images(
        model="imagen-4.0-fast-generate-001",
        prompt=PROMPT,
        config=types.GenerateImagesConfig(number_of_images=1, aspect_ratio="1:1"),
    )
    raw = resp.generated_images[0].image.image_bytes
    print(f"✅ imagen-4.0-fast: {len(raw):,} bytes — WINNER")
    sys.exit(0)
except Exception as e:
    print(f"❌ imagen-4.0-fast: {e}")

# ── Test 2: Imagen 4 Standard ─────────────────────────────────────────────────
print("Testing imagen-4.0-generate-001...")
try:
    resp = client.models.generate_images(
        model="imagen-4.0-generate-001",
        prompt=PROMPT,
        config=types.GenerateImagesConfig(number_of_images=1),
    )
    raw = resp.generated_images[0].image.image_bytes
    print(f"✅ imagen-4.0-standard: {len(raw):,} bytes — WINNER")
    sys.exit(0)
except Exception as e:
    print(f"❌ imagen-4.0-standard: {e}")

# ── Test 3: gemini-2.0-flash-exp-image-generation ────────────────────────────
print("Testing gemini-2.0-flash-exp-image-generation...")
try:
    resp = client.models.generate_content(
        model="gemini-2.0-flash-exp-image-generation",
        contents=PROMPT,
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )
    for part in resp.candidates[0].content.parts:
        if hasattr(part, "inline_data") and part.inline_data:
            raw = part.inline_data.data
            if isinstance(raw, str):
                import base64; raw = base64.b64decode(raw)
            print(f"✅ gemini-2.0-flash-exp: {len(raw):,} bytes — WINNER")
            sys.exit(0)
    print("❌ gemini-2.0-flash-exp: no image in response")
except Exception as e:
    print(f"❌ gemini-2.0-flash-exp: {e}")

# ── Test 4: gemini-2.5-flash-image ───────────────────────────────────────────
print("Testing gemini-2.5-flash-image...")
try:
    resp = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=PROMPT,
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )
    for part in resp.candidates[0].content.parts:
        if hasattr(part, "inline_data") and part.inline_data:
            raw = part.inline_data.data
            if isinstance(raw, str):
                import base64; raw = base64.b64decode(raw)
            print(f"✅ gemini-2.5-flash-image: {len(raw):,} bytes — WINNER")
            sys.exit(0)
    print("❌ gemini-2.5-flash-image: no image in response")
except Exception as e:
    print(f"❌ gemini-2.5-flash-image: {e}")

print("\n❌ All packs failed.")
sys.exit(1)
