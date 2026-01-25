import { NextResponse } from 'next/server'
import { generateResponse } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const reply = await generateResponse(message)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error', error)
    return NextResponse.json({ error: 'Failed to generate response.' }, { status: 500 })
  }
}
