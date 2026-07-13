import type { ActiveRole, UserContext } from './roles'
import { isActiveRole } from './roles'

export type PermissionAction =
  | 'admin:access'
  | 'client:list_all'
  | 'client:view_related'
  | 'client:create'
  | 'client:update'
  | 'client:deactivate'
  | 'file:list_all'
  | 'file:view'
  | 'file:create'
  | 'file:update'
  | 'file:archive'
  | 'file:assign_lawyer'
  | 'calendar:view_all'
  | 'calendar:view_owned'
  | 'calendar:create'
  | 'calendar:complete'
  | 'finance:view_all'
  | 'finance:view_owned_file'
  | 'finance:create_receivable'
  | 'finance:create_payment'
  | 'finance:create_expense'
  | 'finance:create_office_expense'
  | 'finance:cancel_or_correct'
  | 'document:view_all'
  | 'document:view_owned_file'
  | 'document:view_finance'
  | 'document:upload_legal'
  | 'document:upload_finance'
  | 'document:archive_all'
  | 'document:archive_finance'
  | 'notification:view_own'

export interface PermissionResource {
  ownerUserId?: string | null
  isResponsibleLawyer?: boolean
  isFinanceDocument?: boolean
}

const rolePermissions: Record<ActiveRole, PermissionAction[]> = {
  admin: [
    'admin:access',
    'client:list_all',
    'client:view_related',
    'client:create',
    'client:update',
    'client:deactivate',
    'file:list_all',
    'file:view',
    'file:create',
    'file:update',
    'file:archive',
    'file:assign_lawyer',
    'calendar:view_all',
    'calendar:view_owned',
    'calendar:create',
    'calendar:complete',
    'finance:view_all',
    'finance:view_owned_file',
    'finance:create_receivable',
    'finance:create_payment',
    'finance:create_expense',
    'finance:create_office_expense',
    'finance:cancel_or_correct',
    'document:view_all',
    'document:view_owned_file',
    'document:view_finance',
    'document:upload_legal',
    'document:upload_finance',
    'document:archive_all',
    'document:archive_finance',
    'notification:view_own',
  ],
  lawyer: [
    'client:view_related',
    'file:view',
    'calendar:view_owned',
    'calendar:create',
    'calendar:complete',
    'finance:view_owned_file',
    'finance:create_payment',
    'finance:create_expense',
    'document:view_owned_file',
    'document:upload_legal',
    'document:upload_finance',
    'notification:view_own',
  ],
  finance: [
    'client:view_related',
    'finance:view_all',
    'finance:create_receivable',
    'finance:create_payment',
    'finance:create_expense',
    'finance:create_office_expense',
    'finance:cancel_or_correct',
    'document:view_finance',
    'document:upload_finance',
    'document:archive_finance',
    'notification:view_own',
  ],
}

const ownershipScopedActions = new Set<PermissionAction>([
  'file:view',
  'calendar:view_owned',
  'calendar:create',
  'calendar:complete',
  'finance:view_owned_file',
  'finance:create_payment',
  'finance:create_expense',
  'document:view_owned_file',
  'document:upload_legal',
  'document:upload_finance',
])

export function can(user: UserContext | null | undefined, action: PermissionAction, resource?: PermissionResource) {
  if (!user?.isActive || !isActiveRole(user.role)) return false

  const permissions = rolePermissions[user.role]
  if (!permissions.includes(action)) return false

  if (user.role === 'admin') return true

  if (user.role === 'lawyer' && ownershipScopedActions.has(action)) {
    return Boolean(resource?.isResponsibleLawyer || (resource?.ownerUserId && resource.ownerUserId === user.id))
  }

  if (user.role === 'finance') {
    if (action === 'document:archive_finance' || action === 'document:view_finance' || action === 'document:upload_finance') {
      return resource?.isFinanceDocument ?? true
    }
  }

  return true
}

export function requirePermission(user: UserContext | null | undefined, action: PermissionAction, resource?: PermissionResource) {
  if (!can(user, action, resource)) {
    throw new Error('Bu işlem için yetkiniz yok')
  }
}
