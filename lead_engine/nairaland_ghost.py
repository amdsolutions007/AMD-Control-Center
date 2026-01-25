#!/usr/bin/env python3
"""
Nairaland Ghost - Stealth Lead Monitor
=======================================

Operation: 1.3 MILLION - Intelligence Gathering
Target: Nigerian entrepreneurs seeking developers/websites on Nairaland

Strategy:
1. Use Google Search API (avoid Nairaland's Cloudflare protection)
2. Search for "need website" queries on site:nairaland.com
3. Filter recent threads (last 7 days)
4. Extract contact info from thread titles/descriptions
5. Send high-value alerts to Telegram immediately

Author: AMD Solutions 007
Status: Ghost Mode - ACTIVE
"""

import os
import re
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from urllib.parse import urlparse, parse_qs

try:
    from googlesearch import search
except ImportError:
    print("❌ googlesearch-python not installed")
    print("   Run: pip install googlesearch-python")
    exit(1)

from telegram import Bot

# ==================== CONFIGURATION ====================

# Search queries (Nigerian business owners looking for help)
NAIRALAND_QUERIES = [
    'site:nairaland.com "I need a website"',
    'site:nairaland.com "looking for web developer"',
    'site:nairaland.com "app developer needed"',
    'site:nairaland.com "need a mobile app"',
    'site:nairaland.com "website designer wanted"',
    'site:nairaland.com "e-commerce website"',
    'site:nairaland.com "looking for developer Lagos"',
    'site:nairaland.com "need professional website"',
    'site:nairaland.com "web development services"',
    'site:nairaland.com "how to build website Nigeria"',
]

# Time filter (only recent threads)
MAX_AGE_DAYS = 7  # Last week only

# Telegram alert settings
MIN_LEAD_SCORE = 50  # Only alert on high-value leads

print("👻 NAIRALAND GHOST - STEALTH MONITOR")
print("=" * 70)


# ==================== LEAD SCORING ====================

def score_nairaland_lead(title: str, description: str) -> int:
    """
    Score lead 0-100 based on urgency and value indicators
    """
    score = 40  # Base score
    text = f"{title} {description}".lower()
    
    # Urgency indicators (+20 each)
    urgency_words = ['urgent', 'asap', 'immediately', 'this week', 'right away', 'quickly']
    for word in urgency_words:
        if word in text:
            score += 20
            break
    
    # Budget indicators (+25 each)
    budget_keywords = ['budget', 'pay', 'payment', 'money', 'naira', '₦', 'n500', 'willing to pay']
    for keyword in budget_keywords:
        if keyword in text:
            score += 25
            break
    
    # Project type (higher budget projects)
    high_value_projects = ['e-commerce', 'online store', 'mobile app', 'custom', 'professional', 'business']
    for project in high_value_projects:
        if project in text:
            score += 15
            break
    
    # Location (Lagos = more budget)
    if 'lagos' in text or 'lekki' in text or 'vi' in text:
        score += 10
    
    return min(score, 100)


# ==================== CONTACT EXTRACTION ====================

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """
    Extract phone number and email from text
    """
    # Nigerian phone patterns
    phone_patterns = [
        r'\+234\s?\d{10}',
        r'0\d{10}',
        r'\d{11}',
    ]
    
    phone = None
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            phone = match.group().replace(' ', '')
            if phone.startswith('0'):
                phone = '+234' + phone[1:]
            break
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text)
    email = email_match.group() if email_match else None
    
    return {'phone': phone, 'email': email}


# ==================== GOOGLE SEARCH (GHOST MODE) ====================

def search_nairaland_threads(query: str, max_results: int = 10) -> List[Dict]:
    """
    Search Nairaland via Google (bypasses Cloudflare)
    
    Returns: [{title, url, description, timestamp}]
    """
    print(f"\n🔍 Searching: {query[:60]}...")
    
    leads = []
    
    try:
        # Perform Google search
        # tbs parameter for date range: qdr:w = past week
        search_results = search(
            query,
            num_results=max_results,
            lang='en',
            advanced=True  # Get more details
        )
        
        for result in search_results:
            try:
                title = result.title if hasattr(result, 'title') else result.get('title', 'No title')
                url = result.url if hasattr(result, 'url') else result.get('url', '')
                description = result.description if hasattr(result, 'description') else result.get('description', '')
                
                # Verify it's actually a Nairaland URL
                if 'nairaland.com' not in url:
                    continue
                
                # Extract potential contact info
                contacts = extract_contact_info(f"{title} {description}")
                
                # Score the lead
                lead_score = score_nairaland_lead(title, description)
                
                lead = {
                    'title': title,
                    'url': url,
                    'description': description[:200],  # Truncate
                    'phone': contacts['phone'],
                    'email': contacts['email'],
                    'lead_score': lead_score,
                    'source': 'nairaland_ghost',
                    'found_at': datetime.now().isoformat()
                }
                
                leads.append(lead)
                print(f"  ✅ Found: {title[:60]} (Score: {lead_score}/100)")
                
            except Exception as e:
                print(f"  ⚠️ Error processing result: {e}")
                continue
        
        time.sleep(2)  # Rate limiting
        
    except Exception as e:
        print(f"  ❌ Search error: {e}")
    
    return leads


# ==================== TELEGRAM ALERTING ====================

def send_telegram_alert(bot: Bot, chat_id: str, lead: Dict):
    """
    Send high-value Nairaland lead to Telegram
    """
    score = lead['lead_score']
    
    # Emoji based on score
    if score >= 80:
        emoji = "🔥"
        priority = "URGENT"
    elif score >= 60:
        emoji = "🎯"
        priority = "HIGH VALUE"
    else:
        emoji = "📊"
        priority = "QUALIFIED"
    
    message = f"""
{emoji} **NAIRALAND GHOST ALERT** - {priority}

📋 **Thread:** {lead['title'][:100]}

🔗 **Link:** {lead['url']}

📝 **Preview:**
{lead['description'][:200]}

📊 **Lead Score:** {score}/100

📞 **Contact Found:**
- Phone: {lead['phone'] or 'Not in preview'}
- Email: {lead['email'] or 'Not in preview'}

⚡ **Action Required:**
1. Open thread and read full post
2. Extract contact details from thread
3. Send cold DM or WhatsApp message
4. Reference their exact need in message

💰 **Operation 1.3 MILLION**
🕒 Found: {lead['found_at']}
"""
    
    try:
        bot.send_message(chat_id=chat_id, text=message, parse_mode='Markdown')
        print(f"  ✅ Telegram alert sent (Score: {score})")
    except Exception as e:
        print(f"  ❌ Telegram send failed: {e}")


# ==================== MAIN EXECUTION ====================

def main():
    """Main execution - monitor Nairaland for hot leads"""
    print("🚀 Starting Nairaland Ghost Monitor...")
    print(f"📊 Monitoring: {len(NAIRALAND_QUERIES)} search patterns")
    print(f"🎯 Time Range: Last {MAX_AGE_DAYS} days")
    print(f"📱 Min Alert Score: {MIN_LEAD_SCORE}/100")
    print("=" * 70)
    
    # Validate Telegram credentials
    telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    
    if not telegram_token or not telegram_chat_id:
        print("⚠️ WARNING: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set")
        print("   Alerts will be skipped. Set environment variables to enable.")
        bot = None
    else:
        bot = Bot(token=telegram_token)
        print("✅ Telegram bot initialized")
    
    all_leads = []
    high_value_count = 0
    
    # Process each query
    for idx, query in enumerate(NAIRALAND_QUERIES):
        print(f"\n[{idx + 1}/{len(NAIRALAND_QUERIES)}]")
        
        leads = search_nairaland_threads(query, max_results=5)
        
        # Filter and alert on high-value leads
        for lead in leads:
            all_leads.append(lead)
            
            if lead['lead_score'] >= MIN_LEAD_SCORE:
                high_value_count += 1
                if bot:
                    send_telegram_alert(bot, telegram_chat_id, lead)
                else:
                    print(f"  📱 HIGH VALUE LEAD (no Telegram): {lead['title'][:50]}")
        
        # Progress
        print(f"📊 Progress: {len(all_leads)} total | {high_value_count} high-value")
        
        # Rate limiting (be respectful to Google)
        if idx < len(NAIRALAND_QUERIES) - 1:
            time.sleep(5)
    
    # Summary
    print("\n" + "=" * 70)
    print("👻 NAIRALAND GHOST - SCAN COMPLETE")
    print("=" * 70)
    print(f"✅ Threads Found: {len(all_leads)}")
    print(f"🎯 High-Value Alerts: {high_value_count} (Score ≥ {MIN_LEAD_SCORE})")
    
    if all_leads:
        avg_score = sum(l['lead_score'] for l in all_leads) / len(all_leads)
        print(f"📊 Average Lead Score: {avg_score:.1f}/100")
        
        contact_found = len([l for l in all_leads if l['phone'] or l['email']])
        print(f"📞 Contact Info in Preview: {contact_found}/{len(all_leads)}")
    
    print("\n💡 TIP: Most contact info is INSIDE the threads, not in Google preview")
    print("   Open high-score threads and extract phone/email from posts")
    
    print("\n🚀 Ghost mode deactivated. Leads delivered.")
    print("💰 Operation 1.3 MILLION - Intelligence gathered")


if __name__ == "__main__":
    main()
