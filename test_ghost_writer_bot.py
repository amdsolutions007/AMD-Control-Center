#!/usr/bin/env python3
"""
Quick test to verify Ghost Writer Pro Telegram Bot is live and responding.
"""
import requests
import os

# Get bot token from environment or Railway variables
BOT_TOKEN = "8250377410:AAEdyNJsRC5HivDx1lH3CP82PD377JCTyeg"

# Test bot connectivity
def test_bot():
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
    
    print("🤖 Testing Telegram Bot connectivity...")
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('ok'):
            bot_info = data['result']
            print(f"✅ Bot is ALIVE!")
            print(f"   Name: {bot_info['first_name']}")
            print(f"   Username: @{bot_info['username']}")
            print(f"   Can read all messages: {bot_info.get('can_read_all_group_messages', False)}")
            return True
    
    print(f"❌ Bot connection failed: {response.status_code}")
    print(response.text)
    return False

# Get bot updates (check if it's receiving messages)
def check_updates():
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    
    print("\n📨 Checking for recent messages...")
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('ok'):
            updates = data['result']
            if updates:
                print(f"✅ Bot has {len(updates)} message(s) in queue")
                # Show last message
                last_update = updates[-1]
                if 'message' in last_update:
                    msg = last_update['message']
                    print(f"   Last message from: {msg.get('from', {}).get('first_name', 'Unknown')}")
                    print(f"   Text: {msg.get('text', 'No text')}")
            else:
                print("📭 No messages yet. Send /start to the bot to test!")
            return True
    
    print(f"❌ Failed to get updates: {response.status_code}")
    return False

if __name__ == "__main__":
    print("=" * 60)
    print("GHOST WRITER PRO - BOT HEALTH CHECK")
    print("=" * 60)
    
    if test_bot():
        check_updates()
        print("\n" + "=" * 60)
        print("✅ TELEGRAM BOT IS OPERATIONAL")
        print(f"📱 Message @AMDSolutions007_bot to interact")
        print("=" * 60)
    else:
        print("\n❌ Bot health check failed!")
