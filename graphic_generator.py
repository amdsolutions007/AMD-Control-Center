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
        
        # Draw strong high-contrast gradient background
        for i in range(height):
            top = int(10 + (i / height) * 22)
            color = (top, top + 2, top + 6)
            draw.line([(0, i), (width, i)], fill=color)
            
        # AMD branding color (yellow)
        brand_color = '#FFD700'
        
        # Draw brand accents and cards
        draw.rectangle([(0, 0), (width, 14)], fill=brand_color)
        draw.rectangle([(0, height - 14), (width, height)], fill=brand_color)

        # Day badge
        draw.rounded_rectangle([(40, 34), (340, 122)], radius=18, fill="#121212", outline=brand_color, width=4)

        # Main content panel for readability
        draw.rounded_rectangle([(70, 155), (width - 70, 485)], radius=24, fill="#101010", outline="#2D2D2D", width=2)

        # Footer card
        draw.rounded_rectangle([(70, 520), (width - 70, 620)], radius=18, fill="#111111", outline="#2D2D2D", width=2)

        # Cross-platform fonts
        title_font = self._load_font(128, bold=True)
        subtitle_font = self._load_font(54, bold=True)
        day_font = self._load_font(48, bold=True)
        footer_font = self._load_font(34, bold=True)
            
        # Normalize state text for clean rendering
        state_text = " ".join(part for part in state_name.upper().split())

        # Day number (top left)
        day_text = f"DAY {day_number}/36"
        draw.text((62, 54), day_text, fill=brand_color, font=day_font)

        # State name + subtitle
        self._centered_text(draw, state_text, 220, title_font, "#FFFFFF", width, stroke_width=3, stroke_fill="#000000")

        subtitle = "TECH ECOSYSTEM"
        self._centered_text(draw, subtitle, 368, subtitle_font, brand_color, width)

        # Footer branding
        footer = "AMD SOLUTIONS 007 | 36 STATES OF TECH"
        self._centered_text(draw, footer, 552, footer_font, "#FFFFFF", width)

        # Minimal decorative corner marks
        draw.line([(75, 170), (145, 170)], fill=brand_color, width=3)
        draw.line([(75, 170), (75, 240)], fill=brand_color, width=3)
        draw.line([(width - 75, 170), (width - 145, 170)], fill=brand_color, width=3)
        draw.line([(width - 75, 170), (width - 75, 240)], fill=brand_color, width=3)
        
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
