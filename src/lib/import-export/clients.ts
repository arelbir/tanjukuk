import { ImportDefinition } from './types'

export interface ClientImportRow {
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_no: string | null
  address: string | null
}

function normalizeString(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

export const clientImportDefinition: ImportDefinition<ClientImportRow> = {
  fileName: 'muvvekkil-sablon.xlsx',
  sheetName: 'Müvekkiller',
  headers: ['Ad', 'Tür', 'Telefon', 'E-posta', 'Vergi No', 'Adres'],
  toRow: (item) => ({
    'Ad': item.name,
    'Tür': item.type,
    'Telefon': item.phone || '',
    'E-posta': item.email || '',
    'Vergi No': item.tax_no || '',
    'Adres': item.address || '',
  }),
  fromRow: (row) => {
    const name = String(row['Ad'] || '').trim()
    const rawType = String(row['Tür'] || '').trim().toLowerCase()
    const errors: string[] = []

    if (!name) {
      errors.push('Ad zorunludur')
    }

    if (rawType !== 'company' && rawType !== 'şirket' && rawType !== 'individual' && rawType !== 'bireysel') {
      errors.push("Tür 'Bireysel' veya 'Şirket' olmalıdır")
    }

    if (errors.length > 0) {
      return { errors }
    }

    const type: 'individual' | 'company' = rawType === 'company' || rawType === 'şirket' ? 'company' : 'individual'

    return {
      value: {
        name,
        type,
        phone: normalizeString(row['Telefon']),
        email: normalizeString(row['E-posta']),
        tax_no: normalizeString(row['Vergi No']),
        address: normalizeString(row['Adres']),
      },
    }
  },
}

export function mapClientForExport(client: {
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_no: string | null
  address?: string | null
}): ClientImportRow {
  return {
    name: client.name,
    type: client.type,
    phone: client.phone,
    email: client.email,
    tax_no: client.tax_no,
    address: client.address || null,
  }
}
