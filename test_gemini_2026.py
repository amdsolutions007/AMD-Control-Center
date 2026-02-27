"""
Gemini Imagen 4 / Gemini Image Generation — 2026 SDK Green Square test.
Uses google-genai (NOT deprecated google-generativeai).
Run: python3 test_gemini_2026.py
"""
import io
import os
import sys
from google import genai
from google.genai import types
from PIL import Image

api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    sys.exit("ERROR: GEMINI_API_KEY not set in environment.")

print(f"Key suffix: ...{api_key[-6:]}")
client = genai.Client(api_key=api_key)

# ── Strategy 1: Imagen 4 via generate_images ─────────────────────────────────
IMAGEN_MODELS = ["imagen-4.0-generate-001", "imagen-4.0-fast-generate-001"]
PROMPT = "A solid vivid green square on a pure black background. No text, no symbols."

response = None
for model_id in IMAGEN_MODELS:
    try:
        print(f"Trying generate_images / {model_id}...")
        response = client.models.generate_images(
            model=model_id,
            prompt=PROMPT,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                safety_filter_level="BLOCK_LOW_AND_ABOVE",
                person_generation="DONT_ALLOW",
            ),
        )
        if response.generated_images:
            raw = response.generated_images[0].image.image_bytes
            img = Image.open(io.BytesIO(raw)).convert("RGB")
            out = "test_green_square_2026.png"
            img.save(out)
            print(f"SUCCESS via {model_id}: {out} — {img.size[0]}x{img.size[1]}px, {len(raw)} bytes")
            sys.exit(0)
    except Exception as exc:
        print(f"  {model_id}: {type(exc).__name__} — {str(exc)[:140]}")

# ── Strategy 2: Gemini image generation via generateContent ──────────────────
GEMINI_IMAGE_MODELS = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
    "gemini-2.0-flash-exp-image-generation",
]
for model_id in GEMINI_IMAGE_MODELS:
    try:
        print(f"Trying generateContent / {model_id}...")
        gc_response = client.models.generate_content(
            model=model_id,
            contents=f"Generate only an image (no text): {PROMPT}",
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        for part in gc_response.candidates[0].content.parts:
            inline = getattr(part, "inline_data", None)
            if inline and getattr(inline, "data", None):
                raw = inline.data
                img = Image.open(io.BytesIO(raw)).convert("RGB")
                out = "test_green_square_2026.png"
                img.save(out)
                print(f"SUCCESS via {model_id}: {out} — {img.size[0]}x{img.size[1]}px, {len(raw)} bytes")
                sys.exit(0)
        print(f"  {model_id}: no image parts in response")
    except Exception as exc:
        print(f"  {model_id}: {type(exc).__name__} — {str(exc)[:140]}")

print("\nALL engines failed. See errors above for action required.")
sys.exit(1)

raw_bytes = response.generated_images[0].image.image_bytes
img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
out = "test_green_square_2026.png"
img.save(out)
print(f"SUCCESS: {out} saved — {img.size[0]}x{img.size[1]}px, {len(raw_bytes)} bytes")
print("Gemini Imagen 3 engine is LIVE. Clear for production.")
