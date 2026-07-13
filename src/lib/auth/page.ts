import { redirect } from 'next/navigation'
import { createTypedServerSupabaseClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/session'
import { listNotifications } from '@/features/notifications/repository'

export async function requirePageContext() {
  const supabase = await createTypedServerSupabaseClient()
  const { user } = await getUserContext(supabase)

  if (!user) {
    redirect('/login')
  }

  let unreadCount = 0
  try {
    const result = await listNotifications(supabase, { limit: 1 })
    unreadCount = result.unreadCount
  } catch {
    unreadCount = 0
  }

  return {
    supabase,
    user,
    unreadCount,
  }
}
