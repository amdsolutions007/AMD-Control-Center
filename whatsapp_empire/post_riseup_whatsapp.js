#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WHATSAPP - RISE UP TRILOGY AUTO-POSTER
 * ═══════════════════════════════════════════════════════════════════════════
 * Mission: Post Rise Up Trilogy to WhatsApp Status + Channel (FULLY AUTOMATED)
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
    CHANNEL_NAME: 'AMD Media Solutions 🌍',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBqjJIIyPtZNkkOog3Z',
    CHANNEL_URL: 'https://whatsapp.com/channel/0029VbBqjJIIyPtZNkkOog3Z',
    
    CAPTION: `🇳🇬 RISE UP: The Trilogy

Three visions. One mission. Nigeria's digital transformation begins now.

Part I: The Awakening
Part II: The Architect  
Part III: The Invitation

Watch the full journey 🎬
https://www.youtube.com/watch?v=3B7Gv-1AdvU

Build with us. Rise with us.

💼 AMD Solutions 007
🤖 Nigeria's #1 AI Solutions Provider
📞 +234 906 855 9191
🌐 amdsolutions007.com

#RiseUpNigeria #DigitalTransformation #AIForAfrica #NigerianTech #Innovation2026`,

    STATUS_TEXT: '🇳🇬 RISE UP: The Trilogy\nFull video: youtube.com/watch?v=3B7Gv-1AdvU',
    
    CHANNEL_DESCRIPTION: `🤖 Nigeria's #1 AI Solutions Provider

We help businesses:
✅ Generate ₦50M+ through AI automation
✅ Automate 80% of operations
✅ Save 20+ hours weekly

₦2.5B+ revenue generated for clients
18 AI systems deployed | 95% satisfaction

🎬 Latest: Rise Up Trilogy
🌐 amdsolutions007.com
📞 +234 906 855 9191`
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForWhatsAppReady(page) {
    console.log('⏳ Waiting for WhatsApp to load...');
    try {
        await page.waitForSelector('div[contenteditable="true"][data-tab="3"]', { timeout: 60000 });
        console.log('✅ WhatsApp loaded successfully');
        return true;
    } catch (error) {
        console.log('❌ WhatsApp not logged in or failed to load');
        return false;
    }
}

async function postToStatus(page) {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📸 STEP 1: POSTING TO WHATSAPP STATUS');
    console.log('════════════════════════════════════════════════════════════');
    
    try {
        // Click on Status tab
        console.log('📱 Navigating to Status tab...');
        await page.waitForSelector('span[data-icon="status"]', { timeout: 10000 });
        await page.click('span[data-icon="status"]');
        await sleep(2000);
        
        // Click on add status button (camera icon)
        console.log('📷 Opening status camera...');
        const cameraButton = await page.$('div[title="My status"] span[data-icon="status-image"]');
        if (cameraButton) {
            await cameraButton.click();
            await sleep(2000);
        } else {
            console.log('⚠️  Status camera not found - might already have status today');
        }
        
        // Upload video
        console.log('🎬 Uploading video to status...');
        const fileInput = await page.$('input[type="file"][accept="image/*,video/mp4,video/3gpp,video/quicktime"]');
        if (fileInput) {
            await fileInput.uploadFile(CONFIG.VIDEO_PATH);
            console.log('✅ Video uploaded');
            await sleep(5000);
            
            // Add caption/text overlay
            console.log('✍️  Adding text overlay...');
            const textArea = await page.$('div[contenteditable="true"]');
            if (textArea) {
                await textArea.click();
                await page.keyboard.type(CONFIG.STATUS_TEXT);
                await sleep(2000);
            }
            
            // Send status
            console.log('📤 Publishing status...');
            const sendButton = await page.$('span[data-icon="send"]');
            if (sendButton) {
                await sendButton.click();
                await sleep(3000);
                console.log('✅ STATUS POSTED SUCCESSFULLY!');
                return true;
            }
        } else {
            console.log('⚠️  File upload not available - Status might use different flow');
        }
        
        return false;
    } catch (error) {
        console.log(`❌ Status posting failed: ${error.message}`);
        console.log('💡 Tip: Post Status manually on phone, but Channel will be automated');
        return false;
    }
}

async function postToChannel(page) {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📢 STEP 2: POSTING TO WHATSAPP CHANNEL');
    console.log('════════════════════════════════════════════════════════════');
    
    try {
        // Navigate to Updates tab
        console.log('📱 Navigating to Updates tab...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' });
        await sleep(3000);
        
        // Look for channel by name
        console.log(`🔍 Searching for channel: ${CONFIG.CHANNEL_NAME}...`);
        const searchBox = await page.$('div[contenteditable="true"][data-tab="3"]');
        if (searchBox) {
            await searchBox.click();
            await page.keyboard.type(CONFIG.CHANNEL_NAME);
            await sleep(2000);
            
            // Click on channel
            console.log('📢 Opening channel...');
            const channelElement = await page.$(`span[title*="${CONFIG.CHANNEL_NAME}"]`);
            if (channelElement) {
                await channelElement.click();
                await sleep(3000);
                
                // Click attachment button
                console.log('📎 Opening attachment menu...');
                const attachButton = await page.$('span[data-icon="plus"]');
                if (attachButton) {
                    await attachButton.click();
                    await sleep(1000);
                    
                    // Click photo/video option
                    console.log('🎬 Selecting video option...');
                    const videoOption = await page.$('input[type="file"][accept="image/*,video/mp4,video/3gpp,video/quicktime"]');
                    if (videoOption) {
                        await videoOption.uploadFile(CONFIG.VIDEO_PATH);
                        console.log('✅ Video uploaded to channel');
                        await sleep(8000); // Wait for video to process
                        
                        // Add caption
                        console.log('✍️  Adding caption...');
                        const captionBox = await page.$('div[contenteditable="true"][data-tab="10"]');
                        if (captionBox) {
                            await captionBox.click();
                            await page.keyboard.type(CONFIG.CAPTION);
                            await sleep(2000);
                            
                            // Send
                            console.log('📤 Publishing to channel...');
                            const sendBtn = await page.$('span[data-icon="send"]');
                            if (sendBtn) {
                                await sendBtn.click();
                                await sleep(5000);
                                console.log('✅ CHANNEL POST PUBLISHED SUCCESSFULLY!');
                                return true;
                            }
                        }
                    }
                }
            } else {
                console.log(`❌ Channel "${CONFIG.CHANNEL_NAME}" not found`);
                console.log('💡 Make sure channel name is exact match');
            }
        }
        
        return false;
    } catch (error) {
        console.log(`❌ Channel posting failed: ${error.message}`);
        return false;
    }
}

async function updateChannelDescription(page) {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📝 STEP 3: UPDATING CHANNEL DESCRIPTION');
    console.log('════════════════════════════════════════════════════════════');
    
    try {
        // Channel should already be open from previous step
        console.log('⚙️  Opening channel settings...');
        
        // Click on channel name/header to open info
        const channelHeader = await page.$('header span[dir="auto"]');
        if (channelHeader) {
            await channelHeader.click();
            await sleep(2000);
            
            // Look for edit button
            console.log('✏️  Looking for edit option...');
            const editButton = await page.$('div[title="Edit channel info"]');
            if (editButton) {
                await editButton.click();
                await sleep(2000);
                
                // Find description field
                console.log('📝 Updating description...');
                const descFields = await page.$$('div[contenteditable="true"]');
                for (const field of descFields) {
                    const text = await page.evaluate(el => el.textContent, field);
                    if (text.length > 50) { // Description field is usually longer
                        await field.click();
                        await page.keyboard.down('Control');
                        await page.keyboard.press('A');
                        await page.keyboard.up('Control');
                        await page.keyboard.press('Backspace');
                        await page.keyboard.type(CONFIG.CHANNEL_DESCRIPTION);
                        await sleep(2000);
                        
                        // Save
                        console.log('💾 Saving changes...');
                        const saveButton = await page.$('div[role="button"][aria-label="Save"]');
                        if (saveButton) {
                            await saveButton.click();
                            await sleep(3000);
                            console.log('✅ CHANNEL DESCRIPTION UPDATED!');
                            return true;
                        }
                        break;
                    }
                }
            }
        }
        
        console.log('⚠️  Could not update description automatically');
        console.log('💡 Description text saved for manual update if needed');
        return false;
    } catch (error) {
        console.log(`❌ Description update failed: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('🤖 WHATSAPP AUTOMATION - RISE UP TRILOGY DEPLOYMENT');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('📹 Video:', CONFIG.VIDEO_PATH);
    console.log('🎬 YouTube:', CONFIG.YOUTUBE_URL);
    console.log('📢 Channel:', CONFIG.CHANNEL_NAME);
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Check video exists
    if (!fs.existsSync(CONFIG.VIDEO_PATH)) {
        console.log(`❌ ERROR: Video not found at ${CONFIG.VIDEO_PATH}`);
        process.exit(1);
    }
    
    let browser;
    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ],
            userDataDir: CONFIG.SESSION_DIR
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        // Navigate to WhatsApp
        console.log('🌐 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' });
        
        // Wait for login
        const isReady = await waitForWhatsAppReady(page);
        if (!isReady) {
            console.log('❌ WhatsApp not ready. Please scan QR code if needed.');
            await sleep(30000); // Wait 30 seconds for manual scan
            const retryReady = await waitForWhatsAppReady(page);
            if (!retryReady) {
                console.log('❌ Still not ready. Exiting.');
                await browser.close();
                return;
            }
        }
        
        // Execute tasks
        const results = {
            status: false,
            channel: false,
            description: false
        };
        
        // Task 1: Post to Status
        results.status = await postToStatus(page);
        await sleep(3000);
        
        // Task 2: Post to Channel
        results.channel = await postToChannel(page);
        await sleep(3000);
        
        // Task 3: Update Description
        if (results.channel) {
            results.description = await updateChannelDescription(page);
        }
        
        // Summary
        console.log('\n═══════════════════════════════════════════════════════════════════════════');
        console.log('📊 DEPLOYMENT SUMMARY');
        console.log('═══════════════════════════════════════════════════════════════════════════');
        console.log(`📸 WhatsApp Status:      ${results.status ? '✅ POSTED' : '⚠️  MANUAL NEEDED'}`);
        console.log(`📢 WhatsApp Channel:     ${results.channel ? '✅ POSTED' : '⚠️  MANUAL NEEDED'}`);
        console.log(`📝 Channel Description:  ${results.description ? '✅ UPDATED' : '⚠️  MANUAL NEEDED'}`);
        console.log('═══════════════════════════════════════════════════════════════════════════');
        
        if (results.channel && results.status) {
            console.log('\n🎉 SUCCESS! Rise Up Trilogy deployed to WhatsApp!');
        } else {
            console.log('\n⚠️  Some tasks need manual completion - see above');
        }
        
        console.log('\n💡 Browser will stay open for 10 seconds...');
        await sleep(10000);
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run
main().catch(console.error);
