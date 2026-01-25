/**
 * AMD Solutions 007 - PM2 Worker Configuration
 * 
 * PRODUCTION DEPLOYMENT - EU West (Amsterdam)
 * 
 * WORKER SERVICES (Background Jobs):
 * 1. Social Publisher (Cron: 9 AM & 9 PM)
 * 2. Lead Scraper (Cron: 10 AM)
 * 3. Lead Outreach (Cron: 11 AM)
 * 4. Gmail Scout Sniper (24/7 Real-Time Lead Intelligence)
 * 
 * NOTE: Dashboard runs separately via railway.json startCommand
 * 
 * Usage: pm2-runtime ecosystem.config.js (called from Procfile worker)
 */

module.exports = {
  apps: [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 SOCIAL BROADCAST ENGINE (Scheduled)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'social-publisher',
      script: '/opt/venv/bin/python',
      args: 'scripts/social_publisher.py',
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
    // 🎯 GMAIL SCOUT SNIPER (Real-Time 24/7)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'gmail-scout-sniper',
      script: '/opt/venv/bin/python',
      args: 'lead_engine/gmail_scout_sniper.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 5000, // Wait 5s before restarting on crash
      max_restarts: 10, // Max 10 restarts per hour
      min_uptime: '30s', // Must run 30s to be considered started
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      error_file: '/tmp/gmail-scout-sniper-error.log',
      out_file: '/tmp/gmail-scout-sniper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 LEAD GENERATION ENGINE (Scheduled)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'lead-scraper',
      script: '/opt/venv/bin/python',
      args: 'lead_engine/scrape_leads.py',
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
      args: 'lead_engine/send_outreach.py',
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
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 REMOVED SERVICES:
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // - amd-dashboard: Moved to Procfile web process
    // - creative-engine: Test script, exits after execution
    // - content-manager: Test script, exits after execution  
    // - facebook-poster: Browser automation, exits after posting
    // 
    // Utility scripts are called by social-publisher when needed.
    // Dashboard runs as separate web process via Procfile.
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
