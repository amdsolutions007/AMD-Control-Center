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

    def _find_input(self, selectors: list, wait_for_first: bool = True, timeout: int = 45):
        """Race ALL selectors simultaneously — return whichever renders first.
        Polls every 500ms for `timeout` seconds. `wait_for_first` kept for compat.
        """
        import time as _time
        deadline = _time.time() + timeout
        while _time.time() < deadline:
            for by, val in selectors:
                try:
                    els = self.driver.find_elements(by, val)
                    if els and els[0].is_displayed():
                        print(f"✅ Input found via selector: {by}={val!r}")
                        return els[0]
                except Exception:
                    continue
            _time.sleep(0.5)
        # Last-chance sweep (element may exist but not visible)
        for by, val in selectors:
            try:
                els = self.driver.find_elements(by, val)
                if els:
                    print(f"✅ Input found (not-visible) via: {by}={val!r}")
                    return els[0]
            except Exception:
                continue
        return None

    def login(self, screenshot_path: str = None) -> bool:
        """Login to Leke Leke with 2FA intercept and screenshot diagnostic"""
        try:
            print("🔐 Logging in to Leke Leke...")
            self.driver.get("https://www.lekeelekee.com/login")
            self.human_delay()

            # ── Diagnostic: log title + first 500 chars of HTML body ──────────
            try:
                print(f"🔎 Page title: {self.driver.title!r}")
                body_text = self.driver.find_element(By.TAG_NAME, "body").text[:300]
                print(f"🔎 Body preview: {body_text!r}")
            except Exception:
                pass

            # Handle overlays/cookie banners early
            self._dismiss_overlays()

            # ── Email field — PRIORITY: type='email' → id='email' → then fallbacks
            email_selectors = [
                (By.CSS_SELECTOR, "input[type='email']"),          # Super App primary
                (By.CSS_SELECTOR, "input[id='email']"),            # Super App fallback
                (By.CSS_SELECTOR, "input[id*='email' i]"),         # id contains 'email'
                (By.CSS_SELECTOR, "input[autocomplete='email']"),  # autocomplete hint
                (By.NAME,         "email"),                        # legacy name attr
                (By.CSS_SELECTOR, "input[placeholder*='email' i]"),
                (By.CSS_SELECTOR, "input[autocomplete='username']"),
                (By.XPATH,        "//input[@type='email' or @id='email' or contains(@name,'email')]"),
            ]
            email_field = self._find_input(email_selectors, wait_for_first=True, timeout=45)
            if email_field is None:
                raise TimeoutError("Email input not found with any selector")

            # ── Password field — multiple selector fallbacks ──────────────────
            password_selectors = [
                (By.NAME,         "password"),
                (By.CSS_SELECTOR, "input[type='password']"),
                (By.CSS_SELECTOR, "input[id*='password' i]"),
                (By.CSS_SELECTOR, "input[placeholder*='password' i]"),
                (By.XPATH,        "//input[@type='password']"),
            ]
            password_field = self._find_input(password_selectors, wait_for_first=False)
            if password_field is None:
                raise TimeoutError("Password input not found with any selector")

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

            # ── Cloudflare Turnstile: wait up to 45s for auto-solve ───────────
            # Turnstile populates a hidden 'cf-turnstile-response' input when solved.
            # In headless=new with stealth fingerprinting it usually auto-solves in 5-20s.
            print("⏳ Waiting for Cloudflare Turnstile to auto-solve (up to 45s)...")
            turnstile_solved = False
            turnstile_deadline = time.time() + 45
            while time.time() < turnstile_deadline:
                try:
                    token = self.driver.execute_script(
                        "var el = document.querySelector('input[name=\"cf-turnstile-response\"]');"
                        "return el ? el.value : '';"
                    )
                    if token and token.strip():
                        print(f"✅ Turnstile solved — token present ({len(token)} chars)")
                        turnstile_solved = True
                        break
                except Exception:
                    pass
                time.sleep(1)

            if not turnstile_solved:
                print("⚠️  Turnstile did not auto-solve — attempting JS form submit bypass")

            # ── Submit button — try multiple selectors ────────────────────────
            submit_selectors = [
                "button[type='submit']",
                "input[type='submit']",
                "button[class*='login' i]",
                "button[class*='signin' i]",
                "button[class*='submit' i]",
            ]
            login_button = None
            for sel in submit_selectors:
                try:
                    els = self.driver.find_elements(By.CSS_SELECTOR, sel)
                    if els:
                        login_button = els[0]
                        break
                except Exception:
                    continue
            if login_button is None:
                raise TimeoutError("Login submit button not found with any selector")

            if turnstile_solved:
                # Normal path: button should be enabled now
                try:
                    WebDriverWait(self.driver, 5).until(lambda d: login_button.is_enabled())
                    self._safe_click(login_button)
                    print("✅ Submit button clicked (Turnstile passed)")
                except Exception:
                    # Button still disabled — force JS click anyway
                    self.driver.execute_script("arguments[0].removeAttribute('disabled'); arguments[0].click();", login_button)
                    print("✅ Submit button JS-forced (Turnstile passed but button still disabled)")
            else:
                # Turnstile bypass: remove disabled attr and submit via JS
                try:
                    self.driver.execute_script(
                        "arguments[0].removeAttribute('disabled'); arguments[0].click();",
                        login_button
                    )
                    print("✅ Submit button JS-forced (Turnstile bypass)")
                except Exception:
                    # Last resort: submit the form directly
                    self.driver.execute_script(
                        "var form = document.querySelector('form'); if(form) form.submit();"
                    )
                    print("✅ Form submitted via JS (last resort)")

            # ── Wait for redirect away from /login (success indicator) ────────
            print("⏳ Waiting for post-login redirect...")
            try:
                WebDriverWait(self.driver, 15).until(
                    lambda d: "/login" not in d.current_url
                )
                print(f"✅ Redirected to: {self.driver.current_url}")
            except Exception:
                # May still be on /login due to wrong credentials or CAPTCHA block
                current_url = self.driver.current_url
                page_text = ""
                try:
                    page_text = self.driver.find_element(By.TAG_NAME, "body").text[:200]
                except Exception:
                    pass
                print(f"⚠️  Still on login page after submit. URL: {current_url!r}")
                print(f"⚠️  Page text: {page_text!r}")
                # Check if there's an error message (wrong password etc)
                if any(w in page_text.lower() for w in ["invalid", "incorrect", "wrong", "error", "failed"]):
                    raise RuntimeError(f"Login credentials rejected: {page_text[:100]}")
                # Otherwise Turnstile is blocking — raise for screenshot
                raise RuntimeError("Stuck on login page — Turnstile or server block")

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
                print(f"🔎 Login debug - Title: {self.driver.title!r}")
                # Dump truncated page source so we can diagnose selector issues
                src = self.driver.page_source or ""
                print(f"🔎 Page source (first 800 chars): {src[:800]!r}")
                # Also list all input fields present
                inputs = self.driver.find_elements(By.TAG_NAME, "input")
                for inp in inputs[:10]:
                    try:
                        print(f"🔎 Input: type={inp.get_attribute('type')!r} "
                              f"name={inp.get_attribute('name')!r} "
                              f"id={inp.get_attribute('id')!r} "
                              f"placeholder={inp.get_attribute('placeholder')!r}")
                    except Exception:
                        pass
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

    # ─────────────────────────────────────────────────────────────────
    # DUAL-DESTINATION POSTING  (Group → 5-min delay → General Feed)
    # ─────────────────────────────────────────────────────────────────

    HASHTAG_POOL = ['#AMD007', '#Solutions007', '#AMDSolutions', '#007system']
    ANCHOR_LINK  = 'www.amdsolutions007.com/tech'
    SLIM_MAX     = 489   # strict <490 chars

    def slim_caption(self, full_caption: str) -> str:
        """Return a platform-safe slim caption: ≤489 chars with 2 random hashtags + anchor."""
        tags   = ' '.join(random.sample(self.HASHTAG_POOL, 2))
        suffix = f"\n\n{tags}\n{self.ANCHOR_LINK}"
        budget = self.SLIM_MAX - len(suffix)
        body   = full_caption[:budget].rstrip()
        return body + suffix

    def _post_to_url(self, caption: str, image_path: str, dest_url: str, label: str) -> bool:
        """Navigate to *dest_url*, open composer, type caption, attach image, submit."""
        try:
            self.driver.get(dest_url)
            wait = WebDriverWait(self.driver, 45)

            composer = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='post-composer']"))
            )
            composer.click()
            self.human_delay(1, 2)

            textarea = wait.until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "textarea[placeholder*='What']")
                )
            )
            for ch in caption:
                textarea.send_keys(ch)
                time.sleep(random.uniform(0.02, 0.07))

            self.human_delay(1, 2)

            if image_path and os.path.exists(image_path):
                file_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                file_input.send_keys(os.path.abspath(image_path))
                self.human_delay(3, 5)
                print(f"✅ Graphic uploaded: {image_path}")

            post_button = self.driver.find_element(
                By.CSS_SELECTOR, "button[data-testid='post-submit']"
            )
            post_button.click()
            self.human_delay(3, 5)

            print(f"✅ [{label}] Posted successfully")
            return True

        except Exception as e:
            print(f"❌ [{label}] Post failed: {e}")
            return False

    def post_dual_destination(self, post_data: dict) -> bool:
        """
        1. Post FULL caption to African Tech Ecosystem group.
        2. Wait 5 minutes (rate-limit-friendly).
        3. Post SLIM caption (<490 chars, 2 shuffled hashtags, anchor) to General Feed.
        Returns True only when BOTH posts succeed.
        """
        full_caption = post_data.get('caption', '')
        image_path   = post_data.get('image_path', '')

        # ── Group URL from env, fallback to known slug ──────────────
        group_url = os.getenv(
            'LEKE_LEKE_GROUP_URL',
            'https://www.lekeelekee.com/groups/african-tech-ecosystem'
        )
        feed_url = 'https://www.lekeelekee.com/home'

        # ── Step 1: Group post (full caption) ───────────────────────
        print("📤 [DUAL-POST] Step 1/3 — Posting to African Tech Ecosystem group…")
        group_ok = self._post_to_url(full_caption, image_path, group_url, 'Group')
        if not group_ok:
            print("⚠️ Group post failed — aborting dual-post sequence.")
            return False

        # ── Step 2: 5-minute safety delay ───────────────────────────
        delay_secs = 300
        print(f"⏳ [DUAL-POST] Step 2/3 — Waiting {delay_secs // 60} minutes before feed post…")
        for elapsed in range(0, delay_secs, 60):
            remaining = delay_secs - elapsed
            print(f"   … {remaining}s remaining")
            time.sleep(60)
        print("   … 0s remaining — proceeding to feed post")

        # ── Step 3: Feed post (slim caption) ────────────────────────
        slim = self.slim_caption(full_caption)
        print(f"📤 [DUAL-POST] Step 3/3 — Posting slim caption ({len(slim)} chars) to General Feed…")
        feed_ok = self._post_to_url(slim, image_path, feed_url, 'Feed')

        if feed_ok:
            print("🎉 [DUAL-POST] Both posts succeeded — Group ✅  Feed ✅")
        else:
            print("⚠️ [DUAL-POST] Feed post failed (group already published).")

        return group_ok and feed_ok

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
