export type QueryScope = 'list' | 'detail' | 'summary' | 'lookup' | 'infinite'

export type QueryFilters = Record<string, unknown>

type EntityKey = readonly [entity: string]
type EntityScopedKey = readonly [entity: string, scope: QueryScope]
type EntityFilteredKey = readonly [entity: string, scope: QueryScope, filters: QueryFilters]
type EntityDetailKey = readonly [entity: string, scope: 'detail', id: string]
type EntityRelationKey = readonly [entity: string, scope: QueryScope, id: string, relation: string, filters?: QueryFilters]

function normalizeFilters(filters?: QueryFilters): QueryFilters {
  if (!filters) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([left], [right]) => left.localeCompare(right))
  )
}

export function entityKeys(entity: string) {
  return {
    all: [entity] as EntityKey,
    scope: (scope: QueryScope) => [entity, scope] as EntityScopedKey,
    list: (filters?: QueryFilters) => [entity, 'list', normalizeFilters(filters)] as EntityFilteredKey,
    infinite: (filters?: QueryFilters) => [entity, 'infinite', normalizeFilters(filters)] as EntityFilteredKey,
    lookup: (filters?: QueryFilters) => [entity, 'lookup', normalizeFilters(filters)] as EntityFilteredKey,
    summary: (filters?: QueryFilters) => [entity, 'summary', normalizeFilters(filters)] as EntityFilteredKey,
    detail: (id: string) => [entity, 'detail', id] as EntityDetailKey,
    relation: (scope: QueryScope, id: string, relation: string, filters?: QueryFilters) =>
      [entity, scope, id, relation, normalizeFilters(filters)] as EntityRelationKey,
  }
}

export const queryKeys = {
  profiles: entityKeys('profiles'),
  users: entityKeys('users'),
  lookupValues: entityKeys('lookup-values'),
  clients: entityKeys('clients'),
  caseFiles: entityKeys('case-files'),
  enforcementFiles: entityKeys('enforcement-files'),
  calendarEvents: entityKeys('calendar-events'),
  hearingDetails: entityKeys('hearing-details'),
  receivables: entityKeys('receivables'),
  payments: entityKeys('payments'),
  expenses: entityKeys('expenses'),
  documents: entityKeys('documents'),
  notifications: entityKeys('notifications'),
  auditLogs: entityKeys('audit-logs'),
  dashboard: entityKeys('dashboard'),
  home: entityKeys('home'),
  files: entityKeys('files'),
  calendar: entityKeys('calendar'),
  finance: entityKeys('finance'),
} as const

export type QueryKeys = typeof queryKeys
