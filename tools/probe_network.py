#!/usr/bin/env python3
"""
Use CDP to intercept actual network requests made by the feed page.
This reveals the real API endpoints for posting.
"""
import os, sys, json, time, threading
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from leke_leke_browser_automation import LekeLekeeAutomation
from selenium.webdriver.common.by import By

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()
BASE = "https://www.lekeelekee.com"

browser = LekeLekeeAutomation(email=email, password=password, headless=True)
try:
    browser.start_browser()
    ok = browser.login()
    print(f"\n🔎 Login: {ok} | URL: {browser.driver.current_url}")
    if not ok:
        sys.exit(1)

    d = browser.driver

    # Install network interceptor at JS level — capture fetch/XHR
    d.execute_script("""
    window.__intercepted = [];
    (function() {
        var orig = window.fetch;
        window.fetch = function(url, opts) {
            var entry = {url: String(url), method: (opts && opts.method) || 'GET', body: opts && opts.body ? String(opts.body).substring(0, 500) : null};
            window.__intercepted.push(entry);
            return orig.apply(this, arguments);
        };
        var XHR = XMLHttpRequest.prototype;
        var origOpen = XHR.open;
        var origSend = XHR.send;
        XHR.open = function(method, url) {
            this._iMethod = method;
            this._iUrl = url;
            return origOpen.apply(this, arguments);
        };
        XHR.send = function(body) {
            var entry = {url: String(this._iUrl || ''), method: this._iMethod || 'GET', body: body ? String(body).substring(0, 500) : null};
            window.__intercepted.push(entry);
            return origSend.apply(this, arguments);
        };
    })();
    """)
    print("✅ Network interceptor installed")

    # Navigate to feed and wait
    time.sleep(2)

    # Trigger a page scroll to load feed
    d.execute_script("window.scrollTo(0, 500);")
    time.sleep(3)

    # Check intercepted
    intercepted = d.execute_script("return window.__intercepted || [];")
    print(f"\n📡 Feed page requests ({len(intercepted)}):")
    for req in intercepted[:30]:
        print(f"   {req.get('method')} {req.get('url')!r}")
        if req.get('body'):
            print(f"      body: {req.get('body')!r}")

    # Now navigate to the group page
    print("\n🌐 Navigating to group page via JS...")
    d.execute_script(f"window.location.href = '{BASE}/groups/african-tech-ecosystem';")
    time.sleep(5)
    print(f"📍 URL: {d.current_url!r}")

    # Re-install interceptor
    d.execute_script("""
    window.__intercepted2 = [];
    (function() {
        var orig = window.fetch;
        window.fetch = function(url, opts) {
            var entry = {url: String(url), method: (opts && opts.method) || 'GET', body: opts && opts.body ? String(opts.body).substring(0, 500) : null};
            window.__intercepted2.push(entry);
            return orig.apply(this, arguments);
        };
        var XHR = XMLHttpRequest.prototype;
        var origOpen = XHR.open;
        var origSend = XHR.send;
        XHR.open = function(method, url) {
            this._iMethod2 = method;
            this._iUrl2 = url;
            return origOpen.apply(this, arguments);
        };
        XHR.send = function(body) {
            var entry = {url: String(this._iUrl2 || ''), method: this._iMethod2 || 'GET', body: body ? String(body).substring(0, 500) : null};
            window.__intercepted2.push(entry);
            return origSend.apply(this, arguments);
        };
    })();
    """)
    time.sleep(4)
    d.execute_script("window.scrollTo(0, 500);")
    time.sleep(3)

    intercepted2 = d.execute_script("return window.__intercepted2 || [];")
    print(f"\n📡 Group page requests ({len(intercepted2)}):")
    for req in intercepted2[:30]:
        print(f"   {req.get('method')} {req.get('url')!r}")
        if req.get('body'):
            print(f"      body: {req.get('body')!r}")

    # Dump page structure
    print(f"\n📄 Title: {d.title!r}")
    body_text = d.find_element(By.TAG_NAME, "body").text[:500]
    print(f"📝 Body:\n{body_text}")

    print("\n🔎 Buttons:")
    for b in d.find_elements(By.TAG_NAME, "button")[:15]:
        try:
            txt = (b.text or "").strip()[:60]
            dt = b.get_attribute("data-testid") or ""
            aria = b.get_attribute("aria-label") or ""
            if txt or dt or aria:
                print(f"   {txt!r} dt={dt!r} aria={aria!r}")
        except Exception:
            pass

    print("\n🔎 Textareas/Contenteditable:")
    for sel in ["textarea", "[contenteditable='true']", "[role='textbox']"]:
        for el in d.find_elements(By.CSS_SELECTOR, sel)[:5]:
            try:
                ph = el.get_attribute("placeholder") or el.get_attribute("data-placeholder") or ""
                print(f"   <{el.tag_name}> ph={ph!r}")
            except Exception:
                pass

finally:
    browser.close()
    print("\n✅ Done")
