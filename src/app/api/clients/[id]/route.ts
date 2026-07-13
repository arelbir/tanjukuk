import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { clientFormSchema } from '@/features/clients/schemas'
import type { ClientFormValues } from '@/features/clients/types'

function toClientPayload(values: ClientFormValues) {
  return {
    name: values.name.trim(),
    type: values.type,
    phone: values.phone.trim() || null,
    email: values.email.trim() || null,
    tax_number: values.type === 'company' ? values.tax_number.trim() || null : null,
    national_id: values.type === 'individual' ? values.national_id.trim() || null : null,
    company_representative: values.type === 'company' ? values.company_representative.trim() || null : null,
    address: values.address.trim() || null,
    notes: values.notes.trim() || null,
    is_active: values.is_active,
  }
}

async function requireActiveUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.is_active) {
    return { error: NextResponse.json({ error: 'Aktif kullanıcı bulunamadı' }, { status: 403 }) }
  }

  return { user, profile }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireActiveUser()
    if ('error' in auth) return auth.error

    const { id } = await params
    const body = await request.json()
    const parsed = clientFormSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Form alanlarını kontrol edin', issues: parsed.error.issues }, { status: 400 })
    }

    const adminClient = createServiceRoleSupabaseClient()
    const { data: oldClient, error: oldError } = await adminClient.from('clients').select('*').eq('id', id).single()

    if (oldError) {
      return NextResponse.json({ error: oldError.message }, { status: 404 })
    }

    const { data, error } = await adminClient
      .from('clients')
      .update(toClientPayload(parsed.data))
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await writeAuditLog(adminClient, {
      actorId: auth.user.id,
      action: 'client.updated',
      entityType: 'client',
      entityId: id,
      oldValues: oldClient,
      newValues: data,
    })

    return NextResponse.json({ client: data })
  } catch (error) {
    console.error('Client update failed:', error)
    return NextResponse.json({ error: 'Müvekkil güncellenemedi' }, { status: 500 })
  }
}
