import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔧 Inserting AMD-007-VIP access with service role...')

const { data, error } = await supabase
  .from('portal_access')
  .insert([
    {
      access_id: 'AMD-007-VIP',
      client_name: 'AMD Solutions CEO',
      pin_code: '007007'
    }
  ])
  .select()

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log('✅ VIP access created:', data)
