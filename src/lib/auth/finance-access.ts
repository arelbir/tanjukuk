export type FinanceFileType = 'case_file' | 'enforcement_file'

export interface FinanceFileSummaryInput {
  id: string
  file_code: string
  currency?: string | null
  client?: { name?: string | null } | null
  client_name?: string | null
  opposing_party?: string | null
  debtor_party?: string | null
  case_value?: number | null
  total_amount?: number | null
  remaining_amount?: number | null
}

export interface FinanceFileSummary {
  id: string
  type: FinanceFileType
  file_code: string
  client_name: string | null
  counterparty: string | null
  currency: string
  financial_total: number | null
  financial_remaining: number | null
}

export function toFinanceFileSummary(type: FinanceFileType, file: FinanceFileSummaryInput): FinanceFileSummary {
  return {
    id: file.id,
    type,
    file_code: file.file_code,
    client_name: file.client_name || file.client?.name || null,
    counterparty: type === 'case_file' ? file.opposing_party || null : file.debtor_party || null,
    currency: file.currency || 'TRY',
    financial_total: type === 'case_file' ? file.case_value ?? null : file.total_amount ?? null,
    financial_remaining: type === 'case_file' ? null : file.remaining_amount ?? null,
  }
}

export function isFinanceEntityType(entityType?: string | null) {
  return entityType === 'receivable' || entityType === 'payment' || entityType === 'expense'
}

export function isFinanceDocument(document: { entity_type?: string | null }) {
  return isFinanceEntityType(document.entity_type)
}

export const hiddenFinanceRoleFields = [
  'description',
  'hearing_result',
  'interim_decision',
  'next_step',
  'audit_logs',
  'archived_by',
  'created_by',
] as const
