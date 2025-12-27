/**
 * Snapchat Conversion API (CAPI) Utility
 * 
 * Server-side event tracking for Snapchat Ads
 * Docs: https://marketingapi.snapchat.com/docs/conversion.html
 */

interface SnapEventData {
  event_type: 'PURCHASE' | 'ADD_CART' | 'VIEW_CONTENT' | 'SIGN_UP' | 'CUSTOM_EVENT_1' | string
  event_conversion_type: 'WEB' | 'MOBILE_APP' | 'OFFLINE'
  event_tag?: string
  timestamp?: number
  hashed_email?: string
  hashed_phone_number?: string
  hashed_ip_address?: string
  user_agent?: string
  currency?: string
  price?: number
  transaction_id?: string
  item_ids?: string[]
  number_items?: number
  [key: string]: any
}

interface SnapCAPIConfig {
  pixelId: string
  apiToken: string
  testMode?: boolean
}

/**
 * Send server-side conversion event to Snapchat CAPI
 * 
 * @param eventData - Event details (event_type, user data, conversion data)
 * @param config - Pixel ID and API Token (defaults to env vars)
 * @returns Promise with API response
 */
export async function sendSnapEvent(
  eventData: SnapEventData,
  config?: Partial<SnapCAPIConfig>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Get config from parameters or environment variables
    const pixelId = config?.pixelId || process.env.SNAP_PIXEL_ID || '7856879a-cb0b-43b7-a2d3-0bb378eebd54'
    const apiToken = config?.apiToken || process.env.SNAP_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzY2NDgwMjQ0LCJzdWIiOiIxNGYxMzc2My04MjMxLTRhYzgtYjRhNi0zYzliODE5YmMyMzR-UFJPRFVDVElPTn44NjVkYjI1NC0wYTg3LTQwMjQtYmYzMi1lOTM2YzY2NzM0NWUifQ.c-jrXPIU8WTrGs4OiSnP1YeMj8Vb3bsnVW5zWpKy9Gw'
    const testMode = config?.testMode || process.env.SNAP_TEST_MODE === 'true'

    if (!pixelId) {
      throw new Error('Snapchat Pixel ID is required.')
    }

    // Construct CAPI endpoint
    const endpoint = `https://tr.snapchat.com/v2/conversion`

    // Build event payload
    const payload = {
      pixel_id: pixelId,
      event_conversion_type: eventData.event_conversion_type || 'WEB',
      event_type: eventData.event_type,
      event_tag: eventData.event_tag || 'default',
      timestamp: eventData.timestamp || Date.now(),
      hashed_email: eventData.hashed_email,
      hashed_phone_number: eventData.hashed_phone_number,
      hashed_ip_address: eventData.hashed_ip_address,
      user_agent: eventData.user_agent,
      currency: eventData.currency,
      price: eventData.price,
      transaction_id: eventData.transaction_id,
      item_ids: eventData.item_ids,
      number_items: eventData.number_items,
      ...(testMode && { test_mode: true })
    }

    // Remove undefined fields
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload]
      }
    })

    // Send to Snapchat CAPI
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Snapchat CAPI error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return { success: true, data }

  } catch (error) {
    console.error('Snapchat CAPI error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Hash email for CAPI (SHA-256)
 * Snapchat requires normalized and hashed PII
 */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim()
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Example usage:
 * 
 * // Send a purchase event
 * await sendSnapEvent({
 *   event_type: 'PURCHASE',
 *   event_conversion_type: 'WEB',
 *   hashed_email: await hashEmail('user@example.com'),
 *   currency: 'USD',
 *   price: 99.99,
 *   transaction_id: 'order_12345',
 *   item_ids: ['prod_1', 'prod_2'],
 *   number_items: 2
 * })
 * 
 * // Send a lead/signup event
 * await sendSnapEvent({
 *   event_type: 'SIGN_UP',
 *   event_conversion_type: 'WEB',
 *   hashed_email: await hashEmail('lead@example.com')
 * })
 */
