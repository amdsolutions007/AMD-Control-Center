#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# AMD SOLUTIONS - WhatsApp Bot Launcher
# ═══════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_SCRIPT="$SCRIPT_DIR/puppeteer_whatsapp_bot.js"
PID_FILE="$SCRIPT_DIR/.whatsapp_bot.pid"
LOG_FILE="$SCRIPT_DIR/whatsapp_bot.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🤖 AMD SOLUTIONS - WHATSAPP BOT LAUNCHER${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

# Function to check if bot is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to start the bot
start_bot() {
    if is_running; then
        echo -e "${YELLOW}⚠️  Bot is already running (PID: $(cat "$PID_FILE"))${NC}"
        echo -e "${BLUE}Use './start_whatsapp_bot.sh status' to check status${NC}"
        echo -e "${BLUE}Use './start_whatsapp_bot.sh stop' to stop the bot${NC}"
        exit 1
    fi

    echo -e "${GREEN}🚀 Starting WhatsApp bot...${NC}"
    
    cd "$SCRIPT_DIR" || exit 1
    
    # Start bot in background
    nohup node "$BOT_SCRIPT" >> "$LOG_FILE" 2>&1 &
    BOT_PID=$!
    
    # Save PID
    echo "$BOT_PID" > "$PID_FILE"
    
    echo -e "${GREEN}✅ Bot started successfully!${NC}"
    echo -e "${GREEN}   PID: $BOT_PID${NC}"
    echo -e "${GREEN}   Log: $LOG_FILE${NC}"
    echo ""
    echo -e "${YELLOW}📱 IMPORTANT: Open Chrome and scan QR code if this is first run${NC}"
    echo -e "${YELLOW}   The bot will save your session for future runs${NC}"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo -e "${BLUE}   ./start_whatsapp_bot.sh status  - Check bot status${NC}"
    echo -e "${BLUE}   ./start_whatsapp_bot.sh stop    - Stop the bot${NC}"
    echo -e "${BLUE}   ./start_whatsapp_bot.sh restart - Restart the bot${NC}"
    echo -e "${BLUE}   ./start_whatsapp_bot.sh logs    - View live logs${NC}"
}

# Function to stop the bot
stop_bot() {
    if ! is_running; then
        echo -e "${YELLOW}⚠️  Bot is not running${NC}"
        exit 1
    fi

    PID=$(cat "$PID_FILE")
    echo -e "${RED}🛑 Stopping bot (PID: $PID)...${NC}"
    
    kill "$PID"
    sleep 2
    
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Bot didn't stop gracefully, forcing...${NC}"
        kill -9 "$PID"
    fi
    
    rm -f "$PID_FILE"
    echo -e "${GREEN}✅ Bot stopped successfully${NC}"
}

# Function to check status
check_status() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📊 BOT STATUS${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    
    if is_running; then
        PID=$(cat "$PID_FILE")
        UPTIME=$(ps -o etime= -p "$PID" | tr -d ' ')
        MEMORY=$(ps -o rss= -p "$PID" | awk '{printf "%.1f MB", $1/1024}')
        
        echo -e "${GREEN}✅ Status: RUNNING${NC}"
        echo -e "${GREEN}   PID: $PID${NC}"
        echo -e "${GREEN}   Uptime: $UPTIME${NC}"
        echo -e "${GREEN}   Memory: $MEMORY${NC}"
        echo -e "${GREEN}   Log: $LOG_FILE${NC}"
        echo ""
        echo -e "${BLUE}Last 5 log entries:${NC}"
        tail -5 "$LOG_FILE"
    else
        echo -e "${RED}❌ Status: NOT RUNNING${NC}"
    fi
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

# Function to view live logs
view_logs() {
    echo -e "${BLUE}📜 Viewing live logs (Ctrl+C to exit)...${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    tail -f "$LOG_FILE"
}

# Function to restart bot
restart_bot() {
    echo -e "${YELLOW}🔄 Restarting bot...${NC}"
    stop_bot
    sleep 2
    start_bot
}

# Main command handler
case "$1" in
    start)
        start_bot
        ;;
    stop)
        stop_bot
        ;;
    restart)
        restart_bot
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 {start|stop|restart|status|logs}${NC}"
        echo ""
        echo -e "${BLUE}Commands:${NC}"
        echo -e "  ${GREEN}start${NC}   - Start the WhatsApp bot"
        echo -e "  ${RED}stop${NC}    - Stop the WhatsApp bot"
        echo -e "  ${YELLOW}restart${NC} - Restart the WhatsApp bot"
        echo -e "  ${BLUE}status${NC}  - Check bot status"
        echo -e "  ${BLUE}logs${NC}    - View live logs"
        exit 1
        ;;
esac
