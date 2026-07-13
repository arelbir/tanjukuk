import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { checkNotificationExists } from './candidates'
import type { ReminderCandidate, ReminderRunResult } from '@/features/notifications/types'

export async function dispatchReminder(candidate: ReminderCandidate): Promise<'created' | 'duplicate'> {
  const service = createServiceRoleSupabaseClient()
  const exists = await checkNotificationExists(candidate)

  if (exists) {
    return 'duplicate'
  }

  const { error } = await service.from('notifications').insert({
    user_id: candidate.userId,
    title: candidate.title,
    message: candidate.message,
    type: candidate.type,
    entity_type: candidate.entityType,
    entity_id: candidate.entityId,
    link_url: candidate.linkUrl || null,
  })

  if (error) throw error
  return 'created'
}

export async function batchDispatchReminders(candidates: ReminderCandidate[]): Promise<ReminderRunResult> {
  const result: ReminderRunResult = {
    scanned: candidates.length,
    created: 0,
    duplicates: 0,
    failed: 0,
    errors: [],
  }

  for (const candidate of candidates) {
    try {
      const status = await dispatchReminder(candidate)
      if (status === 'created') result.created++
      if (status === 'duplicate') result.duplicates++
    } catch (error) {
      result.failed++
      result.errors.push({
        key: candidate.key,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      })
    }
  }

  return result
}
