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
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
try:
    import undetected_chromedriver as uc
    _UC_AVAILABLE = True
except ImportError:
    _UC_AVAILABLE = False
    from selenium import webdriver
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

    # ── Residential Proxy helper ─────────────────────────────────────────────
    @staticmethod
    def _build_proxy_extension(proxy_host: str, proxy_port: str,
                               proxy_user: str, proxy_pass: str) -> str:
        """Build an in-memory Chrome proxy-auth extension and return its temp dir path.
        Required when the proxy URL contains user:pass credentials."""
        import zipfile, tempfile, base64
        manifest = json.dumps({
            "version": "1.0.0",
            "manifest_version": 2,
            "name": "Proxy Auth",
            "permissions": ["proxy", "tabs", "unlimitedStorage",
                             "storage", "<all_urls>", "webRequest",
                             "webRequestBlocking"],
            "background": {"scripts": ["background.js"]},
            "minimum_chrome_version": "22.0.0"
        })
        background_js = f"""
        var config = {{
            mode: "fixed_servers",
            rules: {{ singleProxy: {{ scheme: "http", host: "{proxy_host}",
                                      port: parseInt("{proxy_port}") }},
                      bypassList: ["localhost"] }}
        }};
        chrome.proxy.settings.set({{value: config, scope: "regular"}}, function(){{}});
        function callbackFn(details) {{
            return {{ authCredentials: {{ username: "{proxy_user}",
                                         password: "{proxy_pass}" }} }};
        }}
        chrome.webRequest.onAuthRequired.addListener(
            callbackFn, {{urls: ["<all_urls>"]}}, ["blocking"]
        );
        """
        tmp_dir = tempfile.mkdtemp(prefix="proxy_ext_")
        zip_path = os.path.join(tmp_dir, "proxy_auth.zip")
        with zipfile.ZipFile(zip_path, "w") as zf:
            zf.writestr("manifest.json", manifest)
            zf.writestr("background.js", background_js)
        return zip_path

    def start_browser(self) -> bool:
        """Start Chrome browser, defeating Cloudflare Turnstile.

        Priority order:
        1. BRIGHTDATA_WS_ENDPOINT — remote Scraping Browser (handles CF natively)
        2. LEKE_LEKE_PROXY + local UC Chrome — residential proxy via Xvfb
        3. Local UC Chrome, no proxy (will fail on Railway due to CF IP block)

        BrightData setup (recommended — guaranteed CF bypass):
          Sign up at brightdata.com → Scraping Browser zone → copy WebDriver URL
          Set Railway env var: BRIGHTDATA_WS_ENDPOINT=https://brd-customer-...:PASSWORD@brd.superproxy.io:9515
        """
        try:
            import subprocess as _sp
            import os as _os

            # ── PRIORITY 1: BrightData Scraping Browser (remote CDP) ─────────
            # Purpose-built CF bypass — routes through residential IPs with CF
            # partnership. No local Chrome, no Xvfb, no proxy extension needed.
            bd_endpoint = _os.environ.get("BRIGHTDATA_WS_ENDPOINT", "").strip()
            if bd_endpoint:
                from selenium import webdriver as _wd
                options = _wd.ChromeOptions()
                # BrightData requires these capabilities
                options.set_capability("browserName", "chrome")
                # Mask the endpoint URL in logs (contains credentials)
                _host_part = bd_endpoint.split("@")[-1] if "@" in bd_endpoint else bd_endpoint
                print(f"🌐 BrightData Scraping Browser → {_host_part}")
                self.driver = _wd.Remote(
                    command_executor=bd_endpoint,
                    options=options,
                )
                print("✅ Browser started (BrightData Scraping Browser — CF bypass active)")
                return True

            # ── PRIORITY 2: Residential proxy configuration ───────────────────
            proxy_url = _os.environ.get("LEKE_LEKE_PROXY", "").strip()
            proxy_ext_path = None
            if proxy_url:
                from urllib.parse import urlparse as _urlparse
                _p = _urlparse(proxy_url)
                proxy_host = _p.hostname or ""
                proxy_port = str(_p.port or 80)
                proxy_user = _p.username or ""
                proxy_pass = _p.password or ""
                print(f"🌐 Residential proxy: {proxy_host}:{proxy_port} "
                      f"({'auth' if proxy_user else 'IP-auth / no-auth'})")
            else:
                proxy_host = proxy_port = proxy_user = proxy_pass = ""
                print("⚠️  No LEKE_LEKE_PROXY set — Cloudflare IP block will likely prevent login")

            # ── Launch Xvfb virtual display on :99 ───────────────────────────
            display = _os.environ.get("DISPLAY", ":99")
            try:
                _sp.Popen(
                    ["Xvfb", display, "-screen", "0", "1920x1080x24", "-ac"],
                    stdout=_sp.DEVNULL, stderr=_sp.DEVNULL
                )
                time.sleep(1)
                print(f"✅ Xvfb started on {display}")
            except FileNotFoundError:
                print("⚠️  Xvfb not found — display may not be available")
            except Exception as xvfb_err:
                print(f"⚠️  Xvfb launch error (non-fatal): {xvfb_err!r}")

            if _UC_AVAILABLE:
                # ── undetected-chromedriver: patches ChromeDriver at binary level
                #    so Cloudflare Turnstile cannot detect automation
                options = uc.ChromeOptions()
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                options.add_argument("--disable-gpu")
                options.add_argument("--window-size=1920,1080")
                options.add_argument(
                    "--user-agent=Mozilla/5.0 (X11; Linux x86_64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                )
                # ── Proxy: use packed extension for auth, flag for no-auth ──
                if proxy_url:
                    if proxy_user:
                        proxy_ext_path = self._build_proxy_extension(
                            proxy_host, proxy_port, proxy_user, proxy_pass)
                        options.add_extension(proxy_ext_path)
                        print(f"🔌 Proxy auth extension loaded")
                    else:
                        options.add_argument(f"--proxy-server=http://{proxy_host}:{proxy_port}")
                self.driver = uc.Chrome(
                    options=options,
                    driver_executable_path="/usr/bin/chromedriver",
                    browser_executable_path="/usr/bin/chromium",
                    use_subprocess=False,
                    headless=False,  # Xvfb on :99 provides the virtual display
                )
                print("✅ Browser started (undetected-chromedriver + Xvfb" +
                      ("+proxy" if proxy_url else "") + ")")
            else:
                # Fallback: plain Selenium (Turnstile may still block)
                from selenium import webdriver as _wd
                from selenium.webdriver.chrome.options import Options as _Opts
                options = _Opts()
                options.add_argument("--headless=new")
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                options.add_argument("--disable-blink-features=AutomationControlled")
                options.add_argument("--disable-gpu")
                options.add_argument("--window-size=1920,1080")
                if proxy_url:
                    if proxy_user:
                        proxy_ext_path = self._build_proxy_extension(
                            proxy_host, proxy_port, proxy_user, proxy_pass)
                        options.add_extension(proxy_ext_path)
                    else:
                        options.add_argument(f"--proxy-server=http://{proxy_host}:{proxy_port}")
                options.add_experimental_option("excludeSwitches", ["enable-automation"])
                options.add_experimental_option("useAutomationExtension", False)
                self.driver = _wd.Chrome(options=options)
                print("✅ Browser started (selenium fallback — Turnstile may block)")

            # ── Stealth CDP overrides (belt-and-suspenders) ──────────────────
            try:
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
            except Exception:
                pass  # uc already handles these; non-fatal if CDP call fails

            return True
        except Exception as e:
            print(f"❌ Failed to start browser: {e}")
            return False

    def _fill_field(self, element, value: str):
        """Fill an input field reliably on both local and remote (BrightData) WebDrivers.

        LekeeLekee uses React controlled components — we must update React state.
        BrightData allows ActionChains for email fields but blocks type=password.
        We stop after the FIRST successful fill to avoid duplicating text.
        """
        from selenium.webdriver.common.action_chains import ActionChains
        from selenium.webdriver.common.keys import Keys as _Keys
        field_tag = ""
        try:
            field_tag = f"({element.get_attribute('type') or element.tag_name})"
        except Exception:
            pass

        # Helper: verify fill actually worked
        def _check_value(el, expected):
            try:
                v = el.get_attribute('value') or ""
                return expected in v or len(v) >= len(expected)
            except Exception:
                return False

        # Attempt 0 — JS React-native-setter FIRST (most complete — sets DOM + triggers React)
        try:
            self.driver.execute_script(
                """
                var el = arguments[0];
                var val = arguments[1];
                var nativeSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value').set;
                nativeSetter.call(el, val);
                el.dispatchEvent(new InputEvent('input',  {bubbles:true, inputType:'insertText', data:val}));
                el.dispatchEvent(new Event('change', {bubbles:true}));
                """,
                element, value
            )
            if _check_value(element, value):
                print(f"  [fill{field_tag}] JS nativeSetter ok, val={len(value)}")
                return
        except Exception as e0:
            print(f"  [fill{field_tag}] JS nativeSetter: {e0!r}")

        # Attempt 1 — W3C Actions API (select-all then type)
        try:
            ActionChains(self.driver)\
                .click(element)\
                .key_down(_Keys.CONTROL).send_keys('a').key_up(_Keys.CONTROL)\
                .key_down(_Keys.DELETE).key_up(_Keys.DELETE)\
                .send_keys(value)\
                .perform()
            if _check_value(element, value):
                print(f"  [fill{field_tag}] ActionChains ok, val={len(value)}")
                return
        except Exception as e1:
            print(f"  [fill{field_tag}] ActionChains: {e1!r}")

        # Attempt 2 — CDP Input.insertText (focus via click first)
        try:
            element.click()
            # select-all + delete via CDP dispatch
            self.driver.execute_cdp_cmd('Input.dispatchKeyEvent', {'type':'keyDown','key':'a','modifiers':2})
            self.driver.execute_cdp_cmd('Input.dispatchKeyEvent', {'type':'keyDown','key':'Delete'})
            time.sleep(0.05)
            self.driver.execute_cdp_cmd('Input.insertText', {'text': value})
            if _check_value(element, value):
                print(f"  [fill{field_tag}] CDP insertText ok, val={len(value)}")
                return
        except Exception as e2:
            print(f"  [fill{field_tag}] CDP insertText: {e2!r}")

        # Attempt 3 — last resort element send_keys
        try:
            element.click()
            element.send_keys(_Keys.CONTROL + 'a')
            element.send_keys(value)
            print(f"  [fill{field_tag}] send_keys ok (no readback check)")
        except Exception as e3:
            print(f"  [fill{field_tag}] send_keys: {e3!r}")

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

    # ─────────────────────────────────────────────────────────────────────────
    # COOKIE INJECTION — bypasses Cloudflare Turnstile entirely
    # Cookies are extracted once by CEO from their real browser, stored in
    # lekee_cookies.json (persisted) or LEKE_LEKE_COOKIES env var.
    # ─────────────────────────────────────────────────────────────────────────
    COOKIE_FILE = "lekee_cookies.json"

    def save_cookies(self, cookies_json: str) -> bool:
        """Parse and save cookies JSON string to disk. Called by /cookies command."""
        try:
            cookies = json.loads(cookies_json)
            if not isinstance(cookies, list):
                raise ValueError("Expected a JSON array of cookie objects")
            with open(self.COOKIE_FILE, "w") as f:
                json.dump(cookies, f, indent=2)
            print(f"✅ Saved {len(cookies)} cookies to {self.COOKIE_FILE}")
            return True
        except Exception as e:
            print(f"❌ save_cookies failed: {e!r}")
            return False

    def _load_cookies(self) -> list:
        """Load cookies from file or LEKE_LEKE_COOKIES env var."""
        # 1. Try file first (set by /cookies command)
        if os.path.exists(self.COOKIE_FILE):
            try:
                with open(self.COOKIE_FILE) as f:
                    cookies = json.load(f)
                if cookies:
                    print(f"📂 Loaded {len(cookies)} cookies from {self.COOKIE_FILE}")
                    return cookies
            except Exception as e:
                print(f"⚠️  Cookie file unreadable: {e!r}")
        # 2. Try env var (Railway secret)
        env_cookies = os.getenv("LEKE_LEKE_COOKIES", "").strip()
        if env_cookies:
            try:
                cookies = json.loads(env_cookies)
                if cookies:
                    print(f"🔑 Loaded {len(cookies)} cookies from LEKE_LEKE_COOKIES env var")
                    return cookies
            except Exception as e:
                print(f"⚠️  LEKE_LEKE_COOKIES env var invalid JSON: {e!r}")
        return []

    def login_with_cookies(self) -> bool:
        """Primary login path: inject stored session cookies → navigate to /home.
        Returns True if session is valid (redirected away from /login).
        """
        cookies = self._load_cookies()
        if not cookies:
            print("ℹ️  No stored cookies — falling back to credential login")
            return False

        try:
            # Must be on the domain before adding cookies
            self.driver.get("https://www.lekeelekee.com")
            self.human_delay(1, 2)

            # Clear any existing cookies then inject stored set
            self.driver.delete_all_cookies()
            for cookie in cookies:
                # Remove keys Selenium doesn't accept
                clean = {k: v for k, v in cookie.items()
                         if k in ("name", "value", "domain", "path", "secure",
                                  "httpOnly", "expiry", "sameSite")}
                try:
                    self.driver.add_cookie(clean)
                except Exception:
                    pass  # skip malformed cookie entries

            # Log which cookie names were injected (not values — no secrets in logs)
            injected_names = [c.get("name", "?") for c in cookies]
            print(f"🍪 Injected cookie names: {injected_names}")

            # Navigate to home — if cookies are valid we'll land there
            self.driver.get("https://www.lekeelekee.com/home")
            self.human_delay(2, 3)

            current_url = self.driver.current_url
            if "/login" in current_url:
                print("⚠️  Cookie session invalid or expired — falling back to credentials")
                # Delete stale cookie file so next run re-prompts CEO
                try:
                    os.remove(self.COOKIE_FILE)
                    print("🗑️  Stale cookie file removed")
                except Exception:
                    pass
                return False

            print(f"✅ Cookie login successful — landed on: {current_url}")
            return True

        except Exception as e:
            print(f"⚠️  Cookie login error: {e!r} — falling back to credentials")
            return False
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
        """Login: try cookie injection first (bypasses Turnstile), fall back to credentials."""
        # ── PRIMARY: cookie injection (no CAPTCHA) ────────────────────────────
        if self.login_with_cookies():
            return True

        # ── FALLBACK: credential login ─────────────────────────────────────────
        print("🔐 Logging in to Leke Leke (credential path)...")
        try:
            self.driver.get("https://www.lekeelekee.com/login")
            self.human_delay()

            # Diagnostic
            try:
                print(f"🔎 Page title: {self.driver.title!r}")
                body_text = self.driver.find_element(By.TAG_NAME, "body").text[:300]
                print(f"🔎 Body preview: {body_text!r}")
            except Exception:
                pass

            # Dismiss overlays before any interaction
            self._dismiss_overlays()

            # ── STEP 1: Wait for Cloudflare Turnstile to auto-solve ──────────
            # BrightData auto-solves Turnstile on page load — we wait BEFORE
            # filling the form so we don't interfere with the CAPTCHA evaluator.
            print("⏳ Waiting for Cloudflare Turnstile to auto-solve (up to 45s)...")
            turnstile_solved = False
            turnstile_token  = ""
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
                        turnstile_token  = token
                        break
                except Exception:
                    pass
                time.sleep(1)
            if not turnstile_solved:
                print("⚠️  Turnstile did not auto-solve — will proceed anyway")

            # ── STEP 2: Find form fields (fresh references after Turnstile wait) ──
            email_selectors = [
                (By.CSS_SELECTOR, "input[type='email']"),
                (By.CSS_SELECTOR, "input[id='email']"),
                (By.CSS_SELECTOR, "input[id*='email' i]"),
                (By.CSS_SELECTOR, "input[autocomplete='email']"),
                (By.NAME,         "email"),
                (By.CSS_SELECTOR, "input[placeholder*='email' i]"),
                (By.CSS_SELECTOR, "input[autocomplete='username']"),
                (By.XPATH,        "//input[@type='email' or @id='email' or contains(@name,'email')]"),
            ]
            password_selectors = [
                (By.NAME,         "password"),
                (By.CSS_SELECTOR, "input[type='password']"),
                (By.CSS_SELECTOR, "input[id*='password' i]"),
                (By.CSS_SELECTOR, "input[placeholder*='password' i]"),
                (By.XPATH,        "//input[@type='password']"),
            ]
            email_field    = self._find_input(email_selectors,    wait_for_first=True,  timeout=30)
            password_field = self._find_input(password_selectors, wait_for_first=False, timeout=15)
            if email_field is None:
                raise TimeoutError("Email input not found")
            if password_field is None:
                raise TimeoutError("Password input not found")

            # ── STEP 3: Hybrid login — intercept login API via XHR monkey-patch ─
            # LekeeLekee is a React SPA — no traditional form POST.
            # Strategy: inject XHR/fetch interceptor BEFORE any button click,
            # trigger login via the browser (email fill + button click),
            # capture the actual API endpoint + payload, then resend with password.
            # BrightData blocks password field writes but NOT JS execution or button clicks.

            # First, inject request interceptor
            try:
                self.driver.execute_script(
                    """
                    window._capturedReqs = [];
                    // Fetch interceptor
                    var _origFetch = window.fetch;
                    window.fetch = function(url, opts) {
                        window._capturedReqs.push({
                            type: 'fetch',
                            url: String(url),
                            method: ((opts||{}).method||'GET').toUpperCase(),
                            body: (opts||{}).body || null,
                            headers: (opts||{}).headers || null,
                        });
                        return _origFetch.apply(this, arguments);
                    };
                    // XHR interceptor
                    var _origOpen = XMLHttpRequest.prototype.open;
                    var _origSend = XMLHttpRequest.prototype.send;
                    XMLHttpRequest.prototype.open = function(m,u) {
                        this._captureMethod = m;
                        this._captureUrl = u;
                        return _origOpen.apply(this, arguments);
                    };
                    XMLHttpRequest.prototype.send = function(body) {
                        window._capturedReqs.push({
                            type: 'xhr',
                            url: String(this._captureUrl||''),
                            method: (this._captureMethod||'GET').toUpperCase(),
                            body: body || null,
                        });
                        return _origSend.apply(this, arguments);
                    };
                    """
                )
                print("✅ Request interceptor installed")
            except Exception as e:
                print(f"⚠️  Interceptor install: {e!r}")

            # Find email field and fill it (that part works)
            email_selectors2 = [
                (By.CSS_SELECTOR, "input[type='email']"),
                (By.CSS_SELECTOR, "input[id='email']"),
                (By.NAME,         "email"),
            ]
            email_field2 = self._find_input(email_selectors2, wait_for_first=False, timeout=10)
            if email_field2:
                self._fill_field(email_field2, self.email)
                print("✅ Email filled (pre-intercept)")

            # Click the submit button — this will trigger a fetch/XHR with email
            # but empty password (still useful to capture endpoint URL and headers)
            submit_selectors2 = [
                "button[type='submit']",
                "button[class*='login' i]",
                "button[class*='signin' i]",
            ]
            for sel in submit_selectors2:
                try:
                    els = self.driver.find_elements(By.CSS_SELECTOR, sel)
                    if els:
                        self.driver.execute_script(
                            "arguments[0].removeAttribute('disabled'); arguments[0].click();",
                            els[0]
                        )
                        print(f"✅ Submit clicked via {sel!r}")
                        break
                except Exception:
                    pass

            # Wait briefly for the API request to fire
            time.sleep(2)

            # Read captured requests
            captured = []
            try:
                captured = self.driver.execute_script("return window._capturedReqs || [];")
            except Exception:
                pass

            print(f"🌐 Intercepted {len(captured)} request(s):")
            api_url     = None
            api_method  = None
            api_headers = {}
            for r in captured:
                body_str = str(r.get('body') or '')
                print(f"  → {r.get('type','?').upper()} {r.get('method','?')} {r.get('url','')} | body: {body_str[:120]!r}")
                if 'login' in (r.get('url') or '').lower() or 'auth' in (r.get('url') or '').lower() or 'session' in (r.get('url') or '').lower():
                    api_url    = r.get('url')
                    api_method = r.get('method', 'POST')
                    if r.get('headers'):
                        try:
                            h = r['headers']
                            if isinstance(h, dict):
                                api_headers = h
                        except Exception:
                            pass

            if not api_url:
                # Use first POST as fallback
                for r in captured:
                    if r.get('method') == 'POST':
                        api_url    = r.get('url')
                        api_method = 'POST'
                        break

            print(f"🎯 Intercepted API URL: {api_url}")

            # Known endpoint from discovery — use it directly with real credentials
            KNOWN_LOGIN_API = 'https://www.lekeelekee.com/api/v1/auth/login'
            if not api_url:
                print(f"⚠️  No intercepted URL — falling back to known endpoint {KNOWN_LOGIN_API}")
                api_url    = KNOWN_LOGIN_API
                api_method = 'POST'
                is_json_api = True

            # Direct API call with real credentials + Turnstile token
            import requests as _req
            import json as _json
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

            # Collect current cookies from browser
            try:
                browser_cookies = {c['name']: c['value'] for c in self.driver.get_cookies()}
            except Exception:
                browser_cookies = {}

            # Always use JSON (probe confirmed endpoint accepts JSON)
            is_json_api = True

            # Check if it's JSON or form-encoded from captured body
            first_body = ""
            for r in captured:
                if r.get('url') == api_url and r.get('body'):
                    first_body = str(r['body'])
                    break

            is_json_api = first_body.startswith('{') or 'application/json' in str(api_headers).lower()

            req_headers2 = {
                'Origin':  'https://www.lekeelekee.com',
                'Referer': 'https://www.lekeelekee.com/login',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
            }
            if api_headers:
                for k, v in api_headers.items():
                    if str(k).lower() not in ('cookie', 'content-length'):
                        req_headers2[k] = v

            if is_json_api:
                payload_base = {}
                try:
                    payload_base = _json.loads(first_body)
                except Exception:
                    pass
                payload_base.update({
                    'email':    self.email,
                    'password': self.password,
                })
                if turnstile_token:
                    payload_base['cf-turnstile-response'] = turnstile_token
                req_headers2['Content-Type'] = 'application/json'
                print(f"📤 POST {api_url} (JSON) | payload keys: {list(payload_base.keys())}")
                resp2 = _req.request(
                    api_method, api_url,
                    json=payload_base,
                    headers=req_headers2,
                    cookies=browser_cookies,
                    allow_redirects=True,
                    timeout=30,
                    verify=False,
                )
            else:
                # Form-encoded
                payload_form = {
                    'email':    self.email,
                    'password': self.password,
                }
                if turnstile_token:
                    payload_form['cf-turnstile-response'] = turnstile_token
                req_headers2['Content-Type'] = 'application/x-www-form-urlencoded'
                print(f"📤 POST {api_url} (form) | payload keys: {list(payload_form.keys())}")
                resp2 = _req.request(
                    api_method, api_url,
                    data=payload_form,
                    headers=req_headers2,
                    cookies=browser_cookies,
                    allow_redirects=True,
                    timeout=30,
                    verify=False,
                )

            status2    = resp2.status_code
            final_url2 = resp2.url
            snippet2   = resp2.text[:300]
            print(f"  HTTP {status2} → {final_url2}")
            print(f"  Response: {snippet2!r}")

            if status2 in (200, 201):
                # Check for success indicators in JSON response
                resp_data = {}
                try:
                    resp_data = _json.loads(resp2.text)
                except Exception:
                    pass

                is_success = (
                    resp_data.get('status') == 'success'
                    or resp_data.get('token')
                    or resp_data.get('access_token')
                    or resp_data.get('user')
                    or resp_data.get('data')
                    and '/login' not in final_url2
                )
                if not is_success and resp_data.get('status') == 'error':
                    raise RuntimeError(f"API rejected credentials: {resp_data.get('message', snippet2[:80])}")
                if not is_success:
                    raise RuntimeError(f"API login ambiguous: {snippet2[:100]}")

                # Inject token as Authorization header AND cookies
                print("✅ API login succeeded — injecting session...")
                token = resp_data.get('token') or resp_data.get('access_token') or ""
                if token:
                    print(f"✅ JWT token obtained ({len(token)} chars) — will inject as cookie + localStorage")

                try:
                    self.driver.get('https://www.lekeelekee.com')
                    time.sleep(1)
                except Exception:
                    pass
                injected = 0
                # Inject cookies from response
                for ck_name, ck_value in resp2.cookies.items():
                    try:
                        self.driver.add_cookie({'name': ck_name, 'value': ck_value, 'domain': 'www.lekeelekee.com', 'path': '/'})
                        injected += 1
                    except Exception:
                        pass
                # Set JWT token in localStorage if present
                if token:
                    try:
                        self.driver.execute_script(
                            "localStorage.setItem('token', arguments[0]);"
                            "localStorage.setItem('authToken', arguments[0]);"
                            "localStorage.setItem('access_token', arguments[0]);",
                            token
                        )
                        injected += 1
                        print("✅ Token injected into localStorage")
                    except Exception as lse:
                        print(f"⚠️  localStorage injection: {lse!r}")
                # Also inject all response data keys that look like user data
                try:
                    resp_user = resp_data.get('user') or resp_data.get('data', {})
                    if resp_user and isinstance(resp_user, dict):
                        self.driver.execute_script("localStorage.setItem('user', JSON.stringify(arguments[0]));", resp_user)
                except Exception:
                    pass

                print(f"✅ {injected} item(s) injected")
                self.driver.get('https://www.lekeelekee.com/feed')
                time.sleep(2)
                if '/login' not in self.driver.current_url:
                    print(f"✅ Logged in via API → {self.driver.current_url}")
                    return True
                # Try home as fallback
                self.driver.get('https://www.lekeelekee.com/home')
                time.sleep(2)
                if '/login' not in self.driver.current_url:
                    print(f"✅ Logged in via API (home) → {self.driver.current_url}")
                    return True
                raise RuntimeError("Cookies/token injected but browser still on /login")
            else:
                raise RuntimeError(f"API login failed — HTTP {status2}: {snippet2[:100]}")

            # ── 2FA / OTP screen detection ────────────────────────────────────
            # Reached only if HTTP POST failed to return early above
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
