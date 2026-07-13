import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'

async function requireActiveUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }) }

  const { data: profile } = await supabase.from('profiles').select('id, is_active').eq('id', user.id).maybeSingle()
  if (!profile?.is_active) return { error: NextResponse.json({ error: 'Aktif kullanıcı bulunamadı' }, { status: 403 }) }

  return { user }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await requireActiveUser()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => ({}))
  const isArchived = Boolean(body.isArchived)
  const service = createServiceRoleSupabaseClient()

  const { data: oldFile, error: oldError } = await service.from('enforcement_files').select('*').eq('id', id).maybeSingle()
  if (oldError) return NextResponse.json({ error: oldError.message }, { status: 500 })
  if (!oldFile) return NextResponse.json({ error: 'İcra dosyası bulunamadı' }, { status: 404 })

  const { data, error } = await service
    .from('enforcement_files')
    .update({
      is_archived: isArchived,
      archived_at: isArchived ? new Date().toISOString() : null,
      archived_by: isArchived ? auth.user.id : null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message || 'Arşiv durumu güncellenemedi' }, { status: 500 })

  await writeAuditLog(service, {
    actorId: auth.user.id,
    action: isArchived ? 'enforcement_file.archived' : 'enforcement_file.unarchived',
    entityType: 'enforcement_file',
    entityId: id,
    oldValues: oldFile,
    newValues: data,
  })

  return NextResponse.json({ enforcementFile: data })
}
