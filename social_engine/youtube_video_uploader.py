"""
YouTube Video Uploader - Upload AI-generated videos to YouTube
"""

import logging
import sys
from pathlib import Path
from typing import Optional, Dict

sys.path.append(str(Path(__file__).parent))

from platforms.youtube import YouTubePlatform
from video_generator import VideoGenerator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def upload_to_youtube(video_path: str, title: str, description: str, tags: list = None) -> Optional[Dict]:
    """
    Upload video to YouTube
    
    Args:
        video_path: Path to video file
        title: Video title
        description: Video description
        tags: List of tags/keywords
    
    Returns:
        Upload result with video ID and URL
    """
    youtube = YouTubePlatform()
    
    if not youtube.youtube:
        logger.error("❌ YouTube not authenticated")
        return None
    
    try:
        from googleapiclient.http import MediaFileUpload
        
        # Default tags if none provided
        if not tags:
            tags = [
                "Nigeria", "Nigerian Tech", "RiseUpNG", "AMD Solutions",
                "Digital Nigeria", "Tech Innovation", "Naija Tech"
            ]
        
        # Video metadata
        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': tags,
                'categoryId': '28'  # Science & Technology
            },
            'status': {
                'privacyStatus': 'public',  # public, private, or unlisted
                'selfDeclaredMadeForKids': False
            }
        }
        
        logger.info(f"📤 Uploading video: {title}")
        
        # Create media upload
        media = MediaFileUpload(
            video_path,
            mimetype='video/mp4',
            resumable=True,
            chunksize=1024*1024  # 1MB chunks
        )
        
        # Execute upload
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
                logger.info(f"📊 Upload progress: {progress}%")
        
        video_id = response['id']
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        logger.info(f"✅ Video uploaded successfully!")
        logger.info(f"🎬 Video ID: {video_id}")
        logger.info(f"🔗 URL: {video_url}")
        
        return {
            'success': True,
            'video_id': video_id,
            'url': video_url,
            'title': title
        }
    
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        return None


def create_and_upload_video(topic: str, text_overlay: str = None):
    """
    Complete workflow: Generate video → Upload to YouTube
    
    Args:
        topic: Main topic for the video
        text_overlay: Text to display on video
    """
    logger.info("=" * 60)
    logger.info("🚀 YOUTUBE VIDEO AUTOMATION")
    logger.info("=" * 60)
    
    # Step 1: Generate video
    logger.info("\n🎬 Step 1: Generating AI-powered video...")
    generator = VideoGenerator()
    video_result = generator.generate_complete_video(topic, text_overlay)
    
    if not video_result or not video_result.get('success'):
        logger.error("❌ Video generation failed")
        return None
    
    # Step 2: Upload to YouTube
    logger.info("\n📤 Step 2: Uploading to YouTube...")
    
    title = "🇳🇬 Job #21 Complete: Rise Up NG - Nigeria Building Digital Future | AMD Solutions"
    description = f"""Job #21 is DONE! 🚀

Nigeria, we're not just dreaming—we're BUILDING! From Lagos to Abuja, our tech revolution is here.

Rise Up NG is live. 999 creatives backing 1 spotlight daily. Join the movement transforming Nigerian tech.

🔗 Learn More: https://amdsolutions007.com
📱 WhatsApp: +234 818 002 1007
🌐 Portfolio: https://amdsolutions007.github.io

#RiseUpNG #NaijaTech #DigitalNation #NigeriaTech #TechForGood #Innovation #AfricanTech #StartupNigeria

---
AMD Solutions 007 | Building Nigeria's Digital Future
CEO: ceo@amdsolutions007.com
"""
    
    upload_result = upload_to_youtube(
        video_path=video_result['video_path'],
        title=title,
        description=description,
        tags=["RiseUpNG", "Nigeria", "Nigerian Tech", "AMD Solutions", "Tech Innovation", "Digital Nigeria"]
    )
    
    if upload_result and upload_result.get('success'):
        logger.info("\n" + "=" * 60)
        logger.info("✅ SUCCESS! VIDEO PUBLISHED TO YOUTUBE")
        logger.info("=" * 60)
        logger.info(f"🎬 Title: {upload_result['title']}")
        logger.info(f"🔗 URL: {upload_result['url']}")
        logger.info(f"📄 Script: {video_result['script'][:100]}...")
        logger.info("=" * 60)
        return upload_result
    else:
        logger.error("❌ YouTube upload failed")
        return None


if __name__ == '__main__':
    result = create_and_upload_video(
        topic="Job #21 Completed: Rise Up NG - Nigeria is Building the Digital Future",
        text_overlay="🇳🇬 RISE UP NG 🚀\nJob #21 Complete"
    )
    
    if result:
        print(f"\n🎉 VIDEO LIVE: {result['url']}")
    else:
        print("\n❌ Operation failed")
