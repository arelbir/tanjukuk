export interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export type UserRole = 'admin' | 'lawyer' | 'assistant'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  lawyer: 'Avukat',
  assistant: 'Asistan',
}