export const ACTIVE_ROLES = ['admin', 'lawyer', 'finance'] as const
export const REMOVED_ROLES = ['assistant'] as const

export type ActiveRole = (typeof ACTIVE_ROLES)[number]
export type RemovedRole = (typeof REMOVED_ROLES)[number]
export type AppRole = ActiveRole | RemovedRole | string

export interface UserContext {
  id: string
  role: AppRole
  fullName?: string | null
  email?: string | null
  isActive: boolean
}

export const roleLabels: Record<ActiveRole, string> = {
  admin: 'Yönetici',
  lawyer: 'Avukat',
  finance: 'Finans',
}

export function isActiveRole(role?: string | null): role is ActiveRole {
  return Boolean(role && ACTIVE_ROLES.includes(role as ActiveRole))
}

export function isRemovedRole(role?: string | null): role is RemovedRole {
  return Boolean(role && REMOVED_ROLES.includes(role as RemovedRole))
}

export function getRoleLabel(role?: string | null) {
  if (isActiveRole(role)) return roleLabels[role]
  if (isRemovedRole(role)) return 'Kaldırılmış rol'
  return 'Bilinmeyen rol'
}

export function getRoleAccessMessage(role?: string | null) {
  if (isRemovedRole(role)) {
    return 'Asistan rolü yeni uygulama modelinden kaldırıldı. Lütfen yöneticinizden rolünüzü avukat veya finans olarak güncellemesini isteyin.'
  }

  if (!isActiveRole(role)) {
    return 'Bu kullanıcı rolü yeni uygulama tarafından desteklenmiyor. Lütfen yöneticinizle iletişime geçin.'
  }

  return null
}
