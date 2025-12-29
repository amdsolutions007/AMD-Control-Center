"""
Lead Engine Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

# ==================== TARGET CRITERIA ====================

TARGET_INDUSTRIES = [
    'Technology',
    'Financial Services',
    'Real Estate',
    'E-commerce',
    'Healthcare',
    'Manufacturing',
    'Logistics',
    'Telecommunications',
    'Education',
    'Media & Entertainment'
]

TARGET_LOCATIONS = [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Ibadan',
    'Kano'
]

MIN_REVENUE = 50_000_000  # ₦50M minimum annual revenue
MIN_EMPLOYEES = 20
TARGET_DECISION_MAKERS = ['CEO', 'CTO', 'COO', 'IT Manager', 'Business Development Manager']

# ==================== SCRAPING SOURCES ====================

SCRAPE_SOURCES = {
    'linkedin': True,      # LinkedIn company search
    'google_maps': True,   # Google Maps businesses
    'yellow_pages': True,  # Yellow Pages Nigeria
    'nairaland': True,     # Nairaland business forum
    'nigerian_directory': True  # Nigerian Business Directory
}

# ==================== OUTREACH SETTINGS ====================

# Email (Gmail API)
GMAIL_CREDENTIALS = os.getenv('GMAIL_CREDENTIALS_FILE', 'gmail_credentials.json')
GMAIL_TOKEN = os.getenv('GMAIL_TOKEN_FILE', 'gmail_token.json')
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'ceo@amdsolutions007.com')
SENDER_NAME = 'Olawale - AMD Solutions 007'

# WhatsApp Business
WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'
WHATSAPP_ACCESS_TOKEN = os.getenv('WHATSAPP_ACCESS_TOKEN', '')
WHATSAPP_PHONE_ID = os.getenv('WHATSAPP_PHONE_ID', '')

# Outreach limits (avoid spam)
MAX_EMAILS_PER_DAY = 50
MAX_WHATSAPP_PER_DAY = 30
DAYS_BETWEEN_FOLLOWUP = 3

# ==================== EMAIL TEMPLATES ====================

EMAIL_TEMPLATES = {
    'high_ticket_ai': {
        'subject': '₦{revenue_increase}M Revenue Increase Through AI - {company_name}',
        'preview': 'We helped {industry} companies generate ₦2.5B+ through custom AI...',
        'cta': 'Book 15-min Strategy Call'
    },
    'automation_package': {
        'subject': 'Save 20+ Hours/Week - Automation for {company_name}',
        'preview': 'Your team is drowning in manual work. We can automate 80% of it...',
        'cta': 'See How We Can Help'
    },
    'media_production': {
        'subject': 'Triple Your Engagement - Viral Media for {company_name}',
        'preview': 'Our media campaigns generate 10M+ impressions monthly...',
        'cta': 'View Our Portfolio'
    }
}

# ==================== DATABASE ====================

DATABASE_PATH = Path(__file__).parent / 'data' / 'leads.db'
CSV_EXPORT_PATH = Path(__file__).parent / 'data' / 'exports'

# ==================== SCORING SYSTEM ====================

LEAD_SCORING = {
    'has_website': 10,
    'has_linkedin': 15,
    'has_recent_funding': 25,
    'hiring_actively': 20,
    'revenue_100m_plus': 30,
    'tech_company': 25,
    'lagos_based': 15,
    'decision_maker_found': 20
}

MIN_LEAD_SCORE = 40  # Minimum score to be considered qualified

# ==================== TRACKING ====================

TRACK_METRICS = {
    'emails_sent': 0,
    'emails_opened': 0,
    'emails_clicked': 0,
    'responses_received': 0,
    'meetings_booked': 0,
    'proposals_sent': 0,
    'deals_closed': 0,
    'revenue_generated': 0
}

# ==================== API RATE LIMITS ====================

RATE_LIMITS = {
    'google_maps': 100,  # requests per day (free tier)
    'linkedin': 20,      # searches per day (to avoid detection)
    'email_warmup': 10   # start with 10/day, increase by 5 daily
}

# ==================== REVENUE TARGETS ====================

REVENUE_GOALS = {
    'month_1': 1_300_000,  # ₦1.3M (first term)
    'month_2': 1_300_000,  # ₦1.3M (second term)
    'month_3': 1_400_000,  # ₦1.4M (third term + buffer)
    'total': 4_000_000     # ₦4M total
}

AVERAGE_DEAL_SIZE = {
    'high_ticket_ai': 2_500_000,      # ₦2.5M average
    'mid_ticket_automation': 800_000,  # ₦800K average
    'low_ticket_media': 350_000        # ₦350K average
}

# Deals needed per month (assuming 30% close rate)
DEALS_NEEDED_MONTHLY = {
    'high_ticket': 1,   # 1 big deal = ₦2.5M
    'mid_ticket': 1,    # 1 medium deal = ₦800K
    'total_outreach': 50  # 50 qualified leads = 15 responses = 5 meetings = 1.5 deals
}
