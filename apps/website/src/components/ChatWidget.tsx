"use client"

import type { KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const isSendingDisabled = loading || !input.trim()

  const avatar = useMemo(() => '🤖', [])

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        throw new Error('Chat request failed')
      }

      const data = await res.json()
      const reply: ChatMessage = {
        id: `${Date.now()}-agent`,
        sender: 'agent',
        text: data.reply || 'No response received.',
      }

      setMessages((prev) => [...prev, reply])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          sender: 'agent',
          text: 'System is busy. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isSendingDisabled) {
        sendMessage()
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-yellow-500/40 bg-black/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-yellow-500/30 px-4 py-3 text-sm font-semibold text-yellow-200">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-lg">{avatar}</span>
              AMD Agent 007
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-100 transition hover:border-yellow-400 hover:bg-yellow-500/20"
            >
              Close
            </button>
          </div>

          <div ref={scrollRef} className="max-h-80 space-y-3 overflow-y-auto px-4 py-3 text-sm text-yellow-50">
            {messages.length === 0 && (
              <div className="rounded-lg border border-dashed border-yellow-500/30 bg-yellow-500/5 px-3 py-4 text-yellow-100/80">
                Ask me anything about AMD Solutions 007. I reply in real time.
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-yellow-200/70">
                <span className="h-2 w-2 animate-ping rounded-full bg-yellow-400" />
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-yellow-500/20 p-3">
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Type a message..."
                className="w-full resize-none bg-transparent text-sm text-yellow-50 placeholder-yellow-100/40 outline-none"
              />
              <div className="flex items-center justify-between pt-2 text-xs text-yellow-200/70">
                <span>Realtime Intel</span>
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={isSendingDisabled}
                  className="rounded-md border border-yellow-500/50 bg-yellow-500 text-black px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 hover:border-yellow-400"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-600 to-yellow-400 text-2xl font-black text-black shadow-[0_10px_40px_rgba(234,179,8,0.35)] transition hover:scale-105 hover:shadow-[0_16px_50px_rgba(234,179,8,0.45)]"
      >
        <span className="absolute inset-0 rounded-full border border-yellow-200/60 opacity-50" />
        007
      </button>
    </div>
  )
}
