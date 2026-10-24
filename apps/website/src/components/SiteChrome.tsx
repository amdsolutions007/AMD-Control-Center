'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ChatWidget } from '@/components/ChatWidget'

export function SiteChrome() {
  const pathname = usePathname()
  const isSmartLinkRoute = pathname === '/sl' || pathname.startsWith('/sl/')

  if (isSmartLinkRoute) {
    return null
  }

  return (
    <>
      <Navbar />
      <ChatWidget />
    </>
  )
}
