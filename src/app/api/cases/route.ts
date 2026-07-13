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

export async function POST(request: NextRequest) {
  const auth = await requireActiveUser()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => null)
  const parsed = caseFileFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: getFirstZodError(parsed.error) }, { status: 400 })
  }

  const service = createServiceRoleSupabaseClient()
  const { data: fileCode, error: codeError } = await service.rpc('next_file_code', { file_prefix: 'DVA' })
  if (codeError || !fileCode) {
    return NextResponse.json({ error: codeError?.message || 'Dava dosya numarası üretilemedi' }, { status: 500 })
  }

  const { data, error } = await service
    .from('case_files')
    .insert({
      ...toCaseFilePayload(parsed.data),
      file_code: fileCode,
      created_by: auth.user.id,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message || 'Dava dosyası oluşturulamadı' }, { status: 500 })
  }

  await writeAuditLog(service, {
    actorId: auth.user.id,
    action: 'case_file.created',
    entityType: 'case_file',
    entityId: data.id,
    newValues: data,
  })

  return NextResponse.json({ caseFile: data }, { status: 201 })
}
