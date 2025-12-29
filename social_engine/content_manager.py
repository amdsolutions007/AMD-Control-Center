"""
Content Manager
Reads marketing content from REVENUE_PACKAGE markdown files,
rotates content intelligently, prevents repeats
"""

import re
import json
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import random

from config import (
    CONTENT_DIR,
    SOCIAL_POSTS_FILE,
    CV_SERVICE_FILE,
    SOURCE_CODE_FILE,
    DATABASE_PATH,
    CONTENT_ROTATION
)


class ContentManager:
    """Manages content extraction, rotation, and posting history"""
    
    def __init__(self):
        self.content_dir = CONTENT_DIR
        self.db_path = DATABASE_PATH
        self._init_database()
        self.content_cache = self._load_all_content()
    
    def _init_database(self):
        """Initialize SQLite database for tracking posted content"""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posted_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                content TEXT NOT NULL,
                content_type TEXT NOT NULL,
                posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                engagement_score INTEGER DEFAULT 0,
                link_clicks INTEGER DEFAULT 0
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_platform 
            ON posted_content(platform)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_posted_at 
            ON posted_content(posted_at DESC)
        ''')
        
        conn.commit()
        conn.close()
    
    def _load_all_content(self) -> Dict[str, List[Dict]]:
        """Load all content from markdown files"""
        content = {
            'linkedin': [],
            'twitter': [],
            'instagram': [],
            'facebook': [],
            'telegram': [],
            'whatsapp': [],
            'cv_service': [],
            'source_code': [],
            'general': []
        }
        
        # Load social media posts
        if SOCIAL_POSTS_FILE.exists():
            content.update(self._parse_social_posts(SOCIAL_POSTS_FILE))
        
        # Load CV service content
        if CV_SERVICE_FILE.exists():
            content['cv_service'] = self._parse_cv_service(CV_SERVICE_FILE)
        
        # Load source code sales content
        if SOURCE_CODE_FILE.exists():
            content['source_code'] = self._parse_source_code(SOURCE_CODE_FILE)
        
        return content
    
    def _parse_social_posts(self, filepath: Path) -> Dict[str, List[Dict]]:
        """Extract posts from SOCIAL_MEDIA_POSTS.md"""
        content = {}
        text = filepath.read_text()
        
        # LinkedIn posts
        linkedin_section = re.search(r'### LinkedIn.*?```(.*?)```', text, re.DOTALL)
        if linkedin_section:
            content['linkedin'] = [{
                'text': linkedin_section.group(1).strip(),
                'type': 'grand_opening',
                'cta': 'WhatsApp'
            }]
        
        # Twitter thread
        twitter_section = re.search(r'### Twitter/X.*?```(.*?)```', text, re.DOTALL)
        if twitter_section:
            tweets = re.findall(r'🧵\s*(\d+/\d+):\s*(.*?)(?=🧵|$)', twitter_section.group(1), re.DOTALL)
            content['twitter'] = [
                {
                    'text': tweet[1].strip(),
                    'thread_position': tweet[0],
                    'type': 'thread',
                    'hashtags': ['AIForNigeria', 'TechSolutions', 'AMDSolutions007']
                }
                for tweet in tweets
            ]
        
        # Instagram
        instagram_section = re.search(r'### Instagram.*?```(.*?)```', text, re.DOTALL)
        if instagram_section:
            content['instagram'] = [{
                'text': instagram_section.group(1).strip(),
                'type': 'carousel',
                'hashtags': ['AI', 'TechInNigeria', 'Innovation']
            }]
        
        # Facebook
        facebook_section = re.search(r'### Facebook.*?```(.*?)```', text, re.DOTALL)
        if facebook_section:
            content['facebook'] = [{
                'text': facebook_section.group(1).strip(),
                'type': 'post',
                'cta': 'Learn More'
            }]
        
        # Telegram
        telegram_section = re.search(r'### Telegram.*?```(.*?)```', text, re.DOTALL)
        if telegram_section:
            content['telegram'] = [{
                'text': telegram_section.group(1).strip(),
                'type': 'channel_post',
                'inline_keyboard': True
            }]
        
        # WhatsApp Status
        whatsapp_section = re.search(r'### WhatsApp Status.*?```(.*?)```', text, re.DOTALL)
        if whatsapp_section:
            statuses = re.findall(r'Status \d+:(.*?)(?=Status \d+:|$)', whatsapp_section.group(1), re.DOTALL)
            content['whatsapp'] = [
                {
                    'text': status.strip(),
                    'type': 'status',
                    'duration': 24  # hours
                }
                for status in statuses if status.strip()
            ]
        
        return content
    
    def _parse_cv_service(self, filepath: Path) -> List[Dict]:
        """Extract CV Analysis service content"""
        text = filepath.read_text()
        posts = []
        
        # Extract pricing tiers
        pricing_section = re.search(r'### \*\*Pricing Structure\*\*(.*?)###', text, re.DOTALL)
        if pricing_section:
            tiers = re.findall(r'#### (.*?)\n- \*\*Price:\*\* (.*?)\n(.*?)(?=####|$)', pricing_section.group(1), re.DOTALL)
            for tier in tiers:
                posts.append({
                    'type': 'service_ad',
                    'service': 'cv_analysis',
                    'tier': tier[0].strip(),
                    'price': tier[1].strip(),
                    'features': tier[2].strip(),
                    'cta': 'WhatsApp',
                    'template': f"🎯 {tier[0]}\n💰 {tier[1]}\n\n{tier[2]}\n\n📞 Chat me on WhatsApp to get started!"
                })
        
        # Sample post templates
        posts.extend([
            {
                'type': 'service_ad',
                'service': 'cv_analysis',
                'template': '🔍 Struggling to get interview callbacks?\n\n✅ Professional CV Analysis\n✅ ATS Optimization\n✅ Expert Recommendations\n✅ Quick 24-hour turnaround\n\nStarting from ₦5,000 only!\n\n📞 WhatsApp: +234 913 449 2041\n\n#CVAnalysis #JobSearch #Nigeria'
            },
            {
                'type': 'service_ad',
                'service': 'cv_analysis',
                'template': '📊 Did you know 75% of CVs never reach human eyes?\n\nATS systems reject them first!\n\n✨ Get your CV professionally reviewed:\n- ATS compatibility check\n- Format optimization\n- Content enhancement\n\n₦5,000 - ₦15,000 (24hr delivery)\n\nDM now! 💼\n\n#CareerGrowth #TechJobs'
            }
        ])
        
        return posts
    
    def _parse_source_code(self, filepath: Path) -> List[Dict]:
        """Extract source code sales content"""
        text = filepath.read_text()
        posts = []
        
        # Extract project listings
        project_section = re.search(r'## 📦 AVAILABLE PROJECTS(.*?)##', text, re.DOTALL)
        if project_section:
            projects = re.findall(
                r'### \d+\.\s*\*\*(.+?)\*\*.*?- \*\*Tech Stack:\*\*\s*(.+?)\n.*?- \*\*Price:\*\*\s*(.+?)\n',
                project_section.group(1),
                re.DOTALL
            )
            
            for project in projects:
                posts.append({
                    'type': 'product_ad',
                    'product': 'source_code',
                    'project_name': project[0].strip(),
                    'tech_stack': project[1].strip(),
                    'price': project[2].strip(),
                    'template': f"💻 {project[0]}\n\n🛠️ Tech: {project[1]}\n💰 Price: {project[2]}\n\n✅ Full source code\n✅ Documentation included\n✅ Installation support\n\nPerfect for students & developers!\n\n📞 WhatsApp: +234 913 449 2041\n\n#SourceCode #FinalYearProject #Nigeria"
                })
        
        # Generic source code ads
        posts.extend([
            {
                'type': 'product_ad',
                'product': 'source_code',
                'template': '🎓 Final Year Project Deadline Approaching?\n\nGet production-ready source code:\n- AI/ML systems\n- Web applications\n- Mobile apps\n- Blockchain solutions\n\n₦15,000 - ₦50,000\nFull documentation + support included!\n\nDM for catalog 📚\n\n#FinalYearProject #SourceCode #StudentLife'
            },
            {
                'type': 'product_ad',
                'product': 'source_code',
                'template': '⚡ Skip months of coding!\n\n10+ ready-made projects:\n✅ Facial Recognition\n✅ Voice AI\n✅ Crypto Tracker\n✅ Property Intelligence\n✅ More...\n\nAll with documentation & installation guide.\n\nPrices: ₦15K - ₦50K\n\nWhatsApp: +234 913 449 2041\n\n#TechForStudents #Nigeria'
            }
        ])
        
        return posts
    
    def get_next_content(self, platform: str, content_type: Optional[str] = None) -> Optional[Dict]:
        """
        Get next content to post based on rotation rules and posting history
        
        Args:
            platform: 'twitter', 'telegram', 'youtube', 'snapchat'
            content_type: Optional specific type to fetch
        
        Returns:
            Content dictionary or None if no content available
        """
        # Decide content type based on rotation frequency
        if not content_type:
            rand = random.random()
            if rand < CONTENT_ROTATION['cv_analysis_frequency']:
                content_type = 'cv_service'
            elif rand < CONTENT_ROTATION['cv_analysis_frequency'] + CONTENT_ROTATION['source_code_frequency']:
                content_type = 'source_code'
            elif rand < CONTENT_ROTATION['cv_analysis_frequency'] + CONTENT_ROTATION['source_code_frequency'] + CONTENT_ROTATION['portfolio_frequency']:
                content_type = 'portfolio'
            else:
                content_type = 'general'
        
        # Get content for this type
        available_content = self.content_cache.get(content_type, [])
        if not available_content:
            # Fallback to platform-specific content
            available_content = self.content_cache.get(platform, [])
        
        if not available_content:
            return None
        
        # Filter out recently posted content
        recent_posts = self._get_recent_posts(platform, days=7)
        recent_texts = {post[0] for post in recent_posts}  # Set of recent content texts
        
        unposted_content = [
            c for c in available_content 
            if c.get('text', c.get('template', '')) not in recent_texts
        ]
        
        if not unposted_content:
            # All content posted recently, start rotation again
            unposted_content = available_content
        
        return random.choice(unposted_content)
    
    def _get_recent_posts(self, platform: str, days: int = 7) -> List[tuple]:
        """Get posts from the last N days"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, content_type, posted_at
            FROM posted_content
            WHERE platform = ? AND posted_at >= datetime('now', ?)
            ORDER BY posted_at DESC
        ''', (platform, f'-{days} days'))
        
        results = cursor.fetchall()
        conn.close()
        
        return results
    
    def mark_as_posted(self, platform: str, content: str, content_type: str) -> int:
        """Mark content as posted"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO posted_content (platform, content, content_type)
            VALUES (?, ?, ?)
        ''', (platform, content, content_type))
        
        post_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return post_id
    
    def update_engagement(self, post_id: int, engagement_score: int, link_clicks: int = 0):
        """Update engagement metrics for a post"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE posted_content
            SET engagement_score = ?, link_clicks = ?
            WHERE id = ?
        ''', (engagement_score, link_clicks, post_id))
        
        conn.commit()
        conn.close()
    
    def get_stats(self, platform: Optional[str] = None) -> Dict:
        """Get posting statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if platform:
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_posts,
                    AVG(engagement_score) as avg_engagement,
                    SUM(link_clicks) as total_clicks
                FROM posted_content
                WHERE platform = ?
            ''', (platform,))
        else:
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_posts,
                    AVG(engagement_score) as avg_engagement,
                    SUM(link_clicks) as total_clicks
                FROM posted_content
            ''')
        
        result = cursor.fetchone()
        conn.close()
        
        return {
            'total_posts': result[0] or 0,
            'avg_engagement': round(result[1] or 0, 2),
            'total_clicks': result[2] or 0
        }


if __name__ == '__main__':
    # Test content manager
    manager = ContentManager()
    
    print("📊 AMD Content Manager - Test\n")
    print("=" * 60)
    
    # Test content loading
    print(f"\n✅ Loaded content types: {list(manager.content_cache.keys())}")
    
    # Test content retrieval
    for platform in ['twitter', 'telegram']:
        content = manager.get_next_content(platform)
        if content:
            print(f"\n🐦 Next {platform} post:")
            print(content.get('text', content.get('template', 'N/A'))[:150])
            print("...")
    
    # Test stats
    stats = manager.get_stats()
    print(f"\n📈 Statistics:")
    print(f"Total posts: {stats['total_posts']}")
    print(f"Avg engagement: {stats['avg_engagement']}")
    print(f"Total clicks: {stats['total_clicks']}")
