import type { Database } from '@/types/database.generated'

export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type NotificationKind =
  | 'hearing'
  | 'appointment'
  | 'deadline'
  | 'task'
  | 'payment'
  | 'document'
  | 'system'
  | 'case_status'
  | 'file_assignment'

export interface NotificationFilters {
  unreadOnly?: boolean
  type?: NotificationKind | 'all'
  limit?: number
}

export interface NotificationListResult {
  items: NotificationRow[]
  unreadCount: number
}

export interface ReminderCandidate {
  key: string
  userId: string
  title: string
  message: string
  type: NotificationKind
  entityType: string
  entityId: string
  linkUrl?: string | null
}

export interface ReminderRunResult {
  scanned: number
  created: number
  duplicates: number
  failed: number
  errors: Array<{ key: string; error: string }>
}
