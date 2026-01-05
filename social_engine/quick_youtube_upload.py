"""
Quick YouTube Upload - Static Video (Image + Audio)
No ffmpeg required - uses moviepy for simple image-to-video conversion
"""

import logging
import sys
from pathlib import Path
from typing import Optional, Dict

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

sys.path.append(str(Path(__file__).parent))

from platforms.youtube import YouTubePlatform


def create_static_video(image_path: str, audio_path: str, output_path: str) -> Optional[str]:
    """Create simple static video (image + audio)"""
    try:
        from moviepy.editor import ImageClip, AudioFileClip
        
        logger.info("🎬 Creating static video...")
        
        # Load audio
        audio = AudioFileClip(audio_path)
        duration = audio.duration
        
        logger.info(f"🎙️ Audio duration: {duration:.2f} seconds")
        
        # Create video from static image
        video = ImageClip(image_path, duration=duration)
        video = video.set_audio(audio)
        
        # Write video
        logger.info(f"💾 Writing video: {output_path}")
        video.write_videofile(
            output_path,
            fps=24,
            codec='libx264',
            audio_codec='aac',
            preset='ultrafast',
            logger=None
        )
        
        audio.close()
        video.close()
        
        logger.info(f"✅ Static video created: {output_path}")
        return output_path
    
    except Exception as e:
        logger.error(f"❌ Video creation failed: {e}")
        import traceback
        traceback.print_exc()
        return None


def upload_to_youtube(video_path: str, title: str, description: str) -> Optional[Dict]:
    """Upload video to YouTube"""
    youtube = YouTubePlatform()
    
    if not youtube.youtube:
        logger.error("❌ YouTube not authenticated")
        return None
    
    try:
        from googleapiclient.http import MediaFileUpload
        
        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': ["RiseUpNG", "Nigeria", "Nigerian Tech", "AMD Solutions", "Tech Innovation"],
                'categoryId': '28'  # Science & Technology
            },
            'status': {
                'privacyStatus': 'public',
                'selfDeclaredMadeForKids': False
            }
        }
        
        logger.info(f"📤 Uploading to YouTube: {title}")
        
        media = MediaFileUpload(
            video_path,
            mimetype='video/mp4',
            resumable=True,
            chunksize=1024*1024
        )
        
        request = youtube.youtube.videos().insert(
            part='snippet,status',
            body=body,
            media_body=media
        )
        
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                progress = int(status.progress() * 100)
                logger.info(f"📊 Upload: {progress}%")
        
        video_id = response['id']
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        logger.info(f"✅ UPLOADED: {video_url}")
        
        return {
            'success': True,
            'video_id': video_id,
            'url': video_url,
            'title': title
        }
    
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Main execution"""
    logger.info("=" * 60)
    logger.info("🚀 YOUTUBE STATIC VIDEO UPLOAD")
    logger.info("=" * 60)
    
    # Paths to generated assets
    video_dir = Path(__file__).parent / 'generated_videos'
    image_path = str(video_dir / 'bg_20251231_200559.png')
    audio_path = str(video_dir / 'voice_20251231_200521.mp3')
    output_path = str(video_dir / 'rise_up_ng_static.mp4')
    
    # Step 1: Create static video
    logger.info("\n🎬 Step 1: Creating static video from AI assets...")
    video_path = create_static_video(image_path, audio_path, output_path)
    
    if not video_path:
        logger.error("❌ Failed to create video")
        return None
    
    # Step 2: Upload to YouTube
    logger.info("\n📤 Step 2: Uploading to YouTube...")
    
    title = "🇳🇬 Job #21 Complete: Rise Up NG - Nigeria Building Digital Future | AMD Solutions"
    description = """Job #21 is DONE! 🚀

Nigeria, we're not just dreaming—we're BUILDING! 

From Lagos to Abuja, our tech revolution is here. Rise Up NG is live. 999 creatives backing 1 spotlight daily.

🔗 Join the Movement: https://amdsolutions007.com
📱 WhatsApp: +234 818 002 1007
🌐 Portfolio: https://amdsolutions007.github.io
📧 Email: ceo@amdsolutions007.com

#RiseUpNG #NaijaTech #DigitalNation #NigeriaTech #TechForGood #Innovation #AfricanTech #StartupNigeria

---
AMD Solutions 007 | Building Nigeria's Digital Future
Powered by AI: GPT-4, DALL-E 3, OpenAI TTS
"""
    
    result = upload_to_youtube(video_path, title, description)
    
    if result and result.get('success'):
        logger.info("\n" + "=" * 60)
        logger.info("✅ SUCCESS! VIDEO LIVE ON YOUTUBE")
        logger.info("=" * 60)
        logger.info(f"🔗 URL: {result['url']}")
        logger.info(f"🎬 Video ID: {result['video_id']}")
        logger.info("=" * 60)
        return result
    else:
        logger.error("❌ Upload failed")
        return None


if __name__ == '__main__':
    result = main()
    if result:
        print(f"\n🎉 VIDEO LIVE: {result['url']}")
    else:
        print("\n❌ Failed")
