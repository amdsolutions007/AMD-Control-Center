"""
Gmail Scout Sniper + Agency Converter - World-Class Lead Intelligence System
=============================================================================

Architecture Upgrades:
1. SQLite Integration: Leads inserted directly into Railway dashboard database
2. OpenAI Auto-Draft: AI generates first response proposals automatically
3. Smart Filtering: High-ticket lead scoring eliminates spam
4. Multi-Source: Google Alerts + RSS feeds + keyword monitoring
5. AGENCY CONVERTER: Transforms job alerts into B2B agency contracts

Agency Converter Features:
- Google Alerts: Auto-send agency pitch via Gmail API (if email found)
- LinkedIn Alerts: Extract company, draft message (manual posting - safe)
- Daily Report: Telegram summary of conversions

Author: AMD Solutions 007
Status: Production-Ready Sniper Class + Agency Mode
Protocol 007 Compliant: Official APIs only, no auto-posting to LinkedIn
"""

import base64
import os
import re
import time
import logging
import sqlite3
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from datetime import datetime

from bs4 import BeautifulSoup
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from telegram import Bot
from openai import OpenAI

# ==================== CONFIGURATION ====================

SCOPES = ["https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/gmail.send"]
BASE_DIR = Path(__file__).parent
TOKEN_PATH = BASE_DIR / "token.json"
CREDENTIALS_PATH = BASE_DIR.parent / ".credentials" / "lead_engine_credentials.json"
DATABASE_PATH = BASE_DIR / "data" / "leads.db"
LINKEDIN_DRAFTS_PATH = BASE_DIR / "data" / "DAILY_LEADS_REPORT.txt"
POLL_INTERVAL = 30  # Faster polling: 30 seconds (Sniper mode)

# Gmail queries - expanded for comprehensive lead capture + AGENCY CONVERTER
GMAIL_QUERIES = [
    "from:googlealerts-noreply@google.com is:unread",
    "subject:(freelance OR contract OR project OR opportunity) is:unread",
    "subject:(proposal OR RFP OR tender OR bid) is:unread",
    "(upwork OR freelancer OR fiverr OR toptal) is:unread",
]

# AGENCY CONVERTER: Google Alert Keywords (monitored by user)
AGENCY_KEYWORDS = [
    'need a developer', 'need developer', 'looking for developer',
    'looking for website', 'need a website', 'website developer',
    'hiring app developer', 'app developer needed', 'software developer',
    'full stack developer', 'react developer', 'python developer',
    'need web designer', 'web development', 'mobile app development'
]

# AGENCY CONVERTER: LinkedIn Job Alert Keywords
LINKEDIN_JOB_KEYWORDS = [
    'application developer', 'full stack', 'full-stack',
    'software engineer', 'backend developer', 'frontend developer',
    'cto', 'chief technology officer', 'lead developer',
    'senior developer', 'software architect'
]

# High-value keyword scoring (more keywords = higher score)
HIGH_VALUE_KEYWORDS = {
    # Budget indicators (30 points each)
    'budget': 30, '$': 30, '€': 30, '£': 30, '₦': 30,
    'payment': 20, 'compensation': 20, 'rate': 15,
    
    # Project scale (25 points each)
    'enterprise': 25, 'corporate': 25, 'agency': 25,
    'long-term': 20, 'ongoing': 20, 'retainer': 25,
    
    # Technology stack (15 points each)
    'react': 15, 'nextjs': 15, 'node': 15, 'python': 15,
    'ai': 20, 'machine learning': 20, 'automation': 20,
    'cloud': 15, 'aws': 15, 'google cloud': 15,
    
    # Decision makers (35 points each)
    'ceo': 35, 'cto': 35, 'founder': 35, 'director': 30,
    'manager': 25, 'head of': 30,
}

# Spam/low-value filters (instant rejection if found)
SPAM_INDICATORS = [
    'free', 'volunteer', 'no budget', 'equity only', 'profit share only',
    'student project', 'practice', 'learning', 'unpaid',
    'exposure', 'portfolio building', 'rev share only'
]

# Minimum lead score threshold (0-100 scale)
MIN_LEAD_SCORE = 40

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("gmail_scout_sniper")


# ==================== DATABASE INTEGRATION ====================

def init_database():
    """Ensure leads database exists with proper schema"""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL,
            industry TEXT,
            location TEXT,
            website TEXT,
            email TEXT,
            phone TEXT,
            decision_maker TEXT,
            decision_maker_title TEXT,
            linkedin_url TEXT,
            employees_estimate INTEGER,
            revenue_estimate INTEGER,
            lead_score INTEGER DEFAULT 0,
            status TEXT DEFAULT 'new',
            source TEXT,
            job_title TEXT,
            job_description TEXT,
            job_link TEXT,
            ai_draft_proposal TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            contacted_at TIMESTAMP,
            notes TEXT,
            UNIQUE(job_link)
        )
    ''')
    
    # Add new columns if they don't exist (migration)
    try:
        cursor.execute('ALTER TABLE leads ADD COLUMN job_title TEXT')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE leads ADD COLUMN job_description TEXT')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE leads ADD COLUMN job_link TEXT')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE leads ADD COLUMN ai_draft_proposal TEXT')
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()
    logger.info("✅ Database initialized: %s", DATABASE_PATH)


def insert_lead(lead_data: Dict) -> int:
    """Insert lead into database, return lead_id"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO leads (
                company_name, job_title, job_description, job_link,
                lead_score, source, ai_draft_proposal, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            lead_data.get('company_name', 'Unknown Client'),
            lead_data.get('job_title', ''),
            lead_data.get('job_description', ''),
            lead_data.get('job_link', ''),
            lead_data.get('lead_score', 0),
            lead_data.get('source', 'gmail'),
            lead_data.get('ai_draft_proposal', ''),
            'new',
            lead_data.get('notes', '')
        ))
        conn.commit()
        lead_id = cursor.lastrowid
        logger.info("✅ Lead #%d inserted: %s (Score: %d)", 
                   lead_id, lead_data.get('job_title', 'Untitled'), lead_data.get('lead_score', 0))
        return lead_id
    except sqlite3.IntegrityError:
        logger.warning("⚠️ Duplicate lead (job_link already exists)")
        return -1
    finally:
        conn.close()


# ==================== AI DRAFT GENERATION ====================

def generate_proposal_draft(job_title: str, job_description: str, job_link: str) -> str:
    """Use OpenAI to generate first response proposal"""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        logger.warning("⚠️ OPENAI_API_KEY not set, skipping AI draft")
        return ""
    
    try:
        client = OpenAI(api_key=api_key)
        
        prompt = f"""You are a professional business development agent for AMD Solutions 007, a premium tech agency.

Job Title: {job_title}
Job Description: {job_description[:1000]}
Job Link: {job_link}

Generate a compelling 150-word first response that:
1. Shows you READ and UNDERSTAND the project requirements
2. Highlights 2-3 relevant past experiences (be specific but generic enough)
3. Asks ONE strategic question that shows expertise
4. Proposes a quick 15-min discovery call

Tone: Professional, confident, consultative (not desperate)
Format: Plain text, no subject line, ready to send"""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a world-class business development expert."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        draft = response.choices[0].message.content.strip()
        logger.info("✅ AI Draft generated (%d chars)", len(draft))
        return draft
        
    except Exception as e:
        logger.error("❌ OpenAI draft generation failed: %s", e)
        return ""


# ==================== SMART LEAD SCORING ====================

def score_lead(title: str, description: str, link: str) -> Tuple[int, str]:
    """
    Score lead 0-100 based on multiple factors
    Returns: (score, reason)
    """
    score = 0
    reasons = []
    
    full_text = f"{title} {description}".lower()
    
    # 1. SPAM FILTER (instant rejection)
    for spam_word in SPAM_INDICATORS:
        if spam_word in full_text:
            return (0, f"🚫 SPAM: Contains '{spam_word}'")
    
    # 2. HIGH-VALUE KEYWORDS
    keyword_score = 0
    found_keywords = []
    for keyword, points in HIGH_VALUE_KEYWORDS.items():
        if keyword in full_text:
            keyword_score += points
            found_keywords.append(keyword)
    
    score += min(keyword_score, 50)  # Cap keyword score at 50
    if found_keywords:
        reasons.append(f"Keywords: {', '.join(found_keywords[:3])}")
    
    # 3. SOURCE REPUTATION
    if 'upwork.com' in link or 'freelancer.com' in link:
        score += 10
        reasons.append("Verified platform")
    elif 'linkedin.com' in link:
        score += 15
        reasons.append("LinkedIn (high quality)")
    
    # 4. BUDGET INDICATORS
    budget_patterns = [
        r'\$[\d,]+', r'€[\d,]+', r'£[\d,]+', r'₦[\d,]+',
        r'budget:?\s*[\d,]+', r'rate:?\s*\$[\d,]+'
    ]
    for pattern in budget_patterns:
        if re.search(pattern, full_text):
            score += 15
            reasons.append("Budget mentioned")
            break
    
    # 5. URGENCY BOOST
    urgency_words = ['urgent', 'asap', 'immediate', 'this week', 'right away']
    if any(word in full_text for word in urgency_words):
        score += 10
        reasons.append("Urgent project")
    
    # 6. DESCRIPTION LENGTH (detailed = serious)
    if len(description) > 500:
        score += 10
        reasons.append("Detailed brief")
    
    reason_text = " | ".join(reasons) if reasons else "Basic match"
    return (min(score, 100), reason_text)


# ==================== GMAIL OAUTH & PARSING ====================

def get_gmail_service():
    """Authenticate with Gmail API"""
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_PATH.exists():
                logger.error("❌ Credentials not found: %s", CREDENTIALS_PATH)
                raise FileNotFoundError(f"Place credentials.json at {CREDENTIALS_PATH}")
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_PATH.write_text(creds.to_json())
    return build("gmail", "v1", credentials=creds)


def decode_part(data: str) -> str:
    """Decode base64 email content"""
    try:
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    except Exception:
        return ""


def extract_body(payload: dict) -> str:
    """Extract email body from nested MIME structure"""
    if not payload:
        return ""

    def walk_parts(part):
        if not part:
            return ""
        mime_type = part.get("mimeType", "")
        body_data = part.get("body", {}).get("data")
        if body_data and mime_type in ("text/html", "text/plain"):
            return decode_part(body_data)
        for child in part.get("parts", []) or []:
            text = walk_parts(child)
            if text:
                return text
        return ""

    return walk_parts(payload)


def parse_lead_from_email(subject: str, content: str) -> Dict:
    """
    Extract structured lead data from email
    Returns: {title, description, link, company_name}
    """
    soup = BeautifulSoup(content, "html.parser")
    
    # Extract all links
    links = [a['href'] for a in soup.find_all("a", href=True) if 'http' in a['href']]
    primary_link = links[0] if links else "No link"
    
    # Extract title (first strong/bold text or subject)
    title_elem = soup.find(['strong', 'b', 'h1', 'h2'])
    title = title_elem.get_text(strip=True) if title_elem else subject
    
    # Extract description (strip HTML, keep text)
    description = soup.get_text(separator='\n', strip=True)
    description = '\n'.join([line for line in description.split('\n') if line.strip()])[:2000]
    
    # Try to extract company name
    company_match = re.search(r'company[:\s]+([A-Z][A-Za-z\s&]+)', description, re.IGNORECASE)
    company_name = company_match.group(1).strip() if company_match else "Unknown Client"
    
    return {
        'job_title': title[:200],
        'job_description': description,
        'job_link': primary_link,
        'company_name': company_name[:100]
    }


def mark_as_read(service, msg_id: str):
    """Mark email as read"""
    service.users().messages().modify(
        userId="me", id=msg_id, body={"removeLabelIds": ["UNREAD"]}
    ).execute()


# ==================== AGENCY CONVERTER ====================

def extract_email_from_text(text: str) -> Optional[str]:
    """Extract email address from text"""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    matches = re.findall(email_pattern, text)
    
    # Filter out noreply/alerts emails
    valid_emails = [
        email for email in matches
        if not any(skip in email.lower() for skip in ['noreply', 'alerts', 'notification', 'no-reply'])
    ]
    
    return valid_emails[0] if valid_emails else None


def extract_company_from_linkedin(subject: str, content: str) -> Optional[str]:
    """Extract company name from LinkedIn job alert"""
    # Try subject line first
    company_patterns = [
        r'at\s+([A-Z][A-Za-z\s&\.]+?)(?:\s+in|\s+\||$)',
        r'hiring.*?at\s+([A-Z][A-Za-z\s&\.]+?)(?:\s+in|\s+\||$)',
        r'([A-Z][A-Za-z\s&\.]+?)\s+is\s+hiring',
    ]
    
    for pattern in company_patterns:
        match = re.search(pattern, subject)
        if match:
            company = match.group(1).strip()
            if len(company) > 2 and company.lower() not in ['the', 'and', 'for']:
                return company
    
    # Try content
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text()
    
    for pattern in company_patterns:
        match = re.search(pattern, text[:500])
        if match:
            company = match.group(1).strip()
            if len(company) > 2:
                return company
    
    return None


def generate_agency_pitch(context: Dict) -> str:
    """Generate agency pitch using OpenAI"""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        # Fallback template
        return f"""Hi,

I saw you're looking for a developer for {context.get('role', 'your project')}.

Instead of hiring a salary employee, consider working with my agency, AMD Solutions 007.

Why agencies beat employees:
✅ Full team (not just 1 person)
✅ No recruitment costs
✅ Faster delivery (we have resources ready)
✅ No benefits/overhead
✅ Same cost or less

We've built 19+ projects for Nigerian businesses - from POS systems to AI automation.

Let's discuss how we can help: +234 818 002 1007

Best regards,
Olawale Shoyemi
CEO, AMD Solutions 007
www.amdsolutions007.com"""
    
    try:
        client = OpenAI(api_key=api_key)
        
        prompt = f"""You are Olawale Shoyemi, CEO of AMD Solutions 007, pitching your agency as an alternative to hiring a salary employee.

Context:
- They posted: "{context.get('role', 'Developer needed')}"
- Company: {context.get('company', 'Unknown')}
- Source: {context.get('source', 'Job board')}

Write a 150-word pitch that:
1. Shows you understand they need a developer
2. Proposes agency model instead of employee (same cost, full team)
3. Highlights 2 benefits (no recruitment hassle, faster delivery)
4. Mentions AMD Solutions track record (19+ projects)
5. Proposes quick call: +234 818 002 1007

Tone: Professional, confident, helpful (not desperate)
Sign off: Olawale Shoyemi | CEO, AMD Solutions 007"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=250,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error("❌ Agency pitch generation failed: %s", e)
        # Return fallback on error
        return f"""Hi,

I saw you're looking for a developer. Instead of a salary employee, consider AMD Solutions 007 (my agency).

Same cost, but you get:
✅ Full development team
✅ No recruitment hassle  
✅ Faster delivery
✅ 19+ completed projects

Let's talk: +234 818 002 1007

Olawale Shoyemi | CEO, AMD Solutions 007"""


def send_agency_email(service, to_email: str, subject: str, body: str) -> bool:
    """Send agency pitch via Gmail API"""
    try:
        from email.mime.text import MIMEText
        import base64
        
        message = MIMEText(body)
        message['to'] = to_email
        message['subject'] = subject
        
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        logger.info("✅ Agency email sent to: %s", to_email)
        return True
        
    except Exception as e:
        logger.error("❌ Failed to send email to %s: %s", to_email, e)
        return False


def save_linkedin_draft(company: str, role: str, pitch: str):
    """Save LinkedIn draft to daily report file"""
    LINKEDIN_DRAFTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    draft_entry = f"""
{'=' * 70}
DATE: {timestamp}
COMPANY: {company}
ROLE: {role}
{'=' * 70}

LINKEDIN DRAFT (Manual Posting Required):

{pitch}

{'=' * 70}

"""
    
    with open(LINKEDIN_DRAFTS_PATH, 'a', encoding='utf-8') as f:
        f.write(draft_entry)
    
    logger.info("✅ LinkedIn draft saved: %s - %s", company, role)


def is_google_alert(subject: str, sender: str) -> bool:
    """Check if email is from Google Alerts"""
    return 'googlealerts-noreply@google.com' in sender.lower()


def is_linkedin_job_alert(subject: str, sender: str) -> bool:
    """Check if email is LinkedIn job alert"""
    return ('linkedin' in sender.lower() and 
            any(keyword in subject.lower() for keyword in ['job', 'opportunity', 'hiring', 'application']))


def contains_agency_keywords(text: str) -> bool:
    """Check if text contains agency conversion keywords"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in AGENCY_KEYWORDS)


def contains_linkedin_job_keywords(text: str) -> bool:
    """Check if text contains LinkedIn job keywords"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in LINKEDIN_JOB_KEYWORDS)


# ==================== TELEGRAM ALERTING ====================

def send_telegram_alert(bot: Bot, chat_id: str, lead_data: Dict, lead_id: int, score: int, reason: str):
    """Send enriched lead alert to Telegram"""
    
    emoji_map = {
        (80, 100): "🎯",  # Elite
        (60, 79): "💰",   # High-value
        (40, 59): "📊",   # Qualified
        (0, 39): "⚠️"     # Low-priority
    }
    
    emoji = next(e for (low, high), e in emoji_map.items() if low <= score <= high)
    
    message = f"""
{emoji} **NEW LEAD ALERT** (Score: {score}/100)

📋 **Job:** {lead_data.get('job_title', 'Untitled')[:100]}
🏢 **Client:** {lead_data.get('company_name', 'Unknown')}
🔗 **Link:** {lead_data.get('job_link', 'N/A')}

📈 **Why High-Value:** {reason}

🤖 **AI DRAFT PROPOSAL:**
{lead_data.get('ai_draft_proposal', 'No draft generated')[:500]}

💾 **Dashboard:** Lead #{lead_id} saved to Railway DB
⚡ **Action:** Review and respond within 1 hour for best conversion

---
🎯 AMD Solutions 007 | Gmail Scout Sniper
"""
    
    try:
        bot.send_message(chat_id=chat_id, text=message, parse_mode='Markdown')
        logger.info("✅ Telegram alert sent for Lead #%d", lead_id)
    except Exception as e:
        logger.error("❌ Telegram send failed: %s", e)


# ==================== MAIN POLLING LOOP ====================

def process_messages(service, bot: Bot, chat_id: str):
    """Process all unread messages matching our queries + AGENCY CONVERTER"""
    total_processed = 0
    total_qualified = 0
    agency_emails_sent = 0
    linkedin_drafts_created = 0
    
    for query in GMAIL_QUERIES:
        try:
            resp = service.users().messages().list(
                userId="me", q=query, maxResults=10
            ).execute()
            
            messages = resp.get("messages", [])
            
            for msg in messages:
                msg_id = msg["id"]
                full = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
                
                # Extract subject, sender, and body
                headers = full.get("payload", {}).get("headers", [])
                subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
                
                payload = full.get("payload", {})
                content = extract_body(payload)
                
                # ==================== AGENCY CONVERTER LOGIC ====================
                
                # TRACK 1: Google Alerts with Agency Keywords
                if is_google_alert(subject, sender) and contains_agency_keywords(subject + content):
                    logger.info("🎯 AGENCY OPPORTUNITY (Google Alert): %s", subject[:60])
                    
                    # Extract email from content
                    contact_email = extract_email_from_text(content)
                    
                    if contact_email:
                        # Generate agency pitch
                        pitch_context = {
                            'role': subject[:100],
                            'company': 'Unknown',
                            'source': 'Google Alert'
                        }
                        pitch = generate_agency_pitch(pitch_context)
                        
                        # Send email via Gmail API
                        email_subject = "Agency Alternative - AMD Solutions 007"
                        if send_agency_email(service, contact_email, email_subject, pitch):
                            agency_emails_sent += 1
                            logger.info("✅ Agency email sent: %s", contact_email)
                        
                        # Also save to database as converted lead
                        lead_data = {
                            'company_name': 'Google Alert Lead',
                            'job_title': subject[:200],
                            'job_description': content[:500],
                            'email': contact_email,
                            'job_link': 'Google Alert',
                            'lead_score': 75,
                            'source': 'google_alert_converted',
                            'notes': f'Agency email auto-sent to {contact_email}',
                            'status': 'auto_contacted',
                            'ai_draft_proposal': pitch
                        }
                        insert_lead(lead_data)
                    
                    mark_as_read(service, msg_id)
                    total_processed += 1
                    continue
                
                # TRACK 2: LinkedIn Job Alerts
                if is_linkedin_job_alert(subject, sender) and contains_linkedin_job_keywords(subject + content):
                    logger.info("💼 LINKEDIN JOB ALERT: %s", subject[:60])
                    
                    # Extract company name
                    company = extract_company_from_linkedin(subject, content)
                    
                    if company:
                        # Generate agency pitch
                        pitch_context = {
                            'role': subject[:100],
                            'company': company,
                            'source': 'LinkedIn'
                        }
                        pitch = generate_agency_pitch(pitch_context)
                        
                        # Save draft (manual posting to LinkedIn - Protocol 007 compliant)
                        save_linkedin_draft(company, subject[:100], pitch)
                        linkedin_drafts_created += 1
                        
                        # Save to database
                        lead_data = {
                            'company_name': company,
                            'job_title': subject[:200],
                            'job_description': content[:500],
                            'job_link': 'LinkedIn Alert',
                            'lead_score': 70,
                            'source': 'linkedin_job_converted',
                            'notes': f'LinkedIn draft saved for manual posting',
                            'status': 'draft_ready',
                            'ai_draft_proposal': pitch
                        }
                        insert_lead(lead_data)
                    
                    mark_as_read(service, msg_id)
                    total_processed += 1
                    continue
                
                # ==================== STANDARD LEAD PROCESSING ====================
                
                # Parse lead data
                lead_data = parse_lead_from_email(subject, content)
                
                # Score the lead
                score, reason = score_lead(
                    lead_data['job_title'],
                    lead_data['job_description'],
                    lead_data['job_link']
                )
                
                lead_data['lead_score'] = score
                lead_data['source'] = f'gmail:{query[:20]}'
                lead_data['notes'] = f"Scoring: {reason}"
                
                total_processed += 1
                
                # Filter low-quality leads
                if score < MIN_LEAD_SCORE:
                    logger.info("⏭️ Skipped (Score: %d): %s", score, lead_data['job_title'][:50])
                    mark_as_read(service, msg_id)
                    continue
                
                # Generate AI draft for qualified leads
                if score >= MIN_LEAD_SCORE:
                    ai_draft = generate_proposal_draft(
                        lead_data['job_title'],
                        lead_data['job_description'],
                        lead_data['job_link']
                    )
                    lead_data['ai_draft_proposal'] = ai_draft
                
                # Insert into database
                lead_id = insert_lead(lead_data)
                
                if lead_id > 0:
                    total_qualified += 1
                    # Send Telegram alert
                    send_telegram_alert(bot, chat_id, lead_data, lead_id, score, reason)
                
                # Mark as read
                mark_as_read(service, msg_id)
                
        except Exception as exc:
            logger.error("❌ Error processing query '%s': %s", query, exc)
    
    # Enhanced logging with Agency Converter stats
    if total_processed > 0:
        logger.info("📊 PROCESSED: %d emails | QUALIFIED: %d leads | SPAM FILTERED: %d",
                   total_processed, total_qualified, total_processed - total_qualified)
        logger.info("🎯 AGENCY CONVERTER: %d emails sent | %d LinkedIn drafts created",
                   agency_emails_sent, linkedin_drafts_created)
    else:
        logger.info("✓ No new emails")
    
    # Send daily summary if agency conversions happened
    if agency_emails_sent > 0 or linkedin_drafts_created > 0:
        summary = f"""🤖 **AGENCY CONVERTER DAILY SUMMARY**

📧 Auto-Emails Sent: {agency_emails_sent}
💼 LinkedIn Drafts: {linkedin_drafts_created}
📊 Total Processed: {total_processed}
✅ Qualified Leads: {total_qualified}

{'📁 Check: lead_engine/data/DAILY_LEADS_REPORT.txt for LinkedIn drafts' if linkedin_drafts_created > 0 else ''}

---
Gmail Scout Sniper + Agency Converter"""
        
        try:
            bot.send_message(chat_id=chat_id, text=summary, parse_mode="Markdown")
        except Exception as e:
            logger.warning("Failed to send summary: %s", e)



def main():
    """Main execution loop"""
    # Validate environment
    telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    
    if not telegram_token or not telegram_chat_id:
        logger.error("❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID")
        return
    
    if not openai_key:
        logger.warning("⚠️ OPENAI_API_KEY not set - AI drafts will be skipped")
    
    # Initialize
    init_database()
    bot = Bot(token=telegram_token)
    service = get_gmail_service()
    
    logger.info("=" * 70)
    logger.info("🎯 GMAIL SCOUT SNIPER - ACTIVATED")
    logger.info("=" * 70)
    logger.info("📊 Monitoring: %d Gmail queries", len(GMAIL_QUERIES))
    logger.info("🎯 Min Lead Score: %d/100", MIN_LEAD_SCORE)
    logger.info("⚡ Polling Interval: %d seconds", POLL_INTERVAL)
    logger.info("💾 Database: %s", DATABASE_PATH)
    logger.info("🤖 AI Drafts: %s", "ENABLED" if openai_key else "DISABLED")
    logger.info("=" * 70)
    
    # Main loop
    while True:
        try:
            process_messages(service, bot, telegram_chat_id)
        except Exception as exc:
            logger.error("❌ Polling error: %s", exc)
        
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
