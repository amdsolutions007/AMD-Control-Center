#!/usr/bin/env python3
"""
Builds two videos for Job 2 (Crypto Airdrop Auto-Claimer):
1) Flyer + VO video (static flyer with audio)
2) Demo video (simple pan/zoom over flyer with audio)
Outputs:
- assets/Job2_CryptoAirdrop_AutoClaimer/Job2_Airdrop_Flyer_VO.mp4
- assets/Job2_CryptoAirdrop_AutoClaimer/Job2_Airdrop_Demo.mp4
Requires ffmpeg installed.
"""
import subprocess
from pathlib import Path

try:
    from imageio_ffmpeg import get_ffmpeg_exe
except Exception:
    get_ffmpeg_exe = None

ASSETS_DIR = Path("/Users/mac/Desktop/AMD_Control_Center/social_engine/assets/Job2_CryptoAirdrop_AutoClaimer")
FLYER = ASSETS_DIR / "Job2_Airdrop_Flyer.png"
AUDIO = ASSETS_DIR / "Job2_Airdrop_VO.mp3"
FLYER_VIDEO = ASSETS_DIR / "Job2_Airdrop_Flyer_VO.mp4"
DEMO_VIDEO = ASSETS_DIR / "Job2_Airdrop_Demo.mp4"

# Resolve ffmpeg path (prefer bundled imageio_ffmpeg if available)
def ffmpeg_path() -> str:
    if get_ffmpeg_exe is not None:
        return get_ffmpeg_exe()
    return "ffmpeg"


def run(cmd: list[str]):
    print("$", " ".join(cmd))
    subprocess.run(cmd, check=True)


def build_flyer_video():
    # Still image + audio, 1080p, shortest duration
    cmd = [
        ffmpeg_path(), "-y",
        "-loop", "1", "-i", str(FLYER),
        "-i", str(AUDIO),
        "-c:v", "libx264", "-tune", "stillimage",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        "-vf", "scale=1920:1080,setsar=1",
        str(FLYER_VIDEO),
    ]
    run(cmd)


def build_demo_video():
    # Simple static scaled frame with audio (keeps reliable cross-platform behavior)
    vf = "scale=1920:1080,setsar=1"
    cmd = [
        ffmpeg_path(), "-y",
        "-loop", "1", "-i", str(FLYER),
        "-i", str(AUDIO),
        "-filter_complex", vf,
        "-c:v", "libx264",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        str(DEMO_VIDEO),
    ]
    run(cmd)


def main():
    if not FLYER.exists():
        raise SystemExit(f"Missing flyer: {FLYER}")
    if not AUDIO.exists():
        raise SystemExit(f"Missing audio: {AUDIO}")

    print("═" * 60)
    print("🎥 Building Flyer + VO video")
    build_flyer_video()
    print(f"✅ Saved {FLYER_VIDEO}")

    print("═" * 60)
    print("🎥 Building Demo video (pan/zoom)")
    build_demo_video()
    print(f"✅ Saved {DEMO_VIDEO}")
    print("═" * 60)


if __name__ == "__main__":
    main()
