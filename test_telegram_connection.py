import asyncio
from telegram import Bot

async def test_connection():
    bot = Bot(token='8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg')
    try:
        bot_info = await bot.get_me()
        print(f'✅ Bot Connected: @{bot_info.username} (ID: {bot_info.id})')
        
        message = await bot.send_message(
            chat_id='@AMD_Intel_Brief',
            text='🚀 NEXUS-007 TEST: Telegram Infrastructure Online. Heavy Artillery targeting systems calibrated.'
        )
        print(f'✅ Message Posted to @AMD_Intel_Brief')
        print(f'   Message ID: {message.message_id}')
        print(f'   Chat ID: {message.chat.id}')
        print(f'   Channel: @{message.chat.username}')
        return True
    except Exception as e:
        print(f'❌ Connection Failed: {e}')
        return False

success = asyncio.run(test_connection())
exit(0 if success else 1)
