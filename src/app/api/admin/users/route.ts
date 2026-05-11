import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      supabase,
    }
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      supabase,
    }
  }

  return { supabase, error: null }
}

export async function GET(request: Request) {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim()

  let query = supabase.from('users').select('*').order('created_at', { ascending: false })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error: queryError } = await query

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}

export async function PATCH(request: Request) {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  let payload: { userId?: string; role?: string; is_active?: boolean }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  if (!payload.userId) {
    return NextResponse.json({ error: 'Kullanıcı ID zorunludur' }, { status: 400 })
  }

  const updates: Record<string, string | boolean> = {}

  if (payload.role !== undefined) {
    if (!['admin', 'lawyer', 'assistant'].includes(payload.role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 })
    }
    updates.role = payload.role
  }

  if (payload.is_active !== undefined) {
    updates.is_active = payload.is_active
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  const { data, error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', payload.userId)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}
