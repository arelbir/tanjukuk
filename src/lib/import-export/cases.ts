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
    'Avukat E-posta',
    'Müvekkil Adı',
    'Karşı Taraf',
    'Müvekkil Rolü',
    'Varlık Türü',
    'Mahkeme Şehri',
    'Mahkeme İlçesi',
    'Mahkeme Türü',
    'Mahkeme No',
    'Dosya Yılı',
    'Dosya No',
    'Dosya Türü',
    'Dava Türü',
    'Durum',
    'Açılış Tarihi',
    'Dava Değeri',
    'Para Birimi',
    'Açıklama',
    'Notlar',
  ],
  instructions: [
    'Avukat E-posta ve Müvekkil Adı sistemde var olan kayıtlarla eşleşmelidir.',
    'Dava Türü, Durum, Mahkeme Türü, Dosya Türü ve Müvekkil Rolü sistemdeki etiket değerleridir.',
    'Açılış Tarihi zorunludur ve YYYY-MM-DD formatında olmalıdır (örn: 2024-01-15).',
  ],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const lawyer_email = String(row['Avukat E-posta'] || '').trim()
    const client_name = String(row['Müvekkil Adı'] || '').trim()
    const opposing_party = String(row['Karşı Taraf'] || '').trim()
    const opened_at = String(row['Açılış Tarihi'] || '').trim()
    const currency = String(row['Para Birimi'] || 'TRY').trim() || 'TRY'
    const entity_type = String(row['Varlık Türü'] || 'individual').trim() || 'individual'
    const errors: string[] = []

    if (!lawyer_email) errors.push('Avukat E-posta zorunludur')
    if (!client_name) errors.push('Müvekkil Adı zorunludur')
    if (!opposing_party) errors.push('Karşı Taraf zorunludur')
    if (!opened_at) errors.push('Açılış Tarihi zorunludur')

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
