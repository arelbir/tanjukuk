import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

const VALID_ROLES = ['admin', 'lawyer', 'assistant', 'finance'] as const

type UserRole = (typeof VALID_ROLES)[number]

function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole)
}

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }),
      user: null,
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin' || !profile.is_active) {
    return {
      error: NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir' }, { status: 403 }),
      user: null,
    }
  }

  return { user, error: null }
}

export async function GET(request: Request) {
  const { error } = await requireAdmin()

  if (error) return error

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim()
  const adminClient = createServiceRoleSupabaseClient()

  let query = adminClient
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (search) {
    const escapedSearch = search.replaceAll(',', ' ')
    query = query.or(`full_name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%`)
  }

  const { data, error: queryError } = await query

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}

export async function PATCH(request: Request) {
  const { user: actor, error } = await requireAdmin()

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

  const adminClient = createServiceRoleSupabaseClient()
  const { data: existingUser, error: existingError } = await adminClient
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('id', payload.userId)
    .single()

  if (existingError || !existingUser) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
  }

  const updates: Partial<{ role: UserRole; is_active: boolean }> = {}

  if (payload.role !== undefined) {
    if (!isValidRole(payload.role)) {
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

  if (payload.userId === actor?.id && updates.is_active === false) {
    return NextResponse.json({ error: 'Kendi hesabınızı pasife alamazsınız' }, { status: 400 })
  }

  if (payload.userId === actor?.id && updates.role && updates.role !== 'admin') {
    return NextResponse.json({ error: 'Kendi admin rolünüzü kaldıramazsınız' }, { status: 400 })
  }

  const { data, error: updateError } = await adminClient
    .from('profiles')
    .update(updates)
    .eq('id', payload.userId)
    .select('id, email, full_name, role, is_active, created_at')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const action = updates.role !== undefined ? 'profile.role_updated' : 'profile.status_updated'
  await writeAuditLog(adminClient, {
    actorId: actor?.id,
    action,
    entityType: 'profile',
    entityId: payload.userId,
    oldValues: {
      role: existingUser.role,
      is_active: existingUser.is_active,
    },
    newValues: updates,
  })

  return NextResponse.json({ user: data })
}
