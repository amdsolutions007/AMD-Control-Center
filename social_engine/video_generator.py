"""
YouTube Video Generator - AI-Powered Video Creation
Uses OpenAI (GPT-4, DALL-E 3, TTS) + ffmpeg to create videos
"""

import logging
import os
import subprocess
from pathlib import Path
from typing import Optional, Dict, List
from openai import OpenAI
from dotenv import load_dotenv
import requests

logger = logging.getLogger(__name__)


class VideoGenerator:
    """Generate complete videos using AI"""
    
    def __init__(self):
        self.client = None
        self.output_dir = Path(__file__).parent / 'generated_videos'
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
        logger.info("✅ Video Generator initialized")
    
    def generate_script(self, topic: str, duration: int = 30) -> Optional[str]:
        """
        Generate video script using GPT-4
        
        Args:
            topic: Main topic for the video
            duration: Target duration in seconds (default 30s for YouTube Shorts)
        
        Returns:
            Video script optimized for voiceover
        """
        if not self.client:
            logger.error("❌ OpenAI client not initialized")
            return None
        
        try:
            system_prompt = f"""You are a professional video scriptwriter for Nigerian tech content.

Your style:
- Dynamic and energetic (YouTube Shorts style)
- Inspiring and motivational
- Clear pronunciation (for text-to-speech)
- Strong hook in first 3 seconds
- Patriotic Nigerian tone

Target duration: {duration} seconds
Speaking rate: ~150 words per minute
Word count target: {int((duration / 60) * 150)} words

Format: Natural speaking script (no stage directions, just the words to speak)"""

            user_prompt = f"""Topic: {topic}

Create a {duration}-second video script for YouTube.

Requirements:
1. Hook viewers in first 3 seconds
2. Build excitement about Nigerian tech/innovation
3. End with strong call-to-action
4. Use Nigerian expressions naturally
5. Optimized for AI voice (clear, dramatic pauses with periods)
6. No hashtags (this is voiceover, not text)

Write the script now:"""

            logger.info(f"📝 Generating script for: {topic}")
            
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.9,
                max_tokens=500
            )
            
            script = response.choices[0].message.content.strip()
            logger.info(f"✅ Script generated ({len(script.split())} words)")
            return script
        
        except Exception as e:
            logger.error(f"❌ Script generation failed: {e}")
            return None
    
    def generate_voiceover(self, script: str, output_name: str = "voiceover") -> Optional[str]:
        """
        Generate voiceover using OpenAI TTS
        
        Args:
            script: Text to convert to speech
            output_name: Output filename (without extension)
        
        Returns:
            Path to generated audio file
        """
        if not self.client:
            logger.error("❌ OpenAI client not initialized")
            return None
        
        try:
            logger.info("🎙️ Generating voiceover...")
            
            audio_path = self.output_dir / f"{output_name}.mp3"
            with self.client.audio.speech.with_streaming_response.create(
                model="tts-1-hd",
                voice="nova",  # Female voice, energetic
                input=script,
                speed=1.1,  # Slightly faster for dynamic feel
            ) as response:
                with open(audio_path, "wb") as f:
                    for chunk in response.iter_bytes():
                        f.write(chunk)
            
            logger.info(f"✅ Voiceover saved: {audio_path}")
            return str(audio_path)
        
        except Exception as e:
            logger.error(f"❌ Voiceover generation failed: {e}")
            return None
    
    def generate_background_image(self, topic: str, style: str = "cinematic") -> Optional[str]:
        """
        Generate background image using DALL-E 3
        
        Args:
            topic: Topic for the image
            style: Visual style
        
        Returns:
            Path to generated image
        """
        if not self.client:
            logger.error("❌ OpenAI client not initialized")
            return None
        
        try:
            prompt = f"""Cinematic YouTube thumbnail/video background:
{topic}

Style: Modern Nigerian tech aesthetic
- Vibrant green, white, and gold accents (Nigerian flag colors)
- Futuristic technology elements
- Professional corporate look
- High energy, inspiring
- Clean composition
- 16:9 aspect ratio friendly
- Dramatic lighting"""

            logger.info(f"🎨 Generating background image...")
            
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="hd",
                n=1
            )
            
            image_url = response.data[0].url
            
            # Download image
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_path = self.output_dir / f"bg_{timestamp}.png"
            
            img_data = requests.get(image_url).content
            with open(image_path, 'wb') as f:
                f.write(img_data)
            
            logger.info(f"✅ Background image saved: {image_path}")
            return str(image_path)
        
        except Exception as e:
            logger.error(f"❌ Image generation failed: {e}")
            return None
    
    def create_video(self, audio_path: str, image_path: str, text_overlay: str, output_name: str = "output") -> Optional[str]:
        """
        Combine audio + image into video using ffmpeg
        
        Args:
            audio_path: Path to audio file
            image_path: Path to background image
            text_overlay: Text to overlay on video
            output_name: Output filename
        
        Returns:
            Path to generated video file
        """
        try:
            logger.info("🎬 Creating video with ffmpeg...")
            
            video_path = self.output_dir / f"{output_name}.mp4"
            
            # Get audio duration
            duration_cmd = [
                'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', audio_path
            ]
            duration = float(subprocess.check_output(duration_cmd).decode().strip())
            
            # Create video with image + audio + text overlay
            ffmpeg_cmd = [
                'ffmpeg', '-y',
                '-loop', '1', '-i', image_path,  # Loop image
                '-i', audio_path,  # Audio
                '-vf', f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,drawtext=text='{text_overlay}':fontsize=80:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:borderw=3:bordercolor=black",
                '-c:v', 'libx264',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-pix_fmt', 'yuv420p',
                '-shortest',
                '-t', str(duration),
                str(video_path)
            ]
            
            subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
            
            logger.info(f"✅ Video created: {video_path}")
            return str(video_path)
        
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ ffmpeg error: {e.stderr.decode()}")
            return None
        except Exception as e:
            logger.error(f"❌ Video creation failed: {e}")
            return None
    
    def generate_complete_video(self, topic: str, text_overlay: str = None) -> Optional[Dict]:
        """
        Generate complete video: script → voiceover → background → video
        
        Args:
            topic: Main topic for the video
            text_overlay: Text to display on video (defaults to topic)
        
        Returns:
            Dict with paths to all generated assets
        """
        logger.info("=" * 60)
        logger.info(f"🎬 GENERATING VIDEO: {topic}")
        logger.info("=" * 60)
        
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Step 1: Generate script
        logger.info("\n📝 Step 1: Generating script...")
        script = self.generate_script(topic, duration=30)
        if not script:
            return None
        
        # Step 2: Generate voiceover
        logger.info("\n🎙️ Step 2: Generating voiceover...")
        audio_path = self.generate_voiceover(script, f"voice_{timestamp}")
        if not audio_path:
            return None
        
        # Step 3: Generate background
        logger.info("\n🎨 Step 3: Generating background image...")
        image_path = self.generate_background_image(topic)
        if not image_path:
            return None
        
        # Step 4: Create video
        logger.info("\n🎬 Step 4: Creating video...")
        overlay_text = text_overlay or "🇳🇬 Rise Up NG 🚀"
        video_path = self.create_video(audio_path, image_path, overlay_text, f"video_{timestamp}")
        
        if not video_path:
            return None
        
        result = {
            'script': script,
            'audio_path': audio_path,
            'image_path': image_path,
            'video_path': video_path,
            'success': True
        }
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ VIDEO GENERATION COMPLETE")
        logger.info("=" * 60)
        logger.info(f"📄 Script: {len(script.split())} words")
        logger.info(f"🎙️ Audio: {audio_path}")
        logger.info(f"🎨 Image: {image_path}")
        logger.info(f"🎬 Video: {video_path}")
        logger.info("=" * 60)
        
        return result


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    generator = VideoGenerator()
    result = generator.generate_complete_video(
        topic="Job #21 Completed: Rise Up NG - Nigeria is Building the Digital Future",
        text_overlay="🇳🇬 RISE UP NG 🚀\nJob #21 Complete"
    )
    
    if result:
        print(f"\n✅ SUCCESS! Video ready: {result['video_path']}")
    else:
        print("\n❌ FAILED to generate video")
