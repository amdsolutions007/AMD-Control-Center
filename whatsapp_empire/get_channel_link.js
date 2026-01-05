/**
 * GET WHATSAPP CHANNEL INVITE LINK - AUTOMATED
 * Purpose: Extract channel invite link automatically
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CONFIG = {
    WHATSAPP_URL: 'https://web.whatsapp.com',
    USER_DATA_DIR: path.join(__dirname, '.whatsapp-session'),
    CHANNEL_NAME: 'AMD Solutions - Premium AI Lab',
    HEADLESS: false
};

class Logger {
    log(emoji, message) {
        console.log(`${new Date().toLocaleTimeString()} ${emoji} ${message}`);
    }
    success(message) { this.log('✅', message); }
    info(message) { this.log('ℹ️', message); }
    warn(message) { this.log('⚠️', message); }
    error(message) { this.log('❌', message); }
}

class ChannelLinkExtractor {
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
                    '--window-size=1280,800'
                ]
            });

            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1280, height: 800 });
            
            await this.page.goto(CONFIG.WHATSAPP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
            this.logger.success('WhatsApp Web loaded!');
            
            const qrCode = await this.page.$('canvas[aria-label="Scan this QR code to link a device!"]');
            if (qrCode) {
                this.logger.warn('⚠️  QR CODE DETECTED! Scan to authenticate...');
                await this.page.waitForFunction(
                    () => !document.querySelector('canvas[aria-label="Scan this QR code to link a device!"]'),
                    { timeout: 120000 }
                );
                this.logger.success('✅ Authenticated!');
                await this.sleep(3000);
            } else {
                this.logger.success('Already authenticated!');
            }

            await this.page.waitForFunction(
                () => document.querySelector('[data-testid="chat"]') || document.querySelector('#side'),
                { timeout: 30000 }
            );
            this.logger.success('WhatsApp interface ready!');
            
            return true;

        } catch (error) {
            this.logger.error(`Initialization failed: ${error.message}`);
            throw error;
        }
    }

    async getChannelLink() {
        try {
            this.logger.info('📡 Extracting channel invite link...');

            // Step 1: Open Updates/Status section
            await this.sleep(2000);
            this.logger.info('Step 1: Opening Updates section...');
            
            const statusTab = await this.clickFirst([
                '[data-icon="status-v3"]',
                '[data-icon="status"]',
                '[data-testid="status-v3"]',
                '[aria-label*="Status"]'
            ]);

            if (!statusTab) {
                this.logger.warn('⚠️  Status tab not found, trying visual approach...');
                // Try clicking by coordinates (status icon is typically on left)
                await this.page.mouse.click(60, 150);
                await this.sleep(1000);
            }

            this.logger.success('✅ Opened Updates section');
            await this.sleep(2000);

            // Step 2: Find and click channel
            this.logger.info(`Step 2: Finding channel "${CONFIG.CHANNEL_NAME}"...`);
            
            const channelFound = await this.page.evaluate((channelName) => {
                const allElements = Array.from(document.querySelectorAll('div, span'));
                for (const el of allElements) {
                    const text = el.textContent || '';
                    if (text.includes(channelName)) {
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
                const channelElement = await this.clickFirst([
                    '[data-icon="channel"]',
                    '[aria-label*="Channel"]'
                ]);
                if (!channelElement) {
                    throw new Error(`❌ Channel "${CONFIG.CHANNEL_NAME}" not found`);
                }
            }

            this.logger.success('✅ Opened channel');
            await this.sleep(3000);

            // Step 3: Click channel name/header to open info
            this.logger.info('Step 3: Opening channel info...');
            
            const headerClicked = await this.page.evaluate(() => {
                // Look for channel header/name at top
                const headers = Array.from(document.querySelectorAll('header, div[role="button"]'));
                for (const header of headers) {
                    const rect = header.getBoundingClientRect();
                    if (rect.top < 100 && rect.left > 50) {  // Top area
                        header.click();
                        return true;
                    }
                }
                return false;
            });

            if (!headerClicked) {
                // Try clicking specific selectors
                const infoOpened = await this.clickFirst([
                    'header span[dir="auto"]',
                    'header div[role="button"]',
                    '[data-testid="conversation-info-header"]',
                    'header'
                ]);
                
                if (!infoOpened) {
                    throw new Error('❌ Could not open channel info');
                }
            }

            this.logger.success('✅ Opened channel info');
            await this.sleep(3000);

            // Step 4: Look for "Invite link" or similar button
            this.logger.info('Step 4: Finding invite link...');
            
            // Try clicking invite link button
            const inviteLinkClicked = await this.page.evaluate(() => {
                const allElements = Array.from(document.querySelectorAll('div, span, button'));
                for (const el of allElements) {
                    const text = (el.textContent || '').toLowerCase();
                    if (text.includes('invite') || text.includes('link') || text.includes('share')) {
                        el.click();
                        return true;
                    }
                }
                return false;
            });

            if (inviteLinkClicked) {
                this.logger.success('✅ Clicked invite link button');
                await this.sleep(2000);
            }

            // Step 5: Extract the link from clipboard or page
            this.logger.info('Step 5: Extracting link...');
            
            const channelLink = await this.page.evaluate(() => {
                // Look for link in page text
                const pageText = document.body.innerText;
                const match = pageText.match(/https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9_-]+/);
                if (match) {
                    return match[0];
                }
                
                // Look for link in href attributes
                const links = Array.from(document.querySelectorAll('a'));
                for (const el of links) {
                    const href = el.getAttribute('href') || '';
                    if (href.includes('whatsapp.com/channel')) {
                        return href;
                    }
                }
                
                // Check spans and divs for displayed link
                const allElements = Array.from(document.querySelectorAll('span, div'));
                for (const el of allElements) {
                    const text = el.textContent || '';
                    if (text.match(/https:\/\/whatsapp\.com\/channel\//)) {
                        return text.trim();
                    }
                }
                
                return null;
            });

            if (channelLink && channelLink.includes('whatsapp.com/channel')) {
                this.logger.success('🎉 Channel link extracted!');
                
                // Save to file
                const linkFile = path.join(__dirname, 'CHANNEL_INVITE_LINK.txt');
                const content = `
🔗 WHATSAPP CHANNEL INVITE LINK
================================

Channel Name: ${CONFIG.CHANNEL_NAME}
Invite Link: ${channelLink}
Extracted: ${new Date().toLocaleString()}

📱 SHARE THIS LINK:
- WhatsApp Status
- Twitter/Social Media
- Direct Messages
- SMS/Email

⚠️  KEEP THIS PRIVATE - Anyone with this link can join your channel!
`;
                
                fs.writeFileSync(linkFile, content);
                this.logger.success(`✅ Link saved to: ${linkFile}`);
                
                console.log('\n' + '='.repeat(60));
                console.log('🔗 YOUR CHANNEL INVITE LINK:');
                console.log('='.repeat(60));
                console.log(channelLink);
                console.log('='.repeat(60) + '\n');
                
                return channelLink;
            } else {
                // Manual extraction fallback
                this.logger.warn('⚠️  Automatic extraction failed');
                this.logger.info('📸 Taking screenshot for manual extraction...');
                
                const screenshotPath = path.join(__dirname, 'channel_info_screenshot.png');
                await this.page.screenshot({ path: screenshotPath, fullPage: true });
                this.logger.info(`Screenshot saved: ${screenshotPath}`);
                
                console.log('\n' + '='.repeat(60));
                console.log('📱 MANUAL STEPS TO GET LINK:');
                console.log('='.repeat(60));
                console.log('1. Look at the browser window');
                console.log('2. Find "Invite link" or "Share link" button');
                console.log('3. Click it and copy the link');
                console.log('4. Paste it here or save it manually');
                console.log('='.repeat(60) + '\n');
                
                // Keep browser open for manual extraction
                this.logger.info('⏳ Keeping browser open for 30 seconds...');
                await this.sleep(30000);
                
                return null;
            }

        } catch (error) {
            this.logger.error(`Link extraction failed: ${error.message}`);
            
            const screenshotPath = path.join(__dirname, `link_extraction_error_${Date.now()}.png`);
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            this.logger.info(`📸 Screenshot saved: ${screenshotPath}`);
            
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
    console.log('\n🔗 CHANNEL LINK EXTRACTOR\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const extractor = new ChannelLinkExtractor();
    
    try {
        await extractor.init();
        const link = await extractor.getChannelLink();
        
        if (link) {
            console.log('\n✅ SUCCESS! Channel link extracted!\n');
            console.log('📁 Link saved to: CHANNEL_INVITE_LINK.txt\n');
        } else {
            console.log('\n⚠️  Please extract link manually from the browser\n');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.log('\n💡 TIP: Check the screenshot for manual extraction\n');
        process.exit(1);
    } finally {
        await extractor.close();
    }
})();
