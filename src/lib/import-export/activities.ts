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
  headers: ['case_code', 'title', 'activity_type_label', 'scheduled_at', 'duration_minutes', 'location', 'description'],
  instructions: ['case_code sistemdeki dosya koduyla eşleşmelidir. activity_type_label varsa lookup label değeri olmalıdır.'],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const case_code = String(row.case_code || '').trim()
    const title = String(row.title || '').trim()
    const scheduled_at = String(row.scheduled_at || '').trim()
    const errors: string[] = []

    if (!case_code) errors.push('case_code zorunludur')
    if (!title) errors.push('title zorunludur')
    if (!scheduled_at) errors.push('scheduled_at zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        case_code,
        title,
        activity_type_label: normalizeString(row.activity_type_label),
        scheduled_at,
        duration_minutes: normalizeNumber(row.duration_minutes),
        location: normalizeString(row.location),
        description: normalizeString(row.description),
      },
    }
  },
}
