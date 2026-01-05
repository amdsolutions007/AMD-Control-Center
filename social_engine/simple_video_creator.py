"""
Simple Video Creator - No ffmpeg required
Uses moviepy (Python-based video editing)
"""

import logging
from pathlib import Path
from moviepy.editor import ImageClip, AudioFileClip, CompositeVideoClip, TextClip
from PIL import Image, ImageDraw, ImageFont
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_simple_video(image_path: str, audio_path: str, text_overlay: str, output_path: str = None):
    """
    Create video from image + audio + text
    
    Args:
        image_path: Path to background image
        audio_path: Path to audio file
        text_overlay: Text to display on video
        output_path: Output video path (optional)
    
    Returns:
        Path to created video
    """
    try:
        logger.info("🎬 Creating video with moviepy...")
        
        # Load audio to get duration
        audio = AudioFileClip(audio_path)
        duration = audio.duration
        
        logger.info(f"🎙️ Audio duration: {duration:.2f} seconds")
        
        # Load and resize image
        logger.info("🖼️ Processing image...")
        img = Image.open(image_path)
        
        # Resize to 1080p (1920x1080)
        img_resized = img.resize((1920, 1080), Image.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(img_resized)
        
        # Create video clip from image
        video = ImageClip(img_array, duration=duration)
        
        # Add audio
        video = video.set_audio(audio)
        
        # Create text overlay
        logger.info("✍️ Adding text overlay...")
        txt_clip = TextClip(
            text_overlay,
            fontsize=70,
            color='white',
            font='Arial-Bold',
            stroke_color='black',
            stroke_width=3,
            method='caption',
            size=(1600, None),
            align='center'
        )
        
        # Position text at center
        txt_clip = txt_clip.set_position('center').set_duration(duration)
        
        # Composite video with text
        final_video = CompositeVideoClip([video, txt_clip])
        
        # Set output path
        if not output_path:
            video_dir = Path(image_path).parent
            output_path = str(video_dir / "final_video.mp4")
        
        # Write video file
        logger.info(f"💾 Writing video to: {output_path}")
        final_video.write_videofile(
            output_path,
            fps=24,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            logger=None  # Suppress moviepy logs
        )
        
        # Close clips
        audio.close()
        video.close()
        final_video.close()
        
        logger.info(f"✅ Video created successfully: {output_path}")
        return output_path
    
    except Exception as e:
        logger.error(f"❌ Video creation failed: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    # Test with the generated assets
    video_dir = Path(__file__).parent / 'generated_videos'
    
    image_path = str(video_dir / 'bg_20251231_200559.png')
    audio_path = str(video_dir / 'voice_20251231_200521.mp3')
    text_overlay = "🇳🇬 RISE UP NG 🚀\nJob #21 Complete"
    output_path = str(video_dir / 'rise_up_ng_video.mp4')
    
    result = create_simple_video(image_path, audio_path, text_overlay, output_path)
    
    if result:
        print(f"\n✅ SUCCESS! Video ready at: {result}")
    else:
        print("\n❌ FAILED to create video")
