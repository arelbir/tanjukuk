import { ImportDefinition } from './types'

export interface ActivityImportRow {
  case_id: string
  title: string
  activity_type_id: string | null
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
  headers: ['case_id', 'title', 'activity_type_id', 'scheduled_at', 'duration_minutes', 'location', 'description'],
  instructions: ['case_id, title ve scheduled_at zorunludur.'],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const case_id = String(row.case_id || '').trim()
    const title = String(row.title || '').trim()
    const scheduled_at = String(row.scheduled_at || '').trim()
    const errors: string[] = []

    if (!case_id) errors.push('case_id zorunludur')
    if (!title) errors.push('title zorunludur')
    if (!scheduled_at) errors.push('scheduled_at zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        case_id,
        title,
        activity_type_id: normalizeString(row.activity_type_id),
        scheduled_at,
        duration_minutes: normalizeNumber(row.duration_minutes),
        location: normalizeString(row.location),
        description: normalizeString(row.description),
      },
    }
  },
}
