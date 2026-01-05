"""
Simple YouTube Upload - No text overlay, just image + audio
"""

import logging
import sys
from pathlib import Path
import subprocess

sys.path.append(str(Path(__file__).parent))

from platforms.youtube import YouTubePlatform

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_and_upload():
    logger.info("=" * 60)
    logger.info("🎬 YOUTUBE: AI VIDEO UPLOAD")
    logger.info("=" * 60)
    
    video_dir = Path(__file__).parent / 'generated_videos'
    image_path = video_dir / 'bg_20251231_200559.png'
    audio_path = video_dir / 'voice_20251231_200521.mp3'
    output_video = video_dir / 'rise_up_ng.mp4'
    
    logger.info(f"✅ Image: {image_path.name}")
    logger.info(f"✅ Audio: {audio_path.name}")
    
    # Create video with ffmpeg (simple: image + audio)
    try:
        from imageio_ffmpeg import get_ffmpeg_exe
        ffmpeg = get_ffmpeg_exe()
        
        logger.info("🎬 Creating video...")
        
        cmd = [
            ffmpeg, '-y',
            '-loop', '1',
            '-i', str(image_path),
            '-i', str(audio_path),
            '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080',
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-pix_fmt', 'yuv420p',
            '-shortest',
            str(output_video)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"ffmpeg error: {result.stderr}")
            return None
        
        logger.info(f"✅ Video: {output_video.name} ({output_video.stat().st_size / 1024 / 1024:.1f} MB)")
        
        # Upload to YouTube
        logger.info("\n📤 Uploading to YouTube...")
        
        youtube = YouTubePlatform()
        if not youtube.youtube:
            logger.error("❌ YouTube not authenticated")
            return None
        
        from googleapiclient.http import MediaFileUpload
        
        body = {
            'snippet': {
                'title': '🇳🇬 Job #21 Complete: Rise Up NG - Nigeria Building Digital Future',
                'description': """Job #21 is DONE! 🚀

Nigeria, we're not just dreaming—we're BUILDING!

Rise Up NG is live. 999 creatives backing 1 spotlight daily.

🔗 https://amdsolutions007.com
📱 WhatsApp: +234 818 002 1007

#RiseUpNG #NaijaTech #DigitalNation #NigeriaTech

AMD Solutions 007""",
                'tags': ['RiseUpNG', 'Nigeria', 'NaijaTech', 'AMD Solutions'],
                'categoryId': '28'
            },
            'status': {
                'privacyStatus': 'public',
                'selfDeclaredMadeForKids': False
            }
        }
        
        media = MediaFileUpload(str(output_video), mimetype='video/mp4', resumable=True, chunksize=1024*1024)
        
        request = youtube.youtube.videos().insert(part='snippet,status', body=body, media_body=media)
        
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.info(f"📊 {int(status.progress() * 100)}%")
        
        video_id = response['id']
        url = f"https://www.youtube.com/watch?v={video_id}"
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ SUCCESS! VIDEO PUBLISHED")
        logger.info("=" * 60)
        logger.info(f"🔗 {url}")
        logger.info("=" * 60)
        
        return {'success': True, 'url': url, 'video_id': video_id}
    
    except Exception as e:
        logger.error(f"❌ Failed: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    result = create_and_upload()
    if result:
        print(f"\n🎉 LIVE: {result['url']}")
    else:
        print("\n❌ Failed")
