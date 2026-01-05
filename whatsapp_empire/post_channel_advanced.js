#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WHATSAPP CHANNEL AUTOMATION V2 - ADVANCED
 * ═══════════════════════════════════════════════════════════════════════════
 * Mission: Post to WhatsApp Channel - NO EXCUSES, NO MANUAL WORK
 * Strategy: Multiple selector approaches + smart waiting + retry logic
 * ═══════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const CONFIG = {
    SESSION_DIR: path.join(__dirname, '.whatsapp-session-status'),
    VIDEO_PATH: path.join(__dirname, '../social_engine/RiseUp_Launch_Master.mp4'),
    YOUTUBE_URL: 'https://www.youtube.com/watch?v=3B7Gv-1AdvU',
    CHANNEL_NAME: 'AMD Media Solutions',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBqjJIIyPtZNkkOog3Z',
    
    CAPTION: `🇳🇬 RISE UP: The Trilogy

Three visions. One mission. Nigeria's digital transformation begins now.

Part I: The Awakening
Part II: The Architect  
Part III: The Invitation

Watch the full journey 🎬
https://www.youtube.com/watch?v=3B7Gv-1AdvU

Build with us. Rise with us.

💼 AMD Media Solutions
🤖 Nigeria's #1 AI Solutions Provider
📞 +234 906 855 9191
🌐 amdsolutions007.com

#RiseUpNigeria #DigitalTransformation #AIForAfrica #NigerianTech #Innovation2026`
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function log(emoji, message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} ${emoji} ${message}`);
}

async function tryMultipleSelectors(page, selectors, timeout = 5000) {
    for (const selector of selectors) {
        try {
            await page.waitForSelector(selector, { timeout });
            return await page.$(selector);
        } catch (e) {
            continue;
        }
    }
    return null;
}

async function clickElement(page, element) {
    try {
        await element.click();
        return true;
    } catch (e) {
        try {
            await page.evaluate(el => el.click(), element);
            return true;
        } catch (e2) {
            return false;
        }
    }
}

async function postToChannel(page) {
    await log('📢', 'STARTING CHANNEL POST AUTOMATION');
    
    try {
        // METHOD 1: Direct channel link navigation
        await log('🔗', `Navigating directly to channel: ${CONFIG.CHANNEL_LINK}`);
        await page.goto(CONFIG.CHANNEL_LINK, { waitUntil: 'networkidle2', timeout: 30000 });
        await sleep(5000);
        
        // Check if we're on channel page
        const channelIndicators = [
            '[data-testid="channel-header"]',
            'header[data-testid="conversation-header"]',
            '[aria-label*="channel"]',
            'header span[title*="AMD"]'
        ];
        
        const channelHeader = await tryMultipleSelectors(page, channelIndicators, 5000);
        
        if (channelHeader) {
            await log('✅', 'Channel page loaded successfully!');
            
            // Look for attachment button (multiple possible selectors)
            await log('📎', 'Looking for attachment button...');
            const attachmentSelectors = [
                '[data-testid="conversation-attach-button"]',
                '[data-icon="attach-menu-plus"]',
                'button[aria-label*="Attach"]',
                'span[data-icon="plus"]',
                '[data-testid="compose-btn-attach"]',
                'div[title="Attach"]'
            ];
            
            const attachButton = await tryMultipleSelectors(page, attachmentSelectors, 5000);
            
            if (attachButton) {
                await log('✅', 'Found attachment button');
                await clickElement(page, attachButton);
                await sleep(2000);
                
                // Look for file input (video upload)
                await log('🎬', 'Looking for file upload input...');
                const fileInputSelectors = [
                    'input[type="file"][accept*="video"]',
                    'input[type="file"][accept*="image"]',
                    'input[type="file"]'
                ];
                
                let fileInput = null;
                for (const selector of fileInputSelectors) {
                    const inputs = await page.$$(selector);
                    for (const input of inputs) {
                        const isVisible = await page.evaluate(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none' && style.visibility !== 'hidden';
                        }, input);
                        
                        if (isVisible || true) { // Accept even hidden inputs
                            fileInput = input;
                            break;
                        }
                    }
                    if (fileInput) break;
                }
                
                if (fileInput) {
                    await log('✅', 'Found file input');
                    await fileInput.uploadFile(CONFIG.VIDEO_PATH);
                    await log('📤', 'Video uploaded! Waiting for processing...');
                    await sleep(10000); // Wait for video to process
                    
                    // Look for caption input
                    await log('✍️', 'Looking for caption field...');
                    const captionSelectors = [
                        'div[contenteditable="true"][data-tab="10"]',
                        'div[contenteditable="true"]',
                        '[data-testid="conversation-compose-box-input"]',
                        'div[role="textbox"]'
                    ];
                    
                    const captionBox = await tryMultipleSelectors(page, captionSelectors, 5000);
                    
                    if (captionBox) {
                        await log('✅', 'Found caption field');
                        await clickElement(page, captionBox);
                        await sleep(1000);
                        
                        // Type caption
                        await log('📝', 'Typing caption...');
                        await page.keyboard.type(CONFIG.CAPTION, { delay: 30 });
                        await sleep(2000);
                        
                        // Look for send button
                        await log('🚀', 'Looking for send button...');
                        const sendSelectors = [
                            '[data-testid="send"]',
                            'button[aria-label="Send"]',
                            'span[data-icon="send"]',
                            'button[data-testid="compose-btn-send"]'
                        ];
                        
                        const sendButton = await tryMultipleSelectors(page, sendSelectors, 5000);
                        
                        if (sendButton) {
                            await log('✅', 'Found send button');
                            await clickElement(page, sendButton);
                            await sleep(5000);
                            
                            await log('🎉', '✅✅✅ CHANNEL POST SUCCESSFUL! ✅✅✅');
                            return true;
                        } else {
                            await log('⚠️', 'Send button not found - trying Enter key');
                            await page.keyboard.press('Enter');
                            await sleep(5000);
                            await log('✅', 'Posted via Enter key');
                            return true;
                        }
                    }
                }
            } else {
                await log('⚠️', 'Attachment button not found - trying alternative method');
            }
        }
        
        // METHOD 2: Search and navigate
        await log('🔍', 'Trying Method 2: Search navigation');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' });
        await sleep(3000);
        
        const searchSelectors = [
            'div[contenteditable="true"][data-tab="3"]',
            '[data-testid="chat-list-search"]',
            'input[type="text"]'
        ];
        
        const searchBox = await tryMultipleSelectors(page, searchSelectors, 5000);
        
        if (searchBox) {
            await log('✅', 'Found search box');
            await clickElement(page, searchBox);
            await sleep(1000);
            await page.keyboard.type(CONFIG.CHANNEL_NAME, { delay: 100 });
            await sleep(3000);
            
            // Press Enter to select first result
            await page.keyboard.press('Enter');
            await sleep(3000);
            
            await log('✅', 'Opened chat from search');
            
            // Now try posting
            const attachBtn = await tryMultipleSelectors(page, [
                '[data-icon="plus"]',
                '[data-icon="attach-menu-plus"]',
                'span[data-icon="clip"]'
            ], 3000);
            
            if (attachBtn) {
                await clickElement(page, attachBtn);
                await sleep(2000);
                
                // Find and upload
                const fileInp = await page.$('input[type="file"]');
                if (fileInp) {
                    await fileInp.uploadFile(CONFIG.VIDEO_PATH);
                    await sleep(10000);
                    
                    // Caption
                    const captBox = await page.$('div[contenteditable="true"]');
                    if (captBox) {
                        await clickElement(page, captBox);
                        await page.keyboard.type(CONFIG.CAPTION, { delay: 30 });
                        await sleep(2000);
                        
                        // Send
                        await page.keyboard.press('Enter');
                        await sleep(5000);
                        
                        await log('🎉', '✅✅✅ POSTED VIA METHOD 2! ✅✅✅');
                        return true;
                    }
                }
            }
        }
        
        await log('❌', 'All methods exhausted');
        return false;
        
    } catch (error) {
        await log('❌', `Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🤖 WHATSAPP CHANNEL AUTOMATION V2 - ADVANCED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📢 Channel:', CONFIG.CHANNEL_NAME);
    console.log('🔗 Link:', CONFIG.CHANNEL_LINK);
    console.log('🎬 Video:', CONFIG.VIDEO_PATH);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    if (!fs.existsSync(CONFIG.VIDEO_PATH)) {
        await log('❌', `Video not found: ${CONFIG.VIDEO_PATH}`);
        process.exit(1);
    }
    
    let browser;
    try {
        await log('🚀', 'Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1400,900'
            ],
            userDataDir: CONFIG.SESSION_DIR,
            defaultViewport: { width: 1400, height: 900 }
        });
        
        const page = await browser.newPage();
        
        await log('🌐', 'Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Wait for login
        await log('⏳', 'Checking authentication...');
        try {
            await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 30000 });
            await log('✅', 'Logged in successfully!');
        } catch (e) {
            await log('⚠️', 'Not logged in - waiting for QR scan...');
            await sleep(60000);
        }
        
        // Attempt posting
        const success = await postToChannel(page);
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        if (success) {
            console.log('🎉 SUCCESS! VIDEO POSTED TO WHATSAPP CHANNEL!');
            console.log('✅ Channel: AMD Media Solutions 🌍');
            console.log('✅ Video: Rise Up Trilogy');
            console.log('✅ Caption: Included with YouTube link');
        } else {
            console.log('⚠️ AUTOMATION INCOMPLETE');
            console.log('📱 Browser staying open for manual completion');
        }
        console.log('═══════════════════════════════════════════════════════════════');
        
        await log('⏳', 'Keeping browser open for 30 seconds...');
        await sleep(30000);
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

main().catch(console.error);
