import type { Metadata } from 'next'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'AMD Signal Beacon | Curated Technology Briefings',
  description: 'Curated technology, AI and African digital-economy briefings from attributed sources by AMD Solutions 007.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body>{children}</body>
    </html>
  )
}
