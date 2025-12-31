/**
 * 🌊 LITTLE DROP BOOK COVER GENERATOR
 * Creates professional 1600x2560px book cover for Amazon KDP
 * 
 * Usage: node cover_generator.js
 * Output: LITTLE_DROP_COVER.png
 */

const { createCanvas } = require('canvas');
const fs = require('fs');

// Configuration
const CONFIG = {
    width: 1600,
    height: 2560,
    outputFile: './LITTLE_DROP_COVER.png',
    backgroundColor: '#0f2027', // Deep ocean black-blue
    accentColor: '#4fd1c5', // Aqua (water drop color)
    titleColor: '#ffffff', // White
    subtitleColor: '#ffd700', // Gold
    authorColor: '#ffffff', // White
};

/**
 * Draw water drop icon (enhanced version)
 */
function drawWaterDrop(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    
    // Main drop shape
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x + size * 0.75, y - size * 0.5, x + size * 0.75, y + size * 0.25);
    ctx.quadraticCurveTo(x + size * 0.75, y + size, x, y + size * 1.25);
    ctx.quadraticCurveTo(x - size * 0.75, y + size, x - size * 0.75, y + size * 0.25);
    ctx.quadraticCurveTo(x - size * 0.75, y - size * 0.5, x, y - size);
    ctx.fill();
    
    // Highlight (3D effect)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.25, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x + size * 0.15, y + size * 0.15, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Draw ripple effect (water waves)
 */
function drawRipples(ctx, x, y, count, maxRadius, color) {
    ctx.save();
    for (let i = 0; i < count; i++) {
        const radius = maxRadius * (i + 1) / count;
        const alpha = 0.3 * (1 - (i / count));
        
        ctx.strokeStyle = `rgba(79, 209, 197, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * Draw decorative wave pattern at bottom
 */
function drawWavePattern(ctx, y, amplitude, frequency, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.3;
    
    ctx.beginPath();
    for (let x = 0; x <= CONFIG.width; x += 5) {
        const waveY = y + Math.sin((x / CONFIG.width) * Math.PI * frequency) * amplitude;
        if (x === 0) {
            ctx.moveTo(x, waveY);
        } else {
            ctx.lineTo(x, waveY);
        }
    }
    ctx.stroke();
    ctx.restore();
}

/**
 * Generate the book cover
 */
function generateCover() {
    console.log('🎨 Generating book cover...');
    
    // Create canvas
    const canvas = createCanvas(CONFIG.width, CONFIG.height);
    const ctx = canvas.getContext('2d');
    
    // Background gradient (ocean depth)
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    gradient.addColorStop(0, '#0f2027');    // Deep ocean (top)
    gradient.addColorStop(0.4, '#203a43');  // Mid ocean
    gradient.addColorStop(0.7, '#2c5364');  // Lighter ocean
    gradient.addColorStop(1, '#1a365d');    // Surface (bottom)
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    
    // Add subtle texture (dots pattern)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * CONFIG.width;
        const y = Math.random() * CONFIG.height;
        const radius = Math.random() * 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Decorative border
    ctx.strokeStyle = CONFIG.accentColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, CONFIG.width - 120, CONFIG.height - 120);
    
    // Inner shadow border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(75, 75, CONFIG.width - 150, CONFIG.height - 150);
    
    // Large water drop at top
    const dropX = CONFIG.width / 2;
    const dropY = 500;
    const dropSize = 200;
    
    // Ripples around drop
    drawRipples(ctx, dropX, dropY + dropSize + 80, 6, 300, CONFIG.accentColor);
    
    // Main water drop
    drawWaterDrop(ctx, dropX, dropY, dropSize, CONFIG.accentColor);
    
    // Glow effect around drop
    ctx.save();
    const glowGradient = ctx.createRadialGradient(dropX, dropY, dropSize * 0.5, dropX, dropY, dropSize * 2);
    glowGradient.addColorStop(0, 'rgba(79, 209, 197, 0.3)');
    glowGradient.addColorStop(1, 'rgba(79, 209, 197, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    ctx.restore();
    
    // Title: "LITTLE DROP 💧 MIGHTY OCEAN"
    ctx.fillStyle = CONFIG.titleColor;
    ctx.font = 'bold 140px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    
    // Split title into two lines
    ctx.fillText('LITTLE DROP 💧', CONFIG.width / 2, 950);
    ctx.fillText('MIGHTY OCEAN', CONFIG.width / 2, 1120);
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Decorative line under title
    ctx.strokeStyle = CONFIG.accentColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(350, 1160);
    ctx.lineTo(1250, 1160);
    ctx.stroke();
    
    // Small water drops around the line
    for (let i = 0; i < 5; i++) {
        const x = 350 + (900 / 4) * i;
        drawWaterDrop(ctx, x, 1160, 15, CONFIG.accentColor);
    }
    
    // Subtitle: "The ₦1,000 Daily Blueprint for Dominion"
    ctx.fillStyle = CONFIG.subtitleColor;
    ctx.font = 'italic 70px Arial';
    ctx.textAlign = 'center';
    
    // Split subtitle into two lines for readability
    ctx.fillText('The ₦1,000 Daily Blueprint', CONFIG.width / 2, 1350);
    ctx.fillText('for Dominion', CONFIG.width / 2, 1450);
    
    // Key promise (hook)
    ctx.fillStyle = CONFIG.accentColor;
    ctx.font = 'bold 55px Arial';
    ctx.fillText('₦100/day × 20 years = ₦730,000+', CONFIG.width / 2, 1600);
    
    // Secondary hook
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 45px Arial';
    ctx.fillText('Breaking Poverty, One Drop at a Time', CONFIG.width / 2, 1700);
    
    // Wave pattern at bottom
    drawWavePattern(ctx, 1900, 40, 3, CONFIG.accentColor);
    drawWavePattern(ctx, 1950, 30, 4, CONFIG.accentColor);
    
    // Author name (prominent)
    ctx.fillStyle = CONFIG.authorColor;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.fillText('OLAWALE SHOYEMI', CONFIG.width / 2, 2100);
    
    ctx.shadowBlur = 0;
    
    // Author tagline
    ctx.fillStyle = CONFIG.accentColor;
    ctx.font = 'italic 45px Arial';
    ctx.fillText('Father • Engineer • Wealth Architect', CONFIG.width / 2, 2200);
    
    // Bottom decorative element (small drops)
    const bottomY = 2350;
    for (let i = 0; i < 7; i++) {
        const x = 300 + (1000 / 6) * i;
        const size = 20 + Math.random() * 15;
        drawWaterDrop(ctx, x, bottomY, size, `rgba(79, 209, 197, ${0.3 + Math.random() * 0.4})`);
    }
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(CONFIG.outputFile, buffer);
    
    console.log(`✅ Book cover generated: ${CONFIG.outputFile}`);
    console.log(`📐 Dimensions: ${CONFIG.width}x${CONFIG.height}px (Amazon KDP ready)`);
    console.log(`📁 File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    return CONFIG.outputFile;
}

// Run the generator
if (require.main === module) {
    try {
        generateCover();
        console.log('\n🎯 Next steps:');
        console.log('1. Preview: open LITTLE_DROP_COVER.png');
        console.log('2. Upload to Amazon KDP (Kindle eBook section)');
        console.log('3. Verify dimensions: 1600×2560px ✓');
    } catch (error) {
        console.error('❌ Error generating cover:', error);
        process.exit(1);
    }
}

module.exports = { generateCover };

/**
 * DESIGN NOTES:
 * 
 * ✅ Amazon KDP Requirements Met:
 * - Size: 1600×2560 pixels (eBook cover standard)
 * - Aspect ratio: 1:1.6 (perfect for Kindle)
 * - Format: PNG (high quality)
 * - File size: Under 50MB (typically 2-4MB)
 * - Text readable at thumbnail size
 * 
 * 🎨 Visual Hierarchy:
 * 1. Water drop (attention grabber)
 * 2. Title (brand identity)
 * 3. Subtitle (value proposition)
 * 4. Key promise (credibility)
 * 5. Author (authority)
 * 
 * 🌊 Ocean Theme Elements:
 * - Deep blue gradient (ocean depth)
 * - Aqua accent color (water drop)
 * - Ripple effects (expansion)
 * - Wave patterns (flow)
 * - Subtle texture (water surface)
 * 
 * 💡 Psychological Triggers:
 * - Gold subtitle (wealth aspiration)
 * - White title (clarity, purity)
 * - Large drop (focus, singular action)
 * - Ripples (impact, expansion)
 * - Math promise (proof, credibility)
 */
