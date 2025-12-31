/**
 * 🎙️ LITTLE DROP AUDIOBOOK GENERATOR
 * Generates International Edition Audiobook using OpenAI TTS API
 * 
 * Model: tts-1-hd (High Definition)
 * Voice: onyx (Deep, Authoritative, CEO Tone)
 * Speed: 1.0 (Perfect pacing)
 * 
 * Usage: OPENAI_API_KEY=sk-xxx node audiobook_generator.js
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Configuration
const CONFIG = {
    inputFile: './LITTLE_DROP_AUDIO_SCRIPT.md',
    outputDir: './audiobook_chunks',
    finalOutput: './LITTLE_DROP_AUDIOBOOK_MASTER.mp3',
    model: 'tts-1-hd',
    voice: 'onyx',
    speed: 1.0,
    maxChunkSize: 4096, // OpenAI TTS character limit
};

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY,
});

/**
 * Read and parse the audio script
 */
function readScript(filePath) {
    console.log(`📖 Reading script: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`✅ Script loaded: ${content.length} characters`);
    return content;
}

/**
 * Clean script for TTS (remove markdown, stage directions, etc.)
 */
function cleanScriptForTTS(content) {
    console.log('🧹 Cleaning script for TTS...');
    
    let cleaned = content;
    
    // Remove markdown headers (##, ###)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
    
    // Remove markdown bold/italic markers
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    
    // Remove code blocks and inline code
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    
    // Remove stage directions [MUSIC:...], [SOUND EFFECT:...], [PAUSE...]
    cleaned = cleaned.replace(/\[MUSIC:.*?\]/gi, '');
    cleaned = cleaned.replace(/\[SOUND EFFECT:.*?\]/gi, '');
    cleaned = cleaned.replace(/\*\[.*?\]\*/g, '');
    
    // Remove horizontal rules
    cleaned = cleaned.replace(/^-{3,}$/gm, '');
    cleaned = cleaned.replace(/^={3,}$/gm, '');
    
    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
    
    // Remove multiple empty lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();
    
    console.log(`✅ Cleaned: ${cleaned.length} characters (${content.length - cleaned.length} removed)`);
    return cleaned;
}

/**
 * Split text into chunks that respect sentence boundaries
 */
function splitIntoChunks(text, maxSize) {
    console.log(`✂️ Splitting into chunks (max ${maxSize} characters)...`);
    
    const chunks = [];
    let currentChunk = '';
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/);
    
    for (const paragraph of paragraphs) {
        // If adding this paragraph exceeds max size
        if (currentChunk.length + paragraph.length + 2 > maxSize) {
            // If current chunk has content, save it
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            // If paragraph itself is too long, split by sentences
            if (paragraph.length > maxSize) {
                const sentences = paragraph.split(/(?<=[.!?])\s+/);
                
                for (const sentence of sentences) {
                    if (currentChunk.length + sentence.length + 1 > maxSize) {
                        if (currentChunk.trim()) {
                            chunks.push(currentChunk.trim());
                            currentChunk = '';
                        }
                        
                        // If single sentence is too long, force split
                        if (sentence.length > maxSize) {
                            for (let i = 0; i < sentence.length; i += maxSize) {
                                chunks.push(sentence.slice(i, i + maxSize));
                            }
                        } else {
                            currentChunk = sentence;
                        }
                    } else {
                        currentChunk += (currentChunk ? ' ' : '') + sentence;
                    }
                }
            } else {
                currentChunk = paragraph;
            }
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
    }
    
    // Add remaining chunk
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    console.log(`✅ Split into ${chunks.length} chunks`);
    
    // Log chunk sizes
    chunks.forEach((chunk, i) => {
        console.log(`   Chunk ${i + 1}: ${chunk.length} characters`);
    });
    
    return chunks;
}

/**
 * Generate audio for a single chunk
 */
async function generateAudioChunk(text, chunkIndex, totalChunks) {
    console.log(`🎙️ Generating audio for chunk ${chunkIndex + 1}/${totalChunks}...`);
    
    try {
        const mp3Response = await openai.audio.speech.create({
            model: CONFIG.model,
            voice: CONFIG.voice,
            input: text,
            speed: CONFIG.speed,
        });
        
        // Convert response to buffer
        const buffer = Buffer.from(await mp3Response.arrayBuffer());
        
        // Save to file
        const chunkPath = path.join(CONFIG.outputDir, `chunk_${String(chunkIndex).padStart(4, '0')}.mp3`);
        fs.writeFileSync(chunkPath, buffer);
        
        console.log(`✅ Chunk ${chunkIndex + 1} saved: ${chunkPath} (${(buffer.length / 1024).toFixed(2)} KB)`);
        return chunkPath;
    } catch (error) {
        console.error(`❌ Error generating chunk ${chunkIndex + 1}:`, error.message);
        throw error;
    }
}

/**
 * Combine all audio chunks into one master file
 */
async function combineAudioChunks(chunkPaths, outputPath) {
    console.log(`🔗 Combining ${chunkPaths.length} chunks into master file...`);
    
    // Simple concatenation approach (works for MP3)
    const writeStream = fs.createWriteStream(outputPath);
    
    for (let i = 0; i < chunkPaths.length; i++) {
        console.log(`   Processing chunk ${i + 1}/${chunkPaths.length}...`);
        const chunkBuffer = fs.readFileSync(chunkPaths[i]);
        writeStream.write(chunkBuffer);
    }
    
    writeStream.end();
    
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            const stats = fs.statSync(outputPath);
            console.log(`✅ Master audiobook created: ${outputPath}`);
            console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            resolve(outputPath);
        });
        writeStream.on('error', reject);
    });
}

/**
 * Main audiobook generation function
 */
async function generateAudiobook() {
    console.log('🎬 STARTING AUDIOBOOK GENERATION');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Validate API key
    if (!openai.apiKey) {
        console.error('❌ ERROR: OPENAI_API_KEY not found in environment variables');
        console.error('   Set it with: export OPENAI_API_KEY=sk-xxx');
        console.error('   Or run: OPENAI_API_KEY=sk-xxx node audiobook_generator.js');
        process.exit(1);
    }
    
    try {
        // Step 1: Read script
        const rawScript = readScript(CONFIG.inputFile);
        
        // Step 2: Clean script
        const cleanedScript = cleanScriptForTTS(rawScript);
        
        // Step 3: Split into chunks
        const chunks = splitIntoChunks(cleanedScript, CONFIG.maxChunkSize);
        
        // Step 4: Create output directory
        if (!fs.existsSync(CONFIG.outputDir)) {
            fs.mkdirSync(CONFIG.outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${CONFIG.outputDir}\n`);
        }
        
        // Step 5: Generate audio for each chunk
        console.log(`\n🎙️ GENERATING AUDIO (${chunks.length} chunks)\n`);
        const chunkPaths = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunkPath = await generateAudioChunk(chunks[i], i, chunks.length);
            chunkPaths.push(chunkPath);
            
            // Add delay to avoid rate limiting
            if (i < chunks.length - 1) {
                console.log('   ⏳ Waiting 2 seconds (rate limit protection)...\n');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // Step 6: Combine chunks
        console.log('\n🔗 COMBINING AUDIO CHUNKS\n');
        await combineAudioChunks(chunkPaths, CONFIG.finalOutput);
        
        // Step 7: Summary
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('🎉 AUDIOBOOK GENERATION COMPLETE!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(`📂 Master File: ${CONFIG.finalOutput}`);
        console.log(`🎙️ Voice: ${CONFIG.voice} (Deep, Authoritative)`);
        console.log(`🔊 Model: ${CONFIG.model} (High Definition)`);
        console.log(`📊 Chunks Generated: ${chunks.length}`);
        
        const stats = fs.statSync(CONFIG.finalOutput);
        console.log(`💾 Total Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Estimate duration (rough: 150 words/min, 5 chars/word)
        const totalChars = cleanedScript.length;
        const estimatedWords = totalChars / 5;
        const estimatedMinutes = estimatedWords / 150;
        console.log(`⏱️ Estimated Duration: ${Math.floor(estimatedMinutes / 60)}h ${Math.floor(estimatedMinutes % 60)}m`);
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Listen to: ' + CONFIG.finalOutput);
        console.log('2. Upload to Audible/ACX');
        console.log('3. Distribute via WhatsApp/Website');
        console.log('\n🌊 THE OCEAN HAS A VOICE. 🌊\n');
        
    } catch (error) {
        console.error('\n❌ AUDIOBOOK GENERATION FAILED');
        console.error('═══════════════════════════════════════════════════════════');
        console.error('Error:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    generateAudiobook().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { generateAudiobook };

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Set OpenAI API Key:
 *    export OPENAI_API_KEY=sk-your-key-here
 * 
 * 2. Install dependencies:
 *    npm install openai
 * 
 * 3. Run the generator:
 *    node audiobook_generator.js
 * 
 * 4. Wait for completion (5-15 minutes depending on chunks)
 * 
 * 5. Output:
 *    - audiobook_chunks/chunk_0000.mp3 (individual chunks)
 *    - audiobook_chunks/chunk_0001.mp3
 *    - ...
 *    - LITTLE_DROP_AUDIOBOOK_MASTER.mp3 (final combined file)
 * 
 * TECHNICAL NOTES:
 * 
 * - OpenAI TTS limit: 4096 characters per request
 * - Model: tts-1-hd (highest quality)
 * - Voice: onyx (deep, authoritative, perfect for CEO)
 * - Speed: 1.0 (natural pacing)
 * - Rate limiting: 2-second delay between chunks
 * - Estimated cost: ~$0.015 per 1000 chars = ~$0.60 for 40k chars
 * 
 * AUDIO QUALITY:
 * - Bitrate: 128 kbps (OpenAI default)
 * - Format: MP3
 * - Sample rate: 44.1 kHz
 * - Channels: Mono
 * 
 * SCRIPT CLEANING:
 * - Removes markdown formatting
 * - Removes stage directions [MUSIC:], [PAUSE], etc.
 * - Removes URLs and code blocks
 * - Preserves narrative text only
 * - Maintains natural paragraph breaks
 * 
 * CHUNKING STRATEGY:
 * - Splits by paragraphs first (preserves narrative flow)
 * - Falls back to sentences if paragraph too long
 * - Force splits only if sentence exceeds limit
 * - Ensures no chunk exceeds 4096 characters
 * 
 * COMBINATION METHOD:
 * - Simple buffer concatenation (works for MP3 format)
 * - Preserves audio quality
 * - No re-encoding needed
 * - Fast processing
 */
