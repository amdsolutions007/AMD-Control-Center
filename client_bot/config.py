"""
Client Acquisition Bot Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env')

# ==================== BOT CREDENTIALS ====================

# WhatsApp Business (reuse from existing)
WHATSAPP_ACCESS_TOKEN = os.getenv('WHATSAPP_ACCESS_TOKEN', '')
WHATSAPP_PHONE_ID = os.getenv('WHATSAPP_PHONE_ID', '')

# Telegram (reuse from social engine)
TELEGRAM_BOT_TOKEN = "8599161577:AAFtqnsISrN_3wiRtnpMMdUBwe5QdZoHj54"
TELEGRAM_SALES_CHAT_ID = "8404666834"

# Gmail
GMAIL_CREDENTIALS = os.getenv('GMAIL_CREDENTIALS_FILE', 'gmail_credentials.json')

# ==================== BUSINESS RULES ====================

# Qualification criteria
MIN_BUDGET = 500_000  # ₦500K minimum project
IDEAL_BUDGET = 2_000_000  # ₦2M ideal project
TARGET_TIMELINE = ['immediate', 'within_1_month', 'within_3_months']

# ==================== AUTO-RESPONSE TEMPLATES ====================

INITIAL_RESPONSE = """
Hi {name}! 👋

Thanks for reaching out to AMD Solutions 007!

I'm the AMD AI Assistant. I can help you right away.

*Quick Questions:*
1️⃣ What challenge are you trying to solve?
2️⃣ What's your budget range?
   • ₦500K - ₦1M
   • ₦1M - ₦3M
   • ₦3M+
3️⃣ When do you need it done?

Reply and I'll connect you with our team immediately! ⚡
"""

QUALIFIED_RESPONSE = """
Perfect! Based on what you shared:
- Challenge: {challenge}
- Budget: {budget}
- Timeline: {timeline}

You're a great fit for our {service} package!

*Next Step:* Book a free 15-min strategy call
👉 https://amdsolutions007.com/links

Or I can have CEO Olawale call you directly.
Which works better?
"""

HIGH_VALUE_ALERT = """
🚨 HIGH-VALUE LEAD ALERT 🚨

Name: {name}
Company: {company}
Budget: {budget}
Challenge: {challenge}
Source: {source}

CALL IMMEDIATELY: {phone}
"""

# ==================== QUALIFICATION SCORING ====================

QUALIFICATION_SCORING = {
    'has_budget': 30,
    'budget_over_1m': 20,
    'budget_over_3m': 30,
    'immediate_need': 25,
    'decision_maker': 20,
    'company_size_large': 15,
    'referred': 20,
    'from_linkedin': 10,
    'filled_full_form': 15
}

MIN_QUALIFICATION_SCORE = 40

# ==================== MEETING BOOKING ====================

CALENDAR_LINK = 'https://amdsolutions007.com/links'
CEO_PHONE = '+234 906 855 9191'
CEO_WHATSAPP = '+234 906 855 9191'

MEETING_CONFIRMATION = """
✅ Meeting confirmed!

*Details:*
Date: {date}
Time: {time}
Duration: 15 minutes
Link: {meeting_link}

We'll discuss:
- Your specific challenge
- Tailored solution options
- ROI projections
- Next steps

See you then! 🚀

Questions? WhatsApp: {ceo_whatsapp}
"""

# ==================== FOLLOW-UP SEQUENCES ====================

FOLLOW_UP_SCHEDULES = {
    'no_response_1': 4,      # 4 hours after initial contact
    'no_response_2': 24,     # 1 day
    'no_response_3': 72,     # 3 days
    'post_meeting': 2,       # 2 hours after meeting
    'proposal_sent': 24,     # 1 day after proposal
    'proposal_reminder': 72  # 3 days after proposal
}

FOLLOW_UP_MESSAGES = {
    'no_response_1': """
Hi {name},

Just wanted to make sure you got my message about {challenge}.

Quick question: What's your #1 priority right now?

Happy to help! 😊
""",
    
    'no_response_2': """
{name}, I know you're busy.

I'll be brief: We can solve your {challenge} in {timeline}.

Similar clients have seen:
- 30-40% cost reduction
- 20+ hours saved weekly
- 15-25% revenue increase

Worth a 15-min call? https://amdsolutions007.com/links
""",
    
    'post_meeting': """
Great talking to you today, {name}!

As promised, here's your custom proposal:
{proposal_link}

Key points:
✅ {solution_summary}
✅ ROI: {roi}
✅ Timeline: {timeline}

Questions? Reply or call me: {ceo_phone}
""",
    
    'proposal_reminder': """
Hi {name},

Following up on the proposal I sent.

Any questions? I'm here to help clarify anything.

Want to move forward? Reply "YES" and we can start this week.

Best,
Olawale
AMD Solutions 007
"""
}

# ==================== SERVICE RECOMMENDATIONS ====================

SERVICE_MAPPING = {
    'automation': {
        'keywords': ['automate', 'manual', 'repetitive', 'workflow', 'time-consuming'],
        'package': 'Business Automation Package',
        'price_range': '₦800K - ₦1.5M',
        'timeline': '4-6 weeks'
    },
    'ai_development': {
        'keywords': ['ai', 'machine learning', 'prediction', 'intelligence', 'data'],
        'package': 'Custom AI Development',
        'price_range': '₦2.5M - ₦5M',
        'timeline': '8-12 weeks'
    },
    'analytics': {
        'keywords': ['analytics', 'insights', 'reporting', 'dashboard', 'data analysis'],
        'package': 'Data Analytics Suite',
        'price_range': '₦1M - ₦2M',
        'timeline': '6-8 weeks'
    },
    'media_production': {
        'keywords': ['video', 'content', 'media', 'marketing', 'social media'],
        'package': 'Media Production',
        'price_range': '₦200K - ₦800K',
        'timeline': '2-4 weeks'
    }
}

# ==================== DATABASE ====================

DATABASE_PATH = Path(__file__).parent / 'data' / 'clients.db'

# ==================== TRACKING ====================

METRICS = {
    'inquiries_received': 0,
    'inquiries_responded': 0,
    'leads_qualified': 0,
    'meetings_booked': 0,
    'proposals_sent': 0,
    'deals_closed': 0,
    'revenue_generated': 0,
    'avg_response_time': 0  # in minutes
}

# ==================== RATE LIMITS ====================

MAX_AUTO_RESPONSES_PER_HOUR = 50
MAX_FOLLOW_UPS_PER_DAY = 100

# ==================== ESCALATION RULES ====================

ESCALATE_TO_HUMAN = {
    'high_value': True,        # Budget > ₦3M
    'angry_customer': True,     # Negative sentiment detected
    'complex_query': True,      # Can't auto-respond
    'request_human': True       # Explicitly asks for human
}

ESCALATION_MESSAGE = """
Thanks {name}! Let me connect you with our CEO right away.

Olawale will reach out within the next 30 minutes.

In the meantime, check out our work: https://amdsolutions007.com
"""
