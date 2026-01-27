#!/usr/bin/env python3
"""Test AI-powered email generation"""

import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Load USER_CONTEXT from main file
with open('amd_digital_twin.py', 'r') as f:
    content = f.read()
    # Extract USER_CONTEXT
    start = content.find('USER_CONTEXT = """') + 18
    end = content.find('"""', start)
    USER_CONTEXT = content[start:end]

print("✅ USER_CONTEXT loaded:", len(USER_CONTEXT), "characters")
print("🎯 Contains manifesto:", "MANIFESTO" in USER_CONTEXT)
print("🛠️ Contains arsenal:", "SkyCap AI" in USER_CONTEXT)
print()

# Initialize OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("🤖 Generating AI-powered email...\n")
print("=" * 70)

# Test with Nigerian SME context
prompt = f"""You are Olawale Shoyemi, CEO of AMD Solutions 007.

FULL COMPANY DNA:
{USER_CONTEXT}

RECIPIENT: John Doe, CTO at Lagos Startup Hub (Nigerian SME)
TASK: Write a 150-word B2B email pitch.

REQUIREMENTS:
1. Use "Digital Dark" metaphor
2. Mention "military-grade intelligence"
3. Reference "24 active projects, 50K+ code"
4. Mention NaijaBiz Assist (for Nigerian SMEs)
5. Tone: Elite, strategic partner
6. Call-to-action: 15-min strategy session

Write the email:"""

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a CEO with proprietary AI tech, writing elite B2B emails."},
        {"role": "user", "content": prompt}
    ],
    temperature=0.7,
    max_tokens=400
)

email = response.choices[0].message.content

print(email)
print("=" * 70)
print()
print("✅ AI Generation successful!")
print("📊 Length:", len(email), "characters")
print("🎯 Has 'Digital Dark':", "Digital Dark" in email)
print("💡 Has 'military-grade':", "military-grade" in email.lower())
print("🚀 Has 'NaijaBiz':", "NaijaBiz" in email)
