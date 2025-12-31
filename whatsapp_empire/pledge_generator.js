/**
 * 🌊 LITTLE DROP PLEDGE GENERATOR
 * Generates personalized digital certificates for users who commit to the ₦100/day challenge
 * 
 * Usage: node pledge_generator.js "John Doe"
 * Output: pledge_certificates/john_doe_pledge.png
 */

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    width: 1200,
    height: 800,
    outputDir: './pledge_certificates',
    backgroundColor: '#1a365d', // Deep ocean blue
    accentColor: '#4fd1c5', // Aqua (water drop color)
    textColor: '#ffffff',
    signatureColor: '#ffd700', // Gold for CEO signature
};

/**
 * Generate a personalized pledge certificate
 * @param {string} userName - The name of the person making the pledge
 * @returns {string} - Path to the generated certificate
 */
async function generatePledgeCertificate(userName) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Create canvas
    const canvas = createCanvas(CONFIG.width, CONFIG.height);
    const ctx = canvas.getContext('2d');

    // Background gradient (ocean depth effect)
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, '#0f2027');    // Dark blue-black (deep ocean)
    gradient.addColorStop(0.5, '#203a43');  // Mid ocean
    gradient.addColorStop(1, '#2c5364');    // Lighter ocean surface
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    // Decorative border
    ctx.strokeStyle = CONFIG.accentColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, CONFIG.width - 60, CONFIG.height - 60);
    
    // Inner decorative line
    ctx.strokeStyle = CONFIG.signatureColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, CONFIG.width - 100, CONFIG.height - 100);

    // Water drop icon (symbolic)
    drawWaterDrop(ctx, CONFIG.width / 2, 120, CONFIG.accentColor);

    // Title: "LITTLE DROP 💧 MIGHTY OCEAN"
    ctx.fillStyle = CONFIG.accentColor;
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LITTLE DROP 💧 MIGHTY OCEAN', CONFIG.width / 2, 220);

    // Subtitle: "PLEDGE OF COMMITMENT"
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = 'italic 32px Arial';
    ctx.fillText('Pledge of Commitment', CONFIG.width / 2, 270);

    // Decorative line
    ctx.strokeStyle = CONFIG.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 290);
    ctx.lineTo(900, 290);
    ctx.stroke();

    // Main pledge text
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    
    const pledgeText = [
        'I solemnly pledge to:',
        '',
        `Save my "Little Drop" every single day`,
        'Build my Mighty Ocean with discipline',
        'Break the cycle of poverty in my family',
        'Teach this wisdom to my children',
    ];

    let yPosition = 350;
    pledgeText.forEach((line, index) => {
        if (index === 0) {
            ctx.font = 'bold 28px Arial';
        } else if (line === '') {
            yPosition += 10; // Small gap
            return;
        } else {
            ctx.font = '26px Arial';
        }
        ctx.fillText(line, CONFIG.width / 2, yPosition);
        yPosition += 45;
    });

    // User's name (highlighted)
    yPosition += 20;
    ctx.fillStyle = CONFIG.signatureColor;
    ctx.font = 'bold 40px Arial';
    ctx.fillText(`— ${userName} —`, CONFIG.width / 2, yPosition);

    // Date
    yPosition += 50;
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = 'italic 24px Arial';
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    ctx.fillText(`Date: ${today}`, CONFIG.width / 2, yPosition);

    // CEO signature section
    yPosition += 60;
    ctx.strokeStyle = CONFIG.accentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(400, yPosition);
    ctx.lineTo(800, yPosition);
    ctx.stroke();

    yPosition += 35;
    ctx.fillStyle = CONFIG.signatureColor;
    ctx.font = 'italic bold 28px Arial';
    ctx.fillText('Olawale Shoyemi', CONFIG.width / 2, yPosition);

    yPosition += 30;
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = '20px Arial';
    ctx.fillText('Author & Founder, Little Drop Movement', CONFIG.width / 2, yPosition);

    // Footer tagline
    yPosition += 50;
    ctx.fillStyle = CONFIG.accentColor;
    ctx.font = 'italic 22px Arial';
    ctx.fillText('"A little drop, consistently applied, becomes a mighty ocean."', CONFIG.width / 2, yPosition);

    // Save to file
    const sanitizedName = userName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const filename = `${sanitizedName}_pledge_${Date.now()}.png`;
    const filepath = path.join(CONFIG.outputDir, filename);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Certificate generated: ${filepath}`);
    return filepath;
}

/**
 * Draw a water drop icon
 */
function drawWaterDrop(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.quadraticCurveTo(x + 30, y - 20, x + 30, y + 10);
    ctx.quadraticCurveTo(x + 30, y + 40, x, y + 50);
    ctx.quadraticCurveTo(x - 30, y + 40, x - 30, y + 10);
    ctx.quadraticCurveTo(x - 30, y - 20, x, y - 40);
    ctx.fill();
    
    // Highlight (makes it look 3D)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x - 8, y - 10, 12, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Integration with WhatsApp Bot
 * This function is called when user completes the pledge form
 */
async function sendPledgeCertificateViaWhatsApp(chat, userName) {
    try {
        // Generate certificate
        const certificatePath = await generatePledgeCertificate(userName);
        
        // Send certificate as image
        const media = MessageMedia.fromFilePath(certificatePath);
        await chat.sendMessage(media, {
            caption: `🌊 *CONGRATULATIONS, ${userName.toUpperCase()}!*\n\n` +
                    `You've just made one of the most important decisions of your life.\n\n` +
                    `Your "Little Drop 💧 Mighty Ocean" journey begins TODAY.\n\n` +
                    `📖 *Next Step:*\n` +
                    `Download your FREE e-book: amdsolutions007.com/littledrop\n\n` +
                    `💬 *Join the Community:*\n` +
                    `WhatsApp: +234 818 002 1007\n\n` +
                    `📊 *Track Your Progress:*\n` +
                    `Use the 365-Day Worksheet in the e-book.\n\n` +
                    `Remember: Day 1 is the hardest. Day 30 is the breakthrough. Day 365 is freedom.\n\n` +
                    `We're with you every drop of the way. 💧🌊\n\n` +
                    `— Olawale Shoyemi`
        });

        // Send the e-book PDF
        const ebookPath = './assets/LITTLE_DROP_EBOOK.pdf';
        if (fs.existsSync(ebookPath)) {
            const ebookMedia = MessageMedia.fromFilePath(ebookPath);
            await chat.sendMessage(ebookMedia, {
                caption: `📖 *Your FREE E-Book: "Little Drop 💧 Mighty Ocean"*\n\n` +
                        `This is your complete guide to:\n` +
                        `✅ Saving ₦100/day (or your local equivalent)\n` +
                        `✅ Building ₦730k over 20 years\n` +
                        `✅ Creating generational wealth\n` +
                        `✅ Breaking poverty's grip forever\n\n` +
                        `Read it. Apply it. Transform your life. 🌊`
            });
        }

        console.log(`✅ Pledge package sent to ${userName}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending pledge certificate:`, error);
        return false;
    }
}

// CLI usage
if (require.main === module) {
    const userName = process.argv[2];
    
    if (!userName) {
        console.error('❌ Usage: node pledge_generator.js "John Doe"');
        process.exit(1);
    }

    generatePledgeCertificate(userName)
        .then(filepath => {
            console.log(`✅ Certificate saved: ${filepath}`);
            console.log(`\n🎯 Next steps:`);
            console.log(`1. Open: ${filepath}`);
            console.log(`2. Send to user via WhatsApp`);
            console.log(`3. Follow up with e-book PDF`);
        })
        .catch(error => {
            console.error('❌ Error generating certificate:', error);
            process.exit(1);
        });
}

module.exports = {
    generatePledgeCertificate,
    sendPledgeCertificateViaWhatsApp
};

/**
 * INSTALLATION INSTRUCTIONS:
 * 
 * 1. Install dependencies:
 *    npm install canvas
 * 
 * 2. Test the generator:
 *    node pledge_generator.js "Titi Olawale"
 * 
 * 3. Integrate with broadcast_engine.js:
 *    - Import this module
 *    - Call sendPledgeCertificateViaWhatsApp() when user types "I pledge" or completes form
 * 
 * 4. Customize:
 *    - Change colors in CONFIG object
 *    - Add custom fonts (use registerFont() at top)
 *    - Modify certificate text
 * 
 * OUTPUT:
 * - Generates 1200x800px PNG certificate
 * - Saves to ./pledge_certificates/ folder
 * - Returns file path for WhatsApp sending
 */
