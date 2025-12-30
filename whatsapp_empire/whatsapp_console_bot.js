/**
 * AMD SOLUTIONS - WHATSAPP WEB CONSOLE BOT
 * ==========================================
 * Paste this code into Chrome DevTools Console (Cmd+Option+I → Console tab)
 * while logged into WhatsApp Web at https://web.whatsapp.com
 * 
 * OPERATION: TWIN-TURBO PHASE 1 (Browser Injection)
 * Official: +234 818 002 1007 | https://amdsolutions007.com
 * Date: 30 December 2025
 */

(function() {
    'use strict';
    
    // ==================== CONFIGURATION ====================
    
    const CONFIG = {
        OFFICIAL_PHONE: '+234 818 002 1007',
        OFFICIAL_EMAIL: 'ceo@amdsolutions007.com',
        OFFICIAL_WEBSITE: 'https://amdsolutions007.com',
        OFFICIAL_LINKTREE: 'https://linktr.ee/amdsolutions007',
        CHECK_INTERVAL: 10000, // Check every 10 seconds
        RESPONSE_DELAY_MIN: 5000, // 5 seconds minimum
        RESPONSE_DELAY_MAX: 15000, // 15 seconds maximum
    };
    
    // ==================== RESPONSE TEMPLATES ====================
    
    const RESPONSES = {
        cv_service: `📄 *AMD RESUME AI - PROFESSIONAL CV ANALYSIS*

We transform ordinary CVs into job-winning resumes!

*Our Services:*
✅ Basic Review & Feedback: ₦5,000
✅ Premium Rewrite + ATS Optimization: ₦15,000

*FREE PREVIEW:* Send your CV now for a complimentary analysis!

📞 WhatsApp: ${CONFIG.OFFICIAL_PHONE}
� Portfolio: ${CONFIG.OFFICIAL_LINKTREE}

_Reply "YES" to get started!_ 🚀`,

        source_code: `💻 *AMD CODE VAULT - READY-MADE SOLUTIONS*

Why build from scratch? Get production-ready code NOW!

*Available Projects:*
🌐 Landing Pages: ₦15,000
💼 Business Websites: ₦30,000
🛒 E-commerce Sites: ₦50,000
📱 Mobile App Templates: ₦40,000

*BONUS:* Free 30-day support + deployment guide!

📞 WhatsApp: ${CONFIG.OFFICIAL_PHONE}
🔗 Full Catalog: ${CONFIG.OFFICIAL_LINKTREE}

_Type the project you need!_ 💡`,

        pricing: `💰 *AMD SOLUTIONS - PRICING GUIDE*

*Professional Services:*
📄 CV Analysis (Basic): ₦5,000
📝 CV Rewrite (Premium): ₦15,000

*Ready-Made Projects:*
🌐 Landing Pages: ₦15,000
💼 Business Sites: ₦30,000
🛒 E-commerce: ₦50,000

*Custom Development:*
💡 Quote based on requirements
⚡ Flexible payment plans available

📞 WhatsApp: ${CONFIG.OFFICIAL_PHONE}
🔗 Full Details: ${CONFIG.OFFICIAL_LINKTREE}

_What service interests you?_ 🎯`,

        menu: `🌟 *AMD SOLUTIONS - SERVICES MENU*

*Quick Commands:*
📄 Type *"CV"* - Resume Services
💻 Type *"CODE"* - Source Code Projects  
💰 Type *"PRICE"* - View All Pricing

*Why Choose Us?*
✅ 5+ Years Experience
✅ 100+ Satisfied Clients
✅ Same-Day Delivery (Most Projects)

📞 WhatsApp: ${CONFIG.OFFICIAL_PHONE}
🔗 Portfolio: ${CONFIG.OFFICIAL_LINKTREE}

_How can we help you today?_ 🚀`,

        smart_catchall: `👋 *Thank you for reaching out to AMD SOLUTIONS!*

🌍 *We build custom AI & Tech solutions for ALL businesses* - from mechanics to marketplaces, restaurants to real estate!

*What We Do:*
🎯 Custom Web & Mobile Apps
🤖 Business Automation
🔌 AI Integration
☁️ Cloud Solutions
📊 Data Analytics

*Your message has been noted.* A Senior Engineer will review your request and respond with a detailed proposal within 24 hours.

💡 *Or Browse Our Ready-Made Solutions:*
• Type *"CV"* - Resume Services
• Type *"CODE"* - Website Templates
• Type *"MENU"* - Full Service List

📞 WhatsApp: ${CONFIG.OFFICIAL_PHONE}
🔗 Portfolio: ${CONFIG.OFFICIAL_LINKTREE}

_We're here to help bring your vision to life!_ 🚀`
    };
    
    // ==================== STATE MANAGEMENT ====================
    
    let processedMessages = new Set();
    let messageCount = 0;
    let startTime = Date.now();
    let isProcessing = false;
    let intervalId = null;
    
    // ==================== UTILITY FUNCTIONS ====================
    
    function log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const styles = {
            info: 'color: #3498db; font-weight: bold',
            success: 'color: #2ecc71; font-weight: bold',
            warning: 'color: #f39c12; font-weight: bold',
            error: 'color: #e74c3c; font-weight: bold'
        };
        console.log(`%c[${timestamp}] AMD BOT: ${message}`, styles[type] || styles.info);
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function randomDelay() {
        const min = CONFIG.RESPONSE_DELAY_MIN;
        const max = CONFIG.RESPONSE_DELAY_MAX;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function detectIntent(message) {
        const text = message.toLowerCase();
        
        // CV/Resume - HIGH PRIORITY
        if (/\b(cv|resume|curriculum|vitae)\b/i.test(text)) {
            return 'cv_service';
        }
        // Source code - HIGH PRIORITY
        else if (/\b(source|code|project|website|template|site)\b/i.test(text)) {
            return 'source_code';
        }
        // Pricing - HIGH PRIORITY
        else if (/\b(price|cost|how much|pricing|payment|charge|fee)\b/i.test(text)) {
            return 'pricing';
        }
        // Menu/Help - MEDIUM PRIORITY
        else if (/\b(help|menu|options|service|what do you|what can)\b/i.test(text)) {
            return 'menu';
        }
        // SMART CATCH-ALL - For everything else (custom inquiries)
        // This ensures the bot NEVER stays silent
        else {
            return 'smart_catchall';
        }
    }
    
    // ==================== WHATSAPP DOM FUNCTIONS ====================
    
    function getUnreadChats() {
        // Multiple selectors to find unread indicators
        const selectors = [
            'span[data-icon="status-unread"]',
            'span[aria-label*="unread"]',
            'div._ak72._ak73._ak7p span[data-icon="status-unread"]'
        ];
        
        let unreadChats = [];
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Navigate up to the chat container
                const chatElement = el.closest('div[role="listitem"]');
                if (chatElement && !unreadChats.includes(chatElement)) {
                    unreadChats.push(chatElement);
                }
            });
        }
        
        return unreadChats;
    }
    
    function getChatName(chatElement) {
        try {
            const nameElement = chatElement.querySelector('span[title]');
            return nameElement ? nameElement.getAttribute('title') : 'Unknown';
        } catch (e) {
            return 'Unknown';
        }
    }
    
    function openChat(chatElement) {
        try {
            chatElement.click();
            return true;
        } catch (e) {
            log(`Error opening chat: ${e.message}`, 'error');
            return false;
        }
    }
    
    function getLastMessage() {
        try {
            // Multiple selectors for message bubbles
            const selectors = [
                'div.message-in span.selectable-text.copyable-text',
                'div._akbu span._ao3e.selectable-text.copyable-text',
                'span[dir="ltr"].selectable-text.copyable-text'
            ];
            
            let messages = [];
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    messages = Array.from(elements);
                    break;
                }
            }
            
            if (messages.length > 0) {
                return messages[messages.length - 1].textContent;
            }
            return null;
        } catch (e) {
            log(`Error reading message: ${e.message}`, 'error');
            return null;
        }
    }
    
    function sendMessage(text) {
        try {
            // Find message input box
            const inputSelectors = [
                'div[contenteditable="true"][data-tab="10"]',
                'div[role="textbox"][contenteditable="true"]',
                'footer div[contenteditable="true"]'
            ];
            
            let inputBox = null;
            for (const selector of inputSelectors) {
                inputBox = document.querySelector(selector);
                if (inputBox) break;
            }
            
            if (!inputBox) {
                log('Could not find message input box', 'error');
                return false;
            }
            
            // Focus the input
            inputBox.focus();
            
            // Insert text
            document.execCommand('insertText', false, text);
            
            // Find and click send button
            const sendButton = document.querySelector('button[aria-label*="Send"]') || 
                              document.querySelector('span[data-icon="send"]')?.parentElement;
            
            if (sendButton) {
                sendButton.click();
                return true;
            } else {
                // Fallback: simulate Enter key
                const event = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    bubbles: true
                });
                inputBox.dispatchEvent(event);
                return true;
            }
        } catch (e) {
            log(`Error sending message: ${e.message}`, 'error');
            return false;
        }
    }
    
    // ==================== MAIN BOT LOGIC ====================
    
    async function processChat(chatElement) {
        try {
            const chatName = getChatName(chatElement);
            log(`Opening chat: ${chatName}`, 'info');
            
            // Open the chat
            if (!openChat(chatElement)) {
                return false;
            }
            
            // Wait for chat to load
            await sleep(2000);
            
            // Read last message
            const message = getLastMessage();
            if (!message) {
                log('No message found in chat', 'warning');
                return false;
            }
            
            // SPAM PROTECTION: Create unique ID with timestamp
            const timestamp = Date.now();
            const messageId = `${chatName}:${message.substring(0, 50)}:${timestamp}`;
            
            // Check if we've seen this EXACT message recently (within last 60 seconds)
            const recentMessageId = `${chatName}:${message.substring(0, 50)}`;
            let isDuplicate = false;
            for (const processed of processedMessages) {
                if (processed.startsWith(recentMessageId)) {
                    const processedTime = parseInt(processed.split(':').pop());
                    if (timestamp - processedTime < 60000) { // 60 seconds
                        isDuplicate = true;
                        break;
                    }
                }
            }
            
            if (isDuplicate) {
                log('⏭️ Already processed this message recently (spam protection)', 'warning');
                return false;
            }
            
            log(`📥 Message: "${message.substring(0, 70)}..."`, 'info');
            
            // Detect intent
            const intent = detectIntent(message);
            log(`🎯 Intent detected: ${intent}`, 'success');
            
            // Get response
            const response = RESPONSES[intent];
            
            // Human-like delay
            const delay = randomDelay();
            log(`⏳ Waiting ${(delay/1000).toFixed(1)}s before responding...`, 'info');
            await sleep(delay);
            
            // Send response
            if (sendMessage(response)) {
                log(`✅ Sent ${intent} response to ${chatName}`, 'success');
                processedMessages.add(messageId);
                messageCount++;
                
                // Limit memory (keep last 500 messages)
                if (processedMessages.size > 500) {
                    const arr = Array.from(processedMessages);
                    processedMessages = new Set(arr.slice(-500));
                }
                
                return true;
            }
            
            return false;
        } catch (e) {
            log(`Error processing chat: ${e.message}`, 'error');
            return false;
        }
    }
    
    async function checkForMessages() {
        if (isProcessing) {
            log('Still processing previous messages...', 'warning');
            return;
        }
        
        isProcessing = true;
        
        try {
            const unreadChats = getUnreadChats();
            
            if (unreadChats.length > 0) {
                log(`📬 Found ${unreadChats.length} unread chat(s)`, 'success');
                
                for (const chatElement of unreadChats) {
                    await processChat(chatElement);
                    
                    // Delay between multiple chats
                    if (unreadChats.length > 1) {
                        await sleep(Math.random() * 4000 + 3000); // 3-7 seconds
                    }
                }
            }
        } catch (e) {
            log(`Error in check loop: ${e.message}`, 'error');
        } finally {
            isProcessing = false;
        }
    }
    
    // ==================== BOT CONTROLS ====================
    
    function startBot() {
        if (intervalId) {
            log('Bot is already running!', 'warning');
            return;
        }
        
        console.clear();
        log('═'.repeat(60), 'info');
        log('🤖 AMD SOLUTIONS - WHATSAPP AUTO-RESPONDER', 'success');
        log('═'.repeat(60), 'info');
        log(`📞 Official: ${CONFIG.OFFICIAL_PHONE}`, 'info');
        log(`🌐 Website: ${CONFIG.OFFICIAL_WEBSITE}`, 'info');
        log(`🔗 LinkTree: ${CONFIG.OFFICIAL_LINKTREE}`, 'info');
        log('═'.repeat(60), 'info');
        log(`⏱️ Check interval: ${CONFIG.CHECK_INTERVAL/1000}s`, 'info');
        log(`🛡️ Response delay: ${CONFIG.RESPONSE_DELAY_MIN/1000}-${CONFIG.RESPONSE_DELAY_MAX/1000}s`, 'info');
        log('═'.repeat(60), 'info');
        log('✅ BOT STARTED - Monitoring for messages...', 'success');
        log('ℹ️  Type stopBot() to stop the bot', 'info');
        log('ℹ️  Type botStats() to see statistics', 'info');
        log('═'.repeat(60), 'info');
        
        // Start checking
        intervalId = setInterval(checkForMessages, CONFIG.CHECK_INTERVAL);
        
        // Also check immediately
        setTimeout(checkForMessages, 2000);
    }
    
    function stopBot() {
        if (!intervalId) {
            log('Bot is not running!', 'warning');
            return;
        }
        
        clearInterval(intervalId);
        intervalId = null;
        isProcessing = false;
        
        log('═'.repeat(60), 'info');
        log('🛑 BOT STOPPED', 'warning');
        log(`📊 Total messages sent: ${messageCount}`, 'info');
        const uptime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        log(`⏱️ Uptime: ${uptime} minutes`, 'info');
        log('═'.repeat(60), 'info');
    }
    
    function botStats() {
        log('═'.repeat(60), 'info');
        log('📊 BOT STATISTICS', 'success');
        log('═'.repeat(60), 'info');
        log(`Status: ${intervalId ? '🟢 RUNNING' : '🔴 STOPPED'}`, 'info');
        log(`Messages sent: ${messageCount}`, 'info');
        log(`Messages tracked: ${processedMessages.size}`, 'info');
        const uptime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        log(`Uptime: ${uptime} minutes`, 'info');
        log(`Check interval: ${CONFIG.CHECK_INTERVAL/1000}s`, 'info');
        log('═'.repeat(60), 'info');
    }
    
    // ==================== EXPOSE GLOBAL FUNCTIONS ====================
    
    window.startBot = startBot;
    window.stopBot = stopBot;
    window.botStats = botStats;
    
    // ==================== AUTO-START ====================
    
    log('✅ AMD WhatsApp Bot loaded successfully!', 'success');
    log('📝 Type startBot() to begin monitoring', 'info');
    log('📝 Type stopBot() to stop the bot', 'info');
    log('📝 Type botStats() to see statistics', 'info');
    
    // Auto-start after 2 seconds
    setTimeout(() => {
        log('🚀 Auto-starting bot in 3 seconds...', 'success');
        setTimeout(startBot, 3000);
    }, 2000);
    
})();
