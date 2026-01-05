/**
 * WHATSAPP CHANNEL POSTER - AUTOMATED
 * Purpose: Post content to WhatsApp Channel (no manual work!)
 * Use: After channel is created, automate daily posting
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
    WHATSAPP_URL: 'https://web.whatsapp.com',
    USER_DATA_DIR: path.join(__dirname, '.whatsapp-session'),
    CHANNEL_NAME: 'AMD Solutions - Premium AI Lab',  // Your channel name
    HEADLESS: false
};

// Logger
class Logger {
    log(emoji, message) {
        console.log(`${new Date().toLocaleTimeString()} ${emoji} ${message}`);
    }
    
    success(message) { this.log('✅', message); }
    info(message) { this.log('ℹ️', message); }
    warn(message) { this.log('⚠️', message); }
    error(message) { this.log('❌', message); }
}

// WhatsApp Channel Poster
class WhatsAppChannelPoster {
    constructor() {
        this.browser = null;
        this.page = null;
        this.logger = new Logger();
    }

    async init() {
        try {
            this.logger.info('Launching WhatsApp Web...');
            
            this.browser = await puppeteer.launch({
                headless: CONFIG.HEADLESS,
                userDataDir: CONFIG.USER_DATA_DIR,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1280,800'
                ]
            });

            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1280, height: 800 });
            
            await this.page.goto(CONFIG.WHATSAPP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
            this.logger.success('WhatsApp Web loaded!');
            
            // Check authentication
            const qrCode = await this.page.$('canvas[aria-label="Scan this QR code to link a device!"]');
            if (qrCode) {
                this.logger.warn('⚠️  QR CODE DETECTED! Scan to authenticate...');
                await this.page.waitForFunction(
                    () => !document.querySelector('canvas[aria-label="Scan this QR code to link a device!"]'),
                    { timeout: 120000 }
                );
                this.logger.success('✅ Authenticated successfully!');
                await this.sleep(3000);
            } else {
                this.logger.success('Already authenticated!');
            }

            await this.page.waitForFunction(
                () => document.querySelector('[data-testid="chat"]') || 
                      document.querySelector('#side'),
                { timeout: 30000 }
            );
            this.logger.success('WhatsApp interface ready!');
            
            return true;

        } catch (error) {
            this.logger.error(`Initialization failed: ${error.message}`);
            throw error;
        }
    }

    async postToChannel(message, imagePath = null) {
        try {
            this.logger.info('📢 Posting to WhatsApp Channel...');

            // Step 1: Navigate to Status/Updates section
            await this.sleep(2000);
            this.logger.info('Step 1: Opening Updates section...');
            
            const statusTab = await this.clickFirst([
                '[data-icon="status-v3"]',
                '[data-icon="status"]',
                '[data-testid="status-v3"]',
                '[aria-label*="Status"]'
            ]);

            if (!statusTab) {
                throw new Error('❌ Updates section not found');
            }

            this.logger.success('✅ Opened Updates section');
            await this.sleep(2000);

            // Step 2: Find and click your channel
            this.logger.info(`Step 2: Finding channel "${CONFIG.CHANNEL_NAME}"...`);
            
            const channelFound = await this.page.evaluate((channelName) => {
                const allElements = Array.from(document.querySelectorAll('div, span'));
                for (const el of allElements) {
                    const text = el.textContent || '';
                    if (text.includes(channelName)) {
                        // Find clickable parent
                        let parent = el;
                        while (parent && parent.tagName !== 'BODY') {
                            if (parent.onclick || parent.getAttribute('role') === 'button') {
                                parent.click();
                                return true;
                            }
                            parent = parent.parentElement;
                        }
                        el.click();
                        return true;
                    }
                }
                return false;
            }, CONFIG.CHANNEL_NAME);

            if (!channelFound) {
                this.logger.warn('⚠️  Channel not found by name, trying alternative...');
                
                // Try finding channel icon/element
                const channelElement = await this.clickFirst([
                    '[data-icon="channel"]',
                    '[aria-label*="Channel"]',
                    'div[role="button"][aria-label*="channel"]'
                ]);

                if (!channelElement) {
                    throw new Error(`❌ Channel "${CONFIG.CHANNEL_NAME}" not found. Make sure it exists!`);
                }
            }

            this.logger.success('✅ Opened channel');
            await this.sleep(2000);

            // Step 3: Click on text input to compose message
            this.logger.info('Step 3: Opening message composer...');
            
            const textInput = await this.focusFirst([
                'div[contenteditable="true"]',
                'div[role="textbox"]',
                'textarea'
            ]);

            if (!textInput) {
                throw new Error('❌ Message composer not found');
            }

            this.logger.success('✅ Focused message composer');
            await this.sleep(500);

            // Step 4: Type message
            this.logger.info('Step 4: Typing message...');
            await this.page.keyboard.type(message, { delay: 30 });
            this.logger.success(`✅ Typed message (${message.length} chars)`);
            await this.sleep(1000);

            // Step 5: Send message
            this.logger.info('Step 5: Sending message...');
            
            const sendButton = await this.clickFirst([
                'span[data-icon="send"]',
                'button[aria-label="Send"]',
                '[data-testid="send"]'
            ]);

            if (!sendButton) {
                this.logger.warn('⚠️  Send button not found, trying Enter key...');
                await this.page.keyboard.press('Enter');
            }

            await this.sleep(2000);
            this.logger.success('🎉 Message posted to channel!');

            return true;

        } catch (error) {
            this.logger.error(`Channel posting failed: ${error.message}`);
            
            // Screenshot for debugging
            try {
                const screenshotPath = path.join(__dirname, `channel_post_error_${Date.now()}.png`);
                await this.page.screenshot({ path: screenshotPath, fullPage: true });
                this.logger.info(`📸 Screenshot saved: ${screenshotPath}`);
            } catch (e) {}
            
            throw error;
        }
    }

    async clickFirst(selectors) {
        for (const selector of selectors) {
            try {
                const element = await this.page.$(selector);
                if (element) {
                    await element.click();
                    return selector;
                }
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    async focusFirst(selectors) {
        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 3000 });
                await this.page.focus(selector);
                return selector;
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Main execution
(async () => {
    if (process.argv.length < 3) {
        console.log('\n📢 WHATSAPP CHANNEL POSTER\n');
        console.log('Usage: node whatsapp_channel_poster.js "Your message here"\n');
        console.log('Example:');
        console.log('  node whatsapp_channel_poster.js "🚀 New AI tool launched! Check it out..."\n');
        process.exit(0);
    }

    const message = process.argv.slice(2).join(' ');
    
    console.log('\n🚀 WHATSAPP CHANNEL POSTER\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const poster = new WhatsAppChannelPoster();
    
    try {
        await poster.init();
        await poster.postToChannel(message);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✅ SUCCESS! Message posted to channel!\n');
        console.log('📱 Check WhatsApp Channel to confirm\n');
        console.log('⏳ Keeping browser open for 10 seconds...\n');
        
        await poster.sleep(10000);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    } finally {
        await poster.close();
    }
})();
