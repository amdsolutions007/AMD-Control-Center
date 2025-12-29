#!/usr/bin/env python3
"""
WhatsApp Broadcast Automation System
Sends personalized messages to thousands of contacts
"""

import csv
import json
import time
from datetime import datetime
from pathlib import Path
import sqlite3


class WhatsAppBroadcaster:
    """Automated WhatsApp broadcast system"""
    
    def __init__(self):
        self.data_dir = Path(__file__).parent / 'data'
        self.data_dir.mkdir(exist_ok=True)
        self.db_path = self.data_dir / 'whatsapp_contacts.db'
        self._init_database()
    
    def _init_database(self):
        """Initialize contacts database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                phone TEXT UNIQUE,
                company TEXT,
                industry TEXT,
                last_contacted DATE,
                response_status TEXT,
                tags TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS broadcasts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_name TEXT,
                message_template TEXT,
                contacts_count INTEGER,
                sent_count INTEGER DEFAULT 0,
                delivered_count INTEGER DEFAULT 0,
                read_count INTEGER DEFAULT 0,
                replied_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'draft'
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                broadcast_id INTEGER,
                contact_id INTEGER,
                message TEXT,
                sent_at TIMESTAMP,
                delivered_at TIMESTAMP,
                read_at TIMESTAMP,
                replied_at TIMESTAMP,
                status TEXT DEFAULT 'pending',
                FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id),
                FOREIGN KEY (contact_id) REFERENCES contacts(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def import_contacts_from_csv(self, csv_file):
        """Import contacts from CSV file"""
        print(f"\n📥 Importing contacts from {csv_file}...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        imported = 0
        skipped = 0
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                try:
                    cursor.execute('''
                        INSERT INTO contacts (name, phone, company, industry)
                        VALUES (?, ?, ?, ?)
                    ''', (
                        row.get('name', ''),
                        row.get('phone', ''),
                        row.get('company', ''),
                        row.get('industry', '')
                    ))
                    imported += 1
                except sqlite3.IntegrityError:
                    skipped += 1  # Duplicate phone
        
        conn.commit()
        conn.close()
        
        print(f"✅ Imported: {imported} contacts")
        print(f"⚠️ Skipped: {skipped} duplicates")
        
        return imported
    
    def create_broadcast_lists(self):
        """Create organized broadcast lists"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get total contacts
        cursor.execute('SELECT COUNT(*) FROM contacts')
        total = cursor.fetchone()[0]
        
        print(f"\n📋 Creating Broadcast Lists from {total} contacts...")
        
        # Split into lists of 256 (WhatsApp limit)
        lists = []
        batch_size = 256
        
        cursor.execute('SELECT * FROM contacts ORDER BY name')
        columns = [desc[0] for desc in cursor.description]
        all_contacts = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        for i in range(0, len(all_contacts), batch_size):
            batch = all_contacts[i:i+batch_size]
            list_num = (i // batch_size) + 1
            
            lists.append({
                'name': f'Broadcast List {list_num}',
                'contacts': batch,
                'count': len(batch)
            })
        
        conn.close()
        
        print(f"✅ Created {len(lists)} broadcast lists")
        for i, lst in enumerate(lists, 1):
            print(f"   List {i}: {lst['count']} contacts")
        
        return lists
    
    def create_campaign(self, name, template, target_list=None):
        """Create broadcast campaign"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get contacts
        if target_list:
            contacts = target_list
        else:
            cursor.execute('SELECT * FROM contacts')
            columns = [desc[0] for desc in cursor.description]
            contacts = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Create campaign
        cursor.execute('''
            INSERT INTO broadcasts (campaign_name, message_template, contacts_count)
            VALUES (?, ?, ?)
        ''', (name, template, len(contacts)))
        
        campaign_id = cursor.lastrowid
        
        # Create messages for each contact
        for contact in contacts:
            personalized_msg = self._personalize_message(template, contact)
            
            cursor.execute('''
                INSERT INTO messages (broadcast_id, contact_id, message)
                VALUES (?, ?, ?)
            ''', (campaign_id, contact['id'], personalized_msg))
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Campaign Created: {name}")
        print(f"   Contacts: {len(contacts)}")
        print(f"   Campaign ID: {campaign_id}")
        
        return campaign_id
    
    def _personalize_message(self, template, contact):
        """Personalize message with contact info"""
        message = template
        
        # Replace placeholders
        message = message.replace('{name}', contact.get('name', 'there'))
        message = message.replace('{Name}', contact.get('name', 'there'))
        message = message.replace('{company}', contact.get('company', 'your company'))
        message = message.replace('{Company}', contact.get('company', 'your company'))
        message = message.replace('{industry}', contact.get('industry', 'your industry'))
        
        return message
    
    def send_campaign(self, campaign_id, delay=30):
        """
        Send campaign (SIMULATED - In production, integrate with WhatsApp API)
        
        delay: seconds between messages (avoid spam detection)
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get campaign
        cursor.execute('SELECT * FROM broadcasts WHERE id = ?', (campaign_id,))
        campaign = dict(zip([d[0] for d in cursor.description], cursor.fetchone()))
        
        print(f"\n📤 Sending Campaign: {campaign['campaign_name']}")
        print(f"   Total Messages: {campaign['contacts_count']}")
        print(f"   Delay: {delay} seconds between messages")
        print()
        
        # Get messages
        cursor.execute('''
            SELECT m.*, c.name, c.phone 
            FROM messages m
            JOIN contacts c ON m.contact_id = c.id
            WHERE m.broadcast_id = ? AND m.status = 'pending'
        ''', (campaign_id,))
        
        columns = [d[0] for d in cursor.description]
        messages = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        sent = 0
        
        for msg in messages:
            # SIMULATED SEND (In production, use WhatsApp API here)
            print(f"[{sent+1}/{len(messages)}] Sending to {msg['name']} ({msg['phone']})...")
            print(f"   Message: {msg['message'][:50]}...")
            
            # Update status
            cursor.execute('''
                UPDATE messages
                SET status = 'sent', sent_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (msg['id'],))
            
            # Update contact
            cursor.execute('''
                UPDATE contacts
                SET last_contacted = CURRENT_DATE
                WHERE id = ?
            ''', (msg['contact_id'],))
            
            sent += 1
            
            # Commit periodically
            if sent % 10 == 0:
                conn.commit()
            
            # Rate limiting
            if delay > 0 and sent < len(messages):
                print(f"   ⏳ Waiting {delay} seconds...")
                time.sleep(delay)
        
        # Update campaign
        cursor.execute('''
            UPDATE broadcasts
            SET sent_count = ?, status = 'sent'
            WHERE id = ?
        ''', (sent, campaign_id))
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Campaign Sent!")
        print(f"   Total Sent: {sent}")
        print(f"   Time Taken: {(sent * delay) / 60:.1f} minutes")
        
        return sent
    
    def get_campaign_stats(self, campaign_id):
        """Get campaign statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Campaign info
        cursor.execute('SELECT * FROM broadcasts WHERE id = ?', (campaign_id,))
        campaign = dict(zip([d[0] for d in cursor.description], cursor.fetchone()))
        
        # Message stats
        cursor.execute('''
            SELECT status, COUNT(*) as count
            FROM messages
            WHERE broadcast_id = ?
            GROUP BY status
        ''', (campaign_id,))
        
        stats = dict(cursor.fetchall())
        
        conn.close()
        
        return {
            'campaign': campaign,
            'stats': stats
        }
    
    def export_contacts_to_csv(self, filename='whatsapp_contacts.csv'):
        """Export all contacts to CSV"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT name, phone, company, industry FROM contacts')
        contacts = cursor.fetchall()
        
        conn.close()
        
        filepath = self.data_dir / filename
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['name', 'phone', 'company', 'industry'])
            writer.writerows(contacts)
        
        print(f"✅ Exported {len(contacts)} contacts to: {filepath}")
        return filepath


# Message Templates
MESSAGE_TEMPLATES = {
    'ai_services': """Hi {name}! 👋

Quick update from AMD Solutions 007:

We just helped a Lagos company generate ₦180M through AI automation.

Want to see if we can do the same for {company}?

Reply "YES" for a free 15-min consultation.

- Olawale
CEO, AMD Solutions 007
📞 0818 002 1007
www.amdsolutions007.com""",
    
    'limited_offer': """{name}, exclusive offer for you:

🎁 FREE AI Audit (₦500K value)
⚡ Only 3 spots left this month

We'll show you exactly how to:
- Save 20+ hours/week
- Cut costs by 30%
- Increase revenue by 15%+

Interested? Reply "AUDIT"

AMD Solutions 007
www.amdsolutions007.com""",
    
    'follow_up': """Hi {name},

Following up on my message about AI solutions.

Quick question: What's your biggest business challenge right now?

I can show you how we've solved it for similar companies.

Reply or call: 0906 855 9191

Best,
Olawale""",
    
    'case_study': """Hi {name}! 👋

Thought you'd be interested in this:

We helped {industry} company in Lagos:
- Generate ₦180M in 6 months
- Automate 75% of operations
- Save 20+ hours weekly

Investment: ₦2.5M
ROI: 5.8x

Want similar results for {company}?

Call me: 0906 855 9191

Olawale
AMD Solutions 007"""
}


def main():
    """Demo usage"""
    print("📱 WHATSAPP BROADCAST AUTOMATION")
    print("=" * 60)
    
    broadcaster = WhatsAppBroadcaster()
    
    # Demo: Create sample contacts
    print("\n📝 Creating sample contacts...")
    conn = sqlite3.connect(broadcaster.db_path)
    cursor = conn.cursor()
    
    sample_contacts = [
        # DEMO DATA DISABLED - Use real contacts from database only
        # ('Sample Contact', '+234 818 002 1007', 'AMD Solutions', 'Technology'),
    ]
    
    for contact in sample_contacts:
        try:
            cursor.execute('''
                INSERT INTO contacts (name, phone, company, industry)
                VALUES (?, ?, ?, ?)
            ''', contact)
        except:
            pass  # Skip duplicates
    
    conn.commit()
    conn.close()
    
    print("✅ Sample contacts created")
    
    # Create broadcast lists
    lists = broadcaster.create_broadcast_lists()
    
    # Create campaign
    campaign_id = broadcaster.create_campaign(
        name='AI Services Introduction',
        template=MESSAGE_TEMPLATES['ai_services']
    )
    
    # Show what would be sent (don't actually send in demo)
    print("\n📋 CAMPAIGN PREVIEW:")
    print("=" * 60)
    
    conn = sqlite3.connect(broadcaster.db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT m.message, c.name, c.phone
        FROM messages m
        JOIN contacts c ON m.contact_id = c.id
        WHERE m.broadcast_id = ?
        LIMIT 3
    ''', (campaign_id,))
    
    for msg, name, phone in cursor.fetchall():
        print(f"\nTo: {name} ({phone})")
        print(f"Message:\n{msg}")
        print("-" * 60)
    
    conn.close()
    
    print("\n💡 To actually send:")
    print(f"   broadcaster.send_campaign({campaign_id}, delay=30)")
    print()
    print("⚠️ IMPORTANT: This is a simulation!")
    print("   For real sending, integrate with:")
    print("   - WhatsApp Business API")
    print("   - Twilio WhatsApp API")
    print("   - Or WhatsApp Web automation")


if __name__ == '__main__':
    main()
