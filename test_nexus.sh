#!/bin/bash

# AMD NEXUS - Test Run Script
# Tests the autopilot system without actually posting

echo "═══════════════════════════════════════════════════════════════"
echo "🧪 AMD NEXUS - DRY RUN TEST"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check environment variables
echo "📋 Environment Check:"

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set"
    echo "Export it: export OPENAI_API_KEY='sk-proj-...'"
    exit 1
else
    echo "✅ OPENAI_API_KEY set"
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️ TELEGRAM_BOT_TOKEN not set (optional)"
else
    echo "✅ TELEGRAM_BOT_TOKEN set"
fi

if [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo "⚠️ TELEGRAM_CHAT_ID not set (optional)"
else
    echo "✅ TELEGRAM_CHAT_ID set"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Running AMD NEXUS..."
echo "═══════════════════════════════════════════════════════════════"
echo ""

python3 amd_nexus.py

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ TEST COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📁 Check nexus_output/ for generated posts"
echo "📊 Check Railway dashboard for processed leads"
echo "📱 Check Telegram for CEO report"
echo ""
echo "To deploy to Railway: git add . && git commit -m 'Add AMD NEXUS' && git push"
