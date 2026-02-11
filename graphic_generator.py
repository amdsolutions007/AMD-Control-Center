"""
Graphic Generator for 36 States of Tech Campaign
Uses Gemini AI to generate state spotlight graphics
"""

import os
import asyncio
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import google.generativeai as genai

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

# Output directory
GRAPHICS_DIR = "generated_graphics"
os.makedirs(GRAPHICS_DIR, exist_ok=True)


class GraphicGenerator:
    """Generates AI-powered graphics for state spotlights"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def generate_state_graphic(self, state_name: str, day_number: int) -> str:
        """
        Generate graphic for Nigerian state spotlight
        Returns path to generated image
        """
        
        print(f"🎨 Generating graphic for {state_name} (Day {day_number}/36)...")
        
        # For now, create a template-based graphic (fast)
        # Future: Use Gemini image generation API when available
        graphic_path = self._create_template_graphic(state_name, day_number)
        
        print(f"✅ Graphic saved: {graphic_path}")
        return graphic_path
        
    def _create_template_graphic(self, state_name: str, day_number: int) -> str:
        """
        Create template-based graphic (fallback until Gemini image gen available)
        """
        
        # Create 1200x675 image (optimal for social media)
        width, height = 1200, 675
        img = Image.new('RGB', (width, height), color='#000000')
        draw = ImageDraw.Draw(img)
        
        # Draw gradient background
        for i in range(height):
            brightness = int(20 + (i / height) * 30)
            color = (brightness, brightness, brightness)
            draw.line([(0, i), (width, i)], fill=color)
            
        # AMD branding color (yellow)
        brand_color = '#FFD700'
        
        # Draw decorative elements
        # Top stripe
        draw.rectangle([(0, 0), (width, 10)], fill=brand_color)
        
        # Bottom stripe
        draw.rectangle([(0, height-10), (width, height)], fill=brand_color)
        
        # Try to use system fonts, fallback to default
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
            subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
            day_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 50)
            footer_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
        except:
            # Fallback to default font
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            day_font = ImageFont.load_default()
            footer_font = ImageFont.load_default()
            
        # Day number (top left)
        day_text = f"DAY {day_number}/36"
        draw.text((50, 50), day_text, fill=brand_color, font=day_font)
        
        # State name (center)
        state_text = state_name.upper()
        # Get text bbox for centering
        bbox = draw.textbbox((0, 0), state_text, font=title_font)
        text_width = bbox[2] - bbox[0]
        text_x = (width - text_width) // 2
        draw.text((text_x, 250), state_text, fill='#FFFFFF', font=title_font)
        
        # Subtitle
        subtitle = "TECH ECOSYSTEM"
        bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
        sub_width = bbox[2] - bbox[0]
        sub_x = (width - sub_width) // 2
        draw.text((sub_x, 360), subtitle, fill=brand_color, font=subtitle_font)
        
        # Footer branding
        footer = "AMD SOLUTIONS 007 | 36 STATES OF TECH"
        bbox = draw.textbbox((0, 0), footer, font=footer_font)
        footer_width = bbox[2] - bbox[0]
        footer_x = (width - footer_width) // 2
        draw.text((footer_x, height - 60), footer, fill='#FFFFFF', font=footer_font)
        
        # Emoji decoration (if font supports it)
        draw.text((width - 150, 50), "🌍", font=day_font)
        draw.text((50, height - 100), "🚀", font=day_font)
        
        # Save
        filename = f"state_{day_number:02d}_{state_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.png"
        filepath = os.path.join(GRAPHICS_DIR, filename)
        img.save(filepath, quality=95)
        
        return filepath
        
    async def generate_with_gemini(self, state_name: str, day_number: int) -> str:
        """
        Generate graphic using Gemini AI (future implementation)
        Note: Gemini image generation API may not be available yet
        """
        
        prompt = f"""Create a professional tech-themed graphic for {state_name} State, Nigeria.

Style:
- Dark background with yellow/gold accents (AMD brand colors)
- Modern, minimalist design
- Tech-focused aesthetic

Text elements:
- "DAY {day_number}/36" (top corner)
- "{state_name.upper()}" (large, center)
- "TECH ECOSYSTEM" (subtitle)
- "AMD SOLUTIONS 007" (footer)

Visual elements:
- Nigerian map outline or tech icons
- Geometric shapes
- Digital/tech motifs

Size: 1200x675px (social media optimal)
"""
        
        # This is placeholder - Gemini image gen API integration pending
        # For now, use template generation
        return self._create_template_graphic(state_name, day_number)


async def demo():
    """Demo graphic generation"""
    generator = GraphicGenerator()
    
    print("=" * 80)
    print("GRAPHIC GENERATOR DEMO")
    print("=" * 80)
    print()
    
    # Generate sample graphic
    test_states = ["Lagos", "FCT Abuja", "Kano"]
    
    for i, state in enumerate(test_states, 1):
        path = await generator.generate_state_graphic(state, i)
        print(f"✅ Generated: {path}")
        print()
        
    print("=" * 80)
    print(f"📁 Graphics saved in: {GRAPHICS_DIR}/")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(demo())
