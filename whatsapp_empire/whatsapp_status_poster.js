/**
 * WHATSAPP STATUS POSTER
 * Purpose: Post AI-generated content to WhatsApp Status
 * Features: DALL-E 3 images + GPT-4 captions + Status posting
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
    WHATSAPP_URL: 'https://web.whatsapp.com',
    USER_DATA_DIR: path.join(__dirname, '.whatsapp-session'),
    STATUS_MESSAGE: `🚀 After 3 years of building, RiseTogether NG is LIVE!

999 Nigerian creatives backing 1 spotlight daily. Professional workspace for collaboration. Premium AI automation tools.

Want in? Reply "RISE" to +234 818 002 1007

#RiseUpNG #NigerianTech #AIAutomation 🇳🇬`,
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

// WhatsApp Status Bot
class WhatsAppStatusBot {
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
            
            // Navigate to WhatsApp Web
            await this.page.goto(CONFIG.WHATSAPP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
            
            this.logger.success('WhatsApp Web loaded!');
            
            // Check if QR code is present
            const qrCode = await this.page.$('canvas[aria-label="Scan this QR code to link a device!"]');
            if (qrCode) {
                this.logger.warn('⚠️  QR CODE DETECTED!');
                this.logger.warn('📱 Scan the QR code with your WhatsApp mobile app');
                this.logger.warn('⏳ Waiting for authentication...');
                
                // Wait for authentication (QR disappears)
                await this.page.waitForFunction(
                    () => !document.querySelector('canvas[aria-label="Scan this QR code to link a device!"]'),
                    { timeout: 120000 }
                );
                
                this.logger.success('✅ Authenticated successfully!');
                await this.sleep(3000);
            } else {
                this.logger.success('Already authenticated!');
            }

            // Wait for main interface (any of these selectors)
            try {
                await this.page.waitForFunction(
                    () => {
                        return document.querySelector('[data-testid="chat"]') ||
                               document.querySelector('div[role="textbox"]') ||
                               document.querySelector('[data-icon="status"]') ||
                               document.querySelector('#side');
                    },
                    { timeout: 30000 }
                );
                this.logger.success('WhatsApp interface ready!');
            } catch (e) {
                this.logger.warn('Interface check failed, continuing anyway...');
            }
            
            return true;

        } catch (error) {
            this.logger.error(`Initialization failed: ${error.message}`);
            throw error;
        }
    }

    async postStatus(message) {
        try {
            this.logger.info('📢 Posting WhatsApp Status...');

            // Step 1: Click Status tab - try multiple approaches
            await this.sleep(2000);
            
            // Try clicking by data-icon first (most reliable)
            let statusTab = null;
            const selectors = [
                '[data-icon="status-v3"]',
                '[data-icon="status"]',
                '[data-testid="status-v3"]',
                'span[data-testid="status-v3"]',
                'a[href*="/status"]',
                '[aria-label*="Status"]',
                'span[title="Status"]'
            ];
            
            for (const selector of selectors) {
                try {
                    this.logger.info(`Trying selector: ${selector}`);
                    const element = await this.page.$(selector);
                    if (element) {
                        await element.click();
                        statusTab = selector;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!statusTab) {
                // List all available elements for debugging
                const availableElements = await this.page.evaluate(() => {
                    return Array.from(document.querySelectorAll('[data-icon], [data-testid], [aria-label]'))
                        .slice(0, 20)
                        .map(el => ({
                            tag: el.tagName,
                            dataIcon: el.getAttribute('data-icon'),
                            dataTestId: el.getAttribute('data-testid'),
                            ariaLabel: el.getAttribute('aria-label')
                        }));
                });
                this.logger.warn('Available elements:', JSON.stringify(availableElements, null, 2));
                throw new Error('❌ Status tab not found - check screenshot');
            }

            this.logger.info('✅ Opened Status tab');
            await this.sleep(3000);

            // Step 2: Click "Add Status" button or "My Status"
            let addButton = null;
            const addButtonSelectors = [
                'div[data-testid="my-status"]',  // My Status circle
                'div[aria-label*="My status"]',
                'span[data-testid="status-v3-compose"]',
                'div[aria-label="New status update"]',
                'button[aria-label="My status"]',
                'div[data-testid="status-expanding-compose-box-input"]',
                '[data-icon="plus"]'  // Plus icon
            ];
            
            for (const selector of addButtonSelectors) {
                try {
                    this.logger.info(`Trying add button selector: ${selector}`);
                    const element = await this.page.$(selector);
                    if (element) {
                        await element.click();
                        addButton = selector;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!addButton) {
                // Try clicking the first visible "My Status" circle by coordinates
                try {
                    this.logger.info('Trying to find status circle visually...');
                    const statusCircle = await this.page.evaluate(() => {
                        // Find all canvas or svg elements that might be the status circle
                        const elements = Array.from(document.querySelectorAll('canvas, div[role="button"]'));
                        for (const el of elements) {
                            const rect = el.getBoundingClientRect();
                            if (rect.width > 40 && rect.width < 80 && rect.height > 40 && rect.height < 80) {
                                return {
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + rect.height / 2
                                };
                            }
                        }
                        return null;
                    });
                    
                    if (statusCircle) {
                        this.logger.info(`Clicking at coordinates: ${statusCircle.x}, ${statusCircle.y}`);
                        await this.page.mouse.click(statusCircle.x, statusCircle.y);
                        addButton = 'coordinates';
                    }
                } catch (e) {
                    this.logger.warn(`Visual search failed: ${e.message}`);
                }
            }

            if (!addButton) {
                throw new Error('❌ Add Status button not found - check screenshot');
            }

            this.logger.info('✅ Clicked Add Status button');
            await this.sleep(3000);

            // Step 3: Find and focus text input
            let textInput = null;
            const textInputSelectors = [
                'div[contenteditable="true"]',  // Most common
                'div[data-testid="status-text-input"]',
                'textarea[placeholder*="status"]',
                'div[role="textbox"]',
                'div[data-tab="10"]',  // WhatsApp uses tab index
                'div[aria-label="Type a status"]',
                'div[data-testid="status-expanding-compose-box-input"] div[contenteditable="true"]'
            ];
            
            for (const selector of textInputSelectors) {
                try {
                    this.logger.info(`Trying text input selector: ${selector}`);
                    await this.page.waitForSelector(selector, { timeout: 3000 });
                    await this.page.focus(selector);
                    textInput = selector;
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (!textInput) {
                // Try finding ANY contenteditable div
                try {
                    this.logger.info('Trying to find any contenteditable div...');
                    textInput = await this.page.evaluate(() => {
                        const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
                        if (editables.length > 0) {
                            editables[0].focus();
                            return true;
                        }
                        return false;
                    });
                    
                    if (textInput) {
                        textInput = 'contenteditable-any';
                    }
                } catch (e) {
                    this.logger.warn(`Contenteditable search failed: ${e.message}`);
                }
            }

            if (!textInput) {
                throw new Error('❌ Status text input not found - check screenshot');
            }

            this.logger.info('✅ Focused text input');
            await this.sleep(500);

            // Step 4: Type message
            await this.page.keyboard.type(message, { delay: 30 });
            this.logger.info(`✅ Typed message (${message.length} chars)`);
            await this.sleep(1000);

            // Step 5: Click Send
            const sendButton = await this.clickFirst([
                'span[data-testid="send"]',
                'div[data-testid="status-v3-send"]',
                'button[aria-label="Send"]',
                '[data-icon="send"]'
            ]);

            if (!sendButton) {
                this.logger.warn('⚠️  Send button not found, trying Enter key...');
                await this.page.keyboard.press('Enter');
                await this.sleep(500);
            }

            this.logger.success('🎉 WhatsApp Status posted successfully!');
            await this.sleep(2000);

            // Return to Chats
            await this.clickFirst([
                '[data-testid="chat"]',
                'span[data-testid="chat"]'
            ]);

            return true;

        } catch (error) {
            this.logger.error(`Status posting failed: ${error.message}`);
            
            // Take screenshot for debugging
            try {
                const screenshotPath = path.join(__dirname, `status_error_${Date.now()}.png`);
                await this.page.screenshot({ path: screenshotPath, fullPage: true });
                this.logger.info(`📸 Screenshot saved: ${screenshotPath}`);
            } catch (e) {
                // Ignore screenshot errors
            }
            
            throw error;
        }
    }

    async clickFirst(selectors) {
        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 5000 });
                await this.page.click(selector);
                return selector;
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    async focusFirst(selectors) {
        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 5000 });
                await this.page.focus(selector);
                return selector;
            } catch (error) {
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
    console.log('\n🚀 WHATSAPP STATUS POSTER\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const bot = new WhatsAppStatusBot();
    
    try {
        // Initialize
        await bot.init();
        
        // Post Status
        await bot.postStatus(CONFIG.STATUS_MESSAGE);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✅ SUCCESS! Status posted to WhatsApp!\n');
        console.log('📱 Check your WhatsApp Status to confirm\n');
        
        // Keep browser open for 10 seconds to verify
        console.log('⏳ Keeping browser open for 10 seconds...\n');
        await bot.sleep(10000);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.log('\n💡 TIP: Make sure WhatsApp Web is properly authenticated\n');
        process.exit(1);
    } finally {
        await bot.close();
    }
})();
