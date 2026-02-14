import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/amd-intelligence';

// Switch to Node.js runtime for better OpenAI SDK compatibility
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    // Check API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error('[AI Assistant] OPENAI_API_KEY not configured');
      return NextResponse.json(
        { 
          error: 'AI configuration missing',
          fallback: 'For immediate assistance: 📧 ceo@amdsolutions007.com | 📞 +234 818 002 1007'
        },
        { status: 500 }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('[AI Assistant] Processing question:', message);

    // Call OpenAI with AMD knowledge base
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More reliable and faster
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const response = completion.choices[0].message.content;
    
    console.log('[AI Assistant] Response generated successfully');

    return NextResponse.json({ response });
  } catch (error) {
    console.error('[AI Assistant] Error:', error);
    return NextResponse.json(
      { 
        error: 'AI temporarily unavailable',
        fallback: 'For immediate assistance: 📧 ceo@amdsolutions007.com | 📞 +234 818 002 1007'
      },
      { status: 500 }
    );
  }
}
