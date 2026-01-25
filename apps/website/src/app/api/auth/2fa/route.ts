import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSMS } from '@/lib/twilio'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const tempCodeStore = new Map<string, { code: string; expiresAt: number }>()

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone is required.' }, { status: 400 })
    }

    const code = generateCode()
    const expiresAt = Date.now() + 5 * 60 * 1000

    await sendSMS(phone, `AMD Security: Your 2FA code is ${code}. Expires in 5 minutes.`)

    let store: 'supabase' | 'memory' = 'memory'
    if (supabase) {
      const { error } = await supabase
        .from('two_factor_codes')
        .upsert({ phone, code, expires_at: new Date(expiresAt).toISOString() })

      if (!error) {
        store = 'supabase'
      } else {
        console.error('Supabase 2FA store failed, falling back to memory', error)
        tempCodeStore.set(phone, { code, expiresAt })
      }
    } else {
      tempCodeStore.set(phone, { code, expiresAt })
    }

    return NextResponse.json({ success: true, expiresAt, store })
  } catch (error) {
    console.error('2FA API error', error)
    return NextResponse.json({ error: 'Failed to send 2FA code.' }, { status: 500 })
  }
}
