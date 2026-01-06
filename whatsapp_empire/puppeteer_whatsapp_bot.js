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

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { SYSTEM_PROMPT: LEGACY_BRAIN_PROMPT } = require('./ai_knowledge_base_v2');

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
    
    // Auth/session persistence (whatsapp-web.js)
    AUTH_DIR: path.join(__dirname, '.wwebjs_auth'),
    LOG_FILE: path.join(__dirname, 'whatsapp_bot.log'),
    
    // Browser settings
    HEADLESS: true,
    WHATSAPP_URL: 'https://web.whatsapp.com',
};

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function loadOptionalTextFile(relativePath, maxChars) {
    try {
        const absolutePath = path.join(__dirname, relativePath);
        const content = fsSync.readFileSync(absolutePath, 'utf8');
        const trimmed = String(content || '').trim();
        if (!trimmed) return '';
        return maxChars ? trimmed.slice(0, maxChars) : trimmed;
    } catch {
        return '';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const RESPONSES = {
    cv_service: `🎯 *CV Writing Service*

✅ ATS-optimized CV
✅ Cover letter add-on
✅ LinkedIn optimization

Reply "PRICING" for fees or "MENU" for services.`,

    source_code: `💻 *Source Code / Systems*

We have ready-to-deploy projects (e-commerce, booking, school systems, POS, real estate).

Reply "PRICING" for price ranges or tell me what you need.`,

    pricing: `💰 *Quick Pricing*

• CV: ₦5k–₦15k
• Source code projects: from ₦40k+
• Custom builds: from ₦100k+

Tell me what you need and I’ll quote accurately.`,

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

    contact: `📞 *Contact AMD Solutions 007*
Phone: ${CONFIG.OFFICIAL_PHONE}
Email: ${CONFIG.OFFICIAL_EMAIL}
Website: ${CONFIG.OFFICIAL_WEBSITE}
LinkTree: ${CONFIG.LINKTREE}`,

    smart_catchall: `Tell me what you need, and I’ll help.

Type "MENU" to see services.`,
};

function getKeywordIntent(userText) {
    const normalized = String(userText || '').trim().toLowerCase();
    if (!normalized) return null;

    const tokens = normalized.split(/\s+/).filter(Boolean);
    const first = tokens[0];

    const aliases = {
        cv: 'cv_service',
        resume: 'cv_service',
        pricing: 'pricing',
        price: 'pricing',
        menu: 'menu',
        help: 'menu',
        services: 'menu',
        code: 'source_code',
        source: 'source_code',
        custom: 'source_code',
        contact: 'contact',
    };

    // Only treat it as a "keyword command" if it's short.
    if (tokens.length <= 2 && aliases[first]) {
        return aliases[first];
    }

    return null;
}

async function generateAiReply(userText) {
    if (!process.env.OPENAI_API_KEY || !openai) {
        return 'AI smart mode is not configured yet. Type "MENU" to see services.';
    }

    const portfolioKb = loadOptionalTextFile('portfolio_24_kb.txt', 12000);
    const riseTogetherKb = loadOptionalTextFile('risetogether_summary.txt', 6000);

    const systemPrompt =
        "You are the AI Sales Manager for AMD Solutions 007 (Nigeria).\n" +
        "You have deep knowledge of the AMD portfolio, including: Little Drop (Savings discipline), RiseTogether / Rise Up (community growth), and the 24-project portfolio.\n" +
        "Sell aggressively but professionally: clarify needs, recommend a best-fit offer, and propose the next step.\n" +
        "Do NOT send a generic menu unless the user explicitly types MENU.\n" +
        "Do NOT repeat contact info unless asked.\n\n" +
        "=== AMD MASTER BRAIN (Legacy MacBook Knowledge) ===\n" +
        LEGACY_BRAIN_PROMPT +
        (portfolioKb ? "\n\n=== AMD 24-PROJECT PORTFOLIO (Compact) ===\n" + portfolioKb : '') +
        (riseTogetherKb ? "\n\n=== RISETOGETHER NG (Summary) ===\n" + riseTogetherKb : '');

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText },
            ],
            max_tokens: 120,
            temperature: 0.4,
        });

        const text = completion?.choices?.[0]?.message?.content?.trim();
        return text || 'Type "MENU" to see services.';
    } catch (err) {
        console.error('OpenAI Error:', err?.message || err);
        return 'I can help — tell me what you need, or type "MENU".';
    }
}

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
        this.client = null;
        this.logger = new Logger(CONFIG.LOG_FILE);
        this.processedChats = new Map(); // Track last response time per chat
        this.isRunning = false;
    }

    async start() {
        await this.logger.info('════════════════════════════════════════════════════════════');
        await this.logger.info('🤖 AMD SOLUTIONS - WHATSAPP AUTO-RESPONDER');
        await this.logger.info('════════════════════════════════════════════════════════════');
        await this.logger.info(`📞 Official: ${CONFIG.OFFICIAL_PHONE}`);
        await this.logger.info(`🌐 Website: ${CONFIG.OFFICIAL_WEBSITE}`);
        await this.logger.info(`🔗 LinkTree: ${CONFIG.LINKTREE}`);
        await this.logger.info('════════════════════════════════════════════════════════════');

        this.isRunning = true;
        this.setupClient();
        this.client.initialize();
    }

    setupClient() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'amd-solutions-007',
                dataPath: CONFIG.AUTH_DIR,
            }),
            puppeteer: {
                headless: "new",
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            },
        });

        this.client.on('ready', async () => {
            console.log('✅ Client is ready!');
            await this.logger.success('✅ Client is ready');
        });

        this.client.on('authenticated', async () => {
            await this.logger.success('✅ Authenticated');
        });

        this.client.on('auth_failure', async (msg) => {
            await this.logger.error(`❌ Auth failure: ${msg}`);
        });

        this.client.on('disconnected', async (reason) => {
            await this.logger.warn(`🔌 Disconnected: ${reason}`);
        });

        this.client.on('qr', (qr) => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;

            console.log('\n\n=================================================');
            console.log('🔴 ACTION REQUIRED: CLICK THE LINK BELOW TO SCAN 🔴');
            console.log('=================================================');
            console.log(qrUrl);
            console.log('=================================================\n\n');
        });

        this.client.on('message', async (message) => {
            try {
                if (!this.isRunning) return;
                if (!message || !message.body) return;
                if (message.fromMe) return;

                const chatKey = message.from;
                if (this.isRecentlyProcessed(chatKey)) {
                    return;
                }

                const keywordIntent = getKeywordIntent(message.body);
                const response = keywordIntent
                    ? (RESPONSES[keywordIntent] || RESPONSES.menu)
                    : await generateAiReply(message.body);

                // Human-like behavior: seen + typing indicator + realistic pacing.
                const chat = await message.getChat();
                try {
                    await chat.sendSeen();
                } catch {
                    // ignore
                }

                // Time scales with response length but stays within min/max.
                const charCount = String(response || '').length;
                const typingTime = Math.min(
                    CONFIG.RESPONSE_DELAY_MAX,
                    Math.max(CONFIG.RESPONSE_DELAY_MIN, charCount * CONFIG.TYPING_SPEED)
                );
                const jitter = Math.random() * 800;

                try {
                    await chat.sendStateTyping();
                } catch {
                    // ignore
                }

                await this.sleep(typingTime + jitter);

                try {
                    await chat.clearState();
                } catch {
                    // ignore
                }

                await message.reply(response);
                this.processedChats.set(chatKey, Date.now());
            } catch (error) {
                await this.logger.error(`Message handler error: ${error.message}`);
            }
        });
    }

    isRecentlyProcessed(chatName) {
        const lastProcessed = this.processedChats.get(chatName);
        if (!lastProcessed) return false;
        
        const timeSince = Date.now() - lastProcessed;
        return timeSince < CONFIG.SPAM_PROTECTION;
    }

    async stop() {
        this.isRunning = false;
        if (this.client) {
            try {
                await this.client.destroy();
            } catch {
                // ignore
            }
            await this.logger.info('🛑 Client closed');
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
