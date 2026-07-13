import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import type { Database } from '@/types/database.generated'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
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
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin' || !profile.is_active) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      supabase,
    }
  }

  return { supabase, user, error: null }
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
  const { error, user } = await requireAdmin()

  if (error) return error

  let payload: {
    group_key?: string
    label?: string
    code?: string | null
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

  const service = createServiceRoleSupabaseClient()
  const { data, error: insertError } = await service
    .from('lookup_values')
    .insert({
      group_key: payload.group_key,
      label: payload.label.trim(),
      code: payload.code?.trim() || null,
      sort_order: payload.sort_order ?? 0,
      is_active: payload.is_active ?? true,
      parent_id: payload.parent_id ?? null,
    })
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await writeAuditLog(service, {
    actorId: user.id,
    action: 'lookup.created',
    entityType: 'lookup_value',
    entityId: data.id,
    newValues: data,
  })


  return NextResponse.json({ lookup: data })
}

export async function PATCH(request: Request) {
  const { error, user } = await requireAdmin()

  if (error) return error

  let payload: {
    id?: string
    label?: string
    code?: string | null
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

  const updates: Database['public']['Tables']['lookup_values']['Update'] = {}

  if (payload.label !== undefined) updates.label = payload.label.trim()
  if (payload.code !== undefined) updates.code = payload.code?.trim() || null
  if (payload.is_active !== undefined) updates.is_active = payload.is_active
  if (payload.parent_id !== undefined) updates.parent_id = payload.parent_id
  if (payload.sort_order !== undefined) updates.sort_order = payload.sort_order

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  const service = createServiceRoleSupabaseClient()
  const { data: oldLookup } = await service.from('lookup_values').select('*').eq('id', payload.id).maybeSingle()

  const { data, error: updateError } = await service
    .from('lookup_values')
    .update(updates)
    .eq('id', payload.id)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await writeAuditLog(service, {
    actorId: user.id,
    action: 'lookup.updated',
    entityType: 'lookup_value',
    entityId: data.id,
    oldValues: oldLookup,
    newValues: data,
  })

  return NextResponse.json({ lookup: data })
}

export async function DELETE(request: Request) {
  const { error, user } = await requireAdmin()

  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Lookup ID zorunludur' }, { status: 400 })
  }

  const service = createServiceRoleSupabaseClient()
  const { data: oldLookup } = await service.from('lookup_values').select('*').eq('id', id).maybeSingle()

  const { data, error: updateError } = await service
    .from('lookup_values')
    .update({ is_active: false })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await writeAuditLog(service, {
    actorId: user.id,
    action: 'lookup.deactivated',
    entityType: 'lookup_value',
    entityId: data.id,
    oldValues: oldLookup,
    newValues: data,
  })

  return NextResponse.json({ success: true, lookup: data })
}
