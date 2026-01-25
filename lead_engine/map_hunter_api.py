#!/usr/bin/env python3
"""
MAP HUNTER API - OPERATION 1.3 MILLION
Revenue-Focused Lead Generator using Google Maps API

PURPOSE:
Find Nigerian businesses with HIGH RATINGS but NO WEBSITE.
These are established businesses leaving money on the table.

TECHNOLOGY STACK:
- Google Maps Places API (Text Search + Place Details)
- OpenAI GPT-4 (Personalized cold pitches)
- SQLite (Railway dashboard integration)
- Telegram (High-value alerts)

TARGET OUTPUT:
50+ qualified leads in under 10 minutes.
Each lead includes: Name, Phone, Rating, Pain Score, AI Pitch.

EXECUTION:
python lead_engine/map_hunter_api.py

Author: AMD Solutions 007
License: Commercial (COMMERCIAL_LICENSE.md)
"""

import os
import sqlite3
import time
from datetime import datetime
from typing import List, Dict, Optional
import googlemaps
from openai import OpenAI
import json

# ============================================================================
# CONFIGURATION
# ============================================================================

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Telegram Configuration (for high-value alerts)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# Database Configuration
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "data", "leads.db")

# Search Configuration
TARGET_SEARCHES = [
    # Lagos (Economic Capital)
    "Real Estate Agency Lekki Lagos",
    "Hotels Victoria Island Lagos",
    "Event Planning Lagos",
    "Interior Design Ikoyi Lagos",
    "Logistics Company Ikeja Lagos",
    
    # Abuja (Political Capital)
    "Law Firms Abuja",
    "Accounting Firms Abuja",
    "Construction Company Abuja",
    "Schools Abuja",
    
    # Port Harcourt (Oil Capital)
    "Engineering Firms Port Harcourt",
    "Oil and Gas Services Port Harcourt",
    
    # Other Major Cities
    "Car Dealership Ibadan",
    "Restaurants Enugu",
    "Salons Kano",
    "Gyms Benin City",
]

# Lead Scoring Thresholds
MIN_RATING = 3.5  # Only businesses with decent reputation
MIN_REVIEWS = 5   # Must have some social proof
HIGH_PAIN_THRESHOLD = 70  # Score >= 70 triggers Telegram alert

# API Rate Limiting
REQUESTS_PER_SECOND = 10  # Google Maps API quota management
DELAY_BETWEEN_SEARCHES = 0.5  # seconds

# ============================================================================
# GOOGLE MAPS CLIENT
# ============================================================================

def initialize_gmaps_client() -> Optional[googlemaps.Client]:
    """Initialize Google Maps client with API key."""
    if not GOOGLE_MAPS_API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY not found in environment")
        print("💡 Set it with: export GOOGLE_MAPS_API_KEY='your_key_here'")
        return None
    
    try:
        client = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        print("✅ Google Maps client initialized")
        return client
    except Exception as e:
        print(f"❌ Failed to initialize Google Maps client: {e}")
        return None

# ============================================================================
# OPENAI CLIENT
# ============================================================================

def initialize_openai_client() -> Optional[OpenAI]:
    """Initialize OpenAI client with API key."""
    if not OPENAI_API_KEY:
        print("⚠️  WARNING: OPENAI_API_KEY not found (cold pitches disabled)")
        return None
    
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        print("✅ OpenAI client initialized")
        return client
    except Exception as e:
        print(f"❌ Failed to initialize OpenAI client: {e}")
        return None

# ============================================================================
# PAIN SCORE CALCULATOR
# ============================================================================

def calculate_pain_score(business: Dict) -> int:
    """
    Calculate Pain Score (0-100) for a business without a website.
    
    HIGH SCORE = HIGH PAIN = HIGH CONVERSION PROBABILITY
    
    Factors:
    - Rating: 4.5+ stars = Established reputation (40 points)
    - Review Count: 50+ reviews = Active customer base (30 points)
    - Business Type: Service businesses need websites more (20 points)
    - Location: Premium areas = Higher budget (10 points)
    
    Args:
        business: Dictionary with rating, user_ratings_total, types, formatted_address
    
    Returns:
        Pain score (0-100)
    """
    score = 0
    
    # Rating Factor (0-40 points)
    rating = business.get('rating', 0)
    if rating >= 4.5:
        score += 40
    elif rating >= 4.0:
        score += 30
    elif rating >= 3.5:
        score += 20
    
    # Review Count Factor (0-30 points)
    reviews = business.get('user_ratings_total', 0)
    if reviews >= 100:
        score += 30
    elif reviews >= 50:
        score += 25
    elif reviews >= 20:
        score += 20
    elif reviews >= 10:
        score += 15
    
    # Business Type Factor (0-20 points)
    business_types = business.get('types', [])
    high_value_types = [
        'real_estate_agency', 'lawyer', 'accounting', 'lodging',
        'restaurant', 'car_dealer', 'school', 'gym', 'beauty_salon'
    ]
    if any(t in high_value_types for t in business_types):
        score += 20
    else:
        score += 10
    
    # Location Factor (0-10 points)
    address = business.get('formatted_address', '').lower()
    premium_areas = ['lekki', 'ikoyi', 'victoria island', 'abuja', 'port harcourt']
    if any(area in address for area in premium_areas):
        score += 10
    else:
        score += 5
    
    return min(score, 100)  # Cap at 100

# ============================================================================
# AI PITCH GENERATOR
# ============================================================================

def generate_cold_pitch(business: Dict, openai_client: Optional[OpenAI]) -> str:
    """
    Generate personalized WhatsApp opening message using GPT-4.
    
    Args:
        business: Dictionary with name, types, rating, formatted_address
        openai_client: OpenAI client (None if disabled)
    
    Returns:
        1-sentence cold pitch (120-150 chars)
    """
    if not openai_client:
        return f"Hi {business['name']}, I help businesses like yours get more customers online. Interested?"
    
    # Extract business context
    name = business.get('name', 'Business')
    category = business.get('types', ['business'])[0].replace('_', ' ').title()
    rating = business.get('rating', 0)
    reviews = business.get('user_ratings_total', 0)
    
    prompt = f"""Write a 1-sentence WhatsApp cold message for a {category} business called "{name}".

CONTEXT:
- They have {rating} stars from {reviews} reviews (strong reputation)
- They DON'T have a website (losing customers to competitors)
- I offer affordable website + AI chatbot solutions

RULES:
- Start with their name
- Mention their specific industry
- Hint at their pain (no online presence)
- Keep it under 150 characters
- Sound human, not salesy

Example: "Hi {name}, noticed you're a top-rated {category} but no website yet - competitors are stealing your Google traffic. Quick chat?"
"""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You write killer cold messages for Nigerian businesses."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=80,
            temperature=0.7
        )
        
        pitch = response.choices[0].message.content.strip()
        return pitch[:200]  # Safety cap
    
    except Exception as e:
        print(f"⚠️  OpenAI pitch generation failed: {e}")
        return f"Hi {name}, your {rating}⭐ rating deserves a website. Let's talk?"

# ============================================================================
# GOOGLE MAPS SCRAPER
# ============================================================================

def search_businesses_without_websites(
    gmaps_client: googlemaps.Client,
    openai_client: Optional[OpenAI],
    query: str
) -> List[Dict]:
    """
    Search Google Maps for businesses matching query and filter for NO WEBSITE.
    
    Args:
        gmaps_client: Google Maps client
        openai_client: OpenAI client (optional)
        query: Search query (e.g., "Hotels Lagos")
    
    Returns:
        List of hot lead dictionaries
    """
    print(f"\n🔍 Searching: {query}")
    hot_leads = []
    
    try:
        # Text Search (returns up to 60 results with pagination)
        search_results = gmaps_client.places(query=query, region="ng")
        
        if search_results['status'] != 'OK':
            print(f"⚠️  Search failed: {search_results.get('status')}")
            return []
        
        results = search_results.get('results', [])
        print(f"📊 Found {len(results)} businesses")
        
        for place in results:
            # Skip if already has website
            if 'website' in place and place['website']:
                continue
            
            # Get Place Details for phone number
            place_id = place.get('place_id')
            if not place_id:
                continue
            
            try:
                details = gmaps_client.place(place_id=place_id, fields=[
                    'name', 'formatted_phone_number', 'international_phone_number',
                    'rating', 'user_ratings_total', 'types', 'formatted_address',
                    'website'
                ])
                
                if details['status'] != 'OK':
                    continue
                
                result = details.get('result', {})
                
                # Double-check no website
                if result.get('website'):
                    continue
                
                # Extract phone (prefer international format)
                phone = result.get('international_phone_number') or result.get('formatted_phone_number')
                if not phone:
                    continue  # No phone = can't contact
                
                # Quality filters
                rating = result.get('rating', 0)
                reviews = result.get('user_ratings_total', 0)
                
                if rating < MIN_RATING or reviews < MIN_REVIEWS:
                    continue  # Skip low-quality businesses
                
                # Calculate Pain Score
                pain_score = calculate_pain_score(result)
                
                # Generate AI Pitch
                cold_pitch = generate_cold_pitch(result, openai_client)
                
                # Build lead object
                lead = {
                    'name': result.get('name', 'Unknown'),
                    'phone': phone,
                    'rating': rating,
                    'reviews': reviews,
                    'address': result.get('formatted_address', ''),
                    'category': result.get('types', ['business'])[0].replace('_', ' ').title(),
                    'pain_score': pain_score,
                    'cold_pitch': cold_pitch,
                    'search_query': query,
                    'place_id': place_id,
                    'discovered_at': datetime.now().isoformat()
                }
                
                hot_leads.append(lead)
                print(f"🎯 NO WEBSITE ✅ {lead['name']} | {phone} | Pain: {pain_score}/100")
                
                # Rate limiting
                time.sleep(1 / REQUESTS_PER_SECOND)
            
            except Exception as e:
                print(f"⚠️  Failed to fetch details for {place.get('name')}: {e}")
                continue
        
        print(f"✅ Extracted {len(hot_leads)} hot leads from '{query}'")
        return hot_leads
    
    except Exception as e:
        print(f"❌ Search error for '{query}': {e}")
        return []

# ============================================================================
# DATABASE INTEGRATION
# ============================================================================

def save_leads_to_database(leads: List[Dict]) -> int:
    """
    Save hot leads to Railway dashboard database.
    
    Args:
        leads: List of lead dictionaries
    
    Returns:
        Number of leads saved
    """
    if not leads:
        return 0
    
    # Ensure database directory exists
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Create table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                rating REAL,
                reviews INTEGER,
                address TEXT,
                category TEXT,
                pain_score INTEGER,
                cold_pitch TEXT,
                search_query TEXT,
                place_id TEXT UNIQUE,
                discovered_at TEXT,
                contacted INTEGER DEFAULT 0,
                status TEXT DEFAULT 'new',
                notes TEXT
            )
        """)
        
        # Insert leads (ignore duplicates)
        saved = 0
        for lead in leads:
            try:
                cursor.execute("""
                    INSERT INTO leads (
                        name, phone, rating, reviews, address, category,
                        pain_score, cold_pitch, search_query, place_id, discovered_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    lead['name'], lead['phone'], lead['rating'], lead['reviews'],
                    lead['address'], lead['category'], lead['pain_score'],
                    lead['cold_pitch'], lead['search_query'], lead['place_id'],
                    lead['discovered_at']
                ))
                saved += 1
            except sqlite3.IntegrityError:
                pass  # Duplicate place_id
        
        conn.commit()
        conn.close()
        
        print(f"\n💾 Database: {saved} new leads saved to {DATABASE_PATH}")
        return saved
    
    except Exception as e:
        print(f"❌ Database error: {e}")
        return 0

# ============================================================================
# TELEGRAM ALERTS
# ============================================================================

def send_telegram_alert(lead: Dict):
    """Send Telegram alert for high-value leads (Pain Score >= 70)."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    
    if lead['pain_score'] < HIGH_PAIN_THRESHOLD:
        return
    
    try:
        import requests
        
        message = f"""🔥 HIGH-VALUE LEAD DETECTED

**{lead['name']}**
📞 {lead['phone']}
⭐ {lead['rating']}/5 ({lead['reviews']} reviews)
📍 {lead['address'][:50]}...
💼 {lead['category']}

🎯 PAIN SCORE: {lead['pain_score']}/100

💬 COLD PITCH:
"{lead['cold_pitch']}"

🚀 ACTION: Call within 1 hour for maximum conversion.
"""
        
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            'chat_id': TELEGRAM_CHAT_ID,
            'text': message,
            'parse_mode': 'Markdown'
        }
        
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"✅ Telegram alert sent for {lead['name']}")
    
    except Exception as e:
        print(f"⚠️  Telegram alert failed: {e}")

# ============================================================================
# EXPORT TO CSV
# ============================================================================

def export_to_csv(leads: List[Dict], output_path: str):
    """Export leads to CSV for bulk WhatsApp messaging."""
    if not leads:
        return
    
    try:
        import csv
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'name', 'phone', 'rating', 'reviews', 'address', 'category',
                'pain_score', 'cold_pitch', 'search_query'
            ])
            writer.writeheader()
            writer.writerows(leads)
        
        print(f"📄 CSV Export: {output_path}")
    
    except Exception as e:
        print(f"❌ CSV export failed: {e}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Execute Map Hunter API - Generate 50+ hot leads."""
    print("=" * 70)
    print("🎯 MAP HUNTER API - OPERATION 1.3 MILLION")
    print("=" * 70)
    print(f"🕒 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Target: Businesses with HIGH RATING but NO WEBSITE")
    print(f"📊 Search Queries: {len(TARGET_SEARCHES)}")
    print("=" * 70)
    
    # Initialize clients
    gmaps_client = initialize_gmaps_client()
    if not gmaps_client:
        print("\n❌ FATAL: Cannot proceed without Google Maps API key")
        return
    
    openai_client = initialize_openai_client()
    
    # Execute searches
    all_leads = []
    
    for query in TARGET_SEARCHES:
        leads = search_businesses_without_websites(gmaps_client, openai_client, query)
        all_leads.extend(leads)
        
        # Send Telegram alerts for high-value leads
        for lead in leads:
            if lead['pain_score'] >= HIGH_PAIN_THRESHOLD:
                send_telegram_alert(lead)
        
        # Rate limiting between searches
        time.sleep(DELAY_BETWEEN_SEARCHES)
    
    # Save results
    print("\n" + "=" * 70)
    print("📊 OPERATION RESULTS")
    print("=" * 70)
    print(f"🎯 Total Hot Leads: {len(all_leads)}")
    print(f"📞 Phone Numbers: {len([l for l in all_leads if l['phone']])}")
    print(f"⭐ Avg Rating: {sum(l['rating'] for l in all_leads) / len(all_leads):.1f}" if all_leads else "⭐ Avg Rating: N/A")
    print(f"🔥 High-Pain Leads (>=70): {len([l for l in all_leads if l['pain_score'] >= 70])}")
    
    if all_leads:
        # Save to database
        saved = save_leads_to_database(all_leads)
        
        # Export to CSV
        csv_path = os.path.join(os.path.dirname(DATABASE_PATH), "hot_leads_api.csv")
        export_to_csv(all_leads, csv_path)
        
        # Top 5 leads preview
        print("\n🏆 TOP 5 LEADS:")
        sorted_leads = sorted(all_leads, key=lambda x: x['pain_score'], reverse=True)[:5]
        for i, lead in enumerate(sorted_leads, 1):
            print(f"{i}. {lead['name']} | {lead['phone']} | Pain: {lead['pain_score']}/100")
            print(f"   💬 \"{lead['cold_pitch'][:80]}...\"")
    
    print("\n" + "=" * 70)
    print("✅ OPERATION COMPLETE")
    print("=" * 70)
    print(f"🕒 Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"💾 Database: {DATABASE_PATH}")
    print(f"📄 CSV Export: {csv_path if all_leads else 'N/A'}")
    print("\n🚀 NEXT ACTION: Import CSV to WhatsApp Web and start messaging!")

if __name__ == "__main__":
    main()
