#!/usr/bin/env python3
"""
WhatsApp Empire Setup
Initializes all databases and creates sample data
Run this first before using the system
"""

import sqlite3
from pathlib import Path
from datetime import datetime

def setup_whatsapp_database():
    """Create WhatsApp contacts database with sample data"""
    base_dir = Path(__file__).parent
    db_path = base_dir / "whatsapp_contacts.db"
    
    print("📱 Setting up WhatsApp database...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create contacts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            company TEXT,
            industry TEXT,
            notes TEXT,
            date_added TEXT
        )
    ''')
    
    # Create broadcasts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message_template TEXT,
            created_at TEXT,
            status TEXT
        )
    ''')
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            broadcast_id INTEGER,
            contact_id INTEGER,
            personalized_message TEXT,
            sent_at TEXT,
            status TEXT,
            FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id),
            FOREIGN KEY (contact_id) REFERENCES contacts(id)
        )
    ''')
    
    # Create integration log table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS integration_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            source TEXT,
            action TEXT,
            contact_id INTEGER,
            details TEXT,
            status TEXT
        )
    ''')
    
    # Create channel metrics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS channel_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            followers INTEGER,
            posts INTEGER,
            views INTEGER,
            reactions INTEGER,
            inquiries INTEGER,
            conversions INTEGER,
            revenue REAL
        )
    ''')
    
    # Add sample contacts
    sample_contacts = [
        # DEMO DATA DISABLED - Import real contacts only
        # ("Sample Contact", "+234 818 002 1007", "AMD Solutions", "Technology", "Real client")
    ]
    
    for name, phone, company, industry, notes in sample_contacts:
        cursor.execute('''
            INSERT OR IGNORE INTO contacts (name, phone, company, industry, notes, date_added)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, phone, company, industry, notes, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    
    print("✅ WhatsApp database initialized!")
    print(f"   Location: {db_path}")
    print(f"   Sample contacts: {len(sample_contacts)}")
    
    return db_path


def setup_client_bot_integration():
    """Create inquiries file for client bot integration"""
    base_dir = Path(__file__).parent.parent
    client_bot_dir = base_dir / "client_bot"
    
    if not client_bot_dir.exists():
        print("⚠️  Client bot directory not found")
        print(f"   Expected: {client_bot_dir}")
        return False
    
    inquiries_file = client_bot_dir / "inquiries.json"
    
    if not inquiries_file.exists():
        print("📝 Creating inquiries file for client bot...")
        import json
        with open(inquiries_file, 'w') as f:
            json.dump([], f, indent=2)
        print("✅ Inquiries file created!")
    else:
        print("✅ Inquiries file already exists")
    
    return True


def check_lead_engine():
    """Check if lead engine is set up"""
    base_dir = Path(__file__).parent.parent
    lead_engine_dir = base_dir / "lead_engine"
    leads_db = lead_engine_dir / "leads.db"
    
    if not lead_engine_dir.exists():
        print("⚠️  Lead engine directory not found")
        print(f"   Expected: {lead_engine_dir}")
        return False
    
    if not leads_db.exists():
        print("⚠️  Lead engine database not initialized")
        print("💡 Run lead_engine/scrape_leads.py to create database")
        return False
    
    print("✅ Lead engine ready for integration")
    return True


def create_quick_reference():
    """Create a quick reference card"""
    base_dir = Path(__file__).parent
    ref_file = base_dir / "QUICK_REFERENCE.txt"
    
    content = """
╔════════════════════════════════════════════════════════════╗
║         WHATSAPP EMPIRE - QUICK REFERENCE CARD             ║
╚════════════════════════════════════════════════════════════╝

📱 SETUP WHATSAPP ON MAC:
   1. Download: https://www.whatsapp.com/download
   2. Enter number: +234 906 855 9191
   3. Get SMS code on small phone
   4. Enter code on Mac
   5. ✅ Done! All contacts synced

🚀 DAILY TASKS:
   
   Morning (9 AM):
   - Check WhatsApp responses
   - Reply to hot leads
   
   Afternoon (2 PM):
   - python3 channel_generator.py
   - Copy content to channel
   
   Evening (6 PM):
   - Send broadcast (256 contacts)
   - Track responses

📊 AUTOMATION TOOLS:
   
   Generate content:
   $ python3 channel_generator.py
   
   Manage broadcasts:
   $ python3 broadcast_system.py
   
   Sync systems:
   $ python3 whatsapp_integration.py

💰 REVENUE TARGETS:
   
   Week 1: ₦2M - ₦5M
   Week 2: ₦4M - ₦10M (School fees DONE!)
   Month 1: ₦20M - ₦50M
   Month 3: ₦50M - ₦150M

🎯 WEEKLY MILESTONES:
   
   [  ] Day 1: WhatsApp on Mac
   [  ] Day 2: First broadcast (256 contacts)
   [  ] Day 3: Create channel
   [  ] Day 4: First channel post
   [  ] Day 5: 10+ responses
   [  ] Day 6: 5+ meetings booked
   [  ] Day 7: First deal closed!

📚 DOCUMENTATION:
   
   - README.md (System overview)
   - QUICK_START.md (Step-by-step guide)
   - COMPLETE_WHATSAPP_GUIDE.md (Full strategy)

🆘 HELP:
   
   SMS code not coming? Wait 2-3 min, try "Call instead"
   Contacts not syncing? Wait 10 min, restart WhatsApp
   Broadcast not delivered? Recipients must save your number

💪 YOUR POWER:
   
   You have: Thousands of contacts
   Worth: ₦50M+ in revenue
   Time to unlock: This week!
   
   LET'S GO! 🚀

╚════════════════════════════════════════════════════════════╝
"""
    
    with open(ref_file, 'w') as f:
        f.write(content)
    
    print(f"✅ Quick reference created: {ref_file.name}")
    return ref_file


def main():
    """Run complete setup"""
    print("\n" + "="*60)
    print("WHATSAPP EMPIRE SETUP")
    print("="*60)
    print()
    
    # 1. Setup database
    db_path = setup_whatsapp_database()
    print()
    
    # 2. Check integrations
    print("🔗 Checking integrations...")
    client_bot_ready = setup_client_bot_integration()
    lead_engine_ready = check_lead_engine()
    print()
    
    # 3. Create reference card
    ref_file = create_quick_reference()
    print()
    
    # 4. Summary
    print("="*60)
    print("✅ SETUP COMPLETE!")
    print("="*60)
    print()
    print("📁 Files created:")
    print(f"   - {db_path.name} (WhatsApp database)")
    print(f"   - {ref_file.name} (Quick reference)")
    print()
    print("🔗 Integration status:")
    print(f"   - Client Bot: {'✅ Ready' if client_bot_ready else '⚠️ Not found'}")
    print(f"   - Lead Engine: {'✅ Ready' if lead_engine_ready else '⚠️ Not initialized'}")
    print()
    print("📱 NEXT STEPS:")
    print()
    print("1. Install WhatsApp on Mac:")
    print("   open https://www.whatsapp.com/download")
    print()
    print("2. Read quick start guide:")
    print("   cat QUICK_START.md")
    print()
    print("3. Generate first content:")
    print("   python3 channel_generator.py")
    print()
    print("4. Start generating revenue!")
    print("   Target: ₦4M in Week 2! 🎯")
    print()
    print("="*60)
    print("YOU'RE READY TO LAUNCH! 🚀")
    print("="*60)
    print()


if __name__ == "__main__":
    main()
