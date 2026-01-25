/**
 * AMD Solutions 007 - Railway Deployment Configuration
 * 
 * PRODUCTION DEPLOYMENT - EU West (Amsterdam)
 * 
 * ACTIVE SERVICES:
 * 1. Social Publisher (Cron: 9 AM & 9 PM)
 * 2. Lead Scraper (Cron: 10 AM)
 * 3. Lead Outreach (Cron: 11 AM)
 * 4. AMD Dashboard (Streamlit Server - Continuous)
 * 
 * ⚠️ REMOVED: One-shot test scripts (creative-engine, content-manager, facebook-poster)
 * ⚠️ WhatsApp Bot DISABLED (Local development only)
 * 
 * Usage: pm2-runtime ecosystem.config.js
 */

module.exports = {
  apps: [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 SOCIAL BROADCAST ENGINE (Scheduled)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'social-publisher',
      script: '/opt/venv/bin/python',
      args: '/app/scripts/social_publisher.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      cron_restart: '0 9,21 * * *', // 9 AM and 9 PM daily
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/social-publisher-error.log',
      out_file: '/tmp/social-publisher-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 LEAD GENERATION ENGINE (Scheduled)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'lead-scraper',
      script: '/opt/venv/bin/python',
      args: '/app/lead_engine/scrape_leads.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      cron_restart: '0 10 * * *', // 10 AM daily
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/lead-scraper-error.log',
      out_file: '/tmp/lead-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    {
      name: 'lead-outreach',
      script: '/opt/venv/bin/python',
      args: '/app/lead_engine/send_outreach.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      cron_restart: '0 11 * * *', // 11 AM daily (after scraping)
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/lead-outreach-error.log',
      out_file: '/tmp/lead-outreach-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 DASHBOARD & MONITORING (Streamlit Server - Continuous)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'amd-dashboard',
      script: '/opt/venv/bin/python',
      args: '-m streamlit run /app/amd_dashboard.py --server.port=8501 --server.address=0.0.0.0',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/dashboard-error.log',
      out_file: '/tmp/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 REMOVED SERVICES (One-shot scripts, not daemons):
    // - creative-engine: Test script, exits after execution
    // - content-manager: Test script, exits after execution  
    // - facebook-poster: Browser automation, exits after posting
    // 
    // These are utility scripts called by social-publisher when needed.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚠️ WHATSAPP BOT - DISABLED FOR RAILWAY DEPLOYMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Reason: Requires QR code scanning and persistent session
    // Use local deployment only
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /*
    {
      name: 'whatsapp-bot',
      script: 'python',
      args: 'client_bot/bot.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/whatsapp-bot-error.log',
      out_file: '/tmp/whatsapp-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
    */
  ]
};
