#!/usr/bin/env python3
"""
Create Professional New Year 2026 Image with PIL
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Create high-res image
width, height = 1920, 1080
img = Image.new('RGB', (width, height), color='#0a0e27')  # Dark blue background

# Create gradient background
draw = ImageDraw.Draw(img)

# Draw gradient
for y in range(height):
    # Gradient from dark blue to lighter blue
    r = int(10 + (50 - 10) * y / height)
    g = int(14 + (100 - 14) * y / height)
    b = int(39 + (150 - 39) * y / height)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Add Nigerian flag colors accent
green = '#008751'
white = '#FFFFFF'

# Top and bottom bars
draw.rectangle([(0, 0), (width, 20)], fill=green)
draw.rectangle([(0, height-20), (width, height)], fill=green)

# Try to load fonts, fallback to default
try:
    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 120)
    subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
    text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 45)
    small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 35)
except:
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    text_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# Add text with shadow effect
def draw_text_with_shadow(draw, text, position, font, fill='white', shadow='black'):
    x, y = position
    # Shadow
    draw.text((x+3, y+3), text, font=font, fill=shadow)
    # Main text
    draw.text((x, y), text, font=font, fill=fill)

# Main title
draw_text_with_shadow(draw, "🎉 HAPPY NEW YEAR 2026! 🎉", 
                      (width//2 - 550, 100), title_font, fill='#FFD700')

# Subtitle
draw_text_with_shadow(draw, "NIGERIA'S AI REVOLUTION", 
                      (width//2 - 400, 250), subtitle_font, fill=white)

# Content - Nigerian flag colors
y_pos = 380
messages = [
    "TO EVERY NIGERIAN BUILDER:",
    "",
    "This is YOUR year. This is OUR year.",
    "This is NIGERIA'S year. 🇳🇬",
    "",
    "I spent 3 years proving AI works.",
    "Now I'm showing YOU how to use it.",
    "",
    "RiseTogether NG is LIVE:",
    "💎 999 creatives backing 1 spotlight daily",
    "🤖 AI tools for Nigerian businesses",
    "🇳🇬 Building the digital future together",
]

for msg in messages:
    if msg:
        draw_text_with_shadow(draw, msg, (width//2 - 450, y_pos), text_font, 
                            fill='#00FF88' if '🇳🇬' in msg or '💎' in msg or '🤖' in msg else white)
    y_pos += 55

# Bottom branding
draw_text_with_shadow(draw, "Reply 'RISE' to +234 818 002 1007", 
                      (width//2 - 350, height - 120), text_font, fill='#FFD700')

draw_text_with_shadow(draw, "AMD Solutions - Premium AI Lab", 
                      (width//2 - 300, height - 65), small_font, fill=white)

# Save image
output_path = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026.png'
img.save(output_path, 'PNG', quality=95)

print(f"✅ New Year image created: {output_path}")
print(f"📐 Size: 1920x1080 (Full HD)")
print(f"🎨 Style: Professional Nigerian tech celebration")
print(f"\n🚀 Ready to post to all platforms!")
