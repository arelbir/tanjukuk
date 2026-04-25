import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin yapılandırması eksik')
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function requireAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
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
      user: null,
    }
  }

  return { error: null, user }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin()

  if (error) {
    return error
  }

  let payload: { email?: string; role?: string; fullName?: string }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi' }, { status: 400 })
  }

  const email = payload.email?.trim().toLowerCase()
  const role = payload.role?.trim() || 'assistant'
  const fullName = payload.fullName?.trim() || 'Yeni Kullanıcı'

  if (!email) {
    return NextResponse.json({ error: 'E-posta zorunludur' }, { status: 400 })
  }

  if (!['admin', 'lawyer', 'assistant'].includes(role)) {
    return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 })
  }

  try {
    const adminClient = getAdminClient()
    const redirectTo = `${new URL(request.url).origin}/auth/callback?next=/onboarding`
    const { data, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role,
      },
      redirectTo,
    })

    if (inviteError) {
      const status = inviteError.message.toLowerCase().includes('registered') ? 409 : 400
      return NextResponse.json({ error: inviteError.message }, { status })
    }

    const invitedUser = data.user

    if (!invitedUser) {
      return NextResponse.json({ error: 'Davet edilen kullanıcı bilgisi alınamadı' }, { status: 500 })
    }

    const { error: upsertError } = await adminClient
      .from('users')
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

    return NextResponse.json({
      message: 'Davet e-postası gönderildi',
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
        error: routeError instanceof Error ? routeError.message : 'Davet işlemi başarısız oldu',
      },
      { status: 500 }
    )
  }
}
