'use client'

import { useEffect } from 'react'

export function SnapPixel() {
  useEffect(() => {
    // Official Snapchat Pixel ID
    const pixelId = process.env.NEXT_PUBLIC_SNAP_PIXEL_ID || '7856879a-cb0b-43b7-a2d3-0bb378eebd54'

    // Check if snaptr already exists
    if ((window as any).snaptr) return

    // Snapchat Pixel Base Code - dynamically inject tracking script
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://sc-static.net/scevent.min.js'
    script.onload = () => {
      // Initialize Pixel after script loads
      if (window.snaptr) {
        window.snaptr('init', pixelId, {
          user_email: '__INSERT_USER_EMAIL__'
        })
        // Track Page View
        window.snaptr('track', 'PAGE_VIEW')
      }
    }
    document.head.appendChild(script)

    // Initialize snaptr queue
    ;(window as any).snaptr = function(...args: any[]) {
      if ((window as any).snaptr.handleRequest) {
        (window as any).snaptr.handleRequest.apply((window as any).snaptr, args)
      } else {
        ;((window as any).snaptr.queue = (window as any).snaptr.queue || []).push(args)
      }
    }
  }, [])

  return null
}

// TypeScript declaration for window.snaptr
declare global {
  interface Window {
    snaptr: (command: string, ...args: any[]) => void
  }
}
