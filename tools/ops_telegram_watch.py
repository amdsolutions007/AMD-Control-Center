#!/usr/bin/env python3
"""Simple Ops console: prints Telegram alerts to your terminal.

Purpose:
- If your WhatsApp bot runs in the cloud (Railway), you won't see inbound messages in your local terminal.
- This watcher lets you see the bot's Ops notifications live in VS Code terminal.

Requirements:
- A Telegram bot token + chat id.

Env vars (prefer OPS_*, fall back to TELEGRAM_*):
- OPS_TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN
- OPS_TELEGRAM_CHAT_ID or TELEGRAM_CHAT_ID

How to run:
- python3 tools/ops_telegram_watch.py

Stop:
- Ctrl+C
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def env(name: str) -> str:
    return (os.getenv(name) or '').strip()


def get_cfg():
    token = env('OPS_TELEGRAM_BOT_TOKEN') or env('TELEGRAM_BOT_TOKEN')
    chat_id = env('OPS_TELEGRAM_CHAT_ID') or env('TELEGRAM_CHAT_ID')
    enabled = (env('OPS_TELEGRAM_ENABLED') or 'false').lower() == 'true'
    # For the watcher, if enabled isn't set, we still allow running (explicit intent).
    return token, chat_id, enabled


def http_get_json(url: str, params: dict) -> dict:
    query = urllib.parse.urlencode(params)
    full = f"{url}?{query}" if query else url
    req = urllib.request.Request(full, headers={'User-Agent': 'amd-ops-console/1.0'})
    with urllib.request.urlopen(req, timeout=35) as resp:
        raw = resp.read().decode('utf-8', errors='replace')
    return json.loads(raw)


def main() -> int:
    token, chat_id, enabled = get_cfg()

    if not token:
        print('Missing Telegram token. Set OPS_TELEGRAM_BOT_TOKEN (or TELEGRAM_BOT_TOKEN).')
        return 2
    if not chat_id:
        print('Missing Telegram chat id. Set OPS_TELEGRAM_CHAT_ID (or TELEGRAM_CHAT_ID).')
        return 2

    base = f"https://api.telegram.org/bot{token}"
    offset = None

    print('AMD Ops Console: watching Telegram…')
    print(f'Chat ID filter: {chat_id}')
    if not enabled:
        print('Note: OPS_TELEGRAM_ENABLED is not true. The WhatsApp bot must have OPS_TELEGRAM_ENABLED=true to send alerts.')

    while True:
        try:
            params = {'timeout': 25}
            if offset is not None:
                params['offset'] = offset

            data = http_get_json(f"{base}/getUpdates", params)
            if not data.get('ok'):
                print('Telegram API error:', data)
                time.sleep(3)
                continue

            for upd in data.get('result', []):
                offset = int(upd.get('update_id', 0)) + 1

                msg = upd.get('message') or upd.get('channel_post')
                if not msg:
                    continue

                # Filter by chat id
                msg_chat = msg.get('chat') or {}
                msg_chat_id = str(msg_chat.get('id', ''))
                if str(chat_id) != msg_chat_id:
                    continue

                text = (msg.get('text') or '').strip()
                if not text:
                    continue

                ts = msg.get('date')
                print(f"\n---\n{text}")
                sys.stdout.flush()

        except KeyboardInterrupt:
            print('\nStopped.')
            return 0
        except urllib.error.HTTPError as e:
            print('HTTPError:', e)
            time.sleep(3)
        except urllib.error.URLError as e:
            print('URLError:', e)
            time.sleep(3)
        except Exception as e:
            print('Error:', e)
            time.sleep(2)


if __name__ == '__main__':
    raise SystemExit(main())
