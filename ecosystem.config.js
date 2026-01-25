/**
 * AMD Solutions 007 - PM2 Ecosystem Configuration
 * 
 * Process Management for Python Automation Scripts
 * Usage: pm2 start ecosystem.config.js
 * 
 * Commands:
 * - pm2 start ecosystem.config.js --only revenue-machine
 * - pm2 restart all
 * - pm2 logs
 * - pm2 monit
 * - pm2 status
 */

module.exports = {
  apps: [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CORE REVENUE ENGINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'revenue-machine',
      script: '.venv/bin/python',
      args: 'revenue_machine.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/revenue-machine-error.log',
      out_file: 'logs/revenue-machine-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SOCIAL MEDIA AUTOMATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'social-publisher',
      script: '.venv/bin/python',
      args: 'scripts/social_publisher.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      cron_restart: '0 9,21 * * *', // Run at 9 AM and 9 PM daily
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/social-publisher-error.log',
      out_file: 'logs/social-publisher-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    {
      name: 'creative-engine',
      script: '.venv/bin/python',
      args: 'social_engine/creative_engine.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/creative-engine-error.log',
      out_file: 'logs/creative-engine-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    {
      name: 'content-manager',
      script: '.venv/bin/python',
      args: 'social_engine/content_manager.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/content-manager-error.log',
      out_file: 'logs/content-manager-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UPLOAD AUTOMATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'amd-uploader',
      script: '.venv/bin/python',
      args: 'amd_uploader.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/amd-uploader-error.log',
      out_file: 'logs/amd-uploader-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    {
      name: 'amd-pro-uploader',
      script: '.venv/bin/python',
      args: 'amd_pro_uploader.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/amd-pro-uploader-error.log',
      out_file: 'logs/amd-pro-uploader-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // VIDEO PRODUCTION PIPELINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'viral-editor',
      script: '.venv/bin/python',
      args: 'amd_viral_editor.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/viral-editor-error.log',
      out_file: 'logs/viral-editor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    {
      name: 'stitcher',
      script: '.venv/bin/python',
      args: 'amd_stitcher.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/stitcher-error.log',
      out_file: 'logs/stitcher-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // META/FACEBOOK ADVERTISING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'facebook-poster',
      script: '.venv/bin/python',
      args: 'facebook_browser_poster.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/facebook-poster-error.log',
      out_file: 'logs/facebook-poster-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    {
      name: 'meta-campaign',
      script: '.venv/bin/python',
      args: 'launch_meta_campaign.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/meta-campaign-error.log',
      out_file: 'logs/meta-campaign-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // WHATSAPP AUTOMATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'whatsapp-bot',
      script: 'client_bot/bot.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: '.venv/bin/python',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/whatsapp-bot-error.log',
      out_file: 'logs/whatsapp-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LEAD GENERATION ENGINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'lead-scraper',
      script: '.venv/bin/python',
      args: 'lead_engine/scrape_leads.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      cron_restart: '0 10 * * *', // Run at 10 AM daily
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/lead-scraper-error.log',
      out_file: 'logs/lead-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    {
      name: 'lead-outreach',
      script: '.venv/bin/python',
      args: 'lead_engine/send_outreach.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      cron_restart: '0 11 * * *', // Run at 11 AM daily (after scraping)
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/lead-outreach-error.log',
      out_file: 'logs/lead-outreach-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DASHBOARD & MONITORING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
      name: 'amd-dashboard',
      script: '.venv/bin/python',
      args: 'amd_dashboard.py',
      cwd: '/Users/mac/Desktop/AMD_Control_Center',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1'
      },
      error_file: 'logs/dashboard-error.log',
      out_file: 'logs/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
