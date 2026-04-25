import { ImportDefinition } from './types'

export interface CaseImportRow {
  lawyer_id: string
  client_id: string
  opposing_party: string
  client_role_id: string | null
  entity_type: string
  court_city: string | null
  court_district: string | null
  court_type_id: string | null
  court_no: number | null
  file_year: number | null
  file_no: string | null
  file_type_id: string | null
  case_type_id: string | null
  status_id: string | null
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
    'lawyer_id',
    'client_id',
    'opposing_party',
    'client_role_id',
    'entity_type',
    'court_city',
    'court_district',
    'court_type_id',
    'court_no',
    'file_year',
    'file_no',
    'file_type_id',
    'case_type_id',
    'status_id',
    'opened_at',
    'case_value',
    'currency',
    'description',
    'notes',
  ],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const lawyer_id = String(row.lawyer_id || '').trim()
    const client_id = String(row.client_id || '').trim()
    const opposing_party = String(row.opposing_party || '').trim()
    const opened_at = String(row.opened_at || '').trim()
    const currency = String(row.currency || 'TRY').trim() || 'TRY'
    const entity_type = String(row.entity_type || 'individual').trim() || 'individual'
    const errors: string[] = []

    if (!lawyer_id) errors.push('lawyer_id zorunludur')
    if (!client_id) errors.push('client_id zorunludur')
    if (!opposing_party) errors.push('opposing_party zorunludur')
    if (!opened_at) errors.push('opened_at zorunludur')

    if (errors.length > 0) {
      return { errors }
    }

    return {
      value: {
        lawyer_id,
        client_id,
        opposing_party,
        client_role_id: normalizeString(row.client_role_id),
        entity_type,
        court_city: normalizeString(row.court_city),
        court_district: normalizeString(row.court_district),
        court_type_id: normalizeString(row.court_type_id),
        court_no: normalizeNumber(row.court_no),
        file_year: normalizeNumber(row.file_year),
        file_no: normalizeString(row.file_no),
        file_type_id: normalizeString(row.file_type_id),
        case_type_id: normalizeString(row.case_type_id),
        status_id: normalizeString(row.status_id),
        opened_at,
        case_value: normalizeNumber(row.case_value) || 0,
        currency,
        description: normalizeString(row.description),
        notes: normalizeString(row.notes),
      },
    }
  },
}
