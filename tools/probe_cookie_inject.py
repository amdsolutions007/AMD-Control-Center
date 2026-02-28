#!/usr/bin/env python3
"""
Two-phase approach:
1. Login via requests.Session (get cookies + token)
2. Inject those SAME cookies into BrightData browser
3. Navigate to /home and intercept the POST request when creating a post

This finds the feed post API endpoint.
"""
import os, sys, json, time, requests
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from leke_leke_browser_automation import LekeLekeeAutomation
from selenium.webdriver.common.by import By

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
BASE = "https://www.lekeelekee.com"

# STEP 1: Login via requests
print("🔐 Phase 1: Login via requests.Session...")
rsession = requests.Session()
rsession.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept": "application/json",
    "Origin": BASE,
})
resp = rsession.post(f"{BASE}/api/v1/auth/login",
    data={"email": email, "password": password},
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    timeout=20)
data = resp.json()
token = data['data']['token']
user_id = data['data']['user']['public_id']
print(f"  ✅ Token: {len(token)} chars")

cookies_from_requests = list(rsession.cookies)
print(f"  🍪 Server-set cookies: {[c.name for c in cookies_from_requests]}")

# STEP 2: Start browser and inject cookies + token
print("\n🌐 Phase 2: Starting BrightData browser...")
browser = LekeLekeeAutomation(email=email, password=password, headless=True)
try:
    browser.start_browser()
    d = browser.driver

    # Navigate to root to be on correct domain
    # Use JS to set a cookie via document.cookie (won't work for httpOnly, but AWSALBTG might not be httpOnly)
    print("  Checking if AWSALBTG is httpOnly...")
    
    # First navigate to the site
    d.execute_script("window.location.href = 'https://www.lekeelekee.com/login';")
    time.sleep(3)
    print(f"  Current URL: {d.current_url}")
    
    # Check existing cookies
    existing_cookies = d.get_cookies()
    existing_names = [c['name'] for c in existing_cookies]
    print(f"  Browser cookies (before inject): {existing_names}")
    
    # Try to inject cookies from requests session
    for c in cookies_from_requests:
        cookie_dict = {
            'name': c.name,
            'value': c.value,
            'domain': 'www.lekeelekee.com',
            'path': '/',
            'secure': c.secure,
        }
        try:
            d.add_cookie(cookie_dict)
            print(f"  ✅ Injected cookie: {c.name}")
        except Exception as e:
            print(f"  ❌ Failed cookie {c.name}: {type(e).__name__}")
            # Try JS cookie injection
            try:
                d.execute_script(
                    f"document.cookie = '{c.name}={c.value}; domain=.lekeelekee.com; path=/; SameSite=Lax';"
                )
                print(f"  ✅ JS cookie injected: {c.name}")
            except Exception as e2:
                print(f"  ❌ JS cookie also failed: {e2!r}")

    # Inject JWT into localStorage
    try:
        d.execute_script(
            "localStorage.setItem('token', arguments[0]);"
            "localStorage.setItem('authToken', arguments[0]);"
            "localStorage.setItem('access_token', arguments[0]);",
            token
        )
        print("  ✅ JWT token injected into localStorage")
    except Exception as e:
        print(f"  ❌ localStorage: {e!r}")

    # Also set Authorization header via service worker or XHR monkey-patch
    d.execute_script(f"""
    window.__jwt_token = '{token}';
    var origFetch = window.fetch;
    window.fetch = function(url, opts) {{
        opts = opts || {{}};
        opts.headers = opts.headers || {{}};
        opts.headers['Authorization'] = 'Bearer ' + window.__jwt_token;
        return origFetch(url, opts);
    }};
    var XHR = XMLHttpRequest.prototype;
    var origOpen = XHR.open;
    XHR.open = function() {{
        this._url = arguments[1];
        return origOpen.apply(this, arguments);
    }};
    var origSetHeader = XHR.setRequestHeader;
    XHR.setRequestHeader = function(name, value) {{
        return origSetHeader.apply(this, arguments);
    }};
    var origSend = XHR.send;
    var _token = window.__jwt_token;
    XHR.send = function() {{
        try {{ this.setRequestHeader('Authorization', 'Bearer ' + _token); }} catch(e) {{}}
        return origSend.apply(this, arguments);
    }};
    """)
    print("  ✅ Auth header monkey-patch installed")

    # Navigate to /home
    d.execute_script("window.location.href = 'https://www.lekeelekee.com/home';")
    time.sleep(5)
    print(f"  URL after nav: {d.current_url!r}")
    print(f"  Title: {d.title!r}")
    body = d.find_element(By.TAG_NAME, "body").text[:300]
    print(f"  Body: {body!r}")

    # If still on login, the cookie injection didn't work
    if '/login' in d.current_url:
        print("\n⚠️  Still on login page - cookies not accepted by browser")
        print("  Trying CDP Network.setCookie...")
        try:
            # CDP Network.setCookie
            for c in cookies_from_requests:
                d.execute_cdp_cmd("Network.setCookie", {
                    "name": c.name,
                    "value": c.value,
                    "domain": "www.lekeelekee.com",
                    "path": "/",
                    "secure": False,
                    "httpOnly": False,
                    "sameSite": "Lax",
                })
                print(f"  ✅ CDP cookie: {c.name}")
        except Exception as e:
            print(f"  CDP: {e!r}")
        
        d.execute_script("window.location.href = 'https://www.lekeelekee.com/home';")
        time.sleep(4)
        print(f"  URL after CDP inject: {d.current_url!r}")

finally:
    browser.close()
    print("\n✅ Done")
