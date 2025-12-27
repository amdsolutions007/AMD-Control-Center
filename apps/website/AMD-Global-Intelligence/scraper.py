"""
AMD Global Intelligence - Automated News Scraper
Collects AI and tech headlines from multiple sources
"""
import requests
import datetime
import os

def fetch_hackernews_ai():
    print("🔍 Fetching Hacker News AI stories...")
    headlines = []
    try:
        # Fetch top stories
        response = requests.get("https://hacker-news.firebaseio.com/v0/beststories.json", timeout=10)
        story_ids = response.json()[:60] # Check top 60
        
        ai_keywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'llm', 
                       'neural', 'deep learning', 'openai', 'anthropic', 'automation', 'robot']
        
        for story_id in story_ids:
            try:
                story_resp = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json", timeout=5)
                story = story_resp.json()
                if not story or 'title' not in story: continue
                
                title = story['title'].lower()
                # Check if title contains any AI keyword
                if any(k in title for k in ai_keywords):
                    headlines.append(f"- [{story['title']}]({story.get('url', '#')})")
            except:
                continue
    except Exception as e:
        print(f"Error fetching HN: {e}")
    return headlines

def update_news_file(headlines):
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    
    if not headlines:
        print("No AI news found today.")
        return

    print(f"✅ Found {len(headlines)} headlines.")
    
    # Read existing content
    content = ""
    if os.path.exists("NEWS.md"):
        with open("NEWS.md", "r") as f:
            content = f.read()

    # Prepend new content
    new_entry = f"\n### 📅 Intelligence Brief: {date_str}\n" + "\n".join(headlines) + "\n"
    
    with open("NEWS.md", "w") as f:
        f.write(new_entry + content)

if __name__ == "__main__":
    news = fetch_hackernews_ai()
    if news:
        update_news_file(news)
    print("🚀 Mission Complete")