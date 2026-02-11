"""
Leke Leke Ghost Writer - Browser Automation (PRODUCTION)
Posts ONLY approved content from Telegram approval queue
CONSTRAINT: Leke Leke platform ONLY (no LinkedIn, Facebook, X, Telegram)
ETHICAL GUIDELINES: Max 20 actions/hour, human-like behavior, CEO-approved content only
"""

import os
import json
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import random
import os

class LekeLekeeAutomation:
    """
    Ghost Writer - Automated posting to Leke Leke
    CONSTRAINT: Leke Leke platform ONLY
    TRIGGER: Posts only CEO-approved content via Telegram bot
    """
    
    def __init__(self, email: str, password: str, headless: bool = True):
        """Initialize Ghost Writer"""
        self.email = email
        self.password = password
        self.driver = None
        self.headless = headless
        
        # Directories
        self.approved_dir = "approved_posts"
        self.posted_dir = "posted_archive"
        self.trigger_file = "trigger_post.flag"
        
        os.makedirs(self.approved_dir, exist_ok=True)
        os.makedirs(self.posted_dir, exist_ok=True)
        
        # Rate limiting (ethical usage)
        self.actions_per_hour = 20
        self.last_action_time = 0
        self.action_count = 0
        
    def start_browser(self):
        """Start Chrome browser"""
        options = Options()
        if self.headless:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=options)
        print("✅ Browser started")
        
    def human_delay(self, min_seconds: float = 2, max_seconds: float = 5):
        """Add random delay to mimic human behavior"""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
        
    def check_rate_limit(self):
        """Ensure we don't exceed rate limits (ethical usage)"""
        current_time = time.time()
        
        # Reset counter every hour
        if current_time - self.last_action_time > 3600:
            self.action_count = 0
            self.last_action_time = current_time
            
        if self.action_count >= self.actions_per_hour:
            wait_time = 3600 - (current_time - self.last_action_time)
            print(f"⚠️ Rate limit reached. Waiting {wait_time/60:.1f} minutes...")
            time.sleep(wait_time)
            self.action_count = 0
            
        self.action_count += 1
        
    def login(self):
        """Login to Leke Leke"""
        try:
            print("🔐 Logging in to Leke Leke...")
            self.driver.get('https://www.lekeelekee.com/login')
            self.human_delay()
            
            # Wait for login form (adjust selectors based on actual page)
            wait = WebDriverWait(self.driver, 10)
            
            # TODO: Update selectors after inspecting actual Leke Leke login page
            email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
            password_field = self.driver.find_element(By.NAME, "password")
            
            # Type with human-like delays
            for char in self.email:
                email_field.send_keys(char)
                time.sleep(random.uniform(0.1, 0.3))
                
            self.human_delay(1, 2)
            
            for char in self.password:
                password_field.send_keys(char)
                time.sleep(random.uniform(0.1, 0.3))
                
            self.human_delay(1, 2)
            
            # Submit form
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()
            approved_content(self, post_data: dict):
        """
        Post CEO-approved content to Leke Leke
        ONLY posts content from approved queue
        """
        try:
            self.check_rate_limit()
            
            caption = post_data['caption']
            image_path = post_data.get('graphic_path')
            state_name = post_data['state_name']
            day = post_data['day']
            
            print(f"📝 Posting Day {day}/36: {state_name} to Leke Leke...")
            self.driver.get('https://www.lekeelekee.com/home')
            self.human_delay()
            
            # TODO: Update selectors after inspecting actual Leke Leke post composer
            wait = WebDriverWait(self.driver, 10)
            
            # Click post composer (adjust selector based on actual page)
            composer = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='post-composer']")))
            composer.click()
            self.human_delay(1, 2)
            
            # Type caption with human-like delays
            text_area = self.driver.find_element(By.CSS_SELECTOR, "textarea[placeholder*='What']")
            for char in caption:
                text_area.send_keys(char)
                time.sleep(random.uniform(0.05, 0.15))
                
            self.human_delay(2, 3)
            
            # Upload graphic if provided
            if image_path and os.path.exists(image_path):
                file_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                file_input.send_keys(os.path.abspath(image_path))
                self.human_delay(3, 5)  # Wait for upload
                print(f"✅ Graphic uploaded: {image_path}")
                
            # Submit post
            post_button = self.driver.find_element(By.CSS_SELECTOR, "button[data-testid='post-submit']")
            post_button.click()
            
            self.human_delay(3, 5)
            print(f"✅ Day {day}/36: {state_name} posted successfully to Leke Leke")
            return True
            
        except Exception as e:
            print(f"❌ Post failed: {str(e)}")
            return False
            
    def check_for_trigger(self):
        """Check if CEO approved a post (via Telegram bot trigger)"""
        if os.path.exists(self.trigger_file):
            with open(self.trigger_file, 'r') as f:
                post_id = f.read().strip()
            # Remove trigger
            os.remove(self.trigger_file)
            return post_id
        return None
        
    def get_approved_post(self, post_id: str):
        """Get approved post data"""
        post_file = os.path.join(self.approved_dir, f"{post_id}.json")
        if os.path.exists(post_file):
            with open(post_file, 'r') as f:
                return json.load(f)
        return None
        
    def archive_posted(self, post_id: str, post_data: dict):
        """Move posted content to archive"""
        # Save to archive
        archive_file = os.path.join(self.posted_dir, f"{post_id}_posted.json")
        post_data['posted_at'] = time.strftime('%Y-%m-%d %H:%M:%S')
        with open(archive_file, 'w') as f:
            json.dump(post_data, f, indent=2)
            
        # Remove from approved queue
        approved_file = os.path.join(self.approved_dir, f"{post_id}.json")
        if os.path.exists(approved_file):
            os.remove(approved_file)
            
        print(f"📦 Post archived: {archive_file}")
        
    def run_ghost_writer_loop(self):
        """
        Main Ghost Writer loop
        Watches for CEO approvals and posts to Leke Leke
        """
        print("👻 GHOST WRITER ACTIVE - Leke Leke ONLY")
        print("📡 Watching for CEO approvals via Telegram bot...")
        print()
        
        if not self.start_browser():
            print("❌ Failed to start browser")
            return
            
        if not self.login():
            print("❌ Login failed")
            self.close()
            return
            
        print("✅ Logged in to Leke Leke")
        print("⏳ Standing by for approved posts...")
        print()
        
        while True:
            try:
                # Check for trigger from Telegram bot
                post_id = self.check_for_trigger()
                
                if post_id:
                    print(f"🎯 CEO APPROVED: {post_id}")
                    
                    # Get post data
                    post_data = self.get_approved_post(post_id)
                    
                    if post_data:
                        # Post to Leke Leke
                        success = self.post_approved_content(post_data)
                        
                        if success:
                            # Archive
                            self.archive_posted(post_id, post_data)
                            print(f"✅ Posted: Day {post_data['day']}/36 - {post_data['state_name']}")
                        else:
                            print(f"❌ Failed to post: {post_id}")
                    else:
                        print(f"❌ Post data not found: {post_id}")
                        
                # Sleep before next check (check every 10 seconds)
                time.sleep(10)
                
            except KeyboardInterrupt:
                print("\n🛑 Ghost Writer stopped by user")
                break
            except Exception as e:
                print(f"❌ Error in Ghost Writer loop: {str(e)}")
                time.sleep(30)  # Wait before retrying
                
        self.close()= self.driver.find_element(By.CSS_SELECTOR, "button[data-testid='post-submit']")
            post_button.click()
            
            self.human_delay(3, 5)
            print("✅ Post published successfully")
            return True
            
        except Exception as e:
            print(f"❌ Post failed: {str(e)}")
            return False
            
    def comment_on_trending(self, post_url: str, comment_text: str):
        """
        Comment on trending post
        ⚠️ Only use for THOUGHTFUL comments (no spam)
        """
        try:
            self.check_rate_limit()
            
            print(f"💬 Commenting on post: {post_url}")
            self.driver.get(post_url)
            self.human_delay()
            
            # TODO: Update selectors after inspecting actual Leke Leke post page
            wait = WebDriverWait(self.driver, 10)
            
            comment_box = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "textarea[placeholder*='comment']")))
            comment_box.click()
            self.human_delay(1, 2)
            
            # Type comment with human-like delays
            for char in comment_text:
                comment_box.send_keys(char)
                time.sleep(random.uniform(0.05, 0.15))
                
            self.human_delay(2, 3)
            
            # Submit comment
            submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[data-testid='comment-submit']")
            submit_button.click()
            
            self.human_delay(2, 4)
            print("✅ Comment posted successfully")
            return True
            
        except Exception as e:
            print(f"❌ Comment failed: {str(e)}")
            return False
            
    def get_follower_count(self) -> int:
        """Get current follower count for analytics"""
        try:
            self.driver.get('https://www.lekeelekee.com/@amd')
            self.human_delay()
            
            # TODO: Update selector after inspecting profile page
            wait = WebDriverWait(self.driver, 10)
            follower_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='follower-count']")))
            
            count = int(follower_element.text.replace(',', ''))
            print(f"📊 Current followers: {count}")
            return count
            
        except Exception as e:
            print(f"❌ Failed to get follower count: {str(e)}")
            return 0
            
    def close(self):
        """Close browser"""
        if self.driver:
            self.driver.quit()
            print("✅ Browser closed")


def demo_usage():
    """
    Production usage for Railway deployment
    """
    print("=" * 80)
    print("GHOST WRITER - LEKE LEKE AUTOMATION")
    print("=" * 80)
    print()
    print("🎯 TARGET: https://www.lekeelekee.com")
    print("🤖 MODE: CEO-Approved Posts Only")
    print("📱 TRIGGER: Telegram Bot Approval")
    print()
    print("=" * 80)
    print()
    
    # Load credentials from env
    email = os.getenv('LEKE_LEKE_EMAIL')
    password = os.getenv('LEKE_LEKE_PASSWORD')
    
    if not email or not password:
        print("❌ Missing credentials:")
        print("   LEKE_LEKE_EMAIL and LEKE_LEKE_PASSWORD must be set in environment")
        return
        
    # Initialize Ghost Writer
    bot = LekeLekeeAutomation(email, password, headless=True)
    
    # Run main loop (watches for CEO approvals)
    bot.run_ghost_writer_loop()


if __name__ == "__main__":
    demo_usage()
