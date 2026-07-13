import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { getFirstZodError } from '@/lib/validation/zod'
import { calendarEventFormSchema } from '@/features/calendar/schemas'
import { toCalendarEventPayload, toHearingDetailPayload } from '@/features/calendar/repository'

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

export async function POST(request: NextRequest) {
  const auth = await requireActiveUser()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => null)
  const parsed = calendarEventFormSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: getFirstZodError(parsed.error) }, { status: 400 })

  const service = createServiceRoleSupabaseClient()
  const { data, error } = await service
    .from('calendar_events')
    .insert({ ...toCalendarEventPayload(parsed.data), created_by: auth.user.id })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message || 'Ajanda kaydı oluşturulamadı' }, { status: 500 })

  if (parsed.data.event_type === 'hearing') {
    const { error: hearingError } = await service.from('hearing_details').upsert(toHearingDetailPayload(parsed.data, data.id))
    if (hearingError) return NextResponse.json({ error: hearingError.message || 'Duruşma detayı kaydedilemedi' }, { status: 500 })
  }

  await writeAuditLog(service, {
    actorId: auth.user.id,
    action: 'calendar_event.created',
    entityType: 'calendar_event',
    entityId: data.id,
    newValues: data,
  })

  return NextResponse.json({ event: data }, { status: 201 })
}
