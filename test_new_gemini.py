import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

print('🔍 Testing NEW Gemini API key...')
print(f'   Key: {api_key[:20]}...{api_key[-4:]}')

# Test connection
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content('Say "AMD007" in exactly 3 words')
print(f'\n✅ GEMINI CONNECTED!')
print(f'   Response: {response.text}')

# List models
print('\n📋 Available Models:')
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f'   • {m.name}')
