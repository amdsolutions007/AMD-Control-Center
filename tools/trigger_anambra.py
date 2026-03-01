#!/usr/bin/env python3
"""
Emergency trigger: Anambra Day 3 approval prompt → CEO Telegram.
Run via: npx @railway/cli run --service telegram-approval-bot -- python3 tools/trigger_anambra.py
"""
import os, sys, json, asyncio, time, pathlib
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def main():
    from content_generator import ContentGenerator
    from graphic_generator import GraphicGenerator
    import telegram
    from telegram import InlineKeyboardMarkup, InlineKeyboardButton

    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    ceo_id    = int(os.environ.get("CEO_TELEGRAM_ID", "8013249849"))

    if not bot_token:
        print("❌ TELEGRAM_BOT_TOKEN not set"); sys.exit(1)

    bot = telegram.Bot(token=bot_token)
    print(f"✅ Bot connected | CEO: {ceo_id}")

    # --- Content ---
    gen = ContentGenerator()
    gen.current_day = 2   # index 2 = Anambra = Day 3
    state   = gen.get_next_state()
    caption = gen.generate_caption(state)
    print(f"📝 Day 3: {state['name']} | {len(caption)} chars")

    # --- Graphic ---
    gg = GraphicGenerator()
    img_path = await gg.generate_state_graphic(
        state_name=state["name"],
        day_number=3,
        caption=caption,
        zone=state.get("zone", ""),
        capital=state.get("capital", "")
    )
    print(f"🎨 Graphic: {img_path}")

    # --- Save pending ---
    post_id  = f"post_3_{int(time.time())}"
    pending  = pathlib.Path("pending_posts")
    pending.mkdir(exist_ok=True)
    pfile    = pending / f"{post_id}.json"
    pdata    = {
        "day": 3, "state_name": state["name"],
        "capital": state.get("capital", ""), "zone": state.get("zone", ""),
        "caption": caption, "graphic_path": img_path,
        "current_day_index": 2,
    }
    pfile.write_text(json.dumps(pdata, indent=2))
    print(f"💾 Saved: {pfile}")

    # --- Compose message ---
    done, total = 2, 36
    pct    = round(done / total * 100, 1)
    filled = int(done / total * 20)
    bar    = "█" * filled + "░" * (20 - filled)

    header = (
        f"🔔 *DAY 3 POST READY FOR APPROVAL*\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"📅 Day 3/36: *{state['name']}*\n"
        f"📍 Capital: {state.get('capital', 'N/A')}\n"
        f"🌍 Zone: {state.get('zone', 'N/A')}\n\n"
        f"📊 Progress: `[{bar}]` {pct}%  (2/36 states done)\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"{caption[:600]}"
    )

    kb = InlineKeyboardMarkup([[
        InlineKeyboardButton("✅ APPROVE — POST DAY 3", callback_data=f"approve_{post_id}"),
        InlineKeyboardButton("❌ REJECT", callback_data=f"reject_{post_id}"),
    ]])

    # --- Send ---
    if img_path and os.path.exists(img_path):
        with open(img_path, "rb") as fh:
            msg = await bot.send_photo(
                chat_id=ceo_id, photo=fh,
                caption=header, reply_markup=kb, parse_mode="Markdown"
            )
    else:
        print("⚠️  No graphic — sending text only")
        msg = await bot.send_message(
            chat_id=ceo_id, text=header,
            reply_markup=kb, parse_mode="Markdown"
        )

    print(f"✅ ANAMBRA PROMPT SENT — message_id: {msg.message_id}")

asyncio.run(main())
