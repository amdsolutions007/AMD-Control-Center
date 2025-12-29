#!/usr/bin/env node
/**
 * WhatsApp Terminal Client
 * Main interactive terminal interface
 * 
 * Usage: node whatsapp_terminal.js
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const readline = require('readline');
const fs = require('fs');

console.log('\n' + '='.repeat(60));
console.log('📱 WHATSAPP TERMINAL CLIENT - AMD SOLUTIONS 007');
console.log('='.repeat(60) + '\n');

// Create WhatsApp client
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

let isReady = false;
let contactsCache = [];

// Ready event
client.on('ready', async () => {
    isReady = true;
    const info = client.info;
    
    console.log('✅ Connected as: ' + info.pushname);
    console.log('📞 Phone: +' + info.wid.user);
    
    // Load contacts
    console.log('\n⏳ Loading contacts...');
    contactsCache = await client.getContacts();
    console.log('✅ Loaded ' + contactsCache.length + ' contacts\n');
    
    console.log('='.repeat(60));
    showMenu();
});

// Incoming message handler
client.on('message', async (message) => {
    const contact = await message.getContact();
    const name = contact.pushname || contact.number;
    
    console.log('\n📩 New message from ' + name + ':');
    console.log('   ' + message.body);
    
    // Auto-reply to inquiries
    const keywords = ['yes', 'interested', 'info', 'price', 'consultation'];
    const messageText = message.body.toLowerCase();
    
    if (keywords.some(keyword => messageText.includes(keyword))) {
        const reply = `Thank you for your interest! 🎉\n\nOne of our AI specialists will contact you within 24 hours.\n\nMeanwhile, check our website: www.amdsolutions007.com\n\n- AMD Solutions 007\n📞 0818 002 1007`;
        
        await message.reply(reply);
        console.log('✅ Auto-replied!');
    }
    
    console.log(''); // Empty line
});

// Show menu
function showMenu() {
    console.log('\n📋 AVAILABLE COMMANDS:');
    console.log('   1. contacts    - List all contacts');
    console.log('   2. search      - Search for contact');
    console.log('   3. send        - Send message to contact');
    console.log('   4. broadcast   - Send broadcast to multiple');
    console.log('   5. export      - Export contacts to CSV');
    console.log('   6. stats       - Show statistics');
    console.log('   7. help        - Show this menu');
    console.log('   8. exit        - Close client\n');
    console.log('='.repeat(60));
    console.log('\nType command and press Enter:\n');
}

// Initialize client
console.log('⏳ Connecting to WhatsApp...\n');
client.initialize();

// Setup readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

rl.prompt();

rl.on('line', async (input) => {
    const command = input.trim().toLowerCase();
    
    if (!isReady && command !== 'exit') {
        console.log('⚠️  Please wait for connection...\n');
        rl.prompt();
        return;
    }
    
    switch(command) {
        case '1':
        case 'contacts':
            await listContacts();
            break;
            
        case '2':
        case 'search':
            await searchContact();
            break;
            
        case '3':
        case 'send':
            await sendMessage();
            break;
            
        case '4':
        case 'broadcast':
            await sendBroadcast();
            break;
            
        case '5':
        case 'export':
            await exportContacts();
            break;
            
        case '6':
        case 'stats':
            await showStats();
            break;
            
        case '7':
        case 'help':
            showMenu();
            break;
            
        case '8':
        case 'exit':
            console.log('\n👋 Closing WhatsApp client...\n');
            await client.destroy();
            process.exit(0);
            break;
            
        default:
            console.log('❌ Unknown command. Type "help" for menu.\n');
    }
    
    rl.prompt();
});

// List contacts
async function listContacts() {
    console.log('\n📇 YOUR CONTACTS (First 50):');
    console.log('-'.repeat(60));
    
    const contacts = contactsCache.filter(c => !c.isGroup && c.isMyContact);
    
    contacts.slice(0, 50).forEach((contact, index) => {
        const name = contact.pushname || contact.name || 'Unknown';
        const number = contact.number;
        console.log(`${index + 1}. ${name} - ${number}`);
    });
    
    console.log('-'.repeat(60));
    console.log(`Total: ${contacts.length} contacts (showing first 50)\n`);
}

// Search contact
async function searchContact() {
    rl.question('\n🔍 Enter name or number to search: ', async (query) => {
        const results = contactsCache.filter(c => {
            const name = (c.pushname || c.name || '').toLowerCase();
            const number = c.number || '';
            return name.includes(query.toLowerCase()) || number.includes(query);
        });
        
        console.log(`\n📋 Found ${results.length} matches:`);
        console.log('-'.repeat(60));
        
        results.slice(0, 20).forEach((contact, index) => {
            const name = contact.pushname || contact.name || 'Unknown';
            console.log(`${index + 1}. ${name} - ${contact.number}`);
        });
        
        console.log('-'.repeat(60) + '\n');
        rl.prompt();
    });
}

// Send message
async function sendMessage() {
    rl.question('\n📱 Enter phone number (e.g., 2348180021007): ', async (number) => {
        rl.question('💬 Enter message: ', async (message) => {
            try {
                const chatId = number.includes('@') ? number : `${number}@c.us`;
                await client.sendMessage(chatId, message);
                console.log('✅ Message sent!\n');
            } catch (error) {
                console.log('❌ Failed to send:', error.message + '\n');
            }
            rl.prompt();
        });
    });
}

// Send broadcast
async function sendBroadcast() {
    console.log('\n📢 BROADCAST MESSAGE');
    console.log('⚠️  This will send to multiple contacts!');
    
    rl.question('\nHow many contacts? (Max 256): ', async (count) => {
        const numContacts = Math.min(parseInt(count) || 10, 256);
        
        rl.question('\n💬 Enter broadcast message: ', async (message) => {
            console.log(`\n⏳ Sending to ${numContacts} contacts...\n`);
            
            const contacts = contactsCache
                .filter(c => !c.isGroup && c.isMyContact)
                .slice(0, numContacts);
            
            let sent = 0;
            let failed = 0;
            
            for (const contact of contacts) {
                try {
                    const personalizedMsg = message
                        .replace('{name}', contact.pushname || 'there')
                        .replace('{number}', contact.number);
                    
                    await client.sendMessage(contact.id._serialized, personalizedMsg);
                    console.log(`✅ Sent to ${contact.pushname || contact.number}`);
                    sent++;
                    
                    // Wait 30 seconds between messages (avoid spam detection)
                    if (sent < numContacts) {
                        await new Promise(resolve => setTimeout(resolve, 30000));
                    }
                } catch (error) {
                    console.log(`❌ Failed: ${contact.pushname || contact.number}`);
                    failed++;
                }
            }
            
            console.log('\n' + '='.repeat(60));
            console.log(`✅ Broadcast complete!`);
            console.log(`   Sent: ${sent}`);
            console.log(`   Failed: ${failed}`);
            console.log('='.repeat(60) + '\n');
            
            rl.prompt();
        });
    });
}

// Export contacts
async function exportContacts() {
    console.log('\n📤 Exporting contacts to CSV...');
    
    const contacts = contactsCache.filter(c => !c.isGroup && c.isMyContact);
    
    let csv = 'Name,Phone,WhatsApp ID\n';
    contacts.forEach(contact => {
        const name = (contact.pushname || contact.name || 'Unknown').replace(',', ' ');
        const number = contact.number || '';
        const id = contact.id._serialized;
        csv += `${name},${number},${id}\n`;
    });
    
    const filename = `whatsapp_contacts_${Date.now()}.csv`;
    fs.writeFileSync(filename, csv);
    
    console.log(`✅ Exported ${contacts.length} contacts to ${filename}\n`);
}

// Show stats
async function showStats() {
    const allContacts = contactsCache;
    const myContacts = allContacts.filter(c => c.isMyContact && !c.isGroup);
    const groups = allContacts.filter(c => c.isGroup);
    const chats = await client.getChats();
    const unread = chats.filter(c => c.unreadCount > 0);
    
    console.log('\n📊 WHATSAPP STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total Contacts: ${myContacts.length}`);
    console.log(`Groups: ${groups.length}`);
    console.log(`Active Chats: ${chats.length}`);
    console.log(`Unread Messages: ${unread.reduce((sum, c) => sum + c.unreadCount, 0)}`);
    console.log('='.repeat(60) + '\n');
}

// Error handling
client.on('auth_failure', () => {
    console.log('\n❌ Authentication failed!');
    console.log('💡 Run: node whatsapp_auth.js to authenticate\n');
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down...\n');
    await client.destroy();
    process.exit(0);
});
