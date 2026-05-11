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

export async function GET() {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  const { data, error: queryError } = await supabase
    .from('lookup_values')
    .select('*')
    .order('group_key', { ascending: true })
    .order('sort_order', { ascending: true })

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  return NextResponse.json({ lookups: data || [] })
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  let payload: {
    group_key?: string
    label?: string
    sort_order?: number
    is_active?: boolean
    parent_id?: string | null
  }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  if (!payload.group_key || !payload.label) {
    return NextResponse.json({ error: 'group_key ve label zorunludur' }, { status: 400 })
  }

  const { data, error: insertError } = await supabase
    .from('lookup_values')
    .insert({
      group_key: payload.group_key,
      label: payload.label.trim(),
      sort_order: payload.sort_order ?? 0,
      is_active: payload.is_active ?? true,
      parent_id: payload.parent_id ?? null,
    })
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ lookup: data })
}

export async function PATCH(request: Request) {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  let payload: {
    id?: string
    label?: string
    is_active?: boolean
    parent_id?: string | null
    sort_order?: number
  }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  if (!payload.id) {
    return NextResponse.json({ error: 'Lookup ID zorunludur' }, { status: 400 })
  }

  const updates: Record<string, string | boolean | number | null> = {}

  if (payload.label !== undefined) updates.label = payload.label.trim()
  if (payload.is_active !== undefined) updates.is_active = payload.is_active
  if (payload.parent_id !== undefined) updates.parent_id = payload.parent_id
  if (payload.sort_order !== undefined) updates.sort_order = payload.sort_order

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  const { data, error: updateError } = await supabase
    .from('lookup_values')
    .update(updates)
    .eq('id', payload.id)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ lookup: data })
}

export async function DELETE(request: Request) {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Lookup ID zorunludur' }, { status: 400 })
  }

  const { error: deleteError } = await supabase.from('lookup_values').delete().eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
