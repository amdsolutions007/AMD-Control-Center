#!/usr/bin/env python3
"""
RISE UP TRILOGY - STITCHING PROTOCOL
Combine 3 Veo 3 clips into one cinematic master
"""
import os
import sys
from pathlib import Path
from moviepy import *
from moviepy.video.fx.CrossFadeIn import CrossFadeIn
from moviepy.video.fx.CrossFadeOut import CrossFadeOut

print("🎬 RISE UP TRILOGY - STITCHING PROTOCOL")
print("=" * 70)

# Paths
SOCIAL_ENGINE = '/Users/mac/Desktop/AMD_Control_Center/social_engine'
CLIP_1 = f'{SOCIAL_ENGINE}/01_RiseUp_Awakening.mp4'
CLIP_2 = f'{SOCIAL_ENGINE}/02_RiseUp_Architect.mp4'
CLIP_3 = f'{SOCIAL_ENGINE}/03_RiseUp_Invitation.mp4'
OUTPUT = f'{SOCIAL_ENGINE}/RiseUp_Launch_Master.mp4'

# Verify all clips exist
clips_info = [
    (CLIP_1, "01 - The Awakening"),
    (CLIP_2, "02 - The Architect"),
    (CLIP_3, "03 - The Invitation")
]

print("📹 Verifying assets...")
for clip_path, clip_name in clips_info:
    if not Path(clip_path).exists():
        print(f"❌ Missing: {clip_name}")
        sys.exit(1)
    
    size = Path(clip_path).stat().st_size / (1024 * 1024)
    print(f"✅ {clip_name}: {size:.1f} MB")

print("\n🎬 Loading video clips...")

try:
    # Load all clips
    clip1 = VideoFileClip(CLIP_1)
    clip2 = VideoFileClip(CLIP_2)
    clip3 = VideoFileClip(CLIP_3)
    
    print(f"✅ Clip 1 (Awakening): {clip1.duration:.1f}s @ {clip1.size}")
    print(f"✅ Clip 2 (Architect): {clip2.duration:.1f}s @ {clip2.size}")
    print(f"✅ Clip 3 (Invitation): {clip3.duration:.1f}s @ {clip3.size}")
    
    # Calculate total duration
    crossfade_duration = 0.5  # 0.5 second crossfade
    total_duration = clip1.duration + clip2.duration + clip3.duration - (2 * crossfade_duration)
    
    print(f"\n⏱️  Total duration: {total_duration:.1f}s (with 0.5s crossfades)")
    
    # Apply crossfade transitions
    print("\n🎨 Applying crossfade transitions...")
    
    # Clip 1: Add fadeout at end
    clip1_with_fade = clip1.with_effects([CrossFadeOut(crossfade_duration)])
    
    # Clip 2: Add fadein at start and fadeout at end
    clip2_with_fade = clip2.with_effects([
        CrossFadeIn(crossfade_duration),
        CrossFadeOut(crossfade_duration)
    ])
    
    # Clip 3: Add fadein at start
    clip3_with_fade = clip3.with_effects([CrossFadeIn(crossfade_duration)])
    
    # Set start times for overlapping crossfades
    clip1_with_fade = clip1_with_fade.with_start(0)
    clip2_with_fade = clip2_with_fade.with_start(clip1.duration - crossfade_duration)
    clip3_with_fade = clip3_with_fade.with_start(
        clip1.duration + clip2.duration - (2 * crossfade_duration)
    )
    
    print("✅ Crossfade transitions applied")
    
    # Composite all clips with overlapping transitions
    print("\n🎬 Compositing master film...")
    final = CompositeVideoClip([
        clip1_with_fade,
        clip2_with_fade,
        clip3_with_fade
    ])
    
    # Verify resolution consistency
    print(f"\n📐 Master resolution: {final.size}")
    
    # Export master
    print("\n🎬 Rendering RiseUp_Launch_Master.mp4...")
    print("   This may take several minutes for high-quality output...")
    
    final.write_videofile(
        OUTPUT,
        fps=30,
        codec='libx264',
        audio_codec='aac',
        bitrate='8000k',  # High quality
        preset='medium',
        threads=4,
        logger=None  # Suppress verbose output
    )
    
    # Get final file size
    final_size = Path(OUTPUT).stat().st_size / (1024 * 1024)
    
    print("\n" + "=" * 70)
    print("✅ RISE UP TRILOGY - MASTER COMPLETE!")
    print("=" * 70)
    print(f"📹 File: RiseUp_Launch_Master.mp4")
    print(f"📊 Size: {final_size:.1f} MB")
    print(f"⏱️  Duration: {total_duration:.1f} seconds")
    print(f"🎯 Resolution: {final.size}")
    print(f"✨ Quality: 8000k bitrate (Cinematic)")
    print(f"🎬 Transitions: 0.5s crossfades between clips")
    print("=" * 70)
    print("\n✅ READY FOR DEPLOYMENT:")
    print("   📹 YouTube")
    print("   🐦 X (Twitter)")
    print("   💼 LinkedIn")
    print("=" * 70)
    
    # Close clips
    clip1.close()
    clip2.close()
    clip3.close()
    final.close()
    
except Exception as e:
    print(f"\n❌ Stitching failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🎬 THE TRILOGY IS COMPLETE.")
