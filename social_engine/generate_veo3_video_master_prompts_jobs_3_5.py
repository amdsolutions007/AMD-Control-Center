#!/usr/bin/env python3
"""Generate Veo3 'talking twin' VIDEO MASTER prompt packs for Jobs 3–5.

Why this exists:
- The local pipeline can reliably produce flyer + audio + fallback video.
- The *master* video standard is Veo3 image-to-video where the Twin speaks/moves.

This script writes ready-to-paste prompt text files next to each job's assets.
It does NOT call Veo3 (UI/API details vary); it prepares the exact prompts + paths.
"""

from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def write_prompt(asset_dir: Path, job_id: str, twin_image_name: str, prompt: str) -> Path:
    asset_dir.mkdir(parents=True, exist_ok=True)
    out_path = asset_dir / f"{job_id}_Veo3_Video_Master_Prompt.txt"
    out_path.write_text(
        "\n".join(
            [
                f"JOB: {job_id}",
                f"INPUT IMAGE (UPLOAD TO VEO3): {twin_image_name}",
                "TARGET OUTPUT (SAVE AS): " + f"{job_id}_Video_Master.mp4",
                "FORMAT: Vertical 9:16 (Reels/TikTok).",
                "CONSTRAINTS: Keep identity locked (no face drift), no extra people, no text glitches.",
                "BRANDING: End with a clean gold footer watermark reading: AMD SOLUTIONS 007.",
                "\nVEO3 PROMPT:\n" + prompt.strip(),
                "",
            ]
        ),
        encoding="utf-8",
    )
    return out_path


def main() -> None:
    social_engine = REPO_ROOT / "social_engine"
    jobs = [
        {
            "job_id": "Job3",
            "asset_dir": social_engine / "assets" / "Job3_RealEstate_Mapper",
            "twin": "Job3_Twin_Master.png",
            "script": (
                "They told you it was dry land. But did you check the satellite history from 2020? "
                "Stop gambling with your millions in Lekki. "
                "Naija Prop Intel lets you see the truth from the sky before you pay. "
                "Verify the land. Verify the future. DM MAP to start. "
                "Powered by AMD Solutions 007."
            ),
            "prompt": (
                "Create a vertical 9:16 cinematic, luxurious, high-tech video using this exact reference image as the character lock. "
                "The Digital Twin (same face, same skin tone, same white polo, same balcony vibe) stands on a balcony at sunset. "
                "Camera starts wide, then slowly dollies in. The Twin holds a tablet. "
                "The Twin looks into the camera and speaks clearly with natural mouth movement and subtle gestures: "
                "'They told you it was dry land. But did you check the satellite history from 2020? Stop gambling with your millions in Lekki. "
                "Naija Prop Intel lets you see the truth from the sky before you pay. Verify the land. Verify the future. DM MAP to start. "
                "Powered by AMD Solutions 007.' "
                "While speaking, the tablet UI is sleek and premium; a drone + satellite map overlay animates over Lagos land with coordinate pins and a VERIFIED checkmark. "
                "End on the VERIFIED screen, then a clean gold footer watermark reading AMD SOLUTIONS 007. "
                "No identity drift, no distortions, no extra people, no random text."
            ),
        },
        {
            "job_id": "Job4",
            "asset_dir": social_engine / "assets" / "Job4_Forex_TradingBot",
            "twin": "Job4_Twin_Master.png",
            "script": (
                "The market doesn't care about your feelings. It eats emotion for breakfast. "
                "Stop trading with your heart. Use the AMD Trading Bot. "
                "It enters with logic. It exits with profit. While you panic, we profit. "
                "DM TRADE to install. Powered by AMD Solutions 007."
            ),
            "prompt": (
                "Create a vertical 9:16 cinematic, high-tech Wall Street scene using this exact image as the character lock (same face, same navy suit). "
                "The Twin takes one confident step forward, then looks into the camera and speaks with clean lip sync and natural hand gestures: "
                "'The market doesn't care about your feelings. It eats emotion for breakfast. Stop trading with your heart. Use the AMD Trading Bot. "
                "It enters with logic. It exits with profit. While you panic, we profit. DM TRADE to install. Powered by AMD Solutions 007.' "
                "Behind him, green holographic charts rotate and pulse with clean BUY/SELL HUD animations. "
                "End with a clean gold footer watermark reading AMD SOLUTIONS 007. "
                "No identity drift, no extra people, no text glitches."
            ),
        },
        {
            "job_id": "Job5",
            "asset_dir": social_engine / "assets" / "Job5_CBN_Compliance",
            "twin": "Job5_Twin_Master.png",
            "script": (
                "One mistake. That is all it takes for the CBN to freeze your license. "
                "Stop managing compliance on spreadsheets. "
                "The CBN Compliance Copilot audits your bank 24/7. "
                "No fines. No panic. Just green lights. "
                "DM COMPLY to secure your license. "
                "Powered by AMD Solutions 007."
            ),
            "prompt": (
                "Create a vertical 9:16 cinematic boardroom video using this exact image as the character lock. "
                "The Digital Twin gestures confidently toward the screen. The executives in the foreground subtly nod (very minimal). "
                "The Twin looks into the camera and speaks with natural mouth movement and subtle gestures: "
                "'One mistake. That is all it takes for the CBN to freeze your license. Stop managing compliance on spreadsheets. "
                "The CBN Compliance Copilot audits your bank 24/7. No fines. No panic. Just green lights. DM COMPLY to secure your license. "
                "Powered by AMD Solutions 007.' "
                "On the screen, green compliance status bars pulse and update, ending on VERIFIED / GREEN LIGHT. "
                "End with a clean gold footer watermark reading AMD SOLUTIONS 007. "
                "No identity drift, no distortions, no random text."
            ),
        },
    ]

    written = []
    for job in jobs:
        written.append(
            write_prompt(
                asset_dir=job["asset_dir"],
                job_id=job["job_id"],
                twin_image_name=job["twin"],
                prompt=job["prompt"],
            )
        )

    print("✅ Veo3 prompt packs generated:")
    for p in written:
        print(" -", p)


if __name__ == "__main__":
    main()
