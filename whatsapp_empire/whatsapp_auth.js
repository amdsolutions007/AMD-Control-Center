#!/usr/bin/env node
/**
 * WhatsApp Terminal Authentication
 * Run this ONCE to authenticate your WhatsApp
 * 
 * YOU NEED: Any smartphone with camera (borrow for 2 minutes!)
 * 
 * Usage: node whatsapp_auth.js
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('\n' + '='.repeat(60));
console.log('📱 WHATSAPP TERMINAL AUTHENTICATION');
console.log('='.repeat(60));
console.log('\n⚠️  YOU NEED A SMARTPHONE FOR 2 MINUTES:');
console.log('   - Borrow ANY phone with WhatsApp');
console.log('   - Your friend/family/colleague');
console.log('   - Just for scanning QR code');
console.log('   - After scan, return phone - done forever!');
console.log('\n🔐 Your session will be saved locally');
console.log('   Next time, no QR code needed!\n');
console.log('='.repeat(60));
console.log('\n⏳ Initializing WhatsApp client...\n');

// Create WhatsApp client with local authentication
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "amd-solutions-007"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// QR Code event
client.on('qr', (qr) => {
    console.log('\n' + '='.repeat(60));
    console.log('📱 QR CODE READY!');
    console.log('='.repeat(60));
    console.log('\n👇 SCAN THIS WITH WHATSAPP:');
    console.log('\n   1. Open WhatsApp on borrowed phone');
    console.log('   2. Tap Menu (⋮) → Linked Devices');
    console.log('   3. Tap "Link a Device"');
    console.log('   4. Point camera at this screen:');
    console.log('\n' + '-'.repeat(60) + '\n');
    
    // Display QR code in terminal
    qrcode.generate(qr, { small: true });
    
    console.log('\n' + '-'.repeat(60));
    console.log('\n⏳ Waiting for scan...');
    console.log('   (QR code expires in 60 seconds - will regenerate)\n');
});

// Authentication successful
client.on('authenticated', () => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ AUTHENTICATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n🎉 WhatsApp is now linked to this terminal!');
    console.log('   Session saved - no QR code needed next time');
});

// Ready event
client.on('ready', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 WHATSAPP CLIENT READY!');
    console.log('='.repeat(60));
    
    // Get account info
    const info = client.info;
    console.log('\n📱 Account Information:');
    console.log('   Phone: ' + info.wid.user);
    console.log('   Name: ' + info.pushname);
    console.log('   Platform: ' + info.platform);
    
    // Get contacts count
    const contacts = await client.getContacts();
    console.log('\n👥 Contacts: ' + contacts.length + ' total');
    
    console.log('\n✅ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Authentication saved ✅');
    console.log('   2. Close this window');
    console.log('   3. Run: node whatsapp_terminal.js');
    console.log('   4. Start sending broadcasts!');
    console.log('\n💰 Your thousands of contacts = ₦50M revenue!');
    console.log('='.repeat(60) + '\n');
    
    // Close after showing info
    setTimeout(() => {
        console.log('⏸️  Disconnecting...\n');
        client.destroy();
        process.exit(0);
    }, 3000);
});

// Error handling
client.on('auth_failure', (msg) => {
    console.error('\n❌ AUTHENTICATION FAILED:', msg);
    console.log('\n💡 Try again:');
    console.log('   - Make sure phone has internet');
    console.log('   - Scan QR code within 60 seconds');
    console.log('   - Use official WhatsApp app\n');
    process.exit(1);
});

client.on('disconnected', (reason) => {
    console.log('\n⚠️  Disconnected:', reason);
    console.log('   Session saved - you can reconnect anytime\n');
});

// Initialize client
console.log('⏳ Loading WhatsApp Web...\n');
client.initialize();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Stopping...\n');
    client.destroy();
    process.exit(0);
});
