#!/usr/bin/env node

/**
 * Supabase Connection Test for Client-Portal-007
 * Verifies database connectivity and table access
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 AMD Solutions 007 - Supabase Connection Test\n')
console.log('━'.repeat(60))

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing Supabase credentials')
  console.error('   Check .env.local for NEXT_PUBLIC_SUPABASE_URL and KEY')
  process.exit(1)
}

console.log(`📡 Project URL: ${supabaseUrl}`)
console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`)
console.log('━'.repeat(60))

// Create client
const supabase = createClient(supabaseUrl, supabaseKey)

async function runTests() {
  const results = {
    connection: false,
    tables: {},
    overall: false,
  }

  try {
    // Test 1: Check connection
    console.log('\n[1/4] Testing connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('portal_access')
      .select('count')
      .limit(1)

    if (healthError && healthError.code !== 'PGRST116') {
      throw new Error(`Connection failed: ${healthError.message}`)
    }

    results.connection = true
    console.log('      ✅ Connection established')

    // Test 2: Check portal_access table
    console.log('\n[2/4] Checking portal_access table...')
    const { data: portalData, error: portalError } = await supabase
      .from('portal_access')
      .select('access_id, client_name')
      .eq('access_id', 'AMD-007-VIP')
      .maybeSingle()

    if (portalError) {
      console.log(`      ⚠️  Table exists but query failed: ${portalError.message}`)
      results.tables.portal_access = 'error'
    } else if (portalData) {
      console.log(`      ✅ VIP Access found: ${portalData.client_name || 'AMD-007-VIP'}`)
      results.tables.portal_access = 'ok'
    } else {
      console.log('      ⚠️  Table exists but VIP access not found (run schema)')
      results.tables.portal_access = 'missing_data'
    }

    // Test 3: Check clients table
    console.log('\n[3/4] Checking clients table...')
    const { count: clientCount, error: clientError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })

    if (clientError) {
      if (clientError.code === '42P01') {
        console.log('      ❌ Table does not exist (run supabase-schema.sql)')
        results.tables.clients = 'missing'
      } else {
        console.log(`      ⚠️  Query failed: ${clientError.message}`)
        results.tables.clients = 'error'
      }
    } else {
      console.log(`      ✅ Table exists (${clientCount || 0} records)`)
      results.tables.clients = 'ok'
    }

    // Test 4: Check chat_logs table
    console.log('\n[4/4] Checking chat_logs table...')
    const { count: chatCount, error: chatError } = await supabase
      .from('chat_logs')
      .select('*', { count: 'exact', head: true })

    if (chatError) {
      if (chatError.code === '42P01') {
        console.log('      ❌ Table does not exist (run supabase-schema.sql)')
        results.tables.chat_logs = 'missing'
      } else {
        console.log(`      ⚠️  Query failed: ${chatError.message}`)
        results.tables.chat_logs = 'error'
      }
    } else {
      console.log(`      ✅ Table exists (${chatCount || 0} records)`)
      results.tables.chat_logs = 'ok'
    }

    // Overall result
    const allTablesOk = Object.values(results.tables).every((status) => status === 'ok')
    results.overall = results.connection && allTablesOk

    console.log('\n' + '━'.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('━'.repeat(60))
    console.log(`Connection:      ${results.connection ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`portal_access:   ${getStatusIcon(results.tables.portal_access)}`)
    console.log(`clients:         ${getStatusIcon(results.tables.clients)}`)
    console.log(`chat_logs:       ${getStatusIcon(results.tables.chat_logs)}`)
    console.log('━'.repeat(60))

    if (results.overall) {
      console.log('\n🎉 ALL TESTS PASSED - Database ready for production')
      console.log('✅ Client Portal can authenticate')
      console.log('✅ Ready for Phase 2 (CI/CD Automation)\n')
      process.exit(0)
    } else {
      console.log('\n⚠️  SETUP INCOMPLETE')
      console.log('   Action required:')
      if (results.tables.clients === 'missing' || results.tables.chat_logs === 'missing') {
        console.log('   1. Open Supabase Dashboard → SQL Editor')
        console.log('   2. Run: apps/website/supabase-schema.sql')
        console.log('   3. Re-run this test\n')
      }
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message)
    console.error('   Check:')
    console.error('   - Supabase project is running')
    console.error('   - API keys are correct')
    console.error('   - Network connectivity\n')
    process.exit(1)
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'ok':
      return '✅ PASS'
    case 'missing':
      return '❌ MISSING'
    case 'missing_data':
      return '⚠️  NEEDS DATA'
    case 'error':
      return '⚠️  ERROR'
    default:
      return '❓ UNKNOWN'
  }
}

// Run tests
runTests()
