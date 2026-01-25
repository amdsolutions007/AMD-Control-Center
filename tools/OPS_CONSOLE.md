# Ops Console (Virtual Studio Terminal)

Goal: keep a dedicated VS Code terminal tab that shows **live WhatsApp conversations** (inbound + bot reply) while the bot runs on Railway.

## Primary (Option A): Railway log stream → terminal

1) Run VS Code Task: **Railway: Login**
2) Run VS Code Task: **Railway: Link Project** (select the correct Railway project/service)
3) Run VS Code Task: **Railway: Ops Console (INBOUND/OUTBOUND)**

This prints only the most important lines:
- `📩 INBOUND ...`
- `🤖 OUTBOUND ...`
- errors/warnings

Leave that terminal open 24/7.

## Backup (Option B): Telegram alerts → printed in terminal

Run VS Code Task: **Ops: Watch Alerts (Telegram Backup)**

This only works if the Railway service has:
- `OPS_TELEGRAM_ENABLED=true`
- `OPS_TELEGRAM_BOT_TOKEN` + `OPS_TELEGRAM_CHAT_ID`

## Important limitation
The assistant cannot continuously read your terminal in real-time.
Workflow:
- You keep the Ops Console terminal open.
- When an important inbound lead appears, paste the inbound text here and I generate the best reply immediately.
