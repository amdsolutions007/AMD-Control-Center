"""
WhatsApp Bridge - Post RSS articles to WhatsApp War Room
Runs every 2 hours, shares only external news with Leke Leke CTA
"""

import time
import json
import feedparser
from datetime import datetime, timedelta

# Configuration
RSS_FEED_URL = "https://amd-signal-beacon.vercel.app/api/feed"
CHECK_INTERVAL = 2 * 60 * 60  # 2 hours
POSTED_CACHE_FILE = "whatsapp_posted_cache.json"

def load_posted_cache():
    """Load list of already-posted article IDs"""
    try:
        with open(POSTED_CACHE_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_posted_cache(cache):
    """Save list of posted article IDs"""
    with open(POSTED_CACHE_FILE, 'w') as f:
        json.dump(cache, f)

def format_whatsapp_message(article):
    """Format article for WhatsApp posting"""
    title = article.get('title', 'No title')
    link = article.get('link', '')
    
    # Extract article ID from link
    article_id = link.split('/')[-1] if link else 'unknown'
    
    message = f"""🎯 *New Intel Drop*

{title}

📖 Read full brief: {link}

🔥 *Want daily tech intel like this?*
Follow @amd on Leke Leke (Africa's new social platform)
👉 https://www.lekeelekee.com/u/amd

#BuildInAfrica #AMDIntelligence"""
    
    return message, article_id

def check_and_post_new_articles():
    """Check RSS feed and post new articles to WhatsApp"""
    # Load cache of already-posted articles
    posted_cache = load_posted_cache()
    
    # Parse RSS feed
    print(f"[{datetime.now()}] Checking RSS feed...")
    feed = feedparser.parse(RSS_FEED_URL)
    
    new_articles = []
    
    for entry in feed.entries:
        # Extract article ID from link
        article_id = entry.link.split('/')[-1] if entry.link else entry.get('id', 'unknown')
        
        # Skip if already posted
        if article_id in posted_cache:
            continue
        
        # Skip manual posts (they're scheduled, not breaking news)
        if 'type' in entry and entry.type == 'manual':
            continue
        
        # Check if published in last 3 hours (recent news)
        pub_date = datetime(*entry.published_parsed[:6])
        if datetime.now() - pub_date > timedelta(hours=3):
            continue
        
        new_articles.append({
            'id': article_id,
            'title': entry.title,
            'link': entry.link,
            'published': pub_date
        })
    
    if new_articles:
        print(f"Found {len(new_articles)} new articles to post")
        
        for article in new_articles:
            message, article_id = format_whatsapp_message(article)
            
            print(f"\n{'='*60}")
            print("READY TO POST TO WHATSAPP WAR ROOM:")
            print(message)
            print(f"{'='*60}\n")
            
            # TODO: Integrate with WhatsApp automation
            # For now, just print the message
            # Once CAC certificate arrives, integrate with Meta Business API
            
            # Mark as posted
            posted_cache.append(article_id)
        
        # Save updated cache
        save_posted_cache(posted_cache)
    else:
        print("No new articles to post")

def main():
    """Main loop - check RSS every 2 hours"""
    print("🚀 WhatsApp RSS Bridge Started")
    print(f"Monitoring: {RSS_FEED_URL}")
    print(f"Check interval: {CHECK_INTERVAL/3600} hours")
    print("-" * 60)
    
    while True:
        try:
            check_and_post_new_articles()
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print(f"\n💤 Sleeping for {CHECK_INTERVAL/3600} hours...")
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
