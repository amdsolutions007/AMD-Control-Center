#!/usr/bin/env python3
"""
WhatsApp Empire Integration
Connects WhatsApp systems with Revenue Machine

Features:
- Sync WhatsApp contacts to lead database
- Route responses to client bot
- Track channel metrics
- Unified dashboard
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

class WhatsAppIntegration:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.whatsapp_db = self.base_dir / "whatsapp_contacts.db"
        self.leads_db = self.base_dir.parent / "lead_engine" / "leads.db"
        
        self.init_integration_db()
    
    def init_integration_db(self):
        """Initialize integration tracking database"""
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        # Create integration table
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
        
        conn.commit()
        conn.close()
    
    def sync_contacts_to_leads(self):
        """
        Sync WhatsApp contacts to lead engine database
        """
        # Connect to both databases
        whatsapp_conn = sqlite3.connect(self.whatsapp_db)
        whatsapp_cursor = whatsapp_conn.cursor()
        
        # Check if contacts table exists
        whatsapp_cursor.execute('''
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='contacts'
        ''')
        
        if not whatsapp_cursor.fetchone():
            print("⚠️  No WhatsApp contacts database found")
            print("💡 Run broadcast_system.py first to create database")
            whatsapp_conn.close()
            return 0
        
        # Get all WhatsApp contacts
        whatsapp_cursor.execute('''
            SELECT name, phone, company, industry, notes
            FROM contacts
            WHERE phone IS NOT NULL
        ''')
        
        contacts = whatsapp_cursor.fetchall()
        synced_count = 0
        
        # Check if leads database exists
        if not self.leads_db.exists():
            print(f"⚠️  Lead engine database not found: {self.leads_db}")
            print("💡 Run lead_engine/scrape_leads.py first to initialize")
            whatsapp_conn.close()
            return 0
        
        # Connect to leads database
        leads_conn = sqlite3.connect(self.leads_db)
        leads_cursor = leads_conn.cursor()
        
        for contact in contacts:
            name, phone, company, industry, notes = contact
            
            # Check if already exists
            leads_cursor.execute('''
                SELECT id FROM leads WHERE phone = ?
            ''', (phone,))
            
            if leads_cursor.fetchone():
                continue  # Skip duplicates
            
            # Add to leads database
            try:
                leads_cursor.execute('''
                    INSERT INTO leads (
                        company_name, contact_name, phone, 
                        industry, source, status, 
                        date_added, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    company or "Unknown",
                    name,
                    phone,
                    industry or "General",
                    "WhatsApp Contacts",
                    "new",
                    datetime.now().isoformat(),
                    notes or "Imported from WhatsApp"
                ))
                
                synced_count += 1
                
                # Log sync
                whatsapp_cursor.execute('''
                    INSERT INTO integration_log (
                        timestamp, source, action, details, status
                    ) VALUES (?, ?, ?, ?, ?)
                ''', (
                    datetime.now().isoformat(),
                    'whatsapp',
                    'sync_to_leads',
                    f"Synced {name} ({phone})",
                    'success'
                ))
                
            except Exception as e:
                print(f"❌ Error syncing {name}: {e}")
                continue
        
        leads_conn.commit()
        leads_conn.close()
        whatsapp_conn.commit()
        whatsapp_conn.close()
        
        print(f"\n✅ Synced {synced_count} WhatsApp contacts to lead database!")
        return synced_count
    
    def log_broadcast_response(self, contact_phone, message_text, sentiment='positive'):
        """
        Log responses from broadcast messages
        Positive responses go to client bot
        """
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        # Get contact details
        cursor.execute('''
            SELECT id, name, company FROM contacts
            WHERE phone = ?
        ''', (contact_phone,))
        
        contact = cursor.fetchone()
        if not contact:
            conn.close()
            return False
        
        contact_id, name, company = contact
        
        # Log the response
        cursor.execute('''
            INSERT INTO integration_log (
                timestamp, source, action, contact_id, details, status
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            'broadcast',
            'response_received',
            contact_id,
            json.dumps({
                'message': message_text,
                'sentiment': sentiment,
                'name': name,
                'company': company
            }),
            'pending_followup'
        ))
        
        conn.commit()
        conn.close()
        
        # If positive response, send to client bot
        if sentiment == 'positive':
            self.route_to_client_bot(contact_phone, name, company, message_text)
        
        print(f"✅ Logged response from {name}")
        return True
    
    def route_to_client_bot(self, phone, name, company, message):
        """
        Route inquiries to client bot for automated follow-up
        """
        client_bot_dir = self.base_dir.parent / "client_bot"
        inquiries_file = client_bot_dir / "inquiries.json"
        
        # Create inquiry object
        inquiry = {
            'timestamp': datetime.now().isoformat(),
            'source': 'whatsapp_broadcast',
            'phone': phone,
            'name': name,
            'company': company,
            'message': message,
            'status': 'new'
        }
        
        # Load existing inquiries
        if inquiries_file.exists():
            with open(inquiries_file, 'r') as f:
                inquiries = json.load(f)
        else:
            inquiries = []
        
        # Add new inquiry
        inquiries.append(inquiry)
        
        # Save
        with open(inquiries_file, 'w') as f:
            json.dump(inquiries, f, indent=2)
        
        print(f"✅ Routed {name} to client bot for follow-up")
        return True
    
    def log_channel_post(self, content_type, views=0, reactions=0):
        """
        Log channel post for metrics tracking
        """
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        # Update today's metrics
        cursor.execute('''
            SELECT id FROM channel_metrics
            WHERE date = ?
        ''', (today,))
        
        if cursor.fetchone():
            # Update existing
            cursor.execute('''
                UPDATE channel_metrics
                SET posts = posts + 1,
                    views = views + ?,
                    reactions = reactions + ?
                WHERE date = ?
            ''', (views, reactions, today))
        else:
            # Create new
            cursor.execute('''
                INSERT INTO channel_metrics (
                    date, followers, posts, views, reactions, 
                    inquiries, conversions, revenue
                ) VALUES (?, 0, 1, ?, ?, 0, 0, 0)
            ''', (today, views, reactions))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Logged {content_type} post to channel metrics")
        return True
    
    def log_channel_inquiry(self, follower_name, message):
        """
        Log inquiry from channel follower
        """
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        # Update inquiries count
        cursor.execute('''
            UPDATE channel_metrics
            SET inquiries = inquiries + 1
            WHERE date = ?
        ''', (today,))
        
        # Log the inquiry
        cursor.execute('''
            INSERT INTO integration_log (
                timestamp, source, action, details, status
            ) VALUES (?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            'channel',
            'inquiry_received',
            json.dumps({
                'follower': follower_name,
                'message': message
            }),
            'pending_followup'
        ))
        
        conn.commit()
        conn.close()
        
        # Route to client bot
        self.route_to_client_bot(
            phone='from_channel',
            name=follower_name,
            company='Unknown',
            message=message
        )
        
        print(f"✅ Logged inquiry from {follower_name}")
        return True
    
    def update_channel_followers(self, count):
        """
        Update channel follower count
        """
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        cursor.execute('''
            SELECT id FROM channel_metrics
            WHERE date = ?
        ''', (today,))
        
        if cursor.fetchone():
            cursor.execute('''
                UPDATE channel_metrics
                SET followers = ?
                WHERE date = ?
            ''', (count, today))
        else:
            cursor.execute('''
                INSERT INTO channel_metrics (
                    date, followers, posts, views, reactions,
                    inquiries, conversions, revenue
                ) VALUES (?, ?, 0, 0, 0, 0, 0, 0)
            ''', (today, count))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Updated channel followers: {count}")
        return True
    
    def log_conversion(self, source, contact_name, deal_value):
        """
        Log when a WhatsApp contact becomes a paying client
        """
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        # Update metrics
        cursor.execute('''
            UPDATE channel_metrics
            SET conversions = conversions + 1,
                revenue = revenue + ?
            WHERE date = ?
        ''', (deal_value, today))
        
        # Log conversion
        cursor.execute('''
            INSERT INTO integration_log (
                timestamp, source, action, details, status
            ) VALUES (?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            source,
            'conversion',
            json.dumps({
                'client': contact_name,
                'value': deal_value,
                'currency': 'NGN'
            }),
            'success'
        ))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Logged conversion: {contact_name} - ₦{deal_value:,.0f}")
        return True
    
    def get_whatsapp_metrics(self, days=30):
        """
        Get WhatsApp metrics for dashboard
        """
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        # Get metrics for last N days
        cursor.execute('''
            SELECT 
                SUM(followers) as total_followers,
                SUM(posts) as total_posts,
                SUM(views) as total_views,
                SUM(reactions) as total_reactions,
                SUM(inquiries) as total_inquiries,
                SUM(conversions) as total_conversions,
                SUM(revenue) as total_revenue
            FROM channel_metrics
            WHERE date >= date('now', '-' || ? || ' days')
        ''', (days,))
        
        metrics = cursor.fetchone()
        
        # Get total contacts
        cursor.execute('SELECT COUNT(*) FROM contacts')
        total_contacts = cursor.fetchone()[0]
        
        # Get total broadcasts
        cursor.execute('SELECT COUNT(*) FROM broadcasts')
        total_broadcasts = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_contacts': total_contacts,
            'total_broadcasts': total_broadcasts,
            'channel_followers': metrics[0] or 0,
            'channel_posts': metrics[1] or 0,
            'channel_views': metrics[2] or 0,
            'channel_reactions': metrics[3] or 0,
            'channel_inquiries': metrics[4] or 0,
            'channel_conversions': metrics[5] or 0,
            'channel_revenue': metrics[6] or 0
        }
    
    def get_recent_activity(self, limit=10):
        """
        Get recent WhatsApp activity for dashboard
        """
        conn = sqlite3.connect(self.whatsapp_db)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT timestamp, source, action, details, status
            FROM integration_log
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        activities = cursor.fetchall()
        conn.close()
        
        return [
            {
                'timestamp': act[0],
                'source': act[1],
                'action': act[2],
                'details': act[3],
                'status': act[4]
            }
            for act in activities
        ]


def demo():
    """
    Demo integration features
    """
    print("\n" + "="*60)
    print("WHATSAPP INTEGRATION DEMO")
    print("="*60)
    
    integration = WhatsAppIntegration()
    
    # 1. Sync contacts
    print("\n📥 SYNCING WHATSAPP CONTACTS TO LEAD ENGINE...")
    synced = integration.sync_contacts_to_leads()
    
    # 2. Simulate broadcast response
    print("\n📩 SIMULATING BROADCAST RESPONSE...")
    integration.log_broadcast_response(
        contact_phone="+234 818 002 1007",
        message_text="Yes, I'm interested! Please call me.",
        sentiment='positive'
    )
    
    # 3. Log channel post
    print("\n📱 LOGGING CHANNEL POST...")
    integration.log_channel_post(
        content_type='success_story',
        views=250,
        reactions=45
    )
    
    # 4. Log channel inquiry
    print("\n💬 LOGGING CHANNEL INQUIRY...")
    integration.log_channel_inquiry(
        follower_name="Chioma Adebayo",
        message="How much for full automation setup?"
    )
    
    # 5. Update follower count
    print("\n👥 UPDATING FOLLOWER COUNT...")
    integration.update_channel_followers(count=1247)
    
    # 6. Log conversion
    print("\n💰 LOGGING CONVERSION...")
    integration.log_conversion(
        source='broadcast',
        contact_name='Tunde Bakare',
        deal_value=2500000
    )
    
    # 7. Get metrics
    print("\n📊 WHATSAPP METRICS (Last 30 days):")
    print("-" * 60)
    metrics = integration.get_whatsapp_metrics(days=30)
    for key, value in metrics.items():
        if 'revenue' in key:
            print(f"{key}: ₦{value:,.2f}")
        else:
            print(f"{key}: {value}")
    
    # 8. Get recent activity
    print("\n📜 RECENT ACTIVITY:")
    print("-" * 60)
    activities = integration.get_recent_activity(limit=5)
    for act in activities:
        print(f"\n[{act['timestamp']}]")
        print(f"Source: {act['source']} | Action: {act['action']}")
        print(f"Status: {act['status']}")
    
    print("\n" + "="*60)
    print("✅ INTEGRATION DEMO COMPLETE!")
    print("="*60)
    print("\n💡 Integration connects:")
    print("   - WhatsApp contacts → Lead engine")
    print("   - Broadcast responses → Client bot")
    print("   - Channel inquiries → Client bot")
    print("   - All metrics → Master dashboard")
    print("\n🚀 All systems connected and working together!")


if __name__ == "__main__":
    demo()
