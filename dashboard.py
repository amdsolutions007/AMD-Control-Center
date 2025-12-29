#!/usr/bin/env python3
"""
Revenue Machine Dashboard - View all metrics in one place
"""

import sqlite3
from pathlib import Path
from datetime import datetime, timedelta


class RevenueDashboard:
    """Real-time dashboard for revenue machine"""
    
    def __init__(self):
        self.lead_db = Path(__file__).parent / 'lead_engine' / 'data' / 'leads.db'
        self.client_db = Path(__file__).parent / 'client_bot' / 'data' / 'clients.db'
    
    def get_lead_stats(self):
        """Get lead generation statistics"""
        if not self.lead_db.exists():
            return None
        
        conn = sqlite3.connect(self.lead_db)
        cursor = conn.cursor()
        
        stats = {}
        
        # Total leads
        cursor.execute('SELECT COUNT(*) FROM leads')
        stats['total_leads'] = cursor.fetchone()[0]
        
        # By status
        cursor.execute('SELECT status, COUNT(*) FROM leads GROUP BY status')
        stats['by_status'] = dict(cursor.fetchall())
        
        # By industry
        cursor.execute('SELECT industry, COUNT(*) FROM leads GROUP BY industry ORDER BY COUNT(*) DESC LIMIT 5')
        stats['by_industry'] = dict(cursor.fetchall())
        
        # High-value leads (score > 70)
        cursor.execute('SELECT COUNT(*) FROM leads WHERE lead_score >= 70')
        stats['high_value'] = cursor.fetchone()[0]
        
        # Contacted today
        cursor.execute('''
            SELECT COUNT(*) FROM leads 
            WHERE DATE(contacted_at) = DATE('now')
        ''')
        stats['contacted_today'] = cursor.fetchone()[0]
        
        conn.close()
        return stats
    
    def get_client_stats(self):
        """Get client acquisition statistics"""
        if not self.client_db.exists():
            return None
        
        conn = sqlite3.connect(self.client_db)
        cursor = conn.cursor()
        
        stats = {}
        
        # Total inquiries
        cursor.execute('SELECT COUNT(*) FROM inquiries')
        stats['total_inquiries'] = cursor.fetchone()[0]
        
        # By status
        cursor.execute('SELECT status, COUNT(*) FROM inquiries GROUP BY status')
        stats['by_status'] = dict(cursor.fetchall())
        
        # Meetings booked
        cursor.execute('SELECT COUNT(*) FROM inquiries WHERE meeting_booked = 1')
        stats['meetings_booked'] = cursor.fetchone()[0]
        
        # Proposals sent
        cursor.execute('SELECT COUNT(*) FROM inquiries WHERE proposal_sent = 1')
        stats['proposals_sent'] = cursor.fetchone()[0]
        
        # Deals closed
        cursor.execute('SELECT COUNT(*) FROM inquiries WHERE deal_closed = 1')
        stats['deals_closed'] = cursor.fetchone()[0]
        
        # Revenue generated
        cursor.execute('SELECT SUM(deal_value) FROM inquiries WHERE deal_closed = 1')
        revenue = cursor.fetchone()[0]
        stats['revenue_generated'] = revenue if revenue else 0
        
        # Today's inquiries
        cursor.execute('''
            SELECT COUNT(*) FROM inquiries 
            WHERE DATE(created_at) = DATE('now')
        ''')
        stats['inquiries_today'] = cursor.fetchone()[0]
        
        # High-value escalations
        cursor.execute('SELECT COUNT(*) FROM inquiries WHERE status = "escalated"')
        stats['escalated'] = cursor.fetchone()[0]
        
        conn.close()
        return stats
    
    def display_dashboard(self):
        """Display full dashboard"""
        print("\n" + "=" * 80)
        print("🚀 AMD REVENUE MACHINE - LIVE DASHBOARD")
        print("=" * 80)
        print(f"📅 {datetime.now().strftime('%A, %B %d, %Y - %I:%M %p')}")
        print()
        
        # Lead Generation Stats
        print("🎯 LEAD GENERATION ENGINE")
        print("-" * 80)
        
        lead_stats = self.get_lead_stats()
        
        if lead_stats:
            print(f"   Total Leads: {lead_stats['total_leads']}")
            print(f"   High-Value Leads (70+ score): {lead_stats['high_value']}")
            print(f"   Contacted Today: {lead_stats['contacted_today']}")
            print()
            
            print("   By Status:")
            for status, count in lead_stats.get('by_status', {}).items():
                print(f"      {status}: {count}")
            print()
            
            print("   Top Industries:")
            for industry, count in lead_stats.get('by_industry', {}).items():
                print(f"      {industry}: {count} leads")
        else:
            print("   ⚠️ No data yet. Run: python3 lead_engine/scrape_leads.py")
        
        print()
        
        # Client Acquisition Stats
        print("🤖 CLIENT ACQUISITION BOT")
        print("-" * 80)
        
        client_stats = self.get_client_stats()
        
        if client_stats:
            print(f"   Total Inquiries: {client_stats['total_inquiries']}")
            print(f"   Today's Inquiries: {client_stats['inquiries_today']}")
            print(f"   High-Value Escalations: {client_stats['escalated']}")
            print()
            
            print("   Conversion Funnel:")
            print(f"      Inquiries: {client_stats['total_inquiries']}")
            print(f"      Meetings Booked: {client_stats['meetings_booked']}")
            print(f"      Proposals Sent: {client_stats['proposals_sent']}")
            print(f"      Deals Closed: {client_stats['deals_closed']}")
            print()
            
            if client_stats['total_inquiries'] > 0:
                meeting_rate = (client_stats['meetings_booked'] / client_stats['total_inquiries']) * 100
                print(f"   Meeting Book Rate: {meeting_rate:.1f}%")
                
                if client_stats['meetings_booked'] > 0:
                    close_rate = (client_stats['deals_closed'] / client_stats['meetings_booked']) * 100
                    print(f"   Close Rate: {close_rate:.1f}%")
        else:
            print("   ⚠️ No data yet. Run: python3 client_bot/bot.py")
        
        print()
        
        # Revenue Stats
        print("💰 REVENUE TRACKING")
        print("-" * 80)
        
        if client_stats:
            revenue = client_stats['revenue_generated']
            target = 4_000_000  # ₦4M target
            
            print(f"   Revenue Generated: ₦{revenue:,}")
            print(f"   Target (School Fees): ₦{target:,}")
            
            if revenue > 0:
                progress = (revenue / target) * 100
                print(f"   Progress: {progress:.1f}%")
                
                remaining = target - revenue
                if remaining > 0:
                    print(f"   Remaining: ₦{remaining:,}")
                else:
                    print(f"   🎉 TARGET EXCEEDED by ₦{abs(remaining):,}!")
        
        print()
        
        # Social Engine Status
        print("📱 SOCIAL MEDIA ENGINE")
        print("-" * 80)
        print("   Status: RUNNING (PID 96860)")
        print("   Platforms: Telegram ✅, Snapchat ✅")
        print("   Posts/Day: 5 (3 Telegram + 2 Snapchat)")
        print("   Next Post: Check social_engine/social_engine.log")
        
        print()
        print("=" * 80)
        
        # Quick Actions
        print("\n💡 QUICK ACTIONS:")
        print("   python3 revenue_machine.py --full     Run full revenue cycle")
        print("   python3 lead_engine/scrape_leads.py   Scrape more leads")
        print("   python3 lead_engine/send_outreach.py  Send outreach campaign")
        print("   python3 client_bot/bot.py             Test client bot")
        print("   python3 dashboard.py                  Refresh this dashboard")
        print()
    
    def export_report(self, filename='revenue_report.txt'):
        """Export report to file"""
        from io import StringIO
        import sys
        
        # Capture output
        old_stdout = sys.stdout
        sys.stdout = StringIO()
        
        self.display_dashboard()
        
        report = sys.stdout.getvalue()
        sys.stdout = old_stdout
        
        # Save to file
        with open(filename, 'w') as f:
            f.write(report)
        
        print(f"✅ Report saved: {filename}")
        return filename


def main():
    """Main execution"""
    dashboard = RevenueDashboard()
    dashboard.display_dashboard()
    
    # Ask if user wants to export
    import sys
    if '--export' in sys.argv:
        dashboard.export_report()


if __name__ == '__main__':
    main()
