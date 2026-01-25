"""
Gmail Monitor: Poll Google Alerts emails and forward to Telegram.

Setup:
1) Place credentials.json in project root (../credentials.json relative to this file).
2) First run will open a browser to authorize Gmail (GMAIL.modify scope). Token saved to token.json.
3) Requires env TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.

Run:
    python gmail_monitor.py
"""
import base64
import os
import time
import logging
from pathlib import Path
from typing import Optional, Tuple

from bs4 import BeautifulSoup
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from telegram import Bot

# OAuth scope allows reading and modifying labels
SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
BASE_DIR = Path(__file__).parent
TOKEN_PATH = BASE_DIR / "token.json"
CREDENTIALS_PATH = BASE_DIR.parent / "credentials.json"
POLL_INTERVAL = 60  # seconds
QUERY = "from:googlealerts-noreply@google.com is:unread"
MAX_RESULTS = 5

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("gmail_monitor")


def get_gmail_service():
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_PATH.write_text(creds.to_json())
    return build("gmail", "v1", credentials=creds)


def decode_part(data: str) -> str:
    try:
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    except Exception:
        return ""


def extract_body(payload: dict) -> str:
    if not payload:
        return ""

    def walk_parts(part):
        if not part:
            return ""
        mime_type = part.get("mimeType", "")
        body_data = part.get("body", {}).get("data")
        if body_data and mime_type in ("text/html", "text/plain"):
            return decode_part(body_data)
        for child in part.get("parts", []) or []:
            text = walk_parts(child)
            if text:
                return text
        return ""

    return walk_parts(payload)


def parse_alert(content: str) -> Tuple[Optional[str], Optional[str]]:
    if not content:
        return None, None
    soup = BeautifulSoup(content, "html.parser")
    # Google Alerts usually contains anchor links; take the first meaningful one
    first_link = soup.find("a", href=True)
    title = first_link.get_text(strip=True) if first_link else None
    link = first_link["href"] if first_link else None
    return title, link


def mark_as_read(service, msg_id: str):
    service.users().messages().modify(
        userId="me", id=msg_id, body={"removeLabelIds": ["UNREAD"]}
    ).execute()


def send_telegram(bot: Bot, chat_id: str, title: str, link: str):
    title = title or "(No title)"
    link = link or "(No link)"
    text = f"🔔 NEW LEAD: {title}\n🔗 {link}"
    bot.send_message(chat_id=chat_id, text=text)
    logger.info("Alert sent: %s", title)


def process_messages(service, bot: Bot, chat_id: str):
    resp = service.users().messages().list(
        userId="me", q=QUERY, maxResults=MAX_RESULTS
    ).execute()
    messages = resp.get("messages", [])
    if not messages:
        logger.info("No new Google Alerts")
        return

    for msg in messages:
        msg_id = msg["id"]
        full = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
        payload = full.get("payload", {})
        content = extract_body(payload)
        title, link = parse_alert(content)
        send_telegram(bot, chat_id, title, link)
        mark_as_read(service, msg_id)


def main():
    telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    if not telegram_token or not telegram_chat_id:
        logger.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment")
        return

    bot = Bot(token=telegram_token)
    service = get_gmail_service()
    logger.info("Gmail monitor started; polling every %ss", POLL_INTERVAL)

    while True:
        try:
            process_messages(service, bot, telegram_chat_id)
        except Exception as exc:  # noqa: BLE001
            logger.error("Error during polling: %s", exc)
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
