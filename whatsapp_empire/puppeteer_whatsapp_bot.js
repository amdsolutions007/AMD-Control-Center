#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AMD SOLUTIONS - 24/7 WHATSAPP AUTO-RESPONDER (PUPPETEER EDITION)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This bot runs FULLY AUTOMATED in the background.
 * NO manual console paste. NO browser interaction needed.
 * Just run: node puppeteer_whatsapp_bot.js
 * 
 * Features:
 * ✅ Auto-login to WhatsApp Web
 * ✅ Smart intent detection (CV, source code, pricing, etc.)
 * ✅ Anti-ban delays (5-15s response time, 60s spam protection)
 * ✅ Auto-reconnect if WhatsApp disconnects
 * ✅ Detailed logging to file
 * ✅ Runs 24/7 - set it and forget it
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

puppeteer.use(StealthPlugin());

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Official AMD Solutions branding
    OFFICIAL_PHONE: '+234 818 002 1007',
    OFFICIAL_EMAIL: 'ceo@amdsolutions007.com',
    OFFICIAL_WEBSITE: 'https://amdsolutions007.com',
    LINKTREE: 'https://linktr.ee/amdsolutions007',
    
    // Bot behavior
    CHECK_INTERVAL: 10000, // Check every 10 seconds
    RESPONSE_DELAY_MIN: 5000, // 5 seconds minimum
    RESPONSE_DELAY_MAX: 15000, // 15 seconds maximum
    SPAM_PROTECTION: 60000, // 60 seconds cooldown per chat
    TYPING_SPEED: 100, // ms per character when typing
    
    // Session persistence
    SESSION_DIR: path.join(__dirname, '.whatsapp-session'),
    LOG_FILE: path.join(__dirname, 'whatsapp_bot.log'),
    
    // Browser settings
    HEADLESS: false, // Set to true to run invisible
    WHATSAPP_URL: 'https://web.whatsapp.com',
};

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const RESPONSES = {
    cv_service: `🎯 *PROFESSIONAL CV WRITING SERVICE*

We create CVs that get you HIRED! Our expert team specializes in:
✅ ATS-optimized CVs that pass automated screening
✅ Industry-specific formatting
✅ Professional cover letters
✅ LinkedIn profile optimization

💼 *Pricing:*
• Standard CV: ₦5,000
• Executive CV: ₦10,000
• Complete Package: ₦15,000

📞 Contact us NOW:
Phone: ${CONFIG.OFFICIAL_PHONE}
Email: ${CONFIG.OFFICIAL_EMAIL}
Website: ${CONFIG.OFFICIAL_WEBSITE}
LinkTree: ${CONFIG.LINKTREE}

Reply "PRICING" for full service list!`,

    source_code: `💻 *PREMIUM SOURCE CODE MARKETPLACE*

Need ready-to-deploy solutions? We've got you covered!

🚀 *Available Projects:*
• E-commerce websites (₦50,000+)
• Booking systems (₦40,000+)
• School management systems (₦60,000+)
• Restaurant POS (₦45,000+)
• Real estate platforms (₦55,000+)
• Custom solutions available!

✅ Fully documented
✅ Easy setup & deployment
✅ Free technical support
✅ Regular updates

📞 Contact us NOW:
Phone: ${CONFIG.OFFICIAL_PHONE}
Email: ${CONFIG.OFFICIAL_EMAIL}
Website: ${CONFIG.OFFICIAL_WEBSITE}
LinkTree: ${CONFIG.LINKTREE}

Reply "CUSTOM" for bespoke development!`,

    pricing: `💰 *AMD SOLUTIONS - FULL PRICING GUIDE*

📝 *CV SERVICES:*
• Standard CV: ₦5,000
• Executive CV: ₦10,000
• Complete Package: ₦15,000

💻 *SOURCE CODE:*
• E-commerce: ₦50,000+
• Booking systems: ₦40,000+
• School systems: ₦60,000+
• Restaurant POS: ₦45,000+

🛠️ *CUSTOM DEVELOPMENT:*
• Website development: ₦100,000+
• Mobile apps: ₦150,000+
• Enterprise systems: ₦200,000+

🎓 *TRAINING:*
• Web development: ₦30,000/month
• Mobile app development: ₦40,000/month
• Full-stack bootcamp: ₦80,000 (3 months)

📞 Contact us NOW:
Phone: ${CONFIG.OFFICIAL_PHONE}
Email: ${CONFIG.OFFICIAL_EMAIL}
Website: ${CONFIG.OFFICIAL_WEBSITE}
LinkTree: ${CONFIG.LINKTREE}`,

    menu: `🎯 *AMD SOLUTIONS - SERVICES MENU*

Reply with any keyword to learn more:

📝 *CV* - Professional CV writing
💻 *CODE* - Source code marketplace
🛠️ *CUSTOM* - Bespoke development
💰 *PRICING* - Full price list
🎓 *TRAINING* - Tech training programs
📱 *CONTACT* - Get in touch

Or tell us what you need and we'll help you!

📞 Direct contact:
Phone: ${CONFIG.OFFICIAL_PHONE}
Email: ${CONFIG.OFFICIAL_EMAIL}
Website: ${CONFIG.OFFICIAL_WEBSITE}
LinkTree: ${CONFIG.LINKTREE}`,

    smart_catchall: `👋 *Hello from AMD Solutions!*

Thank you for reaching out! We're a full-service tech company specializing in:

🎯 Professional CV writing
💻 Software development  
📱 Mobile app creation
🌐 Website design & hosting
🎓 Tech training programs

We build solutions for ALL businesses - whether you're in:
• Hospitality (restaurants, hotels)
• Healthcare (clinics, pharmacies)
• Education (schools, tutoring)
• Retail (shops, supermarkets)
• Professional services (salons, mechanics, consultants)
• And MORE!

*Tell us about your business and what you need - we'll create the perfect solution!*

📞 Contact us NOW:
Phone: ${CONFIG.OFFICIAL_PHONE}
Email: ${CONFIG.OFFICIAL_EMAIL}
Website: ${CONFIG.OFFICIAL_WEBSITE}
LinkTree: ${CONFIG.LINKTREE}

Reply "MENU" to see all our services!`,
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════

class Logger {
    constructor(logFile) {
        this.logFile = logFile;
    }

    _timestamp() {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    async log(level, message) {
        const logEntry = `[${this._timestamp()}] [${level}] ${message}\n`;
        console.log(logEntry.trim());
        try {
            await fs.appendFile(this.logFile, logEntry);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }

    info(msg) { return this.log('INFO', msg); }
    success(msg) { return this.log('SUCCESS', msg); }
    error(msg) { return this.log('ERROR', msg); }
    warn(msg) { return this.log('WARN', msg); }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function detectIntent(message) {
    const text = message.toLowerCase().trim();
    
    // CV Service keywords
    if (text.match(/\b(cv|resume|curriculum|vitae|apply|job|career|hire|employment)\b/i)) {
        return 'cv_service';
    }
    
    // Source code keywords
    if (text.match(/\b(code|source|script|software|system|project|download|ready|buy)\b/i)) {
        return 'source_code';
    }
    
    // Pricing keywords
    if (text.match(/\b(price|pricing|cost|how much|rate|fee|charge|pay|payment)\b/i)) {
        return 'pricing';
    }
    
    // Menu/help keywords
    if (text.match(/\b(menu|service|help|info|what|list|option)\b/i)) {
        return 'menu';
    }
    
    // Custom development keywords
    if (text.match(/\b(custom|bespoke|build|develop|create|design|website|app|mobile)\b/i)) {
        return 'source_code';
    }
    
    // Training keywords
    if (text.match(/\b(train|training|learn|course|teach|bootcamp|class|lesson)\b/i)) {
        return 'pricing';
    }
    
    // Default to smart catch-all
    return 'smart_catchall';
}

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP BOT CLASS
// ═══════════════════════════════════════════════════════════════════════════

class WhatsAppBot {
    constructor() {
        this.browser = null;
        this.page = null;
        this.logger = new Logger(CONFIG.LOG_FILE);
        this.processedChats = new Map(); // Track last response time per chat
        this.isRunning = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async start() {
        await this.logger.info('════════════════════════════════════════════════════════════');
        await this.logger.info('🤖 AMD SOLUTIONS - WHATSAPP AUTO-RESPONDER');
        await this.logger.info('════════════════════════════════════════════════════════════');
        await this.logger.info(`📞 Official: ${CONFIG.OFFICIAL_PHONE}`);
        await this.logger.info(`🌐 Website: ${CONFIG.OFFICIAL_WEBSITE}`);
        await this.logger.info(`🔗 LinkTree: ${CONFIG.LINKTREE}`);
        await this.logger.info('════════════════════════════════════════════════════════════');

        try {
            await this.initBrowser();
            await this.login();
            this.isRunning = true;
            await this.monitorMessages();
        } catch (error) {
            await this.logger.error(`Fatal error: ${error.message}`);
            await this.handleReconnect();
        }
    }

    async initBrowser() {
        await this.logger.info('🚀 Launching browser...');
        
        this.browser = await puppeteer.launch({
            headless: CONFIG.HEADLESS,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled',
            ],
            userDataDir: CONFIG.SESSION_DIR, // Persist session
        });

        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await this.page.setViewport({ width: 1280, height: 800 });
        
        await this.logger.success('✅ Browser launched successfully');
    }

    async login() {
        await this.logger.info('🔐 Navigating to WhatsApp Web...');
        await this.page.goto(CONFIG.WHATSAPP_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Check if already logged in
        try {
            await this.page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 10000 });
            await this.logger.success('✅ Already logged in!');
            this.reconnectAttempts = 0; // Reset counter on successful login
            return;
        } catch {
            // Not logged in, need to scan QR
            await this.logger.warn('⚠️  Not logged in. Waiting for QR code scan...');
            await this.logger.info('📱 Please scan the QR code with your phone');
            
            // Wait for login (QR code scan)
            await this.page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 120000 });
            await this.logger.success('✅ Login successful!');
            this.reconnectAttempts = 0;
        }
    }

    async monitorMessages() {
        await this.logger.success('✅ BOT STARTED - Monitoring for messages...');
        await this.logger.info(`⏱️  Checking every ${CONFIG.CHECK_INTERVAL / 1000} seconds`);

        while (this.isRunning) {
            try {
                await this.checkForUnreadMessages();
                await this.sleep(CONFIG.CHECK_INTERVAL);
            } catch (error) {
                await this.logger.error(`Error in monitoring loop: ${error.message}`);
                await this.handleReconnect();
                break;
            }
        }
    }

    async checkForUnreadMessages() {
        try {
            // Find unread message badges using aria-label (the selector that works!)
            const unreadChats = await this.page.$$('span[aria-label*="unread message"]');
            
            if (unreadChats.length === 0) {
                return;
            }

            await this.logger.info(`📬 Found ${unreadChats.length} unread chat(s)`);

            for (const badge of unreadChats) {
                try {
                    // Find the chat container
                    const chatElement = await badge.evaluateHandle(el => {
                        return el.closest('div[data-testid="cell-frame-container"]') ||
                               el.closest('div[tabindex="-1"]') ||
                               el.closest('div');
                    });

                    if (!chatElement) continue;

                    // Click to open chat
                    await chatElement.click();
                    await this.sleep(2000); // Wait for chat to load

                    // Process the chat
                    await this.processCurrentChat();

                } catch (error) {
                    await this.logger.error(`Error processing chat: ${error.message}`);
                }
            }
        } catch (error) {
            await this.logger.error(`Error checking messages: ${error.message}`);
        }
    }

    async processCurrentChat() {
        try {
            // Get chat name from header
            const chatName = await this.page.$eval('header span[dir="auto"]', el => el.textContent).catch(() => 'Unknown');
            
            // Check spam protection
            if (this.isRecentlyProcessed(chatName)) {
                await this.logger.warn(`⏭️  Skipping ${chatName} - recently responded (spam protection)`);
                return;
            }

            await this.logger.info(`💬 Processing chat: ${chatName}`);

            // Get the last message
            const lastMessage = await this.getLastMessage();
            if (!lastMessage) {
                await this.logger.warn('⚠️  Could not read message');
                return;
            }

            await this.logger.info(`📖 Message: "${lastMessage.substring(0, 100)}..."`);

            // Detect intent
            const intent = detectIntent(lastMessage);
            await this.logger.info(`🎯 Intent detected: ${intent}`);

            // Get response template
            const response = RESPONSES[intent];

            // Human-like delay before responding
            const delay = CONFIG.RESPONSE_DELAY_MIN + Math.random() * (CONFIG.RESPONSE_DELAY_MAX - CONFIG.RESPONSE_DELAY_MIN);
            await this.logger.info(`⏳ Waiting ${Math.round(delay / 1000)}s before responding...`);
            await this.sleep(delay);

            // Send response
            await this.sendMessage(response);
            await this.logger.success(`✅ Sent ${intent} response to ${chatName}`);

            // Mark as processed
            this.processedChats.set(chatName, Date.now());

        } catch (error) {
            await this.logger.error(`Error processing chat: ${error.message}`);
        }
    }

    async getLastMessage() {
        try {
            // Try multiple selectors for message bubbles (WhatsApp keeps changing them!)
            let messages = await this.page.$$('div[class*="message-in"]');
            
            // Fallback 1: Try data-testid
            if (messages.length === 0) {
                messages = await this.page.$$('div[data-testid="msg-container"]');
            }
            
            // Fallback 2: Try role-based selector
            if (messages.length === 0) {
                messages = await this.page.$$('div[role="row"]');
            }
            
            if (messages.length === 0) return null;

            // Get the last incoming message - try multiple text selectors
            const lastMsg = messages[messages.length - 1];
            
            // Try multiple text selectors
            let text = await lastMsg.$eval('span.selectable-text', el => el.textContent).catch(() => '');
            
            if (!text) {
                text = await lastMsg.$eval('span[dir="ltr"]', el => el.textContent).catch(() => '');
            }
            
            if (!text) {
                text = await lastMsg.$eval('div[class*="copyable-text"]', el => el.textContent).catch(() => '');
            }
            
            if (!text) {
                // Last resort: get all text content
                text = await lastMsg.evaluate(el => el.textContent).catch(() => '');
            }
            
            return text.trim();
        } catch (error) {
            await this.logger.error(`Error reading message: ${error.message}`);
            return null;
        }
    }

    async sendMessage(text) {
        try {
            // Find message input box
            const inputSelector = 'div[contenteditable="true"][data-tab="10"]';
            await this.page.waitForSelector(inputSelector, { timeout: 5000 });

            // Type message with human-like speed
            await this.page.click(inputSelector);
            await this.page.type(inputSelector, text, { delay: 50 });

            // Wait a bit
            await this.sleep(1000);

            // Send message (press Enter)
            await this.page.keyboard.press('Enter');
            await this.sleep(2000); // Wait for message to send

        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    isRecentlyProcessed(chatName) {
        const lastProcessed = this.processedChats.get(chatName);
        if (!lastProcessed) return false;
        
        const timeSince = Date.now() - lastProcessed;
        return timeSince < CONFIG.SPAM_PROTECTION;
    }

    async handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            await this.logger.error('❌ Max reconnection attempts reached. Please restart manually.');
            await this.stop();
            process.exit(1);
        }

        this.reconnectAttempts++;
        await this.logger.warn(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        await this.stop();
        await this.sleep(5000);
        await this.start();
    }

    async stop() {
        this.isRunning = false;
        if (this.browser) {
            await this.browser.close();
            await this.logger.info('🛑 Browser closed');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
    const bot = new WhatsAppBot();

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n\n🛑 Shutting down gracefully...');
        await bot.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n\n🛑 Shutting down gracefully...');
        await bot.stop();
        process.exit(0);
    });

    // Start the bot
    await bot.start();
}

// Run the bot
if (require.main === module) {
    main().catch(console.error);
}

module.exports = WhatsAppBot;
