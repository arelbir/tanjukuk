import { createClient } from '@/lib/supabase/client'

export interface CreateNotificationParams {
  userId: string
  title: string
  message?: string
  type: 'file_assignment' | 'case_status' | 'hearing' | 'deadline' | 'payment' | 'system'
  entityId?: string
  entityType?: string
  linkUrl?: string
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = createClient()
  
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

// Auto-notification for upcoming hearings
export async function notifyHearingReminder(hearingData: {
  id: string
  case_id: string
  case_code: string
  hearing_date: string
  lawyer_id: string
}) {
  const hearingDate = new Date(hearingData.hearing_date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = hearingDate.toDateString() === today.toDateString()
  const isTomorrow = hearingDate.toDateString() === tomorrow.toDateString()

  if (!isToday && !isTomorrow) return null // Only notify today or tomorrow

  const timeLabel = isToday ? 'bugün' : 'yarın'
  
  return createNotification({
    userId: hearingData.lawyer_id,
    title: `Duruşma ${timeLabel}`,
    message: `${hearingData.case_code} numaralı dosyanın duruşması ${timeLabel}. Tarih: ${hearingDate.toLocaleDateString('tr-TR')}`,
    type: 'hearing',
    entityId: hearingData.id,
    entityType: 'hearing',
    linkUrl: `/cases/${hearingData.case_id}`,
  })
}

// Auto-notification for deadline
export async function notifyDeadlineReminder(deadlineData: {
  id: string
  case_id: string
  case_code: string
  deadline_date: string
  description: string
  lawyer_id: string
}) {
  const deadlineDate = new Date(deadlineData.deadline_date)
  const today = new Date()
  const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0 || daysUntil > 7) return null // Only notify if within 7 days or past

  const timeLabel = daysUntil < 0 ? `${Math.abs(daysUntil)} gün geçti` : `${daysUntil} gün kaldı`
  
  return createNotification({
    userId: deadlineData.lawyer_id,
    title: `Deadline: ${timeLabel}`,
    message: `${deadlineData.case_code} - ${deadlineData.description}`,
    type: 'deadline',
    entityId: deadlineData.id,
    entityType: 'case',
    linkUrl: `/cases/${deadlineData.case_id}`,
  })
}

// Batch notify all lawyers (for cron job or manual trigger)
export async function checkAndNotifyHearings() {
  const supabase = createClient()
  
  // Get hearings for today and tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const { data: hearings } = await supabase
    .from('cases')
    .select('id, case_code, next_hearing_at, lawyer_id')
    .not('next_hearing_at', 'is', null)
    .lte('next_hearing_at', tomorrow)

  for (const hearing of hearings || []) {
    await notifyHearingReminder({
      id: hearing.id,
      case_id: hearing.id,
      case_code: hearing.case_code,
      hearing_date: hearing.next_hearing_at,
      lawyer_id: hearing.lawyer_id,
    })
  }
}

// Check deadlines for all active cases
export async function checkAndNotifyDeadlines() {
  const supabase = createClient()
  
  // Get cases with upcoming deadlines (next 7 days)
  const { data: cases } = await supabase
    .from('cases')
    .select('id, case_code, deadline, lawyer_id')
    .not('deadline', 'is', null)
    .eq('status_id', 'active')

  for (const c of cases || []) {
    await notifyDeadlineReminder({
      id: c.id,
      case_id: c.id,
      case_code: c.case_code,
      deadline_date: c.deadline,
      description: 'Süre',
      lawyer_id: c.lawyer_id,
    })
  }
}