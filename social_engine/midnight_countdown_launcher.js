#!/usr/bin/env node
/**
 * MIDNIGHT COUNTDOWN POST LAUNCHER
 * Posts New Year 2026 message at exactly midnight
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const POST_3 = `🎉 HAPPY NEW YEAR 2026! 🎉

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

console.log('\n🎊 MIDNIGHT COUNTDOWN LAUNCHER 🎊\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Calculate time until midnight
const now = new Date();
const midnight = new Date(now);
midnight.setHours(24, 0, 0, 0); // Next midnight

const timeUntilMidnight = midnight - now;
const minutesLeft = Math.floor(timeUntilMidnight / 60000);
const secondsLeft = Math.floor((timeUntilMidnight % 60000) / 1000);

console.log(`⏰ Current time: ${now.toLocaleTimeString()}`);
console.log(`🎯 Target: Midnight (00:00:00)`);
console.log(`⏳ Time until launch: ${minutesLeft} min ${secondsLeft} sec\n`);

if (minutesLeft > 60) {
    console.log('⚠️  More than 1 hour until midnight.');
    console.log('💡 Run this script closer to midnight for optimal timing.\n');
    process.exit(0);
}

console.log('📱 Will post to:');
console.log('  1. WhatsApp Channel');
console.log('  2. WhatsApp Status');
console.log('  3. Twitter');
console.log('  4. Telegram\n');

console.log(`⏲️  Scheduled for: ${midnight.toLocaleTimeString()}`);
console.log('🚀 Waiting...\n');

// Schedule the posts
setTimeout(() => {
    console.log('\n🎆 IT\'S MIDNIGHT! LAUNCHING NOW! 🎆\n');
    
    // Post to WhatsApp Channel
    console.log('📢 Posting to WhatsApp Channel...');
    exec(`node ${path.join(__dirname, '../whatsapp_empire/whatsapp_channel_poster.js')} "${POST_3}"`, 
        (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ WhatsApp Channel error: ${error.message}`);
            } else {
                console.log('✅ WhatsApp Channel posted!');
            }
        });
    
    // Post to WhatsApp Status
    setTimeout(() => {
        console.log('📢 Posting to WhatsApp Status...');
        exec(`node ${path.join(__dirname, '../whatsapp_empire/whatsapp_status_poster.js')}`, 
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ WhatsApp Status error: ${error.message}`);
                } else {
                    console.log('✅ WhatsApp Status posted!');
                }
            });
    }, 3000);
    
    // Post to Twitter
    setTimeout(() => {
        console.log('📢 Posting to Twitter...');
        const twitterPost = POST_3.substring(0, 280); // Twitter limit
        const scriptPath = path.join(__dirname, 'quick_midnight_twitter.py');
        fs.writeFileSync(scriptPath, `#!/usr/bin/env python3
import tweepy
from dotenv import load_dotenv
import os

load_dotenv()

client = tweepy.Client(
    bearer_token=os.getenv('TWITTER_BEARER_TOKEN'),
    consumer_key=os.getenv('TWITTER_API_KEY'),
    consumer_secret=os.getenv('TWITTER_API_SECRET'),
    access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
    access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
)

tweet = """${twitterPost}"""

response = client.create_tweet(text=tweet)
print(f"✅ Twitter posted! Tweet ID: {response.data['id']}")
`);
        
        exec(`cd ${path.join(__dirname, '..')} && python3 social_engine/quick_midnight_twitter.py`, 
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Twitter error: ${error.message}`);
                } else {
                    console.log('✅ Twitter posted!');
                }
            });
    }, 6000);
    
    // Post to Telegram
    setTimeout(() => {
        console.log('📢 Posting to Telegram...');
        const scriptPath = path.join(__dirname, 'quick_midnight_telegram.py');
        fs.writeFileSync(scriptPath, `#!/usr/bin/env python3
import asyncio
from telegram import Bot
from dotenv import load_dotenv
import os

load_dotenv()

async def post():
    bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
    channel_id = os.getenv('TELEGRAM_CHAT_ID')
    
    post_text = """${POST_3}"""
    
    result = await bot.send_message(chat_id=channel_id, text=post_text)
    print(f"✅ Telegram posted! Message ID: {result.message_id}")

asyncio.run(post())
`);
        
        exec(`cd ${path.join(__dirname, '..')} && python3 social_engine/quick_midnight_telegram.py`, 
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Telegram error: ${error.message}`);
                } else {
                    console.log('✅ Telegram posted!');
                }
            });
    }, 9000);
    
    console.log('\n🎉 HAPPY NEW YEAR 2026! 🎉');
    console.log('🇳🇬 All posts launched! 🇳🇬\n');
    
}, timeUntilMidnight);

console.log('💤 Script running in background...');
console.log('⚡ DO NOT CLOSE THIS TERMINAL\n');
