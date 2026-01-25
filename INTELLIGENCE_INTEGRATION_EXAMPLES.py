"""
EXAMPLE: Integrating AMD Intelligence Core into existing scripts

This shows how to add AI learning to your current automation scripts.
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BEFORE (Without AI Learning)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def post_to_facebook_old(content, image_path):
    """Old way: Just posts, no learning"""
    try:
        # Post logic here
        result = facebook_api.post(content, image_path)
        print("✅ Posted successfully")
        return result
    except Exception as e:
        print(f"❌ Failed: {e}")
        return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AFTER (With AI Learning) - Just add 3 lines!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

from amd_intelligence_core import intelligence

def post_to_facebook_new(content, image_path):
    """New way: Posts AND trains AI"""
    try:
        # Get AI recommendation first
        recommendation = intelligence.get_recommendation(
            "facebook_post",
            context={
                "content_length": len(content),
                "has_image": bool(image_path),
                "time_of_day": datetime.now().hour
            }
        )
        print(f"🧠 AI Recommendation: {recommendation}")
        
        # Post logic here
        result = facebook_api.post(content, image_path)
        
        # Log success to AI
        intelligence.log_operation(
            "facebook_post",
            data={
                "content": content[:100],  # First 100 chars
                "image": image_path,
                "engagement": result.get("likes", 0)
            },
            result="success"
        )
        
        print("✅ Posted successfully (AI trained)")
        return result
        
    except Exception as e:
        # Log failure to AI
        intelligence.log_operation(
            "facebook_post",
            data={
                "content": content[:100],
                "image": image_path,
                "error": str(e)
            },
            result="failure"
        )
        
        print(f"❌ Failed: {e} (AI learned from failure)")
        return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXAMPLE: Lead Generation with AI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def scrape_leads_with_ai(keyword, location):
    """Lead scraper that learns from patterns"""
    from amd_intelligence_core import intelligence
    
    # Get AI recommendation
    rec = intelligence.get_recommendation(
        "lead_scrape",
        context={"keyword": keyword, "location": location}
    )
    print(f"🧠 AI says: {rec}")
    
    try:
        # Scraping logic
        leads = scrape_google_maps(keyword, location)
        
        # Log to AI
        intelligence.log_operation(
            "lead_scrape",
            data={
                "keyword": keyword,
                "location": location,
                "leads_found": len(leads),
                "avg_quality_score": calculate_quality(leads)
            },
            result="success"
        )
        
        return leads
        
    except Exception as e:
        intelligence.log_operation(
            "lead_scrape",
            data={"keyword": keyword, "location": location, "error": str(e)},
            result="failure"
        )
        raise


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXAMPLE: Daily Intelligence Report
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_daily_intelligence_report():
    """Generate AI-powered insights on all operations"""
    from amd_intelligence_core import intelligence
    
    analysis = intelligence.analyze_patterns()
    
    report = f"""
    ═══════════════════════════════════════════════════════
    🧠 AMD INTELLIGENCE DAILY REPORT
    ═══════════════════════════════════════════════════════
    
    📊 STATISTICS
    Total Operations: {analysis['total_operations']}
    Success Rate: {analysis['overall_success_rate']:.2f}%
    
    📈 BY OPERATION TYPE
    """
    
    for op_type, stats in analysis['by_type'].items():
        report += f"\n    {op_type}:"
        report += f"\n      Total: {stats['total']}"
        report += f"\n      Success Rate: {stats['success_rate']:.2f}%\n"
    
    report += f"""
    
    🤖 AI ANALYSIS & RECOMMENDATIONS
    {analysis['ai_analysis']}
    
    ═══════════════════════════════════════════════════════
    Generated: {analysis['generated_at']}
    ═══════════════════════════════════════════════════════
    """
    
    print(report)
    
    # Send to Telegram
    send_telegram_message(report)
    
    return report


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QUICK START: Add to ANY script in 3 lines
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
Step 1: Import
from amd_intelligence_core import intelligence

Step 2: Log operations
intelligence.log_operation("your_operation", {"data": "here"}, "success")

Step 3: Get recommendations
recommendation = intelligence.get_recommendation("your_operation")
"""
