"""
Creative Engine - AI-Generated Visuals + Viral Captions
Integrates DALL-E 3 for images and GPT-4 for engaging copy
"""

import logging
import os
import requests
from pathlib import Path
from typing import Optional, Dict
from openai import OpenAI
from dotenv import load_dotenv

logger = logging.getLogger(__name__)


class CreativeEngine:
    """Generate AI visuals and viral captions for social posts"""
    
    def __init__(self):
        self.client = None
        self.output_dir = Path(__file__).parent / 'generated_assets'
        self.output_dir.mkdir(exist_ok=True)
        self._authenticate()
    
    def _authenticate(self):
        """Initialize OpenAI client"""
        # Load environment variables from WhatsApp Empire .env file
        whatsapp_env = Path(__file__).parent.parent / 'whatsapp_empire' / '.env'
        load_dotenv(whatsapp_env)
        
        api_key = os.getenv('OPENAI_API_KEY')
        
        if not api_key:
            logger.error("❌ OPENAI_API_KEY not found in environment")
            return
        
        self.client = OpenAI(api_key=api_key)
        logger.info("✅ Creative Engine initialized")
    
    def generate_image(self, prompt: str, style: str = "vivid") -> Optional[str]:
        """
        Generate image using DALL-E 3
        
        Args:
            prompt: Text description of the image
            style: 'vivid' (hyper-real) or 'natural' (more subdued)
        
        Returns:
            Path to saved image file, or None if failed
        """
        if not self.client:
            logger.error("❌ OpenAI client not initialized")
            return None
        
        try:
            logger.info(f"🎨 Generating image: {prompt[:50]}...")
            
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                style=style,
                n=1
            )
            
            image_url = response.data[0].url
            
            # Download image
            image_data = requests.get(image_url).content
            
            # Save with timestamp
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"dalle_{timestamp}.png"
            filepath = self.output_dir / filename
            
            with open(filepath, 'wb') as f:
                f.write(image_data)
            
            logger.info(f"✅ Image saved: {filepath}")
            return str(filepath)
        
        except Exception as e:
            logger.error(f"❌ DALL-E image generation failed: {e}")
            return None
    
    def generate_viral_caption(self, topic: str, platform: str = "twitter") -> Optional[str]:
        """
        Generate viral caption using GPT-4
        
        Args:
            topic: Main topic/message for the post
            platform: Target platform (twitter, telegram, snapchat)
        
        Returns:
            Viral caption with emojis and hashtags
        """
        if not self.client:
            logger.error("❌ OpenAI client not initialized")
            return None
        
        try:
            # Platform-specific constraints
            char_limits = {
                'twitter': 280,
                'telegram': 1024,
                'snapchat': 250
            }
            
            max_chars = char_limits.get(platform, 280)
            
            system_prompt = f"""You are a viral social media copywriter for AMD Solutions 007, a Nigerian tech company.

Your style:
- Energetic and inspiring
- Uses emojis strategically (not excessive)
- Includes strong Call-to-Action (CTA)
- Leverages Nigerian pride and tech optimism
- Always includes relevant hashtags

Brand voice: Professional yet exciting, future-focused, nation-building tone.

Platform: {platform}
Character limit: {max_chars}

Generate a viral caption that will make Nigerians stop scrolling and engage."""

            user_prompt = f"""Topic: {topic}

Requirements:
1. Start with an attention-grabbing hook (emoji or bold statement)
2. Build excitement about Nigerian tech/innovation
3. End with clear CTA (engage, share, reply, click link)
4. Include 3-5 relevant hashtags (#RiseUpNG #NaijaTech #DigitalNation etc)
5. Use Nigerian English expressions where natural
6. Must fit in {max_chars} characters

Write the caption now:"""

            logger.info(f"✍️ Generating caption for: {topic}")
            
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.9,
                max_tokens=300
            )
            
            caption = response.choices[0].message.content.strip()
            
            # Ensure it fits character limit
            if len(caption) > max_chars:
                caption = caption[:max_chars - 3] + '...'
            
            logger.info(f"✅ Caption generated ({len(caption)} chars)")
            return caption
        
        except Exception as e:
            logger.error(f"❌ GPT-4 caption generation failed: {e}")
            return None
    
    def create_post_package(
        self,
        topic: str,
        platform: str = "twitter",
        image_prompt: Optional[str] = None,
        use_brand_colors: bool = True
    ) -> Optional[Dict]:
        """
        Generate complete post package (image + caption)
        
        Args:
            topic: Main message/topic
            platform: Target platform
            image_prompt: Custom image prompt (optional)
            use_brand_colors: Add Nigeria colors to prompt
        
        Returns:
            Dict with 'caption' and 'image_path' keys
        """
        # Default image prompt with brand identity
        if not image_prompt:
            color_instruction = ""
            if use_brand_colors:
                color_instruction = "Use Nigeria's colors (green, white, gold) prominently. "
            
            image_prompt = f"""{color_instruction}Create a powerful, futuristic, professional image representing: {topic}. 
Style: Modern, sleek, tech-forward, inspiring. 
Include elements: Nigerian flag motifs, technology symbols (circuits, digital networks), 
rising sun/upward arrows symbolizing growth, diverse Nigerian faces looking hopeful.
Mood: Triumphant, united, progressive."""
        
        # Generate image
        image_path = self.generate_image(image_prompt, style="vivid")
        
        # Generate caption
        caption = self.generate_viral_caption(topic, platform)
        
        if not image_path or not caption:
            logger.error("❌ Failed to create complete post package")
            return None
        
        package = {
            'caption': caption,
            'image_path': image_path,
            'platform': platform,
            'topic': topic
        }
        
        logger.info("✅ Post package created successfully")
        return package


if __name__ == '__main__':
    # Test the creative engine
    logging.basicConfig(level=logging.INFO)
    
    engine = CreativeEngine()
    
    # Test image generation
    test_prompt = "Nigeria rising through technology and community unity, futuristic, green white gold colors"
    image = engine.generate_image(test_prompt)
    print(f"Image saved: {image}")
    
    # Test caption generation
    caption = engine.generate_viral_caption("Job #21 Completed: Rise Up NG. The Nation is Building.")
    print(f"\nGenerated caption:\n{caption}")
