const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('🤖 AMD SOLUTIONS WHATSAPP SECRETARY BOT');
console.log('============================================================\n');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'amd-solutions-007',
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Auto-response templates
const RESPONSES = {
    greeting: `👋 Hello! Thanks for contacting AMD Solutions!

I'm your virtual assistant. How can we help you today?

📋 Our Services:
1️⃣ CV Analysis & ATS Optimization
2️⃣ Source Code Projects (Final Year Projects)
3️⃣ Software Development
4️⃣ Tech Consulting

💬 Reply with the number or tell me what you need!

📞 WhatsApp: +234 818 002 1007
🔗 https://linktr.ee/amdsolutions007`,

    cv_service: `📄 CV ANALYSIS & ATS OPTIMIZATION

✅ Professional CV Review
✅ ATS Compatibility Check
✅ Format Optimization
✅ Content Enhancement

💰 Pricing:
- Basic Review: ₦5,000
- Standard Package: ₦10,000
- Premium Package: ₦15,000

⏰ Delivery: 24 hours
📞 WhatsApp: +234 818 002 1007
🔗 https://linktr.ee/amdsolutions007

Would you like to proceed? Send "YES CV" to get started!`,

    source_code: `💻 SOURCE CODE PROJECTS

We have 10+ ready-made projects:
✅ Facial Recognition System
✅ AI Voice Assistant
✅ Crypto Price Tracker
✅ Property Intelligence Platform
✅ E-commerce Solutions
✅ And more...

💰 Price Range: ₦15,000 - ₦50,000
📦 Includes:
- Full source code
- Documentation
- Installation support

📞 WhatsApp: +234 818 002 1007
🔗 https://linktr.ee/amdsolutions007

Reply "CATALOG" to see full list!`,

    custom_dev: `🚀 CUSTOM SOFTWARE DEVELOPMENT

We build:
✅ Web Applications
✅ Mobile Apps
✅ AI/ML Solutions
✅ Automation Systems
✅ API Integrations

💼 Enterprise-grade quality
⏰ Fast turnaround
💰 Competitive pricing

📞 WhatsApp: +234 818 002 1007
🔗 https://linktr.ee/amdsolutions007

Let's discuss your project! What do you need?`,

    pricing: `💰 PRICING OVERVIEW

📄 CV Services: ₦5K - ₦15K
💻 Source Code: ₦15K - ₦50K
🚀 Custom Development: Quote-based
📚 Tech Consulting: ₦10K/hour

📞 WhatsApp: +234 818 002 1007
🔗 https://linktr.ee/amdsolutions007

What service are you interested in?`,

    away: `Thank you for your message! 

Our team will respond within 1-2 hours during business hours (9 AM - 6 PM WAT).

📞 WhatsApp: +234 818 002 1007
🔗 https://linktr.ee/amdsolutions007

For urgent matters, please send "URGENT" and we'll prioritize your request.`
};

// Keyword detection
function detectIntent(message) {
    const msg = message.toLowerCase();
    
    // CV Service keywords
    if (msg.includes('cv') || msg.includes('resume') || msg.includes('job') || msg.includes('ats')) {
        return 'cv_service';
    }
    
    // Source code keywords
    if (msg.includes('source') || msg.includes('code') || msg.includes('project') || 
        msg.includes('final year') || msg.includes('fyp') || msg.includes('catalog')) {
        return 'source_code';
    }
    
    // Custom development keywords
    if (msg.includes('develop') || msg.includes('build') || msg.includes('website') || 
        msg.includes('app') || msg.includes('software') || msg.includes('custom')) {
        return 'custom_dev';
    }
    
    // Pricing keywords
    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('pricing')) {
        return 'pricing';
    }
    
    // Greeting keywords
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || 
        msg.includes('good morning') || msg.includes('good afternoon')) {
        return 'greeting';
    }
    
    // Default to greeting for new contacts
    return 'greeting';
}

// Track responded messages to avoid duplicates
const respondedMessages = new Set();
const SESSION_FILE = path.join(__dirname, 'secretary_session.json');

// Load previous session
function loadSession() {
    try {
        if (fs.existsSync(SESSION_FILE)) {
            const data = fs.readFileSync(SESSION_FILE, 'utf8');
            const session = JSON.parse(data);
            session.messages.forEach(id => respondedMessages.add(id));
            console.log(`✅ Loaded ${respondedMessages.size} previous messages\n`);
        }
    } catch (error) {
        console.log('⚠️  No previous session found, starting fresh\n');
    }
}

// Save session
function saveSession() {
    try {
        const session = {
            messages: Array.from(respondedMessages),
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
    } catch (error) {
        console.error('Error saving session:', error.message);
    }
}

client.on('qr', (qr) => {
    console.log('❌ Session expired! Please run whatsapp_auth.js first to authenticate\n');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Secretary Bot is LIVE!\n');
    console.log('🤖 Status: Monitoring incoming messages...');
    console.log('📱 Auto-responding to all inquiries');
    console.log('💬 Press Ctrl+C to stop\n');
    console.log('============================================================\n');
    
    loadSession();
});

client.on('message', async (message) => {
    try {
        // Skip if already responded to this message
        if (respondedMessages.has(message.id._serialized)) {
            return;
        }
        
        // Skip group messages - check from ID format
        if (message.from.includes('@g.us')) {
            return;
        }
        
        // Skip broadcast messages
        if (message.from.includes('@broadcast')) {
            return;
        }
        
        // Skip status updates
        if (message.from.includes('status@broadcast')) {
            return;
        }
        
        const messageText = message.body;
        const fromNumber = message.from;
        
        console.log(`📨 New message from: ${fromNumber}`);
        console.log(`💬 Message: "${messageText}"\n`);
        
        // Detect intent and get appropriate response
        const intent = detectIntent(messageText);
        const response = RESPONSES[intent];
        
        console.log(`🤖 Detected intent: ${intent}`);
        console.log(`📤 Sending auto-response...\n`);
        
        // Send the response
        await message.reply(response);
        
        // Mark as responded
        respondedMessages.add(message.id._serialized);
        saveSession();
        
        console.log(`✅ Response sent successfully!`);
        console.log(`⏰ ${new Date().toLocaleString()}\n`);
        console.log('------------------------------------------------------------\n');
        
    } catch (error) {
        console.error('❌ Error processing message:', error.message);
        // Continue running even if one message fails
    }
});

client.on('disconnected', (reason) => {
    console.log('⚠️  Bot disconnected:', reason);
    console.log('🔄 Attempting to reconnect...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n============================================================');
    console.log('🛑 Shutting down WhatsApp Secretary Bot...');
    console.log('💾 Saving session data...');
    saveSession();
    console.log('✅ Session saved successfully!');
    console.log('👋 Goodbye!\n');
    process.exit(0);
});

console.log('⏳ Initializing WhatsApp Secretary Bot...\n');
client.initialize();
