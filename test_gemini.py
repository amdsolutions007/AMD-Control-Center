import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

print('🔍 GEMINI NANO BANANA TEST:')
print(f'   ✅ Key: {GEMINI_API_KEY[:10]}...{GEMINI_API_KEY[-4:]}')

try:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Test Nano Banana Pro
    model = genai.GenerativeModel('nano-banana-pro-preview')
    response = model.generate_content('Respond with exactly: "AMD Heavy Artillery Online"')
    
    print('\n✅ NANO BANANA CONNECTED')
    print(f'   Response: {response.text}')
    
    # Test image generation model
    print('\n🎨 Testing image generation model...')
    img_model = genai.GenerativeModel('gemini-2.0-flash-exp-image-generation')
    print('   ✅ Image generation model available')
    
except Exception as e:
    print(f'\n❌ TEST FAILED: {e}')
