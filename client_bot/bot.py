#!/usr/bin/env python3
"""
Client Acquisition Bot - Main Controller
Handles all incoming inquiries automatically
"""

import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path
import re

from config import (
    INITIAL_RESPONSE,
    QUALIFIED_RESPONSE,
    HIGH_VALUE_ALERT,
    QUALIFICATION_SCORING,
    MIN_QUALIFICATION_SCORE,
    DATABASE_PATH,
    SERVICE_MAPPING,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_SALES_CHAT_ID,
    CEO_WHATSAPP
)


class ClientAcquisitionBot:
    """Intelligent bot for handling client inquiries"""
    
    def __init__(self):
        self.db_path = DATABASE_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()
    
    def _init_database(self):
        """Initialize database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                phone TEXT,
                company TEXT,
                message TEXT,
                budget TEXT,
                timeline TEXT,
                source TEXT,
                qualification_score INTEGER DEFAULT 0,
                status TEXT DEFAULT 'new',
                auto_responded BOOLEAN DEFAULT 0,
                meeting_booked BOOLEAN DEFAULT 0,
                proposal_sent BOOLEAN DEFAULT 0,
                deal_closed BOOLEAN DEFAULT 0,
                deal_value INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                responded_at TIMESTAMP,
                notes TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inquiry_id INTEGER,
                message TEXT,
                sender TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def process_inquiry(self, inquiry_data):
        """Process new inquiry"""
        print(f"\n📥 New inquiry from {inquiry_data.get('name', 'Unknown')}")
        
        # Save to database
        inquiry_id = self._save_inquiry(inquiry_data)
        
        # Calculate qualification score
        score = self._calculate_qualification_score(inquiry_data)
        
        # Update score
        self._update_qualification_score(inquiry_id, score)
        
        # Determine response type
        if score >= 70:
            # High-value lead - escalate to human immediately
            self._escalate_to_human(inquiry_id, inquiry_data)
            response = self._generate_high_value_response(inquiry_data)
        elif score >= MIN_QUALIFICATION_SCORE:
            # Qualified - send detailed response
            response = self._generate_qualified_response(inquiry_data)
        else:
            # Not qualified yet - ask qualifying questions
            response = self._generate_initial_response(inquiry_data)
        
        # Send response
        self._send_response(inquiry_id, inquiry_data, response)
        
        # Mark as responded
        self._mark_responded(inquiry_id)
        
        return inquiry_id, response
    
    def _save_inquiry(self, data):
        """Save inquiry to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO inquiries (
                name, email, phone, company, message, 
                budget, timeline, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('name'),
            data.get('email'),
            data.get('phone'),
            data.get('company'),
            data.get('message'),
            data.get('budget'),
            data.get('timeline'),
            data.get('source', 'unknown')
        ))
        
        inquiry_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return inquiry_id
    
    def _calculate_qualification_score(self, data):
        """Calculate lead qualification score"""
        score = 0
        
        # Has budget information
        if data.get('budget'):
            score += QUALIFICATION_SCORING['has_budget']
            
            # Budget amount
            if '1M' in str(data.get('budget', '')):
                score += QUALIFICATION_SCORING['budget_over_1m']
            if '3M' in str(data.get('budget', '')):
                score += QUALIFICATION_SCORING['budget_over_3m']
        
        # Timeline
        if data.get('timeline') in ['immediate', 'within_1_month']:
            score += QUALIFICATION_SCORING['immediate_need']
        
        # Company provided
        if data.get('company'):
            score += QUALIFICATION_SCORING['company_size_large']
        
        # Full contact info
        if data.get('email') and data.get('phone'):
            score += QUALIFICATION_SCORING['filled_full_form']
        
        # Source quality
        if data.get('source') == 'linkedin':
            score += QUALIFICATION_SCORING['from_linkedin']
        
        return score
    
    def _update_qualification_score(self, inquiry_id, score):
        """Update qualification score"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE inquiries
            SET qualification_score = ?
            WHERE id = ?
        ''', (score, inquiry_id))
        
        conn.commit()
        conn.close()
    
    def _generate_initial_response(self, data):
        """Generate initial qualifying response"""
        return INITIAL_RESPONSE.format(
            name=data.get('name', 'there')
        )
    
    def _generate_qualified_response(self, data):
        """Generate response for qualified leads"""
        # Identify service needed
        service = self._identify_service(data.get('message', ''))
        
        return QUALIFIED_RESPONSE.format(
            challenge=data.get('message', 'your business challenge'),
            budget=data.get('budget', 'your budget'),
            timeline=data.get('timeline', 'your timeline'),
            service=service['package']
        )
    
    def _generate_high_value_response(self, data):
        """Generate response for high-value leads"""
        return f"""
Hi {data.get('name', 'there')}! 👋

Thanks for reaching out about {data.get('message', 'AI solutions')}.

Based on your project scope, I'm connecting you directly with our CEO, Olawale.

He'll call you within the next 30 minutes at {data.get('phone', 'your number')}.

In the meantime:
📊 View our case studies: https://amdsolutions007.com
💼 See our portfolio: https://amdsolutions007.com/portfolio

Talk soon! 🚀
"""
    
    def _identify_service(self, message):
        """Identify which service is needed"""
        message_lower = message.lower()
        
        for service_type, service_info in SERVICE_MAPPING.items():
            for keyword in service_info['keywords']:
                if keyword in message_lower:
                    return service_info
        
        # Default to AI development
        return SERVICE_MAPPING['ai_development']
    
    def _escalate_to_human(self, inquiry_id, data):
        """Alert human for high-value lead"""
        alert = HIGH_VALUE_ALERT.format(
            name=data.get('name', 'Unknown'),
            company=data.get('company', 'Unknown'),
            budget=data.get('budget', 'Unknown'),
            challenge=data.get('message', 'Unknown'),
            source=data.get('source', 'Unknown'),
            phone=data.get('phone', 'Unknown')
        )
        
        print(f"\n🚨 HIGH-VALUE LEAD ESCALATION:")
        print(alert)
        
        # Send to Telegram
        self._send_telegram_alert(alert)
        
        # Mark for human follow-up
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE inquiries
            SET status = 'escalated', notes = 'High-value lead - human follow-up required'
            WHERE id = ?
        ''', (inquiry_id,))
        conn.commit()
        conn.close()
    
    def _send_telegram_alert(self, message):
        """Send alert to Telegram"""
        try:
            import requests
            
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            data = {
                'chat_id': TELEGRAM_SALES_CHAT_ID,
                'text': message,
                'parse_mode': 'Markdown'
            }
            
            response = requests.post(url, json=data)
            
            if response.status_code == 200:
                print("✅ Alert sent to Telegram")
            else:
                print(f"❌ Failed to send Telegram alert: {response.text}")
        
        except Exception as e:
            print(f"❌ Error sending Telegram alert: {e}")
    
    def _send_response(self, inquiry_id, data, message):
        """Send response to customer"""
        # In production, this would send via WhatsApp, Email, etc.
        print(f"\n📤 AUTO-RESPONSE SENT:")
        print(f"To: {data.get('name')} ({data.get('email')})")
        print(f"Message:\n{message}\n")
        
        # Save conversation
        self._save_conversation(inquiry_id, message, 'bot')
    
    def _save_conversation(self, inquiry_id, message, sender='bot'):
        """Save conversation to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversations (inquiry_id, message, sender)
            VALUES (?, ?, ?)
        ''', (inquiry_id, message, sender))
        
        conn.commit()
        conn.close()
    
    def _mark_responded(self, inquiry_id):
        """Mark inquiry as responded"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE inquiries
            SET auto_responded = 1, responded_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (inquiry_id,))
        
        conn.commit()
        conn.close()
    
    def get_pending_follow_ups(self):
        """Get inquiries needing follow-up"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Follow up after 4 hours if no response
        cursor.execute('''
            SELECT * FROM inquiries
            WHERE auto_responded = 1
            AND meeting_booked = 0
            AND responded_at < datetime('now', '-4 hours')
            AND status != 'escalated'
        ''')
        
        columns = [desc[0] for desc in cursor.description]
        inquiries = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return inquiries
    
    def send_follow_up(self, inquiry_id):
        """Send follow-up message"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM inquiries WHERE id = ?', (inquiry_id,))
        columns = [desc[0] for desc in cursor.description]
        inquiry = dict(zip(columns, cursor.fetchone()))
        
        conn.close()
        
        follow_up = f"""
Hi {inquiry['name']},

Just following up on my message about your {inquiry['message']}.

Still interested? I can have our CEO call you today.

Reply YES and I'll set it up! 📞
"""
        
        print(f"\n📤 FOLLOW-UP SENT to {inquiry['name']}")
        print(follow_up)


def main():
    """Demo usage"""
    print("🤖 AMD CLIENT ACQUISITION BOT")
    print("=" * 60)
    
    bot = ClientAcquisitionBot()
    
    # Example inquiry 1: High-value
    inquiry_1 = {
        'name': 'Chidi Okafor',
        'email': 'chidi@lagostech.com',
        'phone': '+234 818 002 1007',
        'company': 'Lagos Tech Solutions',
        'message': 'Need AI system to automate our customer service. Processing 10,000+ tickets monthly.',
        'budget': '₦3M+',
        'timeline': 'immediate',
        'source': 'linkedin'
    }
    
    # Example inquiry 2: Medium
    inquiry_2 = {
        'name': 'Amina Ibrahim',
        'email': 'amina@abujafinance.ng',
        'phone': '+234 818 002 1007',
        'company': 'Abuja Finance Group',
        'message': 'Looking for data analytics dashboard',
        'budget': '₦1M - ₦3M',
        'timeline': 'within_1_month',
        'source': 'website'
    }
    
    # Process inquiries
    bot.process_inquiry(inquiry_1)
    time.sleep(2)
    bot.process_inquiry(inquiry_2)
    
    print("\n✅ Bot demo complete!")
    print(f"💡 Database: {bot.db_path}")


if __name__ == '__main__':
    main()
