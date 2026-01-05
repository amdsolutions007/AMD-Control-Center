"""
Generate Job 6 Veo3 Video Master Prompt.
Creates a text file with the complete Veo3 prompt for manual video generation.
"""

from pathlib import Path

# Paths
OUTPUT_DIR = Path(__file__).parent / 'assets' / 'Job6_Bank_Statement_Parser'
OUTPUT_FILE = OUTPUT_DIR / 'Job6_Veo3_Video_Master_Prompt.txt'

# Job 6 Script (from Bible)
SCRIPT = """How long does it take you to read a 300-page bank statement? Three days? Our AI does it in one second. Stop making customers wait for loans. The AMD Bank Statement Parser turns messy PDFs into instant decisions. Approve faster. Grow faster. DM 'AUDIT' to install. Powered by AMD Solutions 007."""

# Veo3 Prompt (from Bible)
VEO3_PROMPT = """A professional Digital Twin avatar sits in a modern fintech office, holding a tablet displaying messy financial graphs and scattered data. As the camera focuses on the tablet, the chaotic graphs rapidly morph and organize themselves into a large, glowing green checkmark with the word "APPROVED" overlaid. The transformation happens in under a second, symbolizing instant loan approval. The Digital Twin's expression shifts from concentration to a confident smile as the approval appears. High-tech lighting with subtle green accent lights emphasizes the approval theme. The scene conveys speed, precision, and modern financial technology. Shot in cinematic 8k quality with shallow depth of field focusing on the tablet transition."""

def generate_prompt():
    """Generate Veo3 prompt file."""
    print("=" * 60)
    print("JOB 6: BANK STATEMENT PARSER - VEO3 PROMPT GENERATION")
    print("=" * 60)
    print()
    
    # Create full prompt with instructions
    full_content = f"""VEO3 VIDEO MASTER PROMPT - JOB 6: BANK STATEMENT PARSER
============================================================

INSTRUCTIONS:
1. Go to: https://labs.google/flow or https://gemini.google.com/veo
2. Upload the source image: Job6_BankStatement_Twin.png
3. Paste the VISUAL PROMPT below into Veo3
4. Set duration: 8-10 seconds
5. Generate video
6. Download and save as: Job6_Video_Master.mp4

============================================================
VISUAL PROMPT (Image-to-Video):
============================================================

{VEO3_PROMPT}

============================================================
AUDIO SCRIPT (Narration - Already Generated):
============================================================

{SCRIPT}

============================================================
NOTES:
- The source image should show the Digital Twin with a tablet
- Key visual: Financial graph → Green "APPROVED" checkmark
- Timing: The transformation should happen within 1-2 seconds
- Mood: Professional, confident, tech-forward
- Color palette: Blues/grays with green accent for approval

BRANDING:
- Outro: "Powered by AMD Solutions 007" (audio already includes this)
- Logo placement: Bottom right corner (if adding overlay)
============================================================
"""
    
    # Save prompt file
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(full_content, encoding='utf-8')
    
    print(f"✅ Veo3 prompt saved: {OUTPUT_FILE}")
    print(f"📝 File size: {OUTPUT_FILE.stat().st_size} bytes")
    print()
    print("📋 NEXT STEPS:")
    print("   1. Ensure Job6_BankStatement_Twin.png exists in the assets folder")
    print("   2. Open Veo3 (Google Labs Flow or Gemini)")
    print("   3. Upload the twin image")
    print("   4. Copy/paste the prompt from the generated file")
    print("   5. Generate and download as Job6_Video_Master.mp4")
    print()
    print("=" * 60)
    print("VEO3 PROMPT READY!")
    print("=" * 60)

if __name__ == '__main__':
    generate_prompt()
