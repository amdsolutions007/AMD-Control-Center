import { NextResponse } from 'next/server'
import { createMIAuthServerClient } from '@/lib/supabase/mi-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/client-portal/dashboard'
  if (!next.startsWith('/client-portal')) next = '/client-portal/dashboard'

  if (!code) return NextResponse.redirect(`${origin}/client-portal?error=callback`)

  const supabase = await createMIAuthServerClient()
  if (!supabase) return NextResponse.redirect(`${origin}/client-portal?error=config`)

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/client-portal?error=callback`)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/client-portal`)

  const { data: existing } = await supabase
    .from('client_profiles')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    await supabase.from('client_profiles').insert({
      user_id: user.id,
      display_name: user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? null,
      company_name: user.user_metadata?.company_name ?? null,
      status: 'invited',
      role: 'client',
    })
  }

  const { data: profile } = await supabase
    .from('client_profiles')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (next === '/client-portal/reset-password') {
    return NextResponse.redirect(`${origin}${next}`)
  }

  if (!profile || profile.status !== 'active') {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/client-portal?status=pending`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
