"""
Direct YouTube Upload - Upload AI assets as video
Uses existing audio + image, no video assembly needed
"""

import logging
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from platforms.youtube import YouTubePlatform

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def upload_slideshow_video():
    """
    Upload audio + image as YouTube video (slideshow style)
    """
    logger.info("=" * 60)
    logger.info("🎬 YOUTUBE UPLOAD: AI-GENERATED CONTENT")
    logger.info("=" * 60)
    
    # Locate assets
    video_dir = Path(__file__).parent / 'generated_videos'
    image_path = video_dir / 'bg_20251231_200559.png'
    audio_path = video_dir / 'voice_20251231_200521.mp3'
    
    if not image_path.exists():
        logger.error(f"❌ Image not found: {image_path}")
        return None
    
    if not audio_path.exists():
        logger.error(f"❌ Audio not found: {audio_path}")
        return None
    
    logger.info(f"✅ Image: {image_path.name} ({image_path.stat().st_size / 1024 / 1024:.1f} MB)")
    logger.info(f"✅ Audio: {audio_path.name} ({audio_path.stat().st_size / 1024:.1f} KB)")
    
    # Create simple video using ffmpeg (installed via imageio-ffmpeg)
    logger.info("\n🎬 Creating video from assets...")
    
    try:
        import subprocess
        from imageio_ffmpeg import get_ffmpeg_exe
        
        ffmpeg = get_ffmpeg_exe()
        logger.info(f"✅ Using ffmpeg: {ffmpeg}")
        
        # Output video path
        output_video = video_dir / 'rise_up_ng_final.mp4'
        
        # Get audio duration
        duration_cmd = [
            ffmpeg, '-i', str(audio_path),
            '-f', 'null', '-'
        ]
        result = subprocess.run(duration_cmd, capture_output=True, text=True)
        
        # Extract duration from ffmpeg output
        for line in result.stderr.split('\n'):
            if 'Duration:' in line:
                duration_str = line.split('Duration:')[1].split(',')[0].strip()
                logger.info(f"🎙️ Audio duration: {duration_str}")
                break
        
        # Create video: image + audio with text overlay
        cmd = [
            ffmpeg, '-y',
            '-loop', '1',
            '-i', str(image_path),
            '-i', str(audio_path),
            '-vf', "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,drawtext=text='🇳🇬 RISE UP NG 🚀\\nJob #21 Complete':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5:boxborderw=10",
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-pix_fmt', 'yuv420p',
            '-shortest',
            str(output_video)
        ]
        
        logger.info("⚙️ Running ffmpeg...")
        subprocess.run(cmd, check=True, capture_output=True)
        
        logger.info(f"✅ Video created: {output_video}")
        logger.info(f"📦 Size: {output_video.stat().st_size / 1024 / 1024:.1f} MB")
        
        # Upload to YouTube
        logger.info("\n📤 Uploading to YouTube...")
        
        youtube = YouTubePlatform()
        
        if not youtube.youtube:
            logger.error("❌ YouTube not authenticated")
            return None
        
        from googleapiclient.http import MediaFileUpload
        
        title = "🇳🇬 Job #21 Complete: Rise Up NG - Nigeria Building Digital Future"
        description = """Job #21 is DONE! 🚀

Nigeria, we're not just dreaming—we're BUILDING! From Lagos to Abuja, our tech revolution is here.

Rise Up NG is live. 999 creatives backing 1 spotlight daily. Join the movement transforming Nigerian tech.

🔗 Learn More: https://amdsolutions007.com
📱 WhatsApp: +234 818 002 1007
🌐 Portfolio: https://amdsolutions007.github.io

#RiseUpNG #NaijaTech #DigitalNation #NigeriaTech #TechForGood

---
AMD Solutions 007 | Building Nigeria's Digital Future
"""
        
        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': ['RiseUpNG', 'Nigeria', 'Nigerian Tech', 'AMD Solutions', 'Digital Nigeria'],
                'categoryId': '28'
            },
            'status': {
                'privacyStatus': 'public',
                'selfDeclaredMadeForKids': False
            }
        }
        
        media = MediaFileUpload(
            str(output_video),
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
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ SUCCESS! VIDEO LIVE ON YOUTUBE")
        logger.info("=" * 60)
        logger.info(f"🎬 Title: {title}")
        logger.info(f"🔗 URL: {video_url}")
        logger.info(f"📹 Video ID: {video_id}")
        logger.info("=" * 60)
        
        return {
            'success': True,
            'video_id': video_id,
            'url': video_url,
            'video_path': str(output_video)
        }
    
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    result = upload_slideshow_video()
    
    if result:
        print(f"\n🎉 VIDEO LIVE: {result['url']}")
    else:
        print("\n❌ Upload failed")
