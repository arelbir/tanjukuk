import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerSupabaseClient } from '@/lib/supabase/server'
import { getRoleAccessMessage, isActiveRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'E-posta ve şifre girin' }, { status: 400 })
  }

  const supabase = await createTypedServerSupabaseClient()
  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError || !data.user) {
    return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'Kullanıcı profili bulunamadı' }, { status: 403 })
  }

  if (!profile.is_active) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'Kullanıcı pasif durumda' }, { status: 403 })
  }

  const roleMessage = getRoleAccessMessage(profile.role)
  if (roleMessage || !isActiveRole(profile.role)) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: roleMessage || 'Bu kullanıcı rolü desteklenmiyor' }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}
