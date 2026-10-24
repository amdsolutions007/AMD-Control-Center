import { NextResponse } from 'next/server'
import { generateResponse } from '@/lib/openai'

type HistoryItem = {
  sender: 'user' | 'agent'
  text: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const history = Array.isArray(body?.history) ? body.history : []

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    if (message.length > 1200) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    }

    const safeHistory: HistoryItem[] = (history as unknown[])
      .slice(-8)
      .filter(
        (item: unknown): item is HistoryItem =>
          Boolean(
            item &&
              typeof item === 'object' &&
              'sender' in item &&
              'text' in item &&
              (((item as HistoryItem).sender === 'user') || ((item as HistoryItem).sender === 'agent')) &&
              typeof (item as HistoryItem).text === 'string'
          )
      )
      .map((item) => ({
        sender: item.sender,
        text: item.text.slice(0, 1200),
      }))

    const reply = await generateResponse(message, safeHistory)
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error', error)
    return NextResponse.json({ error: 'Failed to generate response.' }, { status: 500 })
  }
}
