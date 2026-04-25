import { ImportDefinition } from './types'

export interface ActivityImportRow {
  case_code: string
  title: string
  activity_type_label: string | null
  scheduled_at: string
  duration_minutes: number | null
  location: string | null
  description: string | null
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

export const activityImportDefinition: ImportDefinition<ActivityImportRow> = {
  fileName: 'aktivite-sablon.xlsx',
  sheetName: 'Aktiviteler',
  headers: ['Dosya Kodu', 'Başlık', 'Aktivite Türü', 'Planlanan Tarih', 'Süre (Dakika)', 'Yer', 'Açıklama'],
  instructions: ['Dosya Kodu sistemdeki dosya koduyla eşleşmelidir. Aktivite Türü varsa lookup label değeri olmalıdır. Planlanan Tarih YYYY-MM-DD formatında olmalıdır.'],
  toRow: (item) => ({
    'Dosya Kodu': item.case_code,
    'Başlık': item.title,
    'Aktivite Türü': item.activity_type_label,
    'Planlanan Tarih': item.scheduled_at,
    'Süre (Dakika)': item.duration_minutes,
    'Yer': item.location,
    'Açıklama': item.description,
  }),
  fromRow: (row) => {
    const case_code = String(row['Dosya Kodu'] || '').trim()
    const title = String(row['Başlık'] || '').trim()
    const scheduled_at = String(row['Planlanan Tarih'] || '').trim()
    const errors: string[] = []

    if (!case_code) errors.push('Dosya Kodu zorunludur')
    if (!title) errors.push('Başlık zorunludur')
    if (!scheduled_at) errors.push('Planlanan Tarih zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        case_code,
        title,
        activity_type_label: normalizeString(row['Aktivite Türü']),
        scheduled_at,
        duration_minutes: normalizeNumber(row['Süre (Dakika)']),
        location: normalizeString(row['Yer']),
        description: normalizeString(row['Açıklama']),
      },
    }
  },
}
