from playwright.sync_api import sync_playwright
import time

URL = 'http://localhost:8501'
OUT = 'assets/amd_dashboard_screenshot_fresh.png'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    try:
        page.goto(URL, timeout=60000)
        # wait for main app container to appear
        page.wait_for_selector('[data-testid="stAppViewContainer"]', timeout=30000)
        time.sleep(2.5)
        page.screenshot(path=OUT, full_page=True)
        print('Saved', OUT)
    finally:
        browser.close()
