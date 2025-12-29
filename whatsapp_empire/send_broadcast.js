#!/usr/bin/env node
/**
 * Quick Broadcast Script
 * Send broadcast message from command line
 * 
 * Usage: node send_broadcast.js [count] [message]
 * Example: node send_broadcast.js 50 "Check out our new AI services!"
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 10;
const customMessage = args.slice(1).join(' ');

console.log('\n' + '='.repeat(60));
console.log('📢 WHATSAPP BROADCAST AUTOMATION');
console.log('='.repeat(60));
console.log(`\n📊 Target: ${count} contacts`);
console.log(`💬 Message: ${customMessage || 'Default template'}\n`);

// Default message template
const defaultTemplate = `Hi {name}! 👋

Quick update from AMD Solutions 007:

We just helped a Lagos company generate ₦180M through AI automation.

Want to see if we can do the same for your business?

Reply "YES" for a free 15-min consultation.

- Olawale
CEO, AMD Solutions 007
📞 0818 002 1007
www.amdsolutions007.com`;

const messageTemplate = customMessage || defaultTemplate;

// Create client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "amd-solutions-007"
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('ready', async () => {
    console.log('✅ Connected to WhatsApp\n');
    console.log('⏳ Loading contacts...');
    
    const allContacts = await client.getContacts();
    const contacts = allContacts
        .filter(c => !c.isGroup && c.isMyContact)
        .slice(0, count);
    
    console.log(`✅ Loaded ${contacts.length} contacts\n`);
    console.log('='.repeat(60));
    console.log('📤 SENDING BROADCAST');
    console.log('='.repeat(60) + '\n');
    
    let sent = 0;
    let failed = 0;
    const results = [];
    
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const name = contact.pushname || contact.name || 'there';
        
        try {
            // Personalize message
            const personalizedMsg = messageTemplate
                .replace(/{name}/g, name)
                .replace(/{number}/g, contact.number);
            
            // Send message
            await client.sendMessage(contact.id._serialized, personalizedMsg);
            
            console.log(`✅ [${i + 1}/${contacts.length}] Sent to ${name}`);
            sent++;
            
            results.push({
                name: name,
                number: contact.number,
                status: 'sent',
                timestamp: new Date().toISOString()
            });
            
            // Wait 30 seconds between messages (avoid spam detection)
            if (i < contacts.length - 1) {
                process.stdout.write('   ⏳ Waiting 30 seconds...');
                await new Promise(resolve => setTimeout(resolve, 30000));
                process.stdout.write(' Done!\n');
            }
            
        } catch (error) {
            console.log(`❌ [${i + 1}/${contacts.length}] Failed: ${name} - ${error.message}`);
            failed++;
            
            results.push({
                name: name,
                number: contact.number,
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Save results
    const reportFile = `broadcast_report_${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BROADCAST COMPLETE!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully sent: ${sent}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success rate: ${((sent / contacts.length) * 100).toFixed(1)}%`);
    console.log(`📄 Report saved: ${reportFile}`);
    console.log('='.repeat(60) + '\n');
    
    console.log('💰 Expected responses: ' + Math.floor(sent * 0.1) + ' - ' + Math.floor(sent * 0.15));
    console.log('💼 Expected deals: ' + Math.floor(sent * 0.02) + ' - ' + Math.floor(sent * 0.05));
    console.log('💵 Expected revenue: ₦' + (Math.floor(sent * 0.02) * 1500000).toLocaleString() + ' - ₦' + (Math.floor(sent * 0.05) * 1500000).toLocaleString());
    console.log('\n🚀 Let the responses roll in!\n');
    
    // Close
    await client.destroy();
    process.exit(0);
});

client.on('auth_failure', () => {
    console.log('\n❌ Authentication failed!');
    console.log('💡 Run: node whatsapp_auth.js first\n');
    process.exit(1);
});

// Initialize
console.log('⏳ Connecting...\n');
client.initialize();
