#!/usr/bin/env node
/**
 * Export WhatsApp Contacts
 * Exports all contacts to CSV for integration with other systems
 * 
 * Usage: node export_contacts.js
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

console.log('\n' + '='.repeat(60));
console.log('📤 WHATSAPP CONTACTS EXPORT');
console.log('='.repeat(60) + '\n');

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
    console.log('⏳ Fetching all contacts...');
    
    const allContacts = await client.getContacts();
    const contacts = allContacts.filter(c => !c.isGroup && c.isMyContact);
    
    console.log(`✅ Found ${contacts.length} contacts\n`);
    
    // Export to CSV
    console.log('📝 Creating CSV file...');
    let csv = 'Name,Phone,WhatsApp ID,Is Business,Verified\n';
    
    contacts.forEach(contact => {
        const name = (contact.pushname || contact.name || 'Unknown').replace(/,/g, ' ');
        const number = contact.number || '';
        const id = contact.id._serialized;
        const isBusiness = contact.isBusiness || false;
        const isVerified = contact.isEnterprise || false;
        
        csv += `"${name}","${number}","${id}","${isBusiness}","${isVerified}"\n`;
    });
    
    const csvFile = `whatsapp_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(csvFile, csv);
    console.log(`✅ CSV saved: ${csvFile}`);
    
    // Export to SQLite (for integration with broadcast system)
    console.log('\n📊 Updating broadcast database...');
    
    const db = new sqlite3.Database('whatsapp_contacts.db');
    
    db.serialize(() => {
        let imported = 0;
        let updated = 0;
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO contacts (name, phone, company, industry, notes, date_added)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        contacts.forEach(contact => {
            const name = contact.pushname || contact.name || 'Unknown';
            const phone = '+' + contact.number;
            const company = contact.isBusiness ? (contact.name || 'Business') : '';
            const industry = contact.isBusiness ? 'Business' : 'Personal';
            const notes = `WhatsApp contact - ${contact.isEnterprise ? 'Verified' : 'Regular'}`;
            
            stmt.run(name, phone, company, industry, notes, new Date().toISOString(), function(err) {
                if (err) {
                    console.log(`⚠️  Failed to import ${name}`);
                } else if (this.changes > 0) {
                    if (this.lastID) imported++;
                    else updated++;
                }
            });
        });
        
        stmt.finalize(() => {
            db.close();
            
            console.log('✅ Database updated!');
            console.log(`   - New contacts: ${imported}`);
            console.log(`   - Updated: ${updated}`);
            
            // Summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 EXPORT SUMMARY');
            console.log('='.repeat(60));
            console.log(`Total contacts: ${contacts.length}`);
            console.log(`Business accounts: ${contacts.filter(c => c.isBusiness).length}`);
            console.log(`Verified accounts: ${contacts.filter(c => c.isEnterprise).length}`);
            console.log('\n📁 Files created:');
            console.log(`   - ${csvFile} (CSV format)`);
            console.log(`   - whatsapp_contacts.db (SQLite)`);
            console.log('='.repeat(60));
            
            console.log('\n💡 NEXT STEPS:');
            console.log('   1. Use CSV for manual review/import');
            console.log('   2. SQLite integrated with broadcast system');
            console.log('   3. Run: python3 broadcast_system.py');
            console.log('   4. Create campaigns and start sending!\n');
            
            console.log('💰 Your ' + contacts.length + ' contacts = ₦' + (contacts.length * 50000).toLocaleString() + ' potential revenue!\n');
            
            client.destroy();
            process.exit(0);
        });
    });
});

client.on('auth_failure', () => {
    console.log('\n❌ Authentication failed!');
    console.log('💡 Run: node whatsapp_auth.js first\n');
    process.exit(1);
});

console.log('⏳ Connecting...\n');
client.initialize();
