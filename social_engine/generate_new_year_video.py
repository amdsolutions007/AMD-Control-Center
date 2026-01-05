"""
NEW YEAR 2026 VIRAL VIDEO GENERATOR
Theme: "3 Years with AI - The Journey"
"""

from video_generator import VideoGenerator
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def main():
    print("\n🎬 GENERATING NEW YEAR 2026 VIRAL VIDEO")
    print("=" * 60)
    print("Theme: 3 Years with AI - Nigeria's Revolution")
    print("=" * 60 + "\n")
    
    generator = VideoGenerator()
    
    # The emotional journey
    topic = "3 Years with AI: From Partnership to Empire - Nigeria's 2026 Digital Revolution"
    
    result = generator.generate_complete_video(
        topic=topic,
        text_overlay="🇳🇬 3 YEARS WITH AI\n2026: NIGERIA RISES"
    )
    
    if result:
        print("\n" + "=" * 60)
        print("✅ NEW YEAR 2026 VIDEO READY!")
        print("=" * 60)
        print(f"\n📄 Script: {len(result['script'].split())} words")
        print(f"🎙️ Audio: {result['audio_path']}")
        print(f"🎨 Image: {result['image_path']}")
        print(f"🎬 Video: {result['video_path']}")
        print("\n🚀 Ready to upload to YouTube!")
        print("=" * 60 + "\n")
        
        return result
    else:
        print("\n❌ VIDEO GENERATION FAILED")
        return None

if __name__ == '__main__':
    result = main()
    if result:
        print("✅ SUCCESS! Video ready for New Year launch!")
    else:
        print("❌ FAILED! Check logs for errors.")
