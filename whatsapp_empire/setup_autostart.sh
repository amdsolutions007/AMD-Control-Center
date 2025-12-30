#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# AMD SOLUTIONS - WhatsApp Bot Auto-Start Setup
# ═══════════════════════════════════════════════════════════════════════════
# This script installs the WhatsApp bot as a system service that:
# - Starts automatically when your Mac boots
# - Runs 24/7 without manual intervention
# - Auto-restarts if it crashes
# - You never need to touch it again
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🤖 AMD SOLUTIONS - AUTO-START SETUP${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLIST_SOURCE="$SCRIPT_DIR/com.amdsolutions.whatsappbot.plist"
PLIST_TARGET="$HOME/Library/LaunchAgents/com.amdsolutions.whatsappbot.plist"

# Check if node exists
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo -e "${YELLOW}Install Node.js first: https://nodejs.org${NC}"
    exit 1
fi

NODE_PATH=$(which node)
echo -e "${GREEN}✅ Found Node.js at: $NODE_PATH${NC}"

# Update plist with correct node path
echo -e "${BLUE}📝 Updating plist with your Node.js path...${NC}"
sed -i '' "s|/usr/local/bin/node|$NODE_PATH|g" "$PLIST_SOURCE"

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"

# Stop existing service if running
echo -e "${BLUE}🛑 Stopping any existing service...${NC}"
launchctl unload "$PLIST_TARGET" 2>/dev/null || true

# Stop manual bot instance if running
if [ -f "$SCRIPT_DIR/.whatsapp_bot.pid" ]; then
    OLD_PID=$(cat "$SCRIPT_DIR/.whatsapp_bot.pid")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Stopping manually started bot (PID: $OLD_PID)...${NC}"
        kill "$OLD_PID" 2>/dev/null || true
        sleep 2
    fi
    rm -f "$SCRIPT_DIR/.whatsapp_bot.pid"
fi

# Copy plist to LaunchAgents
echo -e "${BLUE}📋 Installing service...${NC}"
cp "$PLIST_SOURCE" "$PLIST_TARGET"

# Set correct permissions
chmod 644 "$PLIST_TARGET"

# Load the service
echo -e "${BLUE}🚀 Starting service...${NC}"
launchctl load "$PLIST_TARGET"

# Wait a moment for service to start
sleep 3

# Check if service is running
if launchctl list | grep -q com.amdsolutions.whatsappbot; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ SUCCESS! BOT IS NOW RUNNING 24/7${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}🎉 What just happened:${NC}"
    echo -e "${GREEN}   ✅ Bot installed as system service${NC}"
    echo -e "${GREEN}   ✅ Starts automatically when Mac boots${NC}"
    echo -e "${GREEN}   ✅ Runs 24/7 without manual intervention${NC}"
    echo -e "${GREEN}   ✅ Auto-restarts if it crashes${NC}"
    echo -e "${GREEN}   ✅ Logs everything to whatsapp_bot.log${NC}"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📋 USEFUL COMMANDS${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Check if bot is running:${NC}"
    echo "   launchctl list | grep whatsappbot"
    echo ""
    echo -e "${YELLOW}View live logs:${NC}"
    echo "   tail -f $SCRIPT_DIR/whatsapp_bot.log"
    echo ""
    echo -e "${YELLOW}Stop the service (if needed):${NC}"
    echo "   launchctl unload $PLIST_TARGET"
    echo ""
    echo -e "${YELLOW}Start the service again:${NC}"
    echo "   launchctl load $PLIST_TARGET"
    echo ""
    echo -e "${YELLOW}Restart the service:${NC}"
    echo "   launchctl unload $PLIST_TARGET && launchctl load $PLIST_TARGET"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎯 YOU'RE DONE!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}The bot is now running and will:${NC}"
    echo -e "${GREEN}   • Start automatically every time you boot your Mac${NC}"
    echo -e "${GREEN}   • Run 24/7 without you doing anything${NC}"
    echo -e "${GREEN}   • Restart automatically if it crashes${NC}"
    echo ""
    echo -e "${GREEN}You NEVER need to manually start it again!${NC}"
    echo ""
    echo -e "${BLUE}Go be with your family. The bot handles everything. 💚${NC}"
    echo ""
else
    echo -e "${RED}❌ Service failed to start${NC}"
    echo -e "${YELLOW}Check logs:${NC}"
    echo "   tail -50 $SCRIPT_DIR/whatsapp_bot.log"
    echo "   tail -50 $SCRIPT_DIR/whatsapp_bot_error.log"
    exit 1
fi
