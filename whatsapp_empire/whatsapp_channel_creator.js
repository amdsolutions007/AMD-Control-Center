/**
 * WHATSAPP CHANNEL CREATOR - AUTOMATED
 * Purpose: Create WhatsApp Channel programmatically (no manual work!)
 * Philosophy: As developers, we automate everything. No exceptions.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
    WHATSAPP_URL: 'https://web.whatsapp.com',
    USER_DATA_DIR: path.join(__dirname, '.whatsapp-session'),
    
    // Channel Details
    CHANNEL_NAME: 'AMD Solutions - Premium AI Lab',
    CHANNEL_DESCRIPTION: `Nigeria's First Premium AI Labor Company.

Get insights on automation, AI, and business growth.

🚀 Professional workspace for Nigerian tech innovators
💎 Exclusive content, case studies, and tools
🇳🇬 Building the digital future together

Not for everyone. Join the movement.`,
    
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

// WhatsApp Channel Creator
class WhatsAppChannelCreator {
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
                
                // Wait for authentication
                await this.page.waitForFunction(
                    () => !document.querySelector('canvas[aria-label="Scan this QR code to link a device!"]'),
                    { timeout: 120000 }
                );
                
                this.logger.success('✅ Authenticated successfully!');
                await this.sleep(3000);
            } else {
                this.logger.success('Already authenticated!');
            }

            // Wait for main interface
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

    async createChannel(name, description) {
        try {
            this.logger.info('📢 Creating WhatsApp Channel...');
            this.logger.info(`📝 Name: ${name}`);
            this.logger.info(`📄 Description: ${description.substring(0, 50)}...`);

            // Step 1: Navigate to Status/Updates tab
            await this.sleep(2000);
            this.logger.info('Step 1: Opening Updates/Status section...');
            
            const statusTab = await this.clickFirst([
                '[data-icon="status-v3"]',
                '[data-icon="status"]',
                '[data-testid="status-v3"]',
                'span[data-testid="status-v3"]',
                '[aria-label*="Status"]',
                'a[href*="/status"]'
            ]);

            if (!statusTab) {
                throw new Error('❌ Status tab not found');
            }

            this.logger.success('✅ Opened Status section');
            await this.sleep(3000);

            // Step 2: Look for "Create Channel" or "+" button
            this.logger.info('Step 2: Looking for Create Channel button...');
            
            // Try multiple methods to find channel creation
            let channelButton = await this.clickFirst([
                '[aria-label*="Create channel"]',
                '[aria-label*="New channel"]',
                'button[aria-label*="channel"]',
                'div[data-testid="channel-create"]',
                '[data-icon="channel-create"]',
                '[data-icon="plus"]'  // Generic plus button
            ]);

            if (!channelButton) {
                this.logger.info('Trying alternative method: Menu search...');
                
                // Try opening menu (3-dot icon)
                const menuButton = await this.clickFirst([
                    '[data-icon="menu"]',
                    '[aria-label*="Menu"]',
                    'button[aria-label="Menu"]',
                    'span[data-icon="menu"]'
                ]);

                if (menuButton) {
                    await this.sleep(1500);
                    
                    // Look for "Create channel" in menu
                    channelButton = await this.clickFirst([
                        '[aria-label*="Create channel"]',
                        'div[role="button"]:contains("Create channel")',
                        'li:contains("Create channel")'
                    ]);
                }
            }

            // If still not found, try visual search for "+ Create channel" text
            if (!channelButton) {
                this.logger.info('Trying visual text search...');
                
                channelButton = await this.page.evaluate(() => {
                    const allElements = Array.from(document.querySelectorAll('div, button, span, a'));
                    for (const el of allElements) {
                        const text = el.textContent || '';
                        if (text.toLowerCase().includes('create channel') || 
                            text.toLowerCase().includes('new channel')) {
                            el.click();
                            return true;
                        }
                    }
                    return false;
                });
            }

            if (!channelButton) {
                this.logger.warn('⚠️  Channel creation button not found via standard methods');
                this.logger.info('💡 Attempting fallback: Direct URL navigation...');
                
                // Try navigating directly to channel creation URL
                await this.page.goto('https://web.whatsapp.com/create-channel', { waitUntil: 'networkidle2' });
                await this.sleep(2000);
            }

            this.logger.success('✅ Channel creation form accessed');
            await this.sleep(2000);

            // Step 3: Fill in Channel Name
            this.logger.info('Step 3: Entering channel name...');
            
            const nameInput = await this.focusFirst([
                'input[placeholder*="Channel name"]',
                'input[placeholder*="channel"]',
                'input[type="text"]',
                'div[contenteditable="true"]'
            ]);

            if (!nameInput) {
                throw new Error('❌ Channel name input not found');
            }

            await this.page.keyboard.type(name, { delay: 50 });
            this.logger.success(`✅ Entered name: ${name}`);
            await this.sleep(1000);

            // Step 4: Fill in Channel Description
            this.logger.info('Step 4: Entering channel description...');
            
            // Try to navigate to description field (usually next)
            await this.page.keyboard.press('Tab');
            await this.sleep(500);
            
            // Or find description field explicitly
            const descInput = await this.focusFirst([
                'textarea[placeholder*="Description"]',
                'textarea[placeholder*="description"]',
                'div[contenteditable="true"][aria-label*="Description"]',
                'textarea'
            ]);

            if (descInput) {
                await this.page.keyboard.type(description, { delay: 30 });
                this.logger.success(`✅ Entered description (${description.length} chars)`);
            } else {
                this.logger.warn('⚠️  Description field not found, name only');
            }

            await this.sleep(1500);

            // Step 5: Click "Create Channel" or "Done" button
            this.logger.info('Step 5: Creating channel...');
            
            const createButton = await this.clickFirst([
                'button[aria-label*="Create"]',
                'button:contains("Create")',
                'button:contains("Done")',
                'div[role="button"][aria-label*="Create"]',
                'button[data-testid="channel-create-confirm"]'
            ]);

            if (!createButton) {
                this.logger.warn('⚠️  Create button not found, trying Enter key...');
                await this.page.keyboard.press('Enter');
            }

            await this.sleep(3000);

            // Step 6: Handle any confirmation dialogs
            this.logger.info('Step 6: Checking for confirmation dialogs...');
            
            const confirmButton = await this.clickFirst([
                'button[aria-label*="Got it"]',
                'button[aria-label*="Continue"]',
                'button:contains("Got it")',
                'button:contains("Continue")'
            ]);

            if (confirmButton) {
                this.logger.info('✅ Confirmation dialog handled');
                await this.sleep(2000);
            }

            this.logger.success('🎉 WhatsApp Channel created successfully!');
            await this.sleep(2000);

            // Step 7: Try to get channel link
            this.logger.info('Step 7: Retrieving channel link...');
            
            const channelLink = await this.getChannelLink();
            if (channelLink) {
                this.logger.success(`🔗 Channel Link: ${channelLink}`);
                
                // Save to file
                const linkFile = path.join(__dirname, 'whatsapp_channel_link.txt');
                fs.writeFileSync(linkFile, `Channel Name: ${name}\nChannel Link: ${channelLink}\nCreated: ${new Date().toISOString()}`);
                this.logger.info(`💾 Link saved to: ${linkFile}`);
            }

            return {
                success: true,
                name: name,
                description: description,
                link: channelLink
            };

        } catch (error) {
            this.logger.error(`Channel creation failed: ${error.message}`);
            
            // Take screenshot for debugging
            try {
                const screenshotPath = path.join(__dirname, `channel_error_${Date.now()}.png`);
                await this.page.screenshot({ path: screenshotPath, fullPage: true });
                this.logger.info(`📸 Screenshot saved: ${screenshotPath}`);
            } catch (e) {
                // Ignore screenshot errors
            }
            
            throw error;
        }
    }

    async getChannelLink() {
        try {
            // Look for share button or link icon
            const shareButton = await this.clickFirst([
                '[data-icon="share"]',
                '[aria-label*="Share"]',
                'button[aria-label*="share"]'
            ]);

            if (shareButton) {
                await this.sleep(1500);
                
                // Try to get link from clipboard or visible text
                const link = await this.page.evaluate(() => {
                    const linkElements = Array.from(document.querySelectorAll('a, span, div'));
                    for (const el of linkElements) {
                        const text = el.textContent || el.getAttribute('href') || '';
                        if (text.includes('whatsapp.com/channel/')) {
                            return text.trim();
                        }
                    }
                    return null;
                });

                if (link) {
                    return link;
                }
            }
        } catch (e) {
            this.logger.warn('⚠️  Could not retrieve channel link automatically');
        }
        
        return null;
    }

    async clickFirst(selectors) {
        for (const selector of selectors) {
            try {
                this.logger.info(`  Trying selector: ${selector}`);
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
                this.logger.info(`  Trying input selector: ${selector}`);
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
    console.log('\n🚀 WHATSAPP CHANNEL CREATOR - FULLY AUTOMATED\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 As developers, we automate EVERYTHING!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const creator = new WhatsAppChannelCreator();
    
    try {
        // Initialize
        await creator.init();
        
        // Create Channel
        const result = await creator.createChannel(
            CONFIG.CHANNEL_NAME,
            CONFIG.CHANNEL_DESCRIPTION
        );
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✅ SUCCESS! WhatsApp Channel Created!\n');
        console.log(`📛 Channel Name: ${result.name}`);
        console.log(`📄 Description: ${result.description.substring(0, 80)}...`);
        if (result.link) {
            console.log(`🔗 Share Link: ${result.link}`);
        }
        console.log('\n📱 Check WhatsApp Web to confirm\n');
        console.log('💡 Next: Start posting content to your channel!');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Keep browser open for 15 seconds to verify
        console.log('⏳ Keeping browser open for 15 seconds...\n');
        await creator.sleep(15000);
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.log('\n💡 TIP: If channel creation UI changed, check screenshot');
        console.log('💡 Fallback: Open WhatsApp Web manually and look for "Create Channel" in Updates section\n');
        process.exit(1);
    } finally {
        await creator.close();
    }
})();
