export type UserRole = 'admin' | 'lawyer' | 'assistant' | 'finance'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole | string
  is_active: boolean
  created_at: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Yönetici',
  lawyer: 'Avukat',
  assistant: 'Asistan',
  finance: 'Finans',
}

export function isKnownRole(role?: string | null): role is UserRole {
  return role === 'admin' || role === 'lawyer' || role === 'assistant' || role === 'finance'
}

export function getRoleLabel(role?: string | null) {
  return isKnownRole(role) ? ROLE_LABELS[role] : 'Kullanıcı'
}
