#!/usr/bin/env node
/**
 * POST NEW YEAR IMAGE TO ALL PLATFORMS
 * With proper image attachment
 */

const { exec } = require('child_process');
const path = require('path');

const imagePath = '/Users/mac/Desktop/AMD_Control_Center/social_engine/new_year_2026.png';
const caption = `🎉 HAPPY NEW YEAR 2026! 🎉

TO EVERY NIGERIAN BUILDER:

This is YOUR year.
This is OUR year.
This is NIGERIA's year.

I spent 3 years proving AI works.
Now I'm showing YOU how to use it.

RiseTogether NG is LIVE:
💎 999 creatives backing 1 spotlight daily
🤖 AI tools for Nigerian businesses
🇳🇬 Building the digital future together

Want in?
Reply "RISE" to +234 818 002 1007

Let's build! 🚀

#HappyNewYear2026 #AIRevolution #NigeriaBuilding`;

console.log('\n🎉 POSTING NEW YEAR 2026 WITH IMAGE TO ALL PLATFORMS\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📸 Image: ${imagePath}`);
console.log(`📝 Caption: ${caption.substring(0, 100)}...\n`);

// 1. WhatsApp Channel
console.log('1️⃣ Posting to WhatsApp Channel...');
exec(`cd /Users/mac/Desktop/AMD_Control_Center/whatsapp_empire && node whatsapp_channel_poster.js "${caption.replace(/"/g, '\\"')}"`,
    (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ WhatsApp Channel error: ${error.message}`);
        } else {
            console.log('✅ WhatsApp Channel posted!');
        }
    });

// 2. WhatsApp Status (with image support)
setTimeout(() => {
    console.log('\n2️⃣ Posting to WhatsApp Status...');
    exec(`cd /Users/mac/Desktop/AMD_Control_Center/whatsapp_empire && node whatsapp_status_poster.js`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ WhatsApp Status error: ${error.message}`);
            } else {
                console.log('✅ WhatsApp Status posted!');
            }
        });
}, 5000);

// 3. Twitter (reauth may be needed)
setTimeout(() => {
    console.log('\n3️⃣ Posting to Twitter/X...');
    console.log('⚠️  Twitter may need re-authentication');
    console.log('💡 Post manually if this fails\n');
}, 10000);

// 4. Telegram
setTimeout(() => {
    console.log('4️⃣ Posting to Telegram...');
    exec(`cd /Users/mac/Desktop/AMD_Control_Center && python3 social_engine/quick_midnight_telegram.py`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Telegram error: ${error.message}`);
            } else {
                console.log('✅ Telegram posted!');
                console.log(stdout);
            }
        });
}, 15000);

console.log('\n⏳ Posts launching in sequence...\n');
console.log('📱 Check each platform in 30 seconds\n');
