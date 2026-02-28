#!/usr/bin/env python3
"""
Probe group page after login — dumps page structure to understand composer selectors.
"""
import os, sys, time, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from leke_leke_browser_automation import LekeLekeeAutomation
from selenium.webdriver.common.by import By

email    = os.environ.get("LEKE_LEKE_EMAIL", "").strip()
password = os.environ.get("LEKE_LEKE_PASSWORD", "").strip()

browser = LekeLekeeAutomation(email=email, password=password, headless=True)
try:
    browser.start_browser()
    ok = browser.login()
    print(f"\n🔎 Login: {ok} | URL: {browser.driver.current_url}")
    if not ok:
        sys.exit(1)

    # Navigate to group
    group_url = 'https://www.lekeelekee.com/groups/african-tech-ecosystem'
    print(f"\n🌐 Navigating to {group_url} ...")
    browser.driver.execute_script(f"window.location.href = '{group_url}';")
    time.sleep(5)

    print(f"📍 URL after nav: {browser.driver.current_url}")
    print(f"📄 Title: {browser.driver.title!r}")

    body = browser.driver.find_element(By.TAG_NAME, "body").text[:600]
    print(f"\n📝 Body (600 chars):\n{body}")

    # Inspect buttons/textareas/inputs
    print("\n🔎 Buttons on page:")
    buttons = browser.driver.find_elements(By.TAG_NAME, "button")
    for b in buttons[:20]:
        try:
            txt = (b.text or "").strip()[:50]
            dt = b.get_attribute("data-testid") or ""
            cls = (b.get_attribute("class") or "")[:60]
            print(f"   btn: text={txt!r} dt={dt!r} cls={cls!r}")
        except Exception:
            pass

    print("\n🔎 Textareas:")
    for t in browser.driver.find_elements(By.TAG_NAME, "textarea")[:10]:
        try:
            ph = t.get_attribute("placeholder") or ""
            cls = (t.get_attribute("class") or "")[:60]
            print(f"   textarea: ph={ph!r} cls={cls!r}")
        except Exception:
            pass

    print("\n🔎 [data-testid] elements:")
    for el in browser.driver.find_elements(By.CSS_SELECTOR, "[data-testid]")[:20]:
        try:
            dt = el.get_attribute("data-testid") or ""
            tag = el.tag_name
            txt = (el.text or "").strip()[:40]
            print(f"   {tag} dt={dt!r} txt={txt!r}")
        except Exception:
            pass

    print("\n🔎 Contenteditable elements:")
    for el in browser.driver.find_elements(By.CSS_SELECTOR, "[contenteditable]")[:10]:
        try:
            ph = el.get_attribute("placeholder") or el.get_attribute("data-placeholder") or ""
            dt = el.get_attribute("data-testid") or ""
            tag = el.tag_name
            print(f"   {tag} ce=true ph={ph!r} dt={dt!r}")
        except Exception:
            pass

    # Try clicking something that looks like a composer / "What's on your mind"
    print("\n🔎 Checking for post input area...")
    for sel in [
        "[data-testid='post-composer']",
        "[placeholder*='mind' i]",
        "[placeholder*='post' i]",
        "[placeholder*='share' i]",
        "[placeholder*='think' i]",
        "[aria-label*='post' i]",
        "[aria-label*='write' i]",
        ".post-composer",
        ".compose",
        "div[role='textbox']",
    ]:
        els = browser.driver.find_elements(By.CSS_SELECTOR, sel)
        if els:
            print(f"   ✅ FOUND: {sel!r} → {els[0].tag_name} text={els[0].text[:40]!r}")
        else:
            print(f"   ❌ not found: {sel!r}")

finally:
    browser.close()
    print("\n✅ Browser closed")
