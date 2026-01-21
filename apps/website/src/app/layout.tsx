import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { SnapPixel } from '@/components/SnapPixel'

export const metadata: Metadata = {
  title:
    'AMD SOLUTIONS 007 | Best AI Company Nigeria | Software Developers Abuja | Web Design Port Harcourt | AI Developer Lagos',
  description:
    'National dominance in Nigeria: AI developers in Lagos, software engineers in Abuja, web design in Port Harcourt, and enterprise automation nationwide. AMD Solutions 007 delivers custom software, AI copilots, and conversion-focused web platforms.',
  metadataBase: new URL('https://www.amdsolutions007.com'),
  keywords: [
    'Best AI Company Nigeria',
    'Software Developers Abuja',
    'Web Design Port Harcourt',
    'AI Developer Lagos',
    'Enterprise Automation Nigeria',
    'AMD Solutions 007',
    'Software Agency Nigeria',
    'Web Development Nigeria',
    'Custom Software Engineering',
    'Media Engineering',
  ],
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
    title:
      'AMD SOLUTIONS 007 | Best AI Company Nigeria | Software Developers Abuja | Web Design Port Harcourt | AI Developer Lagos',
    description:
      'Nigeria-wide software and AI delivery: enterprise automation, AI developers in Lagos, software teams in Abuja, and web design in Port Harcourt. AMD Solutions 007 leads national digital transformation.',
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
    title:
      'AMD SOLUTIONS 007 | Best AI Company Nigeria | Software Developers Abuja | Web Design Port Harcourt | AI Developer Lagos',
    description:
      'Growth systems, AI, and enterprise automation across Lagos, Abuja, and Port Harcourt. AMD Solutions 007 for national-scale software and web development.',
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
