import { NextResponse } from 'next/server'
import { createTypedServerSupabaseClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/session'
import { markAllNotificationsRead } from '@/features/notifications/repository'

export async function POST() {
  const supabase = await createTypedServerSupabaseClient()
  const { user } = await getUserContext(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
  }

  await markAllNotificationsRead(supabase)
  return NextResponse.json({ ok: true })
}
