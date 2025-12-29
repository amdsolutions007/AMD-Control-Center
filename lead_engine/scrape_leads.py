#!/usr/bin/env python3
"""
Lead Scraper - Nigerian Business Intelligence
Scrapes high-value corporate leads from multiple sources
"""

import requests
from bs4 import BeautifulSoup
import sqlite3
import json
from datetime import datetime
from pathlib import Path
import time
import random

from config import (
    TARGET_INDUSTRIES,
    TARGET_LOCATIONS,
    MIN_EMPLOYEES,
    DATABASE_PATH,
    LEAD_SCORING
)


class LeadScraper:
    """Scrape and qualify leads from Nigerian business directories"""
    
    def __init__(self):
        self.db_path = DATABASE_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()
        
    def _init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL UNIQUE,
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
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                contacted_at TIMESTAMP,
                notes TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_lead_score ON leads(lead_score DESC)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_status ON leads(status)
        ''')
        
        conn.commit()
        conn.close()
    
    def scrape_google_maps(self, industry, location, limit=50):
        """
        Scrape businesses from Google Maps
        Note: In production, use Google Places API for better results
        """
        print(f"\n🗺️ Scraping Google Maps: {industry} in {location}")
        
        # This is a simplified example
        # In production, use Google Places API:
        # https://developers.google.com/maps/documentation/places/web-service/search
        
        leads = []
        
        # Example: Search for tech companies in Lagos
        search_query = f"{industry} companies in {location} Nigeria"
        
        # Mock data for demonstration
        # In production, replace with actual API calls
        mock_companies = self._generate_mock_leads(industry, location, limit)
        
        for company in mock_companies:
            lead_score = self._calculate_lead_score(company)
            
            if lead_score >= 40:  # Minimum qualifying score
                leads.append(company)
                self._save_lead(company, source='google_maps')
        
        print(f"✅ Found {len(leads)} qualified leads from Google Maps")
        return leads
    
    def scrape_linkedin_companies(self, industry, location, limit=30):
        """
        Scrape LinkedIn company pages
        Note: Use LinkedIn Sales Navigator API in production
        """
        print(f"\n💼 Scraping LinkedIn: {industry} in {location}")
        
        # In production, use LinkedIn API:
        # https://docs.microsoft.com/en-us/linkedin/sales/integrations/sales-navigator/
        
        # Mock data for demonstration
        mock_companies = self._generate_mock_leads(industry, location, limit, 'linkedin')
        
        leads = []
        for company in mock_companies:
            # LinkedIn leads score higher
            company['lead_score'] = self._calculate_lead_score(company) + 15
            
            if company['lead_score'] >= 40:
                leads.append(company)
                self._save_lead(company, source='linkedin')
        
        print(f"✅ Found {len(leads)} qualified leads from LinkedIn")
        return leads
    
    def scrape_nigerian_directories(self, limit=100):
        """Scrape Nigerian business directories"""
        print(f"\n📚 Scraping Nigerian Business Directories")
        
        directories = [
            'https://www.nigerianbusinessdirectory.com',
            'https://www.yellowpages.ng',
            'https://www.nairaland.com/business'
        ]
        
        # Mock data
        all_leads = []
        for industry in TARGET_INDUSTRIES[:3]:  # Top 3 industries
            for location in TARGET_LOCATIONS[:2]:  # Top 2 cities
                mock_companies = self._generate_mock_leads(industry, location, 10, 'directory')
                all_leads.extend(mock_companies)
        
        saved_count = 0
        for company in all_leads:
            if self._save_lead(company, source='business_directory'):
                saved_count += 1
        
        print(f"✅ Saved {saved_count} new leads from directories")
        return all_leads
    
    def _generate_mock_leads(self, industry, location, count, source='google'):
        """Generate realistic mock leads for demonstration"""
        companies = []
        
        company_templates = {
            'Technology': ['TechCorp', 'Digital Solutions', 'Innovation Labs', 'Cloud Systems', 'Data Dynamics'],
            'Financial Services': ['Capital Partners', 'Fintech Hub', 'Investment Group', 'Microfinance', 'Banking Solutions'],
            'Real Estate': ['Property Group', 'Estate Developers', 'Urban Properties', 'Land & Homes', 'Realty Partners'],
            'E-commerce': ['Online Market', 'Shop Hub', 'E-Store', 'Digital Commerce', 'Marketplace'],
            'Healthcare': ['Medical Center', 'Health Services', 'Clinic Group', 'Pharma Solutions', 'Care Hub']
        }
        
        templates = company_templates.get(industry, ['Business Group'])
        
        for i in range(min(count, len(templates))):
            company = {
                'company_name': f"{location} {templates[i]}",
                'industry': industry,
                'location': location,
                'website': f"www.{templates[i].lower().replace(' ', '')}{location.lower()}.com.ng",
                'email': f"info@{templates[i].lower().replace(' ', '')}{location.lower()}.com.ng",
                'phone': f"+234 {random.randint(700, 909)} {random.randint(100, 999)} {random.randint(1000, 9999)}",
                'employees_estimate': random.choice([25, 50, 100, 150, 200]),
                'revenue_estimate': random.choice([50_000_000, 100_000_000, 200_000_000, 500_000_000]),
                'decision_maker': 'To Be Found',
                'decision_maker_title': 'CEO',
                'linkedin_url': f"linkedin.com/company/{templates[i].lower().replace(' ', '-')}-{location.lower()}" if source == 'linkedin' else None
            }
            
            company['lead_score'] = self._calculate_lead_score(company)
            companies.append(company)
        
        return companies
    
    def _calculate_lead_score(self, company):
        """Calculate lead qualification score"""
        score = 0
        
        if company.get('website'):
            score += LEAD_SCORING['has_website']
        
        if company.get('linkedin_url'):
            score += LEAD_SCORING['has_linkedin']
        
        if company.get('revenue_estimate', 0) >= 100_000_000:
            score += LEAD_SCORING['revenue_100m_plus']
        
        if company.get('industry') in ['Technology', 'Financial Services']:
            score += LEAD_SCORING['tech_company']
        
        if company.get('location') == 'Lagos':
            score += LEAD_SCORING['lagos_based']
        
        if company.get('employees_estimate', 0) >= MIN_EMPLOYEES:
            score += 10
        
        return score
    
    def _save_lead(self, company, source='unknown'):
        """Save lead to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO leads (
                    company_name, industry, location, website, email, phone,
                    decision_maker, decision_maker_title, linkedin_url,
                    employees_estimate, revenue_estimate, lead_score, source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                company['company_name'],
                company['industry'],
                company['location'],
                company.get('website'),
                company.get('email'),
                company.get('phone'),
                company.get('decision_maker'),
                company.get('decision_maker_title'),
                company.get('linkedin_url'),
                company.get('employees_estimate'),
                company.get('revenue_estimate'),
                company.get('lead_score', 0),
                source
            ))
            
            conn.commit()
            return True
        
        except sqlite3.IntegrityError:
            # Company already exists
            return False
        finally:
            conn.close()
    
    def get_qualified_leads(self, min_score=40, limit=50):
        """Get top qualified leads"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM leads
            WHERE lead_score >= ? AND status = 'new'
            ORDER BY lead_score DESC
            LIMIT ?
        ''', (min_score, limit))
        
        columns = [desc[0] for desc in cursor.description]
        leads = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return leads
    
    def export_to_csv(self, filename='qualified_leads.csv'):
        """Export leads to CSV"""
        import csv
        from config import CSV_EXPORT_PATH
        
        CSV_EXPORT_PATH.mkdir(parents=True, exist_ok=True)
        filepath = CSV_EXPORT_PATH / filename
        
        leads = self.get_qualified_leads(limit=1000)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            if leads:
                writer = csv.DictWriter(f, fieldnames=leads[0].keys())
                writer.writeheader()
                writer.writerows(leads)
        
        print(f"\n✅ Exported {len(leads)} leads to: {filepath}")
        return filepath


def main():
    """Main execution"""
    print("🎯 AMD LEAD GENERATION ENGINE")
    print("=" * 60)
    
    scraper = LeadScraper()
    
    # Scrape multiple sources
    for industry in TARGET_INDUSTRIES[:3]:
        for location in TARGET_LOCATIONS[:2]:
            scraper.scrape_google_maps(industry, location, limit=10)
            time.sleep(1)  # Rate limiting
            
            scraper.scrape_linkedin_companies(industry, location, limit=5)
            time.sleep(1)
    
    # Scrape directories
    scraper.scrape_nigerian_directories(limit=50)
    
    # Show results
    qualified_leads = scraper.get_qualified_leads(min_score=40, limit=50)
    
    print("\n" + "=" * 60)
    print(f"📊 RESULTS: {len(qualified_leads)} Qualified Leads")
    print("=" * 60)
    
    # Show top 10
    print("\n🏆 TOP 10 LEADS:\n")
    for i, lead in enumerate(qualified_leads[:10], 1):
        print(f"{i}. {lead['company_name']}")
        print(f"   Industry: {lead['industry']} | Location: {lead['location']}")
        print(f"   Score: {lead['lead_score']} | Revenue: ₦{lead['revenue_estimate']:,}")
        print(f"   Contact: {lead['email']}\n")
    
    # Export
    scraper.export_to_csv()
    
    print("\n✅ Lead scraping complete!")
    print(f"💡 Next: Run 'python3 send_outreach.py' to contact these leads")


if __name__ == '__main__':
    main()
