#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# AMD SOLUTIONS - AI WHATSAPP BOT CONTROL SCRIPT
# ═══════════════════════════════════════════════════════════════════════════

BOT_DIR="/Users/mac/Desktop/AMD_Control_Center/whatsapp_empire"
AI_BOT_SCRIPT="$BOT_DIR/puppeteer_whatsapp_ai_bot.js"
OLD_BOT_SCRIPT="$BOT_DIR/puppeteer_whatsapp_bot.js"
PID_FILE="$BOT_DIR/.whatsapp_ai_bot.pid"
LOG_FILE="$BOT_DIR/whatsapp_ai_bot.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

check_api_key() {
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}⚠️  WARNING: OPENAI_API_KEY environment variable not set!${NC}"
        echo -e "${YELLOW}AI responses will be disabled. Bot will use fallback templates.${NC}"
        echo ""
        echo "To enable AI intelligence (95/100):"
        echo "  1. Get API key from: https://platform.openai.com/api-keys"
        echo "  2. Add to ~/.zshrc: export OPENAI_API_KEY=\"sk-YOUR-KEY\""
        echo "  3. Run: source ~/.zshrc"
        echo ""
        read -p "Continue with fallback mode? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✅ OpenAI API key found${NC}"
        echo -e "${BLUE}🧠 AI Intelligence: ENABLED (95/100)${NC}"
    fi
}

start_ai_bot() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🤖 Starting AI-Powered WhatsApp Bot${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  AI Bot is already running (PID: $PID)${NC}"
            echo "Use 'stop' command first, then start again"
            exit 1
        else
            rm "$PID_FILE"
        fi
    fi
    
    check_api_key
    
    cd "$BOT_DIR"
    
    echo -e "${BLUE}📁 Working directory: $BOT_DIR${NC}"
    echo -e "${BLUE}🚀 Starting AI bot in background...${NC}"
    
    # Start the AI bot in background
    nohup node "$AI_BOT_SCRIPT" > "$LOG_FILE" 2>&1 &
    PID=$!
    
    echo $PID > "$PID_FILE"
    
    sleep 3
    
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ AI Bot started successfully!${NC}"
        echo -e "${GREEN}   PID: $PID${NC}"
        echo -e "${BLUE}   Log file: $LOG_FILE${NC}"
        echo ""
        echo -e "${YELLOW}📱 Now scan the QR code in Chrome if not logged in${NC}"
        echo -e "${YELLOW}📊 Monitor logs: tail -f $LOG_FILE${NC}"
        echo ""
        echo -e "${GREEN}🧠 Intelligence Level: 95/100${NC}"
        echo -e "${GREEN}   - Understands context${NC}"
        echo -e "${GREEN}   - Remembers conversations${NC}"
        echo -e "${GREEN}   - Answers ANY question${NC}"
        echo -e "${GREEN}   - Recommends specific solutions${NC}"
    else
        echo -e "${RED}❌ Failed to start AI bot${NC}"
        echo "Check the log file for errors: $LOG_FILE"
        exit 1
    fi
}

start_old_bot() {
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}🤖 Starting Old (Keyword-Matching) Bot${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️  WARNING: This is the 40/100 intelligence version${NC}"
    echo -e "${YELLOW}   Consider using AI version for better results${NC}"
    echo ""
    
    read -p "Continue with old bot? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Use './start_ai_bot.sh start' for AI version"
        exit 1
    fi
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Bot is already running (PID: $PID)${NC}"
            exit 1
        fi
    fi
    
    cd "$BOT_DIR"
    nohup node "$OLD_BOT_SCRIPT" > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    sleep 3
    
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Old bot started (PID: $PID)${NC}"
        echo -e "${YELLOW}   Intelligence: 40/100 (keyword matching only)${NC}"
    else
        echo -e "${RED}❌ Failed to start${NC}"
        exit 1
    fi
}

stop_bot() {
    echo -e "${BLUE}🛑 Stopping WhatsApp Bot...${NC}"
    
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${YELLOW}⚠️  No PID file found. Bot might not be running.${NC}"
        
        # Try to find and kill any running bots
        PIDS=$(ps aux | grep 'puppeteer_whatsapp.*bot.js' | grep -v grep | awk '{print $2}')
        if [ ! -z "$PIDS" ]; then
            echo -e "${YELLOW}Found running bot process(es): $PIDS${NC}"
            echo $PIDS | xargs kill -9 2>/dev/null
            echo -e "${GREEN}✅ Killed running bot process(es)${NC}"
        else
            echo -e "${YELLOW}No running bot found${NC}"
        fi
        exit 0
    fi
    
    PID=$(cat "$PID_FILE")
    
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID 2>/dev/null
        sleep 2
        
        if ps -p $PID > /dev/null 2>&1; then
            kill -9 $PID 2>/dev/null
            echo -e "${YELLOW}⚠️  Forced termination${NC}"
        else
            echo -e "${GREEN}✅ Bot stopped successfully${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Bot was not running (stale PID file)${NC}"
    fi
    
    rm -f "$PID_FILE"
}

status_bot() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📊 WhatsApp Bot Status${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Bot is RUNNING${NC}"
            echo -e "   PID: $PID"
            
            # Check which bot is running
            BOT_CMD=$(ps -p $PID -o command=)
            if [[ $BOT_CMD == *"ai_bot"* ]]; then
                echo -e "   Version: ${GREEN}AI-Powered (95/100)${NC}"
                if [ -z "$OPENAI_API_KEY" ]; then
                    echo -e "   ${YELLOW}⚠️  No API key - using fallback mode${NC}"
                else
                    echo -e "   AI Status: ${GREEN}ENABLED${NC}"
                fi
            else
                echo -e "   Version: ${YELLOW}Old Keyword-Matching (40/100)${NC}"
            fi
            
            # Show uptime
            START_TIME=$(ps -p $PID -o lstart=)
            echo -e "   Started: $START_TIME"
            
            # Check log file size
            if [ -f "$LOG_FILE" ]; then
                LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
                echo -e "   Log size: $LOG_SIZE"
            fi
        else
            echo -e "${RED}❌ Bot is NOT running (stale PID file)${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}❌ Bot is NOT running${NC}"
        
        # Check if any bot process exists
        if ps aux | grep 'puppeteer_whatsapp.*bot.js' | grep -v grep > /dev/null; then
            echo -e "${YELLOW}⚠️  Found orphan bot process(es):${NC}"
            ps aux | grep 'puppeteer_whatsapp.*bot.js' | grep -v grep
        fi
    fi
    
    echo ""
    echo -e "${BLUE}API Key Status:${NC}"
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "   ${RED}❌ Not configured${NC}"
        echo -e "   AI responses disabled"
    else
        echo -e "   ${GREEN}✅ Configured${NC}"
        echo -e "   AI responses enabled"
    fi
    
    echo ""
    echo -e "${BLUE}Log file:${NC} $LOG_FILE"
    echo -e "${BLUE}PID file:${NC} $PID_FILE"
}

show_logs() {
    if [ ! -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}⚠️  Log file not found: $LOG_FILE${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📜 Recent Bot Logs (last 50 lines)${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    tail -n 50 "$LOG_FILE"
    echo ""
    echo -e "${YELLOW}For live monitoring: tail -f $LOG_FILE${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

case "$1" in
    start)
        start_ai_bot
        ;;
    start-old)
        start_old_bot
        ;;
    stop)
        stop_bot
        ;;
    restart)
        stop_bot
        sleep 2
        start_ai_bot
        ;;
    status)
        status_bot
        ;;
    logs)
        show_logs
        ;;
    *)
        echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}🤖 AMD Solutions - AI WhatsApp Bot Control${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Usage: $0 {start|start-old|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  ${GREEN}start${NC}       - Start AI-powered bot (95/100 intelligence)"
        echo "  ${YELLOW}start-old${NC}   - Start old keyword-matching bot (40/100)"
        echo "  ${RED}stop${NC}        - Stop the bot"
        echo "  ${BLUE}restart${NC}     - Restart the AI bot"
        echo "  ${BLUE}status${NC}      - Check bot status"
        echo "  ${BLUE}logs${NC}        - View recent logs"
        echo ""
        echo "Examples:"
        echo "  ./start_ai_bot.sh start     # Start AI bot"
        echo "  ./start_ai_bot.sh status    # Check if running"
        echo "  ./start_ai_bot.sh logs      # View logs"
        echo "  ./start_ai_bot.sh stop      # Stop bot"
        echo ""
        echo -e "${YELLOW}💡 Tip: Use 'start' for best results (AI-powered)${NC}"
        exit 1
        ;;
esac

exit 0
