import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('🔍 Checking portal_access table structure...')

const { data, error } = await supabase
  .from('portal_access')
  .select('*')
  .limit(1)

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log('✅ Query successful')
console.log('Schema preview:', data)
