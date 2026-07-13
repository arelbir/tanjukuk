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

  return { error: null, user }
}

export async function POST(request: Request) {
  const { error, user: actor } = await requireAdmin()

  if (error) {
    return error
  }

  let payload: { email?: string; role?: string; fullName?: string; password?: string; mode?: 'invite' | 'create' }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const email = payload.email?.trim().toLowerCase()
  const role = payload.role?.trim() || 'assistant'
  const fullName = payload.fullName?.trim() || 'Yeni Kullanıcı'
  const password = payload.password?.trim()
  const mode = payload.mode === 'create' ? 'create' : 'invite'

  if (!email) {
    return NextResponse.json({ error: 'E-posta zorunludur' }, { status: 400 })
  }

  if (!isValidRole(role)) {
    return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 })
  }

  if (mode === 'create' && (!password || password.length < 8)) {
    return NextResponse.json({ error: 'Manuel kullanıcı oluşturmak için en az 8 karakterli şifre zorunludur' }, { status: 400 })
  }

  try {
    const adminClient = createServiceRoleSupabaseClient()
    const redirectTo = `${new URL(request.url).origin}/auth/callback?next=/onboarding`
    const { data, error: authError } = mode === 'create'
      ? await adminClient.auth.admin.createUser({
          email,
          password: password!,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role,
          },
        })
      : await adminClient.auth.admin.inviteUserByEmail(email, {
          data: {
            full_name: fullName,
            role,
          },
          redirectTo,
        })

    if (authError) {
      const status = authError.message.toLowerCase().includes('registered') || authError.message.toLowerCase().includes('already') ? 409 : 400
      return NextResponse.json({ error: authError.message }, { status })
    }

    const invitedUser = data.user

    if (!invitedUser) {
      return NextResponse.json({ error: mode === 'create' ? 'Oluşturulan kullanıcı bilgisi alınamadı' : 'Davet edilen kullanıcı bilgisi alınamadı' }, { status: 500 })
    }

    const { error: upsertError } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: invitedUser.id,
          email,
          full_name: fullName,
          role,
          is_active: true,
        },
        { onConflict: 'id' }
      )

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    await writeAuditLog(adminClient, {
      actorId: actor?.id,
      action: mode === 'create' ? 'profile.created_manually' : 'profile.invited',
      entityType: 'profile',
      entityId: invitedUser.id,
      newValues: {
        email,
        full_name: fullName,
        role,
        is_active: true,
      },
      metadata: {
        mode,
        redirectTo: mode === 'invite' ? redirectTo : null,
      },
    })

    return NextResponse.json({
      message: mode === 'create' ? 'Kullanıcı oluşturuldu' : 'Davet e-postası gönderildi',
      user: {
        id: invitedUser.id,
        email,
        full_name: fullName,
        role,
        is_active: true,
      },
    })
  } catch (routeError) {
    return NextResponse.json(
      {
        error: routeError instanceof Error ? routeError.message : 'Kullanıcı işlemi başarısız oldu',
      },
      { status: 500 }
    )
  }
}
