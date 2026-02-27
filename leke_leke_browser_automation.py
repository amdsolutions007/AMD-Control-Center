"""
Leke Leke Ghost Writer - Browser Automation (PRODUCTION)
Posts ONLY approved content from Telegram approval queue
CONSTRAINT: Leke Leke platform ONLY (no LinkedIn, Facebook, X, Telegram)
ETHICAL GUIDELINES: Max 20 actions/hour, human-like behavior, CEO-approved content only
"""

import json
import os
import random
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


class LekeLekeeAutomation:
    """
    Ghost Writer - Automated posting to Leke Leke
    CONSTRAINT: Leke Leke platform ONLY
    TRIGGER: Posts only CEO-approved content via Telegram bot
    """

    def __init__(self, email: str, password: str, headless: bool = True, two_factor_callback=None):
        self.email = email
        self.password = password
        self.driver = None
        self.headless = headless
        self.two_factor_callback = two_factor_callback

        self.approved_dir = "approved_posts"
        self.posted_dir = "posted_archive"
        self.trigger_file = "trigger_post.flag"

        os.makedirs(self.approved_dir, exist_ok=True)
        os.makedirs(self.posted_dir, exist_ok=True)

        self.actions_per_hour = 20
        self.last_action_time = 0
        self.action_count = 0

    def start_browser(self) -> bool:
        """Start Chrome browser with stealth mode to bypass anti-bot detection"""
        try:
            options = Options()
            if self.headless:
                options.add_argument("--headless=new")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--disable-infobars")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1920,1080")
            options.add_argument(
                "--user-agent=Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option("useAutomationExtension", False)

            self.driver = webdriver.Chrome(options=options)

            # ── Stealth: spoof navigator.webdriver on every new page ──
            self.driver.execute_cdp_cmd(
                "Page.addScriptToEvaluateOnNewDocument",
                {
                    "source": """
                        Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                        Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3,4,5]});
                        Object.defineProperty(navigator, 'languages', {get: () => ['en-US','en']});
                        window.chrome = {runtime: {}};
                        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
                        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
                        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
                    """
                },
            )

            print("✅ Browser started (stealth mode)")
            return True
        except Exception as e:
            print(f"❌ Failed to start browser: {e}")
            return False

    def _dismiss_overlays(self):
        """Best-effort dismissal for cookie banners/modals that block clicks."""
        if not self.driver:
            return

        selectors = [
            "button[aria-label*='Accept']",
            "button[aria-label*='accept']",
            "button[id*='accept']",
            "button[class*='accept']",
            "button[class*='cookie']",
            "button[id*='cookie']",
            "button[class*='close']",
            "button[aria-label*='Close']",
            "button[aria-label*='Dismiss']",
            "[data-testid='cookie-accept']",
            "[data-testid='close']",
            "[role='dialog'] button",
        ]

        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements[:3]:
                    if element.is_displayed() and element.is_enabled():
                        try:
                            element.click()
                        except Exception:
                            self.driver.execute_script("arguments[0].click();", element)
                        time.sleep(0.3)
            except Exception:
                continue

        try:
            self.driver.execute_script(
                """
                const blockers = Array.from(document.querySelectorAll('div,section,aside'))
                  .filter(el => getComputedStyle(el).position === 'fixed' && el.offsetHeight > 120 && el.offsetWidth > 200)
                  .filter(el => (el.className || '').toString().toLowerCase().includes('cookie') ||
                                (el.id || '').toString().toLowerCase().includes('cookie') ||
                                (el.textContent || '').toLowerCase().includes('cookie'));
                blockers.forEach(el => el.style.display = 'none');
                """
            )
        except Exception:
            pass

    def _safe_click(self, element):
        """Attempt native click first, then JS click fallback."""
        try:
            element.click()
            return
        except Exception:
            pass

        try:
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            time.sleep(0.2)
            self.driver.execute_script("arguments[0].click();", element)
        except Exception as e:
            raise RuntimeError(f"Unable to click element: {e}")

    def human_delay(self, min_seconds: float = 2, max_seconds: float = 5):
        time.sleep(random.uniform(min_seconds, max_seconds))

    def check_rate_limit(self):
        current_time = time.time()

        if current_time - self.last_action_time > 3600:
            self.action_count = 0
            self.last_action_time = current_time

        if self.action_count >= self.actions_per_hour:
            wait_time = 3600 - (current_time - self.last_action_time)
            print(f"⚠️ Rate limit reached. Waiting {wait_time/60:.1f} minutes...")
            time.sleep(max(wait_time, 0))
            self.action_count = 0

        self.action_count += 1

    def login(self, screenshot_path: str = None) -> bool:
        """Login to Leke Leke with 2FA intercept and screenshot diagnostic"""
        try:
            print("🔐 Logging in to Leke Leke...")
            self.driver.get("https://www.lekeelekee.com/login")
            self.human_delay()

            # Handle overlays/cookie banners early
            self._dismiss_overlays()

            wait = WebDriverWait(self.driver, 45)
            email_field = wait.until(EC.presence_of_element_located((By.NAME, "email")))
            password_field = self.driver.find_element(By.NAME, "password")

            for char in self.email:
                email_field.send_keys(char)
                time.sleep(random.uniform(0.05, 0.15))

            self.human_delay(0.5, 1.0)

            for char in self.password:
                password_field.send_keys(char)
                time.sleep(random.uniform(0.05, 0.15))

            self.human_delay(0.5, 1.0)

            # Re-check overlays that may appear after form interaction
            self._dismiss_overlays()

            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            wait.until(lambda d: login_button.is_enabled())
            self._safe_click(login_button)
            self.human_delay(3, 5)

            # ── 2FA / OTP screen detection ────────────────────────────────────
            otp_selectors = [
                "input[name='otp']",
                "input[name='code']",
                "input[name='verification_code']",
                "input[placeholder*='code' i]",
                "input[placeholder*='verification' i]",
                "input[type='text'][maxlength='6']",
                "input[autocomplete='one-time-code']",
            ]
            otp_field = None
            for sel in otp_selectors:
                try:
                    els = self.driver.find_elements(By.CSS_SELECTOR, sel)
                    if els and els[0].is_displayed():
                        otp_field = els[0]
                        break
                except Exception:
                    continue

            if otp_field:
                print("🔐 2FA screen detected!")
                if self.two_factor_callback:
                    code = self.two_factor_callback(
                        "🔐 *LekeeLekee 2FA Required*\n\n"
                        "A verification code was sent to your email/phone.\n\n"
                        "Reply with: `/otp 123456`"
                    )
                    if code and code.strip():
                        otp_field.clear()
                        for char in code.strip():
                            otp_field.send_keys(char)
                            time.sleep(0.1)
                        try:
                            submit = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                            self._safe_click(submit)
                            self.human_delay(2, 4)
                            print(f"✅ 2FA code {code.strip()} submitted")
                        except Exception as submit_err:
                            print(f"⚠️  2FA submit click failed: {submit_err!r}")
                    else:
                        print("⚠️  No OTP code received — continuing anyway")
                else:
                    print("⚠️  2FA screen present but no callback registered")

            print("✅ Login submitted")
            return True

        except Exception as e:
            print(f"❌ Login failed: {e!r}")
            try:
                print(f"🔎 Login debug - URL: {self.driver.current_url}")
                print(f"🔎 Login debug - Title: {self.driver.title}")
            except Exception:
                pass

            # ── Screenshot diagnostic ─────────────────────────────────────────
            if screenshot_path:
                try:
                    self.driver.save_screenshot(screenshot_path)
                    print(f"📸 Failure screenshot saved: {screenshot_path}")
                except Exception as ss_err:
                    print(f"ℹ️  Screenshot capture failed: {ss_err!r}")

            return False

    def post_approved_content(self, post_data: dict) -> bool:
        """Post CEO-approved content to Leke Leke"""
        try:
            self.check_rate_limit()

            caption = post_data["caption"]
            image_path = post_data.get("graphic_path")
            state_name = post_data["state_name"]
            day = post_data["day"]

            print(f"📝 Posting Day {day}/36: {state_name} to Leke Leke...")
            self.driver.get("https://www.lekeelekee.com/home")
            self.human_delay()

            wait = WebDriverWait(self.driver, 45)
            composer = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='post-composer']"))
            )
            composer.click()
            self.human_delay(1, 2)

            text_area = self.driver.find_element(By.CSS_SELECTOR, "textarea[placeholder*='What']")
            for char in caption:
                text_area.send_keys(char)
                time.sleep(random.uniform(0.02, 0.08))

            self.human_delay(1, 2)

            if image_path and os.path.exists(image_path):
                file_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                file_input.send_keys(os.path.abspath(image_path))
                self.human_delay(3, 5)
                print(f"✅ Graphic uploaded: {image_path}")

            post_button = self.driver.find_element(By.CSS_SELECTOR, "button[data-testid='post-submit']")
            post_button.click()

            self.human_delay(3, 5)
            print(f"✅ Day {day}/36: {state_name} posted successfully to Leke Leke")
            return True
        except Exception as e:
            print(f"❌ Post failed: {e}")
            return False

    def check_for_trigger(self):
        if os.path.exists(self.trigger_file):
            with open(self.trigger_file, "r") as f:
                post_id = f.read().strip()
            os.remove(self.trigger_file)
            return post_id
        return None

    def get_approved_post(self, post_id: str):
        post_file = os.path.join(self.approved_dir, f"{post_id}.json")
        if os.path.exists(post_file):
            with open(post_file, "r") as f:
                return json.load(f)
        return None

    def archive_posted(self, post_id: str, post_data: dict):
        archive_file = os.path.join(self.posted_dir, f"{post_id}_posted.json")
        post_data["posted_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
        with open(archive_file, "w") as f:
            json.dump(post_data, f, indent=2)

        approved_file = os.path.join(self.approved_dir, f"{post_id}.json")
        if os.path.exists(approved_file):
            os.remove(approved_file)

        print(f"📦 Post archived: {archive_file}")

    def run_ghost_writer_loop(self):
        print("👻 GHOST WRITER ACTIVE - Leke Leke ONLY")
        print("📡 Watching for CEO approvals via Telegram bot...")
        print()

        while True:
            try:
                if not self.driver:
                    if not self.start_browser():
                        print("❌ Failed to start browser. Retrying in 60 seconds...")
                        time.sleep(60)
                        continue

                if not self.login():
                    print("❌ Login failed. Retrying in 60 seconds...")
                    self.close()
                    self.driver = None
                    time.sleep(60)
                    continue

                print("✅ Logged in to Leke Leke")
                print("⏳ Standing by for approved posts...")
                print()

                post_id = self.check_for_trigger()

                if post_id:
                    print(f"🎯 CEO APPROVED: {post_id}")
                    post_data = self.get_approved_post(post_id)

                    if post_data:
                        success = self.post_approved_content(post_data)
                        if success:
                            self.archive_posted(post_id, post_data)
                            print(f"✅ Posted: Day {post_data['day']}/36 - {post_data['state_name']}")
                        else:
                            print(f"❌ Failed to post: {post_id}")
                    else:
                        print(f"❌ Post data not found: {post_id}")

                time.sleep(10)

            except KeyboardInterrupt:
                print("\n🛑 Ghost Writer stopped by user")
                break
            except Exception as e:
                print(f"❌ Error in Ghost Writer loop: {e}")
                self.close()
                self.driver = None
                time.sleep(30)

        self.close()

    def close(self):
        if self.driver:
            self.driver.quit()
            print("✅ Browser closed")


def demo_usage():
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

    email = os.getenv("LEKE_LEKE_EMAIL")
    password = os.getenv("LEKE_LEKE_PASSWORD")

    if not email or not password:
        print("❌ Missing credentials:")
        print("   LEKE_LEKE_EMAIL and LEKE_LEKE_PASSWORD must be set in environment")
        return

    bot = LekeLekeeAutomation(email, password, headless=True)
    bot.run_ghost_writer_loop()


if __name__ == "__main__":
    demo_usage()
