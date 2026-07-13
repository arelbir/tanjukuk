import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface CreateNotificationParams {
  userId: string
  title: string
  message?: string
  type: 'file_assignment' | 'case_status' | 'hearing' | 'deadline' | 'payment' | 'system'
  entityId?: string
  entityType?: string
  linkUrl?: string
}

/**
 * Create an immediate notification (server-side)
 * This is for instant notifications like case assignments, status changes, etc.
 * For scheduled reminders, use the reminder system instead.
 */
export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      entity_id: params.entityId || null,
      entity_type: params.entityType || null,
      link_url: params.linkUrl || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Notification creation failed:', error)
    return null
  }

  return data
}

// Auto-notification for case assignment
export async function notifyCaseAssignment(caseData: {
  id: string
  case_code: string
  lawyer_id: string
  client_name: string
}) {
  return createNotification({
    userId: caseData.lawyer_id,
    title: 'Yeni Dosya Atandı',
    message: `${caseData.case_code} numaralı dosya size atandı. Müvekkil: ${caseData.client_name}`,
    type: 'file_assignment',
    entityId: caseData.id,
    entityType: 'case',
    linkUrl: `/cases/${caseData.id}`,
  })
}

// Auto-notification for case status change
export async function notifyCaseStatusChange(caseData: {
  id: string
  case_code: string
  lawyer_id: string
  newStatus: string
}) {
  return createNotification({
    userId: caseData.lawyer_id,
    title: 'Dosya Durumu Değişti',
    message: `${caseData.case_code} numaralı dosya durumu "${caseData.newStatus}" olarak güncellendi`,
    type: 'case_status',
    entityId: caseData.id,
    entityType: 'case',
    linkUrl: `/cases/${caseData.id}`,
  })
}

// ============================================================================
// DEPRECATED: Use the reminder system instead
// The following functions are deprecated and should not be used.
// Scheduled reminders are now handled by:
// - src/lib/reminders/policies.ts
// - src/lib/reminders/candidates.ts
// - src/lib/reminders/dispatch.ts
// - src/app/api/internal/reminders/run/route.ts
// ============================================================================

/**
 * @deprecated Use the reminder system instead (src/lib/reminders)
 */
export async function notifyHearingReminder() {
  console.warn('notifyHearingReminder is deprecated. Use the reminder system instead.')
  return null
}

/**
 * @deprecated Use the reminder system instead (src/lib/reminders)
 */
export async function notifyDeadlineReminder() {
  console.warn('notifyDeadlineReminder is deprecated. Use the reminder system instead.')
  return null
}

/**
 * @deprecated Use the reminder system instead (src/lib/reminders)
 */
export async function checkAndNotifyHearings() {
  console.warn('checkAndNotifyHearings is deprecated. Use the reminder system instead.')
}

/**
 * @deprecated Use the reminder system instead (src/lib/reminders)
 */
export async function checkAndNotifyDeadlines() {
  console.warn('checkAndNotifyDeadlines is deprecated. Use the reminder system instead.')
}