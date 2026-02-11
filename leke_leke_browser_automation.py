"""
Leke Leke Browser Automation (Grey Area Solution)
Use ONLY if no API access after 30 days
ETHICAL GUIDELINES: Max 20 actions/hour, thoughtful content only, avoid spam
"""

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
    Browser automation for Leke Leke platform
    ⚠️ WARNING: Grey area - use responsibly
    """
    
    def __init__(self, email: str, password: str, headless: bool = False):
        """Initialize browser automation"""
        self.email = email
        self.password = password
        self.driver = None
        self.headless = headless
        
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
            
            self.human_delay(3, 5)
            print("✅ Logged in successfully")
            return True
            
        except Exception as e:
            print(f"❌ Login failed: {str(e)}")
            return False
            
    def post_with_image(self, text: str, image_path: str = None):
        """
        Post content with optional image
        ⚠️ Rate limited to 20 posts/hour (ethical usage)
        """
        try:
            self.check_rate_limit()
            
            print(f"📝 Posting to Leke Leke...")
            self.driver.get('https://www.lekeelekee.com/home')
            self.human_delay()
            
            # TODO: Update selectors after inspecting actual Leke Leke post composer
            wait = WebDriverWait(self.driver, 10)
            
            # Click post composer (adjust selector)
            composer = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='post-composer']")))
            composer.click()
            self.human_delay(1, 2)
            
            # Type post text with human-like delays
            text_area = self.driver.find_element(By.CSS_SELECTOR, "textarea[placeholder*='What']")
            for char in text:
                text_area.send_keys(char)
                time.sleep(random.uniform(0.05, 0.15))
                
            self.human_delay(2, 3)
            
            # Upload image if provided
            if image_path and os.path.exists(image_path):
                file_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                file_input.send_keys(os.path.abspath(image_path))
                self.human_delay(3, 5)  # Wait for upload
                print(f"✅ Image uploaded: {image_path}")
                
            # Submit post
            post_button = self.driver.find_element(By.CSS_SELECTOR, "button[data-testid='post-submit']")
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
    Demo usage (DO NOT RUN without updating selectors)
    """
    print("=" * 80)
    print("LEKE LEKE BROWSER AUTOMATION")
    print("=" * 80)
    print()
    print("⚠️  WARNING: This is a GREY AREA solution")
    print("⚠️  Use ONLY if no API access after 30 days")
    print("⚠️  Risk: Platform may detect and ban automation")
    print()
    print("📋 ETHICAL GUIDELINES:")
    print("- Max 20 actions per hour (rate limited)")
    print("- Thoughtful comments only (no spam)")
    print("- Human-like delays (2-5 seconds)")
    print("- Rotate IPs if possible (use VPN)")
    print("- Monitor for ban warnings")
    print()
    print("🔧 SETUP REQUIRED:")
    print("1. Inspect Leke Leke website HTML")
    print("2. Update CSS selectors in code (marked with TODO)")
    print("3. Test on dev account first (not @amd)")
    print("4. Store credentials in .env file (never hardcode)")
    print()
    print("📊 USE CASES:")
    print("- Auto-post RSS feed items (1-3 times/day)")
    print("- Comment on trending posts (thoughtful engagement)")
    print("- Track analytics (follower growth)")
    print("- Schedule posts (off-peak hours)")
    print()
    print("=" * 80)
    print()
    print("EXAMPLE (after updating selectors):")
    print()
    print("```python")
    print("# Load credentials from .env")
    print("from dotenv import load_dotenv")
    print("load_dotenv()")
    print()
    print("email = os.getenv('LEKE_LEKE_EMAIL')")
    print("password = os.getenv('LEKE_LEKE_PASSWORD')")
    print()
    print("# Initialize bot")
    print("bot = LekeLekeeAutomation(email, password)")
    print("bot.start_browser()")
    print()
    print("# Login")
    print("if bot.login():")
    print("    # Post with AI-generated image")
    print("    bot.post_with_image(")
    print("        text='🎯 DAY 1/37: LAGOS STATE TECH ECOSYSTEM...\\n\\nFull analysis: https://...',")
    print("        image_path='/tmp/lagos-tech-map.png'")
    print("    )")
    print("    ")
    print("    # Get analytics")
    print("    followers = bot.get_follower_count()")
    print("    ")
    print("bot.close()")
    print("```")
    print()
    print("=" * 80)


if __name__ == "__main__":
    demo_usage()
