import { ImportDefinition } from './types'

export interface HearingImportRow {
  case_code: string
  hearing_at: string
  location: string | null
  result: string | null
  next_step: string | null
}

function normalizeString(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

export const hearingImportDefinition: ImportDefinition<HearingImportRow> = {
  fileName: 'durusma-sablon.xlsx',
  sheetName: 'Duruşmalar',
  headers: ['case_code', 'hearing_at', 'location', 'result', 'next_step'],
  instructions: ['case_code sistemdeki dosya koduyla eşleşmelidir. hearing_at ISO datetime formatında olmalıdır.'],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const case_code = String(row.case_code || '').trim()
    const hearing_at = String(row.hearing_at || '').trim()
    const errors: string[] = []

    if (!case_code) errors.push('case_code zorunludur')
    if (!hearing_at) errors.push('hearing_at zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        case_code,
        hearing_at,
        location: normalizeString(row.location),
        result: normalizeString(row.result),
        next_step: normalizeString(row.next_step),
      },
    }
  },
}
