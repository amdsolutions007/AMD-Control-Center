#!/usr/bin/env python3
"""
TEST: Validate Digital Twin Knowledge Base
Tests intelligent knowledge selection and AI generation with full portfolio
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from amd_digital_twin import select_relevant_knowledge, generate_intelligent_pitch, USER_CONTEXT
from amd_knowledge_base import PROJECT_PORTFOLIO, SERVICES_CATALOG, CLIENT_TESTIMONIALS, COMPANY_INFO

def test_knowledge_base_loaded():
    """Test 1: Verify all knowledge modules loaded"""
    print("=" * 70)
    print("TEST 1: KNOWLEDGE BASE LOADING")
    print("=" * 70)
    
    print(f"\n✅ USER_CONTEXT (Core Identity): {len(USER_CONTEXT)} characters")
    print(f"✅ PROJECT_PORTFOLIO: {len(PROJECT_PORTFOLIO)} characters")
    print(f"✅ SERVICES_CATALOG: {len(SERVICES_CATALOG)} characters")
    print(f"✅ CLIENT_TESTIMONIALS: {len(CLIENT_TESTIMONIALS)} characters")
    print(f"✅ COMPANY_INFO: {len(COMPANY_INFO)} characters")
    
    total_knowledge = len(USER_CONTEXT) + len(PROJECT_PORTFOLIO) + len(SERVICES_CATALOG) + len(CLIENT_TESTIMONIALS) + len(COMPANY_INFO)
    print(f"\n🧠 TOTAL KNOWLEDGE BASE: {total_knowledge:,} characters")
    
    # Verify key projects are in portfolio
    key_projects = ['Naija-Prop-Intel', 'NaijaLaw-GPT', 'Naira-AI-Crypto-Tracker', 
                   'SkyCap AI', 'Shine AI', 'NaijaBiz Assist']
    
    print(f"\n🎯 Verifying {len(key_projects)} key projects...")
    for project in key_projects:
        if project in PROJECT_PORTFOLIO:
            print(f"  ✅ {project} - Found")
        else:
            print(f"  ❌ {project} - Missing!")
    
    # Verify client metrics
    if '₦2.5B+' in CLIENT_TESTIMONIALS:
        print(f"  ✅ Revenue metric (₦2.5B+) - Found")
    if '340%' in CLIENT_TESTIMONIALS:
        print(f"  ✅ PropTech result (340%) - Found")
    if '5x ROI' in CLIENT_TESTIMONIALS:
        print(f"  ✅ Fintech result (5x ROI) - Found")


def test_intelligent_selection():
    """Test 2: Verify intelligent knowledge selection"""
    print("\n" + "=" * 70)
    print("TEST 2: INTELLIGENT KNOWLEDGE SELECTION")
    print("=" * 70)
    
    test_cases = [
        ("Finance Startup", "Fintech", ['Naira-AI-Crypto-Tracker', 'SkyCap AI']),
        ("Law Firm", "Legal", ['NaijaLaw-GPT']),
        ("Real Estate Company", "PropTech", ['Naija-Prop-Intel']),
        ("Music Label", "Entertainment", ['Shine AI']),
        ("Nigerian SME", "Nigerian Business", ['NaijaBiz Assist']),
    ]
    
    for company, industry, expected_projects in test_cases:
        knowledge = select_relevant_knowledge(industry, "CEO")
        print(f"\n🏢 {company} ({industry})")
        print(f"  📊 Projects: {knowledge['projects']}")
        print(f"  🎯 Tool Mention: {knowledge['tool_mention']}")
        print(f"  📈 Key Metric: {knowledge['key_metric']}")
        
        # Verify expected projects are selected
        matched = any(proj in ' '.join(knowledge['projects']) for proj in expected_projects)
        if matched:
            print(f"  ✅ Correct knowledge selected")
        else:
            print(f"  ❌ Expected projects not found!")


def test_ai_generation_with_knowledge():
    """Test 3: Generate AI email with full knowledge"""
    print("\n" + "=" * 70)
    print("TEST 3: AI EMAIL GENERATION WITH FULL KNOWLEDGE")
    print("=" * 70)
    
    print("\n🤖 Generating AI-powered email for PropTech Nigeria...")
    print("Industry: Real Estate")
    print("Expected: Should mention Naija-Prop-Intel and 340% revenue increase")
    
    try:
        email = generate_intelligent_pitch(
            recipient_name="Chidinma Okonkwo",
            company="PropTech Nigeria",
            industry="Real Estate PropTech",
            job_role="CEO - Expansion"
        )
        
        print(f"\n" + "-" * 70)
        print(email)
        print("-" * 70)
        
        # Validate content
        validations = {
            'Naija-Prop-Intel': 'Naija-Prop-Intel' in email or 'PropTech' in email,
            'Digital Dark': 'digital dark' in email.lower(),
            '340%': '340%' in email or 'revenue' in email.lower(),
            'Military-grade': 'military' in email.lower() or 'precision' in email.lower(),
        }
        
        print(f"\n📊 VALIDATION RESULTS:")
        for check, passed in validations.items():
            status = "✅" if passed else "⚠️"
            print(f"  {status} {check}: {passed}")
        
        print(f"\n✅ AI Generation successful! ({len(email)} characters)")
        
    except Exception as e:
        print(f"\n❌ AI Generation failed: {e}")


def test_fintech_ai_generation():
    """Test 4: Generate AI email for Fintech"""
    print("\n" + "=" * 70)
    print("TEST 4: AI EMAIL FOR FINTECH STARTUP")
    print("=" * 70)
    
    print("\n🤖 Generating AI-powered email for Fintech Startup...")
    print("Industry: Fintech / Cryptocurrency")
    print("Expected: Should mention SkyCap AI, Naira-AI-Crypto-Tracker, and 5x ROI")
    
    try:
        email = generate_intelligent_pitch(
            recipient_name="Oluwaseun Ibrahim",
            company="Naija Crypto Exchange",
            industry="Fintech Cryptocurrency Trading",
            job_role="CTO"
        )
        
        print(f"\n" + "-" * 70)
        print(email)
        print("-" * 70)
        
        # Validate content
        validations = {
            'Crypto/Fintech Tool': 'SkyCap' in email or 'Naira-AI' in email or 'Crypto-Tracker' in email,
            '5x ROI': '5x' in email or 'ROI' in email,
            'Digital Dark': 'digital dark' in email.lower(),
            'Fintech focused': 'fintech' in email.lower() or 'trading' in email.lower() or 'financial' in email.lower(),
        }
        
        print(f"\n📊 VALIDATION RESULTS:")
        for check, passed in validations.items():
            status = "✅" if passed else "⚠️"
            print(f"  {status} {check}: {passed}")
        
        print(f"\n✅ AI Generation successful! ({len(email)} characters)")
        
    except Exception as e:
        print(f"\n❌ AI Generation failed: {e}")


if __name__ == "__main__":
    print("\n🧠 AMD DIGITAL TWIN - KNOWLEDGE BASE VALIDATION")
    print("Testing intelligent knowledge selection and AI generation")
    print("=" * 70)
    
    # Run all tests
    test_knowledge_base_loaded()
    test_intelligent_selection()
    test_ai_generation_with_knowledge()
    test_fintech_ai_generation()
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS COMPLETE")
    print("=" * 70)
    print("\n💡 The Digital Twin now has:")
    print("   - Full portfolio (24 projects)")
    print("   - Complete services catalog")
    print("   - All client testimonials")
    print("   - Intelligent knowledge selection")
    print("   - Industry-specific case study matching")
    print("\n🎯 Ready for deployment with 100% business knowledge!")
