#!/usr/bin/env python3
"""Quick test of AMD NEXUS dependencies"""

import sys

print("🔍 AMD NEXUS - System Check")
print("=" * 60)

# Test imports
modules_ok = True

try:
    from openai import OpenAI
    print("✅ OpenAI")
except ImportError:
    print("❌ OpenAI - Run: pip3 install openai")
    modules_ok = False

try:
    from telegram import Bot
    print("✅ Telegram")
except ImportError:
    print("❌ Telegram - Run: pip3 install python-telegram-bot")
    modules_ok = False

try:
    import tweepy
    print("✅ Tweepy")
except ImportError:
    print("❌ Tweepy - Run: pip3 install tweepy")
    modules_ok = False

# Test environment
import os
print("\n🔑 Environment:")

has_openai = bool(os.getenv("OPENAI_API_KEY"))
has_telegram = bool(os.getenv("TELEGRAM_BOT_TOKEN"))

if has_openai:
    print("✅ OPENAI_API_KEY")
else:
    print("❌ OPENAI_API_KEY (required)")

if has_telegram:
    print("✅ TELEGRAM_BOT_TOKEN")
else:
    print("⚠️  TELEGRAM_BOT_TOKEN (optional)")

print("\n" + "=" * 60)

if modules_ok and has_openai:
    print("✅ SYSTEM READY")
    print("\nRun: python3 amd_nexus.py")
else:
    print("❌ SETUP REQUIRED")
    if not modules_ok:
        print("\nInstall: pip3 install -r requirements-nexus.txt")
    if not has_openai:
        print("\nExport: export OPENAI_API_KEY='sk-proj-...'")
    sys.exit(1)
