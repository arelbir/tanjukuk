import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { getFirstZodError } from '@/lib/validation/zod'
import { documentArchiveSchema } from '@/features/documents/schemas'

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
  const auth = await requireActiveUser()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => null)
  const parsed = documentArchiveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: getFirstZodError(parsed.error) }, { status: 400 })

  const { id } = await params
  const service = createServiceRoleSupabaseClient()

  const { data: oldDocument, error: oldError } = await service.from('documents').select('*').eq('id', id).maybeSingle()
  if (oldError) return NextResponse.json({ error: oldError.message || 'Belge bulunamadı' }, { status: 500 })
  if (!oldDocument) return NextResponse.json({ error: 'Belge bulunamadı' }, { status: 404 })

  const patch = parsed.data.archived
    ? { archived_at: new Date().toISOString(), archived_by: auth.user.id }
    : { archived_at: null, archived_by: null }

  const { data, error } = await service.from('documents').update(patch).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message || 'Belge durumu güncellenemedi' }, { status: 500 })

  await writeAuditLog(service, {
    actorId: auth.user.id,
    action: parsed.data.archived ? 'document.archived' : 'document.unarchived',
    entityType: 'document',
    entityId: data.id,
    oldValues: oldDocument,
    newValues: data,
    metadata: {
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      file_name: data.file_name,
    },
  })

  return NextResponse.json({ document: data })
}
