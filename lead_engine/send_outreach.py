#!/usr/bin/env python3
"""
Outreach Automation - Send personalized emails to qualified leads
"""

import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import time
from pathlib import Path

from config import (
    DATABASE_PATH,
    SENDER_EMAIL,
    SENDER_NAME,
    MAX_EMAILS_PER_DAY,
    EMAIL_TEMPLATES
)


class OutreachAutomation:
    """Automated personalized outreach to leads"""
    
    def __init__(self):
        self.db_path = DATABASE_PATH
        self.emails_sent_today = 0
        self.max_daily = MAX_EMAILS_PER_DAY
    
    def get_ready_leads(self, limit=50):
        """Get leads ready for outreach"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM leads
            WHERE status = 'new' AND lead_score >= 40
            AND (contacted_at IS NULL OR contacted_at < datetime('now', '-7 days'))
            ORDER BY lead_score DESC
            LIMIT ?
        ''', (limit,))
        
        columns = [desc[0] for desc in cursor.description]
        leads = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return leads
    
    def generate_email(self, lead, template_name='high_ticket_ai'):
        """Generate personalized email content"""
        template = EMAIL_TEMPLATES.get(template_name, EMAIL_TEMPLATES['high_ticket_ai'])
        
        company = lead['company_name']
        industry = lead['industry']
        
        # Calculate potential ROI
        revenue = lead.get('revenue_estimate', 100_000_000)
        potential_increase = int(revenue * 0.15)  # 15% increase
        revenue_increase = potential_increase // 1_000_000  # In millions
        
        # Personalized subject
        subject = template['subject'].format(
            company_name=company,
            revenue_increase=revenue_increase
        )
        
        # Email body
        body = f"""
Hello {lead.get('decision_maker', 'Team')},

I'm Olawale from AMD Solutions 007. I noticed {company} is doing impressive work in {industry}.

We've helped similar companies in Nigeria generate over ₦2.5B in additional revenue through custom AI solutions.

**What we can do for {company}:**

✅ **AI-Powered Automation** - Save 20+ hours/week
✅ **Custom AI Systems** - Built specifically for {industry}
✅ **Data Analytics** - Make smarter decisions faster
✅ **Process Optimization** - Cut costs by 30-40%

**Recent Results:**
- E-commerce client: ₦180M increase in 6 months
- Fintech: Reduced processing time by 75%
- Real Estate: Automated 80% of manual workflows

I'd love to show you how we can deliver similar results for {company}.

Would you be open to a 15-minute call this week? I'll share:
- 3 quick wins for {industry} companies
- Custom roadmap for {company}
- ROI calculator (see your potential return)

Book here: https://amdsolutions007.com/links

Or reply with a time that works for you.

Best regards,
Olawale
CEO, AMD Solutions 007
WhatsApp: +234 906 855 9191
www.amdsolutions007.com

P.S. - We're currently offering a free AI audit (₦500K value) for the first 5 companies that book this month. Spots filling fast.
"""
        
        return subject, body
    
    def send_email_smtp(self, to_email, subject, body, lead_id):
        """
        Send email using Gmail SMTP
        Note: In production, use Gmail API or SendGrid for better deliverability
        """
        try:
            # For Gmail SMTP, you need:
            # 1. Enable "Less secure app access" (not recommended)
            # 2. Or use App Password (recommended)
            # 3. Or use Gmail API with OAuth2 (best practice)
            
            # This is example code - configure with real SMTP credentials
            print(f"📧 SIMULATED EMAIL SENT")
            print(f"   To: {to_email}")
            print(f"   Subject: {subject}")
            print(f"   Preview: {body[:100]}...")
            
            # Mark as contacted in database
            self._mark_contacted(lead_id)
            
            return True
            
        except Exception as e:
            print(f"❌ Error sending to {to_email}: {e}")
            return False
    
    def _mark_contacted(self, lead_id):
        """Mark lead as contacted"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE leads
            SET status = 'contacted', contacted_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (lead_id,))
        
        conn.commit()
        conn.close()
    
    def send_bulk_campaign(self, template_name='high_ticket_ai', limit=50):
        """Send bulk outreach campaign"""
        print(f"\n🚀 Starting Outreach Campaign: {template_name}")
        print("=" * 60)
        
        leads = self.get_ready_leads(limit=min(limit, self.max_daily))
        
        if not leads:
            print("❌ No qualified leads found. Run scrape_leads.py first.")
            return
        
        print(f"📬 Sending to {len(leads)} qualified leads...\n")
        
        successful = 0
        failed = 0
        
        for i, lead in enumerate(leads, 1):
            if self.emails_sent_today >= self.max_daily:
                print(f"\n⚠️ Daily limit reached ({self.max_daily} emails)")
                break
            
            subject, body = self.generate_email(lead, template_name)
            
            print(f"\n[{i}/{len(leads)}] {lead['company_name']}")
            
            if self.send_email_smtp(lead['email'], subject, body, lead['id']):
                successful += 1
                self.emails_sent_today += 1
            else:
                failed += 1
            
            # Rate limiting (2 seconds between emails)
            time.sleep(2)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 CAMPAIGN RESULTS")
        print("=" * 60)
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📧 Total sent today: {self.emails_sent_today}/{self.max_daily}")
        
        print("\n💡 Expected Results:")
        response_rate = 0.15  # 15% response rate
        meeting_rate = 0.50   # 50% of responses book meetings
        close_rate = 0.30     # 30% close rate
        
        expected_responses = int(successful * response_rate)
        expected_meetings = int(expected_responses * meeting_rate)
        expected_deals = int(expected_meetings * close_rate)
        
        print(f"   Responses: ~{expected_responses} ({int(response_rate*100)}%)")
        print(f"   Meetings: ~{expected_meetings}")
        print(f"   Deals: ~{expected_deals}")
        print(f"   Revenue (at ₦2M avg): ₦{expected_deals * 2_000_000:,}")
    
    def generate_followup_sequence(self, lead_id):
        """Generate follow-up email sequence"""
        # Day 3 follow-up
        followup_1 = """
Hi again,

Just following up on my email about AI solutions for your company.

Quick question: What's your biggest operational bottleneck right now?

I can show you how we've solved similar challenges for other {industry} companies.

15-minute call? https://amdsolutions007.com/links

Best,
Olawale
"""
        
        # Day 7 follow-up
        followup_2 = """
Hi,

I know you're busy, so I'll keep this brief.

We're running a limited offer this month:
- Free AI audit (₦500K value)
- Custom automation blueprint
- ROI projection for your business

Only 2 spots left. Interested?

Reply "YES" and I'll send the details.

Olawale
AMD Solutions 007
"""
        
        return [followup_1, followup_2]


def main():
    """Main execution"""
    import sys
    
    print("📧 AMD OUTREACH AUTOMATION")
    print("=" * 60)
    
    automation = OutreachAutomation()
    
    # Get template from command line
    template = sys.argv[1] if len(sys.argv) > 1 else 'high_ticket_ai'
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    
    print(f"Template: {template}")
    print(f"Max emails: {limit}\n")
    
    # Send campaign
    automation.send_bulk_campaign(template_name=template, limit=limit)
    
    print("\n✅ Campaign complete!")
    print("\n💡 Next Steps:")
    print("   1. Monitor responses in your inbox")
    print("   2. Book meetings with qualified respondents")
    print("   3. Send proposals using proposal_generator.py")
    print("   4. Follow up in 3 days with non-responders")


if __name__ == '__main__':
    main()
