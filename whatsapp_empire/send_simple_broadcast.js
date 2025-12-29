const { Client, LocalAuth } = require('whatsapp-web.js');

console.log('============================================================');
console.log('📢 SIMPLE WHATSAPP BROADCAST');
console.log('============================================================\n');

const BROADCAST_MESSAGE = `🚀 AMD SOLUTIONS - Your Tech Partner!

We're here to help you succeed:

📄 CV Analysis & ATS Optimization
💻 Ready-Made Source Code Projects
🚀 Custom Software Development
📚 Tech Consulting

💰 Starting from ₦5,000
⏰ Fast turnaround time
✅ Professional quality guaranteed

📞 WhatsApp: +234 818 002 1007
🔗 https://linktr.ee/amdsolutions007

Reply to this message to get started! 🎯`;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'amd-solutions-007',
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('❌ Session expired! Please run whatsapp_auth.js first\n');
    process.exit(1);
});

client.on('ready', async () => {
    console.log('✅ Connected to WhatsApp\n');
    
    try {
        console.log('📱 Getting your chats...\n');
        
        // Get all chats
        const chats = await client.getChats();
        
        // Filter only private chats (exclude groups and broadcast lists)
        const privateChats = chats.filter(chat => !chat.isGroup && chat.id.server === 'c.us');
        
        console.log(`📊 Found ${privateChats.length} contacts\n`);
        console.log('📤 Sending broadcast messages...\n');
        
        let successCount = 0;
        let failCount = 0;
        
        for (const chat of privateChats.slice(0, 10)) { // Limit to first 10 for safety
            try {
                const contact = await chat.getContact();
                const name = contact.pushname || contact.number;
                
                console.log(`📨 Sending to: ${name}`);
                await chat.sendMessage(BROADCAST_MESSAGE);
                successCount++;
                console.log(`✅ Sent successfully!\n`);
                
                // Wait 3 seconds between messages to avoid spam detection
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                failCount++;
                console.log(`❌ Failed: ${error.message}\n`);
            }
        }
        
        console.log('============================================================');
        console.log(`✅ Broadcast complete!`);
        console.log(`📊 Success: ${successCount} | Failed: ${failCount}`);
        console.log('============================================================\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
});

client.initialize();
