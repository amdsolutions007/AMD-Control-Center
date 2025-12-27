'use client'

import { useEffect, useState } from 'react'

interface PaystackTriggerProps {
  amount: number
  email: string
  onSuccess: (reference: any) => void
  onClose: () => void
}

export function PaystackTrigger({ amount, email, onSuccess, onClose }: PaystackTriggerProps) {
  const [isClient, setIsClient] = useState(false)
  const [PaystackHook, setPaystackHook] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import only on client side
    import('react-paystack').then((mod) => {
      setPaystackHook(() => mod.usePaystackPayment)
    })
  }, [])

  const handleClick = () => {
    if (!isClient || !PaystackHook) return

    const config = {
      reference: `AMD-${new Date().getTime()}`,
      email: email,
      amount: amount * 100, // Convert to kobo
      publicKey: 'pk_live_d8218c1218a96422182241054231248350811277',
    }

    const initializePayment = PaystackHook(config)
    initializePayment({
      onSuccess: onSuccess,
      onClose: onClose,
    })
  }

  if (!isClient || !PaystackHook) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl py-4 font-bold text-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,200,100,0.3)]"
        style={{
          background: 'linear-gradient(to right, #00C87E, #00A868)',
          border: 'none',
          cursor: 'not-allowed',
          opacity: 0.7,
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <span>Loading Paystack...</span>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      className="w-full rounded-xl py-4 font-bold text-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,200,100,0.3)] hover:shadow-[0_4px_30px_rgba(0,200,100,0.5)]"
      style={{
        background: 'linear-gradient(to right, #00C87E, #00A868)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center justify-center gap-3">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Pay with Paystack - ₦{(amount / 100).toLocaleString()}</span>
      </div>
    </button>
  )
}
