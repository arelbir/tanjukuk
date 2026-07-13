import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { DOCUMENTS_BUCKET } from '@/features/documents/repository'

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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireActiveUser()
  if ('error' in auth) return auth.error

  const { id } = await params
  const service = createServiceRoleSupabaseClient()

  const { data: document, error } = await service.from('documents').select('*').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message || 'Belge bulunamadı' }, { status: 500 })
  if (!document || document.archived_at) return NextResponse.json({ error: 'Belge bulunamadı' }, { status: 404 })

  const signed = await service.storage.from(document.storage_bucket || DOCUMENTS_BUCKET).createSignedUrl(document.storage_path, 60)
  if (signed.error) return NextResponse.json({ error: signed.error.message || 'İndirme bağlantısı oluşturulamadı' }, { status: 500 })

  return NextResponse.redirect(signed.data.signedUrl)
}
