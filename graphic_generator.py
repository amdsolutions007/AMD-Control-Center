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

    def _load_font(self, size: int, bold: bool = False):
        """Load cross-platform fonts with graceful fallback."""
        font_candidates = []

        if bold:
            font_candidates.extend([
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
            ])
        else:
            font_candidates.extend([
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
            ])

        for font_path in font_candidates:
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue

        return ImageFont.load_default()

    def _centered_text(self, draw: ImageDraw.ImageDraw, text: str, y: int, font, fill: str, width: int, stroke_width: int = 0, stroke_fill: str = "#000000"):
        """Draw centered text with optional stroke for readability."""
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        draw.text((x, y), text, fill=fill, font=font, stroke_width=stroke_width, stroke_fill=stroke_fill)
        
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
            brightness = int(18 + (i / height) * 34)
            color = (brightness, brightness, brightness + 4)
            draw.line([(0, i), (width, i)], fill=color)
            
        # AMD branding color (yellow)
        brand_color = '#FFD700'
        
        # Draw brand accents
        draw.rectangle([(0, 0), (width, 12)], fill=brand_color)
        draw.rectangle([(0, height - 12), (width, height)], fill=brand_color)
        draw.rounded_rectangle([(35, 35), (355, 125)], radius=18, outline=brand_color, width=3)
        draw.rounded_rectangle([(35, height - 120), (width - 35, height - 35)], radius=16, outline="#333333", width=2)

        # Cross-platform fonts
        title_font = self._load_font(96, bold=True)
        subtitle_font = self._load_font(46, bold=True)
        day_font = self._load_font(44, bold=True)
        footer_font = self._load_font(28, bold=False)
            
        # Normalize state text for clean rendering
        state_text = " ".join(part for part in state_name.upper().split())

        # Day number (top left)
        day_text = f"DAY {day_number}/36"
        draw.text((55, 54), day_text, fill=brand_color, font=day_font)

        # State name + subtitle
        self._centered_text(draw, state_text, 228, title_font, "#FFFFFF", width, stroke_width=2, stroke_fill="#000000")

        subtitle = "TECH ECOSYSTEM"
        self._centered_text(draw, subtitle, 352, subtitle_font, brand_color, width)

        # Footer branding
        footer = "AMD SOLUTIONS 007 | 36 STATES OF TECH"
        self._centered_text(draw, footer, height - 85, footer_font, "#FFFFFF", width)

        # Subtle decorative grid lines
        for x in range(120, width, 180):
            draw.line([(x, 140), (x, height - 150)], fill="#2A2A2A", width=1)
        for y in range(170, height - 130, 85):
            draw.line([(70, y), (width - 70, y)], fill="#242424", width=1)
        
        # Save
        filename = f"state_{day_number:02d}_{state_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.png"
        filepath = os.path.join(GRAPHICS_DIR, filename)
        img.save(filepath, format="PNG", optimize=True)
        
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
