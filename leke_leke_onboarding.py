"""
Leke Leke Onboarding Message Generator
Creates compelling messages to convert WhatsApp War Room members to Leke Leke followers
"""

def generate_onboarding_message():
    """Generate WhatsApp message to recruit Leke Leke followers"""
    
    message = """🚨 *WAR ROOM ACTIVATION* 🚨

Brothers and Sisters, we're making HISTORY.

AMD Solutions just went LIVE on *Leke Leke* - Africa's brand new social platform (launched 3 days ago). 🌍

🎯 *THE MISSION:*
We need to DOMINATE this platform. Right now:
- AMD: 9 followers ❌
- Random marketing groups: 80+ members ❌

This is UNACCEPTABLE.

✅ *YOUR ORDERS:*
1. Follow @amd NOW: https://www.lekeelekee.com/u/amd
2. Join African Tech Ecosystem: https://www.lekeelekee.com/groups/2169d52a-171f-4424-a686-d3eb6fbba94
3. Tag 3 developer friends in the comments

🔥 *WHY LEKE LEKE?*
• Built by Africans FOR Africans
• No algorithm suppression (unlike Twitter/LinkedIn)
• We CONTROL our narrative
• Early adopters WIN (platform is 3 days old!)

📊 *WHAT'S IN IT FOR YOU:*
• Daily tech intelligence (37 Nigerian states covered)
• AI-powered graphics on every article
• Exclusive "Sunday Playbook" series
• First to know about opportunities

🎯 *THE GOAL:*
We have 127 members here. If we ALL follow:
- We become #1 tech profile INSTANTLY
- Our group becomes THE destination for African builders
- We set the tone for the ENTIRE platform

⚡ *We're not just users. We're FOUNDING MEMBERS.*

This is OUR platform. Let's OWN it.

Drop a 🔥 when you've followed.
Tag 3 developers below. 👇

#BuildInAfrica #AMDSolutions #LekeLekee"""

    return message

def generate_state_spotlight_activation(state_name):
    """Generate message to activate followers from specific state"""
    
    message = f"""🎯 *CALLING ALL {state_name.upper()} DEVELOPERS* 🎯

AMD Intelligence Brief just dropped *EXCLUSIVE* intel about your state's tech ecosystem. 📊

🔍 *What's inside:*
• {state_name} tech landscape analysis
• Infrastructure updates
• Developer community insights
• Startup activity tracking

📖 *Read the full brief:*
https://amd-signal-beacon.vercel.app/signal/{state_name.lower().replace(' ', '-')}-spotlight

🌍 *Want intel for ALL 37 states?*
Follow @amd on Leke Leke: https://www.lekeelekee.com/u/amd

👥 *TAG 3 {state_name.upper()} DEVELOPERS* who need to see this 👇

We're mapping Africa's ENTIRE tech ecosystem. One state at a time.

#BuildInNaija #{state_name.replace(' ', '')}Tech #AMDIntelligence"""

    return message

def generate_exclusive_content_announcement():
    """Announce Leke Leke exclusive content to create FOMO"""
    
    message = """🚨 *NEW: "SUNDAY PLAYBOOK" SERIES* 🚨
*EXCLUSIVE TO LEKE LEKE*

Starting this Sunday, AMD drops weekly intelligence that will NEVER be posted anywhere else:

🎯 *What you get:*
• Startup ideas we spotted this week
• Tech job openings (BEFORE they hit LinkedIn)
• African VC investment intel
• Developer opportunities
• Market gaps analysis

📍 *Where:* Only on Leke Leke (not WhatsApp, not Twitter, not LinkedIn)

🔐 *Why exclusive?*
Because Leke Leke is OUR platform. Built by us, FOR us.

If you want this intel, you MUST follow:
👉 https://www.lekeelekee.com/u/amd

⏰ *First Playbook drops Sunday 8 PM WAT*

Don't miss out. 🔥

#SundayPlaybook #LekeLekee #BuildInAfrica"""

    return message

def main():
    """Generate all onboarding messages"""
    print("=" * 70)
    print("LEKE LEKE ONBOARDING MESSAGE GENERATOR")
    print("=" * 70)
    
    print("\n📱 MESSAGE 1: General Onboarding (Post in War Room NOW)")
    print("-" * 70)
    print(generate_onboarding_message())
    
    print("\n\n📍 MESSAGE 2: State Spotlight Activation (Example: Lagos)")
    print("-" * 70)
    print(generate_state_spotlight_activation("Lagos"))
    
    print("\n\n🔐 MESSAGE 3: Exclusive Content Announcement")
    print("-" * 70)
    print(generate_exclusive_content_announcement())
    
    print("\n" + "=" * 70)
    print("✅ COPY THESE MESSAGES AND POST TO:")
    print("- WhatsApp War Room")
    print("- Your personal status")
    print("- LinkedIn/Twitter (adapt formatting)")
    print("=" * 70)

if __name__ == "__main__":
    main()
