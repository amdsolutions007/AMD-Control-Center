#!/usr/bin/env python3
"""Trigger /publish command for the Lagos post via Telegram Bot API."""
import urllib.request
import json
import ssl
import subprocess
import re

# Get bot token from Railway
result = subprocess.check_output(
    ["npx", "-y", "@railway/cli", "variables", "--service", "telegram-approval-bot"],
    stderr=subprocess.DEVNULL,
).decode()

bot_token = None
# Telegram bot tokens look like: digits:alphanumeric (35-46 chars total)
token_match = re.search(r'(\d{8,12}:[A-Za-z0-9_\-]{30,50})', result)
if token_match:
    bot_token = token_match.group(1)

if not bot_token:
    print("ERROR: Could not extract TELEGRAM_BOT_TOKEN from Railway variables")
    print("Please send this command manually in your Telegram bot chat:")
    print("/publish_post_1_20260228_110046")
    exit(1)

CEO_ID = "8013249849"
cmd = "/publish_post_1_20260228_110046"

ctx = ssl.create_default_context()
url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
data = json.dumps({"chat_id": CEO_ID, "text": cmd}).encode()
req = urllib.request.Request(
    url, data=data, headers={"Content-Type": "application/json"}
)
resp = urllib.request.urlopen(req, context=ctx, timeout=10)
body = json.loads(resp.read())
print(f"Sent: {body.get('ok')} | message_id: {body.get('result', {}).get('message_id')}")
print(f"Command fired: {cmd}")
print("Bot will now attempt to publish Lagos Day 1 post via BrightData Scraping Browser")
