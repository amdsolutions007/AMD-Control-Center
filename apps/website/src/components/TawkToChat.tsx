'use client'

import { useEffect } from 'react'

export function TawkToChat() {
  useEffect(() => {
    // Tawk.to live chat widget
    // Sign up at https://www.tawk.to/ to get your property ID
    const TAWK_PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || ''
    const TAWK_WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || 'default'

    if (!TAWK_PROPERTY_ID) {
      return
    }

    // Load exactly one Tawk.to script instance.
    const existingScript = document.getElementById('amd-tawk-embed')
    if (existingScript) return

    const script = document.createElement('script')
    script.id = 'amd-tawk-embed'
    script.async = true
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    // Track Tawk.to events in Google Analytics
    ;(window as any).Tawk_API = (window as any).Tawk_API || {}
    ;(window as any).Tawk_LoadStart = new Date()

    // Track when chat is opened
    ;(window as any).Tawk_API.onChatMaximized = function() {
      if (typeof (window as any).gtag !== 'undefined') {
        ;(window as any).gtag('event', 'chat_opened', {
          event_category: 'engagement',
          event_label: 'tawk_chat_opened',
          value: 1,
        })
      }
    }

    // Track when message is sent
    ;(window as any).Tawk_API.onChatMessageVisitor = function(message: string) {
      if (typeof (window as any).gtag !== 'undefined') {
        ;(window as any).gtag('event', 'chat_message_sent', {
          event_category: 'engagement',
          event_label: 'tawk_message_sent',
          value: 1,
        })
      }
    }

    document.body.appendChild(script)

    return undefined
  }, [])

  return null // This component only loads the script
}
