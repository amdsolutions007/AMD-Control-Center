"""
Lead Radar: Scrape LinkedIn saved search for fresh developer requests in Nigeria.

Usage:
    python linkedin_radar.py

Env vars (preferred):
    LINKEDIN_EMAIL, LINKEDIN_PASSWORD   # if cookies are not provided
    LINKEDIN_COOKIES_PATH               # optional JSON cookies exported from browser
    TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

Dependencies: selenium, webdriver-manager, python-telegram-bot
"""
import json
import logging
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Tuple

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver import ChromeOptions
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from telegram import Bot

SEARCH_URL = (
    "https://www.linkedin.com/search/results/content/"
    "?keywords=looking%20for%20developer%20AND%20Nigeria&sortBy=date_posted"
)
KEYWORDS = ["hiring", "need", "urgent", "dm me", "recommend"]
MAX_POSTS_TO_READ = 5
MAX_AGE_HOURS = 24
SCROLL_PAUSE = 2.5
MAX_SCROLLS = 6

logger = logging.getLogger("linkedin_radar")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)


def init_driver(headless: bool = True) -> webdriver.Chrome:
    options = ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1400,900")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(5)
    return driver


def load_cookies_if_available(driver: webdriver.Chrome, cookies_path: Optional[Path]) -> bool:
    if not cookies_path or not cookies_path.exists():
        return False
    try:
        driver.get("https://www.linkedin.com")
        with cookies_path.open("r", encoding="utf-8") as f:
            cookies = json.load(f)
        for cookie in cookies:
            cookie.pop("sameSite", None)
            driver.add_cookie(cookie)
        logger.info("Loaded cookies from %s", cookies_path)
        driver.get("https://www.linkedin.com/feed/")
        time.sleep(2)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to load cookies: %s", exc)
        return False


def set_li_at_cookie(driver: webdriver.Chrome, li_at: str) -> bool:
    if not li_at:
        return False
    try:
        driver.get("https://www.linkedin.com")
        driver.add_cookie(
            {
                "name": "li_at",
                "value": li_at,
                "domain": ".linkedin.com",
                "path": "/",
                "secure": True,
                "httpOnly": True,
            }
        )
        driver.get("https://www.linkedin.com/feed/")
        time.sleep(2)
        logger.info("Injected li_at cookie for session reuse")
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to set li_at cookie: %s", exc)
        return False


def handle_otp_if_present(driver: webdriver.Chrome, otp_code: str) -> bool:
    if not otp_code:
        return False
    candidates = [
        (By.ID, "input__phone_verification_pin"),
        (By.NAME, "pin"),
        (By.CSS_SELECTOR, "input[type='text']"),
    ]
    for by, sel in candidates:
        try:
            field = WebDriverWait(driver, 5).until(EC.presence_of_element_located((by, sel)))
            field.clear()
            field.send_keys(otp_code)
            # Try to submit
            try:
                submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], button")
                submit_btn.click()
            except NoSuchElementException:
                field.send_keys(Keys.ENTER)
            logger.info("Submitted OTP code")
            return True
        except TimeoutException:
            continue
    return False


def login_with_credentials(driver: webdriver.Chrome, email: str, password: str, otp_code: str = "") -> bool:
    driver.get("https://www.linkedin.com/login")
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "username")))
        driver.find_element(By.ID, "username").send_keys(email)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.ID, "password").send_keys(Keys.ENTER)
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "a[data-test-global-nav-link='feed']"))
            )
            logger.info("Logged in via credentials")
            return True
        except TimeoutException:
            logger.warning("Login timed out; attempting OTP if required")
            if handle_otp_if_present(driver, otp_code):
                try:
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "a[data-test-global-nav-link='feed']"))
                    )
                    logger.info("Logged in via OTP")
                    return True
                except TimeoutException:
                    logger.error("OTP submitted but still not logged in")
                    return False
            logger.error("Login timed out; check credentials or 2FA")
            return False
    except Exception as exc:  # noqa: BLE001
        logger.error("Login failed: %s", exc)
        return False


def ensure_logged_in(driver: webdriver.Chrome) -> bool:
    try:
        driver.find_element(By.CSS_SELECTOR, "a[data-test-global-nav-link='feed']")
        return True
    except NoSuchElementException:
        return False


def parse_age(text: str) -> Optional[timedelta]:
    lower = text.lower().strip()
    if not lower:
        return None
    if "h" in lower:
        try:
            hours = int(lower.split("h")[0].strip("+ "))
            return timedelta(hours=hours)
        except ValueError:
            return None
    if "m" in lower:
        try:
            minutes = int(lower.split("m")[0].strip("+ "))
            return timedelta(minutes=minutes)
        except ValueError:
            return None
    if "s" in lower:
        return timedelta(seconds=0)
    if "d" in lower:
        try:
            days = int(lower.split("d")[0].strip("+ "))
            return timedelta(days=days)
        except ValueError:
            return None
    if "w" in lower:
        try:
            weeks = int(lower.split("w")[0].strip("+ "))
            return timedelta(weeks=weeks)
        except ValueError:
            return None
    return None


def extract_posts(driver: webdriver.Chrome) -> List[Tuple[str, str, str]]:
    posts_data = []
    candidates = driver.find_elements(By.CSS_SELECTOR, "div.feed-shared-update-v2, div.occludable-update")
    for elem in candidates:
        try:
            text_elem = elem.find_element(By.CSS_SELECTOR, "div.feed-shared-text, span.break-words")
            post_text = text_elem.text.strip()
            if not post_text:
                continue
            link_elem = elem.find_element(By.CSS_SELECTOR, "a.app-aware-link")
            post_link = link_elem.get_attribute("href")
            time_elem = elem.find_element(By.CSS_SELECTOR, "span.update-components-actor__sub-description span.visually-hidden")
            age_text = time_elem.text.strip()
            posts_data.append((post_text, post_link, age_text))
        except NoSuchElementException:
            continue
        if len(posts_data) >= MAX_POSTS_TO_READ:
            break
    return posts_data


def scroll_feed(driver: webdriver.Chrome) -> None:
    last_height = driver.execute_script("return document.body.scrollHeight")
    for _ in range(MAX_SCROLLS):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height


def filter_posts(posts: List[Tuple[str, str, str]]) -> List[Tuple[str, str]]:
    matched = []
    for text, link, age_text in posts:
        age_delta = parse_age(age_text)
        if age_delta is None or age_delta > timedelta(hours=MAX_AGE_HOURS):
            continue
        lower = text.lower()
        if any(keyword in lower for keyword in KEYWORDS):
            snippet = text[:50].replace("\n", " ")
            matched.append((link, snippet))
    return matched


def send_telegram_alert(bot: Bot, chat_id: str, link: str, snippet: str) -> None:
    message = f"🚨 NEW LEAD FOUND: {link} | Content: {snippet}"
    bot.send_message(chat_id=chat_id, text=message)
    logger.info("Alert sent for %s", link)


def run():
    linkedin_email = os.getenv("LINKEDIN_EMAIL", "").strip()
    linkedin_password = os.getenv("LINKEDIN_PASSWORD", "").strip()
    cookies_path = os.getenv("LINKEDIN_COOKIES_PATH", "").strip()
    otp_code = os.getenv("OTP_CODE", "").strip()
    li_at = os.getenv("LI_AT", "").strip()
    telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()

    if not telegram_token or not telegram_chat_id:
        logger.error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required")
        return

    driver = init_driver(headless=True)
    bot = Bot(token=telegram_token)

    try:
        cookies_loaded = False
        if li_at:
            cookies_loaded = set_li_at_cookie(driver, li_at)
        if not cookies_loaded and cookies_path:
            cookies_loaded = load_cookies_if_available(driver, Path(cookies_path))

        if not cookies_loaded:
            if not linkedin_email or not linkedin_password:
                logger.error("Provide LINKEDIN_EMAIL and LINKEDIN_PASSWORD or LINKEDIN_COOKIES_PATH or LI_AT")
                return
            if not login_with_credentials(driver, linkedin_email, linkedin_password, otp_code):
                return

        if not ensure_logged_in(driver):
            logger.error("Not logged in to LinkedIn; aborting")
            return

        driver.get(SEARCH_URL)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        scroll_feed(driver)
        posts = extract_posts(driver)
        if not posts:
            logger.info("No posts found")
            return
        leads = filter_posts(posts)
        if not leads:
            logger.info("No matching leads in the last %s hours", MAX_AGE_HOURS)
            return
        for link, snippet in leads:
            send_telegram_alert(bot, telegram_chat_id, link, snippet)
    finally:
        driver.quit()


if __name__ == "__main__":
    run()
