"""
Gemini Imagen 3 — Green Square test (5-line core).
Run: python3 test_gemini_imagen.py
"""
import os
from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not api_key:
    raise SystemExit("ERROR: GEMINI_API_KEY not set in environment.")

print(f"Key loaded: ...{api_key[-6:]}")
print("Calling Imagen 3...")

client = genai.Client(api_key=api_key)

response = client.models.generate_images(
    model="imagen-3.0-generate-001",
    prompt="A solid vivid green square on a black background. No text.",
    config=types.GenerateImagesConfig(
        number_of_images=1,
        safety_filter_level="BLOCK_ONLY_HIGH",
        person_generation="DONT_ALLOW",
    ),
)

if response.generated_images:
    img = response.generated_images[0].image
    out_path = "test_green_square.png"
    with open(out_path, "wb") as f:
        f.write(img.image_bytes)
    print(f"SUCCESS: Image saved to {out_path} ({len(img.image_bytes)} bytes)")
else:
    print("FAIL: No images returned from Imagen 3.")
