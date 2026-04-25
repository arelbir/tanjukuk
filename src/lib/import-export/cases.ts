import { ImportDefinition } from './types'

export interface CaseImportRow {
  lawyer_email: string
  client_name: string
  opposing_party: string
  client_role_label: string | null
  entity_type: string
  court_city: string | null
  court_district: string | null
  court_type_label: string | null
  court_no: number | null
  file_year: number | null
  file_no: string | null
  file_type_label: string | null
  case_type_label: string | null
  status_label: string | null
  opened_at: string
  case_value: number
  currency: string
  description: string | null
  notes: string | null
}

function normalizeString(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const caseImportDefinition: ImportDefinition<CaseImportRow> = {
  fileName: 'dosya-sablon.xlsx',
  sheetName: 'Dosyalar',
  headers: [
    'lawyer_email',
    'client_name',
    'opposing_party',
    'client_role_label',
    'entity_type',
    'court_city',
    'court_district',
    'court_type_label',
    'court_no',
    'file_year',
    'file_no',
    'file_type_label',
    'case_type_label',
    'status_label',
    'opened_at',
    'case_value',
    'currency',
    'description',
    'notes',
  ],
  instructions: [
    'lawyer_email ve client_name sistemde var olan kayıtlarla eşleşmelidir.',
    'case_type_label, status_label, court_type_label, file_type_label ve client_role_label lookup label değerleridir.',
    'opened_at zorunludur ve YYYY-MM-DD formatında olmalıdır.',
  ],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const lawyer_email = String(row.lawyer_email || '').trim()
    const client_name = String(row.client_name || '').trim()
    const opposing_party = String(row.opposing_party || '').trim()
    const opened_at = String(row.opened_at || '').trim()
    const currency = String(row.currency || 'TRY').trim() || 'TRY'
    const entity_type = String(row.entity_type || 'individual').trim() || 'individual'
    const errors: string[] = []

    if (!lawyer_email) errors.push('lawyer_email zorunludur')
    if (!client_name) errors.push('client_name zorunludur')
    if (!opposing_party) errors.push('opposing_party zorunludur')
    if (!opened_at) errors.push('opened_at zorunludur')

    if (errors.length > 0) {
      return { errors }
    }

    return {
      value: {
        lawyer_email,
        client_name,
        opposing_party,
        client_role_label: normalizeString(row.client_role_label),
        entity_type,
        court_city: normalizeString(row.court_city),
        court_district: normalizeString(row.court_district),
        court_type_label: normalizeString(row.court_type_label),
        court_no: normalizeNumber(row.court_no),
        file_year: normalizeNumber(row.file_year),
        file_no: normalizeString(row.file_no),
        file_type_label: normalizeString(row.file_type_label),
        case_type_label: normalizeString(row.case_type_label),
        status_label: normalizeString(row.status_label),
        opened_at,
        case_value: normalizeNumber(row.case_value) || 0,
        currency,
        description: normalizeString(row.description),
        notes: normalizeString(row.notes),
      },
    }
  },
}
