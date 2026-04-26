import { ImportDefinition } from './types'

export interface HearingImportRow {
  case_code: string
  scheduled_at: string
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
  headers: ['Dosya Kodu', 'Duruşma Tarihi', 'Yer', 'Sonuç', 'Sonraki Adım'],
  instructions: ['Dosya Kodu sistemdeki dosya koduyla eşleşmelidir. Duruşma Tarihi YYYY-MM-DD formatında olmalıdır (örn: 2024-01-15).'],
  toRow: (item) => ({
    'Dosya Kodu': item.case_code,
    'Duruşma Tarihi': item.scheduled_at,
    'Yer': item.location,
    'Sonuç': item.result,
    'Sonraki Adım': item.next_step,
  }),
  fromRow: (row) => {
    const case_code = String(row['Dosya Kodu'] || '').trim()
    const scheduled_at = String(row['Duruşma Tarihi'] || '').trim()
    const errors: string[] = []

    if (!case_code) errors.push('Dosya Kodu zorunludur')
    if (!scheduled_at) errors.push('Duruşma Tarihi zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        case_code,
        scheduled_at,
        location: normalizeString(row['Yer']),
        result: normalizeString(row['Sonuç']),
        next_step: normalizeString(row['Sonraki Adım']),
      },
    }
  },
}
