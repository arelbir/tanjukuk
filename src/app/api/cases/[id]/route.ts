import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { getFirstZodError } from '@/lib/validation/zod'
import { caseFileFormSchema } from '@/features/cases/schemas'
import { toCaseFilePayload } from '@/features/cases/repository'

async function requireActiveUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }) }
  }

  const { data: profile } = await supabase.from('profiles').select('id, is_active').eq('id', user.id).maybeSingle()
  if (!profile?.is_active) {
    return { error: NextResponse.json({ error: 'Aktif kullanıcı bulunamadı' }, { status: 403 }) }
  }

  return { user }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await requireActiveUser()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => null)
  const parsed = caseFileFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: getFirstZodError(parsed.error) }, { status: 400 })
  }

  const service = createServiceRoleSupabaseClient()
  const { data: oldCaseFile, error: oldError } = await service.from('case_files').select('*').eq('id', id).maybeSingle()
  if (oldError) return NextResponse.json({ error: oldError.message }, { status: 500 })
  if (!oldCaseFile) return NextResponse.json({ error: 'Dava dosyası bulunamadı' }, { status: 404 })

  const { data, error } = await service.from('case_files').update(toCaseFilePayload(parsed.data)).eq('id', id).select('*').single()
  if (error) {
    return NextResponse.json({ error: error.message || 'Dava dosyası güncellenemedi' }, { status: 500 })
  }

  await writeAuditLog(service, {
    actorId: auth.user.id,
    action: 'case_file.updated',
    entityType: 'case_file',
    entityId: id,
    oldValues: oldCaseFile,
    newValues: data,
  })

  return NextResponse.json({ caseFile: data })
}
