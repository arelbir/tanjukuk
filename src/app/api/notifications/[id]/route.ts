import { NextResponse } from 'next/server'
import { createTypedServerSupabaseClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/session'
import { markNotificationRead } from '@/features/notifications/repository'

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createTypedServerSupabaseClient()
  const { user } = await getUserContext(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
  }

  const notification = await markNotificationRead(supabase, id)
  return NextResponse.json({ notification })
}
