export type NotificationType = 
  | 'file_assignment'   // Yeni dosya atandı
  | 'case_status'       // Dosya durumu değişti
  | 'hearing'           // Duruşma yaklaşıyor
  | 'deadline'          // Deadline yaklaşıyor
  | 'payment'           // Ödeme bildirimi
  | 'system'            // Sistem bildirimi

export interface Notification {
  id: string
  user_id: string
  title: string
  message?: string
  type: NotificationType
  entity_id?: string
  entity_type?: string
  link_url?: string
  is_read: boolean
  created_at: string
}

export interface NotificationFilters {
  unreadOnly: boolean
  type?: NotificationType
}

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  file_assignment: 'bg-blue-100 border-blue-500 text-blue-700',
  case_status: 'bg-purple-100 border-purple-500 text-purple-700', 
  hearing: 'bg-orange-100 border-orange-500 text-orange-700',
  deadline: 'bg-red-100 border-red-500 text-red-700',
  payment: 'bg-green-100 border-green-500 text-green-700',
  system: 'bg-gray-100 border-gray-500 text-gray-700',
}

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  file_assignment: 'Yeni Dosya',
  case_status: 'Durum Değişikliği',
  hearing: 'Duruşma',
  deadline: 'Deadline',
  payment: 'Ödeme',
  system: 'Sistem',
}

export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
  unreadOnly: false,
}