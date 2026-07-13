import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { getFirstZodError } from '@/lib/validation/zod'
import { documentUploadMetadataSchema } from '@/features/documents/schemas'
import { buildDocumentStoragePath, DOCUMENTS_BUCKET, toDocumentInsertPayload } from '@/features/documents/repository'

async function requireActiveUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }) }

  const { data: profile } = await supabase.from('profiles').select('id, role, is_active').eq('id', user.id).maybeSingle()
  if (!profile?.is_active) return { error: NextResponse.json({ error: 'Aktif kullanıcı bulunamadı' }, { status: 403 }) }

  return { user, profile }
}

export async function POST(request: NextRequest) {
  const auth = await requireActiveUser()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => null)
  const parsed = documentUploadMetadataSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: getFirstZodError(parsed.error) }, { status: 400 })

  const service = createServiceRoleSupabaseClient()
  const storagePath = buildDocumentStoragePath(parsed.data)

  const { data, error } = await service
    .from('documents')
    .insert(toDocumentInsertPayload(parsed.data, storagePath, auth.user.id))
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message || 'Belge kaydı oluşturulamadı' }, { status: 500 })

  const upload = await service.storage.from(DOCUMENTS_BUCKET).createSignedUploadUrl(storagePath)
  if (upload.error) {
    await service.from('documents').delete().eq('id', data.id)
    return NextResponse.json({ error: upload.error.message || 'Belge yükleme bağlantısı oluşturulamadı' }, { status: 500 })
  }

  await writeAuditLog(service, {
    actorId: auth.user.id,
    action: 'document.created',
    entityType: 'document',
    entityId: data.id,
    newValues: data,
    metadata: {
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      file_name: data.file_name,
    },
  })

  return NextResponse.json(
    {
      document: data,
      upload: {
        bucket: DOCUMENTS_BUCKET,
        path: storagePath,
        token: upload.data.token,
        signedUrl: upload.data.signedUrl,
      },
    },
    { status: 201 }
  )
}
