#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AMD SOLUTIONS - NAIJABIZ PILOT (AI-POWERED WHATSAPP SECRETARY)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Code Name: "NaijaBiz Pilot"
 * Intelligence: 95/100 (GPT-4 Powered)
 * Mission: Automate WhatsApp customer service with human-level intelligence
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('./ai_knowledge_base');

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
    
    // AI Settings
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'gpt-4-turbo-preview',
    MAX_CONVERSATION_HISTORY: parseInt(process.env.MAX_CONVERSATION_HISTORY || '10'),
    
    // Session persistence
    SESSION_DIR: path.join(__dirname, '.whatsapp-session'),
    LOG_FILE: path.join(__dirname, 'whatsapp_ai_bot.log'),
    CONVERSATION_FILE: path.join(__dirname, '.conversation_history.json'),
    
    // Browser settings
    HEADLESS: false,
    WHATSAPP_URL: 'https://web.whatsapp.com',
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
    ai(msg) { return this.log('AI', msg); }
}

// ═══════════════════════════════════════════════════════════════════════════
// AI CONVERSATION MANAGER
// ═══════════════════════════════════════════════════════════════════════════

class AIConversationManager {
    constructor(apiKey, logger) {
        this.logger = logger;
        this.conversations = new Map(); // chatName -> message history
        
        if (!apiKey) {
            this.logger.warn('⚠️  No OpenAI API key found. AI responses disabled. Set OPENAI_API_KEY environment variable.');
            this.openai = null;
        } else {
            this.openai = new OpenAI({ apiKey });
            this.logger.success('✅ AI initialized with GPT-4');
        }
        
        this.loadConversations();
    }

    async loadConversations() {
        try {
            const data = await fs.readFile(CONFIG.CONVERSATION_FILE, 'utf8');
            const saved = JSON.parse(data);
            this.conversations = new Map(Object.entries(saved));
            await this.logger.info(`📚 Loaded conversation history for ${this.conversations.size} chats`);
        } catch (err) {
            // File doesn't exist yet, that's fine
            this.conversations = new Map();
        }
    }

    async saveConversations() {
        try {
            const obj = Object.fromEntries(this.conversations);
            await fs.writeFile(CONFIG.CONVERSATION_FILE, JSON.stringify(obj, null, 2));
        } catch (err) {
            await this.logger.error(`Failed to save conversations: ${err.message}`);
        }
    }

    getHistory(chatName) {
        if (!this.conversations.has(chatName)) {
            this.conversations.set(chatName, []);
        }
        return this.conversations.get(chatName);
    }

    addMessage(chatName, role, content) {
        const history = this.getHistory(chatName);
        history.push({ role, content });
        
        // Keep only last N messages
        if (history.length > CONFIG.MAX_CONVERSATION_HISTORY * 2) {
            history.splice(0, 2); // Remove oldest pair (user + assistant)
        }
        
        this.saveConversations();
    }

    async generateResponse(chatName, userMessage) {
        if (!this.openai) {
            // Fallback if no API key
            return this.getFallbackResponse(userMessage);
        }

        try {
            // Add user message to history
            this.addMessage(chatName, 'user', userMessage);
            
            // Get conversation history
            const history = this.getHistory(chatName);
            
            // Build messages for OpenAI
            const messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...history
            ];

            await this.logger.ai(`🤖 Asking AI to respond to: "${userMessage.substring(0, 100)}..."`);

            // Call OpenAI API
            const completion = await this.openai.chat.completions.create({
                model: CONFIG.AI_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            });

            const aiResponse = completion.choices[0].message.content;
            
            // Add AI response to history
            this.addMessage(chatName, 'assistant', aiResponse);
            
            await this.logger.ai(`✅ AI generated response (${aiResponse.length} chars)`);
            
            return aiResponse;

        } catch (error) {
            await this.logger.error(`AI error: ${error.message}`);
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(message) {
        // Simple fallback if AI fails
        const text = message.toLowerCase();
        
        if (text.match(/\b(cv|resume|curriculum)\b/i)) {
            return `Thank you for your interest in our CV writing services! 📝

We offer professional CVs starting from ₦5,000.

For personalized assistance, please contact us:
📞 +234 818 002 1007
📧 ceo@amdsolutions007.com
🌐 https://amdsolutions007.com

Our team will respond within minutes!`;
        }
        
        return `Thank you for contacting AMD Solutions! 🎯

I'm currently experiencing technical difficulties with my AI brain, but our team is ready to help!

📞 Call/WhatsApp: +234 818 002 1007
📧 Email: ceo@amdsolutions007.com
🌐 Visit: https://amdsolutions007.com
🔗 LinkTree: https://linktr.ee/amdsolutions007

We specialize in:
✅ CV Writing (₦5k+)
✅ Software Development (₦50k+)
✅ Custom Solutions
✅ Tech Training

Reach out now and let's build something amazing!`;
    }

    clearHistory(chatName) {
        this.conversations.delete(chatName);
        this.saveConversations();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP BOT CLASS
// ═══════════════════════════════════════════════════════════════════════════

class WhatsAppAIBot {
    constructor() {
        this.browser = null;
        this.page = null;
        this.logger = new Logger(CONFIG.LOG_FILE);
        this.ai = new AIConversationManager(CONFIG.OPENAI_API_KEY, this.logger);
        this.processedChats = new Map(); // Track last response time per chat
        this.isRunning = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async start() {
        await this.logger.info('════════════════════════════════════════════════════════════');
        await this.logger.info('🤖 NAIJABIZ PILOT - AI WHATSAPP SECRETARY');
        await this.logger.info('════════════════════════════════════════════════════════════');
        await this.logger.info(`📞 Official: ${CONFIG.OFFICIAL_PHONE}`);
        await this.logger.info(`🌐 Website: ${CONFIG.OFFICIAL_WEBSITE}`);
        await this.logger.info(`🧠 AI Model: ${CONFIG.AI_MODEL}`);
        await this.logger.info(`🔑 API Key: ${CONFIG.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
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
            userDataDir: CONFIG.SESSION_DIR,
        });

        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await this.page.setViewport({ width: 1280, height: 800 });
        
        await this.logger.success('✅ Browser launched successfully');
    }

    async login() {
        await this.logger.info('🔐 Navigating to WhatsApp Web...');
        await this.page.goto(CONFIG.WHATSAPP_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        try {
            await this.page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 10000 });
            await this.logger.success('✅ Already logged in!');
            this.reconnectAttempts = 0;
            return;
        } catch {
            await this.logger.warn('⚠️  Not logged in. Waiting for QR code scan...');
            await this.logger.info('📱 Please scan the QR code with your phone');
            
            await this.page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 120000 });
            await this.logger.success('✅ Login successful!');
            this.reconnectAttempts = 0;
        }
    }

    async monitorMessages() {
        await this.logger.success('✅ AI BOT STARTED - Monitoring for messages...');
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
            const unreadChats = await this.page.$$('span[aria-label*="unread message"]');
            
            if (unreadChats.length === 0) {
                return;
            }

            await this.logger.info(`📬 Found ${unreadChats.length} unread chat(s)`);

            for (const badge of unreadChats) {
                try {
                    const chatElement = await badge.evaluateHandle(el => {
                        return el.closest('div[data-testid="cell-frame-container"]') ||
                               el.closest('div[tabindex="-1"]') ||
                               el.closest('div');
                    });

                    if (!chatElement) continue;

                    await chatElement.click();
                    await this.sleep(2000);

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
            const chatName = await this.page.$eval('header span[dir="auto"]', el => el.textContent).catch(() => 'Unknown');
            
            if (this.isRecentlyProcessed(chatName)) {
                await this.logger.warn(`⏭️  Skipping ${chatName} - recently responded (spam protection)`);
                return;
            }

            await this.logger.info(`💬 Processing chat: ${chatName}`);

            const lastMessage = await this.getLastMessage();
            if (!lastMessage) {
                await this.logger.warn('⚠️  Could not read message');
                return;
            }

            await this.logger.info(`📖 Message: "${lastMessage.substring(0, 100)}..."`);

            // 🧠 AI MAGIC HAPPENS HERE!
            const aiResponse = await this.ai.generateResponse(chatName, lastMessage);

            // Human-like delay before responding
            const delay = CONFIG.RESPONSE_DELAY_MIN + Math.random() * (CONFIG.RESPONSE_DELAY_MAX - CONFIG.RESPONSE_DELAY_MIN);
            await this.logger.info(`⏳ Waiting ${Math.round(delay / 1000)}s before responding...`);
            await this.sleep(delay);

            // Send AI-generated response
            await this.sendMessage(aiResponse);
            await this.logger.success(`✅ Sent AI response to ${chatName}`);

            // Mark as processed
            this.processedChats.set(chatName, Date.now());

        } catch (error) {
            await this.logger.error(`Error processing chat: ${error.message}`);
        }
    }

    async getLastMessage() {
        try {
            let messages = await this.page.$$('div[class*="message-in"]');
            
            if (messages.length === 0) {
                messages = await this.page.$$('div[data-testid="msg-container"]');
            }
            
            if (messages.length === 0) {
                messages = await this.page.$$('div[role="row"]');
            }
            
            if (messages.length === 0) return null;

            const lastMsg = messages[messages.length - 1];
            
            let text = await lastMsg.$eval('span.selectable-text', el => el.textContent).catch(() => '');
            
            if (!text) {
                text = await lastMsg.$eval('span[dir="ltr"]', el => el.textContent).catch(() => '');
            }
            
            if (!text) {
                text = await lastMsg.$eval('div[class*="copyable-text"]', el => el.textContent).catch(() => '');
            }
            
            if (!text) {
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
            const inputSelector = 'div[contenteditable="true"][data-tab="10"]';
            await this.page.waitForSelector(inputSelector, { timeout: 5000 });

            await this.page.click(inputSelector);
            await this.page.type(inputSelector, text, { delay: 50 });

            await this.sleep(1000);

            await this.page.keyboard.press('Enter');
            await this.sleep(2000);

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
    const bot = new WhatsAppAIBot();

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

    await bot.start();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = WhatsAppAIBot;
