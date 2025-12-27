import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { SnapPixel } from '@/components/SnapPixel'

export const metadata: Metadata = {
  title: 'AMD SOLUTIONS 007 | Illuminating the Digital Dark',
  description: 'Growth Systems built with custom software and media engineering.',
  metadataBase: new URL('https://www.amdsolutions007.com'),
  icons: {
    icon: '/amd_logo.png',
    apple: '/amd_logo.png',
    shortcut: '/amd_logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.amdsolutions007.com',
    siteName: 'AMD SOLUTIONS 007',
    title: 'AMD SOLUTIONS 007 | Illuminating the Digital Dark',
    description: 'Growth Systems built with custom software and media engineering.',
    images: [
      {
        url: '/amd_logo.png',
        width: 1200,
        height: 630,
        alt: 'AMD SOLUTIONS 007 - Gold Globe Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AMD SOLUTIONS 007 | Illuminating the Digital Dark',
    description: 'Growth Systems built with custom software and media engineering.',
    images: ['/amd_logo.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AMD SOLUTIONS 007',
  },
  verification: {
    google: '8mOnaKYRdc2Aiy6Zb9bJMShkX04UJd5r5Z2H5s_1QkA',
  },
  other: {
    'p:domain_verify': '1e730a03ff00d10a0f86e5f9e0ec6c48',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <SnapPixel />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
