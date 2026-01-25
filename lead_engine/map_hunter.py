#!/usr/bin/env python3
"""
Map Hunter - Google Maps Lead Extractor
========================================

Operation: 1.3 MILLION - Outbound Aggression
Target: Nigerian businesses WITHOUT websites

Strategy:
1. Search Google Maps for target industries/locations
2. Extract businesses with NO website listed
3. Generate personalized cold messages (OpenAI)
4. Save to Railway dashboard + CSV export

Author: AMD Solutions 007
Status: Revenue Machine - ACTIVE
"""

import os
import re
import time
import sqlite3
import csv
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

from openai import OpenAI

# ==================== CONFIGURATION ====================

BASE_DIR = Path(__file__).parent
DATABASE_PATH = BASE_DIR / "data" / "leads.db"
CSV_OUTPUT_PATH = BASE_DIR / "data" / "hot_leads.csv"
SCREENSHOTS_DIR = BASE_DIR / "data" / "screenshots"

# Target search queries (Nigerian business focus)
TARGET_SEARCHES = [
    # Real Estate
    "Real Estate Lekki Lagos",
    "Real Estate Victoria Island Lagos",
    "Real Estate Abuja",
    "Property Developers Lagos",
    
    # Hospitality
    "Hotels Ikeja Lagos",
    "Hotels Lekki Lagos",
    "Hotels Abuja",
    "Restaurants Victoria Island",
    "Event Centers Lagos",
    
    # Logistics & Transport
    "Logistics Companies Lagos",
    "Courier Services Abuja",
    "Transport Companies Lagos",
    "Cargo Services Nigeria",
    
    # Professional Services
    "Law Firms Lagos",
    "Accounting Firms Abuja",
    "Consulting Firms Lagos",
    "Business Centers Lagos",
    
    # Retail
    "Furniture Stores Lagos",
    "Electronics Shops Abuja",
    "Fashion Boutiques Lagos",
    "Supermarkets Lekki"
]

# Scroll settings
MAX_SCROLL_ATTEMPTS = 10  # How many times to scroll down
SCROLL_PAUSE = 2  # Seconds to wait after each scroll

# OpenAI cold message settings
OPENAI_ENABLED = True  # Set to False to skip AI generation

print("🎯 MAP HUNTER - OPERATION 1.3 MILLION")
print("=" * 70)


# ==================== DATABASE SETUP ====================

def init_database():
    """Initialize leads database with map_hunter specific fields"""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Ensure table exists with all needed columns
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
            address TEXT,
            rating REAL,
            reviews_count INTEGER,
            cold_message TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            contacted_at TIMESTAMP,
            notes TEXT,
            UNIQUE(phone, company_name)
        )
    ''')
    
    # Add new columns if they don't exist (migration)
    new_columns = [
        ('address', 'TEXT'),
        ('rating', 'REAL'),
        ('reviews_count', 'INTEGER'),
        ('cold_message', 'TEXT')
    ]
    
    for col_name, col_type in new_columns:
        try:
            cursor.execute(f'ALTER TABLE leads ADD COLUMN {col_name} {col_type}')
        except sqlite3.OperationalError:
            pass  # Column already exists
    
    conn.commit()
    conn.close()
    print("✅ Database initialized:", DATABASE_PATH)


# ==================== OPENAI COLD MESSAGE GENERATOR ====================

def generate_cold_message(business_name: str, address: str, industry: str) -> str:
    """
    Generate personalized WhatsApp cold message using OpenAI
    
    Format: 50 words max, Nigerian business context, Pay-on-Delivery offer
    """
    if not OPENAI_ENABLED:
        return ""
    
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        print("⚠️ OPENAI_API_KEY not set, skipping cold message generation")
        return ""
    
    try:
        client = OpenAI(api_key=api_key)
        
        prompt = f"""You are a Nigerian business development expert. Write a 50-word WhatsApp message to a business owner.

Business Name: {business_name}
Location: {address}
Industry: {industry}

Message Requirements:
1. Mention their business name and location (shows you did research)
2. Point out they are INVISIBLE online (no website = losing customers daily)
3. Offer "Pay on Delivery" website service (Nigerian trust factor)
4. Professional but conversational tone (WhatsApp style)
5. Include ONE clear call-to-action (reply YES to see samples)
6. NO emojis, NO salesy language, NO hard sell

Write the message now:"""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a Nigerian business consultant specializing in digital transformation."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        message = response.choices[0].message.content.strip()
        print(f"  ✅ Cold message generated ({len(message)} chars)")
        return message
        
    except Exception as e:
        print(f"  ❌ OpenAI generation failed: {e}")
        return ""


# ==================== GOOGLE MAPS SCRAPER ====================

def extract_phone_number(text: str) -> Optional[str]:
    """Extract Nigerian phone number from text"""
    # Nigerian phone patterns: +234, 0, or just numbers
    patterns = [
        r'\+234\s?\d{3}\s?\d{3}\s?\d{4}',  # +234 803 123 4567
        r'0\d{3}\s?\d{3}\s?\d{4}',          # 0803 123 4567
        r'\d{11}',                           # 08031234567
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.replace('-', '').replace(' ', ''))
        if match:
            # Normalize to +234 format
            phone = match.group()
            phone = phone.replace(' ', '').replace('-', '')
            if phone.startswith('0'):
                phone = '+234' + phone[1:]
            elif not phone.startswith('+'):
                phone = '+234' + phone
            return phone
    return None


def scrape_google_maps(search_query: str, max_results: int = 50) -> List[Dict]:
    """
    Scrape Google Maps for businesses without websites
    
    Returns list of leads: {name, phone, address, rating, reviews_count}
    """
    print(f"\n🔍 Searching: {search_query}")
    leads = []
    
    with sync_playwright() as p:
        # Launch browser (headless for production)
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        try:
            # Navigate to Google Maps
            maps_url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
            page.goto(maps_url, wait_until='networkidle', timeout=30000)
            time.sleep(3)  # Let page fully load
            
            # Scroll to load more results
            results_panel = page.locator('div[role="feed"]').first
            
            for scroll_count in range(MAX_SCROLL_ATTEMPTS):
                # Scroll down in the results panel
                results_panel.evaluate('el => el.scrollTop = el.scrollHeight')
                time.sleep(SCROLL_PAUSE)
                
                # Get all visible business cards
                business_cards = page.locator('div[role="article"]').all()
                print(f"  📊 Loaded {len(business_cards)} results (scroll {scroll_count + 1}/{MAX_SCROLL_ATTEMPTS})")
                
                if len(business_cards) >= max_results:
                    break
            
            # Process each business
            business_cards = page.locator('div[role="article"]').all()
            print(f"  🎯 Processing {len(business_cards)} businesses...")
            
            for idx, card in enumerate(business_cards[:max_results]):
                try:
                    # Click to open details panel
                    card.click(timeout=5000)
                    time.sleep(2)  # Wait for details to load
                    
                    # Extract business name
                    name_elem = page.locator('h1.fontHeadlineLarge').first
                    business_name = name_elem.inner_text(timeout=5000) if name_elem.count() > 0 else "Unknown"
                    
                    # Check if website exists (THE FILTER)
                    website_button = page.locator('a[data-item-id="authority"]').first
                    has_website = website_button.count() > 0
                    
                    if has_website:
                        print(f"  ⏭️ [{idx+1}] {business_name[:40]} - HAS WEBSITE (skipping)")
                        continue
                    
                    # NO WEBSITE = HOT LEAD! Extract all details
                    print(f"  🎯 [{idx+1}] {business_name[:40]} - NO WEBSITE ✅")
                    
                    # Extract phone number
                    phone_button = page.locator('button[data-item-id^="phone"]').first
                    phone = None
                    if phone_button.count() > 0:
                        phone_text = phone_button.get_attribute('data-item-id')
                        phone = extract_phone_number(phone_text) if phone_text else None
                    
                    # If no phone button, try aria-label
                    if not phone:
                        phone_elem = page.locator('[aria-label*="Phone"]').first
                        if phone_elem.count() > 0:
                            phone_text = phone_elem.get_attribute('aria-label')
                            phone = extract_phone_number(phone_text) if phone_text else None
                    
                    if not phone:
                        print(f"    ⚠️ No phone number found - skipping")
                        continue
                    
                    # Extract address
                    address_button = page.locator('button[data-item-id="address"]').first
                    address = address_button.inner_text(timeout=3000) if address_button.count() > 0 else "Unknown"
                    
                    # Extract rating
                    rating = None
                    reviews_count = 0
                    rating_elem = page.locator('div.fontBodyMedium span[role="img"]').first
                    if rating_elem.count() > 0:
                        rating_text = rating_elem.get_attribute('aria-label')
                        if rating_text:
                            rating_match = re.search(r'([\d.]+) stars', rating_text)
                            rating = float(rating_match.group(1)) if rating_match else None
                            reviews_match = re.search(r'(\d+) reviews', rating_text)
                            reviews_count = int(reviews_match.group(1)) if reviews_match else 0
                    
                    # Generate cold message
                    cold_message = generate_cold_message(business_name, address, search_query.split()[0])
                    
                    lead = {
                        'company_name': business_name,
                        'phone': phone,
                        'address': address,
                        'rating': rating,
                        'reviews_count': reviews_count,
                        'industry': search_query.split()[0],  # First word (e.g., "Real Estate")
                        'location': search_query,
                        'source': 'google_maps_hunter',
                        'cold_message': cold_message,
                        'lead_score': calculate_lead_score(rating, reviews_count)
                    }
                    
                    leads.append(lead)
                    print(f"    ✅ Extracted: {business_name[:40]} | {phone}")
                    
                except Exception as e:
                    print(f"    ❌ Error processing card {idx+1}: {e}")
                    continue
            
            print(f"  🎯 Found {len(leads)} HOT LEADS (no website)")
            
        except Exception as e:
            print(f"  ❌ Scraping error: {e}")
        
        finally:
            browser.close()
    
    return leads


def calculate_lead_score(rating: Optional[float], reviews_count: int) -> int:
    """
    Score lead 0-100 based on rating and reviews
    Higher score = more established business = higher budget
    """
    score = 50  # Base score
    
    if rating:
        # 5-star = +30, 4-star = +20, 3-star = +10
        if rating >= 4.5:
            score += 30
        elif rating >= 4.0:
            score += 20
        elif rating >= 3.5:
            score += 10
    
    # More reviews = more established
    if reviews_count >= 100:
        score += 20
    elif reviews_count >= 50:
        score += 15
    elif reviews_count >= 20:
        score += 10
    elif reviews_count >= 10:
        score += 5
    
    return min(score, 100)


# ==================== DATABASE & CSV EXPORT ====================

def save_leads_to_database(leads: List[Dict]) -> int:
    """Save leads to SQLite database, return count inserted"""
    if not leads:
        return 0
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    inserted = 0
    for lead in leads:
        try:
            cursor.execute('''
                INSERT INTO leads (
                    company_name, phone, address, rating, reviews_count,
                    industry, location, source, cold_message, lead_score,
                    status, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                lead['company_name'],
                lead['phone'],
                lead['address'],
                lead['rating'],
                lead['reviews_count'],
                lead['industry'],
                lead['location'],
                lead['source'],
                lead['cold_message'],
                lead['lead_score'],
                'new',
                f"No website found on Google Maps. Rating: {lead['rating']}/5, Reviews: {lead['reviews_count']}"
            ))
            inserted += 1
        except sqlite3.IntegrityError:
            print(f"  ⚠️ Duplicate: {lead['company_name']} ({lead['phone']})")
    
    conn.commit()
    conn.close()
    
    print(f"✅ Saved {inserted} new leads to database")
    return inserted


def export_to_csv(leads: List[Dict]):
    """Export leads to CSV for easy sharing"""
    if not leads:
        return
    
    CSV_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    with open(CSV_OUTPUT_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'company_name', 'phone', 'address', 'rating', 'reviews_count',
            'industry', 'location', 'lead_score', 'cold_message'
        ])
        writer.writeheader()
        writer.writerows(leads)
    
    print(f"✅ Exported to CSV: {CSV_OUTPUT_PATH}")


# ==================== MAIN EXECUTION ====================

def main():
    """Main execution - hunt for 100+ leads"""
    print("🚀 Starting Map Hunter...")
    print(f"📊 Target: {len(TARGET_SEARCHES)} search queries")
    print(f"🎯 Goal: 100+ phone numbers by tomorrow morning")
    print("=" * 70)
    
    # Initialize
    init_database()
    
    all_leads = []
    total_searched = 0
    
    # Process each search query
    for idx, search_query in enumerate(TARGET_SEARCHES):
        print(f"\n[{idx + 1}/{len(TARGET_SEARCHES)}] {search_query}")
        
        leads = scrape_google_maps(search_query, max_results=20)
        all_leads.extend(leads)
        total_searched += 1
        
        # Save incrementally (in case of crashes)
        if leads:
            save_leads_to_database(leads)
        
        # Progress report
        print(f"\n📊 Progress: {len(all_leads)} total leads | {total_searched}/{len(TARGET_SEARCHES)} queries")
        
        # Cooldown between searches (avoid rate limiting)
        if idx < len(TARGET_SEARCHES) - 1:
            time.sleep(5)
    
    # Final export
    export_to_csv(all_leads)
    
    # Summary
    print("\n" + "=" * 70)
    print("🏆 MAP HUNTER - OPERATION COMPLETE")
    print("=" * 70)
    print(f"✅ Total Leads Extracted: {len(all_leads)}")
    print(f"📞 Phone Numbers Collected: {len([l for l in all_leads if l['phone']])}")
    print(f"💾 Database: {DATABASE_PATH}")
    print(f"📄 CSV Export: {CSV_OUTPUT_PATH}")
    print(f"🎯 Average Lead Score: {sum(l['lead_score'] for l in all_leads) / len(all_leads):.1f}/100")
    
    if OPENAI_ENABLED:
        cold_messages = len([l for l in all_leads if l.get('cold_message')])
        print(f"🤖 Cold Messages Generated: {cold_messages}/{len(all_leads)}")
    
    print("\n🚀 Ready for outbound aggression!")
    print("💰 Operation 1.3 MILLION - Revenue machine activated")


if __name__ == "__main__":
    main()
