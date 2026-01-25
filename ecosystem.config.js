/**
 * AMD Solutions 007 - Railway Deployment Configuration
 * 
 * PRODUCTION DEPLOYMENT - EU West (Amsterdam)
 * 
 * ACTIVE SERVICES:
 * 1. Social Broadcast Engine
 * 2. Lead Generator
 * 3. Daily Activity Bot
 * 
 * ⚠️ WhatsApp Bot DISABLED (Local development only)
 * 
 * Usage: pm2-runtime start ecosystem.railway.js
 */

module.exports = {
  apps: [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 SOCIAL BROADCAST ENGINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'social-publisher',
      script: 'python',
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

    {
      name: 'creative-engine',
      script: 'python',
      args: 'social_engine/creative_engine.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/creative-engine-error.log',
      out_file: '/tmp/creative-engine-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    {
      name: 'content-manager',
      script: 'python',
      args: 'social_engine/content_manager.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/content-manager-error.log',
      out_file: '/tmp/content-manager-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 LEAD GENERATION ENGINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'lead-scraper',
      script: 'python',
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
      script: 'python',
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
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖 FACEBOOK AUTOMATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'facebook-poster',
      script: 'python',
      args: 'facebook_browser_poster.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        TZ: 'Europe/Amsterdam'
      },
      error_file: '/tmp/facebook-poster-error.log',
      out_file: '/tmp/facebook-poster-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📈 DASHBOARD & MONITORING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'amd-dashboard',
      script: 'python',
      args: 'amd_dashboard.py',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
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
