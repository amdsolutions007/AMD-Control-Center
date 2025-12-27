'use client'

import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { Footer } from '@/components/footer'
import { PaystackTrigger } from '@/components/PaystackTrigger'

/**
 * AMD SOLUTIONS 007 - GOLD TREASURY PORTAL
 * 
 * Multi-currency checkout interface for global client services
 * Powered by PayPal (International) & Paystack (Nigeria)
 */

type PaymentRegion = 'international' | 'nigeria'

export default function PaymentPage() {
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<PaymentRegion>('international')

  // Service Configuration
  const SERVICE_NAME = 'AMD Digital Consultation & Strategy'
  
  // Pricing
  const USD_AMOUNT = '1000.00'
  const NGN_AMOUNT = '1500000' // ₦1,500,000
  
  const currentAmount = selectedRegion === 'international' ? USD_AMOUNT : NGN_AMOUNT
  const currentCurrency = selectedRegion === 'international' ? 'USD' : 'NGN'
  const currentSymbol = selectedRegion === 'international' ? '$' : '₦'

  // PayPal Configuration
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: 'USD',
    intent: 'capture',
  }

  // Paystack handlers
  const handlePaystackSuccess = (reference: any) => {
    console.log('✅ Paystack Payment Successful!')
    console.log('Transaction Reference:', reference.reference)
    setTransactionId(reference.reference)
    setPaymentSuccess(true)
  }

  const handlePaystackClose = () => {
    console.log('Payment window closed')
  }

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Background Effects */}
      <div className="code-stream" />
      
      {/* Header */}
      <header className="border-b border-[#D4AF37]/20 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="group flex items-center gap-3">
              <div className="text-2xl font-bold tracking-tight" style={{ color: '#D4AF37' }}>
                AMD SOLUTIONS <span style={{ color: '#F4E5B0' }}>007</span>
              </div>
            </a>
            <div className="rounded-lg border px-4 py-2" style={{ borderColor: 'rgba(212, 175, 55, 0.3)', backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
              <span className="text-sm font-medium" style={{ color: '#F4E5B0' }}>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">
        {!paymentSuccess ? (
          <>
            {/* Title Section */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-5xl font-bold tracking-tight" style={{ 
                background: 'linear-gradient(to right, #D4AF37, #F4E5B0, #D4AF37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))'
              }}>
                Gold Treasury Portal
              </h1>
              <p className="text-lg" style={{ color: 'rgba(244, 229, 176, 0.6)' }}>
                Select your region and complete your secure transaction
              </p>
            </div>

            {/* Region Toggle */}
            <div className="mb-10 rounded-2xl border p-2" style={{ 
              borderColor: 'rgba(212, 175, 55, 0.3)',
              background: 'linear-gradient(to bottom right, rgba(212, 175, 55, 0.05), transparent)'
            }}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedRegion('international')}
                  className={`rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                    selectedRegion === 'international'
                      ? 'shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : ''
                  }`}
                  style={{
                    background: selectedRegion === 'international' 
                      ? 'linear-gradient(to right, #D4AF37, #C09C2E)'
                      : 'rgba(212, 175, 55, 0.1)',
                    color: selectedRegion === 'international' ? '#0A0A0A' : '#D4AF37',
                    border: selectedRegion === 'international' ? '2px solid #D4AF37' : '2px solid transparent'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🌍</span>
                    <div className="text-left">
                      <div className="text-sm font-bold">International</div>
                      <div className={`text-xs ${selectedRegion === 'international' ? 'opacity-80' : 'opacity-60'}`}>
                        ${USD_AMOUNT}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedRegion('nigeria')}
                  className={`rounded-xl px-6 py-4 font-semibold transition-all duration-300 ${
                    selectedRegion === 'nigeria'
                      ? 'shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : ''
                  }`}
                  style={{
                    background: selectedRegion === 'nigeria' 
                      ? 'linear-gradient(to right, #D4AF37, #C09C2E)'
                      : 'rgba(212, 175, 55, 0.1)',
                    color: selectedRegion === 'nigeria' ? '#0A0A0A' : '#D4AF37',
                    border: selectedRegion === 'nigeria' ? '2px solid #D4AF37' : '2px solid transparent'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🇳🇬</span>
                    <div className="text-left">
                      <div className="text-sm font-bold">Nigeria</div>
                      <div className={`text-xs ${selectedRegion === 'nigeria' ? 'opacity-80' : 'opacity-60'}`}>
                        ₦{parseInt(NGN_AMOUNT).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Service Details Card */}
            <div className="mb-10 rounded-2xl border p-8 backdrop-blur-sm" style={{
              borderColor: 'rgba(212, 175, 55, 0.3)',
              background: 'linear-gradient(to bottom right, rgba(212, 175, 55, 0.05), transparent)'
            }}>
              <div className="mb-6 flex items-start justify-between border-b pb-6" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                <div>
                  <div className="mb-2 text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>
                    Service
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                    {SERVICE_NAME}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="mb-2 text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>
                    Amount
                  </div>
                  <div className="text-3xl font-bold" style={{ color: '#F4E5B0' }}>
                    {currentSymbol}{selectedRegion === 'nigeria' ? parseInt(currentAmount).toLocaleString() : currentAmount}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(244, 229, 176, 0.5)' }}>{currentCurrency}</div>
                </div>
              </div>

              {/* Service Inclusions */}
              <div className="space-y-3">
                <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>
                  Includes
                </div>
                <ul className="space-y-2" style={{ color: 'rgba(244, 229, 176, 0.8)' }}>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#D4AF37' }}>✓</span>
                    <span>1-Hour Strategic Consultation Session</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#D4AF37' }}>✓</span>
                    <span>Custom Digital Growth Strategy Blueprint</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#D4AF37' }}>✓</span>
                    <span>Technical Implementation Roadmap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#D4AF37' }}>✓</span>
                    <span>30-Day Email Support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Section */}
            <div className="rounded-2xl border bg-ink-900/50 p-8 backdrop-blur-sm" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-xl font-semibold" style={{ color: '#F4E5B0' }}>
                  Complete Your Purchase
                </h3>
                <p className="text-sm" style={{ color: 'rgba(244, 229, 176, 0.6)' }}>
                  {selectedRegion === 'international' ? 'Pay securely with PayPal' : 'Pay with Paystack (Card, Bank Transfer, USSD)'}
                </p>
              </div>

              {/* Payment Provider Integration */}
              <div className="relative">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ink-900/80 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 mx-auto" style={{
                        borderColor: 'rgba(212, 175, 55, 0.2)',
                        borderTopColor: '#D4AF37'
                      }} />
                      <p className="text-sm" style={{ color: 'rgba(244, 229, 176, 0.6)' }}>Processing...</p>
                    </div>
                  </div>
                )}

                {selectedRegion === 'international' ? (
                  /* PayPal Button */
                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal',
                        height: 55,
                      }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              description: SERVICE_NAME,
                              amount: {
                                currency_code: 'USD',
                                value: USD_AMOUNT,
                              },
                            },
                          ],
                        })
                      }}
                      onApprove={async (data, actions) => {
                        setIsLoading(true)
                        try {
                          const details = await actions.order!.capture()
                          const txId = details.id || 'UNKNOWN'
                          
                          console.log('✅ PayPal Payment Successful!')
                          console.log('Transaction ID:', txId)
                          console.log('Payment Details:', details)
                          
                          setTransactionId(txId)
                          setPaymentSuccess(true)
                        } catch (error) {
                          console.error('Payment capture error:', error)
                          alert('Payment processing failed. Please try again.')
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal Error:', err)
                        alert('An error occurred with PayPal. Please try again.')
                      }}
                    />
                  </PayPalScriptProvider>
                ) : (
                  /* Paystack Button */
                  <PaystackTrigger
                    amount={parseInt(NGN_AMOUNT)}
                    email="client@amdsolutions007.com"
                    onSuccess={handlePaystackSuccess}
                    onClose={handlePaystackClose}
                  />
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: 'rgba(244, 229, 176, 0.5)' }}>
                <svg
                  className="h-4 w-4"
                  style={{ color: '#D4AF37' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>
                  {selectedRegion === 'international' 
                    ? 'Secured by PayPal | 256-bit SSL Encryption'
                    : 'Secured by Paystack | PCI DSS Compliant'
                  }
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent p-12 text-center backdrop-blur-sm">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500/30 bg-green-500/10">
                <svg
                  className="h-10 w-10 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="mb-3 text-3xl font-bold text-green-400">
              Payment Successful!
            </h2>
            <p className="mb-6 text-lg text-green-100/70">
              Your transaction has been processed securely
            </p>

            {/* Transaction Details */}
            <div className="mb-8 rounded-lg border border-green-500/20 bg-green-500/5 p-6">
              <div className="mb-2 text-sm font-medium uppercase tracking-wider text-green-400/70">
                Transaction ID
              </div>
              <div className="break-all font-mono text-sm text-green-300">
                {transactionId}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8 rounded-lg border p-6 text-left" style={{
              borderColor: 'rgba(212, 175, 55, 0.2)',
              backgroundColor: 'rgba(212, 175, 55, 0.05)'
            }}>
              <h3 className="mb-4 text-lg font-semibold" style={{ color: '#F4E5B0' }}>
                What Happens Next?
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(244, 229, 176, 0.8)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#D4AF37' }}>1.</span>
                  <span>You'll receive a confirmation email within 5 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#D4AF37' }}>2.</span>
                  <span>Our team will contact you within 24 hours to schedule your consultation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#D4AF37' }}>3.</span>
                  <span>Prepare any questions or materials you'd like to discuss</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="/"
                className="rounded-lg border px-6 py-3 font-medium transition-all"
                style={{
                  borderColor: 'rgba(212, 175, 55, 0.3)',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#F4E5B0'
                }}
              >
                Return to Home
              </a>
              <a
                href="/portal"
                className="rounded-lg px-6 py-3 font-medium transition-all"
                style={{
                  background: 'linear-gradient(to right, #D4AF37, #C09C2E)',
                  color: '#0A0A0A'
                }}
              >
                Access Client Portal
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
