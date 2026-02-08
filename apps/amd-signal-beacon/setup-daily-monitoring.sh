#!/bin/bash
# Setup Daily Automated Monitoring for AMD Signal Beacon
# This script sets up a cron job to run daily health checks

echo "🎖️ AMD SIGNAL BEACON - Setting up Daily Monitoring"
echo "================================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MONITOR_SCRIPT="$SCRIPT_DIR/monitor-deployment.sh"
LOG_FILE="$SCRIPT_DIR/deployment-monitor.log"

# Check if monitor script exists
if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo "❌ ERROR: monitor-deployment.sh not found at $MONITOR_SCRIPT"
    exit 1
fi

# Make sure it's executable
chmod +x "$MONITOR_SCRIPT"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

echo "✅ Found monitoring script at: $MONITOR_SCRIPT"
echo "📝 Logs will be saved to: $LOG_FILE"
echo ""

# Create cron job entry
CRON_ENTRY="0 9 * * * $MONITOR_SCRIPT >> $LOG_FILE 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$MONITOR_SCRIPT"; then
    echo "⚠️  Cron job already exists for this script"
    echo ""
    echo "Current cron jobs:"
    crontab -l | grep "$MONITOR_SCRIPT"
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
    
    # Remove old entry
    crontab -l | grep -v "$MONITOR_SCRIPT" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo ""
echo "================================================"
echo "✅ DAILY MONITORING SETUP COMPLETE!"
echo "================================================"
echo ""
echo "📅 Schedule: Daily at 9:00 AM"
echo "📝 Log file: $LOG_FILE"
echo "🔧 Monitor script: $MONITOR_SCRIPT"
echo ""
echo "🎯 What happens now:"
echo "  1. Every morning at 9 AM, the script will:"
echo "     • Check if Signal Beacon is live"
echo "     • Verify analytics dashboard"
echo "     • Test RSS feed"
echo "     • Measure response time"
echo "     • Check SSL certificate"
echo ""
echo "  2. Results are logged to: deployment-monitor.log"
echo ""
echo "  3. If site is down, script exits with error code"
echo "     (Can be used with alerting systems)"
echo ""
echo "📊 To view logs:"
echo "  tail -f $LOG_FILE"
echo ""
echo "🧪 To test manually:"
echo "  $MONITOR_SCRIPT"
echo ""
echo "❌ To remove daily monitoring:"
echo "  crontab -l | grep -v 'monitor-deployment.sh' | crontab -"
echo ""
echo "🔗 Current cron jobs:"
crontab -l
echo ""
